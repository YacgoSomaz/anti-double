import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEditorGesture } from '../public/editor-input.js';

test('collision layer does not paint while the select tool is active', () => {
  assert.deepEqual(resolveEditorGesture({ activeLayer: 'collision', tool: 'select', button: 0 }), { type: 'select-cell' });
});

test('collision paint and erase remain explicit tools', () => {
  assert.deepEqual(resolveEditorGesture({ activeLayer: 'collision', tool: 'paint', button: 0 }), { type: 'paint-collision', brush: 'paint' });
  assert.deepEqual(resolveEditorGesture({ activeLayer: 'collision', tool: 'erase', button: 0 }), { type: 'paint-collision', brush: 'erase' });
});

test('visual layer drags a hit asset and pans empty space', () => {
  assert.deepEqual(resolveEditorGesture({ activeLayer: 'visual', tool: 'select', button: 0, visualHit: 3 }), { type: 'drag-visual', index: 3 });
  assert.deepEqual(resolveEditorGesture({ activeLayer: 'visual', tool: 'select', button: 0, visualHit: -1 }), { type: 'pan' });
});

test('middle and right mouse buttons always pan the canvas', () => {
  assert.deepEqual(resolveEditorGesture({ activeLayer: 'collision', tool: 'paint', button: 1 }), { type: 'pan' });
  assert.deepEqual(resolveEditorGesture({ activeLayer: 'collision', tool: 'paint', button: 2 }), { type: 'pan' });
});
