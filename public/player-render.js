import { PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH } from './player-animation.js';

const DEFAULT_HITBOX_WIDTH = 37;
const DEFAULT_HITBOX_HEIGHT = 48;
const DEFAULT_HITBOX_OFFSET_X = 16;
const NORMAL_HITBOX_OFFSET_Y = 19;
const INVERTED_HITBOX_OFFSET_Y = 9;

function sharedHitbox(player) {
  const scale = Number.isFinite(Number(player.sizeScale)) && Number(player.sizeScale) > 0 ? Number(player.sizeScale) : 1;
  // A full solo snapshot contains its actual editor-tuned hitbox. Compact
  // multiplayer packets deliberately omit it, so rebuild the shared default
  // body from sizeScale instead of trusting stale packet-era dimensions.
  if (scale === 1 && player.hitbox) {
    return {
      left: player.x + player.hitbox.offsetX,
      top: player.y + player.hitbox.offsetY,
      width: player.hitbox.width,
      height: player.hitbox.height
    };
  }
  const width = Math.max(14, Math.round(DEFAULT_HITBOX_WIDTH * scale));
  const height = Math.max(18, Math.round(DEFAULT_HITBOX_HEIGHT * scale));
  const offsetX = DEFAULT_HITBOX_OFFSET_X + (DEFAULT_HITBOX_WIDTH - width) / 2;
  const offsetY = (player.gravity < 0 ? INVERTED_HITBOX_OFFSET_Y : NORMAL_HITBOX_OFFSET_Y)
    + (DEFAULT_HITBOX_HEIGHT - height) / 2;
  return { left: player.x + offsetX, top: player.y + offsetY, width, height };
}

export function playerSpritePlacement(player, drawSize = {}) {
  const scale = Number.isFinite(Number(player.sizeScale)) && Number(player.sizeScale) > 0 ? Number(player.sizeScale) : 1;
  const baseWidth = Number(drawSize.width) || PLAYER_FRAME_WIDTH;
  const baseHeight = Number(drawSize.height) || PLAYER_FRAME_HEIGHT;
  const width = baseWidth * scale;
  const height = baseHeight * scale;
  if (!drawSize.collisionAligned) return { x: player.x + (PLAYER_FRAME_WIDTH - width) / 2, y: player.y + (PLAYER_FRAME_HEIGHT - height) / 2, width, height };

  const hitbox = sharedHitbox(player);
  const footY = Math.max(0, Math.min(PLAYER_FRAME_HEIGHT, Number(drawSize.footY) || 67));
  const scaleY = height / PLAYER_FRAME_HEIGHT;
  const x = hitbox.left + hitbox.width / 2 - width / 2;
  const y = player.gravity < 0
    ? hitbox.top - (PLAYER_FRAME_HEIGHT - footY) * scaleY
    : hitbox.top + hitbox.height - footY * scaleY;
  return { x, y, width, height };
}

export function drawPlayerSprite(ctx, sprite, source, player, drawSize = {}) {
  const placement = playerSpritePlacement(player, drawSize);
  if (player.gravity < 0) {
    ctx.save();
    ctx.translate(placement.x + placement.width / 2, placement.y + placement.height / 2);
    // In the original SwitchGravity(), angle becomes 180° *and* facing changes
    // from LEFT to RIGHT. The two sprite transforms compose to a vertical flip.
    ctx.scale(1, -1);
    ctx.drawImage(sprite, source.x, source.y, source.width, source.height, -placement.width / 2, -placement.height / 2, placement.width, placement.height);
    ctx.restore();
    return;
  }
  ctx.drawImage(sprite, source.x, source.y, source.width, source.height, placement.x, placement.y, placement.width, placement.height);
}
