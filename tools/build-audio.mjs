import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'assets/reverse/sounds');
const destination = resolve(root, 'public/assets/sounds');
const sounds = ['025_SndMusic.mp3', '032_SndMenuMusic.mp3', '036_SndSwitch.mp3', '038_SndPopupAppear.mp3'];

mkdirSync(destination, { recursive: true });
for (const sound of sounds) copyFileSync(resolve(source, sound), resolve(destination, sound));
console.log(`Copied ${sounds.length} recovered original sounds.`);
