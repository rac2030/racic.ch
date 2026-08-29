import { spawn, execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEW_REPO = path.join(__dirname, '..');
const OLD_REPO = process.env.RACSU_REPO || '/tmp/rac.su';
const PORT = process.env.REPORT_PORT || '4322';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/migration-screenshots';

function run(cmd, cwd = NEW_REPO) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env } });
}

function ensureOldRepo() {
  if (fs.existsSync(OLD_REPO)) {
    console.log(`Old repo present at ${OLD_REPO}`);
    return;
  }
  console.log(`Old repo not found at ${OLD_REPO} — cloning it…`);
  fs.mkdirSync(path.dirname(OLD_REPO), { recursive: true });
  execSync(`git clone --depth 1 https://github.com/rac2030/rac.su.git ${OLD_REPO}`, { stdio: 'inherit' });
}

async function serveDist() {
  const server = spawn('python3', ['-m', 'http.server', PORT, '--directory', path.join(NEW_REPO, 'dist')], {
    stdio: 'inherit',
    detached: true,
  });
  server.unref();
  // wait for the port to accept connections
  for (let i = 0; i < 40; i++) {
    const up = await new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => { res.resume(); resolve(true); });
      req.on('error', () => resolve(false));
      req.setTimeout(200, () => { req.destroy(); resolve(false); });
    });
    if (up) { console.log(`Serving dist on port ${PORT}`); return server; }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not come up on port ${PORT}`);
}

function stopServer(server) {
  if (server?.pid) {
    try { process.kill(-server.pid); } catch {}
    try { process.kill(server.pid); } catch {}
  }
}

async function main() {
  const scenario = process.argv[2] === 'screenshots' ? 'screenshots' : 'full';
  ensureOldRepo();
  run('npm run build');

  const server = await serveDist();
  try {
    run(`node scripts/screenshot-comparison.mjs`, NEW_REPO);
  } finally {
    stopServer(server);
  }

  if (scenario === 'full') {
    run(`node scripts/generate-migration-report.mjs`, NEW_REPO);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
