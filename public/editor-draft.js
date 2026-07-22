export const EDITOR_DRAFT_VERSION = 1;
export const DEFAULT_EDITOR_ELIMINATION = Object.freeze({ leftMargin: 60, top: -90, bottom: 560 });

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
  if (value?.elimination !== undefined) {
    const boundary = value.elimination;
    if (!Number.isFinite(boundary?.leftMargin) || boundary.leftMargin < 0 || boundary.leftMargin > 300) errors.push('淘汰线余量必须在 0–300 px');
    if (!Number.isFinite(boundary?.top) || !Number.isFinite(boundary?.bottom) || boundary.top >= boundary.bottom) errors.push('淘汰上下边界无效');
  }
  return { valid: errors.length === 0, errors };
}

export function createEditorDraft(level, source = 'marathon') {
  const draft = {
    version: EDITOR_DRAFT_VERSION,
    source: String(source),
    tileSize: Number(level?.tileSize),
    world: clone(level?.world ?? null),
    // Marathon seams can contain equivalent source cells twice.  Physics treats
    // them as one solid cell; the editor must do the same so brush erasing has
    // a single, deterministic target.
    colliders: [...new Map((level?.colliders ?? []).map((cell) => [cellKey(cell), clone(cell)])).values()],
    spawns: clone(level?.spawns ?? []),
    finishX: Number(level?.finishX ?? 0),
    segments: clone(level?.segments ?? []),
    visuals: clone(level?.visuals ?? []),
    elimination: { ...DEFAULT_EDITOR_ELIMINATION, ...(level?.elimination ?? {}) },
    cameraTargetX: Number(level?.cameraTargetX ?? 320)
  };
  const validation = validateEditorDraft(draft);
  if (!validation.valid) throw new TypeError(validation.errors.join('；'));
  return draft;
}

export function updateEditorProperty(history, { path, value }) {
  if (!history?.current || !Array.isArray(path) || path.length < 1 || path.length > 3) throw new TypeError('属性编辑无效');
  const [root, index, key] = path;
  const next = structuredClone(history.current);
  if (root === 'spawns' && Number.isInteger(index) && next.spawns[index] && ['x', 'y', 'gravity', 'speedX'].includes(key)) {
    if (!Number.isFinite(Number(value))) throw new TypeError('属性值无效');
    const normalized = key === 'gravity' ? (Number(value) < 0 ? -1 : 1) : Number(value);
    next.spawns[index] = { ...next.spawns[index], [key]: normalized };
  } else if (path.length === 1 && root === 'finishX' && Number.isFinite(Number(value))) {
    next.finishX = Math.max(0, Number(value));
  } else if (root === 'elimination' && path.length === 2 && ['leftMargin', 'top', 'bottom'].includes(index) && Number.isFinite(Number(value))) {
    next.elimination = { ...DEFAULT_EDITOR_ELIMINATION, ...(next.elimination ?? {}), [index]: Number(value) };
  } else if (root === 'visuals' && Number.isInteger(index) && next.visuals?.[index] && ['x', 'y'].includes(key) && Number.isFinite(Number(value))) {
    next.visuals[index] = { ...next.visuals[index], [key]: Number(value) };
  } else {
    throw new TypeError('属性编辑无效');
  }
  const validation = validateEditorDraft(next);
  if (!validation.valid) throw new TypeError(`属性编辑无效：${validation.errors.join('；')}`);
  return { current: next, undoStack: [...history.undoStack, history.current], redoStack: [] };
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
    draft.visuals ??= [];
    draft.elimination ??= { ...DEFAULT_EDITOR_ELIMINATION };
    const validation = validateEditorDraft(draft);
    if (!validation.valid) throw new Error(validation.errors.join('；'));
    return clone(draft);
  } catch (error) { throw new Error(`草稿文件无效：${error.message}`); }
}
