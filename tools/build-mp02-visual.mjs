import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, 'assets/reverse/bitmap-manifest.json'), 'utf8'));
const raw = JSON.parse(await readFile(resolve(root, 'tools/mp02-visual-source.json'), 'utf8'));
const byImageId = new Map(
  manifest
    .filter(({ className }) => className.includes('_Img'))
    .map((asset) => [asset.className.split('_Img')[1], asset]),
);

const imageIds = new Set([...raw.visualInfo, ...raw.frontVisualInfo].map(({ imageId }) => imageId));
const assets = Object.fromEntries(
  [...imageIds]
    .filter((imageId) => byImageId.has(imageId))
    .map((imageId) => {
      const { file, width, height } = byImageId.get(imageId);
      return [imageId, { file, width, height }];
    }),
);
const missing = [...imageIds].filter((imageId) => !assets[imageId]);
if (missing.length) console.warn(`No extracted bitmap for: ${missing.join(', ')}`);

await mkdir(resolve(root, 'public/data'), { recursive: true });
await mkdir(resolve(root, 'public/assets/visual'), { recursive: true });
await writeFile(resolve(root, 'public/data/mp02-visual.json'), JSON.stringify({ assets, visualInfo: raw.visualInfo, frontVisualInfo: raw.frontVisualInfo }));
await Promise.all(Object.values(assets).map(({ file }) => cp(resolve(root, 'assets/reverse/bitmaps', file), resolve(root, 'public/assets/visual', basename(file)))));
