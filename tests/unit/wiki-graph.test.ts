import { describe, test, expect } from '@jest/globals';
import {
  buildWikiGraph,
  isNodeVisible,
  filterGraph,
  WikiGraphData,
  TaggedEntry,
  GraphFilter,
  GraphNode,
} from '../../src/lib/wiki-graph';

const wikiEntries: TaggedEntry[] = [
  { slug: 'git', title: 'GIT', tags: ['git', 'scm'], category: 'development' },
  { slug: 'ant', title: 'Apache Ant', tags: ['java', 'build'], category: 'development' },
  { slug: 'apache-force-ssl', title: 'Apache SSL', tags: ['apache', 'ssl'], category: 'howto' },
  { slug: 'world-writable-files', title: 'World Writable', tags: ['shell', 'security'], category: 'security' },
  { slug: 'makezurich', title: 'MakeZurich', tags: ['diy', 'arduino'], category: 'hardware' },
  { slug: 'led-strip', title: 'LED Strip', tags: ['arduino', 'diy'], category: 'hardware' },
];

const bookmarkEntries: TaggedEntry[] = [
  { slug: 'computer-vision', title: 'Computer Vision', tags: ['java', 'computer-vision'] },
  { slug: 'arduino', title: 'Arduino', tags: ['arduino', 'diy', 'electronics'] },
  { slug: 'stm32', title: 'STM32', tags: ['stm32', 'embedded'] },
];

function findEdge(graph: WikiGraphData, aSlug: string, bSlug: string) {
  return graph.edges.find((e) => {
    const source = graph.nodes[e.source];
    const target = graph.nodes[e.target];
    return (
      (source.slug === aSlug && target.slug === bSlug) ||
      (source.slug === bSlug && target.slug === aSlug)
    );
  });
}

function nodeBySlug(graph: WikiGraphData, slug: string): GraphNode {
  const n = graph.nodes.find((n) => n.slug === slug);
  if (!n) throw new Error(`node ${slug} not found`);
  return n;
}

describe('buildWikiGraph', () => {
  test('creates wiki nodes with type, category, slug and tags', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    const git = nodeBySlug(graph, 'git');
    expect(git.type).toBe('wiki');
    expect(git.category).toBe('development');
    expect(git.slug).toBe('git');
    expect(git.tags).toEqual(['git', 'scm']);
  });

  test('falls back to uncategorized when wiki has no category', () => {
    const graph = buildWikiGraph([{ slug: 'nocat', title: 'NoCat', tags: ['x'] }], []);
    const n = nodeBySlug(graph, 'nocat');
    expect(n.category).toBe('uncategorized');
  });

  test('adds tag edge between wiki nodes sharing a tag', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    const edge = findEdge(graph, 'makezurich', 'led-strip');
    expect(edge).toBeDefined();
    expect(edge?.type).toBe('tag');
  });

  test('adds category edge between wiki nodes in same category without shared tags', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    const edge = findEdge(graph, 'git', 'ant');
    expect(edge).toBeDefined();
    expect(edge?.type).toBe('category');
  });

  test('prefers tag edge over category edge when both apply', () => {
    const graph = buildWikiGraph(
      [
        { slug: 'a', title: 'A', tags: ['shared'], category: 'same' },
        { slug: 'b', title: 'B', tags: ['shared'], category: 'same' },
      ],
      []
    );
    const edge = findEdge(graph, 'a', 'b');
    expect(edge).toBeDefined();
    expect(edge?.type).toBe('tag');
    const samePair = graph.edges.filter((e) => e.source === 0 && e.target === 1);
    expect(samePair.length).toBe(1);
  });

  test('does not add category edge for uncategorized wiki nodes', () => {
    const graph = buildWikiGraph(
      [
        { slug: 'a', title: 'A', tags: ['x'], category: 'uncategorized' },
        { slug: 'b', title: 'B', tags: ['y'], category: undefined },
      ],
      []
    );
    expect(graph.edges.length).toBe(0);
  });

  test('adds bookmark nodes after wiki nodes', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    const cv = nodeBySlug(graph, 'computer-vision');
    expect(cv.type).toBe('bookmark');
    expect(cv.category).toBeNull();
    expect(cv.id).toBeGreaterThanOrEqual(6);
  });

  test('adds bookmark edge between wiki and bookmark sharing a tag', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    const edge = findEdge(graph, 'ant', 'computer-vision');
    expect(edge).toBeDefined();
    expect(edge?.type).toBe('bookmark');
  });

  test('drops bookmarks with no shared tags with any wiki node', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    expect(graph.nodes.some((n) => n.slug === 'stm32')).toBe(false);
  });

  test('only drops the unconnected bookmark, keeps connected ones', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    const slugs = graph.nodes.map((n) => n.slug);
    expect(slugs).toContain('computer-vision');
    expect(slugs).toContain('arduino');
    expect(slugs).not.toContain('stm32');
  });

  test('produces expected node and edge counts for sample data', () => {
    const graph = buildWikiGraph(wikiEntries, bookmarkEntries);
    expect(graph.nodes.length).toBe(8);
    expect(graph.edges.length).toBe(5);
  });
});

describe('isNodeVisible', () => {
  const graph = buildWikiGraph(wikiEntries, bookmarkEntries);

  test('no filter shows every node', () => {
    const filter: GraphFilter = { tags: [], category: null };
    for (const n of graph.nodes) {
      expect(isNodeVisible(n, filter)).toBe(true);
    }
  });

  test('empty filter object shows every node', () => {
    for (const n of graph.nodes) {
      expect(isNodeVisible(n, {})).toBe(true);
    }
  });

  test('tag filter uses AND logic across selected tags', () => {
    const makezurich = nodeBySlug(graph, 'makezurich');
    expect(isNodeVisible(makezurich, { tags: ['arduino'], category: null })).toBe(true);
    expect(isNodeVisible(makezurich, { tags: ['arduino', 'diy'], category: null })).toBe(true);
    expect(isNodeVisible(makezurich, { tags: ['arduino', 'java'], category: null })).toBe(false);
  });

  test('category filter applies only to wiki nodes', () => {
    const ant = nodeBySlug(graph, 'ant');
    const cv = nodeBySlug(graph, 'computer-vision');
    expect(isNodeVisible(ant, { tags: [], category: 'development' })).toBe(true);
    expect(isNodeVisible(ant, { tags: [], category: 'security' })).toBe(false);
    expect(isNodeVisible(cv, { tags: [], category: 'security' })).toBe(true);
  });

  test('bookmark nodes are filtered by tags', () => {
    const cv = nodeBySlug(graph, 'computer-vision');
    expect(isNodeVisible(cv, { tags: ['java'], category: null })).toBe(true);
    expect(isNodeVisible(cv, { tags: ['arduino'], category: null })).toBe(false);
  });
});

describe('filterGraph', () => {
  const graph = buildWikiGraph(wikiEntries, bookmarkEntries);

  test('no filter returns the full graph', () => {
    const filtered = filterGraph(graph.nodes, graph.edges, { tags: [], category: null });
    expect(filtered.nodes.length).toBe(graph.nodes.length);
    expect(filtered.edges.length).toBe(graph.edges.length);
  });

  test('tags filter removes non-matching nodes and their edges', () => {
    const filtered = filterGraph(graph.nodes, graph.edges, { tags: ['java'], category: null });
    const slugs = filtered.nodes.map((n) => n.slug).sort();
    expect(slugs).toEqual(['ant', 'computer-vision']);
    expect(filtered.edges.length).toBe(1);
    expect(filtered.edges[0].type).toBe('bookmark');
  });

  test('category filter keeps wiki nodes of that category plus related bookmarks', () => {
    const filtered = filterGraph(graph.nodes, graph.edges, { tags: [], category: 'development' });
    const slugs = filtered.nodes.map((n) => n.slug).sort();
    expect(slugs).toEqual(['ant', 'computer-vision', 'git']);
    expect(filtered.edges.length).toBe(2);
  });

  test('combined tag and category filter', () => {
    const filtered = filterGraph(graph.nodes, graph.edges, { tags: ['java'], category: 'development' });
    const slugs = filtered.nodes.map((n) => n.slug).sort();
    expect(slugs).toEqual(['ant', 'computer-vision']);
  });

  test('edge is removed when either endpoint is filtered out', () => {
    const filtered = filterGraph(graph.nodes, graph.edges, { tags: ['arduino'], category: null });
    const slugs = filtered.nodes.map((n) => n.slug).sort();
    expect(slugs).toEqual(['arduino', 'led-strip', 'makezurich']);
    const edges = filtered.edges;
    expect(edges.length).toBe(3);
    expect(edges.filter((e) => e.type === 'tag').length).toBe(1);
    expect(edges.filter((e) => e.type === 'bookmark').length).toBe(2);
  });

  test('bookmark hidden when every connected wiki node is filtered out', () => {
    const filtered = filterGraph(graph.nodes, graph.edges, { tags: [], category: 'development' });
    const slugs = filtered.nodes.map((n) => n.slug);
    expect(slugs).toContain('computer-vision');
    expect(slugs).not.toContain('arduino');
  });

  test('empty data returns empty graph', () => {
    const filtered = filterGraph([], [], { tags: [], category: null });
    expect(filtered.nodes.length).toBe(0);
    expect(filtered.edges.length).toBe(0);
  });

  test('filter that matches nothing returns empty graph', () => {
    const filtered = filterGraph(graph.nodes, graph.edges, { tags: ['nonexistent'], category: null });
    expect(filtered.nodes.length).toBe(0);
    expect(filtered.edges.length).toBe(0);
  });
});