import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyColliderEdit,
  createEditorDraft,
  createHistory,
  exportEditorDraft,
  parseEditorDraft,
  redo,
  undo,
  validateEditorDraft
} from '../public/editor-draft.js';

const level = {
  tileSize: 34,
  world: { cellSize: 34, originY: 425 },
  colliders: [{ x: 1, y: 2 }],
  spawns: [{ x: 100, y: 100, gravity: 1, speedX: 200 }],
  finishX: 900,
  segments: [{ id: 'mp03', startX: 0, endX: 900, isFinal: true }]
};

test('creates an isolated, versioned editor draft from a playable level', () => {
  const draft = createEditorDraft(level, 'marathon');
  draft.colliders[0].x = 99;
  assert.equal(level.colliders[0].x, 1);
  assert.equal(draft.version, 1);
  assert.equal(draft.source, 'marathon');
});

test('paints and erases collision cells with undo and redo', () => {
  let history = createHistory(createEditorDraft(level));
  history = applyColliderEdit(history, { x: 3, y: 4, solid: true });
  assert.equal(history.current.colliders.some((cell) => cell.x === 3 && cell.y === 4), true);
  history = undo(history);
  assert.equal(history.current.colliders.some((cell) => cell.x === 3 && cell.y === 4), false);
  history = redo(history);
  assert.equal(history.current.colliders.some((cell) => cell.x === 3 && cell.y === 4), true);
  history = applyColliderEdit(history, { x: 1, y: 2, solid: false });
  assert.equal(history.current.colliders.some((cell) => cell.x === 1 && cell.y === 2), false);
});

test('exports only valid drafts and rejects malformed imported data', () => {
  const draft = createEditorDraft(level);
  assert.deepEqual(parseEditorDraft(exportEditorDraft(draft)), draft);
  assert.deepEqual(validateEditorDraft({ ...draft, colliders: [{ x: 1.5, y: 2 }] }).errors, ['碰撞格必须使用整数坐标']);
  assert.throws(() => parseEditorDraft('{"version":999}'), /草稿/);
});
