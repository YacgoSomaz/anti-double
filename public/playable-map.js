export const EDITOR_DRAFT_CACHE_KEY = 'gswitch.editor.draft.v1';

function finite(value) { return Number.isFinite(Number(value)); }
function clone(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function validSpawn(spawn) {
  return spawn && finite(spawn.x) && finite(spawn.y) && (Number(spawn.gravity) === 1 || Number(spawn.gravity) === -1) && finite(spawn.speedX);
}
function validPhysics(physics) {
  if (physics === undefined) return true;
  return finite(physics.hitboxWidth) && Number(physics.hitboxWidth) >= 20 && Number(physics.hitboxWidth) <= 56
    && finite(physics.hitboxHeight) && Number(physics.hitboxHeight) >= 28 && Number(physics.hitboxHeight) <= 72
    && finite(physics.gravityMultiplier) && Number(physics.gravityMultiplier) >= 0.25 && Number(physics.gravityMultiplier) <= 2
    && finite(physics.recoveryMultiplier) && Number(physics.recoveryMultiplier) >= 0.1 && Number(physics.recoveryMultiplier) <= 3;
}
function validDraft(draft) {
  return draft?.version === 1
    && Array.isArray(draft.colliders)
    && draft.colliders.every((cell) => Number.isInteger(cell?.x) && Number.isInteger(cell?.y))
    && Array.isArray(draft.spawns) && draft.spawns.length > 0 && draft.spawns.every(validSpawn)
    && validPhysics(draft.playerPhysics);
}

export function loadCachedEditorDraft(storage = typeof localStorage === 'undefined' ? null : localStorage) {
  try {
    const raw = storage?.getItem(EDITOR_DRAFT_CACHE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    return validDraft(draft) ? clone(draft) : null;
  } catch {
    return null;
  }
}

export function applyEditorDraftToLevel(level, draft) {
  if (!level || !validDraft(draft)) return level;
  const colliders = [...new Map(draft.colliders.map((cell) => [`${cell.x}:${cell.y}`, { x: cell.x, y: cell.y }])).values()];
  const next = { ...level, colliders, spawns: draft.spawns.map((spawn) => ({ ...spawn, x: Number(spawn.x), y: Number(spawn.y), gravity: Number(spawn.gravity), speedX: Number(spawn.speedX) })) };
  if (finite(draft.finishX)) next.finishX = Math.max(0, Number(draft.finishX));
  if (draft.elimination && finite(draft.elimination.leftMargin) && finite(draft.elimination.top) && finite(draft.elimination.bottom) && Number(draft.elimination.top) < Number(draft.elimination.bottom)) next.elimination = { leftMargin: Number(draft.elimination.leftMargin), top: Number(draft.elimination.top), bottom: Number(draft.elimination.bottom) };
  if (draft.playerPhysics) next.playerPhysics = { ...draft.playerPhysics, hitboxWidth: Number(draft.playerPhysics.hitboxWidth), hitboxHeight: Number(draft.playerPhysics.hitboxHeight), gravityMultiplier: Number(draft.playerPhysics.gravityMultiplier), recoveryMultiplier: Number(draft.playerPhysics.recoveryMultiplier) };
  return next;
}
