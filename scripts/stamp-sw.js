import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

const swPath = join(process.cwd(), 'public', 'sw.js');
const content = readFileSync(swPath, 'utf-8');
const hash = createHash('md5').update(content).digest('hex').slice(0, 8);
const stamped = content.replace(
  /const CACHE_NAME = ['"]racic-ch-v1['"]\s*;/,
  `const CACHE_NAME = "racic-ch-${hash}";`
);
writeFileSync(swPath, stamped);
console.log(`SW cache-busted: racic-ch-${hash}`);
