import { applyColliderEdit, createEditorDraft, createHistory, exportEditorDraft, parseEditorDraft, redo, undo, validateEditorDraft } from '/editor-draft.js';

const canvas = document.querySelector('#editor-canvas');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#draft-status');
const validation = document.querySelector('#validation');
const inspector = document.querySelector('#inspector');
const segmentList = document.querySelector('#segment-list');
const simulationReadout = document.querySelector('#simulation-readout');
const importer = document.querySelector('#draft-import');
let originalLevel;
let history;
let activeLayer = 'collision';
let brush = 'paint';
let painting = false;
let pan;
let view = { x: 0, y: 150, scale: 0.55 };
let selected;
let running = false;

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
  simulationReadout.textContent = running ? '模拟准备中：第二阶段接入本地 GameRoom。' : '已停止。可画碰撞格、撤销重做、导入导出草稿。';
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
  if (selected) { const box = cellScreen(selected); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeRect(box.x + 1, box.y + 1, box.size - 2, box.size - 2); }
}
function editAt(point) {
  if (activeLayer !== 'collision') return;
  const cell = cellAt(point); selected = cell;
  history = applyColliderEdit(history, { ...cell, solid: brush === 'paint' });
  updateInspector(); draw();
}
function resetDraft() {
  history = createHistory(createEditorDraft(originalLevel, 'marathon'));
  selected = undefined; view = { x: 0, y: 150, scale: 0.55 }; setStatus('已恢复为原始 marathon 草稿'); updateInspector(); draw();
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
document.addEventListener('click', (event) => {
  const action = event.target.dataset.editorAction;
  if (!action || !history) return;
  if (action === 'undo') history = undo(history);
  if (action === 'redo') history = redo(history);
  if (action === 'reset') resetDraft();
  if (action === 'export') downloadDraft();
  if (action === 'run') running = true;
  if (action === 'pause') running = false;
  if (action === 'step') simulationReadout.textContent = '单帧：等待物理模拟模块接入。';
  updateInspector(); draw();
});
importer.addEventListener('change', async () => {
  if (!importer.files?.[0]) return;
  try { history = createHistory(parseEditorDraft(await importer.files[0].text())); setStatus('已导入本地草稿'); renderSegments(); updateInspector(); draw(); }
  catch (error) { setStatus(error.message); }
  importer.value = '';
});
load().catch((error) => { setStatus(error.message); validation.textContent = error.message; });
