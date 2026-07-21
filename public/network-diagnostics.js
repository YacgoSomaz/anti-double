function rounded(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * ratio) - 1)];
}

function boundedPush(values, value, limit) {
  values.push(value);
  if (values.length > limit) values.shift();
}

export function createPacketTimingMonitor(limit = 120) {
  const intervals = [];
  const tickGaps = [];
  let lastNow;
  let lastTick;

  return {
    observe({ now, tick }) {
      if (!Number.isFinite(now)) return;
      if (Number.isFinite(lastNow)) boundedPush(intervals, Math.max(0, now - lastNow), limit);
      lastNow = now;
      if (Number.isInteger(tick) && Number.isInteger(lastTick) && tick > lastTick) boundedPush(tickGaps, tick - lastTick, limit);
      if (Number.isInteger(tick)) lastTick = tick;
    },
    summary() {
      const skippedTicks = tickGaps.reduce((total, gap) => total + Math.max(0, gap - 2), 0);
      return {
        samples: intervals.length,
        averageIntervalMs: rounded(intervals.reduce((total, value) => total + value, 0) / (intervals.length || 1)),
        p95IntervalMs: rounded(percentile(intervals, 0.95)),
        maxIntervalMs: rounded(Math.max(0, ...intervals)),
        maxTickGap: Math.max(0, ...tickGaps),
        skippedTicks
      };
    }
  };
}

export function createFrameTimingMonitor(limit = 120) {
  const intervals = [];
  let lastNow;

  return {
    observe(now) {
      if (!Number.isFinite(now)) return;
      if (Number.isFinite(lastNow)) boundedPush(intervals, Math.max(0, now - lastNow), limit);
      lastNow = now;
    },
    summary() {
      const droppedFrames = intervals.filter((interval) => interval > 1000 / 30).length;
      return {
        samples: intervals.length,
        averageFrameMs: rounded(intervals.reduce((total, value) => total + value, 0) / (intervals.length || 1)),
        p95FrameMs: rounded(percentile(intervals, 0.95)),
        maxFrameMs: rounded(Math.max(0, ...intervals)),
        droppedFrames
      };
    }
  };
}

export function formatDiagnostics(packet, frame) {
  if (!packet.samples || !frame.samples) return '诊断采样中…';
  const fps = Math.round(1000 / frame.averageFrameMs);
  const packetText = `包 ${packet.averageIntervalMs}/${packet.p95IntervalMs}/${packet.maxIntervalMs}ms`;
  const tickText = packet.skippedTicks ? `tick 跳 ${packet.skippedTicks}` : `tick 最大+${packet.maxTickGap}`;
  const frameText = `画面 ${fps}fps${frame.droppedFrames ? ` 掉帧${frame.droppedFrames}` : ''}`;
  return `${packetText} · ${tickText} · ${frameText}`;
}
