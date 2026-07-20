import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceCamera } from '../public/camera.js';

test('interpolates the server-owned course camera for at most 50 ms', () => {
  const camera = advanceCamera(100, 50, 211.6983);
  assert.equal(camera, 110.585);
});

test('does not derive the shared camera from a local player position', () => {
  const camera = advanceCamera(380, 16, 211.6983);
  assert.equal(camera, 383.387);
});

test('does not move a camera whose authoritative speed is zero', () => {
  const camera = advanceCamera(20, 16, 0);
  assert.equal(camera, 20);
});
