import { projectVisual } from './visual-projection.js';

function firstRecordAtOrAfter(records, x) {
  let low = 0;
  let high = records.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (records[middle].x < x) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function buildVisualDrawList(visualMap, property) {
  const records = [];
  let maxWidth = 0;
  for (const [sourceIndex, decoration] of (visualMap?.[property] ?? []).entries()) {
    const asset = visualMap.assets?.[decoration.imageId];
    if (!asset) continue;
    const placement = projectVisual(decoration, asset);
    const width = asset.width * (placement.scaleX ?? 1);
    const height = asset.height * (placement.scaleY ?? 1);
    records.push({
      asset,
      x: placement.x + (placement.offsetX ?? 0),
      y: placement.y + (placement.offsetY ?? 0),
      width,
      height,
      sourceIndex
    });
    maxWidth = Math.max(maxWidth, width);
  }
  records.sort((first, second) => first.x - second.x);
  return { records, maxWidth };
}

export function visibleDrawList(cache, left, right, top, bottom) {
  if (!cache?.records?.length) return [];
  const start = firstRecordAtOrAfter(cache.records, left - cache.maxWidth);
  const visible = [];
  for (let index = start; index < cache.records.length; index += 1) {
    const record = cache.records[index];
    if (record.x > right) break;
    if (record.x + record.width < left || record.y + record.height < top || record.y > bottom) continue;
    visible.push(record);
  }
  // `records` are x-sorted for the binary search above, but the extracted SWF
  // order is the visual layer order.  Restore it after culling so overlapping
  // walls and upper buildings are painted like the original scene.
  return visible.sort((first, second) => first.sourceIndex - second.sourceIndex);
}
