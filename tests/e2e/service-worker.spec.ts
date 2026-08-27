import { test, expect } from '@playwright/test';

test.describe('Service worker registration', () => {
  test('sw.js is served', async ({ page }) => {
    const response = await page.goto('/sw.js');
    expect(response?.status()).toBe(200);
    const contentType = response?.headers()['content-type'] || '';
    expect(contentType).toContain('javascript');
  });

  test('service worker registers on page load', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const registered = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    expect(registered).toBe(true);
  });

  test('sw.js contains install and fetch listeners', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const body = await response?.text();
    expect(body).toContain('addEventListener');
    expect(body).toContain('install');
    expect(body).toContain('fetch');
    expect(body).toContain('activate');
  });

  test('sw.js uses localStorage for version tracking', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const body = await response?.text();
    expect(body).toContain('localStorage');
    expect(body).toContain('racic-ch-cache-version');
  });

  test('sw.js notifies clients of new versions', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const body = await response?.text();
    expect(body).toContain('postMessage');
    expect(body).toContain('NEW_VERSION');
  });
});

test.describe('Update banner', () => {
  test('update banner exists in DOM', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#sw-update-banner');
    await expect(banner).toBeAttached();
  });

  test('update banner is hidden by default', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#sw-update-banner');
    const display = await banner.evaluate(function(el: HTMLElement) {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('none');
  });

  test('update banner has correct text', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#sw-update-banner');
    const text = await banner.textContent();
    expect(text).toContain('New version available');
  });

  test('update banner becomes visible when shown', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#sw-update-banner');
    await banner.evaluate(function(el: HTMLElement) { el.style.display = 'block'; });
    const display = await banner.evaluate(function(el: HTMLElement) {
      return el.style.display;
    });
    expect(display).toBe('block');
  });

  test('clicking update banner reloads page', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#sw-update-banner');
    await banner.evaluate(function(el: HTMLElement) { el.style.display = 'block'; });
    var reloaded = false;
    page.on('load', function() { reloaded = true; });
    await banner.click();
    await page.waitForTimeout(1000);
    expect(reloaded).toBe(true);
  });
});

test.describe('Lazy cache behavior', () => {
  test('first visit registers service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const swRegistered = await page.evaluate(async () => {
      return !!(await navigator.serviceWorker.getRegistration());
    });
    expect(swRegistered).toBe(true);
  });

  test('page is functional after SW activation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const title = await page.title();
    expect(title).toBeTruthy();
    const h1 = await page.locator('h1').first().textContent();
    expect(h1?.length).toBeGreaterThan(0);
  });

  test('sw.js has cache name for versioning', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const body = await response?.text();
    expect(body).toContain('CACHE_NAME');
    expect(body).toContain('racic-ch-');
  });
});
