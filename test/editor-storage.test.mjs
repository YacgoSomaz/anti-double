import test from 'node:test';
import assert from 'node:assert/strict';
import { EDITOR_DRAFT_CACHE_KEY, clearEditorDraftCache, loadEditorDraftCache, saveEditorDraftCache } from '../public/editor-storage.js';

test('saves and restores a draft through local storage', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  const draft = { version: 1, colliders: [{ x: 1, y: 2 }] };
  saveEditorDraftCache(storage, draft);
  assert.equal(values.has(EDITOR_DRAFT_CACHE_KEY), true);
  assert.deepEqual(loadEditorDraftCache(storage), draft);
});

test('invalid cache is discarded and never blocks a fresh editor', () => {
  const values = new Map([[EDITOR_DRAFT_CACHE_KEY, '{not json']]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  assert.equal(loadEditorDraftCache(storage), null);
  assert.equal(values.has(EDITOR_DRAFT_CACHE_KEY), false);
});

test('cache can be cleared explicitly', () => {
  const values = new Map([[EDITOR_DRAFT_CACHE_KEY, '{}']]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  clearEditorDraftCache(storage);
  assert.equal(values.has(EDITOR_DRAFT_CACHE_KEY), false);
});
