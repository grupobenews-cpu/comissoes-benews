// Utilidades compartilhadas pelos scripts de captura (snap/render).
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const tryReq = (ids) => { for (const id of ids) { try { return require(id); } catch (e) { /* próximo */ } } throw new Error('playwright não encontrado (npm i -g playwright)'); };
export const { chromium } = tryReq(['playwright', '/opt/node22/lib/node_modules/playwright']);

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = path.join(ROOT, 'src');

export function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return execFileSync('python3', ['-c', 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())']).toString().trim(); } catch (e) { /* segue */ }
  return 'ffmpeg';
}

export function args(argv = process.argv.slice(2)) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    o[k] = v;
  }
  return o;
}

export async function launch() {
  const executablePath = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined;
  return chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-gpu', '--disable-accelerated-2d-canvas', '--disable-gpu-compositing', '--disable-gpu-vsync', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--hide-scrollbars'],
  });
}

export const FORMATS = { h: { width: 1920, height: 1080 }, v: { width: 1080, height: 1920 } };
export async function openStage(browser, query = '', format = 'h') {
  const size = FORMATS[format] || FORMATS.h;
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  page.__size = size;
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
  const url = pathToFileURL(path.join(SRC, 'index.html')).href + '?render=1' + (format === 'v' ? '&format=v' : '') + (query ? '&' + query : '');
  await page.goto(url);
  await page.evaluate(() => window.__ready);
  const meta = await page.evaluate(() => window.__meta());
  return { page, meta, logs };
}

export async function capture(page, cdp, t, fps, format = 'jpeg', quality = 95) {
  await page.evaluate(([tt, f]) => window.__seek(tt, f), [t, fps]);
  const size = page.__size || { width: 1920, height: 1080 };
  const r = await cdp.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? quality : undefined, optimizeForSpeed: true, clip: { x: 0, y: 0, width: size.width, height: size.height, scale: 1 } });
  return Buffer.from(r.data, 'base64');
}
