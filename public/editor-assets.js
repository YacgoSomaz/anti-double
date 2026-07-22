function cellKey(cell) { return `${cell.x}:${cell.y}`; }

export function uniqueVisualAssets(visuals = []) {
  const seen = new Set();
  return visuals.filter((visual) => {
    if (!visual?.assetFile || seen.has(visual.assetFile)) return false;
    seen.add(visual.assetFile); return true;
  }).map((visual) => ({
    assetFile: visual.assetFile,
    imageId: visual.imageId,
    width: Number(visual.width) || 34,
    height: Number(visual.height) || 34
  }));
}

export function removeSelectedObjects(draft, { collisionKeys = [], visualIndices = [] } = {}) {
  const next = structuredClone(draft);
  const keys = new Set(collisionKeys);
  const indices = new Set(visualIndices);
  next.colliders = (next.colliders ?? []).filter((cell) => !keys.has(cellKey(cell)));
  next.visuals = (next.visuals ?? []).filter((_, index) => !indices.has(index));
  return next;
}

export function addVisual(draft, asset, position) {
  const next = structuredClone(draft);
  next.visuals ??= [];
  next.visuals.push({
    id: `editor:visual:${next.visuals.length}`,
    assetFile: asset.assetFile,
    imageId: asset.imageId,
    width: Number(asset.width) || 34,
    height: Number(asset.height) || 34,
    x: Number(position.x) || 0,
    y: Number(position.y) || 0
  });
  return next;
}
