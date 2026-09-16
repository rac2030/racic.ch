#!/usr/bin/env node
// assemble.mjs <story>
// Trims each captured segment to its narration window (+ tail), concatenates
// the video segments, concatenates each language track's paced narration, and
// muxes them into <story>/output/<final>.mp4. Uses -t (NOT -shortest).
// Shorts get one audio stream; walkthroughs get one audio stream per language
// (first track = default; all tracks tagged with their language code).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveStory, loadStory, storyPaths, mkdirs, ffmpegBin, ffprobeBin, probeDuration, audioDurations } from './pipeline-util.mjs';

const LANG_2_TO_3 = { en: 'eng', de: 'ger', fr: 'fra' };

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

function tracksFor(story) {
  if (Array.isArray(story.languages) && story.languages.length) {
    const walkthrough = story.kind === 'walkthrough';
    return story.languages.map((l) => ({ code: l.code, sub: walkthrough ? l.code : '' }));
  }
  return [{ code: 'en', sub: '' }];
}

async function main() {
  const storyArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (!storyArg) throw new Error('usage: node assemble.mjs <story>');

  const dir = resolveStory(storyArg);
  const story = loadStory(dir);
  const walkthrough = story.kind === 'walkthrough';
  const tracks = tracksFor(story);
  const pics = storyPaths(dir);
  mkdirs(pics.seg, pics.out);

  const captured = JSON.parse(fs.readFileSync(pics.captured, 'utf8'));
  const durations = audioDurations(dir, story);
  const tail = story.assembly?.tailSeconds ?? 0.35;
  const [width, height] = (story.capture?.videoSize) || [1080, 1920];
  const fps = story.assembly?.fps ?? 25;

  if (captured.results.length !== story.segments.length) {
    throw new Error(`captured ${captured.results.length} segments, expected ${story.segments.length}. Re-run capture (or use --only to capture missing ones).`);
  }

  const trims = durations.map((d) => d + tail);
  for (let i = 0; i < story.segments.length; i++) {
    const idx = String(i + 1).padStart(2, '0');
    const src = captured.results[i].path;
    const out = path.join(pics.seg, `seg_${idx}.mp4`);
    run(ffmpegBin(), [
      '-y', '-loglevel', 'error', '-i', src,
      '-t', trims[i].toFixed(4),
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`,
      '-r', String(fps), '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p',
      '-g', '50', '-keyint_min', '25', '-sc_threshold', '0', '-an',
      out,
    ]);
    console.log(`seg ${story.segments[i].id}: ${(trims[i]).toFixed(3)}s -> ${path.basename(out)}`);
  }

  const list = path.join(pics.seg, 'list.txt');
  fs.writeFileSync(list, story.segments.map((_, i) => `file '${path.join(pics.seg, `seg_${String(i + 1).padStart(2, '0')}.mp4`)}'`).join('\n') + '\n');

  const silent = path.join(pics.seg, 'final_silent.mp4');
  run(ffmpegBin(), ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
  console.log(`video concat total: ${probeDuration(silent).toFixed(3)}s`);

  const audioFiles = [];
  const metaArgs = [];
  let streamN = 0;
  for (const t of tracks) {
    const wavs = story.segments.map((_, i) => path.join(pics.nff, t.sub, `segment_${String(i + 1).padStart(2, '0')}.wav`));
    wavs.forEach((w, k) => {
      const narr = probeDuration(w);
      if (narr > trims[k] + 0.1) {
        throw new Error(`segment ${k + 1} ${t.code} narration (${narr.toFixed(2)}s) exceeds its video slot (${trims[k].toFixed(2)}s) — sync impossible`);
      }
    });
    const filter =
      wavs.map((_, k) => `[${k}:a]apad,atrim=duration=${trims[k].toFixed(4)}[s${k}];`).join('') +
      wavs.map((_, k) => `[s${k}]`).join('') +
      `concat=n=${wavs.length}:v=0:a=1[all]`;
    const base = path.join(pics.seg, `audio_${t.code}.wav`);
    run(ffmpegBin(), ['-y', '-loglevel', 'error', ...wavs.flatMap((w) => ['-i', w]), '-filter_complex', filter, '-map', '[all]', '-c:a', 'pcm_s16le', base]);
    audioFiles.push(base);
    console.log(`audio ${t.code} concat total: ${probeDuration(base).toFixed(3)}s`);
    metaArgs.push('-metadata:s:a:' + streamN, 'language=' + (LANG_2_TO_3[t.code.split('-')[0]] || t.code));
    streamN++;
  }

  const vd = probeDuration(silent);
  const final = path.join(pics.out, walkthrough ? 'walkthrough.mp4' : 'final_short.mp4');
  const fcm = audioFiles.map((_, k) => `[${k + 1}:a]apad[a${k}]`).join(';');
  run(ffmpegBin(), [
    '-y', '-loglevel', 'error', '-i', silent,
    ...audioFiles.flatMap((a) => ['-i', a]),
    '-filter_complex', fcm,
    '-map', '0:v',
    ...audioFiles.flatMap((_, k) => ['-map', `[a${k}]`]),
    ...metaArgs,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-t', vd.toFixed(4),
    final,
  ]);

  const fpsPath = ffprobeBin();
  const streams = execFileSync(fpsPath, ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height', '-of', 'csv=p=0', final], { encoding: 'utf8' }).trim().split('\n');
  const langs = execFileSync(fpsPath, ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream_tags=language', '-of', 'csv=p=0', final], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  console.log('\nFINAL:', final);
  console.log(`duration: ${probeDuration(final).toFixed(3)}s`);
  console.log(streams.join('\n'));
  console.log('audio languages:', langs.join(', ') || '(none)');
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});