import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { transform } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'src', 'lib', 'search.ts');
const outPath = join(__dirname, '..', 'public', 'search.js');

const src = readFileSync(srcPath, 'utf-8');

// Remove the window assignment and interfaces — we'll handle IIFE manually
const cleaned = src
  .replace(/export interface \w+ \{[\s\S]*?\}/g, '')
  .replace(/^export /gm, '')
  .replace(
    /if \(typeof window !== "undefined"\) \{[\s\S]*?\}/,
    '',
  )
  .trim();

const result = await transform(cleaned, {
  loader: 'ts',
  target: 'es2020',
});

// Wrap in IIFE with SearchLib global
const iife = `var SearchLib = (function() {
${result.code}
  return { fuzzyMatch, searchExact, searchFuzzy, search, escapeHtml, highlight, getExcerpt };
})();\n`;

writeFileSync(outPath, iife);
console.log('Compiled search.ts → public/search.js');
