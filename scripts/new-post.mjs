#!/usr/bin/env node
// Scaffold a new draft content file for the racic.ch Astro site.
//
// Usage:
//   node scripts/new-post.mjs <blog|project|wiki|bookmark>
//
// Asks for the title (required), description (required), an optional
// category where the collection supports one, and an optional repository
// URL for projects. The publication date is filled in automatically and
// the article is created as a draft (draft: true) with an empty body.
//
// Works both interactively (TTY) and with piped input (one answer per line).

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const COLLECTIONS = ['blog', 'project', 'wiki', 'bookmark'];

const DIRS = {
  blog: 'src/content/blog',
  project: 'src/content/projects',
  wiki: 'src/content/wiki',
  bookmark: 'src/content/bookmarks',
};

const COLLECTION_NAME = {
  blog: 'blog',
  project: 'projects',
  wiki: 'wiki',
  bookmark: 'bookmarks',
};

const ALLOWS_CATEGORY = new Set(['blog', 'project', 'wiki']);
const IS_PROJECT = (c) => c === 'project';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function slugify(title) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'untitled';
}

function interactivelyAsk(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, (ans) => resolve(ans.trim())));
}

async function readPipedAnswers() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines = [];
  for await (const line of rl) lines.push(line);
  return lines.map((l) => l.trim()).filter((l) => l !== '');
}

async function main() {
  const collection = process.argv[2];
  if (!COLLECTIONS.includes(collection)) {
    console.error('Usage: node scripts/new-post.mjs <blog|project|wiki|bookmark>');
    process.exit(1);
  }

  const needsCategory = ALLOWS_CATEGORY.has(collection);
  const needsRepo = IS_PROJECT(collection);
  const isTTY = Boolean(process.stdin.isTTY);

  const answers = [];
  if (!isTTY) {
    answers.push(...(await readPipedAnswers()));
  }

  const expectedCount = (needsCategory ? 1 : 0) + (needsRepo ? 1 : 0) + 2;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  async function ask(prompt, required) {
    let answer;
    if (isTTY) {
      answer = await interactivelyAsk(rl, prompt);
    } else {
      if (answers.length === 0) {
        console.error(
          required
            ? `Aborted: expected ${expectedCount} piped answers (title, description${needsCategory ? ', category' : ''}${needsRepo ? ', repo' : ''}), got fewer.`
            : 'Aborted: not enough piped answers.'
        );
        rl.close();
        process.exit(1);
      }
      answer = answers.shift();
      process.stdout.write(`${prompt}${answer}\n`);
    }
    if (required && !answer) {
      console.error('Aborted: a title is required.');
      rl.close();
      process.exit(1);
    }
    return answer;
  }

  const title = await ask('Title: ', true);
  const description = await ask('Description: ', false);
  const category = needsCategory ? await ask('Category (optional): ', false) : '';
  const repo = needsRepo ? await ask('Repository URL (optional): ', false) : '';

  rl.close();

  const slug = slugify(title);
  const dir = DIRS[collection];
  const filePath = path.join(process.cwd(), dir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    console.error(`Aborted: "${filePath}" already exists.`);
    process.exit(1);
  }

  const fields = [
    `title: "${title.replace(/"/g, '\\"')}"`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `pubDate: ${todayLocal()}`,
  ];
  if (category) fields.push(`category: "${category.replace(/"/g, '\\"')}"`);
  if (repo) fields.push(`repo: "${repo.replace(/"/g, '\\"')}"`);
  fields.push('tags: []');
  fields.push('draft: true');

  const body = `---
${fields.join('\n')}
---

<!-- Start writing here -->
`;

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, body);

  console.log(`Created draft: ${filePath}`);
  console.log('Collection:', COLLECTION_NAME[collection]);
  console.log('Publication date:', todayLocal(), '(set automatically)');
  console.log('Status: draft (hidden from production builds until draft: false)');
  console.log('Next steps: edit the file, fill in the body, add tags, then set draft: false.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});