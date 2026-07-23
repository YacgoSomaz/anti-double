import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../src/game-room.mjs';
import { MatchManager } from '../src/match-manager.mjs';

const level = {
  tileSize: 48,
  colliders: [],
  spawns: [
    { x: 0, y: 0, gravity: 1, speedX: 120 },
    { x: 0, y: 0, gravity: -1, speedX: 120 },
    { x: 0, y: 0, gravity: 1, speedX: 120 },
    { x: 0, y: 0, gravity: -1, speedX: 120 }
  ]
};

test('lets a lobby player select a whitelisted skin without changing physics', () => {
  const room = new GameRoom(level);
  room.join('player-1', '皮肤测试');
  const before = room.snapshot().players[0];

  assert.deepEqual(room.selectSkin('player-1', 'red'), { ok: true, skinId: 'red' });

  const after = room.snapshot().players[0];
  assert.equal(after.skinId, 'red');
  assert.deepEqual(after.hitbox, before.hitbox);
  assert.equal(after.vx, before.vx);
  assert.equal(room.selectSkin('player-1', 'not-a-skin').error, 'invalid_skin');
});

test('rejects skin changes after the authoritative race begins', () => {
  const matches = new MatchManager(level);
  matches.join('SKINS', 'player-1');
  matches.start('player-1');

  assert.deepEqual(matches.selectSkin('player-1', 'green'), { ok: false, error: 'match_started', room: 'SKINS' });
});
