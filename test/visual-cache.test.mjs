import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVisualDrawList, visibleDrawList } from '../public/visual-cache.js';

test('preprojects decorations once and returns only the current viewport', () => {
  const visualMap = {
    assets: {
      near: { file: 'near.png', width: 40, height: 20 },
      far: { file: 'far.png', width: 60, height: 30 }
    },
    visualInfo: [
      { imageId: 'far', posX: 2000, posY: 300 },
      { imageId: 'near', posX: 120, posY: 300 },
      { imageId: 'near', posX: 620, posY: 300 }
    ]
  };

  const cache = buildVisualDrawList(visualMap, 'visualInfo');
  const visible = visibleDrawList(cache, 70, 170, 0, 500);

  assert.equal(cache.records.length, 3);
  assert.equal(cache.records[0].asset.file, 'near.png');
  assert.deepEqual(visible.map((item) => item.asset.file), ['near.png']);
  assert.equal(Number(visible[0].x.toFixed(3)), 76.981);
});
