import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalNetworkLab, deliverSnapshots, queueSnapshot } from '../public/editor-network.js';

test('delivers local lab snapshots only after the configured visual latency', () => {
  let lab = createLocalNetworkLab({ latencyMs: 100, lossPercent: 0 });
  lab = queueSnapshot(lab, { tick: 1 }, 1000);
  assert.deepEqual(deliverSnapshots(lab, 1099).latest, undefined);
  assert.deepEqual(deliverSnapshots(lab, 1100).latest, { tick: 1 });
});

test('uses deterministic packet loss so a saved repro remains repeatable', () => {
  let lab = createLocalNetworkLab({ latencyMs: 0, lossPercent: 50 });
  for (let tick = 1; tick <= 8; tick += 1) lab = queueSnapshot(lab, { tick }, tick);
  const delivered = deliverSnapshots(lab, 10);
  assert.equal(delivered.dropped > 0, true);
  assert.equal(delivered.latest.tick <= 8, true);
});
