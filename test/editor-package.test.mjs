import test from 'node:test';
import assert from 'node:assert/strict';
import { createDraftDiff, validateDraftDiff } from '../public/editor-package.js';

const base = { version: 1, tileSize: 34, colliders: [{ x: 1, y: 2 }], spawns: [{ x: 10, y: 20, gravity: 1, speedX: 100 }], finishX: 500 };

test('creates a reviewable collision diff instead of mutating the source level', () => {
  const current = { ...base, colliders: [{ x: 2, y: 3 }] };
  const diff = createDraftDiff(base, current);
  assert.deepEqual(diff.addedColliders, [{ x: 2, y: 3 }]);
  assert.deepEqual(diff.removedColliders, [{ x: 1, y: 2 }]);
  assert.equal(validateDraftDiff(diff).valid, true);
});

test('rejects an unbounded or malformed diff before export', () => {
  assert.equal(validateDraftDiff({ addedColliders: Array.from({ length: 50001 }, () => ({ x: 1, y: 1 })) }).valid, false);
  assert.equal(validateDraftDiff({ addedColliders: [{ x: 1.5, y: 1 }], removedColliders: [] }).valid, false);
});
