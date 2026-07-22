import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const levelFiles = new Map([
  ['mp02', '../src/data/mp02.json'],
  ['mp03', '../src/data/mp03.json'],
  ['mp04', '../src/data/mp04.json']
]);
// A full course rotation uses every recovered multiplayer map.  Run it twice
// so a completed online race is long enough without introducing fabricated
// obstacles or additional visual assets.
const marathonCourseOrder = ['mp03', 'mp04', 'mp02', 'mp03', 'mp04', 'mp02'];
const multiplayerSpawns = [
  { x: 316, y: 103, gravity: 1, speedX: 211.6983 },
  { x: 316, y: 325, gravity: -1, speedX: 211.6983 },
  { x: 316, y: 240, gravity: 1, speedX: 211.6983 },
  { x: 316, y: 188, gravity: -1, speedX: 211.6983 }
];

const world = { cellSize: 34, originY: 425 };
// A recovered checkpoint beam first obscures the runner for 0.4 s; only after
// it dissipates do the recovered player atlas frames 23–44 begin at 20 FPS.
// The server runs at 40 Hz, so the complete authoritative opening is 60 ticks.
const OPENING_BEAM_TICKS = 16;
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
    colliders: data.colliders.map((collider) => ({ ...collider })),
    spawns: data.spawns.map((spawn, index) => ({ ...spawn, ...multiplayerSpawns[index] }))
  };
}

function loadMarathon() {
  let offsetCells = 0;
  const colliders = [];
  const segments = [];
  let firstLevel;
  for (const [index, id] of marathonCourseOrder.entries()) {
    const data = readLevel(id);
    if (!firstLevel) firstLevel = data;
    const furthestCell = Math.max(...data.colliders.map((collider) => collider.x));
    const lengthCells = furthestCell + 2;
    const startX = offsetCells * world.cellSize;
    const opensPreviousSeam = index > 0;
    const opensNextSeam = index < marathonCourseOrder.length - 1;
    const fullHeightWalls = new Set(
      [...new Set(data.colliders.map((collider) => collider.x))].filter((cell) =>
        Array.from({ length: 11 }, (_, index) => index + 1)
          .every((row) => data.colliders.some((collider) => collider.x === cell && collider.y === row))
      )
    );
    // The recovered maps contain several full-height columns inside their
    // closing tunnel, not only the final column.  They are end gates rather
    // than playable obstacles, so intermediate marathon segments must drop
    // the complete group to leave a continuous route to the next map.
    const isClosingWall = (collider) => collider.y >= 1 && collider.y <= 11
      && ((opensPreviousSeam && collider.x === 0)
        || (opensNextSeam && collider.x > 0 && fullHeightWalls.has(collider.x)));
    colliders.push(...data.colliders.filter((collider) => !isClosingWall(collider)).map((collider) => ({ ...collider, x: collider.x + offsetCells })));
    segments.push({ id, startX, endX: (offsetCells + lengthCells) * world.cellSize, isFinal: index === marathonCourseOrder.length - 1 });
    offsetCells += lengthCells;
  }
  return {
    tileSize: firstLevel.tileSize,
    world,
    openingMorphTicks: OPENING_INTRO_TICKS,
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
