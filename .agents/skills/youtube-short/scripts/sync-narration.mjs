#!/usr/bin/env node
// sync-narration.mjs <story> [--force]
// Synthesizes every segment via the local Voicebox server, then applies the
// story's pacing (silence trim + atempo) so all segments fit the 60s budget.
// Idempotent: existing raw/paced wavs are reused unless --force is given.
import fs from 'node:fs';
import path from 'node:path';
import { resolveStory, loadStory, storyPaths, mkdirs, probeDuration } from './pipeline-util.mjs';
import { ensureVoiceboxServer, ensurePresetProfile, synthSegment, paceWav } from './lib-voicebox.mjs';

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const storyArg = args.find((a) => !a.startsWith('--'));
  if (!storyArg) throw new Error('usage: node sync-narration.mjs <story> [--force]');

  const dir = resolveStory(storyArg);
  const story = loadStory(dir);
  const { raw, nff, durations } = storyPaths(dir);
  mkdirs(raw, nff);

  await ensureVoiceboxServer();
  const profileId = await ensurePresetProfile(story.voice);
  console.log(`Voicebox profile "${story.voice.profileName}" id=${profileId}`);

  const n = story.segments.length;
  for (let i = 0; i < n; i++) {
    const seg = story.segments[i];
    const idx = String(i + 1).padStart(2, '0');
    const rawFile = path.join(raw, `segment_${idx}.wav`);
    if (!force && fs.existsSync(rawFile) && probeDuration(rawFile) > 0) {
      console.log(`seg ${seg.id}: reuse existing raw ${rawFile}`);
    } else {
      console.log(`seg ${seg.id}: synthesizing… (${seg.text.slice(0, 60)}…)`);
      const buf = await synthSegment(profileId, story.voice, seg.text);
      fs.writeFileSync(rawFile, buf);
      console.log(`seg ${seg.id}: raw OK (${(buf.length / 1024).toFixed(0)} KiB)`);
    }
  }

  const durList = [];
  for (let i = 0; i < n; i++) {
    const seg = story.segments[i];
    const idx = String(i + 1).padStart(2, '0');
    const finalFile = path.join(nff, `segment_${idx}.wav`);
    if (!force && fs.existsSync(finalFile) && probeDuration(finalFile) > 0) {
      console.log(`seg ${seg.id}: reuse existing paced ${finalFile}`);
    } else {
      const p = story.pacing || {};
      paceWav({
        input: path.join(raw, `segment_${idx}.wav`),
        output: finalFile,
        speed: p.speed ?? 1.15,
        silenceDb: p.silenceDb ?? -35,
        silenceStart: p.silenceStart ?? 0.08,
      });
    }
    durList.push(probeDuration(finalFile));
  }

  fs.writeFileSync(durations, JSON.stringify(durList, null, 2) + '\n');
  const total = durList.reduce((a, b) => a + b, 0);
  console.log('\nPaced narration durations:');
  durList.forEach((d, i) => console.log(`  segment_${String(i + 1).padStart(2, '0')}.wav  ${d.toFixed(3)}s`));
  console.log(`Total (target ≤ ~58s to fit 60s Short): ${total.toFixed(3)}s`);
  console.log(`durations -> ${durations}`);
  if (total > 59) {
    console.warn('Narration total exceeds the 60s budget. Raise pacing.speed (≤ ~1.2x) or trim text.');
  }
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});