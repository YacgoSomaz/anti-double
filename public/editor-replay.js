export const EDITOR_REPLAY_VERSION = 1;
export const EDITOR_TEST_PACKAGE_VERSION = 1;

export function createReplay() { return { version: EDITOR_REPLAY_VERSION, events: [] }; }

export function recordFlip(replay, tick) {
  if (!Number.isInteger(tick) || tick < 1) throw new TypeError('回放 tick 无效');
  const lastTick = replay?.events?.at(-1)?.tick ?? 0;
  if (tick <= lastTick) throw new RangeError('回放 tick 必须递增');
  return { version: EDITOR_REPLAY_VERSION, events: [...replay.events, { type: 'flip', tick }] };
}

export function eventsAtTick(replay, tick) {
  return replay?.events?.filter((event) => event.tick === tick) ?? [];
}

function validateReplay(replay) {
  if (!replay || replay.version !== EDITOR_REPLAY_VERSION || !Array.isArray(replay.events)) return false;
  return replay.events.every((event, index) => event?.type === 'flip' && Number.isInteger(event.tick) && event.tick > 0 && (!index || event.tick > replay.events[index - 1].tick));
}

export function exportTestPackage({ draft, replay, parameters = {}, diff = null, note = '' }) {
  if (!draft || typeof draft !== 'object' || !validateReplay(replay)) throw new TypeError('测试包无效');
  return JSON.stringify({ version: EDITOR_TEST_PACKAGE_VERSION, createdAt: new Date().toISOString(), note: String(note).slice(0, 500), draft, parameters, diff, replay }, null, 2);
}

export function parseTestPackage(text) {
  try {
    const value = JSON.parse(text);
    if (!value || value.version !== EDITOR_TEST_PACKAGE_VERSION || !value.draft || !validateReplay(value.replay)) throw new Error('格式不受支持');
    return structuredClone(value);
  } catch (error) { throw new Error(`测试包无效：${error.message}`); }
}
