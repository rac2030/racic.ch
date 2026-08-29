import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:4322';
const SCREENSHOT_DIR = '/tmp/migration-screenshots';

const ARTICLES = [
  // Blog
  { path: '/blog/hosting-hugo-site-firebase', label: 'blog-firebase', title: 'Hosting Hugo with Firebase' },
  { path: '/blog/displaying-git-metadata-hugo-templates', label: 'blog-gitinfo', title: 'Displaying GIT Metadata' },
  { path: '/blog/enabling-offline-usage-hugo-pwa', label: 'blog-pwa', title: 'Enabling Offline Usage (PWA)' },
  // Wiki
  { path: '/wiki/ant', label: 'wiki-ant', title: 'Apache Ant' },
  { path: '/wiki/git', label: 'wiki-git', title: 'Git' },
  { path: '/wiki/out-of-office-meldungen', label: 'wiki-ooo', title: 'Out of Office Messages' },
  { path: '/wiki/apache-force-ssl', label: 'wiki-apache-ssl', title: 'Apache Force SSL' },
  { path: '/wiki/apache-wildcard-domains', label: 'wiki-apache-wildcard', title: 'Apache Wildcard Domains' },
  { path: '/wiki/using-google', label: 'wiki-google', title: 'Using Google' },
  { path: '/wiki/world-writable-files', label: 'wiki-world-writable', title: 'World Writable Files' },
  // Projects
  { path: '/projects/makezurich-2018-badge', label: 'proj-badge', title: 'MakeZurich 2018 Badge' },
  { path: '/projects/makezurich-mobifloc', label: 'proj-mobifloc', title: 'MakeZurich MoBiFloC' },
  { path: '/projects/makezurich-pakman', label: 'proj-pakman', title: 'MakeZurich PakMan' },
  { path: '/projects/nina-w102-minimal-breakout', label: 'proj-nina', title: 'NINA-W102 Breakout' },
  { path: '/projects/sensirion-sdp3x-driver', label: 'proj-sdp3x', title: 'Sensirion SDP3x Driver' },
  { path: '/projects/spikey', label: 'proj-spikey', title: 'Spikey' },
  // Bookmarks
  { path: '/bookmarks/360-video', label: 'bk-360', title: '360° Video' },
  { path: '/bookmarks/arduino', label: 'bk-arduino', title: 'Arduino' },
  { path: '/bookmarks/china-shopping', label: 'bk-china', title: 'China Shopping' },
  { path: '/bookmarks/cnc', label: 'bk-cnc', title: 'CNC' },
  { path: '/bookmarks/computer-vision', label: 'bk-cv', title: 'Computer Vision' },
  { path: '/bookmarks/golang', label: 'bk-golang', title: 'Go' },
  { path: '/bookmarks/hugo-links', label: 'bk-hugo', title: 'Hugo Links' },
  { path: '/bookmarks/stm32', label: 'bk-stm32', title: 'STM32' },
];

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const results = [];
  for (const article of ARTICLES) {
    const url = `${BASE_URL}${article.path}`;
    const filePath = path.join(SCREENSHOT_DIR, `new-${article.label}.png`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: filePath, fullPage: true });
      results.push({ ...article, status: 'ok', file: filePath });
      console.log(`✓ ${article.label}: ${article.title}`);
    } catch (e) {
      results.push({ ...article, status: 'failed', error: e.message });
      console.log(`✗ ${article.label}: ${e.message}`);
    }
  }

  await browser.close();

  // Write results JSON
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`\nDone! ${results.filter(r => r.status === 'ok').length}/${results.length} screenshots taken`);
}

main().catch(console.error);
