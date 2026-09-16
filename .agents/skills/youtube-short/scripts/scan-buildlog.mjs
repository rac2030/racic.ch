#!/usr/bin/env node
// scan-buildlog.mjs [--story <id>]
// Scans the build-log blog post (src/content/blog/building-this-site-with-ai.md)
// for walkthrough-relevant items: Phase headings and the Feature table.
// With --story <id>, compares against the story's `coveredFeatures` array and
// lists anything NEW that a walkthrough regeneration should add segments for.
// This is the "auto-extends to new functionality" step of the walkthrough skill.
import fs from 'node:fs';
import path from 'node:path';

const BUILD_LOG = path.join(process.cwd(), 'src/content/blog/building-this-site-with-ai.md');

function parseBuildLog() {
  const lines = fs.readFileSync(BUILD_LOG, 'utf8').split('\n');
  const phases = [];
  const features = [];
  let inFeatureTable = false;
  for (const line of lines) {
    const ph = line.match(/^## (Phase \d+[^:]*):\s*(.+)$/);
    if (ph) {
      phases.push({ number: ph[1], title: ph[2].trim() });
      continue;
    }
    if (/^\|\s*(Feature|Tool)\s*\|/.test(line)) {
      inFeatureTable = /^\|\s*Feature\s*\|/.test(line);
      continue;
    }
    if (inFeatureTable && /^\| [^|]+\| [^|]+\|/.test(line) && !/^\| *-+ *\|/.test(line)) {
      const cells = line.split('|').map((c) => c.trim());
      if (cells.length >= 3 && cells[1]) features.push(cells[1]);
      continue;
    }
  }
  return { phases, features };
}

async function main() {
  const argv = process.argv.slice(2);
  const eq = argv.find((a) => a.startsWith('--story='));
  let storyId = '';
  if (eq) storyId = eq.split('=')[1];
  else {
    const i = argv.indexOf('--story');
    if (i !== -1) storyId = argv[i + 1] || '';
  }
  if (!fs.existsSync(BUILD_LOG)) {
    throw new Error(`build log not found at ${BUILD_LOG}`);
  }
  const { phases, features } = parseBuildLog();

  console.log(`Build log phases (${phases.length}):`);
  for (const p of phases) console.log(`  Phase ${p.number} — ${p.title}`);
  console.log(`\nBuild log features (${features.length}):`);
  for (const f of features) console.log(`  - ${f}`);

  if (storyId) {
    const storyDir = [storyId, path.join(process.cwd(), 'stories', storyId)].find((c) =>
      fs.existsSync(path.join(c, 'story.json'))
    );
    if (!storyDir) throw new Error(`story "${storyId}" not found`);
    const story = JSON.parse(fs.readFileSync(path.join(storyDir, 'story.json'), 'utf8'));
    const covered = new Set((story.coveredFeatures || []).map((c) => c.toLowerCase()));
    const newPhases = phases.filter((p) => !covered.has(`phase ${p.number}`.toLowerCase()) && !covered.has(p.title.toLowerCase()));
    const newFeatures = features.filter((f) => !covered.has(f.toLowerCase()));
    console.log(`\nCoverage for story "${story.id}" (${story.coveredFeatures ? story.coveredFeatures.length : 0} marked covered):`);
    if (!newPhases.length && !newFeatures.length) {
      console.log('  All build-log phases and features are already covered. Nothing to extend.');
    } else {
      console.log('  NEW / UNCOVERED — add walkthrough segments for these:');
      for (const p of newPhases) console.log(`    [phase] Phase ${p.number} — ${p.title}`);
      for (const f of newFeatures) console.log(`    [feature] ${f}`);
      console.log('\nAfter narrating them, add their labels to `coveredFeatures` in story.json so the next scan only reports truly new stuff.');
    }
  }
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});