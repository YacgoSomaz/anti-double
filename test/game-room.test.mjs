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

function startRoom(room, ...ids) {
  for (const id of ids) room.join(id);
  assert.equal(room.start(ids[0]).ok, true);
  return room;
}

test('keeps a lobby until its first player starts, with four fixed character roles', () => {
  const room = new GameRoom(tinyLevel);
  assert.equal(room.join('a', '蓝队长').player.slot, 1);
  assert.equal(room.join('b', '  绿 队员  ').player.slot, 2);
  assert.equal(room.join('c').player.slot, 3);
  assert.equal(room.join('d').player.slot, 4);
  assert.deepEqual(room.join('e'), { ok: false, error: 'room_full' });
  assert.deepEqual(room.snapshot().players.map((player) => player.character), ['blue', 'green', 'yellow', 'red']);
  assert.deepEqual(room.snapshot().players.slice(0, 2).map((player) => player.name), ['蓝队长', '绿 队员']);
  assert.equal(room.snapshot().phase, 'lobby');
  assert.equal(room.snapshot().hostSlot, 1);
  assert.equal(room.input('a', { type: 'flip', sequence: 1 }).error, 'waiting_for_host');
  assert.equal(room.start('b').error, 'not_host');
  room.leave('a');
  assert.equal(room.snapshot().hostSlot, 2);
  assert.equal(room.start('b').ok, true);
  assert.equal(room.snapshot().phase, 'playing');
});

test('does not let a host start until every network player reports ready', () => {
  const room = new GameRoom(tinyLevel);
  room.join('a', '蓝队长', false);
  room.join('b', '绿队员', false);
  assert.equal(room.start('a').error, 'players_loading');
  assert.equal(room.setReady('a').ok, true);
  assert.equal(room.start('a').error, 'players_loading');
  assert.equal(room.setReady('b').ok, true);
  assert.equal(room.start('a').ok, true);
});

test('applies one gravity flip per input sequence and exposes an authoritative snapshot', () => {
  const room = new GameRoom(tinyLevel);
  room.join('a');
  room.start('a');

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
  room.start('a');

  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.y, 39);
  assert.equal(player.vy, 0);
  assert.equal(player.hitbox.offsetY, 9);
});

test('moves a runner out of a ceiling when a gravity flip changes its hitbox offset', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 0, y: 0 }],
    spawns: [{ x: 0, y: 29, gravity: 1, speedX: 0 }]
  });
  room.join('a');
  room.start('a');

  assert.equal(room.input('a', { type: 'flip', sequence: 1 }).ok, true);
  const player = room.snapshot().players[0];

  assert.equal(player.y, 39);
  assert.equal(player.vy, 0);
});

test('does not teleport a runner vertically when a side wall already overlaps at a gravity switch', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 1, y: 0 }],
    spawns: [{ x: 20, y: 20, gravity: 1, speedX: 0 }]
  });
  room.join('a');
  room.start('a');

  room.input('a', { type: 'flip', sequence: 1 });

  assert.equal(room.snapshot().players[0].y, 20);
});

test('blocks an inverted runner at a wall corner during a gravity switch', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 2, y: 0 }],
    spawns: [{ x: 35, y: 29, gravity: 1, speedX: 400 }]
  });
  room.join('a');
  room.start('a');

  room.input('a', { type: 'flip', sequence: 1 });
  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.x, 43);
  assert.equal(player.blockedX, true);
});

test('lands a falling player on collision tiles rather than passing through them', () => {
  const room = new GameRoom({ ...tinyLevel, spawns: [{ x: 24, y: 0, gravity: 1, speedX: 120 }] });
  room.join('a');
  room.start('a');

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
  room.start('a');
  room.tick(1);

  const player = room.snapshot().players[0];
  assert.equal(player.x > 27.004838, true);
  assert.equal(player.vy, 320.755);
  assert.deepEqual(player.hitbox, { width: 37, height: 48, offsetX: 16, offsetY: 19 });
});

test('keeps a reconnecting player in its original slot and rejects malformed input', () => {
  const room = new GameRoom(tinyLevel);
  const first = room.join('a');
  assert.equal(room.join('a').player.slot, first.player.slot);
  assert.deepEqual(room.input('a', { type: 'flip' }), { ok: false, error: 'invalid_input' });
  room.start('a');
  assert.equal(room.tick(-1).tick, 1);
});

test('uses the original 34 px world transform for multiplayer collision blocks', () => {
  const level = {
    tileSize: 48,
    world: { cellSize: 34, originY: 425 },
    colliders: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    spawns: [{ x: 0, y: 325, gravity: 1, speedX: 0 }]
  };
  const room = new GameRoom(level);
  room.join('a');
  room.start('a');
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
  room.start('a');
  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.eliminated, true);
  assert.equal(room.input('a', { type: 'flip', sequence: 1 }).error, 'eliminated');
});

test('pins a runner against a side block without taking away its momentum', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 2, y: 0 }],
    spawns: [{ x: 35, y: 0, gravity: 0, speedX: 400 }]
  });
  room.join('a');
  room.start('a');
  room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(player.x, 43);
  assert.equal(player.vx > 400, true);
  assert.equal(player.speedX > 400, true);
  assert.equal(player.blockedX, true);
});

test('lets a runner catch the shared multiplayer camera after clearing a side block', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 3, y: 0 }],
    spawns: [{ x: 80, y: -10, gravity: 1, speedX: 769.812 }]
  });
  room.join('a');
  room.start('a');

  for (let frame = 0; frame < 4; frame += 1) room.tick(1 / 40);

  const snapshot = room.snapshot();
  const player = snapshot.players[0];
  assert.equal(player.blockedX, false);
  assert.equal(player.recoveringCameraPosition, true);
  assert.equal(player.vx > player.speedX, true);
  assert.equal(snapshot.cameraSpeed, 769.812);
});

test('smoothly pulls a lagging runner toward the shared camera even without a side collision', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [{ x: 0, y: 100, gravity: 0, speedX: 769.812 }]
  });
  room.join('a');
  room.start('a');

  room.tick(1 / 40);
  const first = room.snapshot().players[0];
  room.tick(1 / 40);
  const second = room.snapshot().players[0];

  assert.equal(first.blockedX, false);
  assert.equal(first.recoveringCameraPosition, true);
  assert.equal(first.vx > first.speedX, true);
  assert.equal(second.vx > second.speedX, true);
  assert.equal(second.vx < first.vx, true);
});

test('eliminates a runner that a side block leaves behind the scrolling camera', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [{ x: 2, y: 0 }],
    spawns: [{ x: 35, y: 0, gravity: 0, speedX: 400 }]
  });
  room.join('a');
  room.start('a');

  for (let frame = 0; frame < 8; frame += 1) room.tick(1 / 40);

  const snapshot = room.snapshot();
  assert.equal(snapshot.cameraX > 75, true);
  assert.equal(snapshot.players[0].eliminated, true);
});

test('keeps advancing through the MP02 start instead of colliding with an invisible side wall', () => {
  const room = new GameRoom(loadLevel('mp02'));
  room.join('a');
  room.start('a');

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
  room.start('a');

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
  room.start('a');

  for (let frame = 0; frame < 40; frame += 1) room.tick(1 / 40);

  const player = room.snapshot().players[0];
  assert.equal(Number(player.speedX.toFixed(6)), 207.740191);
  assert.equal(player.vx > player.speedX, true);
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

test('stacks a player on another player rather than turning a shallow vertical contact into a side push', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [
      { x: 100, y: 100, gravity: 0, speedX: 0 },
      { x: 100, y: 144, gravity: 0, speedX: 0 }
    ]
  });
  startRoom(room, 'a', 'b');

  room.tick(1 / 40);

  const [first, second] = room.snapshot().players;
  assert.equal(first.x, second.x);
  assert.equal(Number((second.y - first.y).toFixed(6)), 48);
  assert.equal(first.y, 96);
  assert.equal(second.y, 144);
});

test('carries stacked players toward the same side when their gravity matches', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [
      { x: 100, y: 100, gravity: 1, speedX: 0 },
      { x: 100, y: 144, gravity: 1, speedX: 0 }
    ]
  });
  startRoom(room, 'a', 'b');

  room.tick(1 / 40);
  room.tick(1 / 40);

  const [upper, lower] = room.snapshot().players;
  assert.equal(Number((lower.y - upper.y).toFixed(6)), 48);
  assert.equal(upper.vy > 0, true);
  assert.equal(upper.vy, lower.vy);
});

test('keeps same-line inverted runners in one stable horizontal order without losing forward momentum', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [
      { x: 100, y: 100, gravity: -1, speedX: 240 },
      { x: 100, y: 100, gravity: -1, speedX: 240 }
    ]
  });
  startRoom(room, 'a', 'b');

  for (let frame = 0; frame < 10; frame += 1) room.tick(1 / 40);

  const [first, second] = room.snapshot().players;
  assert.equal(first.x > second.x, true);
  assert.equal(first.x - second.x >= 37, true);
  assert.equal(first.gravity, -1);
  assert.equal(second.gravity, -1);
  assert.equal(first.x > 100, true);
  assert.equal(second.x > 100, true);
  assert.equal(first.vx > 240, true);
  assert.equal(second.vx > 240, true);
  assert.equal(first.eliminated, false);
  assert.equal(second.eliminated, false);
});

test('cancels vertical movement when opposite gravity runners press together', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [
      { x: 100, y: 100, gravity: 1, speedX: 0 },
      { x: 100, y: 144, gravity: -1, speedX: 0 }
    ]
  });
  startRoom(room, 'a', 'b');

  for (let frame = 0; frame < 4; frame += 1) room.tick(1 / 40);

  const [first, second] = room.snapshot().players;
  const firstHitboxTop = first.y + first.hitbox.offsetY;
  const secondHitboxTop = second.y + second.hitbox.offsetY;
  assert.equal(Number(Math.abs(secondHitboxTop - firstHitboxTop).toFixed(6)), 48);
  assert.equal(first.vy, 0);
  assert.equal(second.vy, 0);
});

test('lets the downward-gravity runner keep its contact position when an inverted runner is underneath', () => {
  const room = new GameRoom({
    tileSize: 48,
    colliders: [],
    spawns: [
      { x: 100, y: 100, gravity: 1, speedX: 0 },
      { x: 100, y: 144, gravity: -1, speedX: 0 }
    ]
  });
  startRoom(room, 'a', 'b');

  room.tick(1 / 40);

  const [downwardRunner, invertedRunner] = room.snapshot().players;
  assert.equal(downwardRunner.y, 118.75);
  assert.equal(invertedRunner.y, 176.75);
  assert.equal(downwardRunner.vy, 0);
  assert.equal(invertedRunner.vy, 0);
});
