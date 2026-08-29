export function stripMdExtension(id: string): string {
  return id.replace(/\.md$/, '');
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function sortPostsByDate<T extends { data: { pubDate: Date } }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function sortProjectsByDate<T extends { data: { pubDate: Date } }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function sortWikiByTitle<T extends { data: { title: string } }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) =>
    a.data.title.localeCompare(b.data.title),
  );
}

export function buildBlogUrl(id: string): string {
  return `/blog/${stripMdExtension(id)}`;
}

export function buildProjectUrl(id: string): string {
  return `/projects/${stripMdExtension(id)}`;
}

export function buildWikiUrl(id: string): string {
  return `/wiki/${stripMdExtension(id)}`;
}

export function buildTagUrl(tag: string): string {
  return `/tags/${tag}`;
}

export function filterDrafts<T extends { data: { draft?: boolean } }>(
  items: T[],
): T[] {
  return items.filter((item) => !item.data.draft);
}

export function extractAllTags<T extends { data: { tags: string[] } }>(
  items: T[],
): string[] {
  const tagSet = new Set<string>();
  for (const item of items) {
    for (const tag of item.data.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/\*\*|__|`/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    headings.push({ id, text, level });
  }
  return headings;
}
