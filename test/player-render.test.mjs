import test from 'node:test';
import assert from 'node:assert/strict';
import { drawPlayerSprite } from '../public/player-render.js';

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
