import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(projectRoot, 'node_modules/@ffmpeg/core/dist/umd');
const destination = resolve(projectRoot, 'public/ffmpeg');
mkdirSync(destination, { recursive: true });
for (const name of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  copyFileSync(resolve(source, name), resolve(destination, name));
}
console.log('Copied local FFmpeg WebAssembly core into public/ffmpeg/');