const { execSync } = require('child_process');
const { readdirSync, statSync, mkdirSync, writeFileSync } = require('fs');
const { join, relative } = require('path');

module.exports = function setup() {
  const REPO_URL = 'https://github.com/rac2030/racic.ch';
  const CONTENT_DIR = join(process.cwd(), 'src', 'content');
  const OUTPUT_DIR = join(process.cwd(), 'src', 'data');
  const OUTPUT_FILE = join(OUTPUT_DIR, 'git-log.json');

  if (require('fs').existsSync(OUTPUT_FILE)) return;

  function findMdFiles(dir) {
    const results = [];
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        results.push(...findMdFiles(fullPath));
      } else if (entry.endsWith('.md')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  function getGitLog(filePath) {
    const relPath = relative(process.cwd(), filePath);
    try {
      const raw = execSync(
        `git log --format="%H|%aI|%s" --follow -- "${relPath}"`,
        { encoding: 'utf-8', cwd: process.cwd() }
      ).trim();
      if (!raw) return [];
      return raw.split('\n').map((line) => {
        const [hash, date, ...messageParts] = line.split('|');
        return { hash, date, message: messageParts.join('|'), url: `${REPO_URL}/commit/${hash}` };
      });
    } catch {
      return [];
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const mdFiles = findMdFiles(CONTENT_DIR);
  const gitLog = {};
  for (const filePath of mdFiles) {
    const relPath = relative(CONTENT_DIR, filePath);
    const slugPath = relPath.replace(/\.md$/, '');
    const commits = getGitLog(filePath);
    if (commits.length > 0) {
      gitLog[slugPath] = { lastCommitDate: commits[0].date, commits };
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(gitLog, null, 2));
};
