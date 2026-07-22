import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLevel } from '../src/level-loader.mjs';

test('loads the reverse-engineered MP02 multiplayer course with four spawns', () => {
  const level = loadLevel('mp02');

  assert.equal(level.spawns.length, 4);
  assert.equal(level.colliders.length, 1017);
  assert.deepEqual(level.world, { cellSize: 34, originY: 425 });
  assert.deepEqual(level.spawns[0], { x: 316, y: 103, gravity: 1, speedX: 211.6983 });
  assert.deepEqual(level.spawns.map((spawn) => spawn.gravity), [1, -1, 1, -1]);
});

test('concatenates two recovered course rotations into one continuous marathon', () => {
  const mp02 = loadLevel('mp02');
  const marathon = loadLevel('marathon');

  assert.equal(marathon.segments.length, 6);
  assert.deepEqual(marathon.segments.map((segment) => segment.id), ['mp03', 'mp04', 'mp02', 'mp03', 'mp04', 'mp02']);
  assert.deepEqual(marathon.segments.map((segment) => segment.isFinal), [false, false, false, false, false, true]);
  assert.equal(marathon.colliders.length > mp02.colliders.length * 5, true);
  assert.equal(marathon.finishX, marathon.segments[2].endX * 2);
  assert.deepEqual(marathon.spawns, mp02.spawns);
});

test('opens every internal marathon seam while retaining the final course wall', () => {
  const marathon = loadLevel('marathon');
  const cellsAt = (x) => marathon.colliders.filter((collider) => collider.x === x).map((collider) => collider.y);
  const isFullHeightWall = (x) => Array.from({ length: 11 }, (_, index) => index + 1)
    .every((y) => cellsAt(x).includes(y));

  for (const segment of marathon.segments.slice(1)) {
    const startCell = segment.startX / marathon.world.cellSize;
    assert.equal(cellsAt(startCell).some((y) => y >= 1 && y <= 11), false);
    assert.equal(cellsAt(startCell - 2).some((y) => y >= 1 && y <= 11), false);
  }

  for (const segment of marathon.segments.slice(0, -1)) {
    const startCell = segment.startX / marathon.world.cellSize;
    const endCell = segment.endX / marathon.world.cellSize;
    for (let cell = Math.max(1, startCell); cell < endCell; cell += 1) {
      assert.equal(isFullHeightWall(cell), false, `intermediate segment has an end wall at cell ${cell}`);
    }
  }

  const finalWallCell = marathon.finishX / marathon.world.cellSize - 2;
  assert.deepEqual(cellsAt(finalWallCell).filter((y) => y >= 1 && y <= 11).sort((first, second) => first - second), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

test('does not load an unknown level name', () => {
  assert.throws(() => loadLevel('anything-else'), /Unknown level/);
});
