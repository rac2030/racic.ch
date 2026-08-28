import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { transform } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'src', 'lib', 'sw.ts');
const outPath = join(__dirname, '..', 'public', 'sw.js');

const src = readFileSync(srcPath, 'utf-8');

// Strip export keywords for plain script output
const cleaned = src
  .replace(/^export /gm, '')
  .trim();

const result = await transform(cleaned, {
  loader: 'ts',
  target: 'es2020',
});

writeFileSync(outPath, result.code);
console.log('Compiled sw.ts → public/sw.js');
