import { applyColliderEdit, createEditorDraft, createHistory, exportEditorDraft, parseEditorDraft, redo, undo, updateEditorProperty, validateEditorDraft } from '/editor-draft.js';
import { createReplay, eventsAtTick, exportTestPackage, parseTestPackage, recordFlip } from '/editor-replay.js';
import { createLocalNetworkLab, deliverSnapshots, queueSnapshot } from '/editor-network.js';
import { createDraftDiff } from '/editor-package.js';
import { GameRoom } from '/solo-game.mjs';
import { animationFrameFromSequence, animationPreset, frameSourceRect } from '/player-animation.js';
import { projectVisual } from '/visual-projection.js';
import { contactsForPlayer, hitboxForPlayer, playerContactsForPlayer, predictTrajectory } from '/editor-inspector.js';

const canvas = document.querySelector('#editor-canvas');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#draft-status');
const validation = document.querySelector('#validation');
const inspector = document.querySelector('#inspector');
const segmentList = document.querySelector('#segment-list');
const simulationReadout = document.querySelector('#simulation-readout');
const importer = document.querySelector('#draft-import');
const packageImporter = document.querySelector('#package-import');
const localPlayerCount = document.querySelector('#local-player-count');
const latencyInput = document.querySelector('#lab-latency');
const lossInput = document.querySelector('#lab-loss');
const latencyOutput = document.querySelector('#lab-latency-output');
const lossOutput = document.querySelector('#lab-loss-output');
const animationCanvas = document.querySelector('#animation-preview');
const animationCtx = animationCanvas.getContext('2d');
const animationCharacter = document.querySelector('#animation-character');
const animationState = document.querySelector('#animation-state');
const spawnIndex = document.querySelector('#spawn-index');
const spawnX = document.querySelector('#spawn-x');
const spawnY = document.querySelector('#spawn-y');
const spawnGravity = document.querySelector('#spawn-gravity');
const spawnSpeed = document.querySelector('#spawn-speed');
const finishX = document.querySelector('#finish-x');
const eliminationMargin = document.querySelector('#elimination-margin');
const eliminationTop = document.querySelector('#elimination-top');
const eliminationBottom = document.querySelector('#elimination-bottom');
const collisionLog = document.querySelector('#collision-log');
const physicsPlayer = document.querySelector('#physics-player');
const physicsHitboxWidth = document.querySelector('#physics-hitbox-width');
const physicsHitboxHeight = document.querySelector('#physics-hitbox-height');
const physicsGravity = document.querySelector('#physics-gravity');
const physicsRecovery = document.querySelector('#physics-recovery');
const physicsReadout = document.querySelector('#physics-readout');
const animationSequence = document.querySelector('#animation-sequence');
const animationSpeed = document.querySelector('#animation-speed');
const animationSpeedOutput = document.querySelector('#animation-speed-output');
const animationFrameReadout = document.querySelector('#animation-frame-readout');
const timelineScrub = document.querySelector('#timeline-scrub');
const timelineTick = document.querySelector('#timeline-tick');
const timelineConsole = document.querySelector('#timeline-console');
const timelineErrors = document.querySelector('#timeline-errors');
let originalLevel;
let sourceDraft;
let history;
let activeLayer = 'collision';
let brush = 'paint';
let painting = false;
let pan;
let view = { x: 0, y: 150, scale: 0.55 };
let selected;
let selectedVisual;
let visualDrag;
let visualMaps = new Map();
let running = false;
let simulation;
let replay = createReplay();
let recording = false;
let replaying = false;
let simulationSequence = 0;
let simulationAccumulator = 0;
let simulationLastAt = performance.now();
let lab = createLocalNetworkLab();
const eventLog = [];
const visualImages = new Map();
let animationConfig = { state: 'run', sequence: animationPreset('run').sequence, speed: animationPreset('run').speed, playing: true, elapsed: 0, lastAt: performance.now() };
let currentTrajectory = [];
const animationImages = new Map(['blue', 'green', 'yellow', 'red'].map((color) => {
  const image = new Image(); image.src = `/assets/players/player-${color}.png`; return [color, image];
}));

function levelWorld() { return history.current.world ?? { cellSize: history.current.tileSize, originY: 425 }; }
function courseCell() { return levelWorld().cellSize ?? history.current.tileSize; }
function pointAt(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
}
function worldAt(point) { return { x: (point.x - view.x) / view.scale, y: (point.y - view.y) / view.scale }; }
function cellAt(point) {
  const world = levelWorld(); const position = worldAt(point); const size = courseCell();
  return { x: Math.floor(position.x / size), y: Math.round((world.originY - position.y) / size) };
}
function cellScreen(cell) {
  const world = levelWorld(); const size = courseCell();
  return { x: view.x + cell.x * size * view.scale, y: view.y + (world.originY - cell.y * size) * view.scale, size: size * view.scale };
}
function visualScreen(item) {
  return { x: view.x + item.x * view.scale, y: view.y + item.y * view.scale, width: item.width * view.scale, height: item.height * view.scale };
}
function visualAt(point) {
  const position = worldAt(point);
  const visuals = history.current.visuals ?? [];
  for (let index = visuals.length - 1; index >= 0; index -= 1) {
    const item = visuals[index];
    if (position.x >= item.x && position.x <= item.x + item.width && position.y >= item.y && position.y <= item.y + item.height) return index;
  }
  return -1;
}
function drawVisuals() {
  const visuals = history.current.visuals ?? [];
  for (let index = 0; index < visuals.length; index += 1) {
    const item = visuals[index]; const preview = visualDrag?.index === index ? { ...item, x: visualDrag.x, y: visualDrag.y } : item; const box = visualScreen(preview);
    if (box.x > canvas.width || box.y > canvas.height || box.x + box.width < 0 || box.y + box.height < 0) continue;
    let image = visualImages.get(item.assetFile);
    if (!image) { image = new Image(); image.src = `/assets/visual/${item.assetFile}`; visualImages.set(item.assetFile, image); }
    if (image.complete && image.naturalWidth) ctx.drawImage(image, box.x, box.y, box.width, box.height);
    else { ctx.fillStyle = '#34596880'; ctx.fillRect(box.x, box.y, box.width, box.height); }
    if (selectedVisual === index) { ctx.save(); ctx.strokeStyle = '#ffdf6b'; ctx.lineWidth = 3; ctx.strokeRect(box.x, box.y, box.width, box.height); ctx.restore(); }
  }
}
function setStatus(value) { status.textContent = value; }
function updatePropertyEditor() {
  if (!history) return;
  const draft = history.current;
  spawnIndex.replaceChildren(...draft.spawns.map((spawn, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = `出生点 ${index + 1} · ${spawn.gravity < 0 ? '↑' : '↓'}`; return option; }));
  const index = Math.min(Number(spawnIndex.value) || 0, Math.max(0, draft.spawns.length - 1)); spawnIndex.value = String(index);
  const spawn = draft.spawns[index] ?? {};
  spawnX.value = Math.round(spawn.x ?? 0); spawnY.value = Math.round(spawn.y ?? 0); spawnGravity.value = String(spawn.gravity < 0 ? -1 : 1); spawnSpeed.value = Math.round(spawn.speedX ?? 0);
  finishX.value = Math.round(draft.finishX ?? 0);
  eliminationMargin.value = Math.round(draft.elimination?.leftMargin ?? 60); eliminationTop.value = Math.round(draft.elimination?.top ?? -90); eliminationBottom.value = Math.round(draft.elimination?.bottom ?? 560);
}
function activePhysicsPlayer() {
  const presented = simulation?.displayState ?? simulation?.state;
  return presented?.players?.find((player) => player.slot === Number(physicsPlayer.value)) ?? presented?.players?.[0];
}
function updatePhysicsInspector() {
  const presented = simulation?.displayState ?? simulation?.state;
  const players = presented?.players ?? [];
  physicsPlayer.replaceChildren(...players.map((player) => { const option = document.createElement('option'); option.value = String(player.slot); option.textContent = `玩家 ${player.slot} · ${player.name}`; return option; }));
  if (players.length && !players.some((player) => player.slot === Number(physicsPlayer.value))) physicsPlayer.value = String(players[0].slot);
  const player = activePhysicsPlayer();
  const tuning = simulation?.room?.debugTuning?.() ?? { hitboxWidth: 37, hitboxHeight: 48, gravityMultiplier: 1, recoveryMultiplier: 1 };
  if (document.activeElement !== physicsHitboxWidth) physicsHitboxWidth.value = tuning.hitboxWidth;
  if (document.activeElement !== physicsHitboxHeight) physicsHitboxHeight.value = tuning.hitboxHeight;
  if (document.activeElement !== physicsGravity) physicsGravity.value = tuning.gravityMultiplier;
  if (document.activeElement !== physicsRecovery) physicsRecovery.value = tuning.recoveryMultiplier;
  if (!player) { currentTrajectory = []; physicsReadout.textContent = '尚未运行'; return; }
  const dimensions = { width: Number(tuning.hitboxWidth) || 37, height: Number(tuning.hitboxHeight) || 48, offsetX: 16, normalOffsetY: 19, invertedOffsetY: 9 };
  const box = hitboxForPlayer(player, dimensions);
  const contacts = contactsForPlayer(player, history.current.colliders, levelWorld(), dimensions);
  const playerContacts = playerContactsForPlayer(player, players, dimensions);
  const trajectory = predictTrajectory(player, { steps: 32, gravityAcceleration: 30000 * (Number(tuning.gravityMultiplier) || 1) }); currentTrajectory = trajectory;
  const contactText = [...contacts.map((contact) => `格(${contact.x},${contact.y})`), ...playerContacts.map((contact) => `玩家${contact.slot}`)];
  physicsReadout.textContent = `玩家 ${player.slot} · ${player.gravity < 0 ? '反重力' : '正常重力'}\n碰撞盒 L${Math.round(box.left)} T${Math.round(box.top)} · ${Math.round(box.width)}×${Math.round(box.height)}\n速度 ${Math.round(player.vx)}, ${Math.round(player.vy)} · 接触 ${contactText.length ? contactText.join(' ') : '无'}\n预测轨迹 ${trajectory.length - 1} 帧 · ${player.blockedX ? '水平受阻' : '未受阻'}`;
}
function drawPrediction(trajectory) {
  if (!history || !trajectory?.length) return;
  ctx.save(); ctx.strokeStyle = '#8ff4ffcc'; ctx.lineWidth = 2; ctx.setLineDash([4, 5]); ctx.beginPath();
  trajectory.forEach((point, index) => { const x = view.x + point.x * view.scale; const y = view.y + point.y * view.scale; if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
  ctx.stroke(); ctx.restore();
}
function setAnimationPreset(state = animationState.value) {
  const preset = animationPreset(state);
  animationConfig = { ...animationConfig, state, sequence: preset.sequence, speed: preset.speed, elapsed: 0, lastAt: performance.now() };
  animationSequence.value = preset.sequence.join(','); animationSpeed.value = String(preset.speed); animationSpeedOutput.textContent = `${preset.speed} fps`; drawAnimation(performance.now());
}
function updateAnimationConfig() {
  const sequence = animationSequence.value.split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value >= 0 && value < 135);
  animationConfig = { ...animationConfig, sequence: sequence.length ? sequence : animationPreset(animationState.value).sequence, speed: Math.max(1, Number(animationSpeed.value) || 20), lastAt: performance.now() };
  animationSpeedOutput.textContent = `${animationConfig.speed} fps`; drawAnimation(performance.now());
}
function renderCollisionLog() {
  collisionLog.replaceChildren(...eventLog.slice(-12).map((entry) => { const item = document.createElement('li'); item.textContent = entry; return item; }));
  if (timelineConsole) timelineConsole.textContent = eventLog.length ? eventLog.slice(-20).join('\n') : '暂无碰撞事件';
}
function updateTimeline() {
  const tick = simulation?.state?.tick ?? 0;
  timelineScrub.value = String(Math.min(Number(timelineScrub.max), tick));
  timelineTick.textContent = String(tick);
  timelineErrors.textContent = status.textContent?.includes('无效') || status.textContent?.includes('失败') ? `错误：${status.textContent}` : '错误：无';
}
function logCollisionEvents(state) {
  for (const player of state.players ?? []) {
    for (const [flag, label] of [['blockedX', '水平碰撞'], ['finished', '抵达终点'], ['eliminated', '淘汰']]) {
      if (!player[flag]) continue;
      const key = `${state.tick}:${player.slot}:${flag}`;
      if (eventLog.some((entry) => entry.startsWith(`${key} `))) continue;
      eventLog.push(`${key} · 玩家 ${player.slot} ${label}`);
    }
  }
  renderCollisionLog();
}
function updateInspector() {
  const draft = history.current; const valid = validateEditorDraft(draft);
  validation.textContent = valid.valid ? `草稿有效\n${draft.colliders.length} 个碰撞格\n撤销 ${history.undoStack.length} · 重做 ${history.redoStack.length}` : valid.errors.join('\n');
  const selection = selected ? `碰撞格 (${selected.x}, ${selected.y})` : selectedVisual !== undefined ? `装饰 ${history.current.visuals?.[selectedVisual]?.imageId ?? ''}` : '尚未选择对象';
  const selectedDecoration = selectedVisual !== undefined ? draft.visuals?.[selectedVisual] : null;
  const inspectorRows = [['选择', selection], ['图层', activeLayer], ['格尺寸', `${courseCell()} px`], ['终点', `${Math.round(draft.finishX)} px`], ['出生点', String(draft.spawns.length)]];
  if (selectedDecoration) { inspectorRows.push(['坐标', `${Math.round(selectedDecoration.x)}, ${Math.round(selectedDecoration.y)}`]); inspectorRows.push(['尺寸', `${Math.round(selectedDecoration.width)}×${Math.round(selectedDecoration.height)}`]); }
  if (selected) inspectorRows.push(['碰撞', '实心碰撞格']);
  inspector.replaceChildren(...inspectorRows.flatMap(([term, description]) => {
    const dt = document.createElement('dt'); dt.textContent = term;
    const dd = document.createElement('dd'); dd.textContent = description;
    return [dt, dd];
  }));
  const presented = simulation?.displayState ?? simulation?.state;
  const player = presented?.players?.[0];
  simulationReadout.textContent = player
    ? `${running ? '运行中' : '已暂停'} · tick ${presented.tick}\n位置 ${Math.round(player.x)}, ${Math.round(player.y)}\n速度 ${Math.round(player.vx)}, ${Math.round(player.vy)} · 镜头 ${Math.round(presented.cameraSpeed)}\n本地 ${localPlayerCount.value} 人 · 显示延迟 ${lab.latencyMs} ms · 丢包 ${lab.dropped}\n回放事件 ${replay.events.length}${recording ? ' · 正在录制' : ''}${replaying ? ' · 回放中' : ''}`
    : '尚未运行。可先画碰撞格，再按“运行”验证本地物理。';
  updatePropertyEditor();
  updatePhysicsInspector();
  updateTimeline();
}
function drawGrid() {
  const size = courseCell() * view.scale;
  if (size < 7) return;
  const left = ((view.x % size) + size) % size;
  const top = ((view.y + levelWorld().originY * view.scale) % size + size) % size;
  ctx.strokeStyle = '#1c526150'; ctx.lineWidth = 1;
  for (let x = left; x < canvas.width; x += size) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = top; y < canvas.height; y += size) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
}
function draw() {
  if (!history) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#9bcde3'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  const guide = (worldX, color, label) => { const x = view.x + worldX * view.scale; ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); ctx.fillStyle = color; ctx.font = 'bold 12px Arial'; ctx.fillText(label, x + 5, 18); ctx.restore(); };
  guide(history.current.cameraTargetX ?? 320, '#23e6d2', '镜头目标');
  const liveCamera = simulation?.displayState ?? simulation?.state;
  if (Number.isFinite(liveCamera?.cameraX)) guide(liveCamera.cameraX + (history.current.cameraTargetX ?? 320), '#ffffffaa', '当前镜头中线');
  guide(history.current.finishX, '#ffd166', '终点');
  guide((history.current.cameraTargetX ?? 320) - 350 - (history.current.elimination?.leftMargin ?? 60), '#ff5f6d', '淘汰线');
  const world = levelWorld(); const bounds = history.current.elimination ?? { top: -90, bottom: 560 }; ctx.save(); ctx.strokeStyle = '#ff5f6d80'; ctx.setLineDash([3, 5]); for (const y of [bounds.top, bounds.bottom]) { const screenY = view.y + (world.originY - y) * view.scale; ctx.beginPath(); ctx.moveTo(0, screenY); ctx.lineTo(canvas.width, screenY); ctx.stroke(); } ctx.restore();
  drawVisuals();
  for (const cell of history.current.colliders) {
    const box = cellScreen(cell);
    if (box.x > canvas.width || box.y > canvas.height || box.x + box.size < 0 || box.y + box.size < 0) continue;
    ctx.fillStyle = '#ffb84db8'; ctx.fillRect(box.x, box.y, box.size, box.size);
    ctx.strokeStyle = '#7a3f16'; ctx.strokeRect(box.x, box.y, box.size, box.size);
  }
  for (const spawn of history.current.spawns) {
    const x = view.x + spawn.x * view.scale; const y = view.y + spawn.y * view.scale;
    ctx.fillStyle = spawn.gravity < 0 ? '#8dff8b' : '#3ce6df'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#05303d'; ctx.font = 'bold 11px Arial'; ctx.fillText(`出生 ${spawn.gravity < 0 ? '↑' : '↓'}`, x + 10, y + 4);
  }
  drawPrediction(currentTrajectory);
  const presented = simulation?.displayState ?? simulation?.state;
  if (presented) for (const player of presented.players) {
    const x = view.x + player.x * view.scale;
    const y = view.y + player.y * view.scale;
    const image = animationImages.get(player.character);
    const frame = animationFrameFromSequence(animationConfig.sequence, animationConfig.elapsed, animationConfig.speed);
    ctx.save(); ctx.translate(x + 32.5 * view.scale, y + 38.5 * view.scale); if (player.gravity < 0) ctx.scale(1, -1);
    if (image?.complete && image.naturalWidth) { const source = frameSourceRect(frame); ctx.imageSmoothingEnabled = false; ctx.drawImage(image, source.x, source.y, source.width, source.height, -32.5 * view.scale, -38.5 * view.scale, 65 * view.scale, 77 * view.scale); }
    else { ctx.fillStyle = '#20dce0'; ctx.fillRect(-12 * view.scale, -18 * view.scale, 24 * view.scale, 36 * view.scale); }
    ctx.restore();
    ctx.save(); ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.strokeStyle = '#071319'; ctx.lineWidth = 3; ctx.fillStyle = '#f3fbff'; ctx.strokeText(player.name, x + 32.5 * view.scale, y - 4); ctx.fillText(player.name, x + 32.5 * view.scale, y - 4); ctx.restore();
  }
  const physicsPlayerState = activePhysicsPlayer();
  if (physicsPlayerState) { const tuning = simulation?.room?.debugTuning?.() ?? {}; const box = hitboxForPlayer(physicsPlayerState, { width: Number(tuning.hitboxWidth) || 37, height: Number(tuning.hitboxHeight) || 48, offsetX: 16, normalOffsetY: 19, invertedOffsetY: 9 }); const left = view.x + box.left * view.scale; const top = view.y + box.top * view.scale; ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = '#ffeb70'; ctx.lineWidth = 2; ctx.strokeRect(left, top, (box.right - box.left) * view.scale, (box.bottom - box.top) * view.scale); ctx.restore(); }
  if (selected) { const box = cellScreen(selected); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeRect(box.x + 1, box.y + 1, box.size - 2, box.size - 2); }
}
function editAt(point) {
  if (activeLayer === 'spawn') {
    const position = worldAt(point); let nearest = -1; let distance = Infinity;
    history.current.spawns.forEach((spawn, index) => { const candidate = Math.hypot(position.x - spawn.x, position.y - spawn.y); if (candidate < distance) { distance = candidate; nearest = index; } });
    if (distance < 90) { spawnIndex.value = String(nearest); selected = undefined; updateInspector(); draw(); }
    return;
  }
  if (activeLayer === 'visual') {
    selectedVisual = visualAt(point); selected = undefined; updateInspector(); draw();
    return;
  }
  if (activeLayer !== 'collision') return;
  const cell = cellAt(point); selected = cell;
  history = applyColliderEdit(history, { ...cell, solid: brush === 'paint' });
  updateInspector(); draw();
}
function resetDraft() {
  sourceDraft = sourceDraft ?? createEditorDraft(originalLevel, 'marathon');
  history = createHistory(structuredClone(sourceDraft));
  eventLog.length = 0; renderCollisionLog();
  selected = undefined; selectedVisual = undefined; visualDrag = undefined; view = { x: 0, y: 150, scale: 0.55 }; setStatus('已恢复为原始 marathon 草稿'); updateInspector(); draw();
}
function resetSimulation(replayMode = false) {
  const room = new GameRoom(history.current);
  const count = Number(localPlayerCount.value);
  for (let index = 0; index < count; index += 1) room.join(index ? `bot-${index}` : 'editor', index ? `本地机器人 ${index}` : '编辑器', true);
  room.start('editor');
  lab = createLocalNetworkLab({ latencyMs: lab.latencyMs, lossPercent: lab.lossPercent });
  const state = room.snapshot(); simulation = { room, state, displayState: state }; simulationSequence = 0; simulationAccumulator = 0; simulationLastAt = performance.now(); replaying = replayMode; running = false; eventLog.length = 0; renderCollisionLog();
  updateInspector(); draw();
}
function advanceSimulation(frames = 1) {
  if (!simulation) resetSimulation(replaying);
  for (let frame = 0; frame < frames && simulation.state.phase === 'playing'; frame += 1) {
    const nextTick = simulation.state.tick + 1;
    if (replaying) for (const event of eventsAtTick(replay, nextTick)) if (event.type === 'flip') simulation.room.input('editor', { type: 'flip', sequence: ++simulationSequence });
    simulation.state = simulation.room.tick(1 / 40);
    logCollisionEvents(simulation.state);
    lab = queueSnapshot(lab, simulation.state, performance.now());
    lab = deliverSnapshots(lab, performance.now());
    simulation.displayState = lab.latest ?? simulation.displayState;
  }
  if (simulation.state.phase === 'results') running = false;
  updateInspector(); draw();
}
function flipSimulation() {
  if (!simulation) resetSimulation();
  const tick = simulation.state.tick + 1;
  const result = simulation.room.input('editor', { type: 'flip', sequence: ++simulationSequence });
  if (result.ok && recording) replay = recordFlip(replay, tick);
  updateInspector(); draw();
}
function advanceLoop(now) {
  if (running && simulation) {
    simulationAccumulator += Math.min(100, Math.max(0, now - simulationLastAt));
    while (simulationAccumulator >= 25) { advanceSimulation(); simulationAccumulator -= 25; }
  }
  drawAnimation(now); simulationLastAt = now; requestAnimationFrame(advanceLoop);
}
function drawAnimation(now) {
  const image = animationImages.get(animationCharacter.value); if (!image?.complete || !image.naturalWidth) return;
  if (animationConfig.playing) animationConfig.elapsed += Math.max(0, now - animationConfig.lastAt);
  animationConfig.lastAt = now;
  const frame = animationFrameFromSequence(animationConfig.sequence, animationConfig.elapsed, animationConfig.speed);
  const source = frameSourceRect(frame); animationCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
  animationCtx.imageSmoothingEnabled = false; animationCtx.drawImage(image, source.x, source.y, source.width, source.height, 77, 20, 65, 77);
  animationFrameReadout.textContent = `帧 ${frame} · ${animationConfig.sequence.join(',')} · ${animationConfig.speed} fps`;
  animationCtx.fillStyle = '#b8e6ec'; animationCtx.font = '11px ui-monospace'; animationCtx.fillText(`帧 ${frame} · ${animationState.value}`, 8, 119);
}
function configureLab() {
  lab = createLocalNetworkLab({ latencyMs: latencyInput.value, lossPercent: lossInput.value });
  latencyOutput.textContent = `${lab.latencyMs} ms`; lossOutput.textContent = `${lab.lossPercent}%`; updateInspector();
}
function applyProperties() {
  try {
    const index = Number(spawnIndex.value); const values = [[['spawns', index, 'x'], spawnX.value], [['spawns', index, 'y'], spawnY.value], [['spawns', index, 'gravity'], spawnGravity.value], [['spawns', index, 'speedX'], spawnSpeed.value], [['finishX'], finishX.value], [['elimination', 'leftMargin'], eliminationMargin.value], [['elimination', 'top'], eliminationTop.value], [['elimination', 'bottom'], eliminationBottom.value]];
    for (const [path, value] of values) history = updateEditorProperty(history, { path, value });
    setStatus('场景属性已应用，并已进入撤销历史'); renderSegments(); updateInspector(); draw();
  } catch (error) { setStatus(error.message); }
}
function applyPhysics() {
  try {
    if (!simulation) resetSimulation();
    simulation.room.setDebugTuning({
      ...simulation.room.debugTuning(),
      hitboxWidth: physicsHitboxWidth.value,
      hitboxHeight: physicsHitboxHeight.value,
      gravityMultiplier: physicsGravity.value,
      recoveryMultiplier: physicsRecovery.value
    });
    advanceSimulation(1);
    setStatus('物理参数已应用，并已执行单帧验证');
  } catch (error) { setStatus(`物理参数无效：${error.message}`); }
}
function scrubToTick(value) {
  const target = Math.max(0, Math.min(Number(timelineScrub.max) || 2000, Math.floor(Number(value) || 0)));
  resetSimulation(true); advanceSimulation(target); running = false; timelineScrub.value = String(target); timelineTick.textContent = String(target); setStatus(`已定位到 tick ${target}，可单帧检查碰撞`); updateInspector(); draw();
}
function downloadDraft() {
  const link = document.createElement('a'); const url = URL.createObjectURL(new Blob([exportEditorDraft(history.current)], { type: 'application/json' }));
  link.href = url; link.download = 'gswitch-course-draft.json'; link.click(); URL.revokeObjectURL(url);
}
function renderSegments() {
  segmentList.replaceChildren(...history.current.segments.map((segment) => {
    const button = document.createElement('button'); button.textContent = `${segment.id.toUpperCase()}  ${Math.round(segment.startX)}–${Math.round(segment.endX)}`;
    button.addEventListener('click', () => { view.x = canvas.width / 2 - segment.startX * view.scale; draw(); });
    const item = document.createElement('li'); item.append(button); return item;
  }));
}
function flattenVisuals(level, maps) {
  return (level.segments ?? []).flatMap((segment) => {
    const map = maps.get(segment.id); if (!map) return [];
    return ['visualInfo', 'frontVisualInfo'].flatMap((property) => (map[property] ?? []).map((visual, index) => {
      const asset = map.assets?.[visual.imageId] ?? {}; const projected = projectVisual(visual, asset); const scaleX = projected.scaleX ?? 1; const scaleY = projected.scaleY ?? 1;
      return { id: `${segment.id}:${property}:${index}:${segment.startX}`, imageId: visual.imageId, assetFile: asset.file, x: segment.startX + projected.x, y: projected.y, width: Number(asset.width ?? 0) * scaleX, height: Number(asset.height ?? 0) * scaleY, layer: property };
    }));
  });
}
async function load() {
  const responses = await Promise.all(['marathon', 'mp02-visual', 'mp03-visual', 'mp04-visual'].map((name) => fetch(`/data/${name}.json`)));
  if (responses.some((response) => !response.ok)) throw new Error('无法读取赛道或装饰数据');
  const [level, mp02, mp03, mp04] = await Promise.all(responses.map((response) => response.json())); visualMaps = new Map([['mp02', mp02], ['mp03', mp03], ['mp04', mp04]]);
  originalLevel = { ...level, visuals: flattenVisuals(level, visualMaps) }; resetDraft(); renderSegments();
}

canvas.addEventListener('contextmenu', (event) => event.preventDefault());
canvas.addEventListener('pointerdown', (event) => {
  const point = pointAt(event);
  if (event.button === 1 || event.button === 2) { pan = { point, view: { ...view } }; canvas.setPointerCapture(event.pointerId); return; }
  if (event.button === 0 && activeLayer === 'visual') { const index = visualAt(point); if (index >= 0) { selectedVisual = index; const item = history.current.visuals[index]; const position = worldAt(point); visualDrag = { index, x: item.x, y: item.y, offsetX: position.x - item.x, offsetY: position.y - item.y }; canvas.setPointerCapture(event.pointerId); updateInspector(); draw(); } return; }
  painting = true; canvas.setPointerCapture(event.pointerId); editAt(point);
});
canvas.addEventListener('pointermove', (event) => {
  const point = pointAt(event);
  if (pan) { view.x = pan.view.x + point.x - pan.point.x; view.y = pan.view.y + point.y - pan.point.y; draw(); return; }
  if (visualDrag) { const position = worldAt(point); visualDrag.x = position.x - visualDrag.offsetX; visualDrag.y = position.y - visualDrag.offsetY; draw(); return; }
  if (painting) editAt(point);
});
canvas.addEventListener('pointerup', (event) => { if (visualDrag) { try { history = updateEditorProperty(history, { path: ['visuals', visualDrag.index, 'x'], value: visualDrag.x }); history = updateEditorProperty(history, { path: ['visuals', visualDrag.index, 'y'], value: visualDrag.y }); setStatus(`已移动装饰：${history.current.visuals[visualDrag.index].imageId}`); } catch (error) { setStatus(error.message); } visualDrag = undefined; updateInspector(); draw(); } painting = false; pan = undefined; canvas.releasePointerCapture?.(event.pointerId); });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault(); const point = pointAt(event); const world = worldAt(point); const next = Math.max(0.08, Math.min(3, view.scale * (event.deltaY < 0 ? 1.12 : 0.89)));
  view = { scale: next, x: point.x - world.x * next, y: point.y - world.y * next }; draw();
}, { passive: false });
document.addEventListener('change', (event) => { if (event.target.name === 'brush') brush = event.target.value; if (event.target.dataset.editorLayer) { activeLayer = event.target.dataset.editorLayer; updateInspector(); } });
document.addEventListener('click', (event) => {
  const layerButton = event.target.closest('[data-editor-layer]');
  if (!layerButton || !history) return;
  activeLayer = layerButton.dataset.editorLayer;
  document.querySelectorAll('[data-editor-layer]').forEach((button) => button.classList.toggle('active', button === layerButton));
  selected = undefined; if (activeLayer !== 'visual') selectedVisual = undefined;
  setStatus(activeLayer === 'visual' ? '装饰层：拖动装饰可预览位置，松开后写入撤销历史' : `当前图层：${activeLayer === 'spawn' ? '出生点' : '碰撞层'}`);
  updateInspector(); draw();
});
spawnIndex.addEventListener('change', updatePropertyEditor);
localPlayerCount.addEventListener('change', () => { resetSimulation(); });
latencyInput.addEventListener('input', configureLab); lossInput.addEventListener('input', configureLab);
physicsPlayer.addEventListener('change', updatePhysicsInspector);
timelineScrub.addEventListener('input', () => scrubToTick(timelineScrub.value));
animationCharacter.addEventListener('change', () => drawAnimation(performance.now()));
animationState.addEventListener('change', () => setAnimationPreset(animationState.value));
animationSequence.addEventListener('input', updateAnimationConfig);
animationSpeed.addEventListener('input', updateAnimationConfig);
document.addEventListener('click', (event) => {
  const action = event.target.dataset.editorAction;
  if (!action || !history) return;
  if (action === 'undo') history = undo(history);
  if (action === 'redo') history = redo(history);
  if (action === 'reset') resetDraft();
  if (action === 'export') downloadDraft();
  if (action === 'run') { if (!simulation) resetSimulation(); running = true; }
  if (action === 'pause') running = false;
  if (action === 'step') advanceSimulation();
  if (action === 'flip') flipSimulation();
  if (action === 'record') { recording = !recording; if (recording) replay = createReplay(); event.target.textContent = `录制：${recording ? '开' : '关'}`; }
  if (action === 'playback') { resetSimulation(true); running = true; }
  if (action === 'sim-reset') resetSimulation();
  if (action === 'timeline-rewind') { resetSimulation(false); setStatus('时间轴已回到起点'); }
  if (action === 'timeline-current' && simulation) { timelineScrub.value = String(simulation.state.tick); timelineTick.textContent = String(simulation.state.tick); }
  if (action === 'apply-properties') applyProperties();
  if (action === 'apply-physics') applyPhysics();
  if (action === 'animation-toggle') { animationConfig.playing = !animationConfig.playing; event.target.textContent = `动画：${animationConfig.playing ? '播放' : '暂停'}`; animationConfig.lastAt = performance.now(); }
  if (action === 'test-package') {
    const diff = createDraftDiff(sourceDraft, history.current);
    const link = document.createElement('a'); const url = URL.createObjectURL(new Blob([exportTestPackage({ draft: history.current, replay, diff, parameters: { localPlayers: Number(localPlayerCount.value), latencyMs: lab.latencyMs, lossPercent: lab.lossPercent, physics: simulation?.room?.debugTuning?.() ?? null, animation: { state: animationConfig.state, sequence: animationConfig.sequence, speed: animationConfig.speed } }, note: '从 /dev 导出的物理复现包，请人工审核后再提交 Git' })], { type: 'application/json' }));
    link.href = url; link.download = 'gswitch-test-package.json'; link.click(); URL.revokeObjectURL(url);
    setStatus(`测试包已生成：新增 ${diff.addedColliders.length} 格，删除 ${diff.removedColliders.length} 格`);
  }
  updateInspector(); draw();
});
importer.addEventListener('change', async () => {
  if (!importer.files?.[0]) return;
  try { history = createHistory(parseEditorDraft(await importer.files[0].text())); setStatus('已导入本地草稿'); renderSegments(); updateInspector(); draw(); }
  catch (error) { setStatus(error.message); }
  importer.value = '';
});
packageImporter.addEventListener('change', async () => {
  if (!packageImporter.files?.[0]) return;
  try {
    const pack = parseTestPackage(await packageImporter.files[0].text());
    history = createHistory(pack.draft); replay = pack.replay;
    if (pack.parameters?.localPlayers) localPlayerCount.value = String(Math.min(4, Math.max(1, Number(pack.parameters.localPlayers))));
    if (pack.parameters?.latencyMs !== undefined) latencyInput.value = String(pack.parameters.latencyMs);
    if (pack.parameters?.lossPercent !== undefined) lossInput.value = String(pack.parameters.lossPercent);
    configureLab();
    if (pack.parameters?.physics) { if (!simulation) resetSimulation(); simulation.room.setDebugTuning(pack.parameters.physics); }
    if (pack.parameters?.animation?.sequence?.length) { animationState.value = pack.parameters.animation.state ?? 'run'; animationSequence.value = pack.parameters.animation.sequence.join(','); animationSpeed.value = String(pack.parameters.animation.speed ?? 20); updateAnimationConfig(); }
    setStatus(`已导入测试包：${pack.note || '无备注'}`); renderSegments(); updateInspector(); draw();
  } catch (error) { setStatus(error.message); }
  packageImporter.value = '';
});
addEventListener('keydown', (event) => { if (event.code === 'Space' && !event.repeat) { event.preventDefault(); flipSimulation(); } });
load().catch((error) => { setStatus(error.message); validation.textContent = error.message; });
requestAnimationFrame(advanceLoop);
