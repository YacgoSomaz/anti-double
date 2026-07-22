import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DEV_TUNING,
  DEV_TUNING_STORAGE_KEY,
  exportDevConfig,
  isDeveloperMode,
  loadDevTuning,
  normalizeDevTuning,
  parseDevConfig,
  saveDevTuning
} from '../public/dev-mode.js';

test('developer mode is explicitly opt-in through ?dev=1', () => {
  assert.equal(isDeveloperMode('?dev=1'), true);
  assert.equal(isDeveloperMode('?room=RUN4'), false);
  assert.equal(isDeveloperMode('?dev=0'), false);
});

test('developer tuning is bounded and preserves only known numeric controls', () => {
  const tuning = normalizeDevTuning({
    cameraSpeedMultiplier: 99,
    recoveryMultiplier: -5,
    gravityMultiplier: '1.25',
    hitboxWidth: 999,
    hitboxHeight: 2,
    eliminationMargin: 80,
    unwanted: 'ignored'
  });
  assert.deepEqual(tuning, {
    ...DEFAULT_DEV_TUNING,
    cameraSpeedMultiplier: 2,
    recoveryMultiplier: 0.1,
    gravityMultiplier: 1.25,
    hitboxWidth: 56,
    hitboxHeight: 28,
    eliminationMargin: 80
  });
});

test('developer settings persist locally and round-trip as portable JSON', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const tuning = normalizeDevTuning({ cameraSpeedMultiplier: 1.4, hitboxWidth: 35 });
  saveDevTuning(storage, tuning);
  assert.equal(values.has(DEV_TUNING_STORAGE_KEY), true);
  assert.deepEqual(loadDevTuning(storage), tuning);
  assert.deepEqual(parseDevConfig(exportDevConfig(tuning)), tuning);
});

test('invalid saved or imported developer configuration safely falls back', () => {
  const storage = { getItem: () => '{not json', setItem() {} };
  assert.deepEqual(loadDevTuning(storage), DEFAULT_DEV_TUNING);
  assert.throws(() => parseDevConfig('{not json'), /配置文件/);
});
