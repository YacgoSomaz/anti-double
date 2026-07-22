function key(cell) { return `${cell.x}:${cell.y}`; }

export function createDraftDiff(base, current) {
  const previous = new Map((base?.colliders ?? []).map((cell) => [key(cell), cell]));
  const next = new Map((current?.colliders ?? []).map((cell) => [key(cell), cell]));
  return {
    version: 1,
    addedColliders: [...next].filter(([cellKey]) => !previous.has(cellKey)).map(([, cell]) => ({ ...cell })),
    removedColliders: [...previous].filter(([cellKey]) => !next.has(cellKey)).map(([, cell]) => ({ ...cell })),
    spawnsChanged: JSON.stringify(base?.spawns ?? []) !== JSON.stringify(current?.spawns ?? []),
    finishChanged: Number(base?.finishX) !== Number(current?.finishX),
    visualsChanged: JSON.stringify(base?.visuals ?? []) !== JSON.stringify(current?.visuals ?? []),
    fromSource: base?.source ?? 'marathon'
  };
}

export function validateDraftDiff(diff) {
  const errors = [];
  if (!diff || diff.version !== 1) errors.push('diff 版本无效');
  for (const field of ['addedColliders', 'removedColliders']) {
    if (!Array.isArray(diff?.[field]) || diff[field].length > 50000) errors.push(`${field} 数量无效`);
    else if (diff[field].some((cell) => !Number.isInteger(cell?.x) || !Number.isInteger(cell?.y))) errors.push(`${field} 坐标无效`);
  }
  return { valid: errors.length === 0, errors };
}
