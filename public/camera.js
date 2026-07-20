export const DEFAULT_SCROLL_SPEED = 211.6983;

// The multiplayer server owns the shared camera runner.  The client may only
// interpolate that authoritative position briefly between snapshots; deriving
// camera position from a local player makes the view drift away from the race.
export function advanceCamera(cameraX, elapsedMs, cameraSpeed = DEFAULT_SCROLL_SPEED) {
  const current = Math.max(0, Number(cameraX) || 0);
  const elapsed = Math.min(50, Math.max(0, Number(elapsedMs) || 0)) / 1000;
  const speed = Math.max(0, Number(cameraSpeed) || 0);
  return Math.round((current + speed * elapsed) * 1000) / 1000;
}
