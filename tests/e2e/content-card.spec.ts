import { test, expect } from '@playwright/test';

function bgAlpha(rgba: string): number {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return 1;
  const parts = match[1].split(',').map((s) => parseFloat(s.trim()));
  return parts.length === 4 ? parts[3] : 1;
}

test.describe('Content card backing', () => {
  test('article wraps title and body in exactly one backed card', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const outcome = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('article .content-card'));
      const card = cards[0] as HTMLElement | undefined;
      const h1 = document.querySelector('article .article-header h1');
      if (!card || !h1) {
        return { count: cards.length, cardFound: Boolean(card), titleFound: Boolean(h1) };
      }
      const c = card.getBoundingClientRect();
      const h = h1.getBoundingClientRect();
      return {
        count: cards.length,
        cardFound: true,
        titleFound: true,
        bg: getComputedStyle(card).backgroundColor,
        containsTitle: c.top <= h.top + 1 && c.bottom >= h.bottom - 1 && c.left <= h.left + 1 && c.right >= h.right - 1,
      };
    });
    expect(outcome.cardFound).toBe(true);
    expect(outcome.titleFound).toBe(true);
    expect(outcome.count).toBe(1);
    expect(bgAlpha(outcome.bg)).toBeGreaterThan(0);
    expect(outcome.containsTitle).toBe(true);
  });

  test('article body has no nested double panel inside the card', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const bg = await page.evaluate(() => {
      const art = document.querySelector('.article-content');
      return art ? getComputedStyle(art).backgroundColor : '';
    });
    expect(bgAlpha(bg)).toBe(0);
  });

  test('list and static pages back their content in a card', async ({ page }) => {
    const urls = ['/blog/', '/projects/', '/wiki/', '/bookmarks/', '/about/', '/timeline/'];
    for (const url of urls) {
      await page.goto(url);
      const outcome = await page.evaluate(() => {
        const card = document.querySelector('.section > .container.content-card, .section > .container.content-width.content-card');
        if (!card) return { found: false };
        return { found: true, bg: getComputedStyle(card).backgroundColor };
      });
      expect(outcome.found, `expected .content-card on ${url}`).toBe(true);
      expect(bgAlpha(outcome.bg), `panel backing on ${url}`).toBeGreaterThan(0);
    }
  });

  test('home hero content sits on a backed panel', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => {
      const hero = document.querySelector('.hero-content');
      return hero ? getComputedStyle(hero).backgroundColor : '';
    });
    expect(bgAlpha(bg)).toBeGreaterThan(0);
  });

  test('card hugs the content column: centered, narrower than viewport, ends above footer', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/wiki/');
    const box = await page.evaluate(() => {
      const card = document.querySelector('.content-card');
      if (!card) return null;
      const r = card.getBoundingClientRect();
      return {
        left: Math.round(r.left),
        width: Math.round(r.width),
        innerWidth: window.innerWidth,
        bottom: Math.round(r.bottom),
        docHeight: document.documentElement.scrollHeight,
        rightMargin: Math.round(window.innerWidth - r.right),
      };
    });
    expect(box).not.toBeNull();
    // centered (equal side gaps)
    expect(Math.abs(box!.left - box!.rightMargin)).toBeLessThan(20);
    // narrower than the viewport -> a card, not a full-width flat rectangle
    expect(box!.width).toBeLessThan(box!.innerWidth - 100);
    // ends above the footer, not a full-page slab
    expect(box!.bottom).toBeLessThan(box!.docHeight - 30);
  });

  test('no horizontal overflow on mobile article and list pages', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const url of ['/blog/hosting-hugo-site-firebase/', '/wiki/']) {
      await page.goto(url);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `horizontal overflow on ${url}`).toBeLessThanOrEqual(0);
    }
  });

  test('article card is resizable via the drag handles', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const card = page.locator('article .content-card');
    await expect(card).toBeVisible();
    const before = (await card.boundingBox())!;
    const handle = page.locator('.resizer-right');
    const hb = (await handle.boundingBox())!;
    const hy = hb.y + Math.min(hb.height / 2, 60);
    await page.mouse.move(hb.x + hb.width / 2, hy);
    await page.mouse.down();
    await page.mouse.move(hb.x + hb.width / 2 + 120, hy, { steps: 10 });
    await page.mouse.up();
    const after = (await card.boundingBox())!;
    expect(after.width).toBeGreaterThan(before.width + 80);
  });
});