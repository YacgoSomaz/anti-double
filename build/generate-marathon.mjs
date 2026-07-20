import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadLevel } from '../src/level-loader.mjs';

const output = fileURLToPath(new URL('../public/data/marathon.json', import.meta.url));
writeFileSync(output, `${JSON.stringify(loadLevel('marathon'))}\n`);
