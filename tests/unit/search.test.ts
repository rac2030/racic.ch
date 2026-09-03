import { describe, test, expect } from '@jest/globals';
import {
  fuzzyMatch,
  searchExact,
  searchFuzzy,
  search,
  escapeHtml,
  highlight,
  getExcerpt,
  sectionPriority,
  SearchItem,
} from '../../src/lib/search';

const testData: SearchItem[] = [
  {
    title: 'Building This Site with AI',
    description: 'An AI-generated blog post',
    tags: ['ai', 'astro'],
    url: '/blog/building-this-site-with-ai',
    section: 'Blog',
    body: 'This post was written entirely by an AI assistant.',
  },
  {
    title: 'MakeZurich 2018 Badge',
    description: 'IoT conference badge',
    tags: ['arduino', 'iot'],
    url: '/projects/makezurich-2018-badge',
    section: 'Projects',
    body: 'You received your MakeZurich participants badge.',
  },
  {
    title: 'Arduino',
    description: 'Various arduino links',
    tags: ['electronics'],
    url: '/bookmarks/arduino',
    section: 'Bookmarks',
    body: 'A collection of Arduino resources and links.',
  },
  {
    title: 'Sensirion SDP3x Arduino Driver',
    description: 'Arduino library for Sensirion sensor',
    tags: ['arduino', 'sensor'],
    url: '/projects/sensirion-sdp3x-driver',
    section: 'Projects',
    body: 'This Arduino library interfaces with the SDP3x sensor.',
  },
  {
    title: 'STM32',
    description: 'Using STM32 microcontroller',
    tags: ['embedded'],
    url: '/bookmarks/stm32',
    section: 'Bookmarks',
    body: 'Resources for working with STM32 microcontrollers.',
  },
];

describe('fuzzyMatch', () => {
  test('exact substring match returns high score', () => {
    const result = fuzzyMatch('arduino', 'arduino');
    expect(result.match).toBe(true);
    expect(result.score).toBe(100);
  });

  test('substring match returns score based on position', () => {
    const result = fuzzyMatch('ard', 'arduino');
    expect(result.match).toBe(true);
    expect(result.score).toBeGreaterThan(90);
  });

  test('character sequence match works', () => {
    const result = fuzzyMatch('ardno', 'arduino');
    expect(result.match).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  test('consecutive characters get bonus', () => {
    const consecutive = fuzzyMatch('ard', 'arduino');
    const scattered = fuzzyMatch('anio', 'arduino');
    expect(consecutive.score).toBeGreaterThan(scattered.score);
  });

  test('word boundary match gets bonus', () => {
    const atStart = fuzzyMatch('ard', 'arduino driver');
    const inMiddle = fuzzyMatch('rdu', 'arduino driver');
    expect(atStart.score).toBeGreaterThan(inMiddle.score);
  });

  test('non-matching returns false', () => {
    const result = fuzzyMatch('xyz', 'arduino');
    expect(result.match).toBe(false);
    expect(result.score).toBe(0);
  });

  test('case insensitive matching', () => {
    const result = fuzzyMatch('ARDUINO', 'arduino');
    expect(result.match).toBe(true);
  });
});

describe('searchExact', () => {
  test('finds items by title', () => {
    const results = searchExact(testData, ['arduino']);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.item.title === 'Arduino')).toBe(true);
  });

  test('finds items by description', () => {
    const results = searchExact(testData, ['conference']);
    expect(results.length).toBe(1);
    expect(results[0].item.title).toBe('MakeZurich 2018 Badge');
  });

  test('finds items by tags', () => {
    const results = searchExact(testData, ['sensor']);
    expect(results.length).toBe(1);
    expect(results[0].item.title).toBe('Sensirion SDP3x Arduino Driver');
  });

  test('finds items by body', () => {
    const results = searchExact(testData, ['microcontroller']);
    expect(results.length).toBe(1);
    expect(results[0].item.title).toBe('STM32');
  });

  test('multi-word AND matching', () => {
    const results = searchExact(testData, ['arduino', 'sensor']);
    expect(results.length).toBe(1);
    expect(results[0].item.title).toBe('Sensirion SDP3x Arduino Driver');
  });

  test('no match returns empty', () => {
    const results = searchExact(testData, ['zzzzz']);
    expect(results.length).toBe(0);
  });

  test('case insensitive', () => {
    const results = searchExact(testData, ['arduino']);
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('searchFuzzy', () => {
  test('finds fuzzy matches', () => {
    const results = searchFuzzy(testData, ['ardno']);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.item.title.includes('Arduino'))).toBe(true);
  });

  test('returns max 5 results', () => {
    const manyItems: SearchItem[] = Array.from({ length: 10 }, (_, i) => ({
      title: `Arduino Project ${i}`,
      description: 'Arduino project',
      tags: ['arduino'],
      url: `/projects/arduino-${i}`,
      section: 'Projects',
    }));
    const results = searchFuzzy(manyItems, ['arduino']);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  test('scores sorted by relevance', () => {
    const results = searchFuzzy(testData, ['makezurich']);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.title).toBe('MakeZurich 2018 Badge');
  });

  test('minimum score threshold filters noise', () => {
    const results = searchFuzzy(testData, ['zzzzz']);
    expect(results.length).toBe(0);
  });

  test('multi-word fuzzy matching', () => {
    const results = searchFuzzy(testData, ['ardno', 'drv']);
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('search', () => {
  test('returns exact and fuzzy results', () => {
    const result = search(testData, 'arduino');
    expect(result.exact.length).toBeGreaterThan(0);
  });

  test('fuzzy results deduplicated from exact', () => {
    const result = search(testData, 'arduino');
    const exactUrls = new Set(result.exact.map((r) => r.item.url));
    for (const f of result.fuzzy) {
      expect(exactUrls.has(f.item.url)).toBe(false);
    }
  });

  test('empty query returns empty', () => {
    const result = search(testData, '');
    expect(result.exact.length).toBe(0);
    expect(result.fuzzy.length).toBe(0);
  });

  test('empty data returns empty', () => {
    const result = search([], 'arduino');
    expect(result.exact.length).toBe(0);
    expect(result.fuzzy.length).toBe(0);
  });

  test('misspelled query returns fuzzy only', () => {
    const result = search(testData, 'ardno');
    expect(result.exact.length).toBe(0);
    expect(result.fuzzy.length).toBeGreaterThan(0);
  });

  test('mixed exact and fuzzy', () => {
    const result = search(testData, 'makezurich');
    expect(result.exact.length).toBeGreaterThan(0);
  });
});

describe('sectionPriority', () => {
  test('Blog has the highest priority', () => {
    expect(sectionPriority('Blog')).toBeGreaterThan(sectionPriority('Bookmarks'));
  });

  test('Bookmarks have the lowest priority', () => {
    expect(sectionPriority('Bookmarks')).toBe(1);
    const sections = ['Blog', 'Projects', 'Wiki', 'Page'];
    for (const s of sections) {
      expect(sectionPriority(s)).toBeGreaterThan(sectionPriority('Bookmarks'));
    }
  });

  test('unknown section falls back to lowest priority', () => {
    expect(sectionPriority('Unknown')).toBe(1);
  });
});

describe('bookmarks as lowest priority', () => {
  const mixedData: SearchItem[] = [
    {
      title: 'Arduino Bookmark',
      description: 'Arduino resources',
      tags: ['arduino'],
      url: '/bookmarks/arduino',
      section: 'Bookmarks',
      body: 'Links about arduino.',
    },
    {
      title: 'Arduino Blog Post',
      description: 'An arduino tutorial',
      tags: ['arduino'],
      url: '/blog/arduino-post',
      section: 'Blog',
      body: 'A detailed arduino tutorial.',
    },
    {
      title: 'Arduino Wiki',
      description: 'Reference for arduino',
      tags: ['arduino'],
      url: '/wiki/arduino',
      section: 'Wiki',
      body: 'Knowledge about arduino.',
    },
  ];

  test('exact results order bookmarks last', () => {
    const results = searchExact(mixedData, ['arduino']);
    expect(results.length).toBe(3);
    const last = results[results.length - 1];
    expect(last.item.section).toBe('Bookmarks');
    expect(results[0].item.section).toBe('Blog');
  });

  test('fuzzy results rank bookmarks below higher priority sections', () => {
    const results = searchFuzzy(mixedData, ['arduino']);
    expect(results.length).toBe(3);
    const sections = results.map((r) => r.item.section);
    expect(sections[0]).toBe('Blog');
    expect(sections.indexOf('Bookmarks')).toBe(sections.length - 1);
  });

  test('whole-search result keeps bookmarks at lowest priority', () => {
    const result = search(mixedData, 'arduino');
    const order = result.exact.map((r) => r.item.section);
    expect(order[order.length - 1]).toBe('Bookmarks');
  });
});

describe('escapeHtml', () => {
  test('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  test('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  test('escapes multiple characters', () => {
    expect(escapeHtml('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });

  test('plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('highlight', () => {
  test('wraps matching text in mark tags', () => {
    const result = highlight('Arduino driver', ['arduino']);
    expect(result).toBe('<mark>Arduino</mark> driver');
  });

  test('case insensitive highlighting', () => {
    const result = highlight('arduino driver', ['ARDUINO']);
    expect(result).toContain('<mark>arduino</mark>');
  });

  test('multiple words highlighted', () => {
    const result = highlight('Arduino Sensor', ['arduino', 'sensor']);
    expect(result).toContain('<mark>Arduino</mark>');
    expect(result).toContain('<mark>Sensor</mark>');
  });

  test('escapes HTML in text', () => {
    const result = highlight('<b>bold</b>', ['bold']);
    expect(result).toContain('&lt;b&gt;');
    expect(result).toContain('<mark>bold</mark>');
  });

  test('special regex characters escaped', () => {
    const result = highlight('price is $10.00', ['$10']);
    expect(result).toContain('<mark>$10</mark>');
  });
});

describe('getExcerpt', () => {
  test('extracts context around match', () => {
    const body = 'Lorem ipsum dolor sit amet. ' + 'word '.repeat(20) + 'Arduino programming here. ' + 'word '.repeat(20) + 'end.';
    const result = getExcerpt(body, ['programming']);
    expect(result).toContain('programming');
    expect(result).toContain('...');
  });

  test('returns empty for no match', () => {
    const result = getExcerpt('Hello world', ['xyz']);
    expect(result).toBe('');
  });

  test('returns empty for empty body', () => {
    const result = getExcerpt('', ['arduino']);
    expect(result).toBe('');
  });

  test('highlights match in excerpt', () => {
    const body = 'This is about Arduino sensors and more.';
    const result = getExcerpt(body, ['arduino']);
    expect(result).toContain('<mark>Arduino</mark>');
  });
});
