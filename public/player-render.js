import { PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH } from './player-animation.js';

export function drawPlayerSprite(ctx, sprite, source, player) {
  if (player.gravity < 0) {
    ctx.save();
    ctx.translate(player.x + PLAYER_FRAME_WIDTH / 2, player.y + PLAYER_FRAME_HEIGHT / 2);
    ctx.scale(1, -1);
    ctx.drawImage(sprite, source.x, source.y, source.width, source.height, -PLAYER_FRAME_WIDTH / 2, -PLAYER_FRAME_HEIGHT / 2, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT);
    ctx.restore();
    return;
  }
  ctx.drawImage(sprite, source.x, source.y, source.width, source.height, player.x, player.y, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT);
}
