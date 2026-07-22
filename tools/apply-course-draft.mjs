import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const draftPath = process.argv[2];
if (!draftPath) throw new Error('用法：node tools/apply-course-draft.mjs <gswitch-course-draft.json>');

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const draft = JSON.parse(readFileSync(resolve(draftPath), 'utf8'));
const cellSize = Number(draft.world?.cellSize ?? 34);
const visualScale = 0.641509;
const stageBottom = 425;
const visualYOffset = 36;
const mapIds = [...new Set(draft.segments.map((segment) => segment.id))];

function round(value) {
  return Math.round(Number(value) * 1_000_000) / 1_000_000;
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value)}\n`);
}

function segmentFor(id) {
  const index = draft.segments.findIndex((segment) => segment.id === id);
  if (index < 0) throw new Error(`草稿缺少 ${id} 分段`);
  return { index, segment: draft.segments[index] };
}

function firstCycleVisuals(id, startX) {
  return (draft.visuals ?? [])
    .filter((item) => item.id?.startsWith(`${id}:`) && item.id?.endsWith(`:${startX}`));
}

function cellKey(cell) {
  return `${cell.x}:${cell.y}`;
}

function filteredFirstCycleCells(colliders, opensPreviousSeam) {
  const fullHeightWalls = new Set(
    [...new Set(colliders.map((cell) => cell.x))].filter((x) =>
      Array.from({ length: 11 }, (_, index) => index + 1)
        .every((y) => colliders.some((cell) => cell.x === x && cell.y === y))
    )
  );
  return colliders.filter((cell) => !(cell.y >= 1 && cell.y <= 11
    && ((opensPreviousSeam && cell.x === 0) || (cell.x > 0 && fullHeightWalls.has(cell.x)))));
}

for (const id of mapIds) {
  const { index, segment } = segmentFor(id);
  const offsetCells = segment.startX / cellSize;
  const endCells = segment.endX / cellSize;
  const targetCells = draft.colliders
    .filter((cell) => cell.x >= offsetCells && cell.x < endCells)
    .map((cell) => ({ x: cell.x - offsetCells, y: cell.y }));
  const levelPath = resolve(root, 'src/data', `${id}.json`);
  const level = JSON.parse(readFileSync(levelPath, 'utf8'));
  const targetKeys = new Set(targetCells.map(cellKey));
  const generatedKeys = new Set(filteredFirstCycleCells(level.colliders, index > 0).map(cellKey));
  const addedKeys = [...targetKeys].filter((key) => !generatedKeys.has(key));
  const removedKeys = [...generatedKeys].filter((key) => !targetKeys.has(key));
  const nextColliders = level.colliders.filter((cell) => !removedKeys.includes(cellKey(cell)));
  const existingKeys = new Set(nextColliders.map(cellKey));
  for (const key of addedKeys) {
    const [x, y] = key.split(':').map(Number);
    if (!existingKeys.has(key)) nextColliders.push({ x, y });
  }
  level.colliders = nextColliders;
  writeJson(levelPath, level);

  const visualPath = resolve(root, 'public/data', `${id}-visual.json`);
  const visualMap = JSON.parse(readFileSync(visualPath, 'utf8'));
  const draftItems = firstCycleVisuals(id, segment.startX);
  for (const property of ['visualInfo', 'frontVisualInfo']) {
    const source = visualMap[property] ?? [];
    const next = [];
    const usedSourceIndices = new Map();
    for (const edited of draftItems.filter((item) => item.layer === property)) {
      const match = edited.id?.match(/^mp\d+:(visualInfo|frontVisualInfo):(\d+):/);
      const sourceIndex = match?.[1] === property ? Number(match[2]) : -1;
      const original = source[sourceIndex];
      const occurrence = usedSourceIndices.get(sourceIndex) ?? 0;
      if (original) usedSourceIndices.set(sourceIndex, occurrence + 1);
      const nextItem = original ? { ...original } : { imageId: edited.imageId, depth: source.length + next.length };
      const asset = visualMap.assets?.[original?.imageId ?? edited.imageId] ?? {};
      const scaleX = Number(original?.scaleX ?? 1);
      const scaleY = Number(original?.scaleY ?? 1);
      const expectedWidth = Number(asset.width ?? 0) * scaleX;
      const expectedHeight = Number(asset.height ?? 0) * scaleY;
      if (Math.abs(Number(edited.width) - expectedWidth) > 0.01 || Math.abs(Number(edited.height) - expectedHeight) > 0.01) {
        if (asset.width) nextItem.scaleX = round(Number(edited.width) / Number(asset.width));
        if (asset.height) nextItem.scaleY = round(Number(edited.height) / Number(asset.height));
      }
      const editedScaleX = Number(nextItem.scaleX ?? 1);
      const editedScaleY = Number(nextItem.scaleY ?? 1);
      nextItem.posX = round((Number(edited.x) - segment.startX) / visualScale);
      nextItem.posY = round((stageBottom + visualYOffset - Number(edited.y)) / visualScale);
      if (editedScaleX !== 1) nextItem.scaleX = round(editedScaleX);
      if (editedScaleY !== 1) nextItem.scaleY = round(editedScaleY);
      next.push(nextItem);
    }
    visualMap[property] = next;
  }
  writeJson(visualPath, visualMap);
  console.log(`${id}: +${addedKeys.length}/-${removedKeys.length} collision edits, ${visualMap.visualInfo.length + visualMap.frontVisualInfo.length} visuals`);
}
