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
const MORPH_FRAMES = Array.from({ length: 22 }, (_, index) => index + 23);
export const MORPH_DURATION_MS = 1100;

const EDITABLE_ANIMATION_PRESETS = Object.freeze({
  run: Object.freeze({ sequence: RUN_FRAMES, speed: 20 }),
  flip: Object.freeze({ sequence: FALL_FRAMES, speed: 12 }),
  fall: Object.freeze({ sequence: FALL_FRAMES, speed: 12 }),
  spawn: Object.freeze({ sequence: MORPH_FRAMES, speed: 20 }),
  morph: Object.freeze({ sequence: MORPH_FRAMES, speed: 20 }),
  eliminate: Object.freeze({ sequence: [19, 20, 21, 22, 18, 17, 16], speed: 14 })
});

export function animationPreset(state = 'run') {
  const preset = EDITABLE_ANIMATION_PRESETS[state] ?? EDITABLE_ANIMATION_PRESETS.run;
  return { sequence: [...preset.sequence], speed: preset.speed };
}

export function animationFrameFromSequence(sequence, milliseconds, framesPerSecond = 20) {
  const frames = Array.isArray(sequence) && sequence.every((frame) => Number.isInteger(frame) && frame >= 0 && frame < PLAYER_ATLAS_COLUMNS * 9)
    ? sequence
    : [];
  if (!frames.length) return 0;
  const speed = Math.max(1, Number(framesPerSecond) || 20);
  const index = Math.floor(Math.max(0, Number(milliseconds) || 0) / (1000 / speed)) % frames.length;
  return frames[index];
}

export function animationFrame(milliseconds, airborne = false) {
  const frames = airborne ? FALL_FRAMES : RUN_FRAMES;
  const frameDuration = airborne ? 1000 / 12 : 1000 / 20;
  return frames[Math.floor(milliseconds / frameDuration) % frames.length];
}

export function morphFrame(milliseconds) {
  const index = Math.min(MORPH_FRAMES.length - 1, Math.max(0, Math.floor(milliseconds / (1000 / 20))));
  return MORPH_FRAMES[index];
}

export function frameSourceRect(frame) {
  return {
    x: (frame % PLAYER_ATLAS_COLUMNS) * PLAYER_ATLAS_FRAME_WIDTH,
    y: Math.floor(frame / PLAYER_ATLAS_COLUMNS) * PLAYER_ATLAS_FRAME_HEIGHT,
    width: PLAYER_ATLAS_FRAME_WIDTH,
    height: PLAYER_ATLAS_FRAME_HEIGHT,
  };
}
