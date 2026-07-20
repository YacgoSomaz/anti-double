import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, 'assets/reverse/bitmap-manifest.json'), 'utf8'));
const byImageId = new Map(
  manifest
    .filter(({ className }) => className.includes('_Img'))
    .map((asset) => [asset.className.split('_Img')[1], asset]),
);

await mkdir(resolve(root, 'public/data'), { recursive: true });
await mkdir(resolve(root, 'public/assets/visual'), { recursive: true });
const copied = new Set();
for (const levelId of ['mp02', 'mp03', 'mp04']) {
  const raw = JSON.parse(await readFile(resolve(root, `tools/${levelId}-visual-source.json`), 'utf8'));
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
  if (missing.length) console.warn(`${levelId} has no extracted bitmap for: ${missing.join(', ')}`);

  await writeFile(resolve(root, `public/data/${levelId}-visual.json`), JSON.stringify({ assets, ...raw }));
  await Promise.all(Object.values(assets).map(async ({ file }) => {
    if (copied.has(file)) return;
    copied.add(file);
    await cp(resolve(root, 'assets/reverse/bitmaps', file), resolve(root, 'public/assets/visual', basename(file)));
  }));
}
