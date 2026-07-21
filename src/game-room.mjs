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
const CAMERA_TARGET_SCREEN_X = 320;
// Player.as checks x < _camera.x - 350.  The recovered Flash camera sprite
// is at the centre of the 640 px stage; #cameraX is the left edge, so the
// equivalent left-edge threshold is 320 - 350 = -30 px.
const MULTIPLAYER_LEFT_ESCAPE_SCREEN_X = CAMERA_TARGET_SCREEN_X - 350;
// A runner moves at the same base speed as the shared camera.  After a brief
// collision, it therefore needs an explicit (but swept) recovery speed to
// return to the centre before the left-edge elimination rule catches it.
const CAMERA_FOLLOW_GAIN = 0.2;
const CAMERA_RECOVERY_FOLLOW_GAIN = 8;
const CAMERA_MAX_RECOVERY_SPEED = 400;
const CAMERA_TARGET_TOLERANCE = 4;
const CHARACTERS = ['blue', 'green', 'yellow', 'red'];

function playerName(value, slot) {
  const cleaned = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ');
  return [...cleaned].slice(0, 12).join('') || `玩家 ${slot}`;
}

export class GameRoom {
  #level;
  #blocks;
  #players = new Map();
  #sequences = new Map();
  #tick = 0;
  #cameraX = 0;
  #cameraSpeed = 0;
  #phase = 'lobby';
  #hostId = null;
  #results = [];

  constructor(level) {
    if (!level?.tileSize || !Array.isArray(level.colliders) || !Array.isArray(level.spawns)) throw new TypeError('Invalid level');
    this.#level = level;
    this.#blocks = level.colliders.map((collider) => level.world
      ? { x: collider.x * level.world.cellSize, y: level.world.originY - collider.y * level.world.cellSize, width: level.world.cellSize, height: level.world.cellSize }
      : { x: collider.x * level.tileSize, y: collider.y * level.tileSize, width: level.tileSize, height: level.tileSize });
  }

  join(id, name, ready = true) {
    if (this.#players.has(id)) return { ok: true, player: { ...this.#players.get(id) } };
    if (this.#phase !== 'lobby') return { ok: false, error: this.#phase === 'results' ? 'match_finished' : 'match_started' };
    if (this.#players.size >= 4) return { ok: false, error: 'room_full' };
    const slot = [1, 2, 3, 4].find((candidate) => ![...this.#players.values()].some((player) => player.slot === candidate));
    const spawn = this.#level.spawns[slot - 1];
    if (!spawn) return { ok: false, error: 'level_missing_spawn' };
    const player = {
      id, slot, x: spawn.x, y: spawn.y, vx: spawn.speedX, vy: 0, startX: spawn.x, score: 0,
      previousX: spawn.x, previousY: spawn.y,
      speedX: spawn.speedX, character: CHARACTERS[slot - 1], name: playerName(name, slot), ready: Boolean(ready),
      gravity: spawn.gravity, finished: false, eliminated: false, outcomeTick: null, blockedX: false, recoveringCameraPosition: false, cameraRecoveryBoost: false, flipWallGuard: 0,
      hitbox: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT, offsetX: PLAYER_OFFSET_X, offsetY: spawn.gravity < 0 ? INVERTED_PLAYER_OFFSET_Y : NORMAL_PLAYER_OFFSET_Y }
    };
    this.#players.set(id, player);
    this.#sequences.set(id, 0);
    if (!this.#hostId) this.#hostId = id;
    return { ok: true, player: { ...player } };
  }

  leave(id) {
    this.#sequences.delete(id);
    const removed = this.#players.delete(id);
    if (id === this.#hostId) this.#hostId = this.#players.keys().next().value ?? null;
    return removed;
  }

  start(id) {
    if (!this.#players.has(id)) return { ok: false, error: 'not_in_match' };
    if (this.#phase !== 'lobby') return { ok: false, error: 'already_started' };
    if (id !== this.#hostId) return { ok: false, error: 'not_host' };
    if (![...this.#players.values()].every((player) => player.ready)) return { ok: false, error: 'players_loading' };
    this.#phase = 'playing';
    this.#cameraSpeed = Math.max(0, ...[...this.#players.values()].map((player) => player.speedX));
    return { ok: true, tick: this.#tick };
  }

  setReady(id) {
    const player = this.#players.get(id);
    if (!player) return { ok: false, error: 'not_in_match' };
    if (this.#phase !== 'lobby') return { ok: false, error: 'already_started' };
    player.ready = true;
    return { ok: true };
  }

  input(id, event) {
    const player = this.#players.get(id);
    if (!player || event?.type !== 'flip' || !Number.isInteger(event.sequence)) return { ok: false, error: 'invalid_input' };
    if (player.eliminated) return { ok: false, error: 'eliminated' };
    if (player.finished) return { ok: false, error: 'finished' };
    if (this.#phase !== 'playing') return { ok: false, error: 'waiting_for_host' };
    if (event.sequence <= this.#sequences.get(id)) return { ok: false, error: 'stale_input' };
    this.#sequences.set(id, event.sequence);
    const previousOffsetY = player.hitbox.offsetY;
    player.gravity *= -1;
    player.hitbox.offsetY = player.gravity < 0 ? INVERTED_PLAYER_OFFSET_Y : NORMAL_PLAYER_OFFSET_Y;
    player.flipWallGuard = 4;
    this.#resolveGravityFlipOverlap(player, previousOffsetY);
    return { ok: true, tick: this.#tick };
  }

  tick(seconds) {
    if (this.#phase !== 'playing') return this.snapshot();
    const dt = Math.max(0, Math.min(Number(seconds) || 0, MAX_STEP_SECONDS));
    this.#tick += 1;
    for (const player of this.#players.values()) this.#updatePlayer(player, dt);
    this.#advanceCamera(dt);
    this.#separateOverlappingPlayers(dt);
    this.#eliminatePlayersOutsideView();
    return this.snapshot();
  }

  snapshot() {
    return {
      tick: this.#tick,
      phase: this.#phase,
      cameraX: this.#cameraX,
      cameraSpeed: this.#cameraSpeed,
      hostSlot: this.#players.get(this.#hostId)?.slot ?? null,
      players: [...this.#players.values()].map((player) => ({ ...player })),
      results: this.#results.map((result) => ({ ...result }))
    };
  }

  #updatePlayer(player, dt) {
    if (player.finished || player.eliminated) return;
    player.previousX = player.x;
    player.previousY = player.y;
    if (player.speedX < MAX_HORIZONTAL_SPEED) player.speedX = Math.min(MAX_HORIZONTAL_SPEED, player.speedX + HORIZONTAL_ACCELERATION * dt);
    // Original multiplayer follows one shared camera runner, not the current
    // first-place player.  All runners may approach that centre, but none may
    // pass it.  A lagging runner receives a distance-proportional correction,
    // which smoothly fades to zero as it reaches the centre.
    const nextCameraSpeed = Math.min(MAX_HORIZONTAL_SPEED, this.#cameraSpeed + HORIZONTAL_ACCELERATION * dt);
    const cameraTargetX = this.#cameraX + nextCameraSpeed * dt + CAMERA_TARGET_SCREEN_X;
    player.vx = player.speedX;
    const baseNextX = player.x + player.vx * dt;
    const distanceToCentre = cameraTargetX - baseNextX;
    // Calculate recovery before sweeping the horizontal collision.  Adding it
    // afterwards could place a lagging player on the far side of a wall.
    const followGain = player.cameraRecoveryBoost ? CAMERA_RECOVERY_FOLLOW_GAIN : CAMERA_FOLLOW_GAIN;
    const correction = distanceToCentre > CAMERA_TARGET_TOLERANCE
      ? Math.min(distanceToCentre * followGain * dt, CAMERA_MAX_RECOVERY_SPEED * dt)
      : 0;
    const nextX = baseNextX + correction;
    const sideBlock = this.#firstSolidAhead(player, nextX);
    player.blockedX = Boolean(sideBlock);
    if (sideBlock) {
      player.recoveringCameraPosition = true;
      player.cameraRecoveryBoost = true;
      player.x = sideBlock.x - player.hitbox.offsetX - PLAYER_WIDTH;
    } else {
      player.x = nextX;
      if (distanceToCentre <= CAMERA_TARGET_TOLERANCE) {
        player.x = cameraTargetX;
        player.recoveringCameraPosition = false;
        player.cameraRecoveryBoost = false;
      } else {
        player.vx += correction / dt;
        player.recoveringCameraPosition = true;
      }
    }
    player.score = Math.max(player.score, Math.max(0, Math.floor(player.x - player.startX)));
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
    if (player.flipWallGuard > 0) player.flipWallGuard -= 1;
    if (this.#level.finishX && player.x >= this.#level.finishX) {
      player.finished = true;
      player.outcomeTick = this.#tick;
    }
  }

  #advanceCamera(dt) {
    const runners = [...this.#players.values()].filter((player) => !player.finished && !player.eliminated);
    if (!runners.length) return;
    this.#cameraSpeed = Math.min(MAX_HORIZONTAL_SPEED, this.#cameraSpeed + HORIZONTAL_ACCELERATION * dt);
    this.#cameraX += this.#cameraSpeed * dt;
  }

  #eliminatePlayersOutsideView() {
    for (const player of this.#players.values()) {
      if (player.finished || player.eliminated) continue;
      if (player.y <= STAGE_BOTTOM && player.y >= STAGE_TOP && player.x >= this.#cameraX + MULTIPLAYER_LEFT_ESCAPE_SCREEN_X) continue;
      player.eliminated = true;
      player.vx = 0;
      player.vy = 0;
      player.outcomeTick = this.#tick;
    }
    this.#finishMatchIfComplete();
  }

  #finishMatchIfComplete() {
    if (this.#phase !== 'playing' || [...this.#players.values()].some((player) => !player.finished && !player.eliminated)) return;
    this.#phase = 'results';
    this.#results = [...this.#players.values()]
      .sort((left, right) => {
        if (left.finished !== right.finished) return left.finished ? -1 : 1;
        const tickOrder = left.finished
          ? left.outcomeTick - right.outcomeTick
          : right.outcomeTick - left.outcomeTick;
        return tickOrder || left.slot - right.slot;
      })
      .map((player, index) => ({ slot: player.slot, rank: index + 1, outcome: player.finished ? 'finished' : 'eliminated', score: player.score }));
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

  #firstSolidAhead(player, nextX) {
    if (nextX <= player.x) return null;
    const previousRight = player.x + player.hitbox.offsetX + PLAYER_WIDTH;
    const nextRight = nextX + player.hitbox.offsetX + PLAYER_WIDTH;
    const top = player.y + player.hitbox.offsetY;
    const bottom = top + PLAYER_HEIGHT;
    return this.#blocks.find((block) => {
      const verticalOverlap = Math.min(bottom, block.y + block.height) - Math.max(top, block.y);
      // A gravity switch changes the hitbox offset by ten pixels.  For the
      // next four fixed frames, an outside corner can have a thin but real
      // overlap which must block the X sweep.  Outside that transition window
      // retain the stricter map rule so floor edges do not become air walls.
      const blocksDuringFlip = player.flipWallGuard > 0 && verticalOverlap > 0;
      return previousRight <= block.x && nextRight >= block.x && (verticalOverlap > PLAYER_HEIGHT / 2 || blocksDuringFlip);
    });
  }

  #resolveGravityFlipOverlap(player, previousOffsetY) {
    const left = player.x + player.hitbox.offsetX;
    const right = left + PLAYER_WIDTH;
    const top = player.y + player.hitbox.offsetY;
    const bottom = top + PLAYER_HEIGHT;
    const previousTop = player.y + previousOffsetY;
    const previousBottom = previousTop + PLAYER_HEIGHT;
    const overlapsX = (block) => left < block.x + block.width && right > block.x;
    if (player.gravity < 0) {
      // Normal -> inverted moves the collision box 10 px upward.  Only a
      // block whose bottom lies in that newly entered strip is a ceiling hit;
      // blocks already overlapping vertically are side walls, not teleport
      // targets.
      const enteredCeilings = this.#blocks.filter((block) => overlapsX(block) && top < block.y + block.height && block.y + block.height <= previousTop);
      if (!enteredCeilings.length) return;
      player.y = Math.max(player.y, ...enteredCeilings.map((block) => block.y + block.height - player.hitbox.offsetY));
    } else {
      // Inverted -> normal moves it 10 px downward; mirror the same rule for
      // newly entered floor tops only.
      const enteredFloors = this.#blocks.filter((block) => overlapsX(block) && bottom > block.y && block.y >= previousBottom);
      if (!enteredFloors.length) return;
      player.y = Math.min(player.y, ...enteredFloors.map((block) => block.y - player.hitbox.offsetY - PLAYER_HEIGHT));
    }
    player.vy = 0;
  }

  #separateOverlappingPlayers(dt) {
    const players = [...this.#players.values()].filter((player) => !player.finished && !player.eliminated);
    // Resolve the recovered 37 x 48 multiplayer hitboxes as solid rectangles.
    // The original callback uses the current x when two runners are level;
    // under an authoritative 40 FPS server that makes tied runners swap leader
    // every tick.  Previous positions give the pair one stable ordering.
    for (let pass = 0; pass < 4; pass += 1) {
      for (let index = 0; index < players.length; index += 1) {
        for (let otherIndex = index + 1; otherIndex < players.length; otherIndex += 1) {
          this.#collideMovingPlayers(players[index], players[otherIndex], dt);
        }
      }
    }
  }

  #collideMovingPlayers(first, second, dt) {
    const firstLeft = first.x + first.hitbox.offsetX;
    const secondLeft = second.x + second.hitbox.offsetX;
    const horizontalOverlap = Math.min(firstLeft + PLAYER_WIDTH, secondLeft + PLAYER_WIDTH) - Math.max(firstLeft, secondLeft);
    const firstTop = first.y + first.hitbox.offsetY;
    const secondTop = second.y + second.hitbox.offsetY;
    const verticalOverlap = Math.min(firstTop + PLAYER_HEIGHT, secondTop + PLAYER_HEIGHT) - Math.max(firstTop, secondTop);
    if (horizontalOverlap <= 0 || verticalOverlap <= 0) return;

    const firstPreviousTop = first.previousY + first.hitbox.offsetY;
    const secondPreviousTop = second.previousY + second.hitbox.offsetY;
    const firstPreviousBottom = firstPreviousTop + PLAYER_HEIGHT;
    const secondPreviousBottom = secondPreviousTop + PLAYER_HEIGHT;
    const firstFellOntoSecond = first.vy > 0 && firstPreviousBottom <= secondPreviousTop;
    const secondFellOntoFirst = second.vy > 0 && secondPreviousBottom <= firstPreviousTop;
    const firstRoseIntoSecond = first.vy < 0 && firstPreviousTop >= secondPreviousBottom;
    const secondRoseIntoFirst = second.vy < 0 && secondPreviousTop >= firstPreviousBottom;
    const opposingVerticalMotion = (first.vy > 0 && second.vy < 0) || (first.vy < 0 && second.vy > 0);
    const shouldResolveVertically = firstFellOntoSecond || secondFellOntoFirst
      || firstRoseIntoSecond || secondRoseIntoFirst || opposingVerticalMotion
      || verticalOverlap < horizontalOverlap;
    if (!shouldResolveVertically) {
      this.#separateSideBySide(first, second);
      return;
    }

    if (first.gravity !== second.gravity) {
      // Opposite gravity turns an already stacked pair into one vertical body:
      // both accelerations cancel, neither runner becomes the other's anchor,
      // and the previous contact is retained.  Without this rollback, choosing
      // the lower sprite as the anchor lets an inverted runner push its rider
      // upward one physics frame at a time.
      const previousVerticalGap = Math.max(firstPreviousTop, secondPreviousTop)
        - Math.min(firstPreviousBottom, secondPreviousBottom);
      if (Math.abs(previousVerticalGap) < 0.001) {
        first.y = first.previousY;
        second.y = second.previousY;
      } else {
        // On the first impact there is no shared contact to preserve. Split
        // only this initial correction by the distance each runner travelled,
        // then subsequent ticks keep the newly established stack fixed.
        const firstTravel = Math.abs(first.vy * dt);
        const secondTravel = Math.abs(second.vy * dt);
        const totalTravel = firstTravel + secondTravel;
        const firstShare = totalTravel ? firstTravel / totalTravel : 0.5;
        const secondShare = 1 - firstShare;
        if (firstTop <= secondTop) {
          first.y -= verticalOverlap * firstShare;
          second.y += verticalOverlap * secondShare;
        } else {
          first.y += verticalOverlap * firstShare;
          second.y -= verticalOverlap * secondShare;
        }
      }
      first.vy = 0;
      second.vy = 0;
      return;
    }

    const upper = firstTop <= secondTop ? first : second;
    const lower = upper === first ? second : first;
    upper.y = lower.y + lower.hitbox.offsetY - upper.hitbox.offsetY - PLAYER_HEIGHT;
    if (first.gravity > 0) {
      // With matching downward gravity the upper runner is carried by the
      // lower one, so the pair falls together instead of trading places.
      upper.vy = lower.vy;
    } else if (first.gravity < 0) {
      // Mirrored case for matching upward gravity.
      lower.vy = upper.vy;
    }
  }

  #separateSideBySide(first, second) {
    const firstWasAhead = first.previousX > second.previousX
      || (first.previousX === second.previousX && first.slot < second.slot);
    const leader = firstWasAhead ? first : second;
    const follower = firstWasAhead ? second : first;
    follower.x = leader.x - PLAYER_WIDTH * 1.1;
  }

}
