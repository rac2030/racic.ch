// Shared search module — used by SearchBar.astro, search.astro and 404.astro

export interface SearchItem {
  title: string;
  description: string;
  tags: string[];
  url: string;
  section: string;
  body?: string;
}

export interface FuzzyMatchResult {
  match: boolean;
  score: number;
}

export interface ExactResult {
  item: SearchItem;
  score: number;
  bodyMatch: boolean;
}

export interface FuzzyResult {
  item: SearchItem;
  score: number;
}

export interface SearchResult {
  exact: ExactResult[];
  fuzzy: FuzzyResult[];
}

// Higher = higher priority in result ordering. Bookmarks are lowest priority.
export const SECTION_PRIORITY: Record<string, number> = {
  Blog: 5,
  Projects: 4,
  Wiki: 3,
  Page: 2,
  Bookmarks: 1,
};

export function sectionPriority(section: string): number {
  return SECTION_PRIORITY[section] ?? 1;
}

// Score multiplier per section so low-priority sections (Bookmarks) rank last.
const SECTION_WEIGHT: Record<string, number> = {
  Blog: 1,
  Projects: 0.9,
  Wiki: 0.8,
  Page: 0.7,
  Bookmarks: 0.5,
};

function sectionWeight(section: string): number {
  return SECTION_WEIGHT[section] ?? 1;
}

export function fuzzyMatch(query: string, text: string): FuzzyMatchResult {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx !== -1) return { match: true, score: 100 - idx };

  let qi = 0;
  let score = 0;
  let lastIdx = -1;
  let consecutive = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (lastIdx === ti - 1) {
        consecutive++;
        score += consecutive * 5;
      } else {
        consecutive = 0;
        score += 1;
      }
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '_') {
        score += 3;
      }
      lastIdx = ti;
      qi++;
    }
  }

  if (qi === q.length) {
    return { match: true, score: Math.max(1, score - Math.floor(t.length / 50)) };
  }
  return { match: false, score: 0 };
}

export function searchExact(data: SearchItem[], terms: string[]): ExactResult[] {
  return data
    .filter((item) => {
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const tagsLower = item.tags.join(' ').toLowerCase();
      const haystack = `${titleLower} ${descLower} ${tagsLower}`;
      const bodyHaystack = (item.body || '').toLowerCase();
      return terms.every(
        (t) => haystack.indexOf(t) !== -1 || bodyHaystack.indexOf(t) !== -1,
      );
    })
    .map((item) => ({ item, score: 0, bodyMatch: false }))
    .sort((a, b) => sectionPriority(b.item.section) - sectionPriority(a.item.section));
}

export function searchFuzzy(data: SearchItem[], terms: string[]): FuzzyResult[] {
  let results: FuzzyResult[] = [];
  for (const item of data) {
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const tagsLower = item.tags.join(' ').toLowerCase();
    let bestScore = 0;
    let matched = true;

    for (const word of terms) {
      const titleMatch = fuzzyMatch(word, titleLower);
      const descMatch = fuzzyMatch(word, descLower);
      const tagMatch = fuzzyMatch(word, tagsLower);
      const wordScore = Math.max(
        titleMatch.score * 3,
        descMatch.score,
        tagMatch.score * 2,
      );
      if (titleMatch.match || descMatch.match || tagMatch.match) {
        bestScore += wordScore;
      } else {
        bestScore = 0;
        matched = false;
        break;
      }
    }

    if (matched && bestScore >= 3) {
      results.push({ item, score: bestScore });
    }
  }
  results = results
    .map((r) => ({ ...r, score: Math.round(r.score * sectionWeight(r.item.section)) }))
    .sort((a, b) => {
      const diff = b.score - a.score;
      if (diff !== 0) return diff;
      return sectionPriority(b.item.section) - sectionPriority(a.item.section);
    });
  return results.slice(0, 5);
}

export function search(data: SearchItem[], query: string): SearchResult {
  if (!data || !query) return { exact: [], fuzzy: [] };
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const exact = searchExact(data, terms);
  const allFuzzy = searchFuzzy(data, terms);
  const exactUrls = new Set(exact.map((r) => r.item.url));
  const fuzzy = allFuzzy.filter((r) => !exactUrls.has(r.item.url));
  return { exact, fuzzy };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function highlight(text: string, words: string[]): string {
  let result = escapeHtml(text);
  for (const w of words) {
    const re = new RegExp(
      `(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi',
    );
    result = result.replace(re, '<mark>$1</mark>');
  }
  return result;
}

export function getExcerpt(body: string, words: string[]): string {
  if (!body) return '';
  const lower = body.toLowerCase();
  let bestIdx = -1;
  for (const w of words) {
    const idx = lower.indexOf(w);
    if (idx !== -1) {
      bestIdx = idx;
      break;
    }
  }
  if (bestIdx === -1) return '';
  const start = Math.max(0, bestIdx - 60);
  const end = Math.min(body.length, bestIdx + 120);
  const excerpt =
    (start > 0 ? '...' : '') +
    body.slice(start, end) +
    (end < body.length ? '...' : '');
  return highlight(excerpt, words);
}

// IIFE bundle for browser usage (SearchBar.astro, search.astro and 404.astro)
// This gets compiled to public/search.js
if (typeof window !== 'undefined') {
  (window as any).SearchLib = {
    fuzzyMatch,
    searchExact,
    searchFuzzy,
    search,
    escapeHtml,
    highlight,
    getExcerpt,
    sectionPriority,
  };
}
