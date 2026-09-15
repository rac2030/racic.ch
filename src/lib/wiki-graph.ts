export type GraphNodeType = 'wiki' | 'bookmark';

export interface TaggedEntry {
  slug: string;
  title: string;
  tags: string[];
  category?: string | null;
}

export interface GraphNode {
  id: number;
  type: GraphNodeType;
  title: string;
  slug: string;
  tags: string[];
  category: string | null;
}

export interface GraphEdge {
  source: number;
  target: number;
  type: 'tag' | 'category' | 'bookmark';
}

export interface GraphFilter {
  tags?: string[];
  category?: string | null;
}

export interface WikiGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const UNCATEGORIZED = 'uncategorized';

export function buildWikiGraph(
  wikiEntries: TaggedEntry[],
  bookmarkEntries: TaggedEntry[]
): WikiGraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  wikiEntries.forEach((e) => {
    nodes.push({
      id: nodes.length,
      type: 'wiki',
      title: e.title,
      slug: e.slug,
      tags: e.tags,
      category: e.category || UNCATEGORIZED,
    });
  });

  const wikiCount = nodes.length;
  for (let i = 0; i < wikiCount; i++) {
    for (let j = i + 1; j < wikiCount; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const sharesTag = a.tags.some((t) => b.tags.includes(t));
      if (sharesTag) {
        edges.push({ source: a.id, target: b.id, type: 'tag' });
      } else if (
        a.category &&
        a.category !== UNCATEGORIZED &&
        a.category === b.category
      ) {
        edges.push({ source: a.id, target: b.id, type: 'category' });
      }
    }
  }

  bookmarkEntries.forEach((e) => {
    const connectedWikiIds = wikiEntries
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => w.tags.some((t) => e.tags.includes(t)))
      .map(({ i }) => nodes[i]);
    if (connectedWikiIds.length === 0) return;

    const bookmarkNode: GraphNode = {
      id: nodes.length,
      type: 'bookmark',
      title: e.title,
      slug: e.slug,
      tags: e.tags,
      category: null,
    };
    nodes.push(bookmarkNode);
    connectedWikiIds.forEach((wikiNode) => {
      edges.push({ source: wikiNode.id, target: bookmarkNode.id, type: 'bookmark' });
    });
  });

  return { nodes, edges };
}

export function isNodeVisible(node: GraphNode, filter: GraphFilter): boolean {
  const selectedTags = filter.tags || [];
  const category = filter.category || null;

  if (category && node.type === 'wiki' && node.category !== category) {
    return false;
  }
  if (selectedTags.length > 0) {
    return selectedTags.every((t) => node.tags.includes(t));
  }
  return true;
}

export function filterGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  filter: GraphFilter
): WikiGraphData {
  const visibleWikiIds = new Set(
    nodes
      .filter((n) => n.type === 'wiki' && isNodeVisible(n, filter))
      .map((n) => n.id)
  );
  const visibleBookmarkIds = new Set(
    nodes
      .filter((n) => n.type === 'bookmark' && isNodeVisible(n, filter))
      .filter((n) =>
        edges.some(
          (e) =>
            e.type === 'bookmark' &&
            ((e.source === n.id && visibleWikiIds.has(e.target)) ||
              (e.target === n.id && visibleWikiIds.has(e.source)))
        )
      )
      .map((n) => n.id)
  );
  const visibleIds = new Set([...visibleWikiIds, ...visibleBookmarkIds]);
  return {
    nodes: nodes.filter((n) => visibleIds.has(n.id)),
    edges: edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    ),
  };
}