import { test, expect } from '@playwright/test';

test.describe('Wiki graph', () => {
  test('exposes wiki and bookmark node counts', async ({ page }) => {
    await page.goto('/wiki/');
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state).toBeTruthy();
    expect(state.totalWikiNodes).toBeGreaterThan(0);
    expect(state.totalBookmarkNodes).toBeGreaterThan(0);
    expect(state.totalNodes).toBe(state.totalWikiNodes + state.totalBookmarkNodes);
  });

  test('shows all connected bookmarks when no filter is active', async ({ page }) => {
    await page.goto('/wiki/');
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state.visibleNodes).toBe(state.totalNodes);
    expect(state.visibleBookmarkSlugs.length).toBe(state.totalBookmarkNodes);
  });

  test('tag URL parameter filters the graph and keeps related bookmarks', async ({ page }) => {
    await page.goto('/wiki/?tags=java');
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state.selectedTags).toEqual(['java']);
    expect(state.visibleWikiSlugs).toEqual(['ant']);
    expect(state.visibleBookmarkSlugs).toEqual(['computer-vision']);
    expect(state.visibleNodes).toBeLessThan(state.totalNodes);
  });

  test('category filter button hides unrelated nodes', async ({ page }) => {
    await page.goto('/wiki/');
    await page.click('.category-btn[data-category="security"]');
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state.selectedCategory).toBe('security');
    expect(state.visibleNodes).toBeLessThan(state.totalNodes);
    expect(state.visibleNodes).toBeGreaterThan(0);
  });

  test('category filter resets to show all nodes', async ({ page }) => {
    await page.goto('/wiki/?category=development');
    const filtered = await page.evaluate(() => (window as any).__wikiGraph);
    expect(filtered.selectedCategory).toBe('development');
    await page.click('.category-btn[data-category="all"]');
    const all = await page.evaluate(() => (window as any).__wikiGraph);
    expect(all.selectedCategory).toBeNull();
    expect(all.visibleNodes).toBe(all.totalNodes);
  });

  test('tag-filter-change event updates graph state', async ({ page }) => {
    await page.goto('/wiki/');
    await page.evaluate(() => {
      document.getElementById('tag-filter').dispatchEvent(new CustomEvent('tag-filter-change', {
        bubbles: true,
        detail: { tags: ['java'] }
      }));
    });
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state.selectedTags).toEqual(['java']);
    expect(state.visibleWikiSlugs).toEqual(['ant']);
    expect(state.visibleBookmarkSlugs).toEqual(['computer-vision']);
  });

  test('category-filter-change event updates graph state', async ({ page }) => {
    await page.goto('/wiki/');
    await page.evaluate(() => {
      document.getElementById('wiki-category-filter').dispatchEvent(new CustomEvent('category-filter-change', {
        bubbles: true,
        detail: { category: 'security' }
      }));
    });
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state.selectedCategory).toBe('security');
    expect(state.visibleWikiSlugs).toContain('world-writable-files');
    expect(state.visibleWikiSlugs).toContain('scanning-filesystem-weak-restrictions');
    expect(state.visibleBookmarkSlugs).toEqual([]);
  });

  test('bookmarks hidden when their connected articles are filtered out', async ({ page }) => {
    await page.goto('/wiki/?category=development');
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state.visibleWikiSlugs).toEqual(['ant', 'git']);
    expect(state.visibleBookmarkSlugs).toEqual(['computer-vision']);
  });

  test('invalid tag parameter is ignored and shows all nodes', async ({ page }) => {
    await page.goto('/wiki/?tags=nonexistent-tag');
    const state = await page.evaluate(() => (window as any).__wikiGraph);
    expect(state.selectedTags).toEqual([]);
    expect(state.visibleNodes).toBe(state.totalNodes);
  });
});