const DEFAULT_START_SPEED = 212;
const MIN_ANIMATION_RATE = 0.45;
const MAX_RENDER_DELTA_MS = 100;

export function playerAnimationRate(player = {}, cameraSpeed = 0) {
  const startSpeed = Math.max(1, Number(player.startSpeedX) || DEFAULT_START_SPEED);
  const currentSpeed = Math.max(
    0,
    Math.abs(Number(player.vx) || 0),
    Math.abs(Number(cameraSpeed) || 0)
  );
  return Math.max(MIN_ANIMATION_RATE, currentSpeed / startSpeed);
}

// Animation is cosmetic and rendered locally.  Accumulating only the elapsed
// frame time avoids the visible frame jump caused by multiplying an absolute
// clock by a speed that changes during the race.
export function advancePlayerAnimationClock(clocks, slot, now, rate = 1) {
  const key = String(slot);
  const timestamp = Math.max(0, Number(now) || 0);
  const multiplier = Math.max(MIN_ANIMATION_RATE, Number(rate) || 1);
  const previous = clocks.get(key);
  if (!previous || timestamp < previous.timestamp) {
    clocks.set(key, { timestamp, elapsed: 0 });
    return 0;
  }
  const elapsed = Math.min(MAX_RENDER_DELTA_MS, Math.max(0, timestamp - previous.timestamp));
  previous.timestamp = timestamp;
  previous.elapsed += elapsed * multiplier;
  return previous.elapsed;
}
