function clamp(value, min, max, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
}

export function createLocalNetworkLab({ latencyMs = 0, lossPercent = 0 } = {}) {
  return { latencyMs: Math.round(clamp(latencyMs, 0, 1000, 0)), lossPercent: Math.round(clamp(lossPercent, 0, 95, 0)), queue: [], latest: undefined, dropped: 0 };
}

export function queueSnapshot(lab, snapshot, now) {
  // Tick-derived loss makes a reproduction package stable: the same replay
  // will lose the same snapshots rather than depending on Math.random().
  const drops = ((Number(snapshot?.tick) || 0) * 37) % 100 < lab.lossPercent;
  if (drops) return { ...lab, dropped: lab.dropped + 1 };
  return { ...lab, queue: [...lab.queue, { availableAt: now + lab.latencyMs, snapshot: structuredClone(snapshot) }] };
}

export function deliverSnapshots(lab, now) {
  const ready = lab.queue.filter((packet) => packet.availableAt <= now);
  const queued = lab.queue.filter((packet) => packet.availableAt > now);
  return { ...lab, queue: queued, latest: ready.length ? ready.at(-1).snapshot : lab.latest };
}
