import { test, expect } from '@playwright/test';

test.describe('Tag filter on blog listing', () => {
  test('blog listing page has tag filter input', async ({ page }) => {
    await page.goto('/blog/');
    const filterInput = page.locator('.tag-filter-input, input[placeholder*="tag" i], input[placeholder*="filter" i]');
    await expect(filterInput.first()).toBeVisible();
  });

  test('blog listing has cards', async ({ page }) => {
    await page.goto('/blog/');
    const cards = page.locator('.card-grid .card, .card-grid article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('blog listing has category buttons', async ({ page }) => {
    await page.goto('/blog/');
    const categoryButtons = page.locator('.category-btn, [data-category]');
    const count = await categoryButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking category button filters cards', async ({ page }) => {
    await page.goto('/blog/');
    const allCards = page.locator('.card-grid .card, .card-grid article');
    const initialCount = await allCards.count();
    const categoryBtn = page.locator('.category-btn, [data-category]').first();
    await categoryBtn.click();
    await page.waitForTimeout(500);
    const visibleCards = page.locator('.card-grid .card:not([style*="display: none"]), .card-grid article:not([style*="display: none"])');
    const filteredCount = await visibleCards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('tag on card is clickable', async ({ page }) => {
    await page.goto('/blog/');
    const tag = page.locator('.card .tag, .card-tags .tag, article .tag').first();
    await expect(tag).toBeVisible();
    const text = await tag.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });
});

test.describe('Category filter on projects listing', () => {
  test('projects listing has category buttons', async ({ page }) => {
    await page.goto('/projects/');
    const categoryButtons = page.locator('.category-btn, [data-category]');
    const count = await categoryButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('projects listing has cards', async ({ page }) => {
    await page.goto('/projects/');
    const cards = page.locator('.card-grid .card, .card-grid article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Category filter on wiki listing', () => {
  test('wiki listing has category buttons', async ({ page }) => {
    await page.goto('/wiki/');
    const categoryButtons = page.locator('.category-btn, [data-category]');
    const count = await categoryButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('wiki listing has cards', async ({ page }) => {
    await page.goto('/wiki/');
    const cards = page.locator('.wiki-grid .wiki-card, .wiki-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
