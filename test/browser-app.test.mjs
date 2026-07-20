import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRealtimeServer } from '../src/realtime-server.mjs';

test('serves the playable browser client with strict security headers', async (context) => {
  const level = { tileSize: 48, colliders: [], spawns: [{ x: 0, y: 0, gravity: 1, speedX: 120 }] };
  const realtime = createRealtimeServer({ level, autoTick: false });
  realtime.server.listen(0, '127.0.0.1');
  await once(realtime.server, 'listening');
  context.after(() => realtime.close());
  const { port } = realtime.server.address();

  const response = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
  assert.match(await response.text(), /G-Switch Online/);

  const sprite = await fetch(`http://127.0.0.1:${port}/assets/players/player-blue.png`);
  assert.equal(sprite.status, 200);
  assert.equal(sprite.headers.get('content-type'), 'image/png');
  const background = await fetch(`http://127.0.0.1:${port}/assets/scene/background.png`);
  assert.equal(background.status, 200);
  const hud = await fetch(`http://127.0.0.1:${port}/assets/scene/hud.png`);
  assert.equal(hud.status, 200);

  const health = await fetch(`http://127.0.0.1:${port}/health`);
  assert.deepEqual(await health.json(), { ok: true });
  assert.equal((await fetch(`http://127.0.0.1:${port}/`, { method: 'HEAD' })).status, 200);
  assert.equal((await fetch(`http://127.0.0.1:${port}/missing.txt`)).status, 404);
  assert.equal((await fetch(`http://127.0.0.1:${port}/`, { method: 'POST' })).status, 405);
});

test('keeps the join overlay hidden after the client has joined a room', async () => {
  const stylesheet = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  assert.match(stylesheet, /#overlay\[hidden\]\s*\{\s*display\s*:\s*none\s*;\s*\}/);
});

test('ships a Chinese original-style opening menu and animated end screen', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const stylesheet = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');

  assert.match(html, /id="front-screen"/);
  assert.match(html, /id="menu-start"/);
  assert.match(html, /id="end-screen"/);
  assert.match(html, /开始联机/);
  assert.match(html, /本局结束/);
  assert.match(stylesheet, /menu-background\.png/);
  assert.match(stylesheet, /loading-splash\.png/);
  assert.match(stylesheet, /multi-end\.png/);
  assert.match(app, /showEndScreen/);
});

test('loads the original MP02 decoration layer rather than drawing collision tiles as scenery', async () => {
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  assert.match(app, /data\/marathon\.json/);
  assert.match(app, /mp02-visual\.json/);
  assert.match(app, /drawDecorations/);
  assert.match(app, /scene\.hud/);
  assert.match(app, /requestAnimationFrame/);
  assert.match(app, /renderPlayer/);
  assert.match(app, /localSlot/);
  assert.match(app, /advanceCamera/);
  assert.doesNotMatch(app, /renderPlayers\[0\]\?\.x/);
});
