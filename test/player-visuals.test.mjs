import test from 'node:test';
import assert from 'node:assert/strict';
import {
  animationFrameForVisual,
  frameSourceRectForVisual,
  playerVisualForSlot
} from '../public/player-animation.js';

test('uses the licensed Demon_A walk sheet for the blue player without changing its physics-sized display box', () => {
  const visual = playerVisualForSlot(1);

  assert.equal(visual.asset, 'player-demon-a.png');
  assert.deepEqual(visual.drawSize, { width: 65, height: 77 });
  assert.deepEqual(frameSourceRectForVisual(visual, 0), { x: 40, y: 35, width: 26, height: 28 });
  assert.deepEqual(frameSourceRectForVisual(visual, 7), { x: 740, y: 35, width: 26, height: 28 });
  assert.equal(animationFrameForVisual(visual, 0), 0);
  assert.equal(animationFrameForVisual(visual, 1000 / 12), 1);
});
