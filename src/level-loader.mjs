import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const levelFiles = new Map([
  ['mp02', '../src/data/mp02.json'],
  ['mp03', '../src/data/mp03.json'],
  ['mp04', '../src/data/mp04.json']
]);
const multiplayerSpawns = [
  { x: 316, y: 103, gravity: -1, speedX: 211.6983 },
  { x: 316, y: 325, gravity: 1, speedX: 211.6983 },
  { x: 316, y: 240, gravity: -1, speedX: 211.6983 },
  { x: 316, y: 188, gravity: 1, speedX: 211.6983 }
];

const world = { cellSize: 34, originY: 425 };

function readLevel(name) {
  const file = levelFiles.get(name);
  if (!file) throw new Error('Unknown level');
  return JSON.parse(readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8'));
}

function prepareLevel(data) {
  return {
    ...data,
    world,
    colliders: data.colliders.map((collider) => ({ ...collider })),
    spawns: data.spawns.map((spawn, index) => ({ ...spawn, ...multiplayerSpawns[index] }))
  };
}

function loadMarathon() {
  let offsetCells = 0;
  const colliders = [];
  const segments = [];
  let firstLevel;
  for (const id of levelFiles.keys()) {
    const data = readLevel(id);
    if (!firstLevel) firstLevel = data;
    const furthestCell = Math.max(...data.colliders.map((collider) => collider.x));
    const lengthCells = furthestCell + 2;
    const startX = offsetCells * world.cellSize;
    colliders.push(...data.colliders.map((collider) => ({ ...collider, x: collider.x + offsetCells })));
    segments.push({ id, startX, endX: (offsetCells + lengthCells) * world.cellSize });
    offsetCells += lengthCells;
  }
  return {
    tileSize: firstLevel.tileSize,
    world,
    colliders,
    spawns: firstLevel.spawns.map((spawn, index) => ({ ...spawn, ...multiplayerSpawns[index] })),
    finishX: offsetCells * world.cellSize,
    segments
  };
}

export function loadLevel(name) {
  if (name === 'marathon') return loadMarathon();
  return prepareLevel(readLevel(name));
}
