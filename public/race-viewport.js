// Keep the canvas dimensions compatible with the recovered Flash stage while
// showing 10% more of the race world in both directions.
export const RACE_VIEW_SCALE = 1 / 1.1;
// Background art was authored to reach the lower edge of the 640×501 stage.
// Counter-scale it inside the zoomed race transform so it keeps covering that
// edge instead of exposing the canvas fill beneath the city skyline.
export const RACE_BACKDROP_SCALE = 1 / RACE_VIEW_SCALE;

export function worldViewportBounds({ cameraX, width, height }) {
  const worldWidth = width / RACE_VIEW_SCALE;
  const worldHeight = height / RACE_VIEW_SCALE;
  const horizontalMargin = (worldWidth - width) / 2;
  const verticalMargin = (worldHeight - height) / 2;
  return {
    left: cameraX - horizontalMargin,
    right: cameraX + width + horizontalMargin,
    top: -verticalMargin,
    bottom: height + verticalMargin,
    width: worldWidth,
    height: worldHeight
  };
}

export function applyRaceViewport(ctx, width, height) {
  ctx.translate(width / 2, height / 2);
  ctx.scale(RACE_VIEW_SCALE, RACE_VIEW_SCALE);
  ctx.translate(-width / 2, -height / 2);
}
