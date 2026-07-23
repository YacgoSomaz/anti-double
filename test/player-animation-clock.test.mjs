import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePlayerAnimationClock, playerAnimationRate } from '../public/player-animation-clock.js';

test('matches the running animation rate to the shared movement speed', () => {
  assert.equal(playerAnimationRate({ vx: 212, startSpeedX: 212 }, 212), 1);
  assert.equal(playerAnimationRate({ vx: 636, startSpeedX: 212 }, 636), 3);
});

test('uses the camera speed when packet presentation has not yet updated the player velocity', () => {
  assert.equal(playerAnimationRate({ vx: 212, startSpeedX: 212 }, 424), 2);
});

test('accumulates animation time at the current rate without jumping when the rate changes', () => {
  const clocks = new Map();
  assert.equal(advancePlayerAnimationClock(clocks, 1, 10_000, 1), 0);
  assert.equal(advancePlayerAnimationClock(clocks, 1, 10_100, 1), 100);
  assert.equal(advancePlayerAnimationClock(clocks, 1, 10_200, 3), 400);
});

test('caps a paused render gap so a tab restore cannot skip an entire animation cycle', () => {
  const clocks = new Map();
  advancePlayerAnimationClock(clocks, 1, 100, 1);
  assert.equal(advancePlayerAnimationClock(clocks, 1, 1_000, 2), 200);
});
