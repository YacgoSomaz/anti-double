/**
 * Resolve the editor canvas gesture before touching the draft. Keeping this
 * decision pure makes it possible to verify that a normal click never edits
 * collision data unless the user explicitly chose a paint/erase tool.
 */
export function resolveEditorGesture({ activeLayer = 'collision', tool = 'select', button = 0, visualHit = -1 } = {}) {
  if (button === 1 || button === 2) return { type: 'pan' };
  if (button !== 0) return { type: 'none' };
  if (activeLayer === 'visual') return visualHit >= 0 ? { type: 'drag-visual', index: visualHit } : { type: 'pan' };
  if (activeLayer === 'collision' && (tool === 'paint' || tool === 'erase')) return { type: 'paint-collision', brush: tool };
  if (activeLayer === 'spawn') return { type: 'select-spawn' };
  return { type: 'select-cell' };
}
