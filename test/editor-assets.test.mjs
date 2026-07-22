import test from 'node:test';
import assert from 'node:assert/strict';
import { addVisual, removeSelectedObjects, uniqueVisualAssets } from '../public/editor-assets.js';

test('builds a de-duplicated palette from the recovered visual assets', () => {
  const assets = uniqueVisualAssets([
    { assetFile: 'a.png', imageId: 1, width: 20, height: 30 },
    { assetFile: 'a.png', imageId: 1, width: 20, height: 30 },
    { assetFile: 'b.png', imageId: 2, width: 40, height: 50 }
  ]);
  assert.deepEqual(assets.map((asset) => asset.assetFile), ['a.png', 'b.png']);
});

test('removes selected collision cells and visuals without mutating the draft', () => {
  const draft = { colliders: [{ x: 1, y: 2 }, { x: 3, y: 4 }], visuals: [{ id: 'a' }, { id: 'b' }] };
  const next = removeSelectedObjects(draft, { collisionKeys: ['1:2'], visualIndices: [1] });
  assert.deepEqual(next, { colliders: [{ x: 3, y: 4 }], visuals: [{ id: 'a' }] });
  assert.equal(draft.colliders.length, 2);
  assert.equal(draft.visuals.length, 2);
});

test('adds a palette asset at a world position with a stable identity', () => {
  const next = addVisual({ visuals: [] }, { assetFile: 'block.png', imageId: 7, width: 34, height: 34 }, { x: 100, y: 200 });
  assert.equal(next.visuals.length, 1);
  assert.deepEqual(next.visuals[0], { id: 'editor:visual:0', assetFile: 'block.png', imageId: 7, width: 34, height: 34, x: 100, y: 200 });
});
