import { test, expect } from '@playwright/test';

test.describe('About page backstage brick breaker easter egg', () => {
  test('game canvas exists on about page', async ({ page }) => {
    await page.goto('/about');
    const canvas = page.locator('#brick-breaker');
    await expect(canvas).toBeAttached();
  });

  test('start game button exists at the bottom of the viewport', async ({ page }) => {
    await page.goto('/about');
    const button = page.locator('#start-game');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Start Game');

    const box = await button.boundingBox();
    const height = await page.evaluate(() => window.innerHeight);
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
  });

  test('game defaults to free-roaming mode', async ({ page }) => {
    await page.goto('/about');
    const state = await page.evaluate(() => {
      const g = (window as any).__brickBreaker;
      return g ? { mode: g.state.mode, phase: g.state.phase } : null;
    });
    expect(state).not.toBeNull();
    expect(state!.mode).toBe('free');
    expect(state!.phase).toBe('free');
  });

  test('starting the game loads bricks and switches to play mode', async ({ page }) => {
    await page.goto('/about');
    await page.locator('#start-game').click();

    const state = await page.evaluate(() => {
      const g = (window as any).__brickBreaker;
      return g ? { mode: g.state.mode, phase: g.state.phase, bricks: g.state.bricks.length } : null;
    });
    expect(state!.mode).toBe('play');
    expect(state!.phase).toBe('flying');
    expect(state!.bricks).toBeGreaterThan(0);
  });

  test('bricks settle and the ball can be launched with the keyboard', async ({ page }) => {
    await page.goto('/about');
    await page.locator('#start-game').click();

    await page.waitForFunction(() => {
      const g = (window as any).__brickBreaker;
      return g && g.state.phase === 'ready';
    }, undefined, { timeout: 8000 });

    await page.keyboard.press(' ');
    const state = await page.evaluate(() => {
      const g = (window as any).__brickBreaker;
      return g ? { phase: g.state.phase, vy: g.state.ball.vy } : null;
    });
    expect(state!.phase).toBe('active');
    expect(state!.vy).toBeLessThan(0);
  });

  test('arrow keys move the paddle horizontally', async ({ page }) => {
    await page.goto('/about');
    await page.locator('#start-game').click();

    await page.waitForFunction(() => {
      const g = (window as any).__brickBreaker;
      return g && g.state.phase === 'ready';
    }, undefined, { timeout: 8000 });

    const before = await page.evaluate(() => (window as any).__brickBreaker.state.paddle.x);
    await page.keyboard.press('ArrowRight');
    const after = await page.evaluate(() => (window as any).__brickBreaker.state.paddle.x);
    expect(after).toBeGreaterThan(before);
  });

  test('clicking the bouncing icon opens backstage.io in free mode', async ({ page }) => {
    await page.goto('/about');

    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.evaluate(() => {
        const g = (window as any).__brickBreaker;
        const r = g.state.ball.r;
        document.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          clientX: g.state.ball.x,
          clientY: g.state.ball.y,
        }));
        void r;
      }),
    ]);

    expect(newPage.url()).toContain('backstage.io');
    await newPage.close();
  });

  test('start button is hidden while the game is playing', async ({ page }) => {
    await page.goto('/about');
    const btn = page.locator('#start-game');
    await expect(btn).toBeVisible();

    await btn.click();
    await expect(btn).toBeHidden();
  });

  test('clicking start removes the free-mode bounce from the page flow', async ({ page }) => {
    await page.goto('/about');
    const beforeClass = await page.evaluate(() => document.body.className);
    expect(beforeClass).not.toContain('playing-brick-breaker');

    await page.locator('#start-game').click();
    const afterClass = await page.evaluate(() => document.body.className);
    expect(afterClass).toContain('playing-brick-breaker');
  });
});