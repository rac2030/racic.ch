import { describe, test, expect } from '@jest/globals';
import {
  buildTimelineEvents,
  expandGitCommits,
  isTimelineExcluded,
  shortCommitHash,
  timelineKey,
  type GitLog,
  type TimelineSourceItem,
} from '../../src/lib/timeline';

const baseItem: TimelineSourceItem = {
  section: 'Blog',
  id: 'my-post.md',
  title: 'My Post',
  description: 'A description',
  url: '/blog/my-post',
  pubDate: new Date('2020-01-01'),
};

const gitLog: GitLog = {
  'blog/my-post': {
    lastCommitDate: '2026-09-04T10:00:00.000Z',
    commits: [
      { hash: '1111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', date: '2026-09-04T10:00:00.000Z', message: 'feat: third change', url: 'https://github.com/rac2030/racic.ch/commit/111' },
      { hash: '2222222bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', date: '2026-08-01T10:00:00.000Z', message: 'fix: second change', url: 'https://github.com/rac2030/racic.ch/commit/222' },
      { hash: '3333333ccccccccccccccccccccccccccccccccccccccc', date: '2020-01-01T10:00:00.000Z', message: 'feat: initial post', url: 'https://github.com/rac2030/racic.ch/commit/333' },
    ],
  },
};

describe('timelineKey', () => {
  test('builds collection/slug key without .md extension', () => {
    expect(timelineKey('blog', 'my-post.md')).toBe('blog/my-post');
    expect(timelineKey('wiki', 'git.md')).toBe('wiki/git');
  });
});

describe('isTimelineExcluded', () => {
  test('flags the continuously-updated build log post', () => {
    expect(isTimelineExcluded('blog/building-this-site-with-ai')).toBe(true);
  });

  test('does not flag other keys', () => {
    expect(isTimelineExcluded('blog/my-post')).toBe(false);
    expect(isTimelineExcluded('projects/foo')).toBe(false);
  });
});

describe('expandGitCommits', () => {
  test('creates one event per commit with metadata', () => {
    const events = expandGitCommits(baseItem, gitLog);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({
      title: 'My Post',
      url: '/blog/my-post',
      section: 'Blog',
      commitMessage: 'feat: third change',
      hasGitHistory: true,
    });
    expect(events[0].commitHash).toBe('1111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(events[1].commitMessage).toBe('fix: second change');
    expect(events[2].commitMessage).toBe('feat: initial post');
  });

  test('falls back to a single event when no git history exists', () => {
    const events = expandGitCommits(baseItem, {});
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      hasGitHistory: false,
      commitMessage: '',
      commitUrl: '',
      commitHash: '',
      date: baseItem.pubDate,
    });
  });

  test('handles a git entry with empty commits array', () => {
    const events = expandGitCommits(baseItem, { 'blog/my-post': { lastCommitDate: '', commits: [] } });
    expect(events).toHaveLength(1);
    expect(events[0].hasGitHistory).toBe(false);
  });

  test('returns zero events for excluded items', () => {
    const item: TimelineSourceItem = { ...baseItem, id: 'building-this-site-with-ai.md' };
    expect(expandGitCommits(item, gitLog)).toEqual([]);
  });
});

describe('buildTimelineEvents', () => {
  test('flattens and sorts all commits newest-first', () => {
    const other: TimelineSourceItem = {
      section: 'Projects',
      id: 'other.md',
      title: 'Other',
      description: '',
      url: '/projects/other',
      pubDate: new Date('2019-01-01'),
    };
    const log: GitLog = {
      ...gitLog,
      'projects/other': {
        lastCommitDate: '2026-09-10T10:00:00.000Z',
        commits: [
          { hash: 'aaaa', date: '2026-09-10T10:00:00.000Z', message: 'feat: newest', url: 'https://github.com/rac2030/racic.ch/commit/aaaa' },
        ],
      },
    };
    const events = buildTimelineEvents([baseItem, other], log);
    expect(events).toHaveLength(4);
    expect(events[0].commitMessage).toBe('feat: newest');
    expect(events[1].commitMessage).toBe('feat: third change');
    expect(events[2].commitMessage).toBe('fix: second change');
    expect(events[3].commitMessage).toBe('feat: initial post');
  });

  test('excludes the build-log post entirely', () => {
    const buildLogItem: TimelineSourceItem = {
      ...baseItem,
      id: 'building-this-site-with-ai.md',
      title: 'Building this site with AI',
    };
    const events = buildTimelineEvents([baseItem, buildLogItem], gitLog);
    expect(events).toHaveLength(3);
    expect(events.every((e) => e.title !== 'Building this site with AI')).toBe(true);
  });

  test('returns empty array for empty input', () => {
    expect(buildTimelineEvents([], gitLog)).toEqual([]);
  });

  test('falls back to pubDate event for articles without git history', () => {
    const noGit: TimelineSourceItem = {
      section: 'Wiki',
      id: 'plain.md',
      title: 'Plain',
      description: '',
      url: '/wiki/plain',
      pubDate: new Date('2025-06-01'),
    };
    const events = buildTimelineEvents([noGit], {});
    expect(events).toHaveLength(1);
    expect(events[0].date.getFullYear()).toBe(2025);
    expect(events[0].hasGitHistory).toBe(false);
  });
});

describe('shortCommitHash', () => {
  test('returns first 7 characters', () => {
    expect(shortCommitHash('1234567890abcdef')).toBe('1234567');
  });

  test('returns empty string for undefined', () => {
    expect(shortCommitHash(undefined)).toBe('');
  });
});