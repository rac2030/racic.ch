import { test, expect } from '@playwright/test';

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
