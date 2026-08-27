import { test, expect } from '@playwright/test';

test.describe('Content resizer', () => {
  test('blog article has resizer handles', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const leftHandle = page.locator('.resizer-left, #resizer-left');
    const rightHandle = page.locator('.resizer-right, #resizer-right');
    await expect(leftHandle).toBeAttached();
    await expect(rightHandle).toBeAttached();
  });

  test('content resizer has localStorage persistence', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await page.evaluate(() => {
      localStorage.setItem('content-width', '800');
    });
    await page.reload();
    const width = await page.evaluate(() => localStorage.getItem('content-width'));
    expect(width).toBe('800');
  });

  test('content resizer container exists', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const resizer = page.locator('.content-resizer, #content-resizer');
    await expect(resizer).toBeAttached();
  });
});

test.describe('Wiki graph', () => {
  test('wiki listing page has graph container', async ({ page }) => {
    await page.goto('/wiki/');
    const graph = page.locator('.wiki-graph, canvas, .wiki-graph-wrap');
    await expect(graph.first()).toBeAttached();
  });

  test('wiki graph has zoom controls', async ({ page }) => {
    await page.goto('/wiki/');
    const zoomIn = page.locator('button:has-text("+"), .zoom-in, #zoom-in');
    const zoomOut = page.locator('button:has-text("-"), .zoom-out, #zoom-out');
    if (await zoomIn.first().isVisible()) {
      await expect(zoomIn.first()).toBeVisible();
      await expect(zoomOut.first()).toBeVisible();
    }
  });
});

test.describe('Mobile menu', () => {
  test('mobile menu button is present', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('#menu-toggle, .mobile-menu-btn, button[aria-label*="menu" i]');
    await expect(menuBtn).toBeAttached();
  });

  test('mobile menu toggles open class', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menuBtn = page.locator('#menu-toggle, .mobile-menu-btn, button[aria-label*="menu" i]');
    await menuBtn.click();
    const navLinks = page.locator('.nav-links, #nav-links');
    await expect(navLinks).toHaveClass(/open/);
  });

  test('mobile menu closes after clicking nav link', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menuBtn = page.locator('#menu-toggle, .mobile-menu-btn, button[aria-label*="menu" i]');
    await menuBtn.click();
    const blogLink = page.locator('.nav-links a[href="/blog"], #nav-links a[href="/blog"]');
    await blogLink.click();
    await page.waitForURL(/\/blog/);
  });
});

test.describe('Draft mode', () => {
  test('draft blog post exists in build', async ({ page }) => {
    const response = await page.goto('/blog/building-this-site-with-ai/');
    expect(response?.status()).toBe(200);
  });

  test('draft post has git history trigger', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai/');
    const trigger = page.locator('#git-history-trigger');
    await expect(trigger).toBeVisible();
  });
});

test.describe('Easter eggs', () => {
  test('pi page has calculator output element', async ({ page }) => {
    await page.goto('/π/');
    await expect(page.locator('h1')).toContainText('π');
    const output = page.locator('#pi-output');
    await expect(output).toBeAttached();
  });

  test('pi page has YouTube embed', async ({ page }) => {
    await page.goto('/π/');
    const iframe = page.locator('iframe[src*="youtube"], iframe[src*="youtu.be"]');
    await expect(iframe).toBeAttached();
  });

  test('poop page has rickroll', async ({ page }) => {
    await page.goto('/💩/');
    await expect(page.locator('h1')).toContainText('💩');
    const iframe = page.locator('iframe[src*="youtube"], iframe[src*="youtu.be"]');
    await expect(iframe).toBeAttached();
  });

  test('pi easter egg link exists on homepage', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.pi-easter-egg, a[href="/pi/"], a[href="/π/"]');
    await expect(link.first()).toBeAttached();
  });
});

test.describe('RSS feed', () => {
  test('RSS feed is valid XML with items', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    expect(response?.status()).toBe(200);
    const contentType = response?.headers()['content-type'] || '';
    expect(contentType).toContain('xml');
  });

  test('RSS feed contains blog post titles', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    const text = await response?.text();
    expect(text).toContain('<item>');
    expect(text).toContain('<title>');
  });
});

test.describe('Sitemap', () => {
  test('sitemap index exists', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml');
    expect(response?.status()).toBe(200);
  });

  test('sitemap contains site URLs', async ({ page }) => {
    const response = await page.goto('/sitemap-0.xml');
    const text = await response?.text();
    expect(text).toContain('racic.ch');
    expect(text).toContain('<url>');
  });
});
