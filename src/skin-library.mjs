// Server-side twin of the browser registry.  Keep this intentionally small:
// the authoritative process accepts IDs only, never a client-provided URL or
// sprite configuration.
export const PLAYER_SKINS = Object.freeze([
  Object.freeze({ id: 'demon-a', name: '恶魔骑士', asset: 'player-demon-a.png', visual: 'demon-a', columns: 8, rows: 1 }),
  Object.freeze({ id: 'blue', name: '蓝色重力小子', asset: 'player-blue.png', visual: 'blue', columns: 15, rows: 9 }),
  Object.freeze({ id: 'green', name: '绿色重力小子', asset: 'player-green.png', visual: 'green', columns: 15, rows: 9 }),
  Object.freeze({ id: 'yellow', name: '黄色重力小子', asset: 'player-yellow.png', visual: 'yellow', columns: 15, rows: 9 }),
  Object.freeze({ id: 'red', name: '红色重力小子', asset: 'player-red.png', visual: 'red', columns: 15, rows: 9 })
]);

const SKINS_BY_ID = new Map(PLAYER_SKINS.map((skin) => [skin.id, skin]));
const DEFAULT_SKIN_IDS = Object.freeze(['demon-a', 'green', 'yellow', 'red']);

export function skinById(value) {
  if (typeof value !== 'string') return null;
  return SKINS_BY_ID.get(value.trim().toLowerCase()) ?? null;
}

export function defaultSkinForSlot(slot = 1) {
  const index = Math.max(0, Math.min(DEFAULT_SKIN_IDS.length - 1, Number(slot) - 1 || 0));
  return DEFAULT_SKIN_IDS[index];
}
