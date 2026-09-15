#!/usr/bin/env node
// assemble.mjs <story>
// Trims each captured segment to its narration window (+ tail), concatenates
// the video segments, concatenates the paced narration, and muxes them into
// <story>/output/final_short.mp4. Uses -t (NOT -shortest with infinite apad).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveStory, loadStory, storyPaths, mkdirs, ffmpegBin, ffprobeBin, probeDuration, audioDurations } from './pipeline-util.mjs';

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

async function main() {
  const storyArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (!storyArg) throw new Error('usage: node assemble.mjs <story>');

  const dir = resolveStory(storyArg);
  const story = loadStory(dir);
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

  const wavs = story.segments.map((_, i) => path.join(pics.nff, `segment_${String(i + 1).padStart(2, '0')}.wav`));
  const filter = wavs.map((_, k) => `[${k}:a]`).join('') + `concat=n=${wavs.length}:v=0:a=1[all]`;
  const audioAll = path.join(pics.seg, 'audio_all.wav');
  run(ffmpegBin(), ['-y', '-loglevel', 'error', ...wavs.flatMap((w) => ['-i', w]), '-filter_complex', filter, '-map', '[all]', '-c:a', 'pcm_s16le', audioAll]);
  console.log(`audio concat total: ${probeDuration(audioAll).toFixed(3)}s`);

  const vd = probeDuration(silent);
  const final = path.join(pics.out, 'final_short.mp4');
  run(ffmpegBin(), [
    '-y', '-loglevel', 'error', '-i', silent, '-i', audioAll,
    '-filter_complex', '[1:a]apad[a]', '-map', '0:v', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', vd.toFixed(4),
    final,
  ]);

  const fpsPath = ffprobeBin();
  const streams = execFileSync(fpsPath, ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height', '-of', 'csv=p=0', final], { encoding: 'utf8' }).trim().split('\n');
  console.log('\nFINAL:', final);
  console.log(`duration: ${probeDuration(final).toFixed(3)}s`);
  console.log(streams.join('\n'));
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});