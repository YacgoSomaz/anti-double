import test from 'node:test';
import assert from 'node:assert/strict';
import { projectVisual } from '../public/visual-projection.js';

test('projects original MP02 decoration coordinates into the 640 by 501 Flash stage', () => {
  assert.deepEqual(
    projectVisual({ posX: 354.7, posY: 65.5 }),
    { x: 227.543, y: 418.981 },
  );
});

test('keeps decoration scaling anchored at its centre like the original Flixel sprites', () => {
  assert.deepEqual(
    projectVisual({ posX: 345, posY: 641.5, scaleX: 1.2, scaleY: 0.5 }, { width: 35, height: 102 }),
    { x: 221.321, y: 49.472, scaleX: 1.2, scaleY: 0.5, offsetX: -3.5, offsetY: 25.5 },
  );
});
