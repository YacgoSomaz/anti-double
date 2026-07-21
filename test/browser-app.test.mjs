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
  assert.equal(Number(sprite.headers.get('content-length')) < 120000, true);
  const background = await fetch(`http://127.0.0.1:${port}/assets/scene/background.png`);
  assert.equal(background.status, 200);
  const hud = await fetch(`http://127.0.0.1:${port}/assets/scene/hud.png`);
  assert.equal(hud.status, 200);
  const music = await fetch(`http://127.0.0.1:${port}/assets/sounds/025_SndMusic.mp3`);
  assert.equal(music.status, 200);
  assert.equal(music.headers.get('content-type'), 'audio/mpeg');
  assert.match(music.headers.get('cache-control'), /must-revalidate/);
  const decoration = await fetch(`http://127.0.0.1:${port}/assets/visual/070_PlayState_ImgBuildingFullWallBlue.png`);
  assert.equal(decoration.status, 200);
  assert.match(decoration.headers.get('cache-control'), /must-revalidate/);
  const map = await fetch(`http://127.0.0.1:${port}/data/marathon.json`);
  assert.equal(map.status, 200);
  assert.match(map.headers.get('cache-control'), /must-revalidate/);
  assert.equal(typeof map.headers.get('etag'), 'string');
  const unchangedMap = await fetch(`http://127.0.0.1:${port}/data/marathon.json`, { headers: { 'If-None-Match': map.headers.get('etag') } });
  assert.equal(unchangedMap.status, 304);
  const assetUrls = await fetch(`http://127.0.0.1:${port}/asset-urls.js`);
  assert.equal(assetUrls.status, 200);
  assert.equal(assetUrls.headers.get('cache-control'), 'no-store');
  assert.match(await assetUrls.text(), /player-blue\.png/);
  const fingerprintedSprite = await fetch(`http://127.0.0.1:${port}/assets/players/player-blue.png?v=content-hash`);
  assert.match(fingerprintedSprite.headers.get('cache-control'), /max-age=31536000/);
  const visualCache = await fetch(`http://127.0.0.1:${port}/visual-cache.js`);
  assert.equal(visualCache.status, 200);
  assert.equal(visualCache.headers.get('cache-control'), 'no-store');
  const menuMusic = await fetch(`http://127.0.0.1:${port}/assets/sounds/032_SndMenuMusic.mp3`);
  assert.equal(menuMusic.status, 200);
  assert.equal(menuMusic.headers.get('content-type'), 'audio/mpeg');

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
  assert.match(html, /id="nickname"/);
  assert.match(html, /id="sound-toggle"/);
  assert.match(html, /id="menu-start" disabled/);
  assert.match(html, /id="lobby-panel"/);
  assert.match(html, /id="lobby-start"/);
  assert.match(html, /id="lobby-progress"/);
  assert.match(html, /id="end-screen"/);
  assert.match(html, /加载赛道资源/);
  assert.match(html, /本局结束/);
  assert.match(stylesheet, /menu-background\.png/);
  assert.match(stylesheet, /loading-splash\.png/);
  assert.match(stylesheet, /multi-end\.png/);
  assert.match(app, /showEndScreen/);
  assert.match(app, /renderLobby/);
  assert.match(app, /lobby-avatar/);
  assert.match(app, /resourcesReady/);
  assert.match(app, /join\.disabled = false/);
  assert.match(app, /if \(resourcesFailed \|\| !raceReady\)/);
  assert.match(app, /025_SndMusic\.mp3/);
  assert.match(app, /032_SndMenuMusic\.mp3/);
  assert.match(app, /state\.cameraX/);
  assert.match(app, /已淘汰/);
  assert.match(app, /raceReady/);
  assert.match(app, /player\.blockedX/);
  assert.match(app, /图片加载失败/);
  assert.match(app, /image\.decode/);
  assert.match(app, /RACE_RESOURCE_TOTAL = 11/);
  assert.match(app, /deferredVisualLoad/);
  assert.match(app, /038_SndPopupAppear\.mp3/);
  assert.match(app, /startMatch/);
  assert.match(app, /joinTimeout/);
  assert.match(app, /加入房间超时，请重试/);
  assert.match(app, /restoreJoinScreen/);
  assert.match(stylesheet, /data-phase="lobby"/);
});

test('keeps eliminated players spectating and renders final server rankings without changing the game stage', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const stylesheet = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');

  assert.match(html, /id="spectator-banner"/);
  assert.match(html, /id="end-rankings"/);
  assert.match(html, /id="fullscreen"/);
  assert.match(app, /state\.phase === 'results'/);
  assert.match(app, /renderRankings/);
  assert.match(app, /观战中/);
  assert.match(app, /requestFullscreen/);
  assert.match(app, /type: 'diagnostics'/);
  assert.match(stylesheet, /width:min\(900px,100%\)/);
  assert.match(html, /canvas id="game" width="640" height="501"/);
});

test('loads every original multiplayer decoration layer rather than drawing collision tiles as scenery', async () => {
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  assert.match(app, /data\/marathon\.json/);
  assert.match(app, /mp02-visual\.json/);
  assert.match(app, /mp03-visual\.json/);
  assert.match(app, /mp04-visual\.json/);
  assert.match(app, /drawDecorations/);
  assert.match(app, /drawMarathonDecorations/);
  assert.match(app, /readyVisualMaps/);
  assert.match(app, /preloadDecorationImages/);
  assert.match(app, /visibleDrawList/);
  assert.match(app, /ImgFinalTunnel/);
  assert.match(app, /scene\.hud/);
  assert.match(app, /requestAnimationFrame/);
  assert.match(app, /renderPlayer/);
  assert.match(app, /localSlot/);
  assert.match(app, /advanceCamera/);
  assert.match(app, /cameraX = Math\.max\(0, Number\(state\.cameraX\) \|\| 0\)/);
  assert.doesNotMatch(app, /cameraX = Math\.max\(cameraX, Number\(message\.cameraX\)/);
  assert.doesNotMatch(app, /renderPlayers\[0\]\?\.x/);
});

test('uses the decoded authoritative camera coordinate for compact race packets', async () => {
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');

  assert.match(app, /cameraX: message\.c\[0\] \/ 100/);
  assert.match(app, /cameraX = Math\.max\(0, Number\(state\.cameraX\) \|\| 0\)/);
  assert.doesNotMatch(app, /cameraX = Math\.max\(0, Number\(message\.cameraX\) \|\| 0\)/);
});

test('ships the recovered visual and foreground placements for all three multiplayer courses', async () => {
  const expected = new Map([
    ['mp02', [1146, 77]],
    ['mp03', [1443, 55]],
    ['mp04', [1842, 80]],
  ]);
  for (const [course, [visualCount, frontVisualCount]] of expected) {
    const file = await readFile(new URL(`../public/data/${course}-visual.json`, import.meta.url), 'utf8');
    const data = JSON.parse(file);
    assert.equal(data.visualInfo.length, visualCount);
    assert.equal(data.frontVisualInfo.length, frontVisualCount);
    assert.equal(Object.keys(data.assets).length > 0, true);
  }
});
