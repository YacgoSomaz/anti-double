import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MatchManager } from './match-manager.mjs';
import { ITEM_TYPE_CODES } from './item-system.mjs';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_MESSAGE_BYTES = 512;
const MAX_MESSAGES_PER_SECOND = 20;
const PHYSICS_HZ = 40;
const DEFAULT_RACE_BROADCAST_HZ = 40;
const ITEM_PACKET_RANGE = 1800;
const publicDir = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const soloGameModule = fileURLToPath(new URL('./game-room.mjs', import.meta.url));
const collisionIndexModule = fileURLToPath(new URL('./collision-index.mjs', import.meta.url));
const itemSystemModule = fileURLToPath(new URL('./item-system.mjs', import.meta.url));
const skinLibraryModule = fileURLToPath(new URL('./skin-library.mjs', import.meta.url));
const editorPage = fileURLToPath(new URL('../public/dev.html', import.meta.url));
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.mp3', 'audio/mpeg']
]);
const cacheableMediaExtensions = new Set(['.png', '.mp3']);
const etagCache = new Map();

function etagFor(file, metadata) {
  const revision = `${metadata.size}:${metadata.mtimeMs}`;
  const cached = etagCache.get(file);
  if (cached?.revision === revision) return cached.value;
  const value = `"${createHash('sha256').update(readFileSync(file)).digest('base64url')}"`;
  etagCache.set(file, { revision, value });
  return value;
}

function accept(key) {
  return createHash('sha1').update(key + GUID).digest('base64');
}

function textFrame(message) {
  const payload = Buffer.from(JSON.stringify(message));
  if (payload.length > 65535) throw new Error('Message too large');
  const header = payload.length <= 125
    ? Buffer.from([0x81, payload.length])
    : Buffer.from([0x81, 126, payload.length >> 8, payload.length & 255]);
  return Buffer.concat([header, payload]);
}

function decode(buffer) {
  const messages = [];
  let cursor = 0;
  while (cursor + 2 <= buffer.length) {
    const first = buffer[cursor];
    const second = buffer[cursor + 1];
    const sizeCode = second & 127;
    if (sizeCode === 127 || !(second & 128) || !(first & 128)) throw new Error('Invalid frame');
    const extendedLength = sizeCode === 126 ? 2 : 0;
    if (cursor + 2 + extendedLength > buffer.length) break;
    const size = sizeCode === 126 ? buffer.readUInt16BE(cursor + 2) : sizeCode;
    if (size > MAX_MESSAGE_BYTES) throw new Error('Invalid frame');
    const maskStart = cursor + 2 + extendedLength;
    const payloadStart = maskStart + 4;
    if (payloadStart + size > buffer.length) break;
    const mask = buffer.subarray(maskStart, payloadStart);
    const payload = Buffer.alloc(size);
    for (let index = 0; index < size; index += 1) payload[index] = buffer[payloadStart + index] ^ mask[index % 4];
    messages.push({ opcode: first & 15, value: payload.toString('utf8') });
    cursor = payloadStart + size;
  }
  return { messages, rest: buffer.subarray(cursor) };
}

function parseInput(value) {
  try {
    const data = JSON.parse(value);
    if (data?.type === 'join' && typeof data.room === 'string' && (data.name === undefined || typeof data.name === 'string') && (data.skinId === undefined || (typeof data.skinId === 'string' && data.skinId.length <= 32))) return { type: 'join', room: data.room, name: data.name, skinId: data.skinId };
    if (data?.type === 'select_skin' && typeof data.skinId === 'string' && data.skinId.length <= 32) return { type: 'select_skin', skinId: data.skinId };
    if (data?.type === 'ready') return { type: 'ready' };
    if (data?.type === 'start') return { type: 'start' };
    if (data?.type === 'flip' && Number.isInteger(data.sequence) && data.sequence > 0 && data.sequence <= 1000000000) return { type: 'flip', sequence: data.sequence };
    if (data?.type === 'ping') return { type: 'ping' };
    if (data?.type === 'diagnostics') {
      const diagnostics = parseDiagnostics(data.diagnostics);
      if (diagnostics) return { type: 'diagnostics', diagnostics };
    }
  } catch {}
  return null;
}

function parseDiagnostics(value) {
  if (!value || typeof value !== 'object') return null;
  const limits = {
    packetP95Ms: 60000, packetMaxMs: 60000, skippedTicks: 10000,
    serverP95Ms: 60000, frameFps: 240, droppedFrames: 10000
  };
  const diagnostics = {};
  for (const [key, maximum] of Object.entries(limits)) {
    if (!Number.isInteger(value[key]) || value[key] < 0 || value[key] > maximum) return null;
    diagnostics[key] = value[key];
  }
  return diagnostics;
}

function sameOrigin(request) {
  if (!request.headers.origin) return true;
  try { return new URL(request.headers.origin).host === request.headers.host; } catch { return false; }
}

function stateMessage(snapshot) {
  return {
    type: 'state',
    tick: snapshot.tick,
    phase: snapshot.phase,
    hostSlot: snapshot.hostSlot,
    cameraX: snapshot.cameraX,
    cameraSpeed: snapshot.cameraSpeed,
    introTicksRemaining: snapshot.introTicksRemaining,
    players: snapshot.players.map(({ id, ...player }) => player),
    results: snapshot.results
  };
}

function coordinate(value) {
  return Math.round(value * 100);
}

// A race frame has no value once a newer frame exists.  When Node reports
// socket backpressure, retain only that newest frame until `drain`; join,
// start and result messages still use the reliable direct sender below.
export function createLatestStateSender(write) {
  let waitingForDrain = false;
  let pending;
  const flush = () => {
    if (waitingForDrain || !pending) return;
    const next = pending;
    pending = undefined;
    waitingForDrain = !write(next);
  };
  return {
    send(message) {
      pending = message;
      flush();
    },
    drain() {
      waitingForDrain = false;
      flush();
    },
    clear() {
      pending = undefined;
    }
  };
}

// The lobby needs names and readiness flags, but resending that immutable data
// forty times a second during a race wastes nearly all of a small uplink.  Race
// packets contain only the fields that can change while the browser keeps the
// player metadata it received in the lobby snapshot.
export function encodeRaceState(snapshot, tickIntervalMs) {
  return {
    type: 'state',
    compact: true,
    tick: snapshot.tick,
    c: [coordinate(snapshot.cameraX), coordinate(snapshot.cameraSpeed)],
    ...(snapshot.introTicksRemaining > 0 ? { i: snapshot.introTicksRemaining } : {}),
    ...(Number.isFinite(tickIntervalMs) ? { d: Math.max(0, Math.round(tickIntervalMs * 10)) } : {}),
    ...(snapshot.items?.length ? { o: snapshot.items.filter((item) => item.active !== false && Math.abs(Number(item.x) - Number(snapshot.cameraX)) <= ITEM_PACKET_RANGE).map((item) => [ITEM_TYPE_CODES[item.type] ?? 0, coordinate(item.x), coordinate(item.y)]) } : {}),
    ...(snapshot.results?.length ? { r: snapshot.results.map(({ slot, rank, outcome, score }) => [slot, rank, outcome === 'finished' ? 1 : 0, Math.max(0, Math.floor(score ?? 0))]) } : {}),
    p: snapshot.players.map((player) => [
      player.slot,
      coordinate(player.x), coordinate(player.y),
      coordinate(player.vx), coordinate(player.vy),
      player.gravity,
      (player.finished ? 1 : 0) | (player.eliminated ? 2 : 0) | (player.blockedX ? 4 : 0),
      Math.max(0, Math.floor(player.phaseTicks ?? 0)),
      Math.max(0, Math.floor(player.speedBoostTicks ?? 0)),
      Math.max(0, Math.round((Number(player.sizeScale) || 1) * 100))
    ])
  };
}

// Bresenham-style rate gate lets deployments lower update rate if needed.
// The default mirrors every 40 Hz physics frame, avoiding an uneven cadence.
export function createRaceBroadcastGate({ physicsHz = PHYSICS_HZ, broadcastHz = DEFAULT_RACE_BROADCAST_HZ } = {}) {
  if (!Number.isInteger(physicsHz) || !Number.isInteger(broadcastHz) || physicsHz < 1 || broadcastHz < 1 || broadcastHz > physicsHz) throw new RangeError('Invalid broadcast rate');
  const credits = new Map();
  return {
    shouldBroadcast(room) {
      const next = (credits.get(room) ?? 0) + broadcastHz;
      if (next < physicsHz) {
        credits.set(room, next);
        return false;
      }
      credits.set(room, next - physicsHz);
      return true;
    },
    reset(room) { credits.delete(room); }
  };
}

export function createRealtimeServer({ level, autoTick = true, raceBroadcastHz = DEFAULT_RACE_BROADCAST_HZ }) {
  const matches = new MatchManager(level);
  const raceBroadcastGate = createRaceBroadcastGate({ broadcastHz: raceBroadcastHz });
  const clients = new Map();
  const diagnosticReports = new Map();
  let lastDiagnosticLogAt = 0;
  const diagnostics = () => {
    const now = Date.now();
    for (const [id, report] of diagnosticReports) if (now - report.updatedAt > 120000) diagnosticReports.delete(id);
    const reports = [...diagnosticReports.values()];
    const maximum = (key) => Math.max(0, ...reports.map((report) => report[key]));
    const minimum = (key) => reports.length ? Math.min(...reports.map((report) => report[key])) : 0;
    return {
      reports: reports.length,
      packetP95Ms: maximum('packetP95Ms'),
      packetMaxMs: maximum('packetMaxMs'),
      skippedTicks: reports.reduce((total, report) => total + report.skippedTicks, 0),
      serverP95Ms: maximum('serverP95Ms'),
      minimumFrameFps: minimum('frameFps'),
      droppedFrames: reports.reduce((total, report) => total + report.droppedFrames, 0)
    };
  };
  const server = createServer((request, response) => {
    response.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; connect-src 'self' ws: wss:");
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.url === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return response.end('{"ok":true}');
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return response.writeHead(405).end();
    let pathname; let requestUrl;
    try {
      requestUrl = new URL(request.url, 'http://local');
      pathname = decodeURIComponent(requestUrl.pathname);
    } catch { return response.writeHead(404).end(); }
    const virtualModules = new Map([
      ['/solo-game.mjs', soloGameModule],
      ['/collision-index.mjs', collisionIndexModule],
      ['/item-system.mjs', itemSystemModule],
      ['/skin-library.mjs', skinLibraryModule],
      ['/dev', editorPage]
    ]);
    const candidate = virtualModules.get(pathname)
      ?? resolve(publicDir, pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''));
    if ((!virtualModules.has(pathname) && !candidate.startsWith(publicDir + sep)) || !mimeTypes.has(extname(candidate))) return response.writeHead(404).end();
    try {
      const metadata = statSync(candidate);
      if (!metadata.isFile()) return response.writeHead(404).end();
      const extension = extname(candidate);
      const cacheable = cacheableMediaExtensions.has(extension) || extension === '.json';
      const cacheControl = cacheableMediaExtensions.has(extension) && requestUrl.searchParams.has('v')
        ? 'public, max-age=31536000, immutable'
        : cacheable
          ? 'public, max-age=0, must-revalidate'
          : 'no-store';
      const etag = cacheable ? etagFor(candidate, metadata) : undefined;
      const headers = { 'Content-Type': mimeTypes.get(extension), 'Content-Length': metadata.size, 'Cache-Control': cacheControl, ...(etag ? { ETag: etag } : {}) };
      if (etag && request.headers['if-none-match'] === etag) {
        response.writeHead(304, { 'Cache-Control': cacheControl, ETag: etag });
        return response.end();
      }
      response.writeHead(200, headers);
      if (request.method === 'HEAD') return response.end();
      createReadStream(candidate).pipe(response);
    } catch { response.writeHead(404).end(); }
  });
  const send = (id, message) => {
    const client = clients.get(id);
    if (client?.socket.writable) client.socket.write(textFrame(message));
  };
  const sendRaceState = (id, message) => clients.get(id)?.raceStateSender.send(message);
  const broadcast = (update) => update?.recipients.forEach((id) => send(id, stateMessage(update.snapshot)));
  let lastTickAt = performance.now();
  const resultTicksSent = new Map();
  const tick = () => {
    const now = performance.now();
    const tickIntervalMs = Math.max(0, now - lastTickAt);
    lastTickAt = now;
    matches.tick(1 / 40).forEach((update) => {
      const regularRacePacket = update.snapshot.phase === 'playing' && raceBroadcastGate.shouldBroadcast(update.room);
      const isNewResult = update.snapshot.phase === 'results' && resultTicksSent.get(update.room) !== update.snapshot.tick;
      if (update.snapshot.phase !== 'playing') raceBroadcastGate.reset(update.room);
      if (!regularRacePacket && !isNewResult) return;
      if (isNewResult) resultTicksSent.set(update.room, update.snapshot.tick);
      const message = encodeRaceState(update.snapshot, tickIntervalMs);
      if (isNewResult) {
        update.recipients.forEach((id) => {
          clients.get(id)?.raceStateSender.clear();
          send(id, message);
        });
      } else {
        update.recipients.forEach((id) => sendRaceState(id, message));
      }
      if (isNewResult) {
        matches.closeCompletedRoom(update.room);
        resultTicksSent.delete(update.room);
        raceBroadcastGate.reset(update.room);
      }
    });
  };
  const timer = autoTick ? setInterval(tick, 1000 / PHYSICS_HZ) : null;

  server.on('upgrade', (request, socket, head) => {
    const key = request.headers['sec-websocket-key'];
    if (new URL(request.url, 'http://local').pathname !== '/ws' || request.headers['sec-websocket-version'] !== '13' || typeof key !== 'string' || !sameOrigin(request)) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      return;
    }
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept(key)}\r\n\r\n`);
    const id = randomUUID();
    const client = {
      socket,
      buffer: Buffer.from(head),
      times: [],
      raceStateSender: createLatestStateSender((message) => socket.write(textFrame(message)))
    };
    clients.set(id, client);
    const receive = (chunk) => {
      try {
        client.buffer = Buffer.concat([client.buffer, chunk]);
        const decoded = decode(client.buffer);
        client.buffer = decoded.rest;
        for (const frame of decoded.messages) {
          if (frame.opcode === 8) return socket.end();
          if (frame.opcode !== 1) throw new Error('Unsupported opcode');
          const now = Date.now();
          client.times = client.times.filter((time) => now - time < 1000);
          if (client.times.length >= MAX_MESSAGES_PER_SECOND) { send(id, { type: 'error', error: 'rate_limited' }); continue; }
          client.times.push(now);
          const input = parseInput(frame.value);
          if (!input) { send(id, { type: 'error', error: 'invalid_message' }); continue; }
          if (input.type === 'join') {
            const result = matches.join(input.room, id, input.name, false, input.skinId);
            if (!result.ok) send(id, { type: 'error', error: result.error });
            else {
              const { id: ignored, ...player } = result.player;
              send(id, { type: 'joined', room: result.room, player });
              broadcast(matches.roomState(result.room));
            }
          } else if (input.type === 'ready') {
            const result = matches.setReady(id);
            if (!result.ok) send(id, { type: 'error', error: result.error });
            else {
              send(id, { type: 'ready_ok' });
              broadcast(matches.roomState(result.room));
            }
          } else if (input.type === 'select_skin') {
            const result = matches.selectSkin(id, input.skinId);
            if (!result.ok) send(id, { type: 'error', error: result.error });
            else {
              send(id, { type: 'skin_selected', skinId: result.skinId });
              broadcast(matches.roomState(result.room));
            }
          } else if (input.type === 'start') {
            const result = matches.start(id);
            if (!result.ok) send(id, { type: 'error', error: result.error });
            else {
              const update = matches.roomState(result.room);
              update.recipients.forEach((recipient) => send(recipient, { type: 'started', tick: update.snapshot.tick, hostSlot: update.snapshot.hostSlot }));
              broadcast(update);
            }
          } else if (input.type === 'flip') {
            const result = matches.input(id, input);
            send(id, result.ok ? { type: 'input_ok', tick: result.tick } : { type: 'error', error: result.error });
          } else if (input.type === 'diagnostics') {
            diagnosticReports.set(id, { ...input.diagnostics, updatedAt: Date.now() });
            if (Date.now() - lastDiagnosticLogAt >= 10000) {
              lastDiagnosticLogAt = Date.now();
              console.log(`gswitch diagnostics ${JSON.stringify(diagnostics())}`);
            }
            send(id, { type: 'diagnostics_ok' });
          } else {
            send(id, { type: 'pong' });
          }
        }
      } catch { socket.end(); }
    };
    if (client.buffer.length) receive(Buffer.alloc(0));
    socket.on('data', receive);
    socket.on('drain', () => client.raceStateSender.drain());
    socket.on('close', () => { const room = matches.leave(id); clients.delete(id); broadcast(matches.roomState(room)); });
    socket.on('error', () => socket.destroy());
  });
  return { server, tick, diagnostics, close: () => { if (timer) clearInterval(timer); for (const client of clients.values()) client.socket.destroy(); server.close(); } };
}
