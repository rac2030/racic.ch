import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const NEW_BASE = 'http://localhost:4322';
const OLD_BASE = 'http://localhost:1313';
const SCREENSHOT_DIR = '/tmp/migration-screenshots';

// Articles to compare: [newPath, oldPath, label]
const ARTICLES = [
  // Blog
  ['/blog/hosting-hugo-site-firebase', '/post/hugo/firebase/', 'blog-firebase'],
  ['/blog/displaying-git-metadata-hugo-templates', '/post/hugo/gitinfo/', 'blog-gitinfo'],
  ['/blog/enabling-offline-usage-hugo-pwa', '/post/hugo/pwa/', 'blog-pwa'],
  // Wiki
  ['/wiki/antenna-fundamentals', '/dev/ant/', 'wiki-ant'],
  ['/wiki/git', '/dev/git/', 'wiki-git'],
  ['/wiki/out-of-office-messages', '/fun/out-of-office-meldungen/', 'wiki-ooo'],
  ['/wiki/apache-force-ssl', '/wiki/apache-force-ssl-on-vhost/', 'wiki-apache-ssl'],
  ['/wiki/apache-wildcard-domains', '/wiki/apache-wildcard-domains/', 'wiki-apache-wildcard'],
  ['/wiki/using-google', '/wiki/using-google/', 'wiki-google'],
  ['/wiki/world-writable-files', '/security/world-writeable-files/', 'wiki-world-writable'],
  // Projects
  ['/projects/makezurich-2018-badge', '/project/MakeZurich-18-badge/', 'proj-badge'],
  ['/projects/makezurich-mobifloc', '/project/MakeZurich-MoBiFloC/', 'proj-mobifloc'],
  ['/projects/makezurich-pakman', '/project/MakeZurich-PakMan/', 'proj-pakman'],
  ['/projects/nina-w102-minimal-breakout', '/project/NINA-W102-minimal-breakout/', 'proj-nina'],
  ['/projects/sensirion-sdp3x-driver', '/libs/sensirion-SDP3x-driver/', 'proj-sdp3x'],
  ['/projects/spikey', '/project/Spikey/', 'proj-spikey'],
  // Bookmarks
  ['/bookmarks/360-video', '/links/360video/', 'bk-360'],
  ['/bookmarks/arduino', '/links/arduino/', 'bk-arduino'],
  ['/bookmarks/china-shopping', '/links/chinashopping/', 'bk-china'],
  ['/bookmarks/cnc', '/links/CNC/', 'bk-cnc'],
  ['/bookmarks/computer-vision', '/links/computervision/', 'bk-cv'],
  ['/bookmarks/golang', '/links/GO/', 'bk-golang'],
  ['/bookmarks/hugo-links', '/links/hugo/', 'bk-hugo'],
  ['/bookmarks/stm32', '/links/STM32/', 'bk-stm32'],
];

async function screenshotPage(page, url, filePath) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: filePath, fullPage: true });
    return true;
  } catch (e) {
    console.log(`  FAILED: ${url} - ${e.message}`);
    return false;
  }
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();

  // Screenshot new site (racic.ch)
  console.log('=== New site (racic.ch) ===');
  const newPage = await browser.newPage();
  await newPage.setViewportSize({ width: 1280, height: 800 });
  for (const [newPath, oldPath, label] of ARTICLES) {
    const filePath = path.join(SCREENSHOT_DIR, `new-${label}.png`);
    const ok = await screenshotPage(newPage, `${NEW_BASE}${newPath}`, filePath);
    console.log(`  ${ok ? '✓' : '✗'} ${label}: ${newPath}`);
  }
  await newPage.close();

  // Screenshot old site (rac.su)
  console.log('=== Old site (rac.su) ===');
  const oldPage = await browser.newPage();
  await oldPage.setViewportSize({ width: 1280, height: 800 });
  for (const [newPath, oldPath, label] of ARTICLES) {
    const filePath = path.join(SCREENSHOT_DIR, `old-${label}.png`);
    const ok = await screenshotPage(oldPage, `${OLD_BASE}${oldPath}`, filePath);
    console.log(`  ${ok ? '✓' : '✗'} ${label}: ${oldPath}`);
  }
  await oldPage.close();

  await browser.close();
  console.log(`\nScreenshots saved to ${SCREENSHOT_DIR}`);
}

main().catch(console.error);
