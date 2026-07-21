import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MatchManager } from './match-manager.mjs';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_MESSAGE_BYTES = 512;
const MAX_MESSAGES_PER_SECOND = 20;
const RACE_BROADCAST_EVERY_TICKS = 2;
const publicDir = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
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
    const size = second & 127;
    if (size === 126 || size === 127 || !(second & 128) || !(first & 128) || size > MAX_MESSAGE_BYTES) throw new Error('Invalid frame');
    if (cursor + 6 + size > buffer.length) break;
    const mask = buffer.subarray(cursor + 2, cursor + 6);
    const payload = Buffer.alloc(size);
    for (let index = 0; index < size; index += 1) payload[index] = buffer[cursor + 6 + index] ^ mask[index % 4];
    messages.push({ opcode: first & 15, value: payload.toString('utf8') });
    cursor += 6 + size;
  }
  return { messages, rest: buffer.subarray(cursor) };
}

function parseInput(value) {
  try {
    const data = JSON.parse(value);
    if (data?.type === 'join' && typeof data.room === 'string' && (data.name === undefined || typeof data.name === 'string')) return { type: 'join', room: data.room, name: data.name };
    if (data?.type === 'ready') return { type: 'ready' };
    if (data?.type === 'start') return { type: 'start' };
    if (data?.type === 'flip' && Number.isInteger(data.sequence) && data.sequence > 0 && data.sequence <= 1000000000) return { type: 'flip', sequence: data.sequence };
    if (data?.type === 'ping') return { type: 'ping' };
  } catch {}
  return null;
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
    players: snapshot.players.map(({ id, ...player }) => player)
  };
}

function coordinate(value) {
  return Math.round(value * 100);
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
    ...(Number.isFinite(tickIntervalMs) ? { d: Math.max(0, Math.round(tickIntervalMs * 10)) } : {}),
    p: snapshot.players.map((player) => [
      player.slot,
      coordinate(player.x), coordinate(player.y),
      coordinate(player.vx), coordinate(player.vy),
      player.gravity,
      (player.finished ? 1 : 0) | (player.eliminated ? 2 : 0) | (player.blockedX ? 4 : 0)
    ])
  };
}

export function createRealtimeServer({ level, autoTick = true }) {
  const matches = new MatchManager(level);
  const clients = new Map();
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
    const candidate = resolve(publicDir, pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''));
    if (!candidate.startsWith(publicDir + sep) || !mimeTypes.has(extname(candidate))) return response.writeHead(404).end();
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
  const broadcast = (update) => update?.recipients.forEach((id) => send(id, stateMessage(update.snapshot)));
  let lastTickAt = performance.now();
  const tick = () => {
    const now = performance.now();
    const tickIntervalMs = Math.max(0, now - lastTickAt);
    lastTickAt = now;
    matches.tick(1 / 40)
      .filter((update) => update.snapshot.phase === 'playing' && update.snapshot.tick % RACE_BROADCAST_EVERY_TICKS === 0)
      .forEach((update) => update.recipients.forEach((id) => send(id, encodeRaceState(update.snapshot, tickIntervalMs))));
  };
  const timer = autoTick ? setInterval(tick, 1000 / 40) : null;

  server.on('upgrade', (request, socket, head) => {
    const key = request.headers['sec-websocket-key'];
    if (new URL(request.url, 'http://local').pathname !== '/ws' || request.headers['sec-websocket-version'] !== '13' || typeof key !== 'string' || !sameOrigin(request)) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      return;
    }
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept(key)}\r\n\r\n`);
    const id = randomUUID();
    const client = { socket, buffer: Buffer.from(head), times: [] };
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
            const result = matches.join(input.room, id, input.name, false);
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
          } else {
            send(id, { type: 'pong' });
          }
        }
      } catch { socket.end(); }
    };
    if (client.buffer.length) receive(Buffer.alloc(0));
    socket.on('data', receive);
    socket.on('close', () => { const room = matches.leave(id); clients.delete(id); broadcast(matches.roomState(room)); });
    socket.on('error', () => socket.destroy());
  });
  return { server, tick, close: () => { if (timer) clearInterval(timer); for (const client of clients.values()) client.socket.destroy(); server.close(); } };
}
