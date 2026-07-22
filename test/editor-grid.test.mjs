import test from 'node:test';
import assert from 'node:assert/strict';
import { cellFromWorld } from '../public/editor-grid.js';

test('maps a world point to the grid cell that contains it', () => {
  assert.deepEqual(cellFromWorld({ x: 68, y: 323, originY: 425, size: 34 }), { x: 2, y: 3 });
  assert.deepEqual(cellFromWorld({ x: 67.99, y: 322.99, originY: 425, size: 34 }), { x: 1, y: 3 });
});

test('uses floor intervals at exact grid boundaries, including negative cells', () => {
  assert.deepEqual(cellFromWorld({ x: 0, y: 425, originY: 425, size: 34 }), { x: 0, y: 0 });
  assert.deepEqual(cellFromWorld({ x: -0.01, y: 459.01, originY: 425, size: 34 }), { x: -1, y: -2 });
});
