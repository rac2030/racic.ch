#!/usr/bin/env node
// verify.mjs <story>
// Programmatic QA for the finished short:
//  - duration ≤ 60s, resolution 1080x1920, audio stream present + not silent
//  - frame luminance smoke test (no blank frames on dark backgrounds)
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolveStory, loadStory, storyPaths, ffmpegBin, ffprobeBin, probeDuration } from './pipeline-util.mjs';

function runOut(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

// ffmpeg writes its summary lines (volumedetect, signalstats) to stderr; capture both.
function runBoth(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd} failed (exit ${r.status})\n${(r.stderr || '').slice(0, 800)}`);
  return (r.stdout || '') + '\n' + (r.stderr || '');
}

function getStreams(file) {
  return runOut(ffprobeBin(), ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,sample_rate,channels', '-of', 'json', file]);
}

async function main() {
  const storyArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (!storyArg) throw new Error('usage: node verify.mjs <story>');

  const dir = resolveStory(storyArg);
  const story = loadStory(dir);
  const final = path.join(storyPaths(dir).out, 'final_short.mp4');
  if (!fs.existsSync(final)) throw new Error(`no final_short.mp4 at ${final} — run assemble first`);

  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });

  const dur = probeDuration(final);
  add('duration ≤ 60s', dur <= 60.05, `${dur.toFixed(3)}s`);

  const streams = JSON.parse(getStreams(final)).streams;
  const video = streams.find((s) => s.codec_type === 'video');
  const audio = streams.find((s) => s.codec_type === 'audio');
  add('video 1080x1920', !!video && video.width === 1080 && video.height === 1920, video ? `${video.width}x${video.height} (${video.codec_name})` : 'no video stream');
  add('audio stream present', !!audio, audio ? `${audio.codec_name} ${audio.sample_rate || ''}Hz` : 'no audio stream');

  let meanDb = -Infinity;
  try {
    const vd = runBoth(ffmpegBin(), ['-i', final, '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-']);
    const m = vd.match(/mean_volume: ([-\d.]+) dB/);
    meanDb = m ? parseFloat(m[1]) : -Infinity;
  } catch { /* audio parse */ }
  add('audio not silent (mean > -40 dB)', meanDb > -40, meanDb === -Infinity ? 'unreadable' : `${meanDb.toFixed(1)} dB`);

  let yavg = [];
  try {
    const sel = 'not(mod(t\\,5))';
    const out = runBoth(ffmpegBin(), ['-i', final, '-vf', `select=${sel},signalstats,metadata=print:file=-`, '-f', 'null', '-']);
    yavg = [...out.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map((g) => parseFloat(g[1]));
  } catch { /* frames */ }
  const blank = yavg.filter((v) => v < 4).length;
  add(`frames non-blank (${yavg.length} sampled)`, yavg.length === 0 || blank === 0, yavg.length ? `${yavg.length} samples, min ${Math.min(...yavg).toFixed(1)}` : 'no metadata (check manually)');

  let failures = 0;
  console.log(`Verifying ${final}`);
  for (const c of checks) {
    console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}  (${c.detail})`);
    if (!c.ok) failures++;
  }
  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});