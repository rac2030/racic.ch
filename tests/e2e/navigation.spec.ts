import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('logo links to home', async ({ page }) => {
    await page.goto('/blog');
    await page.click('.site-logo');
    await expect(page).toHaveURL('/');
  });

  test('nav links navigate to correct pages', async ({ page }) => {
    await page.goto('/');
    await page.click('.nav-links a[href="/blog"]');
    await expect(page).toHaveURL(/\/blog/);

    await page.click('.nav-links a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);

    await page.click('.nav-links a[href="/wiki"]');
    await expect(page).toHaveURL(/\/wiki/);

    await page.click('.nav-links a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);
  });

  test('active nav link is highlighted', async ({ page }) => {
    await page.goto('/blog');
    const blogLink = page.locator('.nav-links a[href="/blog"]');
    await expect(blogLink).toHaveClass(/active/);
  });
});

test.describe('Blog listing', () => {
  test('loads with heading', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.locator('main h1')).toHaveText('Blog');
  });

  test('displays blog post cards', async ({ page }) => {
    await page.goto('/blog/');
    const cards = page.locator('.card-grid .card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('each card has title, date, and link', async ({ page }) => {
    await page.goto('/blog/');
    const firstCard = page.locator('.card-grid .card').first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('time')).toBeVisible();
    await expect(firstCard).toHaveAttribute('href', /\/blog\//);
  });

  test('cards have tag badges', async ({ page }) => {
    await page.goto('/blog/');
    const tags = page.locator('.card-grid .card .tag');
    const count = await tags.count();
    expect(count).toBeGreaterThan(0);
  });
});
