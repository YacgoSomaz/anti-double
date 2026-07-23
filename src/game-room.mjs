import { createCollisionIndex } from './collision-index.mjs';
import { createItemState, ITEM_EFFECT_TICKS, ITEM_TYPES } from './item-system.mjs';
import { defaultSkinForSlot, skinById } from './skin-library.mjs';

const PLAYER_WIDTH = 37;
const PLAYER_HEIGHT = 48;
const PLAYER_OFFSET_X = 16;
const NORMAL_PLAYER_OFFSET_Y = 19;
const INVERTED_PLAYER_OFFSET_Y = 9;
const FOOT_CONTACT_WIDTH = 28;
const FOOT_CONTACT_OFFSET_X = PLAYER_OFFSET_X + (PLAYER_WIDTH - FOOT_CONTACT_WIDTH) / 2;
// The renderer now shows 10% more world above and below the original stage.
// Leave a further small recovery margin so a runner on the lower route can
// reverse gravity and return instead of being eliminated at the screen edge.
const STAGE_TOP = -90;
const STAGE_BOTTOM = 560;
const GRAVITY = 30000;
const MAX_VERTICAL_SPEED = 320.755;
const MAX_STEP_SECONDS = 1 / 40;
// The original ramp felt too abrupt at higher speeds. Keep the recovered
// curve shape and cap, but soften its acceleration by 15% for readability.
const HORIZONTAL_ACCELERATION = 5.26332988;
const MAX_HORIZONTAL_SPEED = 769.812;
const CAMERA_TARGET_SCREEN_X = 320;
// Player.as checks x < _camera.x - 350.  The recovered Flash camera sprite
// is at the centre of the 640 px stage; #cameraX is the left edge, so the
// equivalent left-edge threshold is 320 - 410 = -90 px.  The extra 60 px is
// intentional recovery space beyond the zoomed-out left edge.
const MULTIPLAYER_LEFT_ESCAPE_SCREEN_X = CAMERA_TARGET_SCREEN_X - 410;
const CAMERA_FOLLOW_GAIN = 0.2;
// Once a runner has entered the shared camera rhythm, being behind centre
// adds up to 75% of the current shared speed. The percentage is proportional
// to the centre gap, so it fades continuously to zero near the target.
const CAMERA_RECOVERY_MAX_SPEED_RATIO = 0.75;
const CAMERA_TARGET_TOLERANCE = 4;
const BLOCKED_CAMERA_SAFETY_FRAMES = 12;
const ITEM_PICKUP_RADIUS_X = 48;
const ITEM_PICKUP_RADIUS_Y = 56;
// The recovered third pickup is used as a brake in the playable marathon:
// it gives the collector a short, controllable speed reduction instead of
// pushing the already accelerating camera beyond a human-readable pace.
const SPEED_CONTROL_MULTIPLIER = 0.65;
const SIZE_UP_MULTIPLIER = 1.28;
const SIZE_DOWN_MULTIPLIER = 0.72;
const CHARACTERS = ['blue', 'green', 'yellow', 'red'];
const DEFAULT_DEBUG_TUNING = Object.freeze({ speedMultiplier: 1, cameraSpeedMultiplier: 1, recoveryMultiplier: 1, gravityMultiplier: 1, hitboxWidth: PLAYER_WIDTH, hitboxHeight: PLAYER_HEIGHT, eliminationMargin: 60 });

function clamp(value, min, max, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
}
function normaliseDebugTuning(value = {}) {
  return {
    speedMultiplier: clamp(value.speedMultiplier, 0.5, 2, DEFAULT_DEBUG_TUNING.speedMultiplier),
    cameraSpeedMultiplier: clamp(value.cameraSpeedMultiplier, 0.5, 2, DEFAULT_DEBUG_TUNING.cameraSpeedMultiplier),
    recoveryMultiplier: clamp(value.recoveryMultiplier, 0.1, 3, DEFAULT_DEBUG_TUNING.recoveryMultiplier),
    gravityMultiplier: clamp(value.gravityMultiplier, 0.25, 2, DEFAULT_DEBUG_TUNING.gravityMultiplier),
    hitboxWidth: Math.round(clamp(value.hitboxWidth, 20, 56, DEFAULT_DEBUG_TUNING.hitboxWidth)),
    hitboxHeight: Math.round(clamp(value.hitboxHeight, 28, 72, DEFAULT_DEBUG_TUNING.hitboxHeight)),
    eliminationMargin: Math.round(clamp(value.eliminationMargin, 0, 180, DEFAULT_DEBUG_TUNING.eliminationMargin))
  };
}

function playerOffsetY(gravity, height) {
  const centeredAdjustment = (PLAYER_HEIGHT - height) / 2;
  return (gravity < 0 ? INVERTED_PLAYER_OFFSET_Y : NORMAL_PLAYER_OFFSET_Y) + centeredAdjustment;
}

function playerName(value, slot) {
  const cleaned = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ');
  return [...cleaned].slice(0, 12).join('') || `玩家 ${slot}`;
}

export class GameRoom {
  #level;
  #blocks;
  #collisionIndex;
  #players = new Map();
  #sequences = new Map();
  #tick = 0;
  #cameraX = 0;
  #cameraSpeed = 0;
  #introTicksRemaining = 0;
  #phase = 'lobby';
  #hostId = null;
  #results = [];
  #items = [];
  #speedControlTicks = 0;
  #debugTuning = { ...DEFAULT_DEBUG_TUNING };

  constructor(level) {
    if (!level?.tileSize || !Array.isArray(level.colliders) || !Array.isArray(level.spawns)) throw new TypeError('Invalid level');
    this.#level = level;
    this.#blocks = level.colliders.map((collider) => level.world
      ? { x: collider.x * level.world.cellSize, y: level.world.originY - collider.y * level.world.cellSize, width: level.world.cellSize, height: level.world.cellSize }
      : { x: collider.x * level.tileSize, y: collider.y * level.tileSize, width: level.tileSize, height: level.tileSize });
    this.#collisionIndex = createCollisionIndex(this.#blocks, level.world?.cellSize ?? level.tileSize);
    this.#items = createItemState(level);
    this.#debugTuning = normaliseDebugTuning(level.playerPhysics ?? {});
  }

  setDebugTuning(value) {
    const previousTuning = this.#debugTuning;
    this.#debugTuning = normaliseDebugTuning(value);
    for (const player of this.#players.values()) {
      player.baseHitboxWidth = this.#debugTuning.hitboxWidth;
      player.baseHitboxHeight = this.#debugTuning.hitboxHeight;
      this.#setPlayerSize(player, player.sizeTicks > 0 ? player.sizeScale : 1);
      player.startSpeedX *= this.#debugTuning.speedMultiplier / previousTuning.speedMultiplier;
      if (this.#phase === 'lobby') { player.speedX = player.startSpeedX; player.vx = player.startSpeedX; }
    }
    return this.debugTuning();
  }

  debugTuning() { return { ...this.#debugTuning }; }

  join(id, name, ready = true, skinId) {
    if (this.#players.has(id)) return { ok: true, player: { ...this.#players.get(id) } };
    if (this.#phase !== 'lobby') return { ok: false, error: this.#phase === 'results' ? 'match_finished' : 'match_started' };
    if (this.#players.size >= 4) return { ok: false, error: 'room_full' };
    const slot = [1, 2, 3, 4].find((candidate) => ![...this.#players.values()].some((player) => player.slot === candidate));
    const spawn = this.#level.spawns[slot - 1];
    if (!spawn) return { ok: false, error: 'level_missing_spawn' };
    const player = {
      id, slot, x: spawn.x, y: spawn.y, vx: spawn.speedX * this.#debugTuning.speedMultiplier, vy: 0, startX: spawn.x, score: 0,
      previousX: spawn.x, previousY: spawn.y,
      speedX: spawn.speedX * this.#debugTuning.speedMultiplier, startSpeedX: spawn.speedX * this.#debugTuning.speedMultiplier, character: CHARACTERS[slot - 1], skinId: skinById(skinId)?.id ?? defaultSkinForSlot(slot), name: playerName(name, slot), ready: Boolean(ready),
      gravity: spawn.gravity, finished: false, eliminated: false, outcomeTick: null, blockedX: false, recoveringCameraPosition: false, cameraRecoveryBoost: false, hasReachedCameraCentre: Math.abs(spawn.x - CAMERA_TARGET_SCREEN_X) <= CAMERA_TARGET_TOLERANCE, cameraSafetyFrames: 0, flipWallGuard: 0,
      phaseTicks: 0, speedBoostTicks: 0,
      sizeTicks: 0, sizeScale: 1,
      baseHitboxWidth: this.#debugTuning.hitboxWidth, baseHitboxHeight: this.#debugTuning.hitboxHeight,
      hitbox: { width: this.#debugTuning.hitboxWidth, height: this.#debugTuning.hitboxHeight, offsetX: PLAYER_OFFSET_X + (PLAYER_WIDTH - this.#debugTuning.hitboxWidth) / 2, offsetY: playerOffsetY(spawn.gravity, this.#debugTuning.hitboxHeight) }
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
    this.#introTicksRemaining = Math.max(0, Math.floor(Number(this.#level.openingMorphTicks) || 0));
    if (this.#introTicksRemaining) {
      this.#cameraSpeed = 0;
      for (const player of this.#players.values()) {
        player.vx = 0;
        player.vy = 0;
        player.speedX = 0;
        player.previousX = player.x;
        player.previousY = player.y;
      }
    } else {
      this.#cameraSpeed = Math.max(0, ...[...this.#players.values()].map((player) => player.speedX));
    }
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
    if (this.#introTicksRemaining > 0) return { ok: false, error: 'intro_active' };
    if (event.sequence <= this.#sequences.get(id)) return { ok: false, error: 'stale_input' };
    this.#sequences.set(id, event.sequence);
    const previousOffsetY = player.hitbox.offsetY;
    player.gravity *= -1;
    player.hitbox.offsetY = playerOffsetY(player.gravity, player.hitbox.height);
    player.flipWallGuard = 4;
    this.#resolveGravityFlipOverlap(player, previousOffsetY);
    return { ok: true, tick: this.#tick };
  }

  tick(seconds) {
    if (this.#phase !== 'playing') return this.snapshot();
    const dt = Math.max(0, Math.min(Number(seconds) || 0, MAX_STEP_SECONDS));
    this.#tick += 1;
    if (this.#introTicksRemaining > 0) {
      this.#introTicksRemaining -= 1;
      if (this.#introTicksRemaining === 0) this.#releaseOpeningMorph();
      return this.snapshot();
    }
    for (const player of this.#players.values()) this.#updatePlayer(player, dt);
    this.#advanceCamera(dt);
    this.#separateOverlappingPlayers(dt);
    // Player-to-player separation changes coordinates after each runner has
    // completed its normal world sweep.  Recheck that displacement against
    // terrain before publishing a snapshot, otherwise a shove can leave a
    // runner embedded in—or on the far side of—a world block.
    this.#resolvePlayersAgainstWorld();
    this.#eliminatePlayersOutsideView();
    if (this.#speedControlTicks > 0) this.#speedControlTicks -= 1;
    return this.snapshot();
  }

  selectSkin(id, skinId) {
    const player = this.#players.get(id);
    if (!player) return { ok: false, error: 'not_in_match' };
    if (this.#phase !== 'lobby') return { ok: false, error: this.#phase === 'results' ? 'match_finished' : 'match_started' };
    const selected = skinById(skinId);
    if (!selected) return { ok: false, error: 'invalid_skin' };
    player.skinId = selected.id;
    return { ok: true, skinId: selected.id };
  }

  snapshot() {
    return {
      tick: this.#tick,
      phase: this.#phase,
      cameraX: this.#cameraX,
      cameraSpeed: this.#effectiveCameraSpeed(this.#cameraSpeed),
      introTicksRemaining: this.#introTicksRemaining,
      hostSlot: this.#players.get(this.#hostId)?.slot ?? null,
      players: [...this.#players.values()].map((player) => ({ ...player })),
      items: this.#items.map((item) => ({ ...item })),
      results: this.#results.map((result) => ({ ...result }))
    };
  }

  #updatePlayer(player, dt) {
    if (player.finished || player.eliminated) return;
    player.previousX = player.x;
    player.previousY = player.y;
    player.worldContactDirty = false;
    this.#collectItems(player);
    // Original multiplayer follows one shared camera runner, not the current
    // first-place player.  All runners may approach that centre, but none may
    // pass it.  A lagging runner receives a distance-proportional correction,
    // which smoothly fades to zero as it reaches the centre.
    const nextCameraSpeed = this.#effectiveCameraSpeed(Math.min(this.#maxHorizontalSpeed(), this.#cameraSpeed + this.#cameraAcceleration() * dt));
    const cameraTargetX = this.#cameraX + nextCameraSpeed * dt + CAMERA_TARGET_SCREEN_X;
    // Camera speed is the one shared base speed.  A player can only exceed it
    // while smoothly recovering from a position behind the centre target.
    player.speedX = nextCameraSpeed;
    player.vx = nextCameraSpeed;
    const baseNextX = player.x + player.vx * dt;
    const distanceToCentre = cameraTargetX - baseNextX;
    // Recovery must be based on the current gap every physics frame.  Gating
    // it behind a historical "reached centre" flag accidentally fell back to
    // a tiny fixed correction after a reconnect or state transition, leaving
    // a runner permanently behind the shared camera at high speed.
    const recoveryRatio = Math.min(1, distanceToCentre / CAMERA_TARGET_SCREEN_X) * CAMERA_RECOVERY_MAX_SPEED_RATIO * this.#debugTuning.recoveryMultiplier;
    const percentageCorrection = nextCameraSpeed * recoveryRatio * dt;
    // Preserve the original low-speed nudge for a stopped camera.  At normal
    // race speeds the percentage term dominates, so recovery scales with the
    // current camera speed instead of becoming insignificant late in a run.
    const minimumCorrection = distanceToCentre * CAMERA_FOLLOW_GAIN * dt;
    const correction = distanceToCentre > CAMERA_TARGET_TOLERANCE
      ? Math.max(percentageCorrection, minimumCorrection)
      : 0;
    // Terrain constrains the position, not the runner's intended recovery
    // velocity.  Retaining it makes the next clear frame resume catch-up
    // immediately instead of restarting at the camera base speed.
    player.vx += correction / dt;
    // Sweep the complete base-plus-recovery movement so catch-up cannot cross
    // a side block.
    const nextX = baseNextX + correction;
    const nextVy = Math.max(-MAX_VERTICAL_SPEED, Math.min(MAX_VERTICAL_SPEED, player.vy + player.gravity * GRAVITY * this.#debugTuning.gravityMultiplier * dt));
    const nextY = player.y + nextVy * dt;
    // Keep the legacy two-argument shape documented for tooling while passing
    // the predicted Y needed for a continuous diagonal sweep.
    // #firstSolidAhead(player, nextX)
    const sideBlock = player.phaseTicks > 0 ? null : this.#firstSolidAhead(player, nextX, nextY);
    player.blockedX = Boolean(sideBlock);
    if (sideBlock) {
      player.recoveringCameraPosition = true;
      player.cameraRecoveryBoost = true;
      player.x = sideBlock.x - player.hitbox.offsetX - player.hitbox.width;
    } else {
      player.x = nextX;
      if (distanceToCentre <= CAMERA_TARGET_TOLERANCE) {
        player.x = cameraTargetX;
        player.hasReachedCameraCentre = true;
        player.recoveringCameraPosition = false;
        player.cameraRecoveryBoost = false;
      } else {
        player.recoveringCameraPosition = true;
      }
    }
    player.score = Math.max(player.score, Math.max(0, Math.floor(player.x - player.startX)));
    player.vy = nextVy;
    const block = player.phaseTicks > 0 ? null : this.#firstSolidUnder(player, nextY, player.x);
    if (block) {
      if (player.gravity > 0) player.y = block.y - player.hitbox.offsetY - player.hitbox.height;
      else player.y = block.y + block.height - player.hitbox.offsetY;
      player.vy = 0;
    } else {
      player.y = nextY;
    }
    if (player.flipWallGuard > 0) player.flipWallGuard -= 1;
    if (player.phaseTicks > 0) player.phaseTicks -= 1;
    if (player.speedBoostTicks > 0) player.speedBoostTicks -= 1;
    if (player.sizeTicks > 0) {
      player.sizeTicks -= 1;
      if (player.sizeTicks === 0) this.#setPlayerSize(player, 1);
    }
    if (this.#level.finishX && player.x >= this.#level.finishX) {
      player.finished = true;
      player.outcomeTick = this.#tick;
    }
  }

  #advanceCamera(dt) {
    const runners = [...this.#players.values()].filter((player) => !player.finished && !player.eliminated);
    if (!runners.length) return;
    this.#cameraSpeed = Math.min(this.#maxHorizontalSpeed(), this.#cameraSpeed + this.#cameraAcceleration() * dt);
    const requestedCameraX = this.#cameraX + this.#effectiveCameraSpeed(this.#cameraSpeed) * dt;
    // A terrain side collision is not a failure condition.  Hold the shared
    // camera at the survivor boundary until that runner can clear the block,
    // then the existing percentage catch-up returns them to centre.
    for (const player of runners) player.cameraSafetyFrames = player.blockedX ? player.cameraSafetyFrames + 1 : 0;
    const blockedSafetyX = Math.min(...runners
      .filter((player) => player.blockedX && player.cameraSafetyFrames <= BLOCKED_CAMERA_SAFETY_FRAMES)
      .map((player) => player.x - this.#leftEscapeScreenX()));
    const safeCameraX = Number.isFinite(blockedSafetyX) ? Math.min(requestedCameraX, blockedSafetyX) : requestedCameraX;
    this.#cameraX = Math.max(this.#cameraX, safeCameraX);
  }

  #releaseOpeningMorph() {
    for (const player of this.#players.values()) {
      player.speedX = player.startSpeedX;
      player.vx = player.startSpeedX;
      player.vy = 0;
      player.previousX = player.x;
      player.previousY = player.y;
    }
    this.#cameraSpeed = Math.max(0, ...[...this.#players.values()].map((player) => player.speedX));
  }

  #maxHorizontalSpeed() { return MAX_HORIZONTAL_SPEED * this.#debugTuning.cameraSpeedMultiplier; }
  #cameraAcceleration() { return HORIZONTAL_ACCELERATION * this.#debugTuning.cameraSpeedMultiplier; }
  #effectiveCameraSpeed(speed) {
    return this.#speedControlTicks > 0 ? speed * SPEED_CONTROL_MULTIPLIER : speed;
  }
  #setPlayerSize(player, scale) {
    const previousHeight = player.hitbox?.height ?? player.baseHitboxHeight ?? this.#debugTuning.hitboxHeight;
    const previousOffsetY = player.hitbox?.offsetY ?? playerOffsetY(player.gravity, previousHeight);
    const centreY = player.y + previousOffsetY + previousHeight / 2;
    const nextScale = Number.isFinite(Number(scale)) ? Number(scale) : 1;
    const baseWidth = player.baseHitboxWidth ?? this.#debugTuning.hitboxWidth;
    const baseHeight = player.baseHitboxHeight ?? this.#debugTuning.hitboxHeight;
    player.sizeScale = nextScale;
    player.hitbox.width = Math.max(14, Math.round(baseWidth * nextScale));
    player.hitbox.height = Math.max(18, Math.round(baseHeight * nextScale));
    player.hitbox.offsetX = PLAYER_OFFSET_X + (PLAYER_WIDTH - player.hitbox.width) / 2;
    player.hitbox.offsetY = playerOffsetY(player.gravity, player.hitbox.height);
    player.y = centreY - player.hitbox.offsetY - player.hitbox.height / 2;
    player.worldContactDirty = true;
  }
  #leftEscapeScreenX() {
    const margin = Number(this.#level.elimination?.leftMargin);
    return CAMERA_TARGET_SCREEN_X - 350 - (Number.isFinite(margin) ? margin : this.#debugTuning.eliminationMargin);
  }

  #eliminationBounds() {
    const top = Number(this.#level.elimination?.top);
    const bottom = Number(this.#level.elimination?.bottom);
    return { top: Number.isFinite(top) ? top : STAGE_TOP, bottom: Number.isFinite(bottom) ? bottom : STAGE_BOTTOM };
  }

  #eliminatePlayersOutsideView() {
    const bounds = this.#eliminationBounds();
    for (const player of this.#players.values()) {
      if (player.finished || player.eliminated) continue;
      if (player.y <= bounds.bottom && player.y >= bounds.top && player.x >= this.#cameraX + this.#leftEscapeScreenX()) continue;
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

  #firstSolidUnder(player, nextY, nextX = player.x) {
    const footWidth = Math.min(FOOT_CONTACT_WIDTH, player.hitbox.width);
    const left = nextX + player.hitbox.offsetX + (player.hitbox.width - footWidth) / 2;
    const overlapsX = (block) => {
      return left < block.x + block.width && left + footWidth > block.x;
    };
    if (player.gravity > 0) {
      const previousTop = player.y + player.hitbox.offsetY;
      const previousBottom = previousTop + player.hitbox.height;
      const nextBottom = nextY + player.hitbox.offsetY + player.hitbox.height;
      return this.#collisionIndex.find(left, left + footWidth,
        (block) => overlapsX(block) && previousTop < block.y && nextBottom >= block.y);
    } else {
      const previousTop = player.y + player.hitbox.offsetY;
      return this.#collisionIndex.find(left, left + footWidth,
        (block) => overlapsX(block) && previousTop >= block.y + block.height && nextY + player.hitbox.offsetY <= block.y + block.height);
    }
  }

  #firstSolidAhead(player, nextX, nextY = player.y) {
    if (nextX <= player.x) return null;
    const previousRight = player.x + player.hitbox.offsetX + player.hitbox.width;
    const nextRight = nextX + player.hitbox.offsetX + player.hitbox.width;
    const top = player.y + player.hitbox.offsetY;
    const bottom = top + player.hitbox.height;
    const nextTop = nextY + player.hitbox.offsetY;
    const nextBottom = nextTop + player.hitbox.height;
    const sweptTop = Math.min(top, nextTop);
    const sweptBottom = Math.max(bottom, nextBottom);
    return this.#collisionIndex.find(previousRight, nextRight, (block) => {
      const verticalOverlap = Math.min(sweptBottom, block.y + block.height) - Math.max(sweptTop, block.y);
      // A diagonal approach that crosses a platform top/bottom is a vertical
      // landing, not a side-wall hit.  Let #firstSolidUnder resolve the
      // contact at the predicted X so a runner can clear a platform edge.
      const landingOnTop = player.gravity > 0 && nextY > player.y && top < block.y && nextBottom >= block.y;
      if (landingOnTop) return false;
      // Ordinary floor-edge contact needs substantial overlap so a runner can
      // still fall through a genuine narrow gap.  An inverted runner rising
      // into a ceiling corner is different: its overlap deepens every frame,
      // and allowing even one X crossing loses the block's left edge forever.
      const blocksDuringFlip = player.flipWallGuard > 0 && verticalOverlap > 0;
      const risingIntoCeilingCorner = player.gravity < 0 && player.vy < 0 && verticalOverlap > 0;
      return previousRight <= block.x && nextRight >= block.x
        && (verticalOverlap > player.hitbox.height / 2 || blocksDuringFlip || risingIntoCeilingCorner);
    });
  }

  #resolvePlayersAgainstWorld() {
    for (const player of this.#players.values()) {
      if (player.finished || player.eliminated || player.phaseTicks > 0 || !player.worldContactDirty) continue;
      // One player contact can cause at most one correction on each axis, but
      // allow a short bounded pass for an inside corner made by two tiles.
      for (let pass = 0; pass < 4; pass += 1) {
        if (!this.#resolveWorldSweep(player) && !this.#resolveWorldOverlap(player)) break;
      }
    }
  }

  #resolveWorldSweep(player) {
    const previousLeft = player.previousX + player.hitbox.offsetX;
    const previousRight = previousLeft + player.hitbox.width;
    const currentLeft = player.x + player.hitbox.offsetX;
    const currentRight = currentLeft + player.hitbox.width;
    const previousTop = player.previousY + player.hitbox.offsetY;
    const previousBottom = previousTop + player.hitbox.height;
    const currentTop = player.y + player.hitbox.offsetY;
    const currentBottom = currentTop + player.hitbox.height;
    const overlapsVerticalPath = (block) => Math.max(previousBottom, currentBottom) > block.y
      && Math.min(previousTop, currentTop) < block.y + block.height;
    const overlapsHorizontalPath = (block) => Math.max(previousRight, currentRight) > block.x
      && Math.min(previousLeft, currentLeft) < block.x + block.width;

    const queryLeft = Math.min(previousLeft, currentLeft);
    const queryRight = Math.max(previousRight, currentRight);
    if (currentLeft < previousLeft) {
      const block = this.#collisionIndex.find(queryLeft, queryRight, (item) => previousLeft >= item.x + item.width
        && currentLeft < item.x + item.width && overlapsVerticalPath(item));
      if (block) {
        player.x = block.x + block.width - player.hitbox.offsetX;
        player.blockedX = true;
        return true;
      }
    }
    if (currentRight > previousRight) {
      const block = this.#collisionIndex.find(queryLeft, queryRight, (item) => previousRight <= item.x
        && currentRight > item.x && overlapsVerticalPath(item));
      if (block) {
        player.x = block.x - player.hitbox.offsetX - player.hitbox.width;
        player.blockedX = true;
        return true;
      }
    }
    if (currentTop < previousTop) {
      const block = this.#collisionIndex.find(queryLeft, queryRight, (item) => previousTop >= item.y + item.height
        && currentTop < item.y + item.height && overlapsHorizontalPath(item));
      if (block) {
        player.y = block.y + block.height - player.hitbox.offsetY;
        player.vy = 0;
        return true;
      }
    }
    if (currentBottom > previousBottom) {
      const block = this.#collisionIndex.find(queryLeft, queryRight, (item) => previousBottom <= item.y
        && currentBottom > item.y && overlapsHorizontalPath(item));
      if (block) {
        player.y = block.y - player.hitbox.offsetY - player.hitbox.height;
        player.vy = 0;
        return true;
      }
    }
    return false;
  }

  #resolveWorldOverlap(player) {
    const left = player.x + player.hitbox.offsetX;
    const right = left + player.hitbox.width;
    const top = player.y + player.hitbox.offsetY;
    const bottom = top + player.hitbox.height;
    const block = this.#collisionIndex.find(left, right, (item) => right > item.x && left < item.x + item.width
      && bottom > item.y && top < item.y + item.height);
    if (!block) return false;

    const overlapX = Math.min(right, block.x + block.width) - Math.max(left, block.x);
    const overlapY = Math.min(bottom, block.y + block.height) - Math.max(top, block.y);
    if (overlapX <= overlapY) {
      const cameFromRight = player.previousX + player.hitbox.offsetX >= block.x + block.width;
      const centreIsRight = left + player.hitbox.width / 2 >= block.x + block.width / 2;
      player.x = (cameFromRight || centreIsRight)
        ? block.x + block.width - player.hitbox.offsetX
        : block.x - player.hitbox.offsetX - player.hitbox.width;
      player.blockedX = true;
    } else if (player.gravity < 0) {
      player.y = block.y + block.height - player.hitbox.offsetY;
      player.vy = 0;
    } else {
      player.y = block.y - player.hitbox.offsetY - player.hitbox.height;
      player.vy = 0;
    }
    return true;
  }

  #resolveGravityFlipOverlap(player, previousOffsetY) {
    const left = player.x + player.hitbox.offsetX;
    const right = left + player.hitbox.width;
    const top = player.y + player.hitbox.offsetY;
    const bottom = top + player.hitbox.height;
    const previousTop = player.y + previousOffsetY;
    const previousBottom = previousTop + player.hitbox.height;
    const overlapsX = (block) => left < block.x + block.width && right > block.x;
    if (player.gravity < 0) {
      // Normal -> inverted moves the collision box 10 px upward.  Only a
      // block whose bottom lies in that newly entered strip is a ceiling hit;
      // blocks already overlapping vertically are side walls, not teleport
      // targets.
      const enteredCeilings = this.#collisionIndex.filter(left, right,
        (block) => overlapsX(block) && top < block.y + block.height && block.y + block.height <= previousTop);
      if (!enteredCeilings.length) return;
      player.y = Math.max(player.y, ...enteredCeilings.map((block) => block.y + block.height - player.hitbox.offsetY));
    } else {
      // Inverted -> normal moves it 10 px downward; mirror the same rule for
      // newly entered floor tops only.
      const enteredFloors = this.#collisionIndex.filter(left, right,
        (block) => overlapsX(block) && bottom > block.y && block.y >= previousBottom);
      if (!enteredFloors.length) return;
      player.y = Math.min(player.y, ...enteredFloors.map((block) => block.y - player.hitbox.offsetY - player.hitbox.height));
    }
    player.vy = 0;
  }

  #separateOverlappingPlayers(dt) {
    const players = [...this.#players.values()].filter((player) => !player.finished && !player.eliminated && player.phaseTicks <= 0);
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
    const horizontalOverlap = Math.min(firstLeft + first.hitbox.width, secondLeft + second.hitbox.width) - Math.max(firstLeft, secondLeft);
    const firstTop = first.y + first.hitbox.offsetY;
    const secondTop = second.y + second.hitbox.offsetY;
    const verticalOverlap = Math.min(firstTop + first.hitbox.height, secondTop + second.hitbox.height) - Math.max(firstTop, secondTop);
    if (horizontalOverlap <= 0 || verticalOverlap <= 0) return;

    const firstPreviousTop = first.previousY + first.hitbox.offsetY;
    const secondPreviousTop = second.previousY + second.hitbox.offsetY;
    const firstPreviousBottom = firstPreviousTop + first.hitbox.height;
    const secondPreviousBottom = secondPreviousTop + second.hitbox.height;
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
        first.worldContactDirty = true;
        second.worldContactDirty = true;
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
        first.worldContactDirty = true;
        second.worldContactDirty = true;
      }
      first.vy = 0;
      second.vy = 0;
      return;
    }

    const upper = firstTop <= secondTop ? first : second;
    const lower = upper === first ? second : first;
    upper.y = lower.y + lower.hitbox.offsetY - upper.hitbox.offsetY - upper.hitbox.height;
    upper.worldContactDirty = true;
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
    follower.x = leader.x - follower.hitbox.width * 1.1;
    follower.worldContactDirty = true;
  }

  #collectItems(player) {
    if (player.finished || player.eliminated) return;
    const playerCentreX = player.x + player.hitbox.offsetX + player.hitbox.width / 2;
    const playerCentreY = player.y + player.hitbox.offsetY + player.hitbox.height / 2;
    for (const item of this.#items) {
      if (!item.active || Math.abs(playerCentreX - item.x) > ITEM_PICKUP_RADIUS_X || Math.abs(playerCentreY - item.y) > ITEM_PICKUP_RADIUS_Y) continue;
      item.active = false;
      if (item.type === ITEM_TYPES.gravityBurst) {
        for (const runner of this.#players.values()) {
          if (runner.finished || runner.eliminated) continue;
          const previousOffsetY = runner.hitbox.offsetY;
          runner.gravity *= -1;
          runner.hitbox.offsetY = playerOffsetY(runner.gravity, runner.hitbox.height);
          runner.flipWallGuard = 4;
          this.#resolveGravityFlipOverlap(runner, previousOffsetY);
        }
      } else if (item.type === ITEM_TYPES.phase) {
        player.phaseTicks = Math.max(player.phaseTicks, ITEM_EFFECT_TICKS.phase);
      } else if (item.type === ITEM_TYPES.speedBoost) {
        this.#speedControlTicks = Math.max(this.#speedControlTicks, ITEM_EFFECT_TICKS.speedBoost);
        for (const runner of this.#players.values()) {
          if (runner.finished || runner.eliminated) continue;
          runner.speedBoostTicks = Math.max(runner.speedBoostTicks, ITEM_EFFECT_TICKS.speedBoost);
        }
      } else if (item.type === ITEM_TYPES.sizeUp) {
        player.sizeTicks = Math.max(player.sizeTicks, ITEM_EFFECT_TICKS.sizeUp);
        this.#setPlayerSize(player, SIZE_UP_MULTIPLIER);
      } else if (item.type === ITEM_TYPES.sizeDown) {
        player.sizeTicks = Math.max(player.sizeTicks, ITEM_EFFECT_TICKS.sizeDown);
        this.#setPlayerSize(player, SIZE_DOWN_MULTIPLIER);
      }
    }
  }

}
