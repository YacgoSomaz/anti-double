import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER_SKINS, defaultSkinForSlot, skinById } from '../public/skin-library.js';
import { PLAYER_SKINS as SERVER_PLAYER_SKINS } from '../src/skin-library.mjs';

test('ships a whitelist of selectable player skins with an immutable visual contract', () => {
  assert.deepEqual(PLAYER_SKINS.map((skin) => skin.id), ['black-knight', 'demon-a', 'violet-warrior', 'shadow-runner', 'blue', 'green', 'yellow', 'red']);
  assert.deepEqual(skinById('black-knight'), {
    id: 'black-knight', name: '黑骑士', asset: 'player-black-knight.png', visual: 'black-knight', columns: 6, rows: 1
  });
  assert.equal(skinById('demon-a').name, '恶魔小鬼');
  assert.equal(skinById('violet-warrior').columns, 10);
  assert.equal(skinById('shadow-runner').columns, 8);
  assert.equal(skinById('https://untrusted.example/sprite.png'), null);
  assert.equal(defaultSkinForSlot(1), 'black-knight');
  assert.equal(defaultSkinForSlot(2), 'demon-a');
  assert.equal(defaultSkinForSlot(4), 'yellow');
});

test('keeps the server whitelist aligned with the browser skin catalogue', () => {
  assert.deepEqual(SERVER_PLAYER_SKINS, PLAYER_SKINS);
});
