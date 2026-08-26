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

test.describe('Git history modal', () => {
  test('blog article shows updated date from git', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const updated = page.locator('#git-history-trigger');
    await expect(updated).toBeVisible();
    await expect(updated).toContainText('updated');
  });

  test('clicking updated date opens git history modal', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const trigger = page.locator('#git-history-trigger');
    await trigger.click();
    const modal = page.locator('#git-history-modal');
    await expect(modal).toBeVisible();
  });

  test('modal shows Change History heading', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.locator('#git-history-trigger').click();
    const heading = page.locator('#git-history-modal h3');
    await expect(heading).toContainText('Change History');
  });

  test('modal shows commit table with date, message, and hash', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.locator('#git-history-trigger').click();
    const table = page.locator('#git-history-modal table');
    await expect(table).toBeVisible();
    const headers = table.locator('th');
    await expect(headers.nth(0)).toContainText('Date');
    await expect(headers.nth(1)).toContainText('Message');
    await expect(headers.nth(2)).toContainText('Commit');
  });

  test('modal shows at least one commit row', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.locator('#git-history-trigger').click();
    const rows = page.locator('#git-history-modal tbody tr');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });

  test('commit hash links to GitHub', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.locator('#git-history-trigger').click();
    const hashLink = page.locator('#git-history-modal tbody tr td a').first();
    await expect(hashLink).toBeVisible();
    const href = await hashLink.getAttribute('href');
    expect(href).toContain('github.com/rac2030/racic.ch/commit/');
  });

  test('modal closes on close button click', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.locator('#git-history-trigger').click();
    await expect(page.locator('#git-history-modal')).toBeVisible();
    await page.locator('#git-history-close').click();
    await expect(page.locator('#git-history-modal')).not.toBeVisible();
  });

  test('modal closes on backdrop click', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.locator('#git-history-trigger').click();
    await expect(page.locator('#git-history-modal')).toBeVisible();
    await page.locator('#git-history-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('#git-history-modal')).not.toBeVisible();
  });

  test('modal closes on Escape key', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.locator('#git-history-trigger').click();
    await expect(page.locator('#git-history-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#git-history-modal')).not.toBeVisible();
  });

  test('wiki article shows git history modal', async ({ page }) => {
    await page.goto('/wiki/git/');
    const trigger = page.locator('#git-history-trigger');
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator('#git-history-modal')).toBeVisible();
    await expect(page.locator('#git-history-modal h3')).toContainText('Change History');
  });

  test('project article shows git history modal', async ({ page }) => {
    await page.goto('/projects/spikey/');
    const trigger = page.locator('#git-history-trigger');
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator('#git-history-modal')).toBeVisible();
  });
});
