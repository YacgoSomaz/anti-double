import { once } from 'node:events';
import net from 'node:net';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createLatestStateSender, createRaceBroadcastGate, createRealtimeServer, encodeRaceState } from '../src/realtime-server.mjs';

const tinyLevel = {
  tileSize: 48,
  colliders: [],
  spawns: [
    { x: 0, y: 0, gravity: 1, speedX: 120 },
    { x: 0, y: 0, gravity: -1, speedX: 120 },
    { x: 0, y: 0, gravity: 1, speedX: 120 },
    { x: 0, y: 0, gravity: -1, speedX: 120 }
  ]
};

test('broadcasts every authoritative frame by default to avoid cadence jitter', () => {
  const gate = createRaceBroadcastGate();
  const sentTicks = Array.from({ length: 40 }, (_, index) => index + 1)
    .filter((tick) => gate.shouldBroadcast('room-a', tick));

  assert.equal(sentTicks.length, 40);
  assert.equal(Math.max(...sentTicks.slice(1).map((tick, index) => tick - sentTicks[index])), 1);
});

test('coalesces volatile race states while a client socket is congested', () => {
  const sent = [];
  const sender = createLatestStateSender((message) => {
    sent.push(message.tick);
    return false;
  });

  sender.send({ tick: 100 });
  sender.send({ tick: 101 });
  sender.send({ tick: 102 });
  sender.drain();

  assert.deepEqual(sent, [100, 102]);
});

test('discards a queued race state before a reliable match transition', () => {
  const sent = [];
  const sender = createLatestStateSender((message) => {
    sent.push(message.tick);
    return false;
  });

  sender.send({ tick: 100 });
  sender.send({ tick: 101 });
  sender.clear();
  sender.drain();

  assert.deepEqual(sent, [100]);
});

function frame(message) {
  const payload = Buffer.from(JSON.stringify(message));
  const mask = Buffer.from([2, 4, 6, 8]);
  const header = payload.length <= 125
    ? Buffer.from([0x81, 0x80 | payload.length])
    : Buffer.from([0x81, 0x80 | 126, payload.length >> 8, payload.length & 255]);
  return Buffer.concat([header, mask, Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]))]);
}

async function client(port) {
  const socket = net.createConnection({ host: '127.0.0.1', port });
  let buffer = Buffer.alloc(0);
  let upgraded = false;
  const messages = [];
  const waiters = [];
  const publish = (message) => {
    messages.push(message);
    for (const waiter of [...waiters]) if (waiter.predicate(message)) {
      clearTimeout(waiter.timer);
      waiters.splice(waiters.indexOf(waiter), 1);
      waiter.resolve(message);
    }
  };
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    if (!upgraded) {
      const end = buffer.indexOf('\r\n\r\n');
      if (end < 0) return;
      assert.match(buffer.subarray(0, end).toString(), /^HTTP\/1\.1 101/);
      buffer = buffer.subarray(end + 4);
      upgraded = true;
    }
    while (buffer.length >= 2) {
      const size = buffer[1] & 127;
      const header = size === 126 ? 4 : 2;
      const payloadSize = size === 126 ? buffer.readUInt16BE(2) : size;
      if (buffer.length < header + payloadSize) break;
      publish(JSON.parse(buffer.subarray(header, header + payloadSize).toString()));
      buffer = buffer.subarray(header + payloadSize);
    }
  });
  await once(socket, 'connect');
  socket.write(`GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://127.0.0.1:${port}\r\n\r\n`);
  while (!upgraded) await new Promise((resolve) => setTimeout(resolve, 2));
  return {
    send: (message) => socket.write(frame(message)),
    waitFor: (predicate) => {
      const current = messages.find(predicate);
      if (current) return Promise.resolve(current);
      return new Promise((resolve, reject) => waiters.push({ predicate, resolve, timer: setTimeout(() => reject(new Error('timed out')), 1000) }));
    },
    close: () => socket.destroy()
  };
}

async function rejectedUpgrade(port, request) {
  const socket = net.createConnection({ host: '127.0.0.1', port });
  let response = '';
  socket.on('data', (chunk) => { response += chunk; });
  await once(socket, 'connect');
  socket.write(request);
  await once(socket, 'close');
  return response;
}

test('keeps remote players in a host-controlled lobby, then starts one authoritative match', async (context) => {
  const realtime = createRealtimeServer({ level: tinyLevel, autoTick: false });
  realtime.server.listen(0, '127.0.0.1');
  await once(realtime.server, 'listening');
  const { port } = realtime.server.address();
  const one = await client(port);
  const two = await client(port);
  context.after(() => { one.close(); two.close(); realtime.close(); });

  one.send({ type: 'join', room: 'LIVE1', name: '蓝队长' });
  const firstJoin = await one.waitFor((message) => message.type === 'joined');
  assert.equal(firstJoin.player.slot, 1);
  assert.equal(firstJoin.player.name, '蓝队长');
  assert.equal((await one.waitFor((message) => message.type === 'state')).phase, 'lobby');
  two.send({ type: 'join', room: 'LIVE1', name: '绿队员' });
  assert.equal((await two.waitFor((message) => message.type === 'joined')).player.slot, 2);
  const lobby = await two.waitFor((message) => message.type === 'state' && message.players.length === 2);
  assert.equal(lobby.hostSlot, 1);
  assert.deepEqual(lobby.players.map((player) => player.name), ['蓝队长', '绿队员']);
  assert.equal(lobby.players.every((player) => player.ready === false), true);
  one.send({ type: 'ready' });
  two.send({ type: 'ready' });
  assert.equal((await one.waitFor((message) => message.type === 'state' && message.players.length === 2 && message.players.every((player) => player.ready))).phase, 'lobby');
  two.send({ type: 'start' });
  assert.equal((await two.waitFor((message) => message.error === 'not_host')).error, 'not_host');
  one.send({ type: 'start' });
  assert.equal((await one.waitFor((message) => message.type === 'started')).hostSlot, 1);
  two.send({ type: 'flip', sequence: 1 });
  await two.waitFor((message) => message.type === 'input_ok');
  realtime.tick();
  realtime.tick();

  const first = await one.waitFor((message) => message.type === 'state' && message.compact === true && message.p[1][5] === 1);
  const second = await two.waitFor((message) => message.type === 'state' && message.compact === true && message.p[1][5] === 1);
  assert.deepEqual(first, second);
  assert.equal(first.tick, 1);
  assert.equal(first.p[1][5], 1);
  assert.equal(typeof first.c[0], 'number');
  assert.equal(typeof first.c[1], 'number');
  assert.equal(first.c[1] > 0, true);
  assert.equal(Number.isInteger(first.d), true);
});

test('encodes four-player race snapshots into a compact packet suitable for 40 Hz broadcast', () => {
  const players = Array.from({ length: 4 }, (_, index) => ({
    id: `internal-${index}`, slot: index + 1, x: 325.297295119375, y: 111.018875 + index * 40,
    vx: 211.891804775, vy: index % 2 ? -320.755 : 320.755, previousX: 316, previousY: 103,
    speedX: 211.891804775, character: 'blue', name: '玩家名字很长', ready: true, gravity: index % 2 ? -1 : 1,
    finished: false, eliminated: false, blockedX: false, recoveringCameraPosition: false, flipWallGuard: 0,
    hitbox: { width: 37, height: 48, offsetX: 16, offsetY: 19 }
  }));
  const packet = encodeRaceState({ tick: 40, cameraX: 5.297295119375, cameraSpeed: 211.891804775, players });

  assert.deepEqual(packet, {
    type: 'state', compact: true, tick: 40, c: [530, 21189],
    p: [[1, 32530, 11102, 21189, 32076, 1, 0, 0, 0], [2, 32530, 15102, 21189, -32075, -1, 0, 0, 0], [3, 32530, 19102, 21189, 32076, 1, 0, 0, 0], [4, 32530, 23102, 21189, -32075, -1, 0, 0, 0]]
  });
  assert.equal(Buffer.byteLength(JSON.stringify(packet)) < 250, true);
});

test('encodes active item effects in the compact race packet', () => {
  const packet = encodeRaceState({
    tick: 8,
    cameraX: 10,
    cameraSpeed: 120,
    items: [{ id: 'phase-1', type: 'phase', x: 320, y: 190, active: true }],
    players: [{ slot: 1, x: 100, y: 100, vx: 150, vy: 0, gravity: 1, finished: false, eliminated: false, blockedX: false, phaseTicks: 119, speedBoostTicks: 0 }]
  });

  assert.deepEqual(packet.o, [[2, 32000, 19000]]);
  assert.deepEqual(packet.p[0], [1, 10000, 10000, 15000, 0, 1, 0, 119, 0]);
});

test('keeps only nearby active pickups in compact race packets', () => {
  const packet = encodeRaceState({
    tick: 2,
    cameraX: 1000,
    cameraSpeed: 240,
    items: [
      { type: 'phase', x: 2200, y: 190, active: true },
      { type: 'speed_boost', x: 9000, y: 280, active: true },
      { type: 'gravity_burst', x: 1200, y: 370, active: false }
    ],
    players: []
  });

  assert.deepEqual(packet.o, [[2, 220000, 19000]]);
});

test('adds only a compact server tick timing sample to a race packet', () => {
  const packet = encodeRaceState({ tick: 2, cameraX: 0, cameraSpeed: 120, players: [] }, 27.4);

  assert.equal(packet.d, 274);
});

test('carries the opening-morph clock in compact packets until physics is released', () => {
  const packet = encodeRaceState({ tick: 2, cameraX: 0, cameraSpeed: 0, introTicksRemaining: 43, players: [] });

  assert.equal(packet.i, 43);
});

test('adds authoritative final placements only when a race has results', () => {
  const packet = encodeRaceState({
    tick: 120, cameraX: 30, cameraSpeed: 140, players: [],
    results: [{ slot: 2, rank: 1, outcome: 'finished', score: 486 }, { slot: 1, rank: 2, outcome: 'eliminated', score: 120 }]
  });

  assert.deepEqual(packet.r, [[2, 1, 1, 486], [1, 2, 0, 120]]);
});

test('retains a short-lived aggregate of client jitter reports without player identity', async (context) => {
  const realtime = createRealtimeServer({ level: tinyLevel, autoTick: false });
  realtime.server.listen(0, '127.0.0.1');
  await once(realtime.server, 'listening');
  const { port } = realtime.server.address();
  const one = await client(port);
  context.after(() => { one.close(); realtime.close(); });

  one.send({ type: 'diagnostics', diagnostics: { packetP95Ms: 82, packetMaxMs: 141, skippedTicks: 2, serverP95Ms: 26, frameFps: 48, droppedFrames: 3 } });
  await one.waitFor((message) => message.type === 'diagnostics_ok');

  assert.deepEqual(realtime.diagnostics(), {
    reports: 1, packetP95Ms: 82, packetMaxMs: 141, skippedTicks: 2,
    serverP95Ms: 26, minimumFrameFps: 48, droppedFrames: 3
  });
});

test('validates WebSocket messages without exposing internal errors', async (context) => {
  const realtime = createRealtimeServer({ level: tinyLevel, autoTick: false });
  realtime.server.listen(0, '127.0.0.1');
  await once(realtime.server, 'listening');
  const { port } = realtime.server.address();
  const one = await client(port);
  context.after(() => { one.close(); realtime.close(); });

  one.send({ type: 'ping' });
  assert.equal((await one.waitFor((message) => message.type === 'pong')).type, 'pong');
  one.send({ type: 'flip', sequence: 1 });
  assert.equal((await one.waitFor((message) => message.error === 'not_in_match')).error, 'not_in_match');
  one.send({ type: 'unknown' });
  assert.equal((await one.waitFor((message) => message.error === 'invalid_message')).error, 'invalid_message');
});

test('rejects invalid or cross-origin WebSocket upgrades', async (context) => {
  const realtime = createRealtimeServer({ level: tinyLevel, autoTick: false });
  realtime.server.listen(0, '127.0.0.1');
  await once(realtime.server, 'listening');
  const { port } = realtime.server.address();
  context.after(() => realtime.close());
  const common = `Host: 127.0.0.1:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n`;

  assert.match(await rejectedUpgrade(port, `GET /not-ws HTTP/1.1\r\n${common}\r\n`), /^HTTP\/1\.1 403/);
  assert.match(await rejectedUpgrade(port, `GET /ws HTTP/1.1\r\n${common}Origin: https://evil.example\r\n\r\n`), /^HTTP\/1\.1 403/);
});
