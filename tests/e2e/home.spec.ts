import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('displays site title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Michel Racic');
  });

  test('displays subtitle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.subtitle')).toContainText('Software Engineer');
  });

  test('has 6 navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links a')).toHaveCount(6);
  });

  test('has 4 hero action buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-links a')).toHaveCount(4);
  });

  test('hero links point to correct pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-links a[href="/projects"]')).toBeVisible();
    await expect(page.locator('.hero-links a[href="/blog"]')).toBeVisible();
    await expect(page.locator('.hero-links a[href="/wiki"]')).toBeVisible();
    await expect(page.locator('.hero-links a[href="/about"]')).toBeVisible();
  });

  test('has aerial background elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#bg')).toBeAttached();
    await expect(page.locator('#overlay')).toBeAttached();
    await expect(page.locator('#wrapper')).toBeAttached();
  });
});
