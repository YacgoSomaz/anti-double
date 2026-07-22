import test from 'node:test';
import assert from 'node:assert/strict';
import { animationFrame, animationFrameFromSequence, animationPreset, frameSourceRect, MORPH_DURATION_MS, morphFrame } from '../public/player-animation.js';

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

test('exposes editable animation presets and loops a custom sequence at its configured speed', () => {
  assert.deepEqual(animationPreset('run').sequence, Array.from({ length: 13 }, (_, index) => index));
  assert.equal(animationPreset('fall').speed, 12);
  assert.equal(animationPreset('eliminate').sequence.length > 1, true);
  assert.equal(animationFrameFromSequence([4, 7, 9], 0, 10), 4);
  assert.equal(animationFrameFromSequence([4, 7, 9], 100, 10), 7);
  assert.equal(animationFrameFromSequence([4, 7, 9], 350, 10), 7);
});

test('falls back safely for an empty or invalid custom animation sequence', () => {
  assert.equal(animationFrameFromSequence([], 120, 20), 0);
  assert.equal(animationFrameFromSequence([99, -1, 2.5], 120, 20), 0);
  assert.equal(animationPreset('unknown').sequence[0], 0);
});
