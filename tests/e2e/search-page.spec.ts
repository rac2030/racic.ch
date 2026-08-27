import { test, expect } from '@playwright/test';

test.describe('Search page', () => {
  test('search page loads with empty state', async ({ page }) => {
    await page.goto('/search/');
    await page.waitForLoadState('networkidle');
    const input = page.locator('#search-input');
    await expect(input).toBeVisible();
    const results = page.locator('#search-results');
    const html = await results.innerHTML();
    expect(html.trim()).toBe('');
  });

  test('search page accepts ?q= parameter and shows results', async ({ page }) => {
    await page.goto('/search/?q=arduino');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const input = page.locator('#search-input');
    await expect(input).toHaveValue('arduino');
    const results = page.locator('#search-results');
    await expect(results).toBeVisible();
    const text = await results.textContent();
    expect(text).toContain('Arduino');
  });

  test('search page updates results in real-time as you type', async ({ page }) => {
    await page.goto('/search/');
    await page.waitForLoadState('networkidle');
    const input = page.locator('#search-input');
    await input.fill('makezurich');
    await page.waitForTimeout(500);
    const results = page.locator('#search-results');
    await expect(results).toBeVisible();
    const text = await results.textContent();
    expect(text).toContain('MakeZurich');
  });

  test('search page shows URL in browser bar', async ({ page }) => {
    await page.goto('/search/');
    await page.waitForLoadState('networkidle');
    const input = page.locator('#search-input');
    await input.fill('hugo');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('q=hugo');
  });

  test('search page clear button works', async ({ page }) => {
    await page.goto('/search/?q=test');
    await page.waitForLoadState('networkidle');
    const input = page.locator('#search-input');
    await expect(input).toHaveValue('test');
    const clearBtn = page.locator('#search-clear');
    await clearBtn.click();
    await expect(input).toHaveValue('');
    expect(page.url()).not.toContain('q=');
  });

  test('search page shows result cards with URL, title, description', async ({ page }) => {
    await page.goto('/search/?q=makezurich');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const firstResult = page.locator('.search-page-result').first();
    await expect(firstResult).toBeVisible();
    const resultUrl = firstResult.locator('.search-page-result-url');
    await expect(resultUrl).toBeVisible();
    const resultTitle = firstResult.locator('.search-page-result-title');
    await expect(resultTitle).toBeVisible();
    const resultDesc = firstResult.locator('.search-page-result-desc');
    await expect(resultDesc).toBeVisible();
  });

  test('search page results show hero images when available', async ({ page }) => {
    await page.goto('/search/?q=makezurich');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const firstResult = page.locator('.search-page-result').first();
    await expect(firstResult).toBeVisible();
    const hero = firstResult.locator('.search-page-result-hero');
    await expect(hero).toBeVisible();
    const img = hero.locator('img');
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('/');
  });

  test('search page navigates from SearchBar on Enter', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('#search-bar-input');
    await searchInput.click();
    await searchInput.pressSequentially('makezurich', { delay: 30 });
    await searchInput.press('Enter');
    await page.waitForURL('**/search/**', { timeout: 5000 });
    expect(page.url()).toContain('search');
    expect(page.url()).toContain('q=makezurich');
    const searchPageInput = page.locator('#search-input');
    await expect(searchPageInput).toHaveValue('makezurich');
  });
});
