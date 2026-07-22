import test from 'node:test';
import assert from 'node:assert/strict';
import { animationFrame, frameSourceRect, MORPH_DURATION_MS, morphFrame } from '../public/player-animation.js';

test('uses the original 15 by 9 player atlas and only the run animation frames', () => {
  assert.equal(animationFrame(0), 0);
  assert.equal(animationFrame(649), 12);
  assert.deepEqual(frameSourceRect(12), { x: 780, y: 0, width: 65, height: 77 });
  assert.deepEqual(frameSourceRect(15), { x: 0, y: 77, width: 65, height: 77 });
});

test('plays the recovered light-to-runner morph frames for the opening 1.1 seconds', () => {
  assert.equal(MORPH_DURATION_MS, 1100);
  assert.equal(morphFrame(0), 23);
  assert.equal(morphFrame(50), 24);
  assert.equal(morphFrame(1050), 44);
});
