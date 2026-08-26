import { describe, test, expect } from '@jest/globals';
import {
  stripMdExtension,
  formatDate,
  sortPostsByDate,
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
});
