"""Minimal, read-only AVM2 disassembler for the recovered G-Switch SWF.

This deliberately handles the instruction forms used by the target methods and
prints any unknown opcode instead of attempting to execute or modify the SWF.
"""
from __future__ import annotations

import argparse
import struct
import zlib
from dataclasses import dataclass
from pathlib import Path


class Reader:
    def __init__(self, data: bytes):
        self.data, self.pos = data, 0

    def byte(self) -> int:
        value = self.data[self.pos]
        self.pos += 1
        return value

    def bytes(self, count: int) -> bytes:
        value = self.data[self.pos:self.pos + count]
        self.pos += count
        return value

    def u30(self) -> int:
        result = 0
        for shift in range(0, 35, 7):
            value = self.byte()
            result |= (value & 0x7F) << shift
            if not value & 0x80:
                return result
        raise ValueError("invalid U30")

    def s24(self) -> int:
        value = int.from_bytes(self.bytes(3), "little", signed=False)
        return value - (1 << 24) if value & (1 << 23) else value

    def cstring(self) -> str:
        end = self.data.index(0, self.pos)
        value = self.data[self.pos:end].decode("utf-8", "replace")
        self.pos = end + 1
        return value


def pool(reader: Reader, item):
    count = reader.u30()
    if count == 0:
        return [0]
    values = [0]
    values.extend(item() for _ in range(1, count))
    return values


def parse_traits(reader: Reader):
    traits = []
    for _ in range(reader.u30()):
        name = reader.u30()
        tag = reader.byte()
        kind = tag & 0x0F
        if kind in (0, 6):
            reader.u30(); reader.u30(); vindex = reader.u30()
            if vindex:
                reader.byte()
            value = None
        elif kind in (1, 2, 3):
            reader.u30(); value = reader.u30()
        elif kind in (4, 5):
            reader.u30(); value = reader.u30()
        else:
            raise ValueError(f"unknown trait kind {kind}")
        if tag & 0x40:
            for _ in range(reader.u30()):
                reader.u30()
        traits.append((name, kind, value))
    return traits


def parse_abc(data: bytes):
    reader = Reader(data)
    reader.bytes(4)  # minor/major version
    ints = pool(reader, reader.u30)
    uints = pool(reader, reader.u30)
    doubles = pool(reader, lambda: struct.unpack("<d", reader.bytes(8))[0])
    strings = pool(reader, lambda: reader.bytes(reader.u30()).decode("utf-8", "replace"))
    namespaces = pool(reader, lambda: (reader.byte(), reader.u30()))
    nssets = pool(reader, lambda: [reader.u30() for _ in range(reader.u30())])

    multinames = [None]
    for _ in range(1, reader.u30()):
        kind = reader.byte()
        if kind in (0x07, 0x0D):
            multinames.append((kind, reader.u30(), reader.u30()))
        elif kind in (0x0F, 0x10):
            multinames.append((kind, reader.u30()))
        elif kind in (0x11, 0x12):
            multinames.append((kind,))
        elif kind in (0x09, 0x0E):
            multinames.append((kind, reader.u30(), reader.u30()))
        elif kind in (0x1B, 0x1C):
            multinames.append((kind, reader.u30()))
        else:
            raise ValueError(f"unknown multiname kind {kind:#x}")

    methods = []
    for _ in range(reader.u30()):
        params = reader.u30(); return_type = reader.u30()
        parameter_types = [reader.u30() for _ in range(params)]
        name = reader.u30(); flags = reader.byte()
        if flags & 0x08:
            for _ in range(reader.u30()):
                reader.u30(); reader.byte()
        if flags & 0x80:
            [reader.u30() for _ in range(params)]
        methods.append((name, return_type, parameter_types))

    for _ in range(reader.u30()):
        reader.u30(); [reader.u30() for _ in range(reader.u30())]

    instances = []
    for _ in range(reader.u30()):
        name = reader.u30(); super_name = reader.u30(); flags = reader.byte()
        if flags & 0x08:
            reader.u30()
        [reader.u30() for _ in range(reader.u30())]
        init = reader.u30(); traits = parse_traits(reader)
        instances.append((name, super_name, init, traits))
    for _ in instances:
        reader.u30(); parse_traits(reader)
    for _ in range(reader.u30()):
        reader.u30(); parse_traits(reader)

    bodies = {}
    for _ in range(reader.u30()):
        method = reader.u30(); max_stack = reader.u30(); local_count = reader.u30()
        init_scope = reader.u30(); max_scope = reader.u30(); code = reader.bytes(reader.u30())
        for _ in range(reader.u30()):
            [reader.u30() for _ in range(5)]
        parse_traits(reader)
        bodies[method] = (code, max_stack, local_count, init_scope, max_scope)

    def mn_name(index: int) -> str:
        if not index or index >= len(multinames):
            return f"mn#{index}"
        item = multinames[index]
        if item[0] in (0x07, 0x0D, 0x09, 0x0E):
            return strings[item[2]] if item[2] < len(strings) else f"mn#{index}"
        if item[0] in (0x0F, 0x10):
            return strings[item[1]] if item[1] < len(strings) else f"mn#{index}"
        return f"mn#{index}"

    def mn_full_name(index: int) -> str:
        if not index or index >= len(multinames):
            return mn_name(index)
        item = multinames[index]
        if item[0] not in (0x07, 0x0D):
            return mn_name(index)
        ns_index, local_index = item[1], item[2]
        namespace = namespaces[ns_index][1] if ns_index < len(namespaces) else 0
        package = strings[namespace] if namespace < len(strings) else ""
        local = strings[local_index] if local_index < len(strings) else f"mn#{index}"
        return f"{package}.{local}" if package else local

    return {"strings": strings, "ints": ints, "uints": uints, "doubles": doubles,
            "methods": methods, "instances": instances, "bodies": bodies, "mn_name": mn_name,
            "mn_full_name": mn_full_name}


NAMES = {
    0x01:"bkpt", 0x02:"nop", 0x03:"throw", 0x04:"getsuper", 0x05:"setsuper", 0x06:"dxns",
    0x07:"dxnslate", 0x08:"kill", 0x09:"label", 0x0c:"ifnlt", 0x0d:"ifnle", 0x0e:"ifngt",
    0x0f:"ifnge", 0x10:"jump", 0x11:"iftrue", 0x12:"iffalse", 0x13:"ifeq", 0x14:"ifne",
    0x15:"iflt", 0x16:"ifle", 0x17:"ifgt", 0x18:"ifge", 0x19:"ifstricteq", 0x1a:"ifstrictne",
    0x1b:"lookupswitch", 0x1c:"pushwith", 0x1d:"popscope", 0x1e:"nextname", 0x1f:"hasnext",
    0x20:"pushnull", 0x21:"pushundefined", 0x23:"nextvalue", 0x24:"pushbyte", 0x25:"pushshort",
    0x26:"pushtrue", 0x27:"pushfalse", 0x28:"pushnan", 0x29:"pop", 0x2a:"dup", 0x2b:"swap",
    0x2c:"pushstring", 0x2d:"pushint", 0x2e:"pushuint", 0x2f:"pushdouble", 0x30:"pushscope",
    0x31:"pushnamespace", 0x32:"hasnext2", 0x40:"newfunction", 0x41:"call", 0x42:"construct",
    0x43:"callmethod", 0x44:"callstatic", 0x45:"callsuper", 0x46:"callproperty", 0x47:"returnvoid",
    0x48:"returnvalue", 0x49:"constructsuper", 0x4a:"constructprop", 0x4b:"callsuperid",
    0x4c:"callproplex", 0x4d:"callinterface", 0x4e:"callsupervoid", 0x4f:"callpropvoid",
    0x50:"sxi1", 0x51:"sxi8", 0x52:"sxi16", 0x53:"applytype", 0x55:"newobject", 0x56:"newarray",
    0x57:"newactivation", 0x58:"newclass", 0x59:"getdescendants", 0x5a:"newcatch",
    0x5d:"findpropstrict", 0x5e:"findproperty", 0x5f:"finddef", 0x60:"getlex", 0x61:"setproperty",
    0x62:"getlocal", 0x63:"setlocal", 0x64:"getglobalscope", 0x65:"getscopeobject", 0x66:"getproperty",
    0x67:"getouterscope", 0x68:"initproperty", 0x6a:"deleteproperty", 0x6c:"getslot", 0x6d:"setslot",
    0x6e:"getglobalslot", 0x6f:"setglobalslot", 0x70:"convert_s", 0x71:"esc_xelem", 0x72:"esc_xattr",
    0x73:"convert_i", 0x74:"convert_u", 0x75:"convert_d", 0x76:"convert_b", 0x77:"convert_o",
    0x78:"checkfilter", 0x80:"coerce", 0x81:"coerce_b", 0x82:"coerce_a", 0x83:"coerce_i", 0x84:"coerce_d",
    0x85:"coerce_s", 0x86:"astype", 0x87:"astypelate", 0x88:"coerce_u", 0x89:"coerce_o",
    0x90:"negate", 0x91:"increment", 0x92:"inclocal", 0x93:"decrement", 0x94:"declocal", 0x95:"typeof",
    0x96:"not", 0x97:"bitnot", 0xa0:"add", 0xa1:"subtract", 0xa2:"multiply", 0xa3:"divide",
    0xa4:"modulo", 0xa5:"lshift", 0xa6:"rshift", 0xa7:"urshift", 0xa8:"bitand", 0xa9:"bitor", 0xaa:"bitxor",
    0xab:"equals", 0xac:"strictequals", 0xad:"lessthan", 0xae:"lessequals", 0xaf:"greaterthan", 0xb0:"greaterequals",
    0xb1:"instanceof", 0xb2:"istype", 0xb3:"istypelate", 0xb4:"in", 0xc0:"increment_i", 0xc1:"decrement_i",
    0xc2:"inclocal_i", 0xc3:"declocal_i", 0xc4:"negate_i", 0xc5:"add_i", 0xc6:"subtract_i", 0xc7:"multiply_i",
    0xd0:"getlocal0", 0xd1:"getlocal1", 0xd2:"getlocal2", 0xd3:"getlocal3", 0xd4:"setlocal0", 0xd5:"setlocal1",
    0xd6:"setlocal2", 0xd7:"setlocal3", 0xef:"debug", 0xf0:"debugline", 0xf1:"debugfile", 0xf2:"bkptline",
}
ONE_U30 = {0x04,0x05,0x06,0x08,0x25,0x2c,0x2d,0x2e,0x2f,0x31,0x40,0x41,0x42,0x49,0x53,0x55,0x56,0x58,0x59,0x5a,0x5d,0x5e,0x5f,0x60,0x61,0x62,0x63,0x66,0x68,0x6a,0x6c,0x6d,0x6e,0x6f,0x80,0x86,0x92,0x94,0xb2,0xc2,0xc3,0xf0,0xf1,0xf2}
TWO_U30 = {0x32,0x43,0x44,0x45,0x46,0x4a,0x4b,0x4c,0x4d,0x4e,0x4f}
BRANCH = set(range(0x0c, 0x1b))


def disassemble(code: bytes, abc) -> list[str]:
    reader = Reader(code); lines = []
    while reader.pos < len(code):
        at = reader.pos; opcode = reader.byte(); name = NAMES.get(opcode, f"unknown_{opcode:02x}")
        args = []
        if opcode in BRANCH:
            args = [f"->{reader.pos + 3 + reader.s24():04x}"]
        elif opcode == 0x1b:
            default = reader.s24(); cases = reader.u30(); offsets = [reader.s24() for _ in range(cases + 1)]
            args = [f"default {default:+}", f"cases={cases}", ",".join(map(str, offsets))]
        elif opcode == 0x24:
            value = reader.byte(); args = [str(value - 256 if value > 127 else value)]
        elif opcode in (0x65, 0x67):
            args = [str(reader.byte())]
        elif opcode in TWO_U30:
            first, second = reader.u30(), reader.u30()
            if opcode in {0x45,0x46,0x4a,0x4c,0x4d,0x4e,0x4f}:
                args = [abc["mn_name"](first), str(second)]
            else:
                args = [str(first), str(second)]
        elif opcode in ONE_U30:
            value = reader.u30()
            if opcode in {0x04,0x05,0x5d,0x5e,0x5f,0x60,0x61,0x66,0x68,0x6a,0x80,0x86,0xb2}:
                args = [abc["mn_name"](value)]
            elif opcode == 0x2c:
                args = [repr(abc["strings"][value])]
            elif opcode == 0x2d:
                args = [str(abc["ints"][value])]
            elif opcode == 0x2e:
                args = [str(abc["uints"][value])]
            elif opcode == 0x2f:
                args = [repr(abc["doubles"][value])]
            else:
                args = [str(value)]
        elif opcode == 0xef:
            args = [str(reader.byte()), str(reader.u30()), str(reader.byte()), str(reader.u30())]
        lines.append(f"{at:04x}  {name:<16} {' '.join(args)}")
    return lines


def game_abc_from_swf(path: Path) -> bytes:
    source = path.read_bytes()
    if source[:3] == b"CWS":
        source = b"FWS" + source[3:8] + zlib.decompress(source[8:])
    reader = Reader(source); reader.pos = 8
    rect_start = reader.pos
    nbits = reader.byte() >> 3
    rect_bits = 5 + nbits * 4
    reader.pos = rect_start + (rect_bits + 7) // 8
    reader.bytes(4)  # framerate/frame count
    abc_tags = []
    while reader.pos < len(source):
        header = int.from_bytes(reader.bytes(2), "little")
        kind, length = header >> 6, header & 0x3f
        if length == 0x3f:
            length = int.from_bytes(reader.bytes(4), "little")
        body = reader.bytes(length)
        if kind == 82:
            body_reader = Reader(body); body_reader.bytes(4); body_reader.cstring(); abc_tags.append(body_reader.bytes(len(body) - body_reader.pos))
        if kind == 0:
            break
    if len(abc_tags) < 2:
        raise ValueError(f"expected game DoABC tag, found {len(abc_tags)}")
    return abc_tags[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("swf", type=Path)
    parser.add_argument("--class-name", default="com.miniclip.GSwitch.Player")
    args = parser.parse_args()
    abc = parse_abc(game_abc_from_swf(args.swf))
    for name_index, _, init, traits in abc["instances"]:
        if abc["mn_full_name"](name_index) != args.class_name:
            continue
        print(f"class {args.class_name}; initializer method #{init}")
        if init in abc["bodies"]:
            code, max_stack, locals_, _, _ = abc["bodies"][init]
            print(f"\n=== constructor (method #{init}; {len(code)} bytes; stack={max_stack}; locals={locals_}) ===")
            print("\n".join(disassemble(code, abc)))
        for trait_name, kind, method_index in traits:
            if kind not in (1,2,3) or method_index not in abc["bodies"]:
                continue
            method_name = abc["mn_name"](trait_name)
            code, max_stack, locals_, _, _ = abc["bodies"][method_index]
            print(f"\n=== {method_name} (method #{method_index}; {len(code)} bytes; stack={max_stack}; locals={locals_}) ===")
            print("\n".join(disassemble(code, abc)))
        return
    raise SystemExit(f"class not found: {args.class_name}")


if __name__ == "__main__":
    main()
