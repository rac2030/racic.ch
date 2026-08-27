import { test, expect } from '@playwright/test';

test.describe('Search functionality', () => {
  test('search input is visible in header', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('#search-bar-input, .search-bar-input');
    await expect(searchInput).toBeVisible();
  });

  test('typing in search input shows results', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('#search-bar-input, .search-bar-input');
    await searchInput.click();
    await searchInput.pressSequentially('hugo', { delay: 50 });
    if (errors.length > 0) {
      console.log('JS Errors:', errors);
    }
    const dropdown = page.locator('#search-bar-dropdown, .search-bar-dropdown');
    const display = await dropdown.evaluate((el: HTMLElement) => window.getComputedStyle(el).display);
    console.log('Dropdown display:', display);
    const indexLoaded = await page.evaluate(() => {
      const input = document.getElementById('search-bar-input') as HTMLInputElement;
      return input !== null;
    });
    console.log('Input exists:', indexLoaded);
    await expect(dropdown).toBeVisible({ timeout: 5000 });
  });

  test('search results contain links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('#search-bar-input, .search-bar-input');
    await searchInput.click();
    await searchInput.pressSequentially('arduino', { delay: 50 });
    const dropdown = page.locator('#search-bar-dropdown, .search-bar-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const links = dropdown.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking search result navigates to page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('#search-bar-input, .search-bar-input');
    await searchInput.click();
    await searchInput.pressSequentially('firebase', { delay: 50 });
    const firstLink = page.locator('#search-bar-dropdown a, .search-bar-dropdown a').first();
    await firstLink.click();
    await page.waitForURL(/\/.+/);
    expect(page.url()).not.toBe('/');
  });

  test('search index JSON is valid and contains all sections', async ({ page }) => {
    const response = await page.goto('/search-index.json');
    expect(response?.status()).toBe(200);
    const data = await response?.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const sections = new Set(data.map((item: { section: string }) => item.section));
    expect(sections.has('Blog')).toBe(true);
    expect(sections.has('Wiki')).toBe(true);
  });

  test('search input has correct placeholder', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('#search-bar-input, .search-bar-input');
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('search input is in the header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('.site-header, header');
    const searchInput = page.locator('#search-bar-input, .search-bar-input');
    await expect(header.locator('#search-bar-input, .search-bar-input')).toBeVisible();
  });
});
