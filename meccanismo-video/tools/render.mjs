// Render final quadro a quadro → MP4 (H.264), em paralelo.
//   node tools/render.mjs [--fps 30] [--workers 3] [--from 0] [--to <dur>] [--crf 16] [--out out/meccanismo.mp4] [--solo s03]
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { args, launch, openStage, capture, ffmpegPath, ROOT } from './lib.mjs';

const a = args();
const fps = Number(a.fps || 30);
const fmt = a.format === 'v' ? 'v' : 'h';
const workers = Number(a.workers || 3);
const crf = String(a.crf || 16);
const preset = String(a.preset || 'medium');
// motion blur: --mb N sub-quadros por quadro, espalhados em --shutter (fração do intervalo; 0.5 = 180°)
const MB = Math.max(1, Number(a.mb || 1));
const SHUTTER = Number(a.shutter || 0.5);
const out = path.resolve(ROOT, a.out || 'out/meccanismo-video-only.mp4');
const tmp = path.join(path.dirname(out), `.segments-${path.basename(out, '.mp4')}`);
fs.mkdirSync(tmp, { recursive: true });
const FF = ffmpegPath();

const browser = await launch();
const probe = await openStage(browser, a.solo ? `solo=${a.solo}` : '', fmt);
const dur = probe.meta.duration;
fs.writeFileSync(path.join(path.dirname(out), fmt === 'v' ? 'cues-v.json' : 'cues.json'), JSON.stringify({ duration: dur, fps, scenes: probe.meta.scenes, cues: probe.meta.cues }, null, 1));
if (probe.meta.errors.length) console.warn('ERROS DE CENA:\n' + probe.meta.errors.join('\n'));
await probe.page.close();

const from = Number(a.from || 0), to = Number(a.to || dur);
const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
const total = f1 - f0;
const per = Math.ceil(total / workers);
console.log(`render ${total} quadros (${from}s→${to}s @${fps}fps) com ${workers} workers${MB > 1 ? ` · motion blur ${MB}× shutter ${SHUTTER}` : ''}`);
const t0 = Date.now();
let done = 0;

async function runWorker(w) {
  const a0 = f0 + w * per, a1 = Math.min(f1, a0 + per);
  if (a1 <= a0) return null;
  const seg = path.join(tmp, `seg${String(w).padStart(2, '0')}.mp4`);
  const { page } = await openStage(browser, a.solo ? `solo=${a.solo}` : '', fmt);
  const cdp = await page.context().newCDPSession(page);
  const vf = MB > 1 ? ['-vf', `tmix=frames=${MB},select='eq(mod(n\\,${MB})\\,${MB - 1})',setpts=N/(${fps}*TB)`] : [];
  const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * MB), '-c:v', 'mjpeg', '-i', '-',
    ...vf, '-c:v', 'libx264', '-preset', preset, '-crf', crf, '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tune', 'animation',
    '-x264-params', 'keyint=60:min-keyint=30', '-r', String(fps), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error(`ffmpeg saiu com ${c}`))));
  // aquece o estado com um seek anterior (garante renderização idêntica à sequência contínua)
  await page.evaluate(([t, f]) => window.__seek(t, f), [Math.max(0, a0 - 1) / fps, fps]);
  for (let f = a0; f < a1; f++) {
    for (let k = 0; k < MB; k++) {
      // sub-quadros centrados no instante do quadro
      const off = MB > 1 ? (k / (MB - 1) - 0.5) * SHUTTER / fps : 0;
      const buf = await capture(page, cdp, Math.max(0, f / fps + off), fps, 'jpeg', MB > 1 ? 92 : 95);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    done++;
    if (done % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`  ${done}/${total} quadros · ${(done / el).toFixed(1)} fps · ETA ${Math.round((total - done) / (done / el))}s\n`);
    }
  }
  ff.stdin.end();
  await ffDone;
  await page.close();
  return seg;
}

const segs = (await Promise.all(Array.from({ length: workers }, (_, w) => runWorker(w)))).filter(Boolean);
await browser.close();
const list = path.join(tmp, 'list.txt');
fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
execFileSync(FF, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`ok → ${out} em ${((Date.now() - t0) / 1000).toFixed(0)}s`);
