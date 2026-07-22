import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEditorDraftToLevel, loadCachedEditorDraft } from '../public/playable-map.js';

const baseLevel = {
  tileSize: 48,
  colliders: [{ x: 0, y: 0 }],
  spawns: [{ x: 10, y: 20, gravity: 1, speedX: 100 }],
  finishX: 500,
  elimination: { leftMargin: 60, top: -90, bottom: 560 },
  playerPhysics: { hitboxWidth: 37, hitboxHeight: 28 }
};

test('applies the cached editor spawn and physics changes to the solo level', () => {
  const draft = {
    version: 1,
    colliders: [{ x: 4, y: 5 }],
    spawns: [{ x: 316, y: 222, gravity: -1, speedX: 320 }],
    finishX: 900,
    elimination: { leftMargin: 80, top: -100, bottom: 580 },
    playerPhysics: { hitboxWidth: 37, hitboxHeight: 30, gravityMultiplier: 1, recoveryMultiplier: 1 }
  };

  const level = applyEditorDraftToLevel(baseLevel, draft);
  assert.deepEqual(level.colliders, draft.colliders);
  assert.deepEqual(level.spawns, draft.spawns);
  assert.equal(level.finishX, 900);
  assert.deepEqual(level.elimination, draft.elimination);
  assert.deepEqual(level.playerPhysics, draft.playerPhysics);
  assert.deepEqual(baseLevel.spawns, [{ x: 10, y: 20, gravity: 1, speedX: 100 }]);
});

test('ignores malformed or unrelated cached data and keeps the baked level', () => {
  const storage = { getItem: () => JSON.stringify({ version: 1, spawns: [] }) };
  assert.equal(loadCachedEditorDraft(storage), null);
  assert.deepEqual(applyEditorDraftToLevel(baseLevel, { version: 2, spawns: [] }), baseLevel);
});
