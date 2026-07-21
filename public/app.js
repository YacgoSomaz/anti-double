import { buildVisualDrawList, visibleDrawList } from '/visual-cache.js';
import { assetUrl } from '/asset-urls.js';
import { animationFrame, frameSourceRect, PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH } from '/player-animation.js';
import { advanceCamera, reconcileCamera } from '/camera.js';
import { drawPlayerSprite } from '/player-render.js';
import { createFrameTimingMonitor, createPacketTimingMonitor, formatDiagnostics } from '/network-diagnostics.js';

const canvas = document.querySelector('#game');
const gameShell = document.querySelector('.game-shell');
const ctx = canvas.getContext('2d');
const room = document.querySelector('#room');
const nickname = document.querySelector('#nickname');
const join = document.querySelector('#menu-start');
const flip = document.querySelector('#flip');
const soundToggle = document.querySelector('#sound-toggle');
const overlay = document.querySelector('#overlay');
const frontScreen = document.querySelector('#front-screen');
const endScreen = document.querySelector('#end-screen');
const endRankings = document.querySelector('#end-rankings');
const nextRound = document.querySelector('#next-round');
const spectatorBanner = document.querySelector('#spectator-banner');
const fullscreen = document.querySelector('#fullscreen');
const status = document.querySelector('#status');
const dot = document.querySelector('#dot');
const ping = document.querySelector('#ping');
const diagnostics = document.querySelector('#diagnostics');
const players = document.querySelector('#players');
const courseStatus = document.querySelector('#course-status');
const lobbyRoom = document.querySelector('#lobby-room');
const lobbyHint = document.querySelector('#lobby-hint');
const lobbyPlayers = document.querySelector('#lobby-players');
const lobbyStart = document.querySelector('#lobby-start');
const lobbyProgress = document.querySelector('#lobby-progress');
const lobbyProgressLabel = document.querySelector('#lobby-progress-label');
const lobbyProgressBar = document.querySelector('#lobby-progress-bar');
const NICKNAME_STORAGE_KEY = 'gswitch-online:nickname';
try {
  const savedNickname = localStorage.getItem(NICKNAME_STORAGE_KEY);
  if (savedNickname) nickname.value = savedNickname.slice(0, 12);
  nickname.addEventListener('input', () => {
    const value = nickname.value.trim();
    if (value) localStorage.setItem(NICKNAME_STORAGE_KEY, value.slice(0, 12));
    else localStorage.removeItem(NICKNAME_STORAGE_KEY);
  });
} catch {}
const colors = ['#3ce6df', '#ff626c', '#7ee66b', '#ffd75d'];
const spriteSources = ['player-blue.png', 'player-green.png', 'player-yellow.png', 'player-red.png'];
const roleNames = ['蓝色重力小子', '绿色重力小子', '黄色重力小子', '红色重力小子'];
const music = new Audio(assetUrl('assets/sounds/025_SndMusic.mp3'));
const menuMusic = new Audio(assetUrl('assets/sounds/032_SndMenuMusic.mp3'));
const switchSound = new Audio(assetUrl('assets/sounds/036_SndSwitch.mp3'));
const readySound = new Audio(assetUrl('assets/sounds/038_SndPopupAppear.mp3'));
music.loop = true;
music.volume = 0.22;
menuMusic.loop = true;
menuMusic.volume = 0.2;
switchSound.volume = 0.35;
readySound.volume = 0.45;
let soundEnabled = false;
function playAudio(audio, restart = false) {
  if (!soundEnabled) return;
  if (restart) audio.currentTime = 0;
  audio.play().catch(() => { soundEnabled = false; updateSoundToggle(); });
}
function updateSoundToggle() {
  soundToggle.textContent = `音乐：${soundEnabled ? '开' : '关'}`;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
}
function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}
function primeAudio(audio) {
  audio.muted = true;
  return audio.play().then(() => {
    stopAudio(audio);
    audio.muted = false;
  });
}
async function unlockAudio() {
  soundEnabled = true;
  updateSoundToggle();
  try {
    await Promise.all([primeAudio(music), primeAudio(menuMusic), primeAudio(readySound)]);
  } catch {
    soundEnabled = false;
    music.muted = false;
    menuMusic.muted = false;
    updateSoundToggle();
  }
}
function toggleSound() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) playAudio(state.phase === 'playing' ? music : menuMusic);
  else { music.pause(); menuMusic.pause(); }
  updateSoundToggle();
}
function loadImage(source) {
  const image = new Image();
  image.addEventListener('load', draw);
  image.src = source;
  return image;
}
async function waitForImage(image) {
  if (!image.complete) await new Promise((resolve, reject) => {
    image.addEventListener('load', () => resolve(true), { once: true });
    image.addEventListener('error', () => reject(new Error('图片加载失败')), { once: true });
  });
  if (!image.naturalWidth) throw new Error('图片加载失败');
  // The lobby must wait until the browser can paint each player atlas, not
  // merely until the HTTP response has arrived.  This removes first-race
  // blank runners on browsers that decode PNGs after their load event.
  if (typeof image.decode === 'function') await image.decode();
}
const sprites = spriteSources.map((source) => loadImage(assetUrl(`assets/players/${source}`)));
const scene = {
  background: loadImage(assetUrl('assets/scene/background.png')),
  cityFar: loadImage(assetUrl('assets/scene/city-far.png')),
  cityNear: loadImage(assetUrl('assets/scene/city-near.png')),
  block: loadImage(assetUrl('assets/scene/block.png')),
  hud: loadImage(assetUrl('assets/scene/hud.png'))
};
const decorationImages = new Map();
const visualPlacementCache = new WeakMap();
const readyVisualMaps = new WeakSet();
const FINAL_TUNNEL_ASSETS = new Set([
  '177_PlayState_ImgFinalTunnel.png',
  '194_PlayState_ImgFinalTunnelFront.png',
  '278_PlayState_ImgFinalTunnelWindow.png'
]);
// 首局只依赖完整碰撞地图、MP02 视觉、四个角色和五张公共场景图。
// MP03/MP04 在后台预取，不能再把房间开始按钮卡在后续赛段资源上。
const RACE_RESOURCE_TOTAL = 11;
const packetTiming = createPacketTimingMonitor(); const frameTiming = createFrameTimingMonitor(); let lastDiagnosticsUpdate = 0;
let socket; let joinTimeout; let sequence = 0; let state = { phase: 'lobby', players: [] }; let map; let visualMaps = new Map(); let lastPing = 0; let stateReceivedAt = performance.now(); let localSlot; let roomCode; let cameraX = 0; let cameraUpdatedAt = performance.now(); let showingEnd = false; let resourcesReady = false; let raceReady = false; let resourcesFailed = false; let readySent = false; let readySoundPlayed = false; let raceResourceLoaded = 0;

function updateDiagnostics(now) {
  if (now - lastDiagnosticsUpdate < 500) return;
  lastDiagnosticsUpdate = now;
  diagnostics.textContent = formatDiagnostics(packetTiming.summary(), frameTiming.summary());
}
function sendDiagnostics() {
  if (socket?.readyState !== WebSocket.OPEN) return;
  const packet = packetTiming.summary();
  const frame = frameTiming.summary();
  if (!packet.samples || !frame.samples) return;
  socket.send(JSON.stringify({
    type: 'diagnostics',
    diagnostics: {
      packetP95Ms: Math.round(packet.p95IntervalMs),
      packetMaxMs: Math.round(packet.maxIntervalMs),
      skippedTicks: packet.skippedTicks,
      serverP95Ms: Math.round(packet.serverP95TickIntervalMs),
      frameFps: Math.max(0, Math.round(1000 / frame.averageFrameMs)),
      droppedFrames: frame.droppedFrames
    }
  }));
}

function updateLobbyProgress() {
  const percent = Math.round(raceResourceLoaded / RACE_RESOURCE_TOTAL * 100);
  lobbyProgress.setAttribute('aria-valuenow', String(percent));
  lobbyProgressLabel.textContent = raceReady ? '赛道资源已加载完成' : `赛道资源 ${raceResourceLoaded}/${RACE_RESOURCE_TOTAL} · ${percent}%`;
  lobbyProgressBar.style.width = `${percent}%`;
}
function markRaceResourceLoaded() {
  raceResourceLoaded = Math.min(RACE_RESOURCE_TOTAL, raceResourceLoaded + 1);
  updateLobbyProgress();
}

function loadJson(source, countForRace = true) {
  return fetch(source).then((response) => {
    if (!response.ok) throw new Error(`无法加载 ${source}`);
    return response.json();
  }).then((data) => {
    if (countForRace) markRaceResourceLoaded();
    return data;
  });
}
const mapLoad = Promise.all([
  loadJson('/data/marathon.json'), loadJson('/data/mp02-visual.json'),
]).then(([level, mp02]) => {
  map = level;
  visualMaps = new Map([['mp02', mp02]]);
  void preloadDecorationImages(mp02);
  draw();
});
// 后续赛段不影响人物、碰撞或首局开赛；在大厅/比赛期间静默补齐即可。
const deferredVisualLoad = Promise.all([
  loadJson('/data/mp03-visual.json', false), loadJson('/data/mp04-visual.json', false),
]).then(([mp03, mp04]) => {
  visualMaps.set('mp03', mp03);
  visualMaps.set('mp04', mp04);
  void Promise.all([preloadDecorationImages(mp03), preloadDecorationImages(mp04)]).then(draw);
  draw();
}).catch(() => {});
const minimumSplash = new Promise((resolve) => setTimeout(resolve, 900));
// The menu may become visible after the splash, but joining a room is held
// back until every first-race resource has decoded.  A player can therefore
// never be marked ready while their own runner atlas is still blank.
minimumSplash.then(() => {
  if (!frontScreen.hidden) frontScreen.dataset.phase = 'menu';
});
Promise.all([mapLoad, ...[...sprites, ...Object.values(scene)].map((image) => waitForImage(image).then(markRaceResourceLoaded))]).then(() => {
  raceReady = true;
  resourcesReady = true;
  join.disabled = false;
  join.textContent = '开始联机';
  updateLobbyProgress();
  sendReady();
  signalRaceReady();
  if (localSlot && state.phase === 'lobby') {
    setStatus(`赛道资源已就绪，等待房主开始`, true);
    renderLobby();
  }
}).catch(() => {
  resourcesFailed = true;
  join.textContent = '资源加载失败';
  setStatus('资源加载失败，请刷新重试');
  if (!frontScreen.hidden) frontScreen.dataset.phase = 'menu';
});
function setStatus(value, live = false) { status.textContent = value; dot.classList.toggle('live', live); }
function nextRoomCode(value) {
  const code = String(value ?? '').trim().toUpperCase();
  const suffix = /^(.*?)(\d+)$/.exec(code);
  if (suffix) {
    const candidate = `${suffix[1]}${Number(suffix[2]) + 1}`;
    if (candidate.length <= 12) return candidate;
  }
  return `${code.slice(0, 11)}2`;
}
function joinFailure(error, code) {
  if (error === 'match_started' || error === 'match_finished') {
    const room = nextRoomCode(code);
    return {
      room,
      message: error === 'match_finished'
        ? `上一局已经结束，已改为 ${room}；点击“开始联机”即可创建新房。`
        : `该房间正在比赛，已改为 ${room}；点击“开始联机”即可创建新房。`
    };
  }
  if (error === 'room_full') return { room: null, message: '该房间已满，请更换房间号后重试。' };
  return { room: null, message: '加入房间失败，请重试。' };
}
function sendReady() {
  if (!raceReady || readySent || !localSlot || socket?.readyState !== WebSocket.OPEN) return;
  readySent = true;
  socket.send(JSON.stringify({ type: 'ready' }));
}
function signalRaceReady() {
  if (!raceReady || !localSlot || readySoundPlayed) return;
  readySoundPlayed = true;
  playAudio(readySound, true);
}
async function connect() {
  if (resourcesFailed || !raceReady) return setStatus(resourcesFailed ? '资源加载失败，请刷新重试' : '角色和赛道仍在加载');
  if (!/^[A-Z0-9_-]{3,12}$/i.test(room.value.trim())) return setStatus('房间码为 3–12 位字符');
  if (!nickname.value.trim()) return setStatus('请输入昵称');
  await unlockAudio();
  clearTimeout(joinTimeout);
  socket?.close(); sequence = 0; localSlot = undefined; roomCode = room.value.trim().toUpperCase(); state = { phase: 'lobby', players: [] }; cameraX = 0; cameraUpdatedAt = performance.now(); showingEnd = false; readySent = false; readySoundPlayed = false;
  frontScreen.hidden = true; endScreen.hidden = true; overlay.hidden = false;
  join.disabled = true;
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const connection = new WebSocket(`${protocol}//${location.host}/ws`);
  socket = connection;
  const restoreJoinScreen = (message) => {
    clearTimeout(joinTimeout);
    if (socket !== connection || localSlot) return;
    overlay.hidden = true;
    frontScreen.hidden = false;
    frontScreen.dataset.phase = 'menu';
    join.disabled = !raceReady;
    setStatus(message);
  };
  const abandonJoin = (message) => {
    restoreJoinScreen(message);
    if (socket !== connection || localSlot) return;
    socket = undefined;
    connection.close();
  };
  joinTimeout = setTimeout(() => {
    if (socket !== connection || localSlot) return;
    abandonJoin('加入房间超时，请重试');
  }, 8000);
  connection.addEventListener('open', () => connection.send(JSON.stringify({ type:'join', room:roomCode, name:nickname.value })));
  connection.addEventListener('message', ({ data }) => {
    let message;
    try { message = JSON.parse(data); } catch { abandonJoin('服务响应异常，请重试'); return; }
    if (message.type === 'error' && !localSlot) {
      const failure = joinFailure(message.error, roomCode);
      if (failure.room) room.value = failure.room;
      abandonJoin(failure.message);
      return;
    }
    handle(message, connection);
  });
  connection.addEventListener('close', () => {
    if (socket !== connection) return;
    flip.disabled = true; lobbyStart.disabled = true;
    if (!localSlot) { restoreJoinScreen('连接已断开，请重试'); socket = undefined; }
    else setStatus('连接已断开');
  });
  connection.addEventListener('error', () => abandonJoin('连接失败，请重试'));
}
function renderLobby() {
  if (!localSlot) return;
  lobbyRoom.textContent = roomCode ?? '—';
  const isHost = state.hostSlot === localSlot;
  const allReady = state.players.length > 0 && state.players.every((player) => player.ready);
  lobbyHint.textContent = !raceReady
    ? '正在加载你的赛道资源，加载完成后会提示并允许房主开始。'
    : allReady
    ? (isHost ? '所有成员已就绪，可以开始比赛。' : `所有成员已就绪，等待 玩家 ${state.hostSlot} 开始比赛。`)
    : `正在加载赛道资源（${state.players.filter((player) => player.ready).length}/${state.players.length} 已就绪）`;
  lobbyPlayers.replaceChildren(...[1, 2, 3, 4].map((slot) => {
    const player = state.players.find((item) => item.slot === slot);
    const item = document.createElement('li');
    item.style.setProperty('--role-color', colors[slot - 1]);
    item.classList.toggle('occupied', Boolean(player));
    const label = document.createElement('span');
    label.className = 'lobby-name';
    label.textContent = player?.name ?? `角色 ${slot}`;
    const avatar = document.createElement('span');
    avatar.className = 'lobby-avatar';
    if (player) avatar.style.setProperty('--avatar-image', `url(${assetUrl(`assets/players/${spriteSources[slot - 1]}`)})`);
    const role = document.createElement('em');
    role.textContent = player ? `${roleNames[slot - 1]} · ${player.ready ? '已就绪' : '加载中'}` : '等待加入';
    item.append(label, avatar, role);
    if (slot === state.hostSlot) { const host = document.createElement('b'); host.textContent = '房主'; item.append(host); }
    return item;
  }));
  lobbyStart.disabled = !raceReady || state.phase !== 'lobby' || !isHost || !allReady || socket?.readyState !== WebSocket.OPEN;
}
function decodeCompactRaceState(message) {
  const knownPlayers = new Map(state.players.map((player) => [player.slot, player]));
  return {
    ...message,
    phase: Array.isArray(message.r) ? 'results' : 'playing',
    hostSlot: state.hostSlot,
    cameraX: message.c[0] / 100,
    cameraSpeed: message.c[1] / 100,
    serverTickIntervalMs: Number.isInteger(message.d) ? message.d / 10 : undefined,
    results: Array.isArray(message.r) ? message.r.map(([slot, rank, outcome]) => ({ slot, rank, outcome: outcome ? 'finished' : 'eliminated' })) : [],
    players: message.p.map(([slot, x, y, vx, vy, gravity, flags]) => ({
      ...knownPlayers.get(slot),
      slot, x: x / 100, y: y / 100, vx: vx / 100, vy: vy / 100, gravity,
      finished: Boolean(flags & 1), eliminated: Boolean(flags & 2), blockedX: Boolean(flags & 4)
    }))
  };
}
function handle(message, connection = socket) {
  if (connection !== socket) return;
  if (message.type === 'joined') { clearTimeout(joinTimeout); join.disabled = false; localSlot = message.player.slot; roomCode = message.room; cameraX = Math.max(0, message.player.x - canvas.width / 2); cameraUpdatedAt = performance.now(); overlay.hidden = true; frontScreen.hidden = false; frontScreen.dataset.phase = 'lobby'; flip.disabled = true; sendReady(); signalRaceReady(); playAudio(menuMusic); setStatus(raceReady ? `已进入 ${message.room} 等待大厅` : '正在后台加载赛道资源…', true); renderLobby(); return; }
  if (message.type === 'state') {
    const receivedAt = performance.now();
    const presentedCamera = advanceCamera(cameraX, receivedAt - cameraUpdatedAt, state.cameraSpeed);
    state = message.compact ? decodeCompactRaceState(message) : message; stateReceivedAt = receivedAt; packetTiming.observe({ now: stateReceivedAt, tick: state.tick, serverTickIntervalMs: state.serverTickIntervalMs }); players.textContent = `${state.players.length}/4 玩家在线`;
    if (state.phase === 'lobby') { frontScreen.hidden = false; frontScreen.dataset.phase = 'lobby'; spectatorBanner.hidden = true; flip.disabled = true; courseStatus.textContent = '等待房主开始比赛'; renderLobby(); }
    else { frontScreen.hidden = true; }
    const localPlayer = state.players.find((player) => player.slot === localSlot);
    // Compact race packets store the camera in `c`, which is decoded above.
    // Read the normalized state so lobby and compact packets follow one path.
    const authoritativeCamera = Math.max(0, Number(state.cameraX) || 0);
    cameraX = state.phase === 'playing' ? reconcileCamera(authoritativeCamera, presentedCamera) : authoritativeCamera;
    cameraUpdatedAt = stateReceivedAt;
    if (state.phase === 'playing' && (localPlayer?.finished || localPlayer?.eliminated)) {
      flip.disabled = true;
      spectatorBanner.hidden = false;
      spectatorBanner.textContent = localPlayer.finished ? '已完成赛道 · 正在观战，等待本局结束' : '已淘汰 · 正在观战，等待本局结束';
      courseStatus.textContent = '观战中 · 共享镜头仍由服务器控制';
    } else if (state.phase === 'results') {
      spectatorBanner.hidden = true;
      flip.disabled = true;
      courseStatus.textContent = '本局排名已确定';
      if (localPlayer) showEndScreen(localPlayer);
    } else {
      spectatorBanner.hidden = true;
      flip.disabled = false;
      courseStatus.textContent = '赛道：MP02 → MP03 → MP04';
    }
    return;
  }
  if (message.type === 'ready_ok') return;
  if (message.type === 'started') { stopAudio(menuMusic); playAudio(music); setStatus('比赛开始', true); return; }
  if (message.type === 'pong') { ping.textContent = `${Math.round(performance.now() - lastPing)} ms`; return; }
  if (message.type === 'error') { setStatus(`错误：${message.error}`); }
}
function sendFlip() { if (state.phase === 'playing' && socket?.readyState === WebSocket.OPEN) { playAudio(switchSound, true); socket.send(JSON.stringify({ type:'flip', sequence:++sequence })); } }
function startMatch() { if (raceReady && socket?.readyState === WebSocket.OPEN && state.phase === 'lobby' && state.hostSlot === localSlot && state.players.every((player) => player.ready)) socket.send(JSON.stringify({ type: 'start' })); }
function showEndScreen(player) {
  if (showingEnd) return;
  showingEnd = true;
  flip.disabled = true;
  stopAudio(music);
  setStatus('本局排名已确定', true);
  renderRankings(state.results);
  endScreen.hidden = false;
}
function renderRankings(results) {
  endRankings.replaceChildren(...results.map((result) => {
    const player = state.players.find((item) => item.slot === result.slot);
    const item = document.createElement('li');
    item.setAttribute('aria-label', `第 ${result.rank} 名：${player?.name ?? `玩家 ${result.slot}`}`);
    const avatar = document.createElement('span');
    avatar.className = 'rank-avatar';
    avatar.style.setProperty('--avatar-image', `url(${assetUrl(`assets/players/${spriteSources[(player?.slot ?? result.slot) - 1]}`)})`);
    item.append(avatar);
    return item;
  }));
}
function returnToMenu() {
  showingEnd = false;
  clearTimeout(joinTimeout);
  socket?.close(); socket = undefined; state = { phase: 'lobby', players: [] }; localSlot = undefined; roomCode = undefined; sequence = 0;
  stopAudio(music);
  playAudio(menuMusic);
  endScreen.hidden = true; overlay.hidden = true; frontScreen.hidden = false; frontScreen.dataset.phase = 'menu';
  spectatorBanner.hidden = true; endRankings.replaceChildren();
  players.textContent = '等待玩家'; setStatus('未连接');
}
function getDecorationImage(asset) {
  if (decorationImages.has(asset.file)) return decorationImages.get(asset.file);
  const image = new Image();
  image.src = assetUrl(`assets/visual/${asset.file}`);
  decorationImages.set(asset.file, image);
  return image;
}
async function preloadDecorationImages(visualMap) {
  const images = Object.values(visualMap.assets ?? {}).map((asset) => getDecorationImage(asset));
  try {
    await Promise.all(images.map(waitForImage));
    readyVisualMaps.add(visualMap);
  } catch {
    // The renderer keeps a collision-tile fallback if an optional visual fails.
  }
  draw();
}
function cachedDecorations(visualMap, property) {
  let cached = visualPlacementCache.get(visualMap);
  if (!cached) {
    cached = new Map();
    visualPlacementCache.set(visualMap, cached);
  }
  if (!cached.has(property)) cached.set(property, buildVisualDrawList(visualMap, property));
  return cached.get(property);
}
function drawDecorations(visualMap, property, camera, offsetX = 0, hideFinalTunnel = false) {
  if (!visualMap || !readyVisualMaps.has(visualMap)) return false;
  const visible = visibleDrawList(cachedDecorations(visualMap, property), camera - offsetX, camera - offsetX + canvas.width, 0, canvas.height);
  for (const decoration of visible) {
    if (hideFinalTunnel && FINAL_TUNNEL_ASSETS.has(decoration.asset.file)) continue;
    const image = getDecorationImage(decoration.asset);
    if (image.complete && image.naturalWidth) {
      ctx.drawImage(image, offsetX + decoration.x - camera, decoration.y, decoration.width, decoration.height);
    }
  }
  return visible.length > 0;
}
function drawMarathonDecorations(camera, property) {
  let drawn = false;
  for (const segment of map?.segments ?? []) {
    if (segment.endX < camera || segment.startX > camera + canvas.width) continue;
    const visualMap = visualMaps.get(segment.id);
    if (visualMap) drawn = drawDecorations(visualMap, property, camera, segment.startX, !segment.isFinal) || drawn;
  }
  return drawn;
}
function renderPlayer(player, now) {
  const elapsed = Math.min(50, Math.max(0, now - stateReceivedAt)) / 1000;
  return { ...player, x: player.x + (player.blockedX ? 0 : player.vx * elapsed), y: player.y + player.vy * elapsed };
}
function draw() {
  ctx.fillStyle='#9bcde3'; ctx.fillRect(0, 0, canvas.width, canvas.height); if (!map) return;
  const now = performance.now();
  const renderPlayers = state.players.map((player) => renderPlayer(player, now));
  // Keep every browser on the server's shared camera.  This is deliberately
  // independent of the local runner and never accumulates prediction error.
  const camera = advanceCamera(cameraX, now - cameraUpdatedAt, state.cameraSpeed);
  const world = map.world ?? { cellSize: 34, originY: 425 };
  if (scene.background.complete) ctx.drawImage(scene.background, 0, 59);
  if (scene.cityFar.complete) for (let x = -((camera * 0.1) % scene.cityFar.width); x < canvas.width; x += scene.cityFar.width) ctx.drawImage(scene.cityFar, x, 264);
  if (scene.cityNear.complete) for (let x = -((camera * 0.2) % scene.cityNear.width); x < canvas.width; x += scene.cityNear.width) ctx.drawImage(scene.cityNear, x, 254);
  if (!drawMarathonDecorations(camera, 'visualInfo')) for (const tile of map.colliders) {
    const x = tile.x * world.cellSize - camera;
    const y = world.originY - tile.y * world.cellSize;
    if (x <= -world.cellSize || x >= canvas.width || y <= -world.cellSize || y >= canvas.height) continue;
    if (scene.block.complete) ctx.drawImage(scene.block, x, y, world.cellSize, world.cellSize);
    else { ctx.fillStyle = '#68727a'; ctx.fillRect(x, y, world.cellSize, world.cellSize); }
  }
  drawMarathonDecorations(camera, 'frontVisualInfo');
  for (const player of renderPlayers) {
    if (player.eliminated) continue;
    const x = player.x - camera;
    const y = player.y;
    const sprite = sprites[player.slot - 1];
    const source = frameSourceRect(animationFrame(performance.now(), player.vy !== 0));
    if (sprite.complete && sprite.naturalWidth) {
      drawPlayerSprite(ctx, sprite, source, { ...player, x, y });
    } else { ctx.fillStyle = colors[player.slot - 1]; ctx.fillRect(x + 16, y + 19, 37, 48); }
  }
  ctx.fillStyle='#fff'; ctx.font='bold 16px Arial'; ctx.fillText(String(Math.floor(state.tick ?? 0)).padStart(3, '0'), 590, 24);
}
join.addEventListener('click', connect); lobbyStart.addEventListener('click', startMatch); nextRound.addEventListener('click', returnToMenu); flip.addEventListener('click', sendFlip); soundToggle.addEventListener('click', toggleSound); canvas.addEventListener('click', sendFlip);
fullscreen.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else gameShell.requestFullscreen?.();
});
addEventListener('keydown', (event) => { if(event.code==='Space'&&!event.repeat) {event.preventDefault();sendFlip();} });
setInterval(() => { if(socket?.readyState===WebSocket.OPEN) { lastPing=performance.now(); socket.send(JSON.stringify({type:'ping'})); } }, 2000);
setInterval(sendDiagnostics, 5000);
function animationLoop(now) { frameTiming.observe(now); updateDiagnostics(now); draw(); requestAnimationFrame(animationLoop); }
requestAnimationFrame(animationLoop);
