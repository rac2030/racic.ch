#!/usr/bin/env node
// new-story.mjs <id> "Title" ["Description"] [--feature "Label"]
// Creates stories/<id>/ with a story.json manifest template + script.md,
// ready for the AI to fill in segments (narration + scenes) per the skill.
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.cwd();
const STORIES = path.join(REPO, 'stories');

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

function template(id, title, description, featureLabel, created) {
  return {
    schemaVersion: 1,
    id,
    title,
    description,
    feature: { label: featureLabel || title, page: '/', },
    created,
    status: 'draft',
    humanFeedback: '',
    voice: {
      engine: 'qwen_custom_voice',
      presetVoiceId: 'Ryan',
      modelSize: '0.6B',
      profileName: 'Narrator',
      language: 'en',
    },
    pacing: { speed: 1.15, silenceDb: -35, silenceStart: 0.08 },
    capture: {
      baseUrl: 'http://127.0.0.1:4322',
      videoSize: [1080, 1920],
      canvasId: '',
      frameCss: '',
    },
    assembly: { fps: 25, tailSeconds: 0.35 },
    segments: [],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find((a) => !a.startsWith('--'));
  const title = args.find((a) => !a.startsWith('--') && a !== idArg) || '';
  const desc = args.find((a) => !a.startsWith('--')) || '';
  const featureLabel = (args.find((a) => a.startsWith('--feature=')) || '').split('=')[1] || '';
  if (!idArg) throw new Error('usage: node new-story.mjs <id> "Title" ["Description"] [--feature "Label"]');

  const id = slugify(idArg);
  const dir = path.join(STORIES, id);
  if (fs.existsSync(dir)) throw new Error(`story "${id}" already exists at ${dir}`);

  fs.mkdirSync(path.join(dir, 'narration'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'narration_final'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'segments'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'output'), { recursive: true });

  const story = template(id, title || id, desc, featureLabel, new Date().toISOString().slice(0, 10));
  fs.writeFileSync(path.join(dir, 'story.json'), JSON.stringify(story, null, 2) + '\n');
  fs.writeFileSync(
    path.join(dir, 'script.md'),
    `# Story: ${story.title}\n` +
      `\n> ${story.description || ''}\n` +
      `\n| | |\n|---|---|\n` +
      `| id | \`${id}\` |\n` +
      `| feature | ${story.feature.label} |\n` +
      `| voice | ${story.voice.engine} / ${story.voice.presetVoiceId} @ ${story.voice.modelSize} |\n` +
      `| pacing | ${story.pacing.speed}x (+silence trim) |\n` +
      `| created | ${story.created} |\n` +
      `\n## Narration (approved)\n\n\n## Reuse\n\nThis narrative feeds both the Short and any longer walkthrough video.\n`
  );

  console.log(`Created story at ${dir}`);
  console.log('Next:');
  console.log(`  1. edit stories/${id}/story.json — set feature.page, capture.frameCss/canvasId, and fill segments[].text + segments[].scene.actions (see the youtube-short skill for the action DSL)`);
  console.log(`  2. approve the narration in stories/${id}/script.md`);
  console.log(`  3. npm run short:build -- ${id}`);
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});