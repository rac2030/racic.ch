#!/usr/bin/env node
// sync-narration.mjs <story> [--force]
// Synthesizes every segment × every language track via the local Voicebox server,
// then applies the story's pacing (silence trim + atempo). Idempotent: existing
// raw/paced wavs are reused unless --force is given.
//
// Output layout:
//   short (kind !== walkthrough): narration/segment_XX.wav + narration_final/segment_XX.wav
//   walkthrough: narration/<lang>/segment_XX.wav + narration_final/<lang>/segment_XX.wav
//
// durations.json always carries the per-segment MAX across tracks (capture + assemble
// both consume it); durations.<code>.json holds each track's own paced durations.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveStory, loadStory, storyPaths, mkdirs, probeDuration } from './pipeline-util.mjs';
import { ensureVoiceboxServer, ensurePresetProfile, synthSegment, paceWav } from './lib-voicebox.mjs';

function tracksFor(story) {
  if (Array.isArray(story.languages) && story.languages.length) {
    return story.languages.map((l) => ({ code: l.code, voice: l.voice, textOf: (seg) => seg.texts?.[l.code] ?? '' }));
  }
  return [{ code: 'en', voice: story.voice, textOf: (seg) => seg.text ?? '' }];
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const storyArg = args.find((a) => !a.startsWith('--'));
  if (!storyArg) throw new Error('usage: node sync-narration.mjs <story> [--force]');

  const dir = resolveStory(storyArg);
  const story = loadStory(dir);
  const walkthrough = story.kind === 'walkthrough';
  const pics = storyPaths(dir);
  const tracks = tracksFor(story);
  const n = story.segments.length;

  await ensureVoiceboxServer();
  const profiles = {};
  for (const t of tracks) {
    profiles[t.code] = await ensurePresetProfile(t.voice);
    console.log(`Voicebox profile "${t.voice.profileName}" id=${profiles[t.code]}`);
  }

  for (const t of tracks) {
    const sub = walkthrough ? t.code : '';
    const raw = path.join(pics.raw, sub);
    const nff = path.join(pics.nff, sub);
    mkdirs(raw, nff);
    for (let i = 0; i < n; i++) {
      const seg = story.segments[i];
      const idx = String(i + 1).padStart(2, '0');
      const text = t.textOf(seg);
      if (!text) throw new Error(`segment ${seg.id} has no ${t.code} text`);
      const rawFile = path.join(raw, `segment_${idx}.wav`);
      if (!force && fs.existsSync(rawFile) && probeDuration(rawFile) > 0) {
        console.log(`${t.code} ${seg.id}: reuse existing raw ${rawFile}`);
      } else {
        console.log(`${t.code} ${seg.id}: synthesizing… (${text.slice(0, 60)}…)`);
        const buf = await synthSegment(profiles[t.code], t.voice, text);
        fs.writeFileSync(rawFile, buf);
        console.log(`${t.code} ${seg.id}: raw OK (${(buf.length / 1024).toFixed(0)} KiB)`);
      }
    }
  }

  const trackDurs = {}; // code -> number[]
  for (const t of tracks) {
    const sub = walkthrough ? t.code : '';
    const nff = path.join(pics.nff, sub);
    const durs = [];
    for (let i = 0; i < n; i++) {
      const seg = story.segments[i];
      const idx = String(i + 1).padStart(2, '0');
      const finalFile = path.join(nff, `segment_${idx}.wav`);
      if (!force && fs.existsSync(finalFile) && probeDuration(finalFile) > 0) {
        console.log(`${t.code} ${seg.id}: reuse existing paced ${finalFile}`);
      } else {
        const p = story.pacing || {};
        paceWav({ input: path.join(pics.raw, sub, `segment_${idx}.wav`), output: finalFile, speed: p.speed ?? 1.15, silenceDb: p.silenceDb ?? -35, silenceStart: p.silenceStart ?? 0.08 });
      }
      durs.push(probeDuration(finalFile));
    }
    trackDurs[t.code] = durs;
    fs.writeFileSync(path.join(dir, `durations.${t.code}.json`), JSON.stringify(durs, null, 2) + '\n');
  }

  const perSegmentMax = Array.from({ length: n }, (_, i) => Math.max(...tracks.map((t) => trackDurs[t.code][i])));
  fs.writeFileSync(pics.durations, JSON.stringify(perSegmentMax, null, 2) + '\n');

  console.log('\nPaced narration durations (per track):');
  for (const t of tracks) {
    const durs = trackDurs[t.code];
    const total = durs.reduce((a, b) => a + b, 0);
    console.log(`  ${t.code.padEnd(5)} ${durs.map((d) => d.toFixed(1)).join(', ')}  = ${total.toFixed(1)}s`);
  }
  const total = perSegmentMax.reduce((a, b) => a + b, 0);
  console.log(`Segment max (drives capture/assemble): ${perSegmentMax.map((d) => d.toFixed(1)).join(', ')}  = ${total.toFixed(1)}s`);
  console.log(`durations -> ${pics.durations}`);
  const budget = walkthrough ? 330 : 59;
  if (total > budget) {
    console.warn(`Narration total ${total.toFixed(1)}s exceeds the ${budget}s budget. Raise pacing.speed or trim text.`);
  }
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});