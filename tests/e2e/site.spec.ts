import { test, expect } from '@playwright/test';

test.describe('Tags pages', () => {
  test('tag index page loads with tags', async ({ page }) => {
    await page.goto('/tags/');
    await expect(page.locator('main h1')).toContainText('Tags');
    const tags = page.locator('.tags-page .tag');
    const count = await tags.count();
    expect(count).toBeGreaterThan(0);
  });

  test('individual tag page shows filtered posts', async ({ page }) => {
    await page.goto('/tags/hugo/');
    const cards = page.locator('.card-grid .card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('About page', () => {
  test('loads with heading and content', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('main h1')).toHaveText('About');
    const content = page.locator('.about-content');
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(100);
  });

  test('has 3 social links', async ({ page }) => {
    await page.goto('/about/');
    const links = page.locator('.social-links a');
    await expect(links).toHaveCount(3);
    await expect(page.locator('.social-links a[href*="github.com"]')).toBeVisible();
  });
});

test.describe('RSS feed', () => {
  test('returns XML with site title and posts', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('Michel Racic');
    expect(body).toContain('<item>');
    expect(body).toContain('Hosting a Hugo Site with Firebase');
  });
});

test.describe('404 page', () => {
  test('shows 404 for non-existent page', async ({ page }) => {
    const response = await page.goto('/non-existent-page/');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Sitemap', () => {
  test('sitemap index exists', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml');
    expect(response?.status()).toBe(200);
  });

  test('sitemap contains site URLs', async ({ page }) => {
    const response = await page.goto('/sitemap-0.xml');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('racic.ch');
  });
});

test.describe('Layout and theme', () => {
  test('every page has header, footer, and background', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#bg')).toBeAttached();
    await expect(page.locator('#overlay')).toBeAttached();
    await expect(page.locator('#wrapper')).toBeAttached();
    await expect(page.locator('.site-header')).toBeVisible();
    await expect(page.locator('.site-logo')).toHaveText('Michel Racic');
    await expect(page.locator('.site-footer')).toBeVisible();
    await expect(page.locator('.footer-copy').first()).toContainText('Michel Racic');
    await expect(page.locator('.header-social a')).toHaveCount(3);
  });
});

test.describe('Responsive behavior', () => {
  test('mobile menu button hidden on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('.mobile-menu-btn')).toBeHidden();
  });

  test('mobile menu button visible and toggles on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('.mobile-menu-btn')).toBeVisible();
    const nav = page.locator('.nav-links');
    await expect(nav).toBeHidden();
    await page.click('.mobile-menu-btn');
    await expect(nav).toHaveClass(/open/);
  });
});

test.describe('Content integrity', () => {
  test('blog post links are unique', async ({ page }) => {
    await page.goto('/blog/');
    const links = page.locator('.card-grid .card');
    const hrefs: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      hrefs.push((await links.nth(i).getAttribute('href')) || '');
    }
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  test('project links are unique', async ({ page }) => {
    await page.goto('/projects/');
    const links = page.locator('.card-grid .card');
    const hrefs: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      hrefs.push((await links.nth(i).getAttribute('href')) || '');
    }
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  test('every blog card links to a valid page', async ({ page }) => {
    const response = await page.goto('/blog/');
    expect(response?.status()).toBe(200);
    const hrefs = await page.locator('.card-grid .card').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean),
    );
    for (const href of hrefs) {
      const res = await page.goto(href!);
      expect(res?.status()).toBe(200);
    }
  });

  test('every project card links to a valid page', async ({ page }) => {
    const response = await page.goto('/projects/');
    expect(response?.status()).toBe(200);
    const hrefs = await page.locator('.card-grid .card').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean),
    );
    for (const href of hrefs) {
      const res = await page.goto(href!);
      expect(res?.status()).toBe(200);
    }
  });
});
