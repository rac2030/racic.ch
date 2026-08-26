import { test, expect } from '@playwright/test';

test.describe('Blog post pages', () => {
  test('renders Hosting Hugo with Firebase post', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await expect(page.locator('article h1')).toHaveText('Hosting a Hugo Site with Firebase');
  });

  test('renders Displaying GIT Metadata post', async ({ page }) => {
    await page.goto('/blog/displaying-git-metadata-hugo-templates/');
    await expect(page.locator('article h1')).toContainText('GIT Metadata');
  });

  test('renders Enabling Offline Usage post', async ({ page }) => {
    await page.goto('/blog/enabling-offline-usage-hugo-pwa/');
    await expect(page.locator('article h1')).toContainText('Offline Usage');
  });

  test('post has article with substantial content', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    const article = page.locator('article');
    await expect(article).toBeVisible();
    const content = await article.textContent();
    expect(content?.length).toBeGreaterThan(100);
  });

  test('post has date, tags, and hero image', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await expect(page.locator('article time').first()).toBeVisible();
    const tags = page.locator('article .tag');
    await expect(tags.first()).toBeVisible();
    await expect(page.locator('article img')).toBeVisible();
  });

  test('giscus comments container exists', async ({ page }) => {
    await page.goto('/blog/hosting-hugo-site-firebase/');
    await expect(page.locator('#giscus-comments')).toBeAttached();
  });
});
