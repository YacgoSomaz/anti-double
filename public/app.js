import { buildVisualDrawList, visibleDrawList } from '/visual-cache.js';
import { assetUrl } from '/asset-urls.js';
import { animationFrame, frameSourceRect, MORPH_DURATION_MS, morphFrame, PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH } from '/player-animation.js';
import { advanceCamera, reconcileCamera } from '/camera.js';
import { advancePresentation, presentationOffset } from '/player-presentation.js';
import { drawPlayerSprite } from '/player-render.js';
import { createFrameTimingMonitor, createPacketTimingMonitor, formatDiagnostics } from '/network-diagnostics.js';
import { createLatestRaceStateBuffer } from '/latest-race-state.js';
import { applyRaceViewport, RACE_BACKDROP_SCALE, worldViewportBounds } from '/race-viewport.js';
import { ELIMINATION_BOUNDARY_FRAME_COUNT, eliminationBoundaryFrame } from '/elimination-boundary.js';
import { GameRoom } from '/solo-game.mjs';
import { DEFAULT_DEV_TUNING, createDeveloperPanel, exportDevConfig, isDeveloperMode, loadDevTuning, parseDevConfig, saveDevTuning } from '/dev-mode.js';
import { applyEditorDraftToLevel, loadCachedEditorDraft } from '/playable-map.js';

const canvas = document.querySelector('#game');
const gameShell = document.querySelector('.game-shell');
const ctx = canvas.getContext('2d');
const room = document.querySelector('#room');
const nickname = document.querySelector('#nickname');
const join = document.querySelector('#menu-start');
const soloStart = document.querySelector('#solo-start');
const flip = document.querySelector('#flip');
const soundToggle = document.querySelector('#sound-toggle');
const pageRefresh = document.querySelector('#page-refresh');
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
const openingBeam = loadImage(assetUrl('assets/effects/checkpoint-beamlight.png'));
const eliminationBoundary = loadImage(assetUrl('assets/effects/elimination-boundary.png'));
const decorationImages = new Map();
const visualPlacementCache = new WeakMap();
const readyVisualMaps = new WeakSet();
const FINAL_TUNNEL_ASSETS = new Set([
  '177_PlayState_ImgFinalTunnel.png',
  '194_PlayState_ImgFinalTunnelFront.png',
  '278_PlayState_ImgFinalTunnelWindow.png'
]);
// 每局开始前完成整个 marathon 的地图、装饰和图像解码。它们均使用
// content-hash URL，浏览器会复用磁盘缓存；比赛中不再触发资源加载。
const RACE_RESOURCE_TOTAL = 15;
// Recovered original 19×84 checkpoint beam. It falls from above to the runner
// centre, fades away at the impact point, then lets the runner materialise.
const OPENING_BEAM_THICKNESS = 64;
const OPENING_BEAM_DURATION_MS = 900;
const OPENING_BEAM_APPROACH_MS = 560;
const OPENING_SEQUENCE_DURATION_MS = OPENING_BEAM_DURATION_MS + MORPH_DURATION_MS;
const ELIMINATION_BOUNDARY_WIDTH = 12;
const ELIMINATION_BOUNDARY_GLOW_WIDTH = 18;
const packetTiming = createPacketTimingMonitor(); const frameTiming = createFrameTimingMonitor(); let lastDiagnosticsUpdate = 0;
let socket; let joinTimeout; let sequence = 0; let state = { phase: 'lobby', players: [] }; let map; let bakedLevel; let visualMaps = new Map(); let lastPing = 0; let stateReceivedAt = performance.now(); let localSlot; let roomCode; let cameraX = 0; let cameraUpdatedAt = performance.now(); let showingEnd = false; let resourcesReady = false; let raceReady = false; let resourcesFailed = false; let readySent = false; let readySoundPlayed = false; let raceResourceLoaded = 0; let soloRoom; let soloAccumulator = 0; let soloLastAt = 0;
const developerMode = isDeveloperMode(location.search);
const devTuning = developerMode ? loadDevTuning(localStorage) : { ...DEFAULT_DEV_TUNING };
let devPanelState; let devPaused = false; let devSlowMotion = false; let lastDevReadout = 0;
const latestRaceState = createLatestRaceStateBuffer();

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
  loadJson('/data/mp03-visual.json'), loadJson('/data/mp04-visual.json'),
]).then(async ([level, mp02, mp03, mp04]) => {
  bakedLevel = level;
  const cachedDraft = loadCachedEditorDraft();
  map = applyEditorDraftToLevel(bakedLevel, cachedDraft);
  if (cachedDraft) courseStatus.textContent = '已应用本地赛道草稿 · 单人模式使用编辑器调整';
  visualMaps = new Map([['mp02', mp02], ['mp03', mp03], ['mp04', mp04]]);
  await Promise.all([mp02, mp03, mp04].map(preloadDecorationImages));
  draw();
});
const minimumSplash = new Promise((resolve) => setTimeout(resolve, 900));
// The menu may become visible after the splash, but joining a room is held
// back until every first-race resource has decoded.  A player can therefore
// never be marked ready while their own runner atlas is still blank.
minimumSplash.then(() => {
  if (!frontScreen.hidden) frontScreen.dataset.phase = 'menu';
});
Promise.all([mapLoad, ...[...sprites, ...Object.values(scene), openingBeam, eliminationBoundary].map((image) => waitForImage(image).then(markRaceResourceLoaded))]).then(() => {
  raceReady = true;
  resourcesReady = true;
  join.disabled = false;
  join.textContent = '开始联机';
  soloStart.disabled = false;
  soloStart.textContent = '单人开始';
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
  soloStart.textContent = '资源加载失败';
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
  soloRoom = undefined; socket?.close(); sequence = 0; localSlot = undefined; roomCode = room.value.trim().toUpperCase(); state = { phase: 'lobby', players: [] }; cameraX = 0; cameraUpdatedAt = performance.now(); showingEnd = false; readySent = false; readySoundPlayed = false; latestRaceState.reset();
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
async function startSolo() {
  if (resourcesFailed || !raceReady || !map) return setStatus(resourcesFailed ? '资源加载失败，请刷新重试' : '角色和赛道仍在加载');
  if (!nickname.value.trim()) return setStatus('请输入昵称');
  // Re-read the editor cache at click time. The editor and game are often
  // kept open in separate tabs, so a one-time map-load read would leave this
  // page using stale spawn coordinates after the editor saves a draft.
  const cachedDraft = loadCachedEditorDraft();
  map = applyEditorDraftToLevel(bakedLevel, cachedDraft);
  if (cachedDraft) courseStatus.textContent = '已应用最新本地赛道草稿 · 单人模式';
  await unlockAudio();
  clearTimeout(joinTimeout);
  socket?.close(); socket = undefined; latestRaceState.reset();
  sequence = 0; localSlot = 1; roomCode = undefined; showingEnd = false; soloAccumulator = 0; soloLastAt = performance.now();
  soloRoom = new GameRoom(map);
  if (developerMode) soloRoom.setDebugTuning(devTuning);
  soloRoom.join('solo', nickname.value, true);
  soloRoom.start('solo');
  state = soloRoom.snapshot();
  stateReceivedAt = soloLastAt; cameraX = state.cameraX; cameraUpdatedAt = soloLastAt;
  frontScreen.hidden = true; endScreen.hidden = true; overlay.hidden = true; spectatorBanner.hidden = true;
  flip.disabled = false; players.textContent = '单人模式 · 本地运行'; courseStatus.textContent = '单人赛道 · 本地物理';
  stopAudio(menuMusic); playAudio(music); setStatus('单人模式 · 本地运行', true);
}
function initialiseDeveloperMode() {
  if (!developerMode) return;
  devPanelState = createDeveloperPanel(devTuning, (tuning) => {
    saveDevTuning(localStorage, tuning);
    soloRoom?.setDebugTuning(tuning);
  });
  document.body.append(devPanelState.panel);
  devPanelState.panel.addEventListener('click', async (event) => {
    const action = event.target.dataset.devAction;
    if (!action) return;
    if (action === 'restart') { devPaused = false; await startSolo(); }
    if (action === 'pause') { devPaused = !devPaused; event.target.textContent = devPaused ? '继续' : '暂停'; }
    if (action === 'step' && soloRoom) {
      state = soloRoom.tick(1 / 40); soloAccumulator = 0; soloLastAt = performance.now();
      stateReceivedAt = soloLastAt; cameraX = state.cameraX; cameraUpdatedAt = soloLastAt;
    }
    if (action === 'slow') { devSlowMotion = !devSlowMotion; event.target.textContent = `慢放：${devSlowMotion ? '开' : '关'}`; }
    if (action === 'preview') {
      const player = state.players[0] ?? { slot: 1, name: nickname.value || '玩家', score: 0 };
      state = { ...state, phase: 'results', players: [player], results: [{ slot: player.slot, rank: 1, outcome: 'finished', score: player.score ?? 0 }] };
      soloRoom = undefined; showingEnd = false; showEndScreen(player);
    }
    if (action === 'reset') { Object.assign(devTuning, DEFAULT_DEV_TUNING); saveDevTuning(localStorage, devTuning); devPanelState.paint(devTuning); soloRoom?.setDebugTuning(devTuning); }
    if (action === 'collapse') { devPanelState.setCollapsed(!devPanelState.panel.classList.contains('collapsed')); }
    if (action === 'export') {
      const blob = new Blob([exportDevConfig(devTuning)], { type: 'application/json' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'gswitch-dev-config.json'; link.click(); URL.revokeObjectURL(link.href);
    }
  });
  devPanelState.panel.addEventListener('change', async (event) => {
    if (event.target.dataset.devAction !== 'import' || !event.target.files?.[0]) return;
    try {
      Object.assign(devTuning, parseDevConfig(await event.target.files[0].text()));
      saveDevTuning(localStorage, devTuning); devPanelState.paint(devTuning); soloRoom?.setDebugTuning(devTuning); setStatus('开发配置已导入', true);
    } catch (error) { setStatus(error.message); }
    event.target.value = '';
  });
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
    introTicksRemaining: Number.isInteger(message.i) ? message.i : 0,
    serverTickIntervalMs: Number.isInteger(message.d) ? message.d / 10 : undefined,
    results: Array.isArray(message.r) ? message.r.map(([slot, rank, outcome, score]) => ({ slot, rank, outcome: outcome ? 'finished' : 'eliminated', score: Math.max(0, Number(score) || 0) })) : [],
    players: message.p.map(([slot, x, y, vx, vy, gravity, flags]) => ({
      ...knownPlayers.get(slot),
      slot, x: x / 100, y: y / 100, vx: vx / 100, vy: vy / 100, gravity,
      finished: Boolean(flags & 1), eliminated: Boolean(flags & 2), blockedX: Boolean(flags & 4)
    }))
  };
}
function handle(message, connection = socket, consumeRaceState = false) {
  if (connection !== socket) return;
  if (message.type === 'state' && message.compact && !consumeRaceState) {
    latestRaceState.offer(message);
    return;
  }
  if (message.type === 'joined') { clearTimeout(joinTimeout); join.disabled = false; localSlot = message.player.slot; roomCode = message.room; cameraX = Math.max(0, message.player.x - canvas.width / 2); cameraUpdatedAt = performance.now(); overlay.hidden = true; frontScreen.hidden = false; frontScreen.dataset.phase = 'lobby'; flip.disabled = true; sendReady(); signalRaceReady(); playAudio(menuMusic); setStatus(raceReady ? `已进入 ${message.room} 等待大厅` : '正在后台加载赛道资源…', true); renderLobby(); return; }
  if (message.type === 'state') {
    const receivedAt = performance.now();
    const presentedCamera = advanceCamera(cameraX, receivedAt - cameraUpdatedAt, state.cameraSpeed);
    const presentedPlayers = new Map(state.players.map((player) => [player.slot, advancePresentation(player, receivedAt - stateReceivedAt, state.cameraSpeed)]));
    state = message.compact ? decodeCompactRaceState(message) : message;
    if (state.phase === 'playing') for (const player of state.players) {
      const presented = presentedPlayers.get(player.slot);
      if (presented && !player.finished && !player.eliminated) {
        const offset = presentationOffset(presented, player);
        player.presentationOffsetX = offset.x;
        player.presentationOffsetY = offset.y;
      }
    }
    stateReceivedAt = receivedAt; packetTiming.observe({ now: stateReceivedAt, tick: state.tick, serverTickIntervalMs: state.serverTickIntervalMs }); players.textContent = `${state.players.length}/4 玩家在线`;
    if (state.phase === 'lobby') { frontScreen.hidden = false; frontScreen.dataset.phase = 'lobby'; spectatorBanner.hidden = true; flip.disabled = true; courseStatus.textContent = '等待房主开始比赛'; renderLobby(); }
    else { frontScreen.hidden = true; }
    const localPlayer = state.players.find((player) => player.slot === localSlot);
    // Compact race packets store the camera in `c`, which is decoded above.
    // Read the normalized state so lobby and compact packets follow one path.
    const authoritativeCamera = Math.max(0, Number(state.cameraX) || 0);
    cameraX = state.phase === 'playing' ? reconcileCamera(authoritativeCamera, presentedCamera) : authoritativeCamera;
    cameraUpdatedAt = stateReceivedAt;
    if (state.phase === 'playing' && state.introTicksRemaining > 0) {
      spectatorBanner.hidden = true;
      flip.disabled = true;
      courseStatus.textContent = '传送中…';
    } else if (state.phase === 'playing' && (localPlayer?.finished || localPlayer?.eliminated)) {
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
      courseStatus.textContent = '赛道：MP03 → MP04 → MP02';
    }
    return;
  }
  if (message.type === 'ready_ok') return;
  if (message.type === 'started') { stopAudio(menuMusic); playAudio(music); setStatus('比赛开始 · 传送中…', true); return; }
  if (message.type === 'pong') { ping.textContent = `${Math.round(performance.now() - lastPing)} ms`; return; }
  if (message.type === 'error') { setStatus(`错误：${message.error}`); }
}
function sendFlip() {
  if (state.phase !== 'playing' || state.introTicksRemaining > 0) return;
  if (soloRoom) {
    playAudio(switchSound, true);
    soloRoom.input('solo', { type:'flip', sequence:++sequence });
    state = soloRoom.snapshot();
    return;
  }
  if (socket?.readyState === WebSocket.OPEN) { playAudio(switchSound, true); socket.send(JSON.stringify({ type:'flip', sequence:++sequence })); }
}
function startMatch() { if (raceReady && socket?.readyState === WebSocket.OPEN && state.phase === 'lobby' && state.hostSlot === localSlot && state.players.every((player) => player.ready)) socket.send(JSON.stringify({ type: 'start' })); }
function showEndScreen(player) {
  if (showingEnd) return;
  showingEnd = true;
  flip.disabled = true;
  // A reconnect/loading veil must never sit over the only escape route from
  // the score board.  Clear both competing layers before revealing it.
  overlay.hidden = true;
  frontScreen.hidden = true;
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
    const score = document.createElement('span');
    score.className = 'rank-score';
    score.textContent = `${Math.max(0, Math.floor(result.score ?? 0))} 分`;
    item.append(avatar, score);
    return item;
  }));
}
function returnToMenu() {
  showingEnd = false;
  clearTimeout(joinTimeout);
  socket?.close(); socket = undefined; latestRaceState.reset(); soloRoom = undefined; soloAccumulator = 0; soloLastAt = performance.now(); state = { phase: 'lobby', players: [] }; localSlot = undefined; roomCode = undefined; sequence = 0;
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
function drawDecorations(visualMap, property, camera, viewport, offsetX = 0, hideFinalTunnel = false) {
  if (!visualMap || !readyVisualMaps.has(visualMap)) return false;
  const visible = visibleDrawList(cachedDecorations(visualMap, property), viewport.left - offsetX, viewport.right - offsetX, viewport.top, viewport.bottom);
  for (const decoration of visible) {
    if (hideFinalTunnel && FINAL_TUNNEL_ASSETS.has(decoration.asset.file)) continue;
    const image = getDecorationImage(decoration.asset);
    if (image.complete && image.naturalWidth) {
      ctx.drawImage(image, offsetX + decoration.x - camera, decoration.y, decoration.width, decoration.height);
    }
  }
  return visible.length > 0;
}
function drawMarathonDecorations(camera, property, viewport) {
  let drawn = false;
  for (const segment of map?.segments ?? []) {
    if (segment.endX < viewport.left || segment.startX > viewport.right) continue;
    const visualMap = visualMaps.get(segment.id);
    if (visualMap) drawn = drawDecorations(visualMap, property, camera, viewport, segment.startX, !segment.isFinal) || drawn;
  }
  return drawn;
}
function renderPlayer(player, now) {
  if (soloRoom) return player;
  const position = advancePresentation(player, now - stateReceivedAt, state.cameraSpeed);
  return { ...player, ...position };
}
function drawPlayerName(player, x, y) {
  const labelY = player.gravity < 0 ? y + PLAYER_FRAME_HEIGHT + 12 : y - 6;
  ctx.save();
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#071319';
  ctx.fillStyle = '#f3fbff';
  ctx.strokeText(player.name, x + PLAYER_FRAME_WIDTH / 2, labelY);
  ctx.fillText(player.name, x + PLAYER_FRAME_WIDTH / 2, labelY);
  ctx.restore();
}
function drawOpeningBeam(x, y, now, openingElapsed) {
  if (!openingBeam.complete || !openingBeam.naturalWidth) return;
  const approach = Math.min(1, openingElapsed / OPENING_BEAM_APPROACH_MS);
  const easedApproach = 1 - (1 - approach) ** 3;
  const dissipate = Math.max(0, Math.min(1, (openingElapsed - 620) / (OPENING_BEAM_DURATION_MS - 620)));
  const targetY = y + PLAYER_FRAME_HEIGHT / 2;
  const startY = -84;
  const headY = startY + (targetY - startY) * easedApproach;
  const tailY = startY + (targetY - startY) * dissipate * 0.36;
  const length = Math.max(8, headY - tailY);
  const centreX = x + PLAYER_FRAME_WIDTH / 2;
  const pulse = 0.84 + Math.sin(now / 28) * 0.1;
  const jitter = Math.sin(now / 19) * (1 + dissipate * 2);
  const drawLayer = (thickness, opacity, offset) => {
    ctx.globalAlpha = Math.max(0, opacity * pulse * (1 - dissipate * 0.84));
    ctx.drawImage(openingBeam, centreX - thickness / 2 + jitter + offset, tailY, thickness, length);
  };
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  drawLayer(OPENING_BEAM_THICKNESS, 0.18, -2);
  drawLayer(42, 0.5, 1);
  drawLayer(24, 1, 0);
  if (approach >= 1) {
    ctx.globalAlpha = (1 - dissipate) * 0.72;
    ctx.drawImage(openingBeam, centreX - OPENING_BEAM_THICKNESS / 2, targetY - 12, OPENING_BEAM_THICKNESS, 24);
  }
  ctx.restore();
}
function drawEliminationBoundary(now) {
  if (!eliminationBoundary.complete || !eliminationBoundary.naturalWidth) return;
  const frameWidth = eliminationBoundary.naturalWidth / ELIMINATION_BOUNDARY_FRAME_COUNT;
  const frame = eliminationBoundaryFrame(now);
  const pulse = 0.94 + Math.sin(now / 37) * 0.06;
  // The visual warning sits on the left view edge. The server retains a short
  // off-screen recovery margin before it marks a runner eliminated.
  const x = -34;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.filter = 'saturate(1.65) contrast(1.18)';
  ctx.globalAlpha = pulse;
  ctx.drawImage(eliminationBoundary, frame * frameWidth, 0, frameWidth, eliminationBoundary.naturalHeight, x, -74, ELIMINATION_BOUNDARY_WIDTH, 650);
  ctx.globalAlpha = pulse * 0.16;
  ctx.drawImage(eliminationBoundary, frame * frameWidth, 0, frameWidth, eliminationBoundary.naturalHeight, x - 3, -74, ELIMINATION_BOUNDARY_GLOW_WIDTH, 650);
  ctx.restore();
}
function drawDeveloperOverlay(playersToDraw, camera, viewport, world) {
  if (!developerMode || !devPanelState) return;
  const { overlays } = devPanelState;
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.font = '11px Arial';
  if (overlays.blocks) {
    ctx.strokeStyle = '#ffb84d';
    for (const tile of map.colliders) {
      const x = tile.x * world.cellSize - camera;
      const y = world.originY - tile.y * world.cellSize;
      if (x < viewport.left - camera - world.cellSize || x > viewport.right - camera || y < viewport.top - world.cellSize || y > viewport.bottom) continue;
      ctx.strokeRect(x, y, world.cellSize, world.cellSize);
    }
  }
  if (overlays.hitboxes) {
    ctx.strokeStyle = '#25efff';
    for (const player of playersToDraw) {
      const hitbox = player.hitbox;
      if (!hitbox) continue;
      ctx.strokeRect(player.x - camera + hitbox.offsetX, player.y + hitbox.offsetY, hitbox.width, hitbox.height);
    }
  }
  if (overlays.centre) {
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#ff4d64';
    ctx.beginPath(); ctx.moveTo(320, -70); ctx.lineTo(320, 570); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ff4d64'; ctx.fillText('镜头中线', 326, 18);
  }
  if (overlays.boundary) {
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#ff2f4f';
    ctx.beginPath(); ctx.moveTo(-34, -70); ctx.lineTo(-34, 570); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ff2f4f'; ctx.fillText('淘汰线', 6, 18);
  }
  ctx.restore();
}
function updateDeveloperReadout(playersToDraw, camera, now) {
  if (!developerMode || !devPanelState || now - lastDevReadout < 120) return;
  lastDevReadout = now;
  const player = playersToDraw[0];
  const output = devPanelState.panel.querySelector('[data-dev-readout]');
  if (!player) { output.textContent = '等待单人局开始…'; return; }
  const screenX = player.x - camera;
  const gap = 320 - screenX;
  output.textContent = `坐标 ${Math.round(player.x)}, ${Math.round(player.y)} · 屏幕 X ${Math.round(screenX)} · 中线差 ${Math.round(gap)} · 角色 ${Math.round(player.vx ?? 0)} · 镜头 ${Math.round(state.cameraSpeed ?? 0)} · ${devPaused ? '已暂停' : '运行中'}`;
}
function draw() {
  ctx.fillStyle='#9bcde3'; ctx.fillRect(0, 0, canvas.width, canvas.height); if (!map) return;
  const now = performance.now();
  const renderPlayers = state.players.map((player) => renderPlayer(player, now));
  // Keep every browser on the server's shared camera.  This is deliberately
  // independent of the local runner and never accumulates prediction error.
  const camera = soloRoom ? cameraX : advanceCamera(cameraX, now - cameraUpdatedAt, state.cameraSpeed);
  const world = map.world ?? { cellSize: 34, originY: 425 };
  updateDeveloperReadout(renderPlayers, camera, now);
  const viewport = worldViewportBounds({ cameraX: camera, width: canvas.width, height: canvas.height });
  ctx.save();
  applyRaceViewport(ctx, canvas.width, canvas.height);
  // The race world is zoomed out by 10%, but the backdrop art is authored to
  // meet the original stage edges.  Counter-scaling preserves those edges and
  // prevents the lower skyline from shrinking away into a blank band.
  const backdropCoordinate = (value, centre) => centre + (value - centre) * RACE_BACKDROP_SCALE;
  const drawBackdrop = (image, scroll, y) => {
    const start = -((camera * scroll) % image.width) - image.width;
    for (let x = start; x < canvas.width + image.width; x += image.width) {
      ctx.drawImage(image, backdropCoordinate(x, canvas.width / 2), backdropCoordinate(y, canvas.height / 2), image.width * RACE_BACKDROP_SCALE, image.height * RACE_BACKDROP_SCALE);
    }
  };
  if (scene.background.complete) ctx.drawImage(scene.background, backdropCoordinate(0, canvas.width / 2), backdropCoordinate(59, canvas.height / 2), scene.background.width * RACE_BACKDROP_SCALE, scene.background.height * RACE_BACKDROP_SCALE);
  if (scene.cityFar.complete) drawBackdrop(scene.cityFar, 0.1, 264);
  if (scene.cityNear.complete) drawBackdrop(scene.cityNear, 0.2, 254);
  if (!drawMarathonDecorations(camera, 'visualInfo', viewport)) for (const tile of map.colliders) {
    const x = tile.x * world.cellSize - camera;
    const y = world.originY - tile.y * world.cellSize;
    if (x <= viewport.left - camera - world.cellSize || x >= viewport.right - camera || y <= viewport.top - world.cellSize || y >= viewport.bottom) continue;
    if (scene.block.complete) ctx.drawImage(scene.block, x, y, world.cellSize, world.cellSize);
    else { ctx.fillStyle = '#68727a'; ctx.fillRect(x, y, world.cellSize, world.cellSize); }
  }
  drawMarathonDecorations(camera, 'frontVisualInfo', viewport);
  drawEliminationBoundary(now);
  drawDeveloperOverlay(renderPlayers, camera, viewport, world);
  for (const player of renderPlayers) {
    if (player.eliminated) continue;
    const x = player.x - camera;
    const y = player.y;
    const sprite = sprites[player.slot - 1];
    const openingElapsed = OPENING_SEQUENCE_DURATION_MS - Math.max(0, Number(state.introTicksRemaining) || 0) * 25;
    const isBeamPhase = state.introTicksRemaining > 0 && openingElapsed < OPENING_BEAM_DURATION_MS;
    if (isBeamPhase) {
      drawOpeningBeam(x, y, now, openingElapsed);
      continue;
    }
    const morphElapsed = Math.max(0, openingElapsed - OPENING_BEAM_DURATION_MS);
    const source = frameSourceRect(state.introTicksRemaining > 0
      ? morphFrame(morphElapsed)
      : animationFrame(now, player.vy !== 0));
    if (sprite.complete && sprite.naturalWidth) {
      drawPlayerSprite(ctx, sprite, source, { ...player, x, y });
    } else { ctx.fillStyle = colors[player.slot - 1]; ctx.fillRect(x + 16, y + 19, 37, 48); }
    drawPlayerName(player, x, y);
  }
  ctx.restore();
  ctx.fillStyle='#fff'; ctx.font='bold 16px Arial'; ctx.fillText(String(Math.floor(state.tick ?? 0)).padStart(3, '0'), 590, 24);
}
join.addEventListener('click', connect); soloStart.addEventListener('click', startSolo); lobbyStart.addEventListener('click', startMatch); nextRound.addEventListener('click', returnToMenu); flip.addEventListener('click', sendFlip); soundToggle.addEventListener('click', toggleSound); pageRefresh.addEventListener('click', () => location.reload()); canvas.addEventListener('click', sendFlip);
fullscreen.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else gameShell.requestFullscreen?.();
});
addEventListener('keydown', (event) => { if(event.code==='Space'&&!event.repeat) {event.preventDefault();sendFlip();} });
setInterval(() => { if(socket?.readyState===WebSocket.OPEN) { lastPing=performance.now(); socket.send(JSON.stringify({type:'ping'})); } }, 2000);
setInterval(sendDiagnostics, 5000);
function applyLatestRaceState() {
  const message = latestRaceState.take();
  if (!message) return;
  // Bypass the queue here: this is the one newest state selected for this
  // display frame, not an inbound network event.
  handle(message, socket, true);
}
function advanceSoloRace(now) {
  if (!soloRoom) return;
  const elapsed = Math.min(100, Math.max(0, now - soloLastAt));
  soloLastAt = now;
  if (devPaused) return;
  soloAccumulator += devSlowMotion ? elapsed * 0.35 : elapsed;
  while (soloAccumulator >= 25 && state.phase === 'playing') {
    state = soloRoom.tick(1 / 40);
    soloAccumulator -= 25;
  }
  stateReceivedAt = now; cameraX = state.cameraX; cameraUpdatedAt = now;
  if (state.phase === 'results' && !showingEnd) {
    flip.disabled = true; spectatorBanner.hidden = true; courseStatus.textContent = '单人赛道已结束';
    showEndScreen(state.players[0]);
  }
}
function animationLoop(now) { advanceSoloRace(now); applyLatestRaceState(); frameTiming.observe(now); updateDiagnostics(now); draw(); requestAnimationFrame(animationLoop); }
initialiseDeveloperMode();
requestAnimationFrame(animationLoop);
