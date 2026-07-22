export const EDITOR_PLAYER_HITBOX = Object.freeze({ width: 37, height: 48, offsetX: 16, normalOffsetY: 19, invertedOffsetY: 9 });

export function hitboxForPlayer(player, dimensions = EDITOR_PLAYER_HITBOX) {
  const offsetY = Number(player?.gravity) < 0 ? dimensions.invertedOffsetY : dimensions.normalOffsetY;
  const left = Number(player?.x) + dimensions.offsetX;
  const top = Number(player?.y) + offsetY;
  return { left, top, right: left + dimensions.width, bottom: top + dimensions.height, width: dimensions.width, height: dimensions.height };
}

export function contactsForPlayer(player, colliders = [], world = { cellSize: 34, originY: 425 }, dimensions = EDITOR_PLAYER_HITBOX) {
  const box = hitboxForPlayer(player, dimensions);
  return colliders.flatMap((cell) => {
    const left = Number(cell.x) * world.cellSize;
    const top = world.originY - Number(cell.y) * world.cellSize;
    const right = left + world.cellSize;
    const bottom = top + world.cellSize;
    if (box.right <= left || box.left >= right || box.bottom <= top || box.top >= bottom) return [];
    return [{ x: cell.x, y: cell.y, type: 'overlap' }];
  });
}

export function playerContactsForPlayer(player, players = [], dimensions = EDITOR_PLAYER_HITBOX) {
  const box = hitboxForPlayer(player, dimensions);
  return players.flatMap((other) => {
    if (!other || other.slot === player?.slot) return [];
    const candidate = hitboxForPlayer(other, dimensions);
    if (box.right <= candidate.left || box.left >= candidate.right || box.bottom <= candidate.top || box.top >= candidate.bottom) return [];
    return [{ slot: other.slot, type: 'player-overlap' }];
  });
}

export function predictTrajectory(player, { steps = 32, dt = 1 / 40, gravityAcceleration = 30000, maxVerticalSpeed = 320.755 } = {}) {
  const count = Math.max(0, Math.min(240, Math.floor(Number(steps) || 0)));
  const delta = Math.max(0, Math.min(0.1, Number(dt) || 1 / 40));
  const gravity = Number(player?.gravity) < 0 ? -1 : 1;
  let x = Number(player?.x) || 0;
  let y = Number(player?.y) || 0;
  let vx = Number(player?.vx) || 0;
  let vy = Number(player?.vy) || 0;
  const points = [{ x, y }];
  for (let index = 0; index < count; index += 1) {
    vy = Math.max(-maxVerticalSpeed, Math.min(maxVerticalSpeed, vy + gravity * gravityAcceleration * delta));
    x += vx * delta;
    y += vy * delta;
    points.push({ x, y });
  }
  return points;
}
