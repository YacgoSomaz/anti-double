import { projectVisual } from '/visual-projection.js';
import { animationFrame, frameSourceRect, PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH } from '/player-animation.js';
import { advanceCamera } from '/camera.js';
import { drawPlayerSprite } from '/player-render.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const room = document.querySelector('#room');
const join = document.querySelector('#menu-start');
const flip = document.querySelector('#flip');
const overlay = document.querySelector('#overlay');
const frontScreen = document.querySelector('#front-screen');
const endScreen = document.querySelector('#end-screen');
const endResult = document.querySelector('#end-result');
const backMenu = document.querySelector('#back-menu');
const status = document.querySelector('#status');
const dot = document.querySelector('#dot');
const ping = document.querySelector('#ping');
const players = document.querySelector('#players');
const colors = ['#3ce6df', '#ff626c', '#7ee66b', '#ffd75d'];
const spriteSources = ['player-blue.png', 'player-green.png', 'player-yellow.png', 'player-red.png'];
const sprites = spriteSources.map((source) => {
  const image = new Image();
  image.src = `/assets/players/${source}`;
  image.addEventListener('load', draw);
  return image;
});
function loadImage(source) {
  const image = new Image();
  image.src = source;
  image.addEventListener('load', draw);
  return image;
}
const scene = {
  background: loadImage('/assets/scene/background.png'),
  cityFar: loadImage('/assets/scene/city-far.png'),
  cityNear: loadImage('/assets/scene/city-near.png'),
  block: loadImage('/assets/scene/block.png'),
  hud: loadImage('/assets/scene/hud.png')
};
const decorationImages = new Map();
let socket; let sequence = 0; let state = { players: [] }; let map; let visualMap; let lastPing = 0; let stateReceivedAt = performance.now(); let localSlot; let cameraX = 0; let cameraUpdatedAt = performance.now(); let showingEnd = false;

Promise.all([
  fetch('/data/marathon.json').then((response) => response.json()),
  fetch('/data/mp02-visual.json').then((response) => response.json()),
]).then(([level, visuals]) => { map = level; visualMap = visuals; draw(); });
setTimeout(() => { if (!frontScreen.hidden) frontScreen.dataset.phase = 'menu'; }, 900);
function setStatus(value, live = false) { status.textContent = value; dot.classList.toggle('live', live); }
function connect() {
  if (!/^[A-Z0-9_-]{3,12}$/i.test(room.value.trim())) return setStatus('房间码为 3–12 位字符');
  socket?.close(); sequence = 0; localSlot = undefined; cameraX = 0; cameraUpdatedAt = performance.now(); showingEnd = false;
  frontScreen.hidden = true; endScreen.hidden = true; overlay.hidden = false;
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocol}//${location.host}/ws`);
  socket.addEventListener('open', () => socket.send(JSON.stringify({ type:'join', room:room.value.trim().toUpperCase() })));
  socket.addEventListener('message', ({ data }) => handle(JSON.parse(data)));
  socket.addEventListener('close', () => { flip.disabled = true; setStatus('连接已断开'); });
  socket.addEventListener('error', () => setStatus('连接失败'));
}
function handle(message) {
  if (message.type === 'joined') { localSlot = message.player.slot; cameraX = Math.max(0, message.player.x - canvas.width / 2); cameraUpdatedAt = performance.now(); overlay.hidden = true; flip.disabled = false; setStatus(`已加入 ${message.room}`, true); return; }
  if (message.type === 'state') {
    state = message; stateReceivedAt = performance.now(); players.textContent = `${state.players.length}/4 玩家在线`;
    const localPlayer = state.players.find((player) => player.slot === localSlot);
    if (localPlayer?.finished || localPlayer?.eliminated) showEndScreen(localPlayer);
    return;
  }
  if (message.type === 'pong') { ping.textContent = `${Math.round(performance.now() - lastPing)} ms`; return; }
  if (message.type === 'error') { setStatus(`错误：${message.error}`); }
}
function sendFlip() { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type:'flip', sequence:++sequence })); }
function showEndScreen(player) {
  if (showingEnd) return;
  showingEnd = true;
  flip.disabled = true;
  endResult.textContent = player.finished ? '你已完成全程' : '你已被淘汰';
  endScreen.hidden = false;
}
function returnToMenu() {
  showingEnd = false;
  socket?.close(); socket = undefined; state = { players: [] }; localSlot = undefined; sequence = 0;
  endScreen.hidden = true; overlay.hidden = true; frontScreen.hidden = false; frontScreen.dataset.phase = 'menu';
  players.textContent = '等待玩家'; setStatus('未连接');
}
function getDecorationImage(asset) {
  if (decorationImages.has(asset.file)) return decorationImages.get(asset.file);
  const image = loadImage(`/assets/visual/${asset.file}`);
  decorationImages.set(asset.file, image);
  return image;
}
function drawDecorations(decorations, camera) {
  if (!visualMap) return false;
  for (const decoration of decorations) {
    const asset = visualMap.assets[decoration.imageId];
    if (!asset) continue;
    const placement = projectVisual(decoration, asset);
    const scaleX = placement.scaleX ?? 1;
    const scaleY = placement.scaleY ?? 1;
    const x = placement.x + (placement.offsetX ?? 0) - camera;
    const y = placement.y + (placement.offsetY ?? 0);
    const width = asset.width * scaleX;
    const height = asset.height * scaleY;
    if (x + width < 0 || x > canvas.width || y + height < 0 || y > canvas.height) continue;
    const image = getDecorationImage(asset);
    if (image.complete && image.naturalWidth) ctx.drawImage(image, x, y, width, height);
  }
  return true;
}
function drawMarathonBlocks(camera, world) {
  const fallbackStart = map?.segments?.[1]?.startX;
  if (!Number.isFinite(fallbackStart)) return;
  for (const tile of map.colliders) {
    const x = tile.x * world.cellSize - camera;
    const y = world.originY - tile.y * world.cellSize;
    if (tile.x * world.cellSize < fallbackStart || x <= -world.cellSize || x >= canvas.width || y <= -world.cellSize || y >= canvas.height) continue;
    if (scene.block.complete) ctx.drawImage(scene.block, x, y, world.cellSize, world.cellSize);
    else { ctx.fillStyle = '#68727a'; ctx.fillRect(x, y, world.cellSize, world.cellSize); }
  }
}
function renderPlayer(player, now) {
  const elapsed = Math.min(50, Math.max(0, now - stateReceivedAt)) / 1000;
  return { ...player, x: player.x + player.vx * elapsed, y: player.y + player.vy * elapsed };
}
function draw() {
  ctx.fillStyle='#9bcde3'; ctx.fillRect(0, 0, canvas.width, canvas.height); if (!map) return;
  const now = performance.now();
  const renderPlayers = state.players.map((player) => renderPlayer(player, now));
  const localPlayer = renderPlayers.find((player) => player.slot === localSlot);
  const camera = advanceCamera(cameraX, now - cameraUpdatedAt, localPlayer, canvas.width);
  cameraX = camera;
  cameraUpdatedAt = now;
  const world = map.world ?? { cellSize: 34, originY: 425 };
  if (scene.background.complete) ctx.drawImage(scene.background, 0, 59);
  if (scene.cityFar.complete) for (let x = -((camera * 0.1) % scene.cityFar.width); x < canvas.width; x += scene.cityFar.width) ctx.drawImage(scene.cityFar, x, 264);
  if (scene.cityNear.complete) for (let x = -((camera * 0.2) % scene.cityNear.width); x < canvas.width; x += scene.cityNear.width) ctx.drawImage(scene.cityNear, x, 254);
  if (!drawDecorations(visualMap?.visualInfo ?? [], camera)) for (const tile of map.colliders) {
    const x = tile.x * world.cellSize - camera;
    const y = world.originY - tile.y * world.cellSize;
    if (x <= -world.cellSize || x >= canvas.width || y <= -world.cellSize || y >= canvas.height) continue;
    if (scene.block.complete) ctx.drawImage(scene.block, x, y, world.cellSize, world.cellSize);
    else { ctx.fillStyle = '#68727a'; ctx.fillRect(x, y, world.cellSize, world.cellSize); }
  }
  drawMarathonBlocks(camera, world);
  drawDecorations(visualMap?.frontVisualInfo ?? [], camera);
  if (scene.hud.complete) ctx.drawImage(scene.hud, 0, 0);
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
join.addEventListener('click', connect); backMenu.addEventListener('click', returnToMenu); flip.addEventListener('click', sendFlip); canvas.addEventListener('click', sendFlip);
addEventListener('keydown', (event) => { if(event.code==='Space'&&!event.repeat) {event.preventDefault();sendFlip();} });
setInterval(() => { if(socket?.readyState===WebSocket.OPEN) { lastPing=performance.now(); socket.send(JSON.stringify({type:'ping'})); } }, 2000);
function animationLoop() { draw(); requestAnimationFrame(animationLoop); }
requestAnimationFrame(animationLoop);
