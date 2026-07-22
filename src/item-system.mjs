export const ITEM_TYPES = Object.freeze({
  gravityBurst: 'gravity_burst',
  phase: 'phase',
  speedBoost: 'speed_boost'
});

export const ITEM_TYPE_CODES = Object.freeze({
  [ITEM_TYPES.gravityBurst]: 1,
  [ITEM_TYPES.phase]: 2,
  [ITEM_TYPES.speedBoost]: 3
});

export const ITEM_EFFECT_TICKS = Object.freeze({
  phase: 120,
  speedBoost: 120
});

const ITEM_TYPE_ORDER = Object.freeze([ITEM_TYPES.gravityBurst, ITEM_TYPES.phase, ITEM_TYPES.speedBoost]);
const DEFAULT_COUNT = 18;
const DEFAULT_SEED = 44052;

function number(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, min, max, fallback) {
  return Math.min(max, Math.max(min, number(value, fallback)));
}

function random(seed) {
  let state = (Number(seed) >>> 0) || DEFAULT_SEED;
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ state >>> 15, 1 | state);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function validType(type) {
  return ITEM_TYPE_ORDER.includes(type) ? type : null;
}

function normaliseExplicitItem(item, index) {
  const type = validType(item?.type);
  if (!type || !Number.isFinite(Number(item?.x)) || !Number.isFinite(Number(item?.y))) return null;
  return {
    id: String(item.id ?? `item-${index + 1}`).slice(0, 32),
    type,
    x: Number(item.x),
    y: Number(item.y),
    active: item.active !== false
  };
}

export function createItemState(level) {
  const explicit = Array.isArray(level?.itemSpawns)
    ? level.itemSpawns.map(normaliseExplicitItem).filter(Boolean)
    : [];
  if (explicit.length) return explicit;
  if (!level?.itemConfig || level.itemConfig.enabled === false) return [];

  const finishX = Math.max(1000, number(level.finishX, 10000));
  const count = Math.round(clamp(level.itemConfig.count, 1, 64, DEFAULT_COUNT));
  const seed = number(level.itemConfig.seed, DEFAULT_SEED);
  const nextRandom = random(seed);
  // Keep the first pickup close enough to the starting camera that a short
  // solo run can actually see it before an early elimination.  The remaining
  // pickups still span the full course up to the finish.
  const minX = Math.min(480, Math.max(240, finishX * 0.02));
  const maxX = Math.max(minX + 300, finishX - 500);
  const minimumSpacing = Math.max(180, number(level.itemConfig.minimumSpacing, 420));
  const positions = [];
  for (let index = 0; index < count; index += 1) {
    // Put the first pickup at the beginning of the playable stretch.  Using
    // the centre of the first bucket delayed it by half an item interval;
    // short solo runs could end before ever reaching a pickup.  Keep the
    // final pickup near the finish while distributing the rest evenly.
    const progress = index / Math.max(1, count - 1);
    let x = minX + progress * (maxX - minX);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      x += (nextRandom() - 0.5) * minimumSpacing * 0.7;
      x = Math.min(maxX, Math.max(minX, x));
      if (positions.every((previous) => Math.abs(previous - x) >= minimumSpacing * 0.55)) break;
    }
    positions.push(x);
  }
  positions.sort((first, second) => first - second);
  return positions.map((x, index) => ({
    id: `item-${index + 1}`,
    type: ITEM_TYPE_ORDER[index % ITEM_TYPE_ORDER.length],
    x: Math.round(x * 10) / 10,
    y: [100, 190, 280, 370, 440][Math.floor(nextRandom() * 5)],
    active: true
  }));
}
