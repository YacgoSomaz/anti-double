import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const levelFiles = new Map([
  ['mp02', '../src/data/mp02.json'],
  ['mp03', '../src/data/mp03.json'],
  ['mp04', '../src/data/mp04.json'],
  ['marathon-authored', '../src/data/marathon-authored.json']
]);
const multiplayerSpawns = [
  { x: 316, y: 103, gravity: 1, speedX: 211.6983 },
  { x: 316, y: 325, gravity: -1, speedX: 211.6983 },
  { x: 316, y: 240, gravity: 1, speedX: 211.6983 },
  { x: 316, y: 188, gravity: -1, speedX: 211.6983 }
];

const world = { cellSize: 34, originY: 425 };
const playerPhysics = Object.freeze({ hitboxWidth: 37, hitboxHeight: 28 });
// A recovered checkpoint beam scans in from the side and dissipates for 0.9 s;
// only after it is gone do player atlas frames 23–44 begin at 20 FPS.  The
// server runs at 40 Hz, so the complete authoritative opening is 80 ticks.
const OPENING_BEAM_TICKS = 36;
const OPENING_MORPH_TICKS = 44;
const OPENING_INTRO_TICKS = OPENING_BEAM_TICKS + OPENING_MORPH_TICKS;

function readLevel(name) {
  const file = levelFiles.get(name);
  if (!file) throw new Error('Unknown level');
  return JSON.parse(readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8'));
}

function prepareLevel(data) {
  return {
    ...data,
    world,
    playerPhysics,
    colliders: data.colliders.map((collider) => ({ ...collider })),
    spawns: data.spawns.map((spawn, index) => ({ ...spawn, ...multiplayerSpawns[index] }))
  };
}

function loadMarathon() {
  // The editor supplied a complete marathon draft. Keep that file as the
  // authoritative source for both the server and generated browser map;
  // otherwise the loader would silently rebuild the older pre-editor course.
  const authored = readLevel('marathon-authored');
  return {
    ...authored,
    world: authored.world ?? world,
    openingMorphTicks: Number.isFinite(authored.openingMorphTicks) ? authored.openingMorphTicks : OPENING_INTRO_TICKS,
    itemConfig: authored.itemConfig ?? { seed: 44052, count: 18, minimumSpacing: 420 },
    playerPhysics: authored.playerPhysics ?? playerPhysics,
    colliders: authored.colliders.map((collider) => ({ ...collider })),
    spawns: authored.spawns.map((spawn) => ({ ...spawn })),
    segments: authored.segments.map((segment) => ({ ...segment }))
  };
}

export function loadLevel(name) {
  if (name === 'marathon') return loadMarathon();
  return prepareLevel(readLevel(name));
}
