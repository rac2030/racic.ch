import { test, expect } from '@playwright/test';

test.describe('SEO meta tags', () => {
  test('homepage has title tag', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('homepage has OpenGraph meta tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveAttribute('content', /.+/);
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /racic\.ch/);
  });

  test('homepage has Twitter card meta tags', async ({ page }) => {
    await page.goto('/');
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', /summary/);
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    await expect(twitterTitle).toHaveAttribute('content', /.+/);
  });

  test('homepage has canonical link', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /racic\.ch/);
  });

  test('homepage has RSS link', async ({ page }) => {
    await page.goto('/');
    const rss = page.locator('link[rel="alternate"][type="application/rss+xml"]');
    await expect(rss).toBeAttached();
  });

  test('homepage has favicon', async ({ page }) => {
    await page.goto('/');
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toBeAttached();
  });

  test('blog article has title tag matching h1', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const title = await page.title();
    const h1 = await page.locator('.article-header h1').textContent();
    expect(title).toContain(h1?.trim() || '__never__');
  });

  test('blog article has OpenGraph tags', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveAttribute('content', /.+/);
  });

  test('wiki article has meta tags', async ({ page }) => {
    await page.goto('/wiki/git/');
    const title = await page.title();
    expect(title).toBeTruthy();
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('about page has meta tags', async ({ page }) => {
    await page.goto('/about/');
    const title = await page.title();
    expect(title).toBeTruthy();
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });
});
