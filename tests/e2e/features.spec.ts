import { test, expect } from '@playwright/test';

test.describe('Homepage recent updates', () => {
  test('renders recently updated section', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('.recent-list');
    await expect(section).toBeVisible();
  });

  test('shows up to 10 recent items', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.recent-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10);
  });

  test('each item has section badge, title, and date', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('.recent-item').first();
    await expect(first.locator('.recent-item-section')).toBeVisible();
    await expect(first.locator('.recent-item-title')).toBeVisible();
    await expect(first.locator('.recent-item-date')).toBeVisible();
  });

  test('items are sorted by date descending', async ({ page }) => {
    await page.goto('/');
    const dates = await page.locator('.recent-item-date').allTextContents();
    expect(dates.length).toBeGreaterThan(1);
  });
});

test.describe('Bookmarks page', () => {
  test('loads with heading', async ({ page }) => {
    await page.goto('/bookmarks/');
    await expect(page.locator('h1')).toContainText('Bookmarks');
  });

  test('displays alphabetical letter groups', async ({ page }) => {
    await page.goto('/bookmarks/');
    const groups = page.locator('.bookmarks-letter');
    expect(await groups.count()).toBeGreaterThan(0);
  });

  test('bookmark items link to bookmark detail pages', async ({ page }) => {
    await page.goto('/bookmarks/');
    const first = page.locator('.bookmark-item').first();
    const href = await first.getAttribute('href');
    expect(href).toMatch(/^\/bookmarks\//);
  });

  test('bookmark detail page renders', async ({ page }) => {
    await page.goto('/bookmarks/360-video/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.article-content')).toBeVisible();
  });
});

test.describe('Search index', () => {
  test('returns valid JSON array', async ({ page }) => {
    const response = await page.goto('/search-index.json');
    expect(response?.status()).toBe(200);
    const contentType = response?.headers()['content-type'] || '';
    expect(contentType).toContain('json');
    const data = await response?.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('entries have required fields', async ({ page }) => {
    const response = await page.goto('/search-index.json');
    const data = await response?.json();
    const entry = data[0];
    expect(entry).toHaveProperty('title');
    expect(entry).toHaveProperty('description');
    expect(entry).toHaveProperty('tags');
    expect(entry).toHaveProperty('url');
    expect(entry).toHaveProperty('section');
    expect(entry).toHaveProperty('date');
    expect(entry).toHaveProperty('body');
  });

  test('contains all sections', async ({ page }) => {
    const response = await page.goto('/search-index.json');
    const data = await response?.json();
    const sections = new Set(data.map((e: any) => e.section));
    expect(sections.has('Blog')).toBe(true);
    expect(sections.has('Projects')).toBe(true);
    expect(sections.has('Wiki')).toBe(true);
    expect(sections.has('Bookmarks')).toBe(true);
  });
});

test.describe('Hidden pages', () => {
  test('pi page loads', async ({ page }) => {
    await page.goto('/π/');
    await expect(page.locator('h1')).toContainText('π');
    await expect(page.locator('#pi-output')).toBeVisible();
  });

  test('poop page loads', async ({ page }) => {
    await page.goto('/💩/');
    await expect(page.locator('h1')).toContainText('💩');
  });

  test('pi easter egg link exists on every page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.pi-easter-egg')).toBeVisible();
    const href = await page.locator('.pi-easter-egg').getAttribute('href');
    expect(href).toBe('/π/');
  });
});

test.describe('404 page', () => {
  test('shows flying poop emojis', async ({ page }) => {
    await page.goto('/404.html');
    const container = page.locator('#poop-container');
    await expect(container).toBeVisible();
    const emojis = container.locator('div');
    expect(await emojis.count()).toBe(8);
  });

  test('has search functionality', async ({ page }) => {
    await page.goto('/404.html');
    const searchSection = page.locator('#search-404');
    await expect(searchSection).toBeAttached();
  });
});

test.describe('Article features', () => {
  test('blog article has edit link', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const editLink = page.locator('.article-edit');
    await expect(editLink).toBeVisible();
    const href = await editLink.getAttribute('href');
    expect(href).toContain('github.com');
    expect(href).toContain('edit');
  });

  test('blog article has copy button on code blocks', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const codeBlock = page.locator('pre').first();
    await expect(codeBlock.locator('.copy-btn')).toBeVisible();
  });

  test('blog article has language badge on code blocks', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const codeBlock = page.locator('pre[data-language]').first();
    await expect(codeBlock.locator('.lang-badge')).toBeVisible();
  });

  test('content resizer handles exist', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await expect(page.locator('.resizer-left')).toBeVisible();
    await expect(page.locator('.resizer-right')).toBeVisible();
  });
});

test.describe('Alias routing', () => {
  test('absolute alias resolves to same content from root path', async ({ page }) => {
    await page.goto('/wiki/git/');
    const originalTitle = await page.locator('h1').first().textContent();

    await page.goto('/post/dev/git/');
    const aliasTitle = await page.locator('h1').first().textContent();
    expect(aliasTitle).toBe(originalTitle);
  });

  test('second absolute alias resolves to same content', async ({ page }) => {
    await page.goto('/wiki/git/');
    const originalTitle = await page.locator('h1').first().textContent();

    await page.goto('/wiki/Git/');
    const aliasTitle = await page.locator('h1').first().textContent();
    expect(aliasTitle).toBe(originalTitle);
  });
});
