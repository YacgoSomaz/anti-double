export const EDITOR_DRAFT_VERSION = 1;

function clone(value) { return structuredClone(value); }
function cellKey(cell) { return `${cell.x}:${cell.y}`; }

export function validateEditorDraft(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || value.version !== EDITOR_DRAFT_VERSION) errors.push('草稿版本不受支持');
  if (!Number.isFinite(value?.tileSize) || value.tileSize <= 0) errors.push('赛道格尺寸无效');
  if (!Array.isArray(value?.colliders)) errors.push('碰撞层无效');
  else if (value.colliders.some((cell) => !Number.isInteger(cell?.x) || !Number.isInteger(cell?.y))) errors.push('碰撞格必须使用整数坐标');
  else if (new Set(value.colliders.map(cellKey)).size !== value.colliders.length) errors.push('碰撞格不能重复');
  if (!Array.isArray(value?.spawns) || !value.spawns.length) errors.push('至少需要一个出生点');
  return { valid: errors.length === 0, errors };
}

export function createEditorDraft(level, source = 'marathon') {
  const draft = {
    version: EDITOR_DRAFT_VERSION,
    source: String(source),
    tileSize: Number(level?.tileSize),
    world: clone(level?.world ?? null),
    colliders: clone(level?.colliders ?? []),
    spawns: clone(level?.spawns ?? []),
    finishX: Number(level?.finishX ?? 0),
    segments: clone(level?.segments ?? [])
  };
  const validation = validateEditorDraft(draft);
  if (!validation.valid) throw new TypeError(validation.errors.join('；'));
  return draft;
}

export function createHistory(draft) {
  return { current: clone(draft), undoStack: [], redoStack: [] };
}

export function applyColliderEdit(history, { x, y, solid }) {
  if (!history?.current || !Number.isInteger(x) || !Number.isInteger(y) || typeof solid !== 'boolean') throw new TypeError('碰撞编辑无效');
  const current = history.current;
  const index = current.colliders.findIndex((cell) => cell.x === x && cell.y === y);
  if ((solid && index >= 0) || (!solid && index < 0)) return history;
  const colliders = solid
    ? [...current.colliders, { x, y }]
    : current.colliders.filter((_, candidate) => candidate !== index);
  const next = { ...current, colliders };
  return { current: next, undoStack: [...history.undoStack, current], redoStack: [] };
}

export function undo(history) {
  if (!history?.undoStack?.length) return history;
  const current = history.undoStack.at(-1);
  return { current, undoStack: history.undoStack.slice(0, -1), redoStack: [history.current, ...history.redoStack] };
}

export function redo(history) {
  if (!history?.redoStack?.length) return history;
  const current = history.redoStack[0];
  return { current, undoStack: [...history.undoStack, history.current], redoStack: history.redoStack.slice(1) };
}

export function exportEditorDraft(draft) {
  const validation = validateEditorDraft(draft);
  if (!validation.valid) throw new TypeError(validation.errors.join('；'));
  return JSON.stringify(draft, null, 2);
}

export function parseEditorDraft(text) {
  try {
    const draft = JSON.parse(text);
    const validation = validateEditorDraft(draft);
    if (!validation.valid) throw new Error(validation.errors.join('；'));
    return clone(draft);
  } catch (error) { throw new Error(`草稿文件无效：${error.message}`); }
}
