import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrameTimingMonitor, createPacketTimingMonitor } from '../public/network-diagnostics.js';

test('reports state arrival jitter and skipped server ticks without changing game state', () => {
  const monitor = createPacketTimingMonitor();
  monitor.observe({ now: 1000, tick: 2 });
  monitor.observe({ now: 1050, tick: 4 });
  monitor.observe({ now: 1130, tick: 8 });

  assert.deepEqual(monitor.summary(), {
    samples: 2,
    averageIntervalMs: 65,
    p95IntervalMs: 80,
    maxIntervalMs: 80,
    maxTickGap: 4,
    skippedTicks: 2
  });
});

test('reports renderer frame drops separately from network arrival timing', () => {
  const monitor = createFrameTimingMonitor();
  monitor.observe(1000);
  monitor.observe(1016);
  monitor.observe(1032);
  monitor.observe(1082);

  assert.deepEqual(monitor.summary(), {
    samples: 3,
    averageFrameMs: 27.3,
    p95FrameMs: 50,
    maxFrameMs: 50,
    droppedFrames: 1
  });
});
