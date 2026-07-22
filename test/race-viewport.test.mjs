import test from 'node:test';
import assert from 'node:assert/strict';
import { RACE_BACKDROP_SCALE, RACE_VIEW_SCALE, worldViewportBounds } from '../public/race-viewport.js';

test('zooms the race view out by ten percent around its centre', () => {
  const bounds = worldViewportBounds({ cameraX: 1000, width: 640, height: 501 });

  assert.equal(RACE_VIEW_SCALE, 1 / 1.1);
  assert.equal(bounds.width, 704);
  assert.equal(bounds.height, 551.1);
  assert.equal(bounds.left, 968);
  assert.equal(bounds.right, 1672);
  assert.ok(Math.abs(bounds.top + 25.05) < 0.000001);
  assert.ok(Math.abs(bounds.bottom - 526.05) < 0.000001);
});

test('counter-scales the backdrop so the zoomed race view has no lower blank band', () => {
  assert.equal(RACE_BACKDROP_SCALE, 1.1);
  // The near-city source ends at 501px in the original stage.  Counter-scale
  // inside the 0.909x race transform keeps that lower edge at 501px.
  assert.equal(254 + 247 * RACE_BACKDROP_SCALE, 525.7);
});
