import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const NEW_BASE = process.env.NEW_BASE || 'http://127.0.0.1:4322';
const OLD_BASE = process.env.OLD_BASE || 'https://rac.su';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/migration-screenshots';

const ARTICLES = [
  { newPath: '/blog/hosting-hugo-site-firebase', oldPath: '/hugo/firebase/', label: 'blog-firebase', title: 'Hosting Hugo with Firebase', category: 'Blog' },
  { newPath: '/blog/displaying-git-metadata-hugo-templates', oldPath: '/hugo/gitinfo/', label: 'blog-gitinfo', title: 'Displaying GIT Metadata in Hugo Templates', category: 'Blog' },
  { newPath: '/blog/enabling-offline-usage-hugo-pwa', oldPath: '/hugo/pwa/', label: 'blog-pwa', title: 'Enabling Offline Usage (PWA)', category: 'Blog' },
  { newPath: '/wiki/ant', oldPath: '/dev/ant/', label: 'wiki-ant', title: 'Antenna Fundamentals', category: 'Wiki' },
  { newPath: '/wiki/git', oldPath: '/dev/git/', label: 'wiki-git', title: 'Git', category: 'Wiki' },
  { newPath: '/wiki/out-of-office-meldungen', oldPath: '/fun/out-of-office-meldungen/', label: 'wiki-ooo', title: 'Out of Office Messages', category: 'Wiki' },
  { newPath: '/wiki/apache-force-ssl', oldPath: '/wiki/apache-force-ssl-on-vhost/', label: 'wiki-apache-ssl', title: 'Apache Force SSL', category: 'Wiki' },
  { newPath: '/wiki/apache-wildcard-domains', oldPath: '/wiki/apache-wildcard-domains/', label: 'wiki-apache-wildcard', title: 'Apache Wildcard Domains', category: 'Wiki' },
  { newPath: '/wiki/using-google', oldPath: '/wiki/using-google/', label: 'wiki-google', title: 'Using Google', category: 'Wiki' },
  { newPath: '/wiki/world-writable-files', oldPath: '/security/world-writeable-files/', label: 'wiki-world-writable', title: 'World Writable Files', category: 'Wiki' },
  { newPath: '/projects/makezurich-2018-badge', oldPath: '/project/makezurich-18-badge/', label: 'proj-badge', title: 'MakeZurich 2018 Badge', category: 'Projects' },
  { newPath: '/projects/makezurich-mobifloc', oldPath: '/project/makezurich-mobifloc/', label: 'proj-mobifloc', title: 'MakeZurich MoBiFloC', category: 'Projects' },
  { newPath: '/projects/makezurich-pakman', oldPath: '/project/makezurich-pakman/', label: 'proj-pakman', title: 'MakeZurich PakMan', category: 'Projects' },
  { newPath: '/projects/nina-w102-minimal-breakout', oldPath: '/project/nina-w102-minimal-breakout/', label: 'proj-nina', title: 'NINA-W102 Breakout', category: 'Projects' },
  { newPath: '/projects/sensirion-sdp3x-driver', oldPath: '/libs/sensirion-sdp3x-driver/', label: 'proj-sdp3x', title: 'Sensirion SDP3x Driver', category: 'Projects' },
  { newPath: '/projects/spikey', oldPath: '/project/spikey/', label: 'proj-spikey', title: 'Spikey', category: 'Projects' },
  { newPath: '/bookmarks/360-video', oldPath: '/links/360video/', label: 'bk-360', title: '360° Video', category: 'Bookmarks' },
  { newPath: '/bookmarks/arduino', oldPath: '/links/arduino/', label: 'bk-arduino', title: 'Arduino', category: 'Bookmarks' },
  { newPath: '/bookmarks/china-shopping', oldPath: '/links/chinashopping/', label: 'bk-china', title: 'China Shopping', category: 'Bookmarks' },
  { newPath: '/bookmarks/cnc', oldPath: '/links/cnc/', label: 'bk-cnc', title: 'CNC', category: 'Bookmarks' },
  { newPath: '/bookmarks/computer-vision', oldPath: '/links/computervision/', label: 'bk-cv', title: 'Computer Vision', category: 'Bookmarks' },
  { newPath: '/bookmarks/golang', oldPath: '/links/go/', label: 'bk-golang', title: 'Go', category: 'Bookmarks' },
  { newPath: '/bookmarks/hugo-links', oldPath: '/links/hugo/', label: 'bk-hugo', title: 'Hugo Links', category: 'Bookmarks' },
  { newPath: '/bookmarks/stm32', oldPath: '/links/stm32/', label: 'bk-stm32', title: 'STM32', category: 'Bookmarks' },
];

async function forceImagesLoaded(page) {
  // Scroll through the full page to trigger lazy-loaded images, then wait
  // until every <img> has actually rendered (complete && naturalWidth > 0).
  await page.evaluate(async () => {
    const scroll = async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      const height = () => Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
      );
      let y = 0;
      const step = window.innerHeight;
      while (y < height()) {
        window.scrollTo(0, y);
        y += step;
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    };
    await scroll();
    await scroll();
  });

  // Wait until all images are fully loaded, with a retry loop.
  await page.waitForFunction(() => {
    const imgs = Array.from(document.images);
    if (imgs.length === 0) return true;
    return imgs.every((img) => img.complete && img.naturalWidth > 0);
  }, { timeout: 30000 }).catch(() => {});

  // Give footer/hero transition animations a moment to settle.
  await page.waitForTimeout(500);
}

async function screenshotPage(browser, url, filePath) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  try {
    const response = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
    await forceImagesLoaded(page);
    await page.screenshot({ path: filePath, fullPage: true });
    const status = response?.status() || 0;
    return { ok: status < 400, status };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    await page.close();
  }
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  // Screenshot new site
  console.log('=== New site (racic.ch) ===');
  for (const a of ARTICLES) {
    const fp = path.join(SCREENSHOT_DIR, `new-${a.label}.png`);
    const r = await screenshotPage(browser, `${NEW_BASE}${a.newPath}`, fp);
    results.push({ ...a, newStatus: r.status || 'error', newFile: fp, newError: r.error });
    console.log(`  ${r.ok ? '✓' : '✗'} ${a.label} [${r.status || r.error}]`);
  }

  // Screenshot old site
  console.log('\n=== Old site (rac.su) ===');
  for (const a of ARTICLES) {
    const fp = path.join(SCREENSHOT_DIR, `old-${a.label}.png`);
    const r = await screenshotPage(browser, `${OLD_BASE}${a.oldPath}`, fp);
    const idx = results.findIndex(x => x.label === a.label);
    if (idx >= 0) {
      results[idx].oldStatus = r.status || 'error';
      results[idx].oldFile = fp;
      results[idx].oldError = r.error;
    }
    console.log(`  ${r.ok ? '✓' : '✗'} ${a.label} [${r.status || r.error}]`);
  }

  await browser.close();

  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  const newOk = results.filter(r => r.newStatus && r.newStatus < 400).length;
  const oldOk = results.filter(r => r.oldStatus && r.oldStatus < 400).length;
  console.log(`\nDone! New: ${newOk}/${results.length}, Old: ${oldOk}/${results.length}`);
}

main().catch(console.error);
