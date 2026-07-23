import test from 'node:test';
import assert from 'node:assert/strict';
import {
  animationFrameForVisual,
  frameSourceRectForVisual,
  playerVisualForSlot,
  playerVisualForSkin
} from '../public/player-animation.js';

test('uses the six supplied mounted-demon walk frames for player one without changing the collision sprite size', () => {
  const visual = playerVisualForSlot(1);

  assert.equal(visual.asset, 'player-mounted-demon.png');
  assert.deepEqual(visual.drawSize, { width: 65, height: 77 });
  assert.deepEqual(visual.runFrames, [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(visual.airFrames, [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(frameSourceRectForVisual(visual, 5), { x: 325, y: 0, width: 65, height: 77 });
  assert.equal(animationFrameForVisual(visual, 5 * (1000 / 12)), 5);
  assert.equal(playerVisualForSkin('mounted-demon'), visual);
});

test('keeps the licensed Demon_A walk sheet as player two while player one awaits its new skin', () => {
  const visual = playerVisualForSlot(2);

  assert.equal(visual.asset, 'player-demon-a.png');
  assert.deepEqual(visual.drawSize, { width: 65, height: 77 });
  assert.deepEqual(frameSourceRectForVisual(visual, 0), { x: 0, y: 0, width: 65, height: 77 });
  assert.deepEqual(frameSourceRectForVisual(visual, 7), { x: 455, y: 0, width: 65, height: 77 });
  assert.equal(animationFrameForVisual(visual, 0), 0);
  assert.equal(animationFrameForVisual(visual, 1000 / 12), 1);
});
