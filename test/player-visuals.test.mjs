import test from 'node:test';
import assert from 'node:assert/strict';
import {
  animationFrameForVisual,
  frameSourceRectForVisual,
  playerVisualForSlot
} from '../public/player-animation.js';

test('keeps the licensed Demon_A walk sheet as player two while player one awaits its new skin', () => {
  const visual = playerVisualForSlot(2);

  assert.equal(visual.asset, 'player-demon-a.png');
  assert.deepEqual(visual.drawSize, { width: 65, height: 77 });
  assert.deepEqual(frameSourceRectForVisual(visual, 0), { x: 0, y: 0, width: 65, height: 77 });
  assert.deepEqual(frameSourceRectForVisual(visual, 7), { x: 455, y: 0, width: 65, height: 77 });
  assert.equal(animationFrameForVisual(visual, 0), 0);
  assert.equal(animationFrameForVisual(visual, 1000 / 12), 1);
});
