import { describe, test, expect, beforeAll } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let gitLogData: Record<string, any>;

beforeAll(() => {
  const jsonPath = join(process.cwd(), 'src', 'data', 'git-log.json');
  gitLogData = JSON.parse(readFileSync(jsonPath, 'utf-8'));
});

describe('git-log.json structure', () => {
  test('is a non-empty object', () => {
    expect(typeof gitLogData).toBe('object');
    expect(Object.keys(gitLogData).length).toBeGreaterThan(0);
  });

  test('keys use collection/slug format without .md extension', () => {
    for (const key of Object.keys(gitLogData)) {
      expect(key).not.toContain('.md');
      expect(key).toMatch(/^(blog|projects|wiki|bookmarks)\//);
    }
  });

  test('each entry has lastCommitDate and commits array', () => {
    for (const [key, entry] of Object.entries(gitLogData)) {
      expect(entry).toHaveProperty('lastCommitDate');
      expect(typeof entry.lastCommitDate).toBe('string');
      expect(entry).toHaveProperty('commits');
      expect(Array.isArray(entry.commits)).toBe(true);
      expect(entry.commits.length).toBeGreaterThan(0);
    }
  });

  test('each commit has hash, date, message, and url', () => {
    for (const [key, entry] of Object.entries(gitLogData)) {
      for (const commit of entry.commits) {
        expect(commit).toHaveProperty('hash');
        expect(typeof commit.hash).toBe('string');
        expect(commit.hash.length).toBeGreaterThan(0);
        expect(commit).toHaveProperty('date');
        expect(typeof commit.date).toBe('string');
        expect(commit).toHaveProperty('message');
        expect(typeof commit.message).toBe('string');
        expect(commit).toHaveProperty('url');
        expect(commit.url).toMatch(/^https:\/\/github\.com\//);
      }
    }
  });

  test('commit URLs point to rac2030/racic.ch repository', () => {
    for (const [key, entry] of Object.entries(gitLogData)) {
      for (const commit of entry.commits) {
        expect(commit.url).toContain('rac2030/racic.ch/commit/');
      }
    }
  });

  test('lastCommitDate matches first commit date', () => {
    for (const [key, entry] of Object.entries(gitLogData)) {
      expect(entry.lastCommitDate).toBe(entry.commits[0].date);
    }
  });
});

describe('git log slug lookup logic', () => {
  test('lookup by collection/slug matches expected entries', () => {
    const blogEntry = gitLogData['blog/hosting-hugo-site-firebase'];
    expect(blogEntry).toBeDefined();
    expect(blogEntry.commits.length).toBeGreaterThan(0);
  });

  test('lookup with wrong slug returns undefined', () => {
    const missing = gitLogData['blog/nonexistent-post'];
    expect(missing).toBeUndefined();
  });

  test('wiki entries are present', () => {
    const wikiKeys = Object.keys(gitLogData).filter(k => k.startsWith('wiki/'));
    expect(wikiKeys.length).toBeGreaterThan(0);
  });

  test('project entries are present', () => {
    const projectKeys = Object.keys(gitLogData).filter(k => k.startsWith('projects/'));
    expect(projectKeys.length).toBeGreaterThan(0);
  });

  test('bookmark entries are present', () => {
    const bookmarkKeys = Object.keys(gitLogData).filter(k => k.startsWith('bookmarks/'));
    expect(bookmarkKeys.length).toBeGreaterThan(0);
  });
});

describe('updated date fallback logic', () => {
  test('lastCommitDate is a valid ISO date string', () => {
    for (const [key, entry] of Object.entries(gitLogData)) {
      const date = new Date(entry.lastCommitDate);
      expect(date.toString()).not.toBe('Invalid Date');
    }
  });

  test('lastCommitDate is after year 2000', () => {
    for (const [key, entry] of Object.entries(gitLogData)) {
      const date = new Date(entry.lastCommitDate);
      expect(date.getFullYear()).toBeGreaterThanOrEqual(2024);
    }
  });

  test('effectiveUpdatedDate logic: git date used when no frontmatter updatedDate', () => {
    const pubDate = new Date('2017-03-05');
    const frontmatterUpdatedDate = undefined;
    const lastCommitDate = new Date(gitLogData['blog/hosting-hugo-site-firebase'].lastCommitDate);

    const effectiveUpdatedDate = frontmatterUpdatedDate || (lastCommitDate && lastCommitDate.getTime() !== pubDate.getTime() ? lastCommitDate : null);

    expect(effectiveUpdatedDate).toBeInstanceOf(Date);
    expect(effectiveUpdatedDate!.getTime()).toBe(lastCommitDate.getTime());
  });

  test('effectiveUpdatedDate logic: frontmatter updatedDate takes precedence', () => {
    const pubDate = new Date('2017-03-05');
    const frontmatterUpdatedDate = new Date('2026-08-25');
    const lastCommitDate = new Date(gitLogData['blog/hosting-hugo-site-firebase'].lastCommitDate);

    const effectiveUpdatedDate = frontmatterUpdatedDate || (lastCommitDate && lastCommitDate.getTime() !== pubDate.getTime() ? lastCommitDate : null);

    expect(effectiveUpdatedDate).toBeInstanceOf(Date);
    expect(effectiveUpdatedDate!.getTime()).toBe(frontmatterUpdatedDate.getTime());
  });

  test('effectiveUpdatedDate logic: null when git date equals pubDate and no frontmatter', () => {
    const pubDate = new Date(gitLogData['blog/hosting-hugo-site-firebase'].lastCommitDate);
    const frontmatterUpdatedDate = undefined;
    const lastCommitDate = pubDate;

    const effectiveUpdatedDate = frontmatterUpdatedDate || (lastCommitDate && lastCommitDate.getTime() !== pubDate.getTime() ? lastCommitDate : null);

    expect(effectiveUpdatedDate).toBeNull();
  });
});
