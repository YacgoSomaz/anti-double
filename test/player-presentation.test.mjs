import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePresentation, presentationOffset } from '../public/player-presentation.js';

test('preserves a predicted runner position when a newer server snapshot arrives behind it', () => {
  assert.deepEqual(presentationOffset({ x: 130, y: 220 }, { x: 100, y: 200 }), { x: 30, y: 20 });
});

test('gradually absorbs a server correction instead of snapping a runner backwards', () => {
  const position = advancePresentation({ x: 100, y: 200, vx: 200, vy: 0, blockedX: false, presentationOffsetX: 30, presentationOffsetY: 0 }, 25);
  assert.equal(position.x > 105, true);
  assert.equal(position.x < 135, true);
});
