import { CAMERA_ACCELERATION, CAMERA_PREDICTION_WINDOW_MS, MAX_CAMERA_SPEED } from './camera.js';

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
export function advancePresentation(player, elapsedMs, cameraSpeed) {
  const elapsed = Math.min(CAMERA_PREDICTION_WINDOW_MS, Math.max(0, Number(elapsedMs) || 0)) / 1000;
  const correction = Math.exp(-CORRECTION_RATE_PER_SECOND * elapsed);
  const offsetX = Number(player?.presentationOffsetX) || 0;
  const offsetY = Number(player?.presentationOffsetY) || 0;
  const velocityX = Number(player?.vx) || 0;
  const sharedCameraSpeed = Math.max(0, Number(cameraSpeed) || 0);
  // A runner locked to the shared camera also inherits its acceleration on
  // the server. Applying that same curve locally prevents the camera from
  // visibly walking away during a delayed state packet.
  const followsSharedCamera = !player?.blockedX && sharedCameraSpeed > 0 && Math.abs(velocityX - sharedCameraSpeed) < 0.1;
  const timeToCap = followsSharedCamera ? Math.max(0, (MAX_CAMERA_SPEED - velocityX) / CAMERA_ACCELERATION) : 0;
  const acceleratingSeconds = followsSharedCamera ? Math.min(elapsed, timeToCap) : 0;
  const cappedSeconds = followsSharedCamera ? Math.max(0, elapsed - acceleratingSeconds) : 0;
  const horizontalDistance = followsSharedCamera
    ? velocityX * acceleratingSeconds + (CAMERA_ACCELERATION * acceleratingSeconds ** 2) / 2 + MAX_CAMERA_SPEED * cappedSeconds
    : velocityX * elapsed;
  return {
    x: (Number(player?.x) || 0) + (player?.blockedX ? 0 : horizontalDistance) + offsetX * correction,
    y: (Number(player?.y) || 0) + (Number(player?.vy) || 0) * elapsed + offsetY * correction
  };
}
