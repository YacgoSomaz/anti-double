import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceCamera, reconcileCamera } from '../public/camera.js';

test('locally integrates the shared-camera acceleration through a delayed packet', () => {
  const camera = advanceCamera(100, 250, 211.6983);
  assert.equal(camera, 153.166);
  assert.equal(advanceCamera(100, 1000, 211.6983), 315.568);
});

test('keeps locally integrating camera scroll through a multi-second packet stall', () => {
  assert.equal(advanceCamera(100, 2500, 211.6983), 653.434);
});

test('does not derive the shared camera from a local player position', () => {
  const camera = advanceCamera(380, 16, 211.6983);
  assert.equal(camera, 383.388);
});

test('does not move a camera whose authoritative speed is zero', () => {
  const camera = advanceCamera(20, 16, 0);
  assert.equal(camera, 20);
});

test('does not pull the monotonic shared camera backwards for a delayed snapshot', () => {
  assert.equal(reconcileCamera(130, 145), 145);
  assert.equal(reconcileCamera(160, 145), 160);
});

test('accepts a large authoritative camera hold instead of leaving the visual camera far ahead', () => {
  assert.equal(reconcileCamera(100, 180), 100);
});
