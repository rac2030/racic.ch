import { test, expect } from '@playwright/test';

test.describe('Yoda Easter Egg', () => {
  test('footer has "May the source be with you" link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#source-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('May the source be with you');
  });

  test('source link points to GitHub repo', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#source-link');
    const href = await link.getAttribute('href');
    expect(href).toBe('https://github.com/rac2030/racic.ch');
  });

  test('Yoda hologram exists in DOM', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const yoda = page.locator('#yoda-hologram');
    await expect(yoda).toBeAttached();
  });

  test('Yoda hologram is hidden by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const yoda = page.locator('#yoda-hologram');
    await expect(yoda).not.toBeVisible();
  });

  test('hovering source link shows Yoda hologram', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#source-link');
    await link.hover();
    const yoda = page.locator('#yoda-hologram');
    await expect(yoda).toBeVisible();
  });

  test('Yoda has speech bubble with correct text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#source-link');
    await link.hover();
    const speech = page.locator('#yoda-hologram .yoda-speech');
    await expect(speech).toBeVisible();
    await expect(speech).toContainText('Explore the source, you must');
  });

  test('Yoda speech has open source message', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#source-link');
    await link.hover();
    const speech = page.locator('#yoda-hologram .yoda-speech');
    await expect(speech).toContainText('open');
  });

  test('Yoda figure has SVG', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#source-link');
    await link.hover();
    const svg = page.locator('#yoda-hologram .yoda-figure svg');
    await expect(svg).toBeVisible();
  });

  test('moving away from link hides Yoda', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#source-link');
    await link.hover();
    const yoda = page.locator('#yoda-hologram');
    await expect(yoda).toBeVisible();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await expect(yoda).not.toBeVisible();
  });
});
