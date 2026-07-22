import test from 'node:test';
import assert from 'node:assert/strict';
import { preserveSelectIndex } from '../public/editor-form.js';

test('preserves the selected spawn index while rebuilding option elements', () => {
  assert.equal(preserveSelectIndex('2', 4), 2);
  assert.equal(preserveSelectIndex('3', 4), 3);
});

test('falls back safely when the previous index is missing or out of range', () => {
  assert.equal(preserveSelectIndex('', 4), 0);
  assert.equal(preserveSelectIndex('99', 4), 3);
  assert.equal(preserveSelectIndex('-1', 4), 0);
  assert.equal(preserveSelectIndex('2', 0), 0);
});
