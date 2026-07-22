export const DEV_TUNING_STORAGE_KEY = 'gswitch-online:dev-tuning-v1';

export const DEFAULT_DEV_TUNING = Object.freeze({
  speedMultiplier: 1,
  cameraSpeedMultiplier: 1,
  recoveryMultiplier: 1,
  gravityMultiplier: 1,
  hitboxWidth: 37,
  hitboxHeight: 28,
  eliminationMargin: 60
});

const limits = Object.freeze({
  speedMultiplier: [0.5, 2],
  cameraSpeedMultiplier: [0.5, 2],
  recoveryMultiplier: [0.1, 3],
  gravityMultiplier: [0.25, 2],
  hitboxWidth: [20, 56],
  hitboxHeight: [28, 72],
  eliminationMargin: [0, 180]
});

export function isDeveloperMode(search = '') {
  return new URLSearchParams(search).get('dev') === '1';
}

export function normalizeDevTuning(value = {}) {
  return Object.fromEntries(Object.entries(DEFAULT_DEV_TUNING).map(([key, fallback]) => {
    const [min, max] = limits[key];
    const numeric = Number(value[key]);
    const next = Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
    const pixelControl = ['hitboxWidth', 'hitboxHeight', 'eliminationMargin'].includes(key);
    return [key, pixelControl ? Math.round(next) : Math.round(next * 1000) / 1000];
  }));
}

export function loadDevTuning(storage) {
  try { return normalizeDevTuning(JSON.parse(storage?.getItem(DEV_TUNING_STORAGE_KEY) ?? '{}')); }
  catch { return { ...DEFAULT_DEV_TUNING }; }
}

export function saveDevTuning(storage, tuning) {
  storage?.setItem(DEV_TUNING_STORAGE_KEY, JSON.stringify(normalizeDevTuning(tuning)));
}

export function exportDevConfig(tuning) {
  return JSON.stringify({ version: 1, tuning: normalizeDevTuning(tuning) }, null, 2);
}

export function parseDevConfig(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !parsed.tuning || typeof parsed.tuning !== 'object') throw new Error('invalid');
    return normalizeDevTuning(parsed.tuning);
  } catch { throw new Error('配置文件格式无效'); }
}

export function createDeveloperPanel(tuning, onChange) {
  const panel = document.createElement('aside');
  panel.id = 'dev-panel';
  panel.innerHTML = `
    <header><strong>开发者模式 · 单人本地</strong><button type="button" data-dev-action="collapse">收起</button></header>
    <p>参数仅保存在本机浏览器，不影响线上房间。</p>
    <div class="dev-overlay-options"><label><input type="checkbox" data-dev-overlay="hitboxes" checked> 角色碰撞箱</label><label><input type="checkbox" data-dev-overlay="blocks" checked> 方块碰撞体</label><label><input type="checkbox" data-dev-overlay="centre" checked> 镜头中线</label><label><input type="checkbox" data-dev-overlay="boundary" checked> 淘汰边界</label></div>
    <div class="dev-tuning-controls">
      <label>起跑速度 <output data-dev-output="speedMultiplier"></output><input data-dev-param="speedMultiplier" type="range" min="0.5" max="2" step="0.05"></label>
      <label>镜头速度 <output data-dev-output="cameraSpeedMultiplier"></output><input data-dev-param="cameraSpeedMultiplier" type="range" min="0.5" max="2" step="0.05"></label>
      <label>追赶补偿 <output data-dev-output="recoveryMultiplier"></output><input data-dev-param="recoveryMultiplier" type="range" min="0.1" max="3" step="0.05"></label>
      <label>重力 <output data-dev-output="gravityMultiplier"></output><input data-dev-param="gravityMultiplier" type="range" min="0.25" max="2" step="0.05"></label>
      <label>碰撞宽度 <output data-dev-output="hitboxWidth"></output><input data-dev-param="hitboxWidth" type="range" min="20" max="56" step="1"></label>
      <label>碰撞高度 <output data-dev-output="hitboxHeight"></output><input data-dev-param="hitboxHeight" type="range" min="28" max="72" step="1"></label>
      <label>淘汰余量 <output data-dev-output="eliminationMargin"></output><input data-dev-param="eliminationMargin" type="range" min="0" max="180" step="1"></label>
    </div>
    <output class="dev-readout" data-dev-readout>等待单人局开始…</output>
    <div class="dev-actions"><button type="button" data-dev-action="restart">重开单人</button><button type="button" data-dev-action="pause">暂停</button><button type="button" data-dev-action="step">单帧</button><button type="button" data-dev-action="slow">慢放：关</button><button type="button" data-dev-action="preview">结算预览</button><button type="button" data-dev-action="reset">重置参数</button><button type="button" data-dev-action="export">导出 JSON</button><label class="dev-import">导入 JSON<input type="file" accept="application/json,.json" data-dev-action="import"></label></div>`;
  const overlays = { hitboxes: true, blocks: true, centre: true, boundary: true };
  let collapsed = false;
  const paint = (value) => {
    for (const [key, entry] of Object.entries(value)) {
      panel.querySelector(`[data-dev-param="${key}"]`).value = String(entry);
      panel.querySelector(`[data-dev-output="${key}"]`).textContent = key.includes('Multiplier') ? `${entry.toFixed(2)}×` : `${entry}px`;
    }
  };
  paint(tuning);
  panel.addEventListener('input', (event) => {
    const key = event.target.dataset.devParam;
    if (!key) return;
    const next = normalizeDevTuning({ ...tuning, [key]: event.target.value });
    Object.assign(tuning, next); paint(tuning); onChange?.(tuning, overlays);
  });
  panel.addEventListener('change', (event) => {
    const key = event.target.dataset.devOverlay;
    if (!key) return;
    overlays[key] = event.target.checked; onChange?.(tuning, overlays);
  });
  return { panel, overlays, paint, setCollapsed(value) { collapsed = value; panel.classList.toggle('collapsed', collapsed); } };
}
