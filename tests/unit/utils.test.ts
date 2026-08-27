import { describe, test, expect } from '@jest/globals';
import {
  stripMdExtension,
  formatDate,
  sortPostsByDate,
  sortProjectsByDate,
  sortWikiByTitle,
  buildBlogUrl,
  buildProjectUrl,
  buildWikiUrl,
  buildTagUrl,
  filterDrafts,
  extractAllTags,
} from '../../src/lib/utils';

describe('stripMdExtension', () => {
  test('removes .md extension', () => {
    expect(stripMdExtension('my-post.md')).toBe('my-post');
  });

  test('handles nested paths', () => {
    expect(stripMdExtension('blog/my-post.md')).toBe('blog/my-post');
  });

  test('returns unchanged string without .md', () => {
    expect(stripMdExtension('no-extension')).toBe('no-extension');
  });

  test('handles empty string', () => {
    expect(stripMdExtension('')).toBe('');
  });
});

describe('formatDate', () => {
  test('formats date correctly', () => {
    const date = new Date('2017-03-05T00:00:00.000Z');
    const result = formatDate(date);
    expect(result).toMatch(/Mar 5, 2017/);
  });

  test('formats another date correctly', () => {
    const date = new Date('2025-12-25T00:00:00.000Z');
    const result = formatDate(date);
    expect(result).toMatch(/Dec 25, 2025/);
  });
});

describe('sortPostsByDate', () => {
  test('sorts by pubDate descending', () => {
    const posts = [
      { data: { pubDate: new Date('2017-02-01') } },
      { data: { pubDate: new Date('2017-03-05') } },
      { data: { pubDate: new Date('2017-01-01') } },
    ];
    const sorted = sortPostsByDate(posts);
    expect(sorted[0].data.pubDate.getFullYear()).toBe(2017);
    expect(sorted[0].data.pubDate.getMonth()).toBe(2); // March
    expect(sorted[2].data.pubDate.getMonth()).toBe(0); // January
  });

  test('does not mutate original array', () => {
    const posts = [
      { data: { pubDate: new Date('2017-01-01') } },
      { data: { pubDate: new Date('2017-03-05') } },
    ];
    const original = [...posts];
    sortPostsByDate(posts);
    expect(posts[0].data.pubDate).toEqual(original[0].data.pubDate);
  });

  test('returns empty array for empty input', () => {
    expect(sortPostsByDate([])).toEqual([]);
  });

  test('handles single item', () => {
    const posts = [{ data: { pubDate: new Date('2017-01-01') } }];
    expect(sortPostsByDate(posts)).toHaveLength(1);
  });
});

describe('sortProjectsByDate', () => {
  test('sorts by pubDate descending', () => {
    const projects = [
      { data: { pubDate: new Date('2018-01-01') } },
      { data: { pubDate: new Date('2020-06-15') } },
      { data: { pubDate: new Date('2019-03-10') } },
    ];
    const sorted = sortProjectsByDate(projects);
    expect(sorted[0].data.pubDate.getFullYear()).toBe(2020);
    expect(sorted[1].data.pubDate.getFullYear()).toBe(2019);
    expect(sorted[2].data.pubDate.getFullYear()).toBe(2018);
  });

  test('does not mutate original array', () => {
    const projects = [
      { data: { pubDate: new Date('2018-01-01') } },
      { data: { pubDate: new Date('2020-06-15') } },
    ];
    const original = [...projects];
    sortProjectsByDate(projects);
    expect(projects[0].data.pubDate).toEqual(original[0].data.pubDate);
  });

  test('returns empty array for empty input', () => {
    expect(sortProjectsByDate([])).toEqual([]);
  });

  test('handles single item', () => {
    const projects = [{ data: { pubDate: new Date('2019-01-01') } }];
    expect(sortProjectsByDate(projects)).toHaveLength(1);
  });
});

describe('sortWikiByTitle', () => {
  test('sorts alphabetically by title', () => {
    const entries = [
      { data: { title: 'Git' } },
      { data: { title: 'Apache' } },
      { data: { title: 'Zebra' } },
    ];
    const sorted = sortWikiByTitle(entries);
    expect(sorted[0].data.title).toBe('Apache');
    expect(sorted[1].data.title).toBe('Git');
    expect(sorted[2].data.title).toBe('Zebra');
  });

  test('returns empty array for empty input', () => {
    expect(sortWikiByTitle([])).toEqual([]);
  });

  test('handles single item', () => {
    const entries = [{ data: { title: 'Only' } }];
    expect(sortWikiByTitle(entries)).toHaveLength(1);
  });

  test('is case-insensitive', () => {
    const entries = [
      { data: { title: 'banana' } },
      { data: { title: 'Apple' } },
    ];
    const sorted = sortWikiByTitle(entries);
    expect(sorted[0].data.title).toBe('Apple');
    expect(sorted[1].data.title).toBe('banana');
  });
});

describe('URL builders', () => {
  test('buildBlogUrl strips .md and prepends /blog/', () => {
    expect(buildBlogUrl('my-post.md')).toBe('/blog/my-post');
  });

  test('buildProjectUrl strips .md and prepends /projects/', () => {
    expect(buildProjectUrl('spikey.md')).toBe('/projects/spikey');
  });

  test('buildWikiUrl strips .md and prepends /wiki/', () => {
    expect(buildWikiUrl('git.md')).toBe('/wiki/git');
  });

  test('buildTagUrl prepends /tags/', () => {
    expect(buildTagUrl('hugo')).toBe('/tags/hugo');
  });

  test('buildBlogUrl handles nested path', () => {
    expect(buildBlogUrl('blog/my-post.md')).toBe('/blog/blog/my-post');
  });
});

describe('filterDrafts', () => {
  test('removes draft posts', () => {
    const posts = [
      { data: { draft: false } },
      { data: { draft: true } },
      { data: { draft: false } },
    ];
    expect(filterDrafts(posts)).toHaveLength(2);
  });

  test('keeps posts without draft field', () => {
    const posts = [{ data: {} }, { data: { draft: false } }];
    expect(filterDrafts(posts)).toHaveLength(2);
  });

  test('returns empty array when all are drafts', () => {
    const posts = [
      { data: { draft: true } },
      { data: { draft: true } },
    ];
    expect(filterDrafts(posts)).toHaveLength(0);
  });

  test('returns empty array for empty input', () => {
    expect(filterDrafts([])).toHaveLength(0);
  });

  test('keeps all when none are drafts', () => {
    const posts = [
      { data: { draft: false } },
      { data: { draft: false } },
    ];
    expect(filterDrafts(posts)).toHaveLength(2);
  });
});

describe('extractAllTags', () => {
  test('extracts unique tags from items', () => {
    const items = [
      { data: { tags: ['hugo', 'firebase'] } },
      { data: { tags: ['hugo', 'hosting'] } },
    ];
    const tags = extractAllTags(items);
    expect(tags).toEqual(['firebase', 'hosting', 'hugo']);
  });

  test('returns empty array for no tags', () => {
    expect(extractAllTags([{ data: { tags: [] } }])).toEqual([]);
  });

  test('handles items with no tags gracefully', () => {
    const items = [{ data: { tags: [] } }, { data: { tags: ['a'] } }];
    expect(extractAllTags(items)).toEqual(['a']);
  });

  test('returns empty array for empty input', () => {
    expect(extractAllTags([])).toEqual([]);
  });

  test('deduplicates tags across items', () => {
    const items = [
      { data: { tags: ['a', 'b'] } },
      { data: { tags: ['b', 'c'] } },
      { data: { tags: ['a', 'c'] } },
    ];
    expect(extractAllTags(items)).toEqual(['a', 'b', 'c']);
  });
});
