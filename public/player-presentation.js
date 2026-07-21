import { CAMERA_PREDICTION_WINDOW_MS } from './camera.js';

const CORRECTION_RATE_PER_SECOND = 10;

export function presentationOffset(presented, authoritative) {
  return {
    x: (Number(presented?.x) || 0) - (Number(authoritative?.x) || 0),
    y: (Number(presented?.y) || 0) - (Number(authoritative?.y) || 0)
  };
}

// Network snapshots replace physics truth, but never the pixels directly.
// Retain the old predicted position at receipt, then exponentially converge to
// the new authority while the runner keeps moving at display rate.
export function advancePresentation(player, elapsedMs) {
  const elapsed = Math.min(CAMERA_PREDICTION_WINDOW_MS, Math.max(0, Number(elapsedMs) || 0)) / 1000;
  const correction = Math.exp(-CORRECTION_RATE_PER_SECOND * elapsed);
  const offsetX = Number(player?.presentationOffsetX) || 0;
  const offsetY = Number(player?.presentationOffsetY) || 0;
  return {
    x: (Number(player?.x) || 0) + (player?.blockedX ? 0 : (Number(player?.vx) || 0) * elapsed) + offsetX * correction,
    y: (Number(player?.y) || 0) + (Number(player?.vy) || 0) * elapsed + offsetY * correction
  };
}
