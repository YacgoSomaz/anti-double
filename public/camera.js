export const DEFAULT_SCROLL_SPEED = 211.6983;
export const CAMERA_PREDICTION_WINDOW_MS = 250;

// The multiplayer server owns the shared camera runner.  The client may only
// interpolate that authoritative position briefly between snapshots; deriving
// camera position from a local player makes the view drift away from the race.
export function advanceCamera(cameraX, elapsedMs, cameraSpeed = DEFAULT_SCROLL_SPEED) {
  const current = Math.max(0, Number(cameraX) || 0);
  const elapsed = Math.min(CAMERA_PREDICTION_WINDOW_MS, Math.max(0, Number(elapsedMs) || 0)) / 1000;
  const speed = Math.max(0, Number(cameraSpeed) || 0);
  return Math.round((current + speed * elapsed) * 1000) / 1000;
}

// The course camera is monotonic during an active race.  A packet can arrive
// after the locally presented camera has already bridged the previous packet's
// gap, so accepting its older coordinate would visibly pull the world back.
export function reconcileCamera(authoritativeCameraX, presentedCameraX) {
  return Math.max(0, Number(authoritativeCameraX) || 0, Number(presentedCameraX) || 0);
}
