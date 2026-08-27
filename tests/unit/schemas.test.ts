import { describe, test, expect } from '@jest/globals';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
  aliases: z.array(z.string()).default([]),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  heroImage: z.string().optional(),
  repo: z.string().url().optional(),
  draft: z.boolean().default(false),
  aliases: z.array(z.string()).default([]),
});

const wikiSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  pubDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
  aliases: z.array(z.string()).default([]),
});

const bookmarkSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  pubDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
  aliases: z.array(z.string()).default([]),
});

describe('blog schema', () => {
  test('accepts valid blog frontmatter', () => {
    const data = {
      title: 'Test Post',
      pubDate: '2017-03-05',
      tags: ['hugo', 'firebase'],
    };
    const result = blogSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('rejects missing title', () => {
    const result = blogSchema.safeParse({ pubDate: '2017-03-05' });
    expect(result.success).toBe(false);
  });

  test('rejects missing pubDate', () => {
    const result = blogSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  test('coerces string date to Date object', () => {
    const result = blogSchema.parse({ title: 'T', pubDate: '2020-01-15' });
    expect(result.pubDate).toBeInstanceOf(Date);
  });

  test('applies defaults for optional fields', () => {
    const result = blogSchema.parse({ title: 'T', pubDate: '2020-01-01' });
    expect(result.description).toBe('');
    expect(result.tags).toEqual([]);
    expect(result.draft).toBe(false);
    expect(result.aliases).toEqual([]);
  });

  test('accepts aliases array', () => {
    const result = blogSchema.parse({
      title: 'T',
      pubDate: '2020-01-01',
      aliases: ['old-url'],
    });
    expect(result.aliases).toEqual(['old-url']);
  });

  test('accepts updatedDate', () => {
    const result = blogSchema.parse({
      title: 'T',
      pubDate: '2020-01-01',
      updatedDate: '2020-06-15',
    });
    expect(result.updatedDate).toBeInstanceOf(Date);
  });

  test('accepts category', () => {
    const result = blogSchema.parse({
      title: 'T',
      pubDate: '2020-01-01',
      category: 'tutorial',
    });
    expect(result.category).toBe('tutorial');
  });
});

describe('project schema', () => {
  test('accepts valid project frontmatter', () => {
    const result = projectSchema.safeParse({
      title: 'Spikey',
      pubDate: '2019-06-01',
    });
    expect(result.success).toBe(true);
  });

  test('repo is optional', () => {
    const result = projectSchema.parse({ title: 'T', pubDate: '2020-01-01' });
    expect(result.repo).toBeUndefined();
  });

  test('accepts valid repo URL', () => {
    const result = projectSchema.parse({
      title: 'T',
      pubDate: '2020-01-01',
      repo: 'https://github.com/user/repo',
    });
    expect(result.repo).toBe('https://github.com/user/repo');
  });

  test('rejects invalid repo URL', () => {
    const result = projectSchema.safeParse({
      title: 'T',
      pubDate: '2020-01-01',
      repo: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  test('accepts aliases', () => {
    const result = projectSchema.parse({
      title: 'T',
      pubDate: '2020-01-01',
      aliases: ['/old/project'],
    });
    expect(result.aliases).toEqual(['/old/project']);
  });

  test('accepts updatedDate', () => {
    const result = projectSchema.parse({
      title: 'T',
      pubDate: '2020-01-01',
      updatedDate: '2021-03-10',
    });
    expect(result.updatedDate).toBeInstanceOf(Date);
  });
});

describe('wiki schema', () => {
  test('accepts valid wiki frontmatter', () => {
    const result = wikiSchema.safeParse({ title: 'Git' });
    expect(result.success).toBe(true);
  });

  test('pubDate is optional', () => {
    const result = wikiSchema.parse({ title: 'T' });
    expect(result.pubDate).toBeUndefined();
  });

  test('accepts pubDate when present', () => {
    const result = wikiSchema.parse({ title: 'T', pubDate: '2020-01-01' });
    expect(result.pubDate).toBeInstanceOf(Date);
  });

  test('accepts aliases', () => {
    const result = wikiSchema.parse({ title: 'T', aliases: ['/wiki/Git'] });
    expect(result.aliases).toEqual(['/wiki/Git']);
  });

  test('accepts updatedDate', () => {
    const result = wikiSchema.parse({ title: 'T', updatedDate: '2021-06-01' });
    expect(result.updatedDate).toBeInstanceOf(Date);
  });

  test('applies defaults', () => {
    const result = wikiSchema.parse({ title: 'T' });
    expect(result.description).toBe('');
    expect(result.tags).toEqual([]);
    expect(result.draft).toBe(false);
  });
});

describe('bookmark schema', () => {
  test('accepts valid bookmark frontmatter', () => {
    const result = bookmarkSchema.safeParse({ title: 'Arduino' });
    expect(result.success).toBe(true);
  });

  test('rejects missing title', () => {
    const result = bookmarkSchema.safeParse({ description: 'desc' });
    expect(result.success).toBe(false);
  });

  test('pubDate is optional', () => {
    const result = bookmarkSchema.parse({ title: 'T' });
    expect(result.pubDate).toBeUndefined();
  });

  test('accepts aliases', () => {
    const result = bookmarkSchema.parse({ title: 'T', aliases: ['/old'] });
    expect(result.aliases).toEqual(['/old']);
  });

  test('accepts heroImage', () => {
    const result = bookmarkSchema.parse({
      title: 'T',
      heroImage: '/images/test.svg',
    });
    expect(result.heroImage).toBe('/images/test.svg');
  });

  test('accepts updatedDate', () => {
    const result = bookmarkSchema.parse({ title: 'T', updatedDate: '2021-01-01' });
    expect(result.updatedDate).toBeInstanceOf(Date);
  });
});

describe('aliases routing logic', () => {
  test('generates slug from filename', () => {
    const id = 'my-post.md';
    const slug = id.replace(/\.md$/, '');
    expect(slug).toBe('my-post');
  });

  test('handles multiple aliases', () => {
    const aliases = ['old-url', 'another-url'];
    const routes = aliases
      .filter((a) => !a.startsWith('/'))
      .map((a) => ({ params: { slug: a } }));
    expect(routes).toHaveLength(2);
    expect(routes[0].params.slug).toBe('old-url');
  });

  test('filters out absolute aliases', () => {
    const aliases = ['/absolute-path', 'relative-path'];
    const relative = aliases.filter((a) => !a.startsWith('/'));
    expect(relative).toEqual(['relative-path']);
  });

  test('absolute aliases start with /', () => {
    expect('/path'.startsWith('/')).toBe(true);
    expect('path'.startsWith('/')).toBe(false);
  });

  test('empty aliases produces empty routes', () => {
    const aliases: string[] = [];
    const routes = aliases
      .filter((a) => !a.startsWith('/'))
      .map((a) => ({ params: { slug: a } }));
    expect(routes).toHaveLength(0);
  });
});
