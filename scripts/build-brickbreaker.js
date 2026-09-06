import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { transform } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'src', 'lib', 'brick-breaker.ts');
const outPath = join(__dirname, '..', 'public', 'brick-breaker.js');

const src = readFileSync(srcPath, 'utf-8');

// Remove the interfaces/types and window assignment — we'll handle IIFE manually
const cleaned = src
  .replace(/^export interface \w+ \{[\s\S]*?\}$/gm, '')
  .replace(/^export type \w+ = [^;]+;$/gm, '')
  .replace(
    /\/\/ IIFE bundle[\s\S]*?if \(typeof window !== "undefined"\) \{[\s\S]*?\}\n?/,
    '',
  )
  .replace(/^export /gm, '')
  .trim();

const result = await transform(cleaned, {
  loader: 'ts',
  target: 'es2020',
});

// Wrap in IIFE with BrickBreakerLib global
const iife = `var BrickBreakerLib = (function() {
${result.code}
  return { BrickBreaker, createGame, update, parsePattern, startGame, launchBall, setPointer, movePaddleBy, LEVEL_PATTERNS, BRICK_COLORS };
})();\n`;

writeFileSync(outPath, iife);
console.log('Compiled brick-breaker.ts → public/brick-breaker.js');