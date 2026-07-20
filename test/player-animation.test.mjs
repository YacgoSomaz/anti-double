import test from 'node:test';
import assert from 'node:assert/strict';
import { animationFrame, frameSourceRect } from '../public/player-animation.js';

test('uses the original player atlas dimensions and only the run animation frames', () => {
  assert.equal(animationFrame(0), 0);
  assert.equal(animationFrame(649), 12);
  assert.deepEqual(frameSourceRect(12), { x: 780, y: 0, width: 65, height: 77 });
});
