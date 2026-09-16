#!/usr/bin/env node
// new-story.mjs <id> "Title" ["Description"] [--feature "Label"] [--walkthrough]
// Creates stories/<id>/ with a story.json manifest template + script.md,
// ready for the AI to fill in segments (narration + scenes) per the skill.
// With --walkthrough: widescreen 1920x1080, multi-language tracks (en/de/fr/de-CH),
// longer per-segment budget, and a `languages` array instead of a single `voice`.
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.cwd();
const STORIES = path.join(REPO, 'stories');

const WALKTHROUGH_LANGUAGES = [
  { code: 'en', label: 'English', voice: { engine: 'qwen_custom_voice', presetVoiceId: 'Ryan', modelSize: '0.6B', profileName: 'Narrator EN', language: 'en' } },
  { code: 'de', label: 'Deutsch', voice: { engine: 'qwen_custom_voice', presetVoiceId: 'Ryan', modelSize: '0.6B', profileName: 'Narrator DE', language: 'de' } },
  { code: 'fr', label: 'Français', voice: { engine: 'qwen_custom_voice', presetVoiceId: 'Ryan', modelSize: '0.6B', profileName: 'Narrator FR', language: 'fr' } },
  { code: 'de-CH', label: 'Schwiizerdütsch', voice: { engine: 'qwen_custom_voice', presetVoiceId: 'Ryan', modelSize: '0.6B', profileName: 'Narrator DE-CH', language: 'de' } },
];

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

function template(id, title, description, featureLabel, created, walkthrough) {
  return {
    schemaVersion: 1,
    kind: walkthrough ? 'walkthrough' : 'short',
    id,
    title,
    description,
    feature: { label: featureLabel || title, page: '/', },
    created,
    status: 'draft',
    humanFeedback: '',
    voice: walkthrough
      ? null
      : {
          engine: 'qwen_custom_voice',
          presetVoiceId: 'Ryan',
          modelSize: '0.6B',
          profileName: 'Narrator',
          language: 'en',
        },
    languages: walkthrough ? WALKTHROUGH_LANGUAGES : [],
    pacing: { speed: 1.15, silenceDb: -35, silenceStart: 0.08 },
    capture: {
      baseUrl: 'http://127.0.0.1:4322',
      videoSize: walkthrough ? [1920, 1080] : [1080, 1920],
      canvasId: '',
      frameCss: '',
    },
    assembly: { fps: 25, tailSeconds: walkthrough ? 0.5 : 0.35 },
    coveredFeatures: [],
    segments: [],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find((a) => !a.startsWith('--'));
  const title = args.find((a) => !a.startsWith('--') && a !== idArg) || '';
  const desc = args.find((a) => !a.startsWith('--')) || '';
  const featureLabel = (args.find((a) => a.startsWith('--feature=')) || '').split('=')[1] || '';
  const walkthrough = args.includes('--walkthrough');
  if (!idArg) throw new Error('usage: node new-story.mjs <id> "Title" ["Description"] [--feature "Label"] [--walkthrough]');

  const id = slugify(idArg);
  const dir = path.join(STORIES, id);
  if (fs.existsSync(dir)) throw new Error(`story "${id}" already exists at ${dir}`);

  fs.mkdirSync(path.join(dir, 'narration'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'narration_final'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'segments'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'output'), { recursive: true });

  const story = template(id, title || id, desc, featureLabel, new Date().toISOString().slice(0, 10), walkthrough);
  fs.writeFileSync(path.join(dir, 'story.json'), JSON.stringify(story, null, 2) + '\n');
  fs.writeFileSync(
    path.join(dir, 'script.md'),
    `# Story: ${story.title}\n` +
      `\n> ${story.description || ''}\n` +
      `\n| | |\n|---|---|\n` +
      `| id | \`${id}\` |\n` +
      `| kind | ${story.kind} |\n` +
      `| feature | ${story.feature.label} |\n` +
      (walkthrough
        ? `| languages | ${story.languages.map((l) => l.code).join(', ')} |\n`
        : `| voice | ${story.voice.engine} / ${story.voice.presetVoiceId} @ ${story.voice.modelSize} |\n`) +
      `| pacing | ${story.pacing.speed}x (+silence trim) |\n` +
      `| created | ${story.created} |\n` +
      `\n## Narration (approved)\n\n` +
      (walkthrough
        ? `Write one paragraph per segment per language under a \`### Segment N\` heading:\n` +
          `- \`EN\` english, \`DE\` deutsch, \`FR\` français, \`DE-CH\` schwiizerdütsch (swiss-german dialect; uses the German voice).\n` +
          `- Keep every language roughly the same length (±10%) so captures line up.\n`
        : ``) +
      `\n## Reuse\n\nThis narrative feeds both the Short and any longer walkthrough video.\n` +
      (walkthrough
        ? `\n## Coverage\n\nKeep \`coveredFeatures\` in story.json in sync with the build log phases you've narrated. ` +
          `Run \`npm run walkthrough:scan\` to list build-log phases vs. covered features.\n`
        : ``)
  );
  console.log(`Created story at ${dir}`);
  if (walkthrough) {
    console.log('Walkthrough mode: widescreen 1920x1080, languages en,de,fr,de-CH, ~5min target.');
    console.log('Fill segments[].texts.{en,de,fr,de-CH} + scene actions, then `npm run walkthrough:build -- <id>`');
  } else {
    console.log('Next:');
    console.log(`  1. edit stories/${id}/story.json — set feature.page, capture.frameCss/canvasId, and fill segments[].text + segments[].scene.actions (see the youtube-short skill for the action DSL)`);
    console.log(`  2. approve the narration in stories/${id}/script.md`);
    console.log(`  3. npm run short:build -- ${id}`);
  }
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});