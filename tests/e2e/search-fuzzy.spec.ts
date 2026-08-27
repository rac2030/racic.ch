import { test, expect } from '@playwright/test';

test.describe('Fuzzy search', () => {
  test('fuzzy results appear when no exact matches exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('#search-bar-input');
    await searchInput.click();
    await searchInput.pressSequentially('ardno', { delay: 50 });
    const dropdown = page.locator('#search-bar-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const text = await dropdown.textContent();
    expect(text).toContain('Did you mean?');
    expect(text).toContain('Arduino');
  });

  test('exact results appear above fuzzy results', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('#search-bar-input');
    await searchInput.click();
    await searchInput.pressSequentially('makezurich', { delay: 50 });
    const dropdown = page.locator('#search-bar-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const html = await dropdown.innerHTML();
    const similarIdx = html.indexOf('Similar results');
    const makezurichIdx = html.indexOf('MakeZurich');
    expect(makezurichIdx).toBeGreaterThan(-1);
    if (similarIdx > -1) {
      expect(makezurichIdx).toBeLessThan(similarIdx);
    }
  });

  test('fuzzy results are deduplicated against exact results', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('#search-bar-input');
    await searchInput.click();
    await searchInput.pressSequentially('hugo', { delay: 50 });
    const dropdown = page.locator('#search-bar-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const html = await dropdown.innerHTML();
    const similarIdx = html.indexOf('Similar results');
    if (similarIdx > -1) {
      const similarSection = html.substring(similarIdx);
      expect(similarSection).not.toContain('Hosting a Hugo Site');
    }
  });

  test('404 page uses SearchLib for search', async ({ page }) => {
    await page.goto('/404.html');
    await page.waitForLoadState('networkidle');
    const searchResults = page.locator('#search-results');
    await expect(searchResults).toBeAttached({ timeout: 5000 });
    const hasSearchLib = await page.evaluate(() => typeof SearchLib !== 'undefined');
    expect(hasSearchLib).toBe(true);
  });
});
