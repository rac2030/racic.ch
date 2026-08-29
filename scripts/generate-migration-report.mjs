import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEW_REPO = path.join(__dirname, '..');
const OLD_REPO = process.env.RACSU_REPO || '/tmp/rac.su';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/migration-screenshots';
const FILE_MAP_PATH = path.join(__dirname, 'migration-file-map.json');
const MIGRATION_PLAN = fs.readFileSync(path.join(NEW_REPO, 'MIGRATION-PLAN.md'), 'utf8');
const FILE_MAP = JSON.parse(fs.readFileSync(FILE_MAP_PATH, 'utf8'));

function imgToBase64(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return 'data:image/png;base64,' + data.toString('base64');
  } catch { return null; }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function diffLines(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result = [];

  // Simple LCS-based diff
  const m = oldLines.length, n = newLines.length;
  const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = oldLines[i-1] === newLines[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

  let i = m, j = n;
  const ops = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i-1] === newLines[j-1]) {
      ops.unshift({type: 'ctx', value: oldLines[i-1]});
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      ops.unshift({type: 'add', value: newLines[j-1]});
      j--;
    } else {
      ops.unshift({type: 'del', value: oldLines[i-1]});
      i--;
    }
  }

  // Merge consecutive same-type ops
  let merged = [];
  for (const op of ops) {
    if (merged.length && merged[merged.length-1].type === op.type) {
      merged[merged.length-1].lines.push(op.value);
    } else {
      merged.push({type: op.type, lines: [op.value]});
    }
  }

  return merged;
}

function getStats(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const changes = diffLines(oldText, newText);
  let added = 0, removed = 0, unchanged = 0;
  for (const part of changes) {
    if (part.type === 'add') added += part.lines.length;
    else if (part.type === 'del') removed += part.lines.length;
    else unchanged += part.lines.length;
  }
  return { added, removed, unchanged };
}

function renderDiff(oldText, newText) {
  const changes = diffLines(oldText, newText);
  let html = '';
  for (const part of changes) {
    const escaped = escapeHtml(part.lines.join('\n'));
    if (part.type === 'add') {
      html += '<span class="diff-add">' + escaped + '</span>';
    } else if (part.type === 'del') {
      html += '<span class="diff-del">' + escaped + '</span>';
    } else {
      html += '<span class="diff-ctx">' + escaped + '</span>';
    }
  }
  return html;
}

let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Content Migration Report: rac.su → racic.ch</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e0e0e0; line-height: 1.6; }
  .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
  h1 { color: #00ff41; font-size: 2em; margin-bottom: 10px; border-bottom: 2px solid #00ff41; padding-bottom: 10px; }
  h2 { color: #00cc33; font-size: 1.5em; margin: 30px 0 15px; }
  h3 { color: #00aa22; font-size: 1.2em; margin: 20px 0 10px; }
  h4 { color: #88ccaa; font-size: 1em; margin: 15px 0 8px; }
  .summary { background: #1a1a2e; border: 1px solid #00ff41; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 15px; }
  .stat { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 15px; text-align: center; }
  .stat-value { font-size: 2em; color: #00ff41; font-weight: bold; }
  .stat-label { color: #8b949e; font-size: 0.9em; }
  .category { margin: 30px 0; }
  .category-header { background: linear-gradient(90deg, #1a1a2e, #0d1117); padding: 10px 15px; border-radius: 6px 6px 0 0; border: 1px solid #30363d; border-bottom: none; }
  .article { background: #0d1117; border: 1px solid #30363d; border-radius: 0 0 6px 6px; padding: 20px; margin-bottom: 20px; }
  .file-paths { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0 15px; }
  .file-path { background: #161b22; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 0.85em; }
  .file-path .label { color: #8b949e; font-size: 0.8em; display: block; margin-bottom: 3px; }
  .file-path .path { color: #58a6ff; word-break: break-all; }
  .file-path .path.old { color: #f0883e; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
  .screenshot-container:nth-child(1) { order: 1; }
  .screenshot-container:nth-child(2) { order: 2; }
  .screenshot-container { position: relative; }
  .screenshot-label { position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.8); color: #00ff41; padding: 3px 8px; border-radius: 3px; font-size: 0.8em; font-weight: bold; z-index: 1; }
  .screenshot-label.old { color: #f0883e; }
  .screenshot-container img { width: 100%; border-radius: 4px; border: 1px solid #30363d; }
  .diff-section { margin: 15px 0; }
  .diff-header { display: flex; justify-content: space-between; align-items: center; background: #161b22; border: 1px solid #30363d; border-radius: 4px 4px 0 0; padding: 8px 12px; }
  .diff-header .stats { font-size: 0.85em; }
  .diff-header .stats .add { color: #3fb950; }
  .diff-header .stats .del { color: #f85149; }
  .diff-header .stats .ctx { color: #8b949e; }
  .diff-content { background: #0d1117; border: 1px solid #30363d; border-top: none; border-radius: 0 0 4px 4px; padding: 15px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.8em; line-height: 1.5; max-height: 500px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; }
  .diff-add { background: #0d3320; color: #3fb950; display: block; }
  .diff-del { background: #3d0d0d; color: #f85149; text-decoration: line-through; display: block; }
  .diff-ctx { color: #8b949e; display: block; }
  .migration-plan { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 20px; margin: 20px 0; white-space: pre-wrap; font-family: monospace; font-size: 0.85em; max-height: 600px; overflow-y: auto; }
  .actions { background: #1a1a2e; border: 1px solid #30363d; border-radius: 6px; padding: 20px; margin: 20px 0; }
  .actions li { margin: 5px 0; padding-left: 10px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 0.75em; font-weight: bold; }
  .badge-ok { background: #0d3320; color: #00ff41; }
  .badge-info { background: #0d1d3d; color: #4488ff; }
  .identical { color: #8b949e; font-style: italic; padding: 10px; background: #161b22; border-radius: 4px; }
  @media (max-width: 900px) { .comparison, .file-paths { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="container">
<h1>Content Migration Report</h1>
<p style="color: #8b949e; margin-bottom: 20px;">rac.su → racic.ch | Generated ${new Date().toISOString().split('T')[0]}</p>

<div class="summary">
<h2>Summary</h2>
<div class="summary-grid">
  <div class="stat"><div class="stat-value">24</div><div class="stat-label">Articles Migrated</div></div>
  <div class="stat"><div class="stat-value">24/26</div><div class="stat-label">Relevant Articles (92%)</div></div>
  <div class="stat"><div class="stat-value">137</div><div class="stat-label">Pages Built</div></div>
</div>
</div>

<div class="actions">
<h2>Actions Completed</h2>
<ul>
  <li><span class="badge badge-ok">DONE</span> Added aliases to 22 files for old Hugo URL redirects</li>
  <li><span class="badge badge-ok">DONE</span> Added pubDate to out-of-office-messages.md</li>
  <li><span class="badge badge-ok">DONE</span> Fixed nina-w102 image paths</li>
  <li><span class="badge badge-ok">DONE</span> Restored body images in 4 articles (gitinfo, badge, mobifloc, pakman)</li>
  <li><span class="badge badge-ok">DONE</span> Copied missing hivemind-data.png from old repo</li>
  <li><span class="badge badge-info">SKIP</span> MakeZurich-18-treasurehunt.md — deleted by user</li>
  <li><span class="badge badge-info">SKIP</span> socialstream/main.md — deprecated</li>
  <li><span class="badge badge-info">SKIP</span> brushlessmotor-esc.md — was draft</li>
  <li><span class="badge badge-info">SKIP</span> friendly-robots.md — retired (not needed)</li>
  <li><span class="badge badge-info">SKIP</span> 3d-printing.md — retired (not needed)</li>
</ul>
</div>
`;

const categories = {};
for (const f of FILE_MAP) {
  if (!categories[f.category]) categories[f.category] = [];
  categories[f.category].push(f);
}

for (const [cat, articles] of Object.entries(categories)) {
  html += '<div class="category"><div class="category-header"><h2>' + cat + '</h2></div>';

  for (const a of articles) {
    const oldPath = path.join(OLD_REPO, a.old);
    const newPath = path.join(NEW_REPO, a.new);
    const oldText = fs.existsSync(oldPath) ? fs.readFileSync(oldPath, 'utf8') : '';
    const newText = fs.existsSync(newPath) ? fs.readFileSync(newPath, 'utf8') : '';
    const stats = getStats(oldText, newText);
    const diffHtml = renderDiff(oldText, newText);
    const isIdentical = oldText === newText;
    const newImg = imgToBase64(path.join(SCREENSHOT_DIR, 'new-' + a.label + '.png'));
    const oldImg = imgToBase64(path.join(SCREENSHOT_DIR, 'old-' + a.label + '.png'));

    html += '<div class="article">';
    html += '<h3>' + escapeHtml(a.title) + '</h3>';

    html += '<div class="file-paths">';
    html += '<div class="file-path"><span class="label">Old (rac.su)</span><span class="path old">' + escapeHtml(a.old) + '</span></div>';
    html += '<div class="file-path"><span class="label">New (racic.ch)</span><span class="path">' + escapeHtml(a.new) + '</span></div>';
    html += '</div>';

    html += '<div class="comparison">';
    html += '<div class="screenshot-container"><div class="screenshot-label old">rac.su (Old)</div>';
    html += oldImg ? '<img src="' + oldImg + '" alt="Old">' : '<div style="padding:40px;text-align:center;color:#ff6b6b;border:1px dashed #ff6b6b;border-radius:4px">Not available</div>';
    html += '</div>';
    html += '<div class="screenshot-container"><div class="screenshot-label">racic.ch (New)</div>';
    html += newImg ? '<img src="' + newImg + '" alt="New">' : '<div style="padding:40px;text-align:center;color:#ff6b6b;border:1px dashed #ff6b6b;border-radius:4px">Not available</div>';
    html += '</div></div>';

    html += '<div class="diff-section">';
    html += '<div class="diff-header"><h4>Markdown Diff</h4>';
    html += '<div class="stats"><span class="add">+' + stats.added + ' added</span> &nbsp; ';
    html += '<span class="del">-' + stats.removed + ' removed</span> &nbsp; ';
    html += '<span class="ctx">' + stats.unchanged + ' unchanged</span></div></div>';

    if (isIdentical) {
      html += '<div class="identical">Files are identical</div>';
    } else {
      html += '<div class="diff-content">' + diffHtml + '</div>';
    }
    html += '</div></div>';
  }
  html += '</div>';
}

html += '<div class="category"><div class="category-header"><h2>Migration Plan</h2></div>';
html += '<div class="article"><div class="migration-plan">' + escapeHtml(MIGRATION_PLAN) + '</div></div></div>';

html += '</div></body></html>';

fs.writeFileSync(path.join(NEW_REPO, 'migration-report.html'), html);
console.log('Report generated: migration-report.html');
console.log('Size: ' + (html.length / 1024 / 1024).toFixed(2) + ' MB');
