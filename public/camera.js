export const DEFAULT_SCROLL_SPEED = 211.6983;

export function advanceCamera(cameraX, elapsedMs, localPlayer, viewportWidth = 640) {
  const current = Math.max(0, Number(cameraX) || 0);
  if (!localPlayer) return current;

  const elapsed = Math.min(50, Math.max(0, Number(elapsedMs) || 0)) / 1000;
  const speed = Math.max(0, Number(localPlayer.speedX) || DEFAULT_SCROLL_SPEED);
  const coursePosition = current + speed * elapsed;
  const playerPosition = Math.max(0, (Number(localPlayer.x) || 0) - viewportWidth / 2);
  return Math.round(Math.max(coursePosition, playerPosition) * 1000) / 1000;
}
