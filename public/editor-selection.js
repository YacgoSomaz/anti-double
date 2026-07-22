export function resolveEditorShortcut({ key = '', ctrlKey = false, metaKey = false, shiftKey = false } = {}) {
  if (!ctrlKey && !metaKey) return null;
  const normalized = String(key).toLowerCase();
  if (normalized === 'z') return shiftKey ? 'redo' : 'undo';
  if (normalized === 'y') return 'redo';
  if (normalized === 'c') return 'copy';
  if (normalized === 'v') return 'paste';
  if (normalized === 's') return 'save';
  return null;
}

export function toggleSelection(indices, index, additive = false) {
  const next = additive ? new Set(indices) : new Set();
  if (additive && next.has(index)) next.delete(index);
  else next.add(index);
  return [...next].sort((left, right) => left - right);
}

export function preserveSelectionOnDrag(indices, index, additive = false) {
  return !additive && indices.length > 1 && indices.includes(index);
}
