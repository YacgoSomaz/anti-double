import test from 'node:test';
import assert from 'node:assert/strict';
import { createLatestRaceStateBuffer } from '../public/latest-race-state.js';

test('keeps only the newest race snapshot while rendering is behind', () => {
  const buffer = createLatestRaceStateBuffer();

  buffer.offer({ type: 'state', compact: true, tick: 40 });
  buffer.offer({ type: 'state', compact: true, tick: 41 });
  buffer.offer({ type: 'state', compact: true, tick: 42 });

  assert.equal(buffer.take().tick, 42);
});

test('rejects a stale compact snapshot after a newer tick was consumed', () => {
  const buffer = createLatestRaceStateBuffer();

  buffer.offer({ type: 'state', compact: true, tick: 42 });
  buffer.take();

  assert.equal(buffer.offer({ type: 'state', compact: true, tick: 41 }), false);
});
