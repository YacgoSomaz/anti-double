export const VISUAL_SCALE = 0.641509;
export const STAGE_BOTTOM = 425;
export const VISUAL_Y_OFFSET = 36;

const round = (value) => Math.round(value * 1000) / 1000;

export function projectVisual(visual, asset = {}) {
  const scaleX = Number(visual.scaleX ?? 1);
  const scaleY = Number(visual.scaleY ?? 1);
  return {
    x: round(Number(visual.posX) * VISUAL_SCALE),
    y: round(STAGE_BOTTOM - Number(visual.posY) * VISUAL_SCALE + VISUAL_Y_OFFSET),
    ...(visual.scaleX === undefined ? {} : { scaleX }),
    ...(visual.scaleY === undefined ? {} : { scaleY }),
    ...(visual.scaleX === undefined ? {} : { offsetX: round((Number(asset.width ?? 0) * (1 - scaleX)) / 2) }),
    ...(visual.scaleY === undefined ? {} : { offsetY: round((Number(asset.height ?? 0) * (1 - scaleY)) / 2) }),
  };
}
