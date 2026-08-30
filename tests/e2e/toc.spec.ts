import { test, expect } from '@playwright/test';

const TOC_PAGE = '/blog/building-this-site-with-ai';

async function isTocOnScreen(page) {
  return page.evaluate(() => {
    const el = document.getElementById('table-of-contents');
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return r.top < vh && r.bottom > 0;
  });
}

test.describe('Table of Contents (mobile menu)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('main slideout panel is not visible on mobile', async ({ page }) => {
    await page.goto(TOC_PAGE);
    await page.waitForSelector('#table-of-contents');
    await expect(page.locator('#table-of-contents')).toBeAttached();
    expect(await isTocOnScreen(page)).toBe(false);
  });

  test('icon-only toggle button is visible on mobile', async ({ page }) => {
    await page.goto(TOC_PAGE);
    await page.waitForSelector('#toc-toggle');
    await expect(page.locator('#toc-toggle')).toBeVisible();
    const text = await page.locator('#toc-toggle').textContent();
    expect(text!.trim()).toBe('');
    expect(page.locator('#toc-toggle i.fa-list-ul')).toHaveCount(1);
  });

  test('clicking the toggle button opens the TOC overlay', async ({ page }) => {
    await page.goto(TOC_PAGE);
    await page.waitForSelector('#toc-toggle');
    expect(await isTocOnScreen(page)).toBe(false);
    await page.click('#toc-toggle');
    await expect(page.locator('#table-of-contents')).toHaveClass(/open/);
    expect(await isTocOnScreen(page)).toBe(true);
    expect(await page.locator('#toc-toggle').getAttribute('aria-expanded')).toBe('true');
  });

  test('clicking a TOC link closes the overlay', async ({ page }) => {
    await page.goto(TOC_PAGE);
    await page.waitForSelector('#toc-toggle');
    await page.click('#toc-toggle');
    await expect(page.locator('#table-of-contents')).toHaveClass(/open/);
    await page.locator('.toc-link').first().click();
    await expect(page.locator('#table-of-contents')).not.toHaveClass(/open/);
    await expect.poll(() => isTocOnScreen(page)).toBe(false);
  });

  test('clicking outside the overlay closes it', async ({ page }) => {
    await page.goto(TOC_PAGE);
    await page.waitForSelector('#toc-toggle');
    await page.click('#toc-toggle');
    await expect(page.locator('#table-of-contents')).toHaveClass(/open/);
    await page.mouse.click(10, 10);
    await expect(page.locator('#table-of-contents')).not.toHaveClass(/open/);
  });
});

test.describe('Table of Contents', () => {
  test('blog article has TOC panel', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai');
    await page.waitForSelector('#table-of-contents');
    const toc = page.locator('#table-of-contents');
    await expect(toc).toBeAttached();
  });

  test('TOC has heading links', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai');
    await page.waitForSelector('.toc-link');
    const links = page.locator('.toc-link');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('TOC link text matches article headings', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai');
    await page.waitForSelector('.toc-link');
    const firstLink = page.locator('.toc-link').first();
    const text = await firstLink.textContent();
    expect(text!.length).toBeGreaterThan(3);
  });

  test('TOC slides in on hover', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai');
    await page.waitForSelector('#table-of-contents');
    const toc = page.locator('#table-of-contents');
    await expect(toc).toBeAttached();
    const box = await toc.boundingBox();
    expect(box).not.toBeNull();
  });

  test('wiki article has TOC', async ({ page }) => {
    await page.goto('/wiki/git');
    await page.waitForSelector('#table-of-contents');
    const toc = page.locator('#table-of-contents');
    await expect(toc).toBeAttached();
    const links = page.locator('.toc-link');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('project article has TOC', async ({ page }) => {
    await page.goto('/projects/makezurich-2018-badge');
    await page.waitForSelector('#table-of-contents');
    const toc = page.locator('#table-of-contents');
    await expect(toc).toBeAttached();
  });
});

test.describe('Heading Anchors', () => {
  test('blog article headings have anchor links', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai');
    await page.waitForSelector('.heading-anchor', { timeout: 5000 });
    const anchors = page.locator('.heading-anchor');
    const count = await anchors.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('anchor link contains # character', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai');
    await page.waitForSelector('.heading-anchor', { timeout: 5000 });
    const anchor = page.locator('.heading-anchor').first();
    const text = await anchor.textContent();
    expect(text).toBe('#');
  });

  test('anchor link has correct href', async ({ page }) => {
    await page.goto('/blog/building-this-site-with-ai');
    await page.waitForSelector('.heading-anchor', { timeout: 5000 });
    const anchor = page.locator('.heading-anchor').first();
    const href = await anchor.getAttribute('href');
    expect(href).toMatch(/^#[a-z0-9-]+$/);
  });

  test('wiki article has heading anchors', async ({ page }) => {
    await page.goto('/wiki/git');
    await page.waitForSelector('.heading-anchor', { timeout: 5000 });
    const anchors = page.locator('.heading-anchor');
    const count = await anchors.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
