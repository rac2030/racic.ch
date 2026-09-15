#!/usr/bin/env node
// capture.mjs <story> [--only s1,s3] [--bootstrap 3]
// Records one webm per story segment in 1080x1920, driving the interactions
// described by each segment's scene. Segment record time comes from the paced
// narration durations (+ tail + safety), so the shots line up with the audio.
// Output: <story>/segments/captured.json [{ id, path, duration }]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { resolveStory, loadStory, storyPaths, mkdirs, waitForHttp, audioDurations } from './pipeline-util.mjs';

const BASE_URL = process.env.SHORT_BASE_URL || 'http://127.0.0.1:4322';

function buildTracker(canvasId) {
  return `(() => {
  const origGet = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = origGet.call(this, type, ...rest);
    if (type !== '2d' || !this.id || this.id.indexOf('${canvasId}') === -1) return ctx;
    try {
      const isDiamond = (l) => {
        if (l.length !== 4) return false;
        const cx = l.reduce((s, p) => s + p[0], 0) / 4;
        const cy = l.reduce((s, p) => s + p[1], 0) / 4;
        const cd = Math.hypot(l[0][0] - cx, l[0][1] - cy);
        if (cd < 4) return false;
        for (const [dx, dy] of l.map(p => [p[0] - cx, p[1] - cy])) {
          const n = Math.hypot(dx, dy);
          if (Math.abs(n - cd) > 0.5) return false;
          if (!(Math.abs(dx) < 0.5 && Math.abs(dy) > cd - 0.5) &&
              !(Math.abs(dy) < 0.5 && Math.abs(dx) > cd - 0.5)) return false;
        }
        return true;
      };
      const snaps = { circles: [], diamonds: [], texts: [] };
      let pathPts = [];
      let hasArc = false;
      ctx.beginPath = ((orig) => function (...a) { pathPts = []; hasArc = false; return orig.apply(this, a); })(ctx.beginPath);
      ctx.moveTo = ((orig) => function (x, y) { pathPts.push(['m', x, y]); return orig.apply(this, arguments); })(ctx.moveTo);
      ctx.lineTo = ((orig) => function (x, y) { pathPts.push(['l', x, y]); return orig.apply(this, arguments); })(ctx.lineTo);
      ctx.arc = ((orig) => function (x, y, r) { hasArc = true; pathPts.push(['a', x, y, r]); return orig.apply(this, arguments); })(ctx.arc);
      ctx.fill = ((orig) => function (...a) {
        const m = ctx.getTransform(); const sa = m.a;
        if (hasArc) {
          const p = pathPts.filter(q => q[0] === 'a').pop();
          snaps.circles.push({ x: p[1], y: p[2], r: p[3], sa, ex: m.e, ey: m.f });
        } else {
          const l = pathPts.map(q => [q[1], q[2]]);
          if (isDiamond(l)) {
            const cx = l.reduce((s, p) => s + p[0], 0) / 4, cy = l.reduce((s, p) => s + p[1], 0) / 4;
            const r = Math.hypot(l[0][0] - cx, l[0][1] - cy);
            snaps.diamonds.push({ x: cx, y: cy, r, sa, ex: m.e, ey: m.f });
          }
        }
        return orig.apply(this, a);
      })(ctx.fill);
      ctx.fillText = ((orig) => function (text, x, y) {
        const m = ctx.getTransform();
        snaps.texts.push({ t: String(text), x, y, sa: m.a, ex: m.e, ey: m.f });
        return orig.apply(this, arguments);
      })(ctx.fillText);
      ctx.restore = ((orig) => function (...a) {
        const out = orig.apply(this, a);
        window.__FRAME = { texts: snaps.texts.slice(), circles: snaps.circles.slice(), diamonds: snaps.diamonds.slice() };
        snaps.texts = []; snaps.circles = []; snaps.diamonds = [];
        return out;
      })(ctx.restore);
    } catch (e) { window.__TRACK_ERR = String(e); }
    return ctx;
  };
})();`;
}

function resolveMe() {
  return () => {
    globalThis.RESOLVE_ME = (title, kind) => {
      const f = window.__FRAME;
      if (!f) return null;
      const canvas = document.getElementById('wiki-graph');
      if (!canvas) return null;
      const box = canvas.getBoundingClientRect();
      const at = (sx, sy) => ({ x: box.left + sx, y: box.top + sy });
      const refs = kind === 'bookmark' ? f.diamonds : f.circles;
      const text = f.texts.filter((t) => t.t === title).pop();
      if (!text) return null;
      let best = null;
      let bd = Infinity;
      for (const s of refs) {
        const dist = Math.abs(text.y - (s.y + s.r + 4));
        if (dist < 8 && Math.abs(text.x - s.x) < 80 && dist < bd) { bd = dist; best = s; }
      }
      if (!best) return null;
      return at(text.x * text.sa + text.ex, text.y * text.sa + text.ey - text.sa * (best.r + 4));
    };
  };
}

async function measure(page, title, kind) {
  return page.evaluate(([t, k]) => globalThis.RESOLVE_ME(t, k), [title, kind]);
}

async function fish(page, target, dur = 1100) {
  if (!target) {
    console.warn('  fish: no target resolved');
    return;
  }
  const t0 = Date.now();
  while (Date.now() - t0 < dur) {
    const a = Math.random() * Math.PI * 2;
    const rad = 5 + Math.random() * 9;
    await page.mouse.move(target.x + Math.cos(a) * rad, target.y + Math.sin(a) * rad, { steps: 2 });
    await page.waitForTimeout(130);
  }
}

async function pan(page, from, dx, dy, steps, stepMs = 16) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + (dx * i) / steps, from.y + (dy * i) / steps);
    await page.waitForTimeout(stepMs);
  }
  await page.mouse.up();
}

async function corner(page, canvasId) {
  const box = await page.evaluate((id) => {
    const c = document.getElementById(id);
    const b = c.getBoundingClientRect();
    return { left: b.left, top: b.top, w: b.width, h: b.height };
  }, canvasId);
  return {
    x: Math.min(Math.max(box.left + 60, 10), 1070),
    y: Math.min(Math.max(box.top + box.h - 60, 10), 1910),
  };
}

const helpers = () => ({
  corner: (page, canvasId) => corner(page, canvasId),
  measure: (page, title, kind) => measure(page, title, kind),
  fish: (page, target, dur) => fish(page, target, dur),
});

async function runActions(page, actions, canvasId) {
  const h = helpers();
  for (const a of actions || []) {
    switch (a.type) {
      case 'waitFor':
        await page.waitForSelector(a.selector, { timeout: a.timeout || 15000 });
        break;
      case 'waitMs':
        await page.waitForTimeout(a.ms || 0);
        break;
      case 'click':
        await page.click(a.selector);
        break;
      case 'hover':
        await page.hover(a.selector);
        break;
      case 'type':
        await page.type(a.selector, a.text);
        break;
      case 'press':
        await page.keyboard.press(a.key);
        break;
      case 'graphFish': {
        const t = await measure(page, a.title, a.kind || 'wiki');
        if (!t) throw new Error(`graphFish: could not resolve "${a.title}" (${a.kind})`);
        await fish(page, t, a.ms || 1100);
        break;
      }
      case 'graphDoubleClick': {
        const t = await measure(page, a.title, a.kind || 'wiki');
        if (!t) throw new Error(`graphDoubleClick: could not resolve "${a.title}" (${a.kind})`);
        await page.mouse.dblclick(t.x, t.y);
        break;
      }
      case 'assertUrl':
        await page.waitForURL(new RegExp(a.pattern), { timeout: a.timeout || 5000 });
        break;
      case 'pan': {
        const from = a.from === 'corner' ? await corner(page, canvasId) : { x: a.x ?? 0, y: a.y ?? 0 };
        await pan(page, from, a.dx || 0, a.dy || 0, a.steps || 80, a.stepMs || 16);
        break;
      }
      case 'mouseMove': {
        const to = a.to === 'corner' ? await corner(page, canvasId) : { x: a.x ?? 0, y: a.y ?? 0 };
        await page.mouse.move(to.x, to.y, { steps: a.steps || 6 });
        break;
      }
      case 'evaluate':
        await page.evaluate((code) => {
          (0, eval)(code);
        }, a.js);
        break;
      case 'evaluateRemove':
        await page.evaluate((sels) => {
          for (const s of sels) document.querySelectorAll(s).forEach((e) => e.remove());
        }, a.selectors || []);
        break;
      default:
        throw new Error(`capture: unknown action type "${a.type}" in segment`);
    }
    if (a.label) console.log(`  action ${a.label}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const storyArg = args.find((a) => !a.startsWith('--'));
  const only = (args.find((a) => a.startsWith('--only')) || '').split('=')[1] || '';
  const onlySet = only ? new Set(only.split(',').filter(Boolean)) : null;
  const bootstrap = parseFloat(args.find((a) => a.startsWith('--bootstrap'))?.split('=')[1] || '3');
  if (!storyArg) throw new Error('usage: node capture.mjs <story> [--only s1,s3] [--bootstrap 3]');

  const dir = resolveStory(storyArg);
  const story = loadStory(dir);
  const cap = story.capture || {};
  const canvasId = cap.canvasId || '';
  const [width, height] = cap.videoSize || [1080, 1920];
  const backend = cap.baseUrl || BASE_URL;
  const pics = storyPaths(dir);
  mkdirs(pics.seg);

  if (!(await waitForHttp(`${backend}/wiki/`, { timeoutMs: 10000, label: backend }))) {
    throw new Error(`Short base URL not reachable at ${backend} (serve the built site there, e.g. dist via http.server).`);
  }

  const durations = audioDurations(dir, story);
  const tail = story.assembly?.tailSeconds ?? 0.35;
  const browser = await chromium.launch();
  const results = [];

  for (let i = 0; i < story.segments.length; i++) {
    const seg = story.segments[i];
    if (onlySet && !onlySet.has(seg.id)) continue;
    const needed = durations[i] + tail + bootstrap;
    console.log(`\ncapture ${seg.id}: record ≥ ${needed.toFixed(2)}s (audio ${durations[i].toFixed(2)}s + tail ${tail}s + safety ${bootstrap}s)`);

    const ctx = await browser.newContext({
      viewport: { width, height },
      recordVideo: { dir: pics.seg, size: { width, height } },
    });
    if (canvasId) {
      await ctx.addInitScript(buildTracker(canvasId));
      await ctx.addInitScript(resolveMe());
    }
    if (cap.extraInitJs) await ctx.addInitScript((code) => (0, eval)(code), cap.extraInitJs);

    const page = await ctx.newPage();
    await page.waitForTimeout(100);
    const t0 = Date.now();

    await page.goto(`${backend}${seg.scene.url}`, { waitUntil: 'domcontentloaded' });
    if (cap.frameCss) {
      await page.evaluate((css) => {
        const st = document.createElement('style');
        st.textContent = css;
        document.head.appendChild(st);
      }, cap.frameCss);
    }
    if (canvasId) {
      await page.evaluate((id) => {
        const c = document.getElementById(id);
        if (c) window.scrollTo(0, Math.max(0, c.getBoundingClientRect().top - 120));
      }, canvasId);
    }
    await page.waitForTimeout(300);

    await runActions(page, seg.scene.actions, canvasId);

    const elapsed = (Date.now() - t0) / 1000;
    const pad = Math.max(1, needed - elapsed);
    await page.waitForTimeout(pad * 1000);

    await ctx.close();
    const vp = await page.video().path();
    const result = { id: seg.id, path: String(vp) };
    results.push(result);
    console.log(`capture ${seg.id} -> ${result.path}`);
  }

  await browser.close();
  fs.writeFileSync(pics.captured, JSON.stringify({ storyId: story.id, results }, null, 2) + '\n');
  console.log(`\nAll segments captured. Manifest -> ${pics.captured}`);
}

main().catch((e) => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});