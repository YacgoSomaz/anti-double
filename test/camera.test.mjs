import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceCamera } from '../public/camera.js';

test('keeps the course camera moving when the local player is blocked', () => {
  const camera = advanceCamera(100, 50, { x: 100, speedX: 211.6983 });
  assert.equal(camera, 110.585);
});

test('follows the local player when joining after the course has already advanced', () => {
  const camera = advanceCamera(20, 16, { x: 700, speedX: 211.6983 });
  assert.equal(camera, 380);
});

test('does not start scrolling until a local player has been identified', () => {
  const camera = advanceCamera(20, 16, undefined);
  assert.equal(camera, 20);
});
