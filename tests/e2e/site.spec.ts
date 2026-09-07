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

  test('social links wrap inside the card on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 1200 });
    await page.goto('/about/');
    const overflow = await page.evaluate(() => {
      const card = document.querySelector('.about-content')?.getBoundingClientRect();
      const links = [...document.querySelectorAll('.social-links a')];
      if (!card) return { error: 'no about-content' };
      const maxRight = Math.max(...links.map((a) => a.getBoundingClientRect().right));
      const docOverflow = document.documentElement.scrollWidth - window.innerWidth;
      return { cardRight: card.right, maxLinkRight: maxRight, docOverflow, linkCount: links.length };
    });
    expect(overflow.linkCount).toBe(3);
    expect(overflow.maxLinkRight).toBeLessThanOrEqual(overflow.cardRight + 1);
    expect(overflow.docOverflow).toBeLessThanOrEqual(0);
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

test.describe('Release notes modal - freshness on reopen', () => {
  test.use({ serviceWorkers: 'block' });

  const RELEASES_PATTERN = /^https:\/\/api\.github\.com\/repos\/rac2030\/racic\.ch\/releases(?:\?.*)?$/;

  const make = (tag: string, body: string) => [{
    tag_name: tag, name: tag, published_at: '2026-09-05T12:00:00Z',
    html_url: `https://github.com/rac2030/racic.ch/releases/tag/${tag}`, body,
  }];

  test('reopening the modal fetches the latest releases instead of stale cached data', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    let current = make('v1.0.0', '**OLD NOTES**');
    await page.route(RELEASES_PATTERN, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(current) });
    });

    await page.goto('/');
    await page.locator('#footer-version').click();
    await expect(page.locator('.release-title', { hasText: 'v1.0.0' })).toBeVisible();
    await expect(page.locator('.release-notes')).toContainText('OLD NOTES');

    await page.locator('#release-modal-close').click();
    await expect(page.locator('#release-modal')).toBeHidden();

    current = make('v2.0.0', '**FRESH NOTES**');
    await page.locator('#footer-version').click();
    await expect(page.locator('.release-title', { hasText: 'v2.0.0' })).toBeVisible();
    await expect(page.locator('.release-notes')).toContainText('FRESH NOTES');
    await expect(page.locator('.release-title', { hasText: 'v1.0.0' })).toHaveCount(0);
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

test.describe('Timeline page', () => {
  test('loads with heading and all article entries', async ({ page }) => {
    await page.goto('/timeline/');
    await expect(page.locator('main h1')).toContainText('Timeline');
    const entries = page.locator('main a[href*="/blog/"], main a[href*="/projects/"], main a[href*="/wiki/"]');
    const count = await entries.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('homepage "More changes" link points to timeline', async ({ page }) => {
    await page.goto('/');
    const moreLink = page.locator('.recent-more');
    await expect(moreLink).toBeVisible();
    await expect(moreLink).toHaveAttribute('href', '/timeline');
  });

  test('homepage shows at most 3 recent items', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.recent-item');
    const count = await items.count();
    expect(count).toBeLessThanOrEqual(3);
  });

  test('timeline entries link to valid pages', async ({ page }) => {
    await page.goto('/timeline/');
    const hrefs = await page.locator('main a[href*="/blog/"], main a[href*="/projects/"], main a[href*="/wiki/"]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    const res = await page.goto(hrefs![0]);
    expect(res?.status()).toBe(200);
  });

  test('homepage recent items show last-changed date at top-right', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.recent-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    const dates = page.locator('.recent-item-date');
    expect(await dates.count()).toBe(count);
    const positions = await dates.evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el);
        const box = el.closest('.recent-item').getBoundingClientRect();
        const r = el.getBoundingClientRect();
        return {
          inTopRow: !!el.closest('.recent-item-top'),
          nearTopRight: box.right - r.right < 30 && r.top < box.top + box.height * 0.5,
          nonEmpty: (el.textContent || '').trim().length > 0,
          inHero: !!el.closest('section.hero'),
        };
      }),
    );
    for (const p of positions) {
      expect(p.inTopRow).toBe(true);
      expect(p.nearTopRight).toBe(true);
      expect(p.nonEmpty).toBe(true);
      expect(p.inHero).toBe(true);
    }
  });

  test('timeline cards show git last-changed date at top-right', async ({ page }) => {
    await page.goto('/timeline/');
    const card = page.locator('main .timeline-entry:not([hidden]) .timeline-card').first();
    await expect(card).toBeVisible();
    const badge = card.locator('.timeline-date');
    await expect(badge).toBeVisible();
    const pos = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      const box = el.closest('.timeline-card').getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return {
        position: s.position,
        nearTop: r.top - box.top < 20,
        nearRight: box.right - r.right < 30,
      };
    });
    expect(pos.position).toBe('absolute');
    expect(pos.nearTop).toBe(true);
    expect(pos.nearRight).toBe(true);
  });

  test('timeline cards mark the date as last updated and show the commit message at the bottom', async ({ page }) => {
    await page.goto('/timeline/');
    const card = page.locator('main .timeline-entry:not([hidden]) .timeline-card').first();
    await expect(card.locator('.timeline-date-label')).toHaveText('Last updated');
    const commit = card.locator('.timeline-commit');
    await expect(commit).toBeVisible();
    expect((await commit.textContent())!.trim().length).toBeGreaterThan(0);
    const pos = await commit.evaluate((el) => {
      const box = el.closest('.timeline-card').getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { isLastChild: el === el.closest('.timeline-card').lastElementChild, nearBottom: box.bottom - r.bottom < 2 };
    });
    expect(pos.isLastChild).toBe(true);
    expect(pos.nearBottom).toBe(true);
  });

  test('timeline card date matches article page last-changed date', async ({ page }) => {
    await page.goto('/timeline/');
    const card = page.locator('main .timeline-entry:not([hidden]) .timeline-card').first();
    const href = await card.locator('.timeline-card-title').getAttribute('href');
    const cardDate = await card.locator('.timeline-date').getAttribute('datetime');
    const res = await page.goto(href!);
    expect(res?.status()).toBe(200);
    const articleDates = await page.locator('.article-meta time').evaluateAll((els) =>
      els.map((e) => e.getAttribute('datetime')).filter(Boolean),
    );
    expect(articleDates.length).toBeGreaterThan(0);
    const latestOnArticle = articleDates
      .map((d) => new Date(d!).getTime())
      .sort((a, b) => b - a)[0];
    expect(new Date(cardDate!).getTime()).toBe(latestOnArticle);
  });

  test('timeline renders a git-graph rail with one commit node per card', async ({ page }) => {
    await page.goto('/timeline/');
    const entries = page.locator('.timeline-entry:not([hidden])');
    const total = await entries.count();
    expect(total).toBeGreaterThan(3);
    const rails = page.locator('main .timeline-entry:not([hidden]) .timeline-rail');
    const dots = page.locator('main .timeline-entry:not([hidden]) .rail-dot');
    expect(await rails.count()).toBe(total);
    expect(await dots.count()).toBe(total);

    const nodeInfo = await dots.first().evaluate((el) => {
      const list = document.getElementById('timeline-list');
      const rail = el.closest('.timeline-rail');
      const spine = getComputedStyle(list, '::before');
      const railSpine = getComputedStyle(rail, '::before');
      const outline = getComputedStyle(rail, '::after');
      const listR = list.getBoundingClientRect();
      const dotR = el.getBoundingClientRect();
      const dotCenter = dotR.x + dotR.width / 2;
      const spineCenter = listR.x + parseFloat(spine.left) + parseFloat(spine.marginLeft) + parseFloat(spine.width) / 2;
      const listBottom = listR.y + listR.height;
      return {
        centeredOnLine: Math.abs(dotCenter - spineCenter) < 3,
        hasConnectLine: outline.content !== 'none' && parseFloat(outline.width) > 40,
        hasSpine: spine.content !== 'none' && parseFloat(spine.width) >= 2,
        continuousSingleSpine: railSpine.content === 'none',
        spineCoversList: parseFloat(spine.top) <= 40 && listBottom - parseFloat(spine.bottom) >= listR.y + listR.height - 40,
        isCommitLink: el.tagName === 'A' && (el.getAttribute('href') || '').includes('github.com/'),
      };
    });
    expect(nodeInfo.centeredOnLine).toBe(true);
    expect(nodeInfo.hasConnectLine).toBe(true);
    expect(nodeInfo.hasSpine).toBe(true);
    expect(nodeInfo.continuousSingleSpine).toBe(true);
    expect(nodeInfo.spineCoversList).toBe(true);
    expect(nodeInfo.isCommitLink).toBe(true);

    const h1Size = await page.evaluate(() => {
      const h1 = document.querySelector('main h1');
      return {
        text: h1.textContent.trim(),
        size: parseFloat(getComputedStyle(h1).fontSize),
        page404Size: getComputedStyle(h1).fontSize,
      };
    });
    expect(h1Size.text).toBe('Article Change Timeline');
    expect(h1Size.size).toBe(60);

    const hash = await page.locator('main .timeline-entry:not([hidden]) .timeline-commit-hash').first().textContent();
    expect(hash).toMatch(/^#[0-9a-f]{7}$/);

    const align = await page.evaluate(() => {
      const row = document.querySelector('.timeline-entry .timeline-rail--commit')!.closest('.timeline-entry');
      const rail = row!.querySelector('.timeline-rail')!;
      const railR = rail.getBoundingClientRect();
      const dot = row!.querySelector('.rail-dot')!.getBoundingClientRect();
      const foot = row!.querySelector('.timeline-commit')!.getBoundingClientRect();
      const line = row!.querySelector('.timeline-commit-line')!.getBoundingClientRect();
      const card = row!.querySelector('.timeline-card')!.getBoundingClientRect();
      const after = getComputedStyle(rail, '::after');
      const connector = railR.y + parseFloat(after.top) + parseFloat(after.height) / 2;
      const dotRow = dot.y + dot.height / 2;
      const footRow = foot.y + foot.height / 2;
      const lineRow = line.y + line.height / 2;
      return {
        drift: Math.abs(dotRow - footRow),
        connectorToDot: Math.abs(connector - dotRow),
        connectorToLine: Math.abs(connector - lineRow),
        lineAtCardEdge: Math.abs(card.x - line.x),
        lineW: line.width,
        lineH: line.height,
        order: [...row!.querySelector('.timeline-commit')!.children].map((c) => (c as HTMLElement).className.split(' ')[0]),
      };
    });
    expect(align.drift).toBeLessThanOrEqual(4);
    expect(align.connectorToDot).toBeLessThanOrEqual(4);
    expect(align.connectorToLine).toBeLessThanOrEqual(4);
    expect(align.lineAtCardEdge).toBeLessThanOrEqual(2);
    expect(align.lineW).toBeGreaterThan(15);
    expect(align.lineH).toBeLessThanOrEqual(3);
    expect(align.order).toEqual(['timeline-commit-line', 'timeline-commit-hash', 'timeline-commit-msg']);
  });

  test('timeline excludes the continuously-updated build log post', async ({ page }) => {
    await page.goto('/timeline/');
    await page.waitForTimeout(100);
    expect(await page.locator('main a[href="/blog/building-this-site-with-ai"]').count()).toBe(0);
    const body = await page.locator('main').textContent();
    expect(body).not.toContain('Building this Site with AI');
  });

  test('timeline scrolls with the browser scrollbar (no inner scroll container)', async ({ page }) => {
    await page.goto('/timeline/');
    const info = await page.evaluate(() => {
      const list = document.getElementById('timeline-list');
      const innerScrollables = Array.from(document.querySelectorAll('main *')).filter((el) => {
        const s = getComputedStyle(el);
        return (s.overflow === 'auto' || s.overflowY === 'auto' || s.overflowY === 'scroll');
      });
      return {
        pageScrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
        innerScrollableCount: innerScrollables.length,
        hasTimelineList: !!list,
      };
    });
    expect(info.hasTimelineList).toBe(true);
    expect(info.innerScrollableCount).toBe(0);
    expect(info.pageScrollHeight).toBeGreaterThan(info.viewportHeight);
  });

  test('timeline lazily reveals entries on scroll', async ({ page }) => {
    await page.goto('/timeline/');
    const initialVisible = await page.locator('.timeline-entry:not([hidden])').count();
    const initialTotal = await page.locator('.timeline-entry').count();
    expect(initialVisible).toBeLessThan(initialTotal);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    const revealed = await page.locator('.timeline-entry:not([hidden])').count();
    expect(revealed).toBeGreaterThan(initialVisible);
  });
});
