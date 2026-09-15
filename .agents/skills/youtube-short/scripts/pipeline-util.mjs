import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const REPO_ROOT = process.cwd();

export function resolveStory(storyArg) {
  const candidates = [storyArg];
  if (!path.isAbsolute(storyArg)) {
    candidates.push(path.join(REPO_ROOT, storyArg), path.join(REPO_ROOT, 'stories', storyArg));
  }
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'story.json'))) return path.resolve(c);
  }
  throw new Error(
    `Cannot find story "${storyArg}" — looked for story.json under:\n  ${candidates.join('\n  ')}`
  );
}

export function loadStory(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'story.json'), 'utf8'));
}

export function storyPaths(dir) {
  return {
    raw: path.join(dir, 'narration'),
    nff: path.join(dir, 'narration_final'),
    seg: path.join(dir, 'segments'),
    out: path.join(dir, 'output'),
    durations: path.join(dir, 'durations.json'),
    captured: path.join(dir, 'segments', 'captured.json'),
  };
}

export function mkdirs(...dirs) {
  for (const d of dirs) fs.mkdirSync(d, { recursive: true });
}

export function hasBin(cmd) {
  try {
    execFileSync(cmd, ['-version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function ffmpegBin() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  if (hasBin('ffmpeg')) return 'ffmpeg';
  if (fs.existsSync('/tmp/shorts/bin/ffmpeg')) return '/tmp/shorts/bin/ffmpeg';
  throw new Error('ffmpeg not found. Set FFMPEG=/path/to/ffmpeg or install it (the DevContainer image ships it).');
}

export function ffprobeBin() {
  if (process.env.FFPROBE) return process.env.FFPROBE;
  if (hasBin('ffprobe')) return 'ffprobe';
  if (fs.existsSync('/tmp/shorts/bin/ffprobe')) return '/tmp/shorts/bin/ffprobe';
  throw new Error('ffprobe not found. Set FFPROBE=/path/to/ffprobe or install it.');
}

export function probeDuration(file) {
  return parseFloat(
    execFileSync(ffprobeBin(), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {
      encoding: 'utf8',
    }).trim()
  );
}

export function audioDurations(dir, story) {
  return story.segments.map((_, i) =>
    probeDuration(path.join(storyPaths(dir).nff, `segment_${String(i + 1).padStart(2, '0')}.wav`))
  );
}

export async function waitForHttp(url, { timeoutMs = 30000, intervalMs = 2000, label = url } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  return false;
}

export function startDetached(cmd, args, cwd) {
  const child = spawn(cmd, args, {
    cwd,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  });
  child.unref();
  return child.pid;
}

export function log(step, msg) {
  console.log(`[${step}] ${msg}`);
}