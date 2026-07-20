import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../src/game-room.mjs';
import { loadLevel } from '../src/level-loader.mjs';

const tinyLevel = {
  tileSize: 48,
  colliders: [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }],
  spawns: [
    { x: 24, y: 96, gravity: 1, speedX: 120 },
    { x: 24, y: 48, gravity: -1, speedX: 120 },
    { x: 72, y: 96, gravity: 1, speedX: 120 },
    { x: 72, y: 48, gravity: -1, speedX: 120 }
  ]
};

test('assigns four players deterministic color slots and rejects a fifth', () => {
  const room = new GameRoom(tinyLevel);
  assert.equal(room.join('a').player.slot, 1);
  assert.equal(room.join('b').player.slot, 2);
  assert.equal(room.join('c').player.slot, 3);
  assert.equal(room.join('d').player.slot, 4);
  assert.deepEqual(room.join('e'), { ok: false, error: 'room_full' });
});

test('applies one gravity flip per input sequence and exposes an authoritative snapshot', () => {
  const room = new GameRoom(tinyLevel);
  room.join('a');

  assert.equal(room.input('a', { type: 'flip', sequence: 1 }).ok, true);
  assert.equal(room.input('a', { type: 'flip', sequence: 1 }).ok, false);
  room.tick(1 / 30);

  const player = room.snapshot().players[0];
  assert.equal(player.gravity, -1);
  assert.equal(player.slot, 1);
  assert.equal(player.x > 24, true);
});

test('uses the inverted multiplayer collision offset so a flipped runner cannot pass through a ceiling', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 0, y: 0 }],
    spawns: [{ x: 0, y: 39, gravity: -1, speedX: 0 }]
  });
  room.join('a');

  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.y, 39);
  assert.equal(player.vy, 0);
  assert.equal(player.hitbox.offsetY, 9);
});

test('lands a falling player on collision tiles rather than passing through them', () => {
  const room = new GameRoom({ ...tinyLevel, spawns: [{ x: 24, y: 0, gravity: 1, speedX: 120 }] });
  room.join('a');

  for (let step = 0; step < 30; step += 1) room.tick(1 / 60);

  const player = room.snapshot().players[0];
  assert.equal(player.y, 77);
  assert.equal(player.vy, 0);
});

test('uses the recovered 40 FPS clock, player hitbox and capped vertical physics', () => {
  const level = {
    tileSize: 48,
    colliders: [],
    spawns: [{ x: 24, y: 48, gravity: 1, speedX: 120 }]
  };
  const room = new GameRoom(level);
  room.join('a');
  room.tick(1);

  const player = room.snapshot().players[0];
  assert.equal(Number(player.x.toFixed(6)), 27.004838);
  assert.equal(player.vy, 320.755);
  assert.deepEqual(player.hitbox, { width: 37, height: 48, offsetX: 16, offsetY: 19 });
});

test('keeps a reconnecting player in its original slot and rejects malformed input', () => {
  const room = new GameRoom(tinyLevel);
  const first = room.join('a');
  assert.equal(room.join('a').player.slot, first.player.slot);
  assert.deepEqual(room.input('a', { type: 'flip' }), { ok: false, error: 'invalid_input' });
  assert.equal(room.tick(-1).tick, 1);
});

test('uses the original 34 px world transform for multiplayer collision blocks', () => {
  const level = {
    tileSize: 48,
    world: { cellSize: 34, originY: 425 },
    colliders: [{ x: 0, y: 0 }],
    spawns: [{ x: 0, y: 325, gravity: 1, speedX: 0 }]
  };
  const room = new GameRoom(level);
  room.join('a');
  for (let step = 0; step < 20; step += 1) room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.y, 358);
  assert.equal(player.vy, 0);
});

test('marks a player eliminated when their sprite leaves the multiplayer stage', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [{ x: 100, y: 500, gravity: 1, speedX: 0 }]
  });
  room.join('a');
  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.eliminated, true);
  assert.equal(room.input('a', { type: 'flip', sequence: 1 }).error, 'eliminated');
});

test('does not park a forward-only runner at the side of a map block', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 2, y: 0 }],
    spawns: [{ x: 0, y: 0, gravity: 0, speedX: 2400 }]
  });
  room.join('a');
  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.x > 43, true);
  assert.equal(player.vx > 0, true);
});

test('keeps advancing through the MP02 start instead of colliding with an invisible side wall', () => {
  const room = new GameRoom(loadLevel('mp02'));
  room.join('a');

  for (let frame = 0; frame < 20; frame += 1) room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.x > 400, true);
  assert.equal(player.vx > 0, true);
});

test('falls through a one-cell floor gap instead of landing on its two one-pixel edges', () => {
  const room = new GameRoom({
    tileSize: 34,
    colliders: [{ x: 0, y: 4 }, { x: 2, y: 4 }],
    spawns: [{ x: 16.5, y: 65, gravity: 1, speedX: 0 }]
  });
  room.join('a');

  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.y > 70, true);
  assert.equal(player.vy > 0, true);
});

test('accelerates every original 40 FPS physics frame instead of keeping the spawn speed forever', () => {
  const room = new GameRoom({
    tileSize: 34,
    colliders: [],
    spawns: [{ x: 0, y: 100, gravity: 0, speedX: 200 }]
  });
  room.join('a');

  for (let frame = 0; frame < 40; frame += 1) room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(Number(player.speedX.toFixed(6)), 207.740191);
  assert.equal(Number(player.vx.toFixed(6)), 207.740191);
});

test('caps acceleration at the recovered speed threshold', () => {
  const room = new GameRoom({
    tileSize: 34,
    colliders: [],
    spawns: [{ x: 0, y: 100, gravity: 0, speedX: 769.812 }]
  });
  room.join('a');

  room.tick(1 / 40);

  assert.equal(room.snapshot().players[0].speedX, 769.812);
});

test('separates two runners that overlap instead of allowing them to pass through each other', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [
      { x: 100, y: 100, gravity: 0, speedX: 0 },
      { x: 100, y: 100, gravity: 0, speedX: 0 }
    ]
  });
  room.join('a');
  room.join('b');

  room.tick(1 / 40);

  const [first, second] = room.snapshot().players;
  assert.equal(first.y < second.y, true);
  assert.equal(first.vy, 0);
  assert.equal(second.vy, 0);
});
