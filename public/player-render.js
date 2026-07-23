import { PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH } from './player-animation.js';

export function drawPlayerSprite(ctx, sprite, source, player, drawSize = {}) {
  const scale = Number.isFinite(Number(player.sizeScale)) && Number(player.sizeScale) > 0 ? Number(player.sizeScale) : 1;
  const baseWidth = Number(drawSize.width) || PLAYER_FRAME_WIDTH;
  const baseHeight = Number(drawSize.height) || PLAYER_FRAME_HEIGHT;
  const width = baseWidth * scale;
  const height = baseHeight * scale;
  const centreX = player.x + PLAYER_FRAME_WIDTH / 2;
  const centreY = player.y + PLAYER_FRAME_HEIGHT / 2;
  if (player.gravity < 0) {
    ctx.save();
    ctx.translate(centreX, centreY);
    // In the original SwitchGravity(), angle becomes 180° *and* facing changes
    // from LEFT to RIGHT. The two sprite transforms compose to a vertical flip.
    ctx.scale(1, -1);
    ctx.drawImage(sprite, source.x, source.y, source.width, source.height, -width / 2, -height / 2, width, height);
    ctx.restore();
    return;
  }
  ctx.drawImage(sprite, source.x, source.y, source.width, source.height, centreX - width / 2, centreY - height / 2, width, height);
}
