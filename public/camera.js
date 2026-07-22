export const DEFAULT_SCROLL_SPEED = 211.6983;
// Match the server's softened 15% acceleration ramp so prediction never
// visibly outruns the authoritative camera.
export const CAMERA_ACCELERATION = 6.57916235;
export const MAX_CAMERA_SPEED = 769.812;
export const CAMERA_MAX_PREDICTION_LEAD_PX = 20;
// The browser owns presentation between packets. Three seconds absorbs a
// mobile-radio stall without making the screen freeze; the server remains the
// authority when the next state packet arrives.
export const CAMERA_PREDICTION_WINDOW_MS = 3000;

// The server owns race outcomes, but the browser integrates the recovered
// shared-camera curve locally at display rate.  Deriving it from a particular
// player would make clients disagree after a collision, so each packet remains
// the common correction point.
export function advanceCamera(cameraX, elapsedMs, cameraSpeed = DEFAULT_SCROLL_SPEED) {
  const current = Math.max(0, Number(cameraX) || 0);
  const elapsed = Math.min(CAMERA_PREDICTION_WINDOW_MS, Math.max(0, Number(elapsedMs) || 0)) / 1000;
  const speed = Math.max(0, Number(cameraSpeed) || 0);
  if (speed === 0) return current;
  const timeToCap = Math.max(0, (MAX_CAMERA_SPEED - speed) / CAMERA_ACCELERATION);
  const acceleratingSeconds = Math.min(elapsed, timeToCap);
  const cappedSeconds = Math.max(0, elapsed - acceleratingSeconds);
  const acceleratedDistance = speed * acceleratingSeconds + (CAMERA_ACCELERATION * acceleratingSeconds ** 2) / 2;
  return Math.round((current + acceleratedDistance + MAX_CAMERA_SPEED * cappedSeconds) * 1000) / 1000;
}

// The course camera normally moves monotonically, so small prediction lead is
// retained to avoid a visible pullback between packets.  A large difference is
// different: it means the authoritative camera was intentionally held (for
// example by a collision safety window), and keeping the local prediction
// would create a false, ever-moving centre line.
export function reconcileCamera(authoritativeCameraX, presentedCameraX) {
  const authoritative = Math.max(0, Number(authoritativeCameraX) || 0);
  const presented = Math.max(0, Number(presentedCameraX) || 0);
  if (presented - authoritative > CAMERA_MAX_PREDICTION_LEAD_PX) return authoritative;
  return Math.max(authoritative, presented);
}
