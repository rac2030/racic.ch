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
    if (result.success) {
      expect(result.data.title).toBe('Test Post');
      expect(result.data.description).toBe('');
      expect(result.data.draft).toBe(false);
      expect(result.data.aliases).toEqual([]);
      expect(result.data.pubDate).toBeInstanceOf(Date);
    }
  });

  test('rejects missing title', () => {
    const result = blogSchema.safeParse({ pubDate: '2017-01-01' });
    expect(result.success).toBe(false);
  });

  test('rejects missing pubDate', () => {
    const result = blogSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  test('coerces string date to Date', () => {
    const result = blogSchema.safeParse({
      title: 'Test',
      pubDate: '2017-03-05',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pubDate.getFullYear()).toBe(2017);
    }
  });

  test('applies defaults for optional fields', () => {
    const result = blogSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
      expect(result.data.tags).toEqual([]);
      expect(result.data.draft).toBe(false);
      expect(result.data.heroImage).toBeUndefined();
      expect(result.data.category).toBeUndefined();
      expect(result.data.aliases).toEqual([]);
      expect(result.data.updatedDate).toBeUndefined();
    }
  });

  test('accepts aliases array', () => {
    const result = blogSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
      aliases: ['old-url', 'another-old-url'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aliases).toEqual(['old-url', 'another-old-url']);
    }
  });

  test('accepts updatedDate', () => {
    const result = blogSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
      updatedDate: '2026-08-24',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedDate).toBeInstanceOf(Date);
    }
  });

  test('accepts category', () => {
    const result = blogSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
      category: 'howto',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe('howto');
    }
  });
});

describe('project schema', () => {
  test('accepts valid project frontmatter', () => {
    const data = {
      title: 'Spikey',
      pubDate: '2025-03-12',
      tags: ['arduino'],
      heroImage: '/images/spikey.png',
      repo: 'https://github.com/rac2030/spike',
    };
    const result = projectSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('accepts project without repo', () => {
    const result = projectSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.repo).toBeUndefined();
    }
  });

  test('rejects invalid repo URL', () => {
    const result = projectSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
      repo: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  test('accepts aliases array', () => {
    const result = projectSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
      aliases: ['legacy-project'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aliases).toEqual(['legacy-project']);
    }
  });

  test('accepts updatedDate', () => {
    const result = projectSchema.safeParse({
      title: 'Test',
      pubDate: '2017-01-01',
      updatedDate: '2026-08-24',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedDate).toBeInstanceOf(Date);
    }
  });
});

describe('wiki schema', () => {
  test('accepts valid wiki frontmatter', () => {
    const data = {
      title: 'Git',
      description: 'Git version control',
      tags: ['git', 'scm'],
    };
    const result = wikiSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('wiki allows missing pubDate', () => {
    const result = wikiSchema.safeParse({
      title: 'Test',
      tags: [],
    });
    expect(result.success).toBe(true);
  });

  test('accepts wiki with pubDate', () => {
    const result = wikiSchema.safeParse({
      title: 'Test',
      pubDate: '2007-12-31',
      tags: ['apache'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pubDate).toBeInstanceOf(Date);
    }
  });

  test('accepts aliases array', () => {
    const result = wikiSchema.safeParse({
      title: 'Test',
      aliases: ['old-wiki-url'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aliases).toEqual(['old-wiki-url']);
    }
  });

  test('accepts updatedDate', () => {
    const result = wikiSchema.safeParse({
      title: 'Test',
      updatedDate: '2026-08-24',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedDate).toBeInstanceOf(Date);
    }
  });
});

describe('bookmark schema', () => {
  test('accepts valid bookmark frontmatter', () => {
    const result = bookmarkSchema.safeParse({
      title: '360° Video',
      description: 'Video processing',
      tags: ['video'],
    });
    expect(result.success).toBe(true);
  });

  test('accepts aliases array', () => {
    const result = bookmarkSchema.safeParse({
      title: 'Test',
      aliases: ['old-bookmark'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aliases).toEqual(['old-bookmark']);
    }
  });

  test('accepts heroImage', () => {
    const result = bookmarkSchema.safeParse({
      title: 'Test',
      heroImage: '/images/test.jpg',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.heroImage).toBe('/images/test.jpg');
    }
  });

  test('accepts updatedDate', () => {
    const result = bookmarkSchema.safeParse({
      title: 'Test',
      updatedDate: '2026-08-24',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedDate).toBeInstanceOf(Date);
    }
  });
});

describe('aliases routing logic', () => {
  test('generates slug and alias params from frontmatter', () => {
    const entries = [
      { id: 'my-post.md', data: { aliases: ['old-url'] } },
      { id: 'other-post.md', data: { aliases: [] } },
    ];

    const routes = entries.flatMap((entry) => {
      const slug = entry.id.replace(/\.md$/, '');
      const aliases = (entry.data.aliases || [])
        .filter((alias) => !alias.startsWith('/'))
        .map((alias) => ({ params: { slug: alias } }));
      return [{ params: { slug } }, ...aliases];
    });

    expect(routes).toEqual([
      { params: { slug: 'my-post' } },
      { params: { slug: 'old-url' } },
      { params: { slug: 'other-post' } },
    ]);
  });

  test('handles multiple relative aliases per entry', () => {
    const entry = { id: 'post.md', data: { aliases: ['a', 'b', 'c'] } };
    const slug = entry.id.replace(/\.md$/, '');
    const aliases = entry.data.aliases
      .filter((alias) => !alias.startsWith('/'))
      .map((alias) => ({ params: { slug: alias } }));
    const routes = [{ params: { slug } }, ...aliases];

    expect(routes).toHaveLength(4);
    expect(routes.map((r) => r.params.slug)).toEqual(['post', 'a', 'b', 'c']);
  });

  test('empty aliases produces only original slug', () => {
    const entry = { id: 'post.md', data: { aliases: [] } };
    const slug = entry.id.replace(/\.md$/, '');
    const aliases = entry.data.aliases
      .filter((alias) => !alias.startsWith('/'))
      .map((alias) => ({ params: { slug: alias } }));
    const routes = [{ params: { slug } }, ...aliases];

    expect(routes).toHaveLength(1);
    expect(routes[0].params.slug).toBe('post');
  });

  test('absolute aliases are filtered out of section routes', () => {
    const entry = { id: 'git.md', data: { aliases: ['/post/dev/git', 'wiki/Git'] } };
    const slug = entry.id.replace(/\.md$/, '');
    const aliases = entry.data.aliases
      .filter((alias) => !alias.startsWith('/'))
      .map((alias) => ({ params: { slug: alias } }));
    const routes = [{ params: { slug } }, ...aliases];

    expect(routes).toHaveLength(2);
    expect(routes.map((r) => r.params.slug)).toEqual(['git', 'wiki/Git']);
  });

  test('absolute alias generates root catch-all param as string', () => {
    const alias = '/post/dev/git';
    const slugStr = alias.replace(/^\/+|\/+$/g, '');
    expect(slugStr).toBe('post/dev/git');
    expect(typeof slugStr).toBe('string');
  });
});
