import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEM_TYPES, createItemState } from '../src/item-system.mjs';
import { GameRoom } from '../src/game-room.mjs';
import { loadLevel } from '../src/level-loader.mjs';

const openLevel = {
  tileSize: 48,
  finishX: 2000,
  colliders: [],
  spawns: [
    { x: 100, y: 100, gravity: 1, speedX: 120 },
    { x: 100, y: 100, gravity: -1, speedX: 120 },
    { x: 100, y: 100, gravity: 1, speedX: 120 },
    { x: 100, y: 100, gravity: -1, speedX: 120 }
  ]
};

test('generates deterministic compact item placements from a room seed', () => {
  const level = { ...openLevel, itemConfig: { seed: 42, count: 6 } };
  const first = createItemState(level);
  const second = createItemState(level);

  assert.deepEqual(first, second);
  assert.equal(first.length, 6);
  assert.deepEqual([...new Set(first.map((item) => item.type))], [ITEM_TYPES.gravityBurst, ITEM_TYPES.phase, ITEM_TYPES.speedBoost]);
  assert.equal(first.every((item) => item.active && item.x > 0 && item.x < level.finishX), true);
});

test('puts the first procedural item inside the opening playable stretch', () => {
  const level = { ...openLevel, finishX: 99892, itemConfig: { seed: 44052, count: 18, minimumSpacing: 420 } };
  const items = createItemState(level);

  assert.equal(items[0].x <= 700, true);
  assert.equal(items.at(-1).x < level.finishX, true);
});

test('keeps procedural pickups frequent across the long marathon', () => {
  const level = loadLevel('marathon');
  const items = createItemState(level);
  const gaps = items.slice(1).map((item, index) => item.x - items[index].x);

  assert.equal(items.length >= 150, true);
  assert.equal(Math.max(...gaps) < 700, true);
});

test('keeps generated pickups outside collision blocks so they remain collectible', () => {
  const level = loadLevel('marathon');
  const items = createItemState(level);
  const cellSize = level.world.cellSize;
  const blocks = level.colliders.map((collider) => ({
    x: collider.x * cellSize,
    y: level.world.originY - collider.y * cellSize,
    width: cellSize,
    height: cellSize
  }));
  const overlaps = items.filter((item) => blocks.some((block) => item.x + 29 > block.x
    && item.x - 29 < block.x + block.width
    && item.y + 29 > block.y
    && item.y - 29 < block.y + block.height));

  assert.deepEqual(overlaps, []);
});

test('collecting a gravity burst flips every active runner exactly once', () => {
  const level = {
    ...openLevel,
    itemSpawns: [{ id: 'flip-1', type: ITEM_TYPES.gravityBurst, x: 100, y: 100 }]
  };
  const room = new GameRoom(level);
  room.join('a');
  room.join('b');
  room.start('a');

  room.tick(1 / 40);
  const snapshot = room.snapshot();
  assert.deepEqual(snapshot.players.map((player) => player.gravity), [-1, 1]);
  assert.equal(snapshot.items[0].active, false);
  room.tick(1 / 40);
  assert.deepEqual(room.snapshot().players.map((player) => player.gravity), [-1, 1]);
});

test('phase item grants three seconds of terrain and player collision immunity', () => {
  const level = {
    ...openLevel,
    colliders: [{ x: 3, y: 0 }],
    itemSpawns: [{ id: 'phase-1', type: ITEM_TYPES.phase, x: 100, y: 100 }]
  };
  const room = new GameRoom(level);
  room.join('a');
  room.start('a');

  room.tick(1 / 40);
  const player = room.snapshot().players[0];
  assert.equal(player.phaseTicks, 119);
  assert.equal(player.blockedX, false);
  assert.equal(player.x > 100, true);
});

test('speed control slows only the collecting runner velocity', () => {
  const level = {
    ...openLevel,
    itemSpawns: [{ id: 'speed-1', type: ITEM_TYPES.speedBoost, x: 100, y: 100 }]
  };
  const room = new GameRoom(level);
  room.join('a');
  room.join('b');
  room.start('a');

  room.tick(1 / 40);
  const [slowed, normal] = room.snapshot().players;
  assert.equal(slowed.speedBoostTicks, 119);
  assert.equal(slowed.vx < normal.vx, true);
});
