import { test, expect } from '@playwright/test';

test.describe('Projects listing', () => {
  test('loads with heading', async ({ page }) => {
    await page.goto('/projects/');
    await expect(page.locator('main h1')).toHaveText('Projects');
  });

  test('displays project cards', async ({ page }) => {
    await page.goto('/projects/');
    const cards = page.locator('.card-grid .card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('each card links to a project page', async ({ page }) => {
    await page.goto('/projects/');
    const firstCard = page.locator('.card-grid .card').first();
    await expect(firstCard).toHaveAttribute('href', /\/projects\//);
  });
});

test.describe('Project pages', () => {
  test('renders Spikey project', async ({ page }) => {
    await page.goto('/projects/spikey/');
    await expect(page.locator('article h1')).toHaveText('Spikey');
  });

  test('renders MakeZurich Pakman project', async ({ page }) => {
    await page.goto('/projects/makezurich-pakman/');
    await expect(page.locator('article h1')).toContainText('PakMan');
  });

  test('project has article content', async ({ page }) => {
    await page.goto('/projects/spikey/');
    await expect(page.locator('article')).toBeVisible();
  });

  test('project with repo field shows GitHub link', async ({ page }) => {
    await page.goto('/projects/spikey/');
    const githubLink = page.locator('a[href*="github.com"]').first();
    await expect(githubLink).toBeVisible();
  });
});
