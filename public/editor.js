import { applyColliderEdit, createEditorDraft, createHistory, exportEditorDraft, parseEditorDraft, redo, undo, validateEditorDraft } from '/editor-draft.js';
import { createReplay, eventsAtTick, exportTestPackage, parseTestPackage, recordFlip } from '/editor-replay.js';
import { createLocalNetworkLab, deliverSnapshots, queueSnapshot } from '/editor-network.js';
import { createDraftDiff } from '/editor-package.js';
import { GameRoom } from '/solo-game.mjs';
import { animationFrame, frameSourceRect, morphFrame } from '/player-animation.js';

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
let originalLevel;
let sourceDraft;
let history;
let activeLayer = 'collision';
let brush = 'paint';
let painting = false;
let pan;
let view = { x: 0, y: 150, scale: 0.55 };
let selected;
let running = false;
let simulation;
let replay = createReplay();
let recording = false;
let replaying = false;
let simulationSequence = 0;
let simulationAccumulator = 0;
let simulationLastAt = performance.now();
let lab = createLocalNetworkLab();
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
function setStatus(value) { status.textContent = value; }
function updateInspector() {
  const draft = history.current; const valid = validateEditorDraft(draft);
  validation.textContent = valid.valid ? `草稿有效\n${draft.colliders.length} 个碰撞格\n撤销 ${history.undoStack.length} · 重做 ${history.redoStack.length}` : valid.errors.join('\n');
  const selection = selected ? `碰撞格 (${selected.x}, ${selected.y})` : '尚未选择对象';
  inspector.replaceChildren(...[['选择', selection], ['图层', activeLayer], ['格尺寸', `${courseCell()} px`], ['终点', `${Math.round(draft.finishX)} px`], ['出生点', String(draft.spawns.length)]].flatMap(([term, description]) => {
    const dt = document.createElement('dt'); dt.textContent = term;
    const dd = document.createElement('dd'); dd.textContent = description;
    return [dt, dd];
  }));
  const presented = simulation?.displayState ?? simulation?.state;
  const player = presented?.players?.[0];
  simulationReadout.textContent = player
    ? `${running ? '运行中' : '已暂停'} · tick ${presented.tick}\n位置 ${Math.round(player.x)}, ${Math.round(player.y)}\n速度 ${Math.round(player.vx)}, ${Math.round(player.vy)} · 镜头 ${Math.round(presented.cameraSpeed)}\n本地 ${localPlayerCount.value} 人 · 显示延迟 ${lab.latencyMs} ms · 丢包 ${lab.dropped}\n回放事件 ${replay.events.length}${recording ? ' · 正在录制' : ''}${replaying ? ' · 回放中' : ''}`
    : '尚未运行。可先画碰撞格，再按“运行”验证本地物理。';
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
  const presented = simulation?.displayState ?? simulation?.state;
  if (presented) for (const player of presented.players) {
    const x = view.x + player.x * view.scale;
    const y = view.y + player.y * view.scale;
    ctx.save(); ctx.translate(x + 34 * view.scale, y + 34 * view.scale); if (player.gravity < 0) ctx.scale(1, -1);
    ctx.fillStyle = '#20dce0'; ctx.fillRect(-12 * view.scale, -18 * view.scale, 24 * view.scale, 36 * view.scale); ctx.restore();
  }
  if (selected) { const box = cellScreen(selected); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeRect(box.x + 1, box.y + 1, box.size - 2, box.size - 2); }
}
function editAt(point) {
  if (activeLayer !== 'collision') return;
  const cell = cellAt(point); selected = cell;
  history = applyColliderEdit(history, { ...cell, solid: brush === 'paint' });
  updateInspector(); draw();
}
function resetDraft() {
  sourceDraft = sourceDraft ?? createEditorDraft(originalLevel, 'marathon');
  history = createHistory(structuredClone(sourceDraft));
  selected = undefined; view = { x: 0, y: 150, scale: 0.55 }; setStatus('已恢复为原始 marathon 草稿'); updateInspector(); draw();
}
function resetSimulation(replayMode = false) {
  const room = new GameRoom(history.current);
  const count = Number(localPlayerCount.value);
  for (let index = 0; index < count; index += 1) room.join(index ? `bot-${index}` : 'editor', index ? `本地机器人 ${index}` : '编辑器', true);
  room.start('editor');
  lab = createLocalNetworkLab({ latencyMs: lab.latencyMs, lossPercent: lab.lossPercent });
  const state = room.snapshot(); simulation = { room, state, displayState: state }; simulationSequence = 0; simulationAccumulator = 0; simulationLastAt = performance.now(); replaying = replayMode; running = false;
  updateInspector(); draw();
}
function advanceSimulation(frames = 1) {
  if (!simulation) resetSimulation(replaying);
  for (let frame = 0; frame < frames && simulation.state.phase === 'playing'; frame += 1) {
    const nextTick = simulation.state.tick + 1;
    if (replaying) for (const event of eventsAtTick(replay, nextTick)) if (event.type === 'flip') simulation.room.input('editor', { type: 'flip', sequence: ++simulationSequence });
    simulation.state = simulation.room.tick(1 / 40);
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
  const frame = animationState.value === 'morph' ? morphFrame(now % 1100) : animationFrame(now, animationState.value === 'fall');
  const source = frameSourceRect(frame); animationCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
  animationCtx.imageSmoothingEnabled = false; animationCtx.drawImage(image, source.x, source.y, source.width, source.height, 77, 20, 65, 77);
  animationCtx.fillStyle = '#b8e6ec'; animationCtx.font = '11px ui-monospace'; animationCtx.fillText(`帧 ${frame} · ${animationState.value}`, 8, 119);
}
function configureLab() {
  lab = createLocalNetworkLab({ latencyMs: latencyInput.value, lossPercent: lossInput.value });
  latencyOutput.textContent = `${lab.latencyMs} ms`; lossOutput.textContent = `${lab.lossPercent}%`; updateInspector();
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
async function load() {
  const response = await fetch('/data/marathon.json');
  if (!response.ok) throw new Error('无法读取 marathon 数据');
  originalLevel = await response.json(); resetDraft(); renderSegments();
}

canvas.addEventListener('contextmenu', (event) => event.preventDefault());
canvas.addEventListener('pointerdown', (event) => {
  const point = pointAt(event);
  if (event.button === 1 || event.button === 2) { pan = { point, view: { ...view } }; canvas.setPointerCapture(event.pointerId); return; }
  painting = true; canvas.setPointerCapture(event.pointerId); editAt(point);
});
canvas.addEventListener('pointermove', (event) => {
  const point = pointAt(event);
  if (pan) { view.x = pan.view.x + point.x - pan.point.x; view.y = pan.view.y + point.y - pan.point.y; draw(); return; }
  if (painting) editAt(point);
});
canvas.addEventListener('pointerup', (event) => { painting = false; pan = undefined; canvas.releasePointerCapture?.(event.pointerId); });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault(); const point = pointAt(event); const world = worldAt(point); const next = Math.max(0.08, Math.min(3, view.scale * (event.deltaY < 0 ? 1.12 : 0.89)));
  view = { scale: next, x: point.x - world.x * next, y: point.y - world.y * next }; draw();
}, { passive: false });
document.addEventListener('change', (event) => { if (event.target.name === 'brush') brush = event.target.value; if (event.target.dataset.editorLayer) { activeLayer = event.target.dataset.editorLayer; updateInspector(); } });
localPlayerCount.addEventListener('change', () => { resetSimulation(); });
latencyInput.addEventListener('input', configureLab); lossInput.addEventListener('input', configureLab);
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
  if (action === 'test-package') {
    const diff = createDraftDiff(sourceDraft, history.current);
    const link = document.createElement('a'); const url = URL.createObjectURL(new Blob([exportTestPackage({ draft: history.current, replay, diff, parameters: { localPlayers: Number(localPlayerCount.value), latencyMs: lab.latencyMs, lossPercent: lab.lossPercent }, note: '从 /dev 导出的物理复现包，请人工审核后再提交 Git' })], { type: 'application/json' }));
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
    history = createHistory(pack.draft); replay = pack.replay; setStatus(`已导入测试包：${pack.note || '无备注'}`); renderSegments(); updateInspector(); draw();
  } catch (error) { setStatus(error.message); }
  packageImporter.value = '';
});
addEventListener('keydown', (event) => { if (event.code === 'Space' && !event.repeat) { event.preventDefault(); flipSimulation(); } });
load().catch((error) => { setStatus(error.message); validation.textContent = error.message; });
requestAnimationFrame(advanceLoop);
