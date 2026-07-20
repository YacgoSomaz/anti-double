const PLAYER_WIDTH = 37;
const PLAYER_HEIGHT = 48;
const PLAYER_OFFSET_X = 16;
const NORMAL_PLAYER_OFFSET_Y = 19;
const INVERTED_PLAYER_OFFSET_Y = 9;
const FOOT_CONTACT_WIDTH = 28;
const FOOT_CONTACT_OFFSET_X = PLAYER_OFFSET_X + (PLAYER_WIDTH - FOOT_CONTACT_WIDTH) / 2;
const STAGE_TOP = -60;
const STAGE_BOTTOM = 500;
const GRAVITY = 30000;
const MAX_VERTICAL_SPEED = 320.755;
const MAX_STEP_SECONDS = 1 / 40;
const HORIZONTAL_ACCELERATION = 7.740191;
const MAX_HORIZONTAL_SPEED = 769.812;

export class GameRoom {
  #level;
  #blocks;
  #players = new Map();
  #sequences = new Map();
  #tick = 0;

  constructor(level) {
    if (!level?.tileSize || !Array.isArray(level.colliders) || !Array.isArray(level.spawns)) throw new TypeError('Invalid level');
    this.#level = level;
    this.#blocks = level.colliders.map((collider) => level.world
      ? { x: collider.x * level.world.cellSize, y: level.world.originY - collider.y * level.world.cellSize, width: level.world.cellSize, height: level.world.cellSize }
      : { x: collider.x * level.tileSize, y: collider.y * level.tileSize, width: level.tileSize, height: level.tileSize });
  }

  join(id) {
    if (this.#players.has(id)) return { ok: true, player: { ...this.#players.get(id) } };
    if (this.#players.size >= 4) return { ok: false, error: 'room_full' };
    const slot = this.#players.size + 1;
    const spawn = this.#level.spawns[slot - 1];
    if (!spawn) return { ok: false, error: 'level_missing_spawn' };
    const player = {
      id, slot, x: spawn.x, y: spawn.y, vx: spawn.speedX, vy: 0,
      speedX: spawn.speedX,
      gravity: spawn.gravity, finished: false, eliminated: false,
      hitbox: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT, offsetX: PLAYER_OFFSET_X, offsetY: spawn.gravity < 0 ? INVERTED_PLAYER_OFFSET_Y : NORMAL_PLAYER_OFFSET_Y }
    };
    this.#players.set(id, player);
    this.#sequences.set(id, 0);
    return { ok: true, player: { ...player } };
  }

  leave(id) {
    this.#sequences.delete(id);
    return this.#players.delete(id);
  }

  input(id, event) {
    const player = this.#players.get(id);
    if (!player || event?.type !== 'flip' || !Number.isInteger(event.sequence)) return { ok: false, error: 'invalid_input' };
    if (player.eliminated) return { ok: false, error: 'eliminated' };
    if (player.finished) return { ok: false, error: 'finished' };
    if (event.sequence <= this.#sequences.get(id)) return { ok: false, error: 'stale_input' };
    this.#sequences.set(id, event.sequence);
    player.gravity *= -1;
    player.hitbox.offsetY = player.gravity < 0 ? INVERTED_PLAYER_OFFSET_Y : NORMAL_PLAYER_OFFSET_Y;
    return { ok: true, tick: this.#tick };
  }

  tick(seconds) {
    const dt = Math.max(0, Math.min(Number(seconds) || 0, MAX_STEP_SECONDS));
    this.#tick += 1;
    for (const player of this.#players.values()) this.#updatePlayer(player, dt);
    this.#separateOverlappingPlayers();
    return this.snapshot();
  }

  snapshot() {
    return {
      tick: this.#tick,
      players: [...this.#players.values()].map((player) => ({ ...player }))
    };
  }

  #updatePlayer(player, dt) {
    if (player.finished || player.eliminated) return;
    if (player.speedX < MAX_HORIZONTAL_SPEED) player.speedX = Math.min(MAX_HORIZONTAL_SPEED, player.speedX + HORIZONTAL_ACCELERATION * dt);
    player.vx = player.speedX;
    const nextX = player.x + player.vx * dt;
    player.x = nextX;
    player.vy = Math.max(-MAX_VERTICAL_SPEED, Math.min(MAX_VERTICAL_SPEED, player.vy + player.gravity * GRAVITY * dt));
    const nextY = player.y + player.vy * dt;
    const block = this.#firstSolidUnder(player, nextY);
    if (block) {
      if (player.gravity > 0) player.y = block.y - player.hitbox.offsetY - PLAYER_HEIGHT;
      else player.y = block.y + block.height - player.hitbox.offsetY;
      player.vy = 0;
    } else {
      player.y = nextY;
    }
    if (player.y > STAGE_BOTTOM || player.y < STAGE_TOP) {
      player.eliminated = true;
      player.vx = 0;
      player.vy = 0;
      return;
    }
    if (this.#level.finishX && player.x >= this.#level.finishX) player.finished = true;
  }

  #firstSolidUnder(player, nextY) {
    const overlapsX = (block) => {
      const left = player.x + FOOT_CONTACT_OFFSET_X;
      return left < block.x + block.width && left + FOOT_CONTACT_WIDTH > block.x;
    };
    if (player.gravity > 0) {
      const previousBottom = player.y + player.hitbox.offsetY + PLAYER_HEIGHT;
      const nextBottom = nextY + player.hitbox.offsetY + PLAYER_HEIGHT;
      return this.#blocks.find((block) => overlapsX(block) && previousBottom <= block.y && nextBottom >= block.y);
    } else {
      const previousTop = player.y + player.hitbox.offsetY;
      return this.#blocks.find((block) => overlapsX(block) && previousTop >= block.y + block.height && nextY + player.hitbox.offsetY <= block.y + block.height);
    }
  }

  #separateOverlappingPlayers() {
    const players = [...this.#players.values()].filter((player) => !player.finished && !player.eliminated);
    for (let index = 0; index < players.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < players.length; otherIndex += 1) {
        const first = players[index];
        const second = players[otherIndex];
        const firstLeft = first.x + first.hitbox.offsetX;
        const secondLeft = second.x + second.hitbox.offsetX;
        const horizontalOverlap = Math.min(firstLeft + PLAYER_WIDTH, secondLeft + PLAYER_WIDTH) - Math.max(firstLeft, secondLeft);
        const firstTop = first.y + first.hitbox.offsetY;
        const secondTop = second.y + second.hitbox.offsetY;
        const verticalOverlap = Math.min(firstTop + PLAYER_HEIGHT, secondTop + PLAYER_HEIGHT) - Math.max(firstTop, secondTop);
        if (horizontalOverlap <= 0 || verticalOverlap <= 0) continue;

        const separation = verticalOverlap / 2;
        if (firstTop <= secondTop) {
          first.y -= separation;
          second.y += separation;
        } else {
          first.y += separation;
          second.y -= separation;
        }
        first.vy = 0;
        second.vy = 0;
      }
    }
  }

}
