import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceCamera, reconcileCamera } from '../public/camera.js';

test('locally integrates the shared-camera acceleration through a delayed packet', () => {
  const camera = advanceCamera(100, 250, 211.6983);
  assert.equal(camera, 153.166);
  assert.equal(advanceCamera(100, 1000, 211.6983), 315.568);
});

test('does not derive the shared camera from a local player position', () => {
  const camera = advanceCamera(380, 16, 211.6983);
  assert.equal(camera, 383.387);
});

test('does not move a camera whose authoritative speed is zero', () => {
  const camera = advanceCamera(20, 16, 0);
  assert.equal(camera, 20);
});

test('does not pull the monotonic shared camera backwards for a delayed snapshot', () => {
  assert.equal(reconcileCamera(130, 145), 145);
  assert.equal(reconcileCamera(160, 145), 160);
});
