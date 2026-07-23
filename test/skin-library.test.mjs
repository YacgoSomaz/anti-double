import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER_SKINS, defaultSkinForSlot, skinById } from '../public/skin-library.js';
import { PLAYER_SKINS as SERVER_PLAYER_SKINS } from '../src/skin-library.mjs';

test('ships a whitelist of selectable player skins with an immutable visual contract', () => {
  assert.deepEqual(PLAYER_SKINS.map((skin) => skin.id), ['demon-a', 'blue', 'green', 'yellow', 'red']);
  assert.equal(skinById('demon-a').asset, 'player-demon-a.png');
  assert.equal(skinById('https://untrusted.example/sprite.png'), null);
  assert.equal(defaultSkinForSlot(1), 'demon-a');
  assert.equal(defaultSkinForSlot(4), 'red');
});

test('keeps the server whitelist aligned with the browser skin catalogue', () => {
  assert.deepEqual(SERVER_PLAYER_SKINS, PLAYER_SKINS);
});
