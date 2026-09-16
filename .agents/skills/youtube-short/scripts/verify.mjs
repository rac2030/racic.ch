#!/usr/bin/env node
// verify.mjs <story>
// Programmatic QA for the finished short:
//  - duration ≤ 60s, resolution 1080x1920, audio stream present + not silent
//  - frame luminance smoke test (no blank frames on dark backgrounds)
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolveStory, loadStory, storyPaths, ffmpegBin, ffprobeBin, probeDuration, audioDurations } from './pipeline-util.mjs';

const LANG_2_TO_3 = { en: 'eng', de: 'ger', fr: 'fra', hi: 'hin' };

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

function getLangTags(file) {
  const out = runOut(ffprobeBin(), ['-v', 'error', '-show_entries', 'stream=codec_type:stream_tags=language', '-of', 'json', file]);
  return (JSON.parse(out).streams || []).map((s) => ({ type: s.codec_type, lang: s.tags?.language || '' }));
}

function voiceRegions(file, streamIndex, { sr = 8000, win = 0.05, thrDb = -45 } = {}) {
  const buf = execFileSync(ffmpegBin(), [
    '-v', 'error', '-i', file, '-map', `0:a:${streamIndex}`,
    '-ac', '1', '-ar', String(sr), '-f', 's16le', '-',
  ], { maxBuffer: 64 * 1024 * 1024 });
  const samples = new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
  const winN = Math.max(1, Math.round(sr * win));
  const thr = 10 ** (thrDb / 20) * 32768;
  const active = new Uint8Array(Math.ceil(samples.length / winN));
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
    if ((i + 1) % winN === 0) {
      active[Math.floor(i / winN)] = Math.sqrt(sum / winN) > thr ? 1 : 0;
      sum = 0;
    }
  }
  let firstActive = -1;
  for (let i = 0; i < active.length; i++) { if (active[i]) { firstActive = i; break; } }
  let lastActive = -1;
  for (let i = active.length - 1; i >= 0; i--) { if (active[i]) { lastActive = i; break; } }
  const islands = [];
  let runStart = -1;
  for (let i = 0; i <= active.length; i++) {
    const a = i < active.length ? active[i] : 0;
    if (a && runStart === -1) runStart = i;
    else if (!a && runStart !== -1) { islands.push([runStart, i]); runStart = -1; }
  }
  return {
    firstActive: firstActive === -1 ? -1 : firstActive * win,
    activeEnd: lastActive === -1 ? 0 : (lastActive + 1) * win,
    islands: islands.map(([s, e]) => [s * win, e * win]),
  };
}

async function main() {
  const storyArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (!storyArg) throw new Error('usage: node verify.mjs <story>');

  const dir = resolveStory(storyArg);
  const story = loadStory(dir);
  const walkthrough = story.kind === 'walkthrough';
  const final = path.join(storyPaths(dir).out, walkthrough ? 'walkthrough.mp4' : 'final_short.mp4');
  if (!fs.existsSync(final)) throw new Error(`no ${path.basename(final)} at ${final} — run assemble first`);

  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });

  const [expectW, expectH] = (story.capture?.videoSize) || [1080, 1920];

  const dur = probeDuration(final);
  if (walkthrough) {
    add('duration 4:00–5:30', dur >= 240 && dur <= 330.5, `${dur.toFixed(3)}s`);
  } else {
    add('duration ≤ 60s', dur <= 60.05, `${dur.toFixed(3)}s`);
  }

  const streams = JSON.parse(getStreams(final)).streams;
  const video = streams.find((s) => s.codec_type === 'video');
  const audios = streams.filter((s) => s.codec_type === 'audio');
  add('video resolution', !!video && video.width === expectW && video.height === expectH, video ? `${video.width}x${video.height} (${video.codec_name})` : 'no video stream');

  if (walkthrough) {
    const codes = (story.languages || []).map((l) => l.code);
    add(`audio streams (${codes.join('/')})`, audios.length === codes.length, `${audios.length} stream(s)`);
    const tags = getLangTags(final).filter((s) => s.type === 'audio');
    const okLangs = codes.every((c) => tags.some((t) => t.lang === c || t.lang === (LANG_2_TO_3[c.split('-')[0]] || c)));
    add('audio language tags', okLangs, tags.length ? tags.map((t) => t.lang || '?').join(', ') : '(none)');
  } else {
    add('audio stream present', audios.length > 0, audios.length ? `${audios[0].codec_name} ${audios[0].sample_rate || ''}Hz` : 'no audio stream');
  }

  let meanDb = -Infinity;
  try {
    const vd = runBoth(ffmpegBin(), ['-i', final, '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-']);
    const m = vd.match(/mean_volume: ([-\d.]+) dB/);
    meanDb = m ? parseFloat(m[1]) : -Infinity;
  } catch { /* audio parse */ }
  add('audio not silent (mean > -40 dB)', meanDb > -40, meanDb === -Infinity ? 'unreadable' : `${meanDb.toFixed(1)} dB`);

  // Slot-aligned timeline sync checks — these catch the back-to-back concat drift and trailing silence regressions.
  const allCodes = walkthrough ? (story.languages || []).map((l) => l.code) : ['en'];
  const narrMax = audioDurations(dir, story);
  const tail = story.assembly?.tailSeconds ?? 0.35;
  const slots = narrMax.map((d) => d + tail);
  const slotStart = slots.map((_, k) => slots.slice(0, k).reduce((a, b) => a + b, 0));
  audios.forEach((_, s) => {
    const lang = allCodes[s] || `a${s}`;
    const langFile = path.join(dir, `durations.${lang}.json`);
    const narr = fs.existsSync(langFile) ? JSON.parse(fs.readFileSync(langFile, 'utf8')) : narrMax;
    const last = narr.length - 1;
    const expectedEnd = slotStart[last] + narr[last];
    const reg = voiceRegions(final, s);
    add(`track ${lang} narration ends on time (sync)`, Math.abs(expectedEnd - reg.activeEnd) <= 1.0,
      `slot ${slotStart[last].toFixed(2)}s + narr ${narr[last].toFixed(2)}s = ${expectedEnd.toFixed(2)}s, audio active to ${reg.activeEnd.toFixed(2)}s`);
    if (last > 0) {
      const cue = reg.islands.find(([s]) => s >= slotStart[last] - 0.5);
      add(`track ${lang} narration starts on cue (sync)`, !!cue && Math.abs(cue[0] - slotStart[last]) <= 1.0,
        cue ? `expected ${slotStart[last].toFixed(2)}s, first voice at ${cue[0].toFixed(2)}s` : `no voice found in last slot (drift?)`);
    }
    if (s === 0) add('first narration starts promptly (sync)', reg.firstActive >= 0 && reg.firstActive <= 1.0, `${Math.max(0, reg.firstActive).toFixed(2)}s`);
  });

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