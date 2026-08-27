import { test, expect } from '@playwright/test';

test.describe('About page backstage.io easter egg', () => {
  test('backstage icon exists on about page', async ({ page }) => {
    await page.goto('/about');
    const icon = page.locator('#backstage-icon');
    await expect(icon).toBeAttached();
  });

  test('backstage icon uses official logo', async ({ page }) => {
    await page.goto('/about');
    const icon = page.locator('#backstage-icon');
    const img = icon.locator('img');
    await expect(img).toBeAttached();
    const src = await img.getAttribute('src');
    expect(src).toBe('https://backstage.io/img/logo.svg');
  });

  test('backstage icon is positioned fixed', async ({ page }) => {
    await page.goto('/about');
    const icon = page.locator('#backstage-icon');
    const position = await icon.evaluate(function(el: HTMLElement) {
      return window.getComputedStyle(el).position;
    });
    expect(position).toBe('fixed');
  });

  test('backstage icon has pointer cursor', async ({ page }) => {
    await page.goto('/about');
    const icon = page.locator('#backstage-icon');
    const cursor = await icon.evaluate(function(el: HTMLElement) {
      return window.getComputedStyle(el).cursor;
    });
    expect(cursor).toBe('pointer');
  });

  test('backstage icon bounces around screen', async ({ page }) => {
    await page.goto('/about');
    const icon = page.locator('#backstage-icon');
    
    const pos1 = await icon.evaluate(function(el: HTMLElement) {
      return { left: el.style.left, top: el.style.top };
    });
    
    await page.waitForTimeout(500);
    
    const pos2 = await icon.evaluate(function(el: HTMLElement) {
      return { left: el.style.left, top: el.style.top };
    });
    
    expect(pos1.left).not.toBe(pos2.left);
    expect(pos1.top).not.toBe(pos2.top);
  });

  test('clicking backstage icon opens backstage.io', async ({ page }) => {
    await page.goto('/about');
    
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.evaluate(function() {
        document.getElementById('backstage-icon')?.click();
      })
    ]);
    
    expect(newPage.url()).toContain('backstage.io');
    await newPage.close();
  });

  test('backstage icon expands on click', async ({ page }) => {
    await page.goto('/about');
    
    await page.evaluate(function() {
      document.getElementById('backstage-icon')?.click();
    });
    
    await page.waitForTimeout(100);
    const icon = page.locator('#backstage-icon');
    await expect(icon).toHaveClass(/expanded/);
  });

  test('backstage icon returns to bouncing after click', async ({ page }) => {
    await page.goto('/about');
    
    await page.evaluate(function() {
      document.getElementById('backstage-icon')?.click();
    });
    
    await page.waitForTimeout(600);
    const icon = page.locator('#backstage-icon');
    await expect(icon).not.toHaveClass(/expanded/);
  });
});
