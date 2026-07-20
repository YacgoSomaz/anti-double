export const PLAYER_FRAME_WIDTH = 65;
export const PLAYER_FRAME_HEIGHT = 77;
// Player.loadGraphic() in the original SWF splits the 975 × 693 atlas into
// 65 × 77 frames.  That is 15 columns by 9 rows; the earlier 75 × 63 crop
// crossed frame boundaries and made the running animation appear torn.
export const PLAYER_ATLAS_COLUMNS = 15;
export const PLAYER_ATLAS_FRAME_WIDTH = PLAYER_FRAME_WIDTH;
export const PLAYER_ATLAS_FRAME_HEIGHT = PLAYER_FRAME_HEIGHT;
const RUN_FRAMES = Array.from({ length: 13 }, (_, index) => index);
const FALL_FRAMES = [19, 20, 21, 22, 13, 14, 15, 16, 17, 18];

export function animationFrame(milliseconds, airborne = false) {
  const frames = airborne ? FALL_FRAMES : RUN_FRAMES;
  const frameDuration = airborne ? 1000 / 12 : 1000 / 20;
  return frames[Math.floor(milliseconds / frameDuration) % frames.length];
}

export function frameSourceRect(frame) {
  return {
    x: (frame % PLAYER_ATLAS_COLUMNS) * PLAYER_ATLAS_FRAME_WIDTH,
    y: Math.floor(frame / PLAYER_ATLAS_COLUMNS) * PLAYER_ATLAS_FRAME_HEIGHT,
    width: PLAYER_ATLAS_FRAME_WIDTH,
    height: PLAYER_ATLAS_FRAME_HEIGHT,
  };
}
