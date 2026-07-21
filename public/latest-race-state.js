// Race snapshots are disposable presentation data.  When the main thread is
// behind, applying every queued state makes the player watch the past; retain
// only the newest authoritative tick for the next rendered frame.
export function createLatestRaceStateBuffer() {
  let latest;
  let lastAppliedTick = -1;

  return {
    offer(message) {
      const tick = Number(message?.tick);
      if (message?.type !== 'state' || !message.compact || !Number.isInteger(tick)) return false;
      if (tick <= lastAppliedTick || tick <= Number(latest?.tick)) return false;
      latest = message;
      return true;
    },
    take() {
      const next = latest;
      latest = undefined;
      if (next) lastAppliedTick = next.tick;
      return next;
    },
    reset() {
      latest = undefined;
      lastAppliedTick = -1;
    }
  };
}
