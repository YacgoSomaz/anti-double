import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ELIMINATION_BOUNDARY_FRAME_COUNT,
  ELIMINATION_BOUNDARY_FRAME_MS,
  eliminationBoundaryFrame
} from '../public/elimination-boundary.js';

test('cycles the transparent elimination boundary through four lightning frames', () => {
  assert.equal(ELIMINATION_BOUNDARY_FRAME_COUNT, 4);
  assert.equal(ELIMINATION_BOUNDARY_FRAME_MS, 90);
  assert.deepEqual([0, 90, 180, 270, 360].map(eliminationBoundaryFrame), [0, 1, 2, 3, 0]);
});
