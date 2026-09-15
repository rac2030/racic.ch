#!/usr/bin/env node
// build-short.mjs <story> [--steps narration,capture,assemble,verify] [--force]
// One-command rebuild of a short from its story manifest. Handles the
// prerequisites (dist server, Voicebox) and runs each pipeline step in order.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveStory, waitForHttp, startDetached } from './pipeline-util.mjs';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.SHORT_BASE_URL || 'http://127.0.0.1:4322';
const VOICEBOX = process.env.VOICEBOX_URL || 'http://127.0.0.1:17493';

async function ensureBase() {
  if (await waitForHttp(`${BASE_URL}/wiki/`, { timeoutMs: 5000, label: 'shorts base' })) {
    console.log(`[env] site reachable at ${BASE_URL}`);
    return;
  }
  if (fs.existsSync('dist')) {
    const pid = startDetached('python3', ['-m', 'http.server', '4322', '--directory', 'dist'], process.cwd());
    console.log(`[env] started http.server (pid ${pid}); waiting for ${BASE_URL}…`);
    if (!(await waitForHttp(`${BASE_URL}/wiki/`, { timeoutMs: 20000 }))) {
      throw new Error(`site still not reachable at ${BASE_URL}`);
    }
    return;
  }
  throw new Error(`Shorts base URL ${BASE_URL} is down and there is no dist/ to serve. Run npm run build first.`);
}

async function ensureVoicebox() {
  if (await waitForHttp(`${VOICEBOX}/health`, { timeoutMs: 5000, label: 'voicebox' })) {
    console.log(`[env] Voicebox reachable at ${VOICEBOX}`);
    return;
  }
  const uvicorn = '/tmp/voicebox/backend/venv/bin/uvicorn';
  if (fs.existsSync(uvicorn)) {
    const pid = startDetached(uvicorn, ['backend.main:app', '--host', '127.0.0.1', '--port', '17493'], '/tmp/voicebox');
    console.log(`[env] started uvicorn (pid ${pid}) — first synthesis may download the model`);
    if (!(await waitForHttp(`${VOICEBOX}/health`, { timeoutMs: 25000 }))) {
      throw new Error(`Voicebox still not reachable at ${VOICEBOX}`);
    }
    return;
  }
  throw new Error(
    `Voicebox is not installed (${VOICEBOX} down, ${uvicorn} missing). Set up the backend first — ` +
      `see the youtube-short skill, "Running the Voicebox server".`
  );
}

async function main() {
  const args = process.argv.slice(2);
  const storyArg = args.find((a) => !a.startsWith('--'));
  const steps = (args.find((a) => a.startsWith('--steps=')) || '').split('=')[1] || 'narration,capture,assemble,verify';
  const force = args.includes('--force');
  if (!storyArg) throw new Error('usage: node build-short.mjs <story> [--steps=narration,capture,assemble,verify] [--force]');

  const dir = resolveStory(storyArg);
  console.log(`\nBuilding short for story at ${dir}\n`);

  await ensureBase();
  if (steps.includes('narration')) await ensureVoicebox();

  const order = ['narration', 'capture', 'assemble', 'verify'];
  for (const step of order) {
    if (!steps.split(',').includes(step)) continue;
    console.log(`\n===== step: ${step} =====`);
    const script = path.join(SCRIPTS, `${step}.mjs`);
    const extra = force && step === 'narration' ? ['--force'] : [];
    const r = spawnSync(process.execPath, [script, storyArg, ...extra], { stdio: 'inherit', cwd: process.cwd() });
    if (r.status !== 0) {
      throw new Error(`step ${step} failed (exit ${r.status})`);
    }
  }

  console.log('\nBuild complete. Output:');
  console.log('  ' + path.join(dir, 'output', 'final_short.mp4'));
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});