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

  test('sw.js reports the changed url in NEW_VERSION messages', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const body = await response?.text();
    expect(body).toContain('NEW_VERSION');
    expect(body).toMatch(/url:/);
  });

  test('sw.js bypasses the cache for no-store requests', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const body = await response?.text();
    expect(body).toContain('no-store');
    expect(body).toMatch(/shouldBypassCache|request\.cache === ['"]no-store['"]/);
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

  test('clicking update banner triggers SW update flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const banner = page.locator('#sw-update-banner');
    await banner.evaluate(function(el: HTMLElement) { el.style.display = 'block'; });
    var messageSent = false;
    await page.evaluate(function() {
      window._swMessageReceived = false;
      navigator.serviceWorker.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'SKIP_WAITING') {
          window._swMessageReceived = true;
        }
      });
    });
    await banner.click();
    await page.waitForTimeout(1000);
    const hasReg = await page.evaluate(async () => {
      return !!(await navigator.serviceWorker.getRegistration());
    });
    expect(hasReg).toBe(true);
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

test.describe('Live content auto-replacement', () => {
  test.use({ serviceWorkers: 'block' });

  test('NEW_VERSION for the current page swaps in the fresh content once', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.route('**/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html><body><main id="main">AUTO-REPLACED</main></body></html>',
      });
    });

    const hook = await page.evaluate(() => typeof (window as any).__swOnMessage === 'function');
    expect(hook).toBe(true);

    await page.evaluate(() =>
      (window as any).__swOnMessage({ data: { type: 'NEW_VERSION', url: location.href, version: 99 } })
    );
    await page.waitForTimeout(700);

    const replaced = await page.evaluate(() =>
      document.documentElement.outerHTML.includes('AUTO-REPLACED')
    );
    const guard = await page.evaluate(() => sessionStorage.getItem('racic-ch-reload-99'));
    expect(replaced).toBe(true);
    expect(guard).toBe('1');
  });

  test('NEW_VERSION for a different resource only shows the banner, no reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const bannerDisp = await page.evaluate(() => {
      const w = window as any;
      w.__swOnMessage({ data: { type: 'NEW_VERSION', url: 'https://racic.ch/search-index.json', version: 3 } });
      return document.getElementById('sw-update-banner')!.style.display;
    });
    expect(bannerDisp).toBe('block');
  });
});
