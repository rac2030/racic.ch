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
