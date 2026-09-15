import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ffmpegBin } from './pipeline-util.mjs';

export const VOICEBOX_URL = process.env.VOICEBOX_URL || 'http://127.0.0.1:17493';

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function postJson(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${url} failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function ensureVoiceboxServer() {
  const ok = await fetch(`${VOICEBOX_URL}/health`).then((r) => r.ok).catch(() => false);
  if (ok) return true;
  throw new Error(
    `Voicebox not reachable at ${VOICEBOX_URL}. Start it (see the youtube-short skill, ` +
      `"Running the Voicebox server") or run the build-short step that auto-starts it when /tmp/voicebox exists.`
  );
}

export async function ensurePresetProfile(voice) {
  const { profileName, engine, presetVoiceId, language } = voice;
  const profiles = await getJson(`${VOICEBOX_URL}/profiles`);
  const existing = Array.isArray(profiles) ? profiles.find((p) => p.name === profileName) : null;
  if (existing) return existing.id;
  const created = await postJson(`${VOICEBOX_URL}/profiles`, {
    name: profileName,
    language: language || 'en',
    voice_type: 'preset',
    preset_engine: engine,
    preset_voice_id: presetVoiceId,
  });
  const id = typeof created === 'string' ? created : created?.id ?? created?.profile?.id;
  if (!id) throw new Error('profile created but no id returned: ' + JSON.stringify(created));
  return id;
}

export async function synthSegment(profileId, voice, text, { maxMs = 900000 } = {}) {
  const id = (await postJson(`${VOICEBOX_URL}/generate`, {
    profile_id: profileId,
    text,
    language: voice.language || 'en',
    engine: voice.engine,
    model_size: voice.modelSize,
  })).id;
  if (!id) throw new Error('generate returned no id');

  const start = Date.now();
  let status = 'pending';
  while (Date.now() - start < maxMs) {
    const r = await fetch(`${VOICEBOX_URL}/generate/${id}/status`);
    const lines = (await r.text()).split('\n').filter((l) => l.startsWith('data: '));
    const last = lines.length ? JSON.parse(lines[lines.length - 1].slice(6)) : { status: 'pending' };
    status = last.status;
    if (status === 'completed') break;
    if (status === 'failed') throw new Error(`generation ${id} failed: ${JSON.stringify(last)}`);
    await new Promise((res) => setTimeout(res, 3000));
  }
  if (status !== 'completed') throw new Error(`generation ${id} timeout (status ${status})`);

  const a = await fetch(`${VOICEBOX_URL}/audio/${id}`);
  if (!a.ok) throw new Error(`audio download ${id} failed: ${a.status}`);
  return Buffer.from(await a.arrayBuffer());
}

export function paceWav({ input, output, speed = 1.15, silenceDb = -35, silenceStart = 0.08 }) {
  execFileSync(
    ffmpegBin(),
    [
      '-y', '-loglevel', 'error',
      '-i', input,
      '-af',
      `silenceremove=start_periods=1:start_threshold=${silenceDb}dB:start_silence=${silenceStart},` +
        `areverse,silenceremove=start_periods=1:start_threshold=${silenceDb}dB:start_silence=${silenceStart},` +
        `areverse,atempo=${speed}`,
      '-c:a', 'pcm_s16le',
      output,
    ],
    { stdio: 'inherit' }
  );
}