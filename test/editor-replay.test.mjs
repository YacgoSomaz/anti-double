import test from 'node:test';
import assert from 'node:assert/strict';
import { createReplay, eventsAtTick, exportTestPackage, parseTestPackage, recordFlip } from '../public/editor-replay.js';

test('records monotonic flip inputs and returns them at the exact physics tick', () => {
  let replay = createReplay();
  replay = recordFlip(replay, 4);
  replay = recordFlip(replay, 9);
  assert.deepEqual(eventsAtTick(replay, 4), [{ type: 'flip', tick: 4 }]);
  assert.deepEqual(eventsAtTick(replay, 5), []);
  assert.throws(() => recordFlip(replay, 4), /递增/);
});

test('exports a portable test package containing an editor draft and replay', () => {
  const draft = { version: 1, tileSize: 34, colliders: [], spawns: [{ x: 1, y: 1, gravity: 1, speedX: 100 }] };
  const replay = recordFlip(createReplay(), 3);
  const value = parseTestPackage(exportTestPackage({ draft, replay, note: '穿墙复现' }));
  assert.equal(value.note, '穿墙复现');
  assert.deepEqual(value.replay.events, [{ type: 'flip', tick: 3 }]);
  assert.throws(() => parseTestPackage('{"version":2}'), /测试包/);
});
