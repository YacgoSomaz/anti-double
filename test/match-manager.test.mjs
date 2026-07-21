import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchManager } from '../src/match-manager.mjs';

const tinyLevel = {
  tileSize: 48,
  colliders: [],
  spawns: [
    { x: 0, y: 0, gravity: 1, speedX: 120 },
    { x: 0, y: 0, gravity: -1, speedX: 120 },
    { x: 0, y: 0, gravity: 1, speedX: 120 },
    { x: 0, y: 0, gravity: -1, speedX: 120 }
  ]
};

test('keeps players in isolated four-player lobbies and broadcasts play only after the host starts', () => {
  const matches = new MatchManager(tinyLevel);
  assert.equal(matches.join('ROOM1', 'a').player.slot, 1);
  assert.equal(matches.join('ROOM1', 'b').player.slot, 2);
  assert.equal(matches.join('ROOM2', 'c').player.slot, 1);

  assert.equal(matches.input('b', { type: 'flip', sequence: 1 }).error, 'waiting_for_host');
  assert.equal(matches.start('b').error, 'not_host');
  assert.equal(matches.start('a').ok, true);
  assert.equal(matches.input('b', { type: 'flip', sequence: 1 }).ok, true);
  const updates = matches.tick(1 / 30);

  assert.equal(updates.length, 2);
  const roomOne = updates.find((update) => update.room === 'ROOM1');
  assert.equal(roomOne.recipients.includes('a'), true);
  assert.equal(roomOne.recipients.includes('b'), true);
  assert.equal(roomOne.snapshot.players[1].gravity, 1);
});

test('validates room codes and rejects input from clients not in a match', () => {
  const matches = new MatchManager(tinyLevel);
  assert.deepEqual(matches.join('bad room', 'a'), { ok: false, error: 'invalid_room' });
  assert.deepEqual(matches.input('unknown', { type: 'flip', sequence: 1 }), { ok: false, error: 'not_in_match' });
});

test('releases a completed room so its code can immediately host a fresh match', () => {
  const resultsLevel = {
    ...tinyLevel,
    spawns: [
      { x: 0, y: 500, gravity: 1, speedX: 0 },
      { x: 0, y: 500, gravity: 1, speedX: 0 }
    ]
  };
  const matches = new MatchManager(resultsLevel);
  matches.join('AGAIN', 'a');
  matches.join('AGAIN', 'b');
  matches.start('a');
  matches.tick(1 / 40);

  assert.equal(matches.closeCompletedRoom('AGAIN'), true);
  assert.equal(matches.roomState('AGAIN'), null);
  assert.equal(matches.input('a', { type: 'flip', sequence: 1 }).error, 'not_in_match');
  assert.equal(matches.join('AGAIN', 'new-player').player.slot, 1);
});
