import { test, expect } from '@playwright/test';

test.describe('Tags pages', () => {
  test('tag index page loads with tags', async ({ page }) => {
    await page.goto('/tags/');
    await expect(page.locator('main h1')).toContainText('Tags');
    const tags = page.locator('.tags-page .tag');
    const count = await tags.count();
    expect(count).toBeGreaterThan(0);
  });

  test('individual tag page shows filtered posts', async ({ page }) => {
    await page.goto('/tags/hugo/');
    const cards = page.locator('.card-grid .card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('About page', () => {
  test('loads with heading and content', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('main h1')).toHaveText('About');
    const content = page.locator('.about-content');
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(100);
  });

  test('has 3 social links', async ({ page }) => {
    await page.goto('/about/');
    const links = page.locator('.social-links a');
    await expect(links).toHaveCount(3);
    await expect(page.locator('.social-links a[href*="github.com"]')).toBeVisible();
  });
});

test.describe('RSS feed', () => {
  test('returns XML with site title and posts', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('Michel Racic');
    expect(body).toContain('<item>');
    expect(body).toContain('Hosting a Hugo Site with Firebase');
  });
});

test.describe('404 page', () => {
  test('shows 404 for non-existent page', async ({ page }) => {
    const response = await page.goto('/non-existent-page/');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Sitemap', () => {
  test('sitemap index exists', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml');
    expect(response?.status()).toBe(200);
  });

  test('sitemap contains site URLs', async ({ page }) => {
    const response = await page.goto('/sitemap-0.xml');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('racic.ch');
  });
});

test.describe('Layout and theme', () => {
  test('every page has header, footer, and background', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#bg')).toBeAttached();
    await expect(page.locator('#overlay')).toBeAttached();
    await expect(page.locator('#wrapper')).toBeAttached();
    await expect(page.locator('.site-header')).toBeVisible();
    await expect(page.locator('.site-logo')).toHaveText('Michel Racic');
    await expect(page.locator('.site-footer')).toBeVisible();
    await expect(page.locator('.footer-copy').first()).toContainText('Michel Racic');
    await expect(page.locator('.header-social a')).toHaveCount(3);
  });
  test('footer shows version link to GitHub releases', async ({ page }) => {
    await page.goto('/');
    const versionLink = page.locator('#footer-version');
    await expect(versionLink).toBeVisible();
    const text = await versionLink.textContent();
    expect(text).toMatch(/v\d+\.\d+\.\d+/);
    const href = await versionLink.getAttribute('href');
    expect(href).toMatch(/github\.com\/rac2030\/racic\.ch\/releases\/tag\/v\d+\.\d+\.\d+/);
  });
});

test.describe('Release notes modal', () => {
  test.use({ serviceWorkers: 'block' });

  const RELEASES_PATTERN = /^https:\/\/api\.github\.com\/repos\/rac2030\/racic\.ch\/releases(?:\?.*)?$/;

  const mockReleases = [
    { tag_name: 'v1.5.0', name: 'v1.5.0', published_at: '2026-09-01T12:00:00Z', html_url: 'https://github.com/rac2030/racic.ch/releases/tag/v1.5.0', body: '### Added\n- New feature one ([commit](https://github.com/rac2030/racic.ch/commit/abc123))\n- Fixes `cache` bug' },
    { tag_name: 'v1.4.0', name: 'v1.4.0', published_at: '2026-08-15T12:00:00Z', html_url: 'https://github.com/rac2030/racic.ch/releases/tag/v1.4.0', body: '### Fixed\n- Bugfix two' },
    { tag_name: 'v1.3.0', name: 'v1.3.0', published_at: '2026-07-20T12:00:00Z', html_url: 'https://github.com/rac2030/racic.ch/releases/tag/v1.3.0', body: 'Notes for three' },
    { tag_name: 'v1.2.0', name: 'v1.2.0', published_at: '2026-06-10T12:00:00Z', html_url: 'https://github.com/rac2030/racic.ch/releases/tag/v1.2.0', body: 'Notes for four' },
    { tag_name: 'v1.1.0', name: 'v1.1.0', published_at: '2026-05-05T12:00:00Z', html_url: 'https://github.com/rac2030/racic.ch/releases/tag/v1.1.0', body: 'Notes for five' },
  ];

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.route(RELEASES_PATTERN, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockReleases),
      });
    });
    await page.goto('/');
    await page.locator('#footer-version').click();
    await expect(page.locator('#release-modal')).toBeVisible();
    await page.waitForTimeout(300);
  });

  test('dialog is fully within the viewport and centered', async ({ page }) => {
    const info = await page.evaluate(() => {
      const dialog = document.querySelector('.release-dialog');
      const r = dialog.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, vw: innerWidth, vh: innerHeight };
    });
    expect(info.top).toBeGreaterThanOrEqual(10);
    expect(info.bottom).toBeLessThanOrEqual(info.vh - 10);
    expect(info.left).toBeGreaterThanOrEqual(10);
    expect(info.right).toBeLessThanOrEqual(info.vw - 10);
    expect(Math.abs((info.left + info.right) / 2 - info.vw / 2)).toBeLessThan(20);
    expect(Math.abs((info.top + info.bottom) / 2 - info.vh / 2)).toBeLessThan(20);
  });

  test('modal is a direct child of body (not trapped in the footer)', async ({ page }) => {
    const parentOK = await page.evaluate(() => {
      const m = document.getElementById('release-modal');
      const closestFooter = m.closest('.site-footer');
      return {
        directChildOfBody: m.parentElement === document.body,
        ancestorFooter: closestFooter !== null,
      };
    });
    expect(parentOK.directChildOfBody).toBe(true);
    expect(parentOK.ancestorFooter).toBe(false);
  });

  test('clicking version opens modal listing past 5 releases', async ({ page }) => {
    const items = page.locator('.release-item');
    await expect(items).toHaveCount(5);
    await expect(page.locator('.release-title', { hasText: 'v1.5.0' })).toBeVisible();
  });

  test('each version header links to its release notes entry on GitHub', async ({ page }) => {
    const firstTitle = page.locator('.release-item').first().locator('.release-title a');
    await expect(firstTitle).toHaveAttribute('href', 'https://github.com/rac2030/racic.ch/releases/tag/v1.5.0');
    await expect(firstTitle).toHaveAttribute('target', '_blank');
    const links = page.locator('.release-title a');
    expect(await links.count()).toBe(5);
  });

  test('shows a more link to the GitHub releases page', async ({ page }) => {
    const moreLink = page.locator('#release-all-link');
    await expect(moreLink).toBeVisible();
    await expect(moreLink).toHaveAttribute('href', 'https://github.com/rac2030/racic.ch/releases');
    await expect(moreLink).toHaveAttribute('target', '_blank');
  });

  test('release body is rendered as markdown', async ({ page }) => {
    const notes = page.locator('.release-item').first().locator('.release-notes');
    await expect(notes).toContainText('Added');
    await expect(notes.locator('h3', { hasText: 'Added' })).toBeVisible();
    await expect(notes.locator('ul li', { hasText: 'New feature one' })).toBeVisible();
    const link = notes.locator('a[href="https://github.com/rac2030/racic.ch/commit/abc123"]');
    await expect(link).toBeVisible();
    await expect(notes.locator('code', { hasText: 'cache' })).toBeVisible();
  });

  test('markdown content is left-aligned', async ({ page }) => {
    const align = await page.evaluate(() => {
      const n = document.querySelector('.release-notes');
      return getComputedStyle(n).textAlign;
    });
    expect(align).toBe('left');
  });

  test('dragging the header moves the dialog', async ({ page }) => {
    const before = await page.locator('.release-dialog').boundingBox();
    const handle = await page.locator('#release-drag-handle').boundingBox();
    await page.mouse.move(handle.x + 60, handle.y + 10);
    await page.mouse.down();
    await page.mouse.move(handle.x + 180, handle.y + 110, { steps: 5 });
    await page.mouse.up();
    const after = await page.locator('.release-dialog').boundingBox();
    expect(after.x).toBeGreaterThan(before.x + 50);
    expect(after.y).toBeGreaterThan(before.y + 50);
  });

  test('resizing via the se handle changes size', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.waitForTimeout(100);
    const info = await page.evaluate(() => {
      const dialog = document.querySelector('.release-dialog');
      const dialogRect = dialog.getBoundingClientRect();
      const se = document.querySelector('.rs-se');
      const seRect = se.getBoundingClientRect();
      return {
        dw: dialogRect.width, dh: dialogRect.height,
        sx: seRect.x + seRect.width / 2, sy: seRect.y + seRect.height / 2,
        vw: innerWidth, vh: innerHeight,
      };
    });
    const roomRight = info.vw - info.sx - 20;
    const roomDown = info.vh - info.sy - 20;
    const growW = Math.min(120, roomRight);
    const growH = Math.min(60, roomDown);
    if (growW < 30 || growH < 20) { test.skip(); return; }
    await page.mouse.move(info.sx, info.sy);
    await page.mouse.down();
    await page.mouse.move(info.sx + growW, info.sy + growH, { steps: 5 });
    await page.mouse.up();
    const after = await page.evaluate(() => {
      const d = document.querySelector('.release-dialog').getBoundingClientRect();
      return { w: d.width, h: d.height };
    });
    expect(after.w).toBeGreaterThan(info.dw + 20);
    expect(after.h).toBeGreaterThan(info.dh + 10);
  });

  test('close button closes the modal', async ({ page }) => {
    await page.locator('#release-modal-close').click();
    await expect(page.locator('#release-modal')).toBeHidden();
  });

  test('Escape key closes the modal', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.locator('#release-modal')).toBeHidden();
  });

  test('clicking the backdrop closes the modal', async ({ page }) => {
    await page.locator('#release-modal-backdrop').click({ position: { x: 1, y: 1 } });
    await expect(page.locator('#release-modal')).toBeHidden();
  });
});

test.describe('Release notes modal - loading state', () => {
  test.use({ serviceWorkers: 'block' });

  const RELEASES_PATTERN = /^https:\/\/api\.github\.com\/repos\/rac2030\/racic\.ch\/releases(?:\?.*)?$/;
  const mock = [{ tag_name: 'v1.0.0', name: 'v1.0.0', published_at: '2026-09-04T12:00:00Z', html_url: 'https://github.com/rac2030/racic.ch/releases/tag/v1.0.0', body: 'Body' }];

  test('dialog is centered and in-viewport while content is still loading', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    let release: (v: unknown) => void;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route(RELEASES_PATTERN, async (route) => {
      await gate;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock) });
    });
    await page.goto('/');
    await page.locator('#footer-version').click();
    await expect(page.locator('#release-modal')).toBeVisible();
    await page.waitForTimeout(150);
    const info = await page.evaluate(() => {
      const dialog = document.querySelector('.release-dialog');
      const r = dialog.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, vw: innerWidth, vh: innerHeight };
    });
    expect(info.top).toBeGreaterThanOrEqual(10);
    expect(info.bottom).toBeLessThanOrEqual(info.vh - 10);
    expect(info.left).toBeGreaterThanOrEqual(10);
    expect(info.right).toBeLessThanOrEqual(info.vw - 10);
    expect(Math.abs((info.left + info.right) / 2 - info.vw / 2)).toBeLessThan(20);
    expect(Math.abs((info.top + info.bottom) / 2 - info.vh / 2)).toBeLessThan(20);
    release!(true);
  });
});

test.describe('Responsive behavior', () => {
  test('mobile menu button hidden on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('.mobile-menu-btn')).toBeHidden();
  });

  test('mobile menu button visible and toggles on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('.mobile-menu-btn')).toBeVisible();
    const nav = page.locator('.nav-links');
    await expect(nav).toBeHidden();
    await page.click('.mobile-menu-btn');
    await expect(nav).toHaveClass(/open/);
  });
});

test.describe('Content integrity', () => {
  test('blog post links are unique', async ({ page }) => {
    await page.goto('/blog/');
    const links = page.locator('.card-grid .card');
    const hrefs: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      hrefs.push((await links.nth(i).getAttribute('href')) || '');
    }
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  test('project links are unique', async ({ page }) => {
    await page.goto('/projects/');
    const links = page.locator('.card-grid .card');
    const hrefs: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      hrefs.push((await links.nth(i).getAttribute('href')) || '');
    }
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  test('every blog card links to a valid page', async ({ page }) => {
    const response = await page.goto('/blog/');
    expect(response?.status()).toBe(200);
    const hrefs = await page.locator('.card-grid .card').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean),
    );
    for (const href of hrefs) {
      const res = await page.goto(href!);
      expect(res?.status()).toBe(200);
    }
  });

  test('every project card links to a valid page', async ({ page }) => {
    const response = await page.goto('/projects/');
    expect(response?.status()).toBe(200);
    const hrefs = await page.locator('.card-grid .card').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean),
    );
    for (const href of hrefs) {
      const res = await page.goto(href!);
      expect(res?.status()).toBe(200);
    }
  });
});
