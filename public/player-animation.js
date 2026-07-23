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

const ORIGINAL_PLAYER_VISUAL = Object.freeze({
  asset: 'player-blue.png',
  fallbackAsset: 'player-blue.png',
  columns: PLAYER_ATLAS_COLUMNS,
  rows: 9,
  cellWidth: PLAYER_FRAME_WIDTH,
  cellHeight: PLAYER_FRAME_HEIGHT,
  cropX: 0,
  cropY: 0,
  cropWidth: PLAYER_FRAME_WIDTH,
  cropHeight: PLAYER_FRAME_HEIGHT,
  drawSize: Object.freeze({ width: PLAYER_FRAME_WIDTH, height: PLAYER_FRAME_HEIGHT }),
  runFrames: RUN_FRAMES,
  airFrames: FALL_FRAMES,
  framesPerSecond: 20,
  airFramesPerSecond: 12,
  supportsMorph: true
});

const DEMON_A_VISUAL = Object.freeze({
  asset: 'player-demon-a.png',
  fallbackAsset: 'player-blue.png',
  columns: 8,
  rows: 1,
  // The licensed 100 × 100 source cells are pre-cropped and nearest-neighbour
  // scaled into this 8 × 65 × 77 local atlas. Drawing it 1:1 avoids browser
  // interpolation blur while keeping the shared collision profile untouched.
  cellWidth: PLAYER_FRAME_WIDTH,
  cellHeight: PLAYER_FRAME_HEIGHT,
  cropX: 0,
  cropY: 0,
  cropWidth: PLAYER_FRAME_WIDTH,
  cropHeight: PLAYER_FRAME_HEIGHT,
  drawSize: Object.freeze({ width: PLAYER_FRAME_WIDTH, height: PLAYER_FRAME_HEIGHT }),
  runFrames: Object.freeze(Array.from({ length: 8 }, (_, index) => index)),
  airFrames: Object.freeze(Array.from({ length: 8 }, (_, index) => index)),
  framesPerSecond: 12,
  airFramesPerSecond: 12,
  supportsMorph: false
});

const BLACK_KNIGHT_VISUAL = Object.freeze({
  asset: 'player-black-knight.png',
  fallbackAsset: 'player-blue.png',
  columns: 6,
  rows: 1,
  // `build-mounted-demon-skin.py` removes the supplied green screen and packs
  // the six original poses into these fixed-size, pixel-perfect source cells.
  cellWidth: PLAYER_FRAME_WIDTH,
  cellHeight: PLAYER_FRAME_HEIGHT,
  cropX: 0,
  cropY: 0,
  cropWidth: PLAYER_FRAME_WIDTH,
  cropHeight: PLAYER_FRAME_HEIGHT,
  drawSize: Object.freeze({ width: PLAYER_FRAME_WIDTH, height: PLAYER_FRAME_HEIGHT }),
  runFrames: Object.freeze(Array.from({ length: 6 }, (_, index) => index)),
  airFrames: Object.freeze(Array.from({ length: 6 }, (_, index) => index)),
  framesPerSecond: 12,
  airFramesPerSecond: 12,
  supportsMorph: false
});

function stripVisual(asset, frameCount, framesPerSecond = 12) {
  return Object.freeze({
    asset,
    fallbackAsset: 'player-blue.png',
    columns: frameCount,
    rows: 1,
    cellWidth: PLAYER_FRAME_WIDTH,
    cellHeight: PLAYER_FRAME_HEIGHT,
    cropX: 0,
    cropY: 0,
    cropWidth: PLAYER_FRAME_WIDTH,
    cropHeight: PLAYER_FRAME_HEIGHT,
    drawSize: Object.freeze({ width: PLAYER_FRAME_WIDTH, height: PLAYER_FRAME_HEIGHT }),
    runFrames: Object.freeze(Array.from({ length: frameCount }, (_, index) => index)),
    airFrames: Object.freeze(Array.from({ length: frameCount }, (_, index) => index)),
    framesPerSecond,
    airFramesPerSecond: framesPerSecond,
    supportsMorph: false
  });
}

const VIOLET_WARRIOR_VISUAL = stripVisual('player-violet-warrior.png', 10);
const SHADOW_RUNNER_VISUAL = stripVisual('player-shadow-runner.png', 8);

const LEGACY_PLAYER_VISUALS = Object.freeze([
  ORIGINAL_PLAYER_VISUAL,
  Object.freeze({ ...ORIGINAL_PLAYER_VISUAL, asset: 'player-green.png', fallbackAsset: 'player-green.png' }),
  Object.freeze({ ...ORIGINAL_PLAYER_VISUAL, asset: 'player-yellow.png', fallbackAsset: 'player-yellow.png' }),
  Object.freeze({ ...ORIGINAL_PLAYER_VISUAL, asset: 'player-red.png', fallbackAsset: 'player-red.png' })
]);

const PLAYER_VISUALS_BY_SKIN = Object.freeze({
  'black-knight': BLACK_KNIGHT_VISUAL,
  'demon-a': DEMON_A_VISUAL,
  'violet-warrior': VIOLET_WARRIOR_VISUAL,
  'shadow-runner': SHADOW_RUNNER_VISUAL,
  blue: ORIGINAL_PLAYER_VISUAL,
  green: LEGACY_PLAYER_VISUALS[1],
  yellow: LEGACY_PLAYER_VISUALS[2],
  red: LEGACY_PLAYER_VISUALS[3]
});

export const PLAYER_VISUALS = Object.freeze([
  BLACK_KNIGHT_VISUAL,
  DEMON_A_VISUAL,
  VIOLET_WARRIOR_VISUAL,
  SHADOW_RUNNER_VISUAL,
  ...LEGACY_PLAYER_VISUALS.slice(1)
]);

export function playerVisualForSlot(slot = 1) {
  return playerVisualForSkin(defaultSkinForSlot(slot), slot);
}

export function playerVisualForSkin(skinId, slot = 1) {
  const selected = skinById(skinId)?.id ?? defaultSkinForSlot(slot);
  return PLAYER_VISUALS_BY_SKIN[selected] ?? PLAYER_VISUALS[0];
}

export function animationFrameForVisual(visual, milliseconds, airborne = false) {
  const sequence = airborne ? visual.airFrames : visual.runFrames;
  const framesPerSecond = airborne ? visual.airFramesPerSecond : visual.framesPerSecond;
  const index = Math.floor(Math.max(0, Number(milliseconds) || 0) / (1000 / framesPerSecond)) % sequence.length;
  return sequence[index];
}

export function frameSourceRectForVisual(visual, frame) {
  const maxFrame = visual.columns * visual.rows - 1;
  const safeFrame = Math.max(0, Math.min(maxFrame, Number.isInteger(frame) ? frame : 0));
  return {
    x: (safeFrame % visual.columns) * visual.cellWidth + visual.cropX,
    y: Math.floor(safeFrame / visual.columns) * visual.cellHeight + visual.cropY,
    width: visual.cropWidth,
    height: visual.cropHeight,
  };
}

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
  return animationFrameForVisual(ORIGINAL_PLAYER_VISUAL, milliseconds, airborne);
}

export function morphFrame(milliseconds) {
  const index = Math.min(MORPH_FRAMES.length - 1, Math.max(0, Math.floor(milliseconds / (1000 / 20))));
  return MORPH_FRAMES[index];
}

export function frameSourceRect(frame) {
  return frameSourceRectForVisual(ORIGINAL_PLAYER_VISUAL, frame);
}
import { defaultSkinForSlot, skinById } from './skin-library.js';
