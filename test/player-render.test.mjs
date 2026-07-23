import test from 'node:test';
import assert from 'node:assert/strict';
import { drawPlayerSprite, playerSpritePlacement } from '../public/player-render.js';

test('mirrors an inverted player vertically around its own centre', () => {
  const calls = [];
  const ctx = {
    save: () => calls.push(['save']),
    translate: (...args) => calls.push(['translate', ...args]),
    scale: (...args) => calls.push(['scale', ...args]),
    drawImage: (...args) => calls.push(['drawImage', ...args]),
    restore: () => calls.push(['restore'])
  };
  const sprite = {};
  const source = { x: 65, y: 0, width: 65, height: 77 };

  drawPlayerSprite(ctx, sprite, source, { x: 285, y: 304, gravity: -1 });

  assert.deepEqual(calls, [
    ['save'],
    ['translate', 317.5, 342.5],
    ['scale', 1, -1],
    ['drawImage', sprite, 65, 0, 65, 77, -32.5, -38.5, 65, 77],
    ['restore']
  ]);
});

test('draws a normal-gravity player at its world position', () => {
  const calls = [];
  const ctx = { drawImage: (...args) => calls.push(args) };
  const sprite = {};
  const source = { x: 0, y: 0, width: 65, height: 77 };

  drawPlayerSprite(ctx, sprite, source, { x: 285, y: 304, gravity: 1 });

  assert.deepEqual(calls, [[sprite, 0, 0, 65, 77, 285, 304, 65, 77]]);
});

test('fits a custom skin to the shared physics body and keeps its feet on the collision contact', () => {
  const placement = playerSpritePlacement(
    { x: 285, y: 304, gravity: 1, sizeScale: 1 },
    { width: 51, height: 60, footY: 67, collisionAligned: true }
  );

  assert.deepEqual(placement, { x: 294, y: 318.7922077922078, width: 51, height: 60 });
});

test('mirrors a collision-aligned custom skin onto the inverted collision contact', () => {
  const placement = playerSpritePlacement(
    { x: 285, y: 304, gravity: -1, sizeScale: 1 },
    { width: 51, height: 60, footY: 67, collisionAligned: true }
  );

  assert.deepEqual(placement, { x: 294, y: 305.2077922077922, width: 51, height: 60 });
});

test('scales the skin from the same shared collision body when a size item is active', () => {
  const placement = playerSpritePlacement(
    { x: 285, y: 304, gravity: 1, sizeScale: 1.28 },
    { width: 51, height: 60, footY: 67, collisionAligned: true }
  );

  assert.deepEqual(placement, { x: 286.86, y: 310.67532467532465, width: 65.28, height: 76.8 });
});
