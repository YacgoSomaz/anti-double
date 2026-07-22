export const EDITOR_DRAFT_CACHE_KEY = 'gswitch.editor.draft.v1';

export function saveEditorDraftCache(storage, draft) {
  try { storage?.setItem(EDITOR_DRAFT_CACHE_KEY, JSON.stringify(draft)); } catch { /* private mode or quota exhaustion: the editor remains usable */ }
}

export function loadEditorDraftCache(storage, parser = JSON.parse) {
  try {
    const raw = storage?.getItem(EDITOR_DRAFT_CACHE_KEY);
    if (!raw) return null;
    return parser(raw);
  } catch {
    clearEditorDraftCache(storage);
    return null;
  }
}

export function clearEditorDraftCache(storage) {
  try { storage?.removeItem(EDITOR_DRAFT_CACHE_KEY); } catch { /* ignore unavailable storage */ }
}
