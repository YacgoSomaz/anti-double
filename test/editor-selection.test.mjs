import test from 'node:test';
import assert from 'node:assert/strict';
import { preserveSelectionOnDrag, resolveEditorShortcut, toggleSelection } from '../public/editor-selection.js';

test('recognizes undo, redo, copy and paste shortcuts on Windows and macOS', () => {
  assert.equal(resolveEditorShortcut({ key: 'z', ctrlKey: true }), 'undo');
  assert.equal(resolveEditorShortcut({ key: 'z', metaKey: true }), 'undo');
  assert.equal(resolveEditorShortcut({ key: 'z', ctrlKey: true, shiftKey: true }), 'redo');
  assert.equal(resolveEditorShortcut({ key: 'y', ctrlKey: true }), 'redo');
  assert.equal(resolveEditorShortcut({ key: 'c', ctrlKey: true }), 'copy');
  assert.equal(resolveEditorShortcut({ key: 'v', metaKey: true }), 'paste');
  assert.equal(resolveEditorShortcut({ key: 'z', ctrlKey: false }), null);
});

test('toggles one selection with Ctrl/Cmd and replaces selection without it', () => {
  assert.deepEqual(toggleSelection([2], 5, false), [5]);
  assert.deepEqual(toggleSelection([2], 5, true), [2, 5]);
  assert.deepEqual(toggleSelection([2, 5], 5, true), [2]);
});

test('keeps an existing multi-selection when dragging one of its selected items', () => {
  assert.equal(preserveSelectionOnDrag([2, 5], 5, false), true);
  assert.equal(preserveSelectionOnDrag([2, 5], 7, false), false);
  assert.equal(preserveSelectionOnDrag([2, 5], 7, true), false);
});
