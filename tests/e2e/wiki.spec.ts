import { test, expect } from '@playwright/test';

test.describe('Wiki listing', () => {
  test('loads with heading', async ({ page }) => {
    await page.goto('/wiki/');
    await expect(page.locator('main h1')).toContainText('Wiki');
  });

  test('displays at least 6 wiki entries', async ({ page }) => {
    await page.goto('/wiki/');
    await page.waitForSelector('.wiki-grid .wiki-card');
    const cards = page.locator('.wiki-grid .wiki-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('wiki entries are sorted alphabetically', async ({ page }) => {
    await page.goto('/wiki/');
    const titles = page.locator('.wiki-grid .wiki-card h3');
    const count = await titles.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await titles.nth(i).textContent()) || '');
    }
    const sorted = [...texts].sort((a, b) => a.localeCompare(b));
    expect(texts).toEqual(sorted);
  });
});

test.describe('Wiki pages', () => {
  test('renders Git wiki page', async ({ page }) => {
    await page.goto('/wiki/git/');
    await expect(page.locator('article h1').first()).toHaveText('GIT');
  });

  test('renders Apache Force SSL page', async ({ page }) => {
    await page.goto('/wiki/apache-force-ssl/');
    await expect(page.locator('article h1')).toContainText('Force SSL');
  });

  test('wiki page has article content', async ({ page }) => {
    await page.goto('/wiki/git/');
    const article = page.locator('article');
    await expect(article).toBeVisible();
    const content = await article.textContent();
    expect(content?.length).toBeGreaterThan(50);
  });
});
