export const PLAYER_FRAME_WIDTH = 65;
export const PLAYER_FRAME_HEIGHT = 77;
export const PLAYER_ATLAS_COLUMNS = 15;
const RUN_FRAMES = Array.from({ length: 13 }, (_, index) => index);
const FALL_FRAMES = [19, 20, 21, 22, 13, 14, 15, 16, 17, 18];

export function animationFrame(milliseconds, airborne = false) {
  const frames = airborne ? FALL_FRAMES : RUN_FRAMES;
  const frameDuration = airborne ? 1000 / 12 : 1000 / 20;
  return frames[Math.floor(milliseconds / frameDuration) % frames.length];
}

export function frameSourceRect(frame) {
  return {
    x: (frame % PLAYER_ATLAS_COLUMNS) * PLAYER_FRAME_WIDTH,
    y: Math.floor(frame / PLAYER_ATLAS_COLUMNS) * PLAYER_FRAME_HEIGHT,
    width: PLAYER_FRAME_WIDTH,
    height: PLAYER_FRAME_HEIGHT,
  };
}
