import { once } from 'node:events';
import net from 'node:net';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRealtimeServer } from '../src/realtime-server.mjs';

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

function frame(message) {
  const payload = Buffer.from(JSON.stringify(message));
  const mask = Buffer.from([2, 4, 6, 8]);
  return Buffer.concat([Buffer.from([0x81, 0x80 | payload.length]), mask, Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]))]);
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

  const first = await one.waitFor((message) => message.type === 'state' && message.phase === 'playing' && message.players[1].gravity === 1);
  const second = await two.waitFor((message) => message.type === 'state' && message.phase === 'playing' && message.players[1].gravity === 1);
  assert.deepEqual(first, second);
  assert.equal(first.players[1].gravity, 1);
  assert.equal(typeof first.cameraX, 'number');
  assert.equal(typeof first.cameraSpeed, 'number');
  assert.equal(first.cameraSpeed > 0, true);
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
