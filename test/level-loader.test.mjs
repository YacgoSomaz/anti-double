import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLevel } from '../src/level-loader.mjs';

test('loads the reverse-engineered MP02 multiplayer course with four spawns', () => {
  const level = loadLevel('mp02');

  assert.equal(level.spawns.length, 4);
  assert.equal(level.colliders.length, 1017);
  assert.deepEqual(level.world, { cellSize: 34, originY: 425 });
  assert.deepEqual(level.spawns[0], { x: 316, y: 103, gravity: -1, speedX: 211.6983 });
});

test('concatenates three recovered courses into one continuous marathon', () => {
  const mp02 = loadLevel('mp02');
  const marathon = loadLevel('marathon');

  assert.equal(marathon.segments.length, 3);
  assert.deepEqual(marathon.segments.map((segment) => segment.id), ['mp02', 'mp03', 'mp04']);
  assert.equal(marathon.colliders.length > mp02.colliders.length * 2, true);
  assert.equal(marathon.finishX > mp02.finishX * 2, true);
  assert.deepEqual(marathon.spawns, mp02.spawns);
});

test('does not load an unknown level name', () => {
  assert.throws(() => loadLevel('anything-else'), /Unknown level/);
});
