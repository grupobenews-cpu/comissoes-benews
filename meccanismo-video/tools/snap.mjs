// Captura quadros estáticos para revisão.
//   node tools/snap.mjs --scene s03 --times 0,1.5,3.25 [--out out/snaps/s03] [--sheet]
//   node tools/snap.mjs --times 10,20,30            (tempos globais, vídeo inteiro)
//   node tools/snap.mjs --scene s03 --every 0.5     (a cada 0,5 s ao longo da cena, com folha de contato)
// Com --scene, só aquela cena é montada (?solo=) e os tempos são LOCAIS à cena.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { args, launch, openStage, capture, ROOT } from './lib.mjs';

const a = args();
const scene = a.scene && a.scene !== true ? String(a.scene) : null;
const fmt = a.format === 'v' ? 'v' : 'h';
const out = path.resolve(ROOT, a.out && a.out !== true ? a.out : `out/snaps${fmt === 'v' ? '-v' : ''}/${scene || 'global'}`);
fs.mkdirSync(out, { recursive: true });

const browser = await launch();
const { page, meta, logs } = await openStage(browser, scene && !a.full ? `solo=${scene}` : '', fmt);
const rec = scene ? meta.scenes.find(s => s.id.startsWith(scene)) : null;
if (scene && !rec) { console.error(`cena ${scene} não encontrada. Cenas: ${meta.scenes.map(s => s.id).join(', ')}`); process.exit(2); }
const base = rec ? rec.start : 0;
const span = rec ? rec.end - rec.start : meta.duration;

let times;
if (a.every) { const step = Number(a.every); times = []; for (let t = 0; t < span - 1e-6; t += step) times.push(+t.toFixed(3)); times.push(+(span - 1 / 30).toFixed(3)); }
else if (a.times) times = String(a.times).split(',').map(Number);
else times = [0, span * 0.25, span * 0.5, span * 0.75, span - 1 / 30].map(t => +t.toFixed(3));

const cdp = await page.context().newCDPSession(page);
const files = [];
for (const t of times) {
  const buf = await capture(page, cdp, base + t, 30, 'png');
  const f = path.join(out, `${scene || 'g'}_${String(t.toFixed(2)).padStart(6, '0')}.png`);
  fs.writeFileSync(f, buf);
  files.push({ f, t });
}
const meta2 = await page.evaluate(() => window.__meta());
await browser.close();

if (a.sheet || a.every || files.length > 1) {
  const sheet = path.join(out, 'sheet.png');
  const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
items = json.loads(sys.argv[1]); out = sys.argv[2]
tw, th = (640, 360) if sys.argv[3] == 'h' else (300, 533)
cols = (3 if len(items) > 4 else 2 if len(items) > 1 else 1) if sys.argv[3] == 'h' else (6 if len(items) > 6 else max(1, len(items)))
rows = (len(items) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw + (cols + 1) * 8, rows * (th + 38) + 8), (8, 4, 14))
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 18)
except Exception: font = ImageFont.load_default()
d = ImageDraw.Draw(sheet)
for i, it in enumerate(items):
    im = Image.open(it['f']).convert('RGB').resize((tw, th), Image.LANCZOS)
    x = 8 + (i % cols) * (tw + 8); y = 8 + (i // cols) * (th + 38)
    sheet.paste(im, (x, y + 26))
    d.text((x, y + 2), 't = %.2fs' % it['t'], fill=(196, 181, 253), font=font)
sheet.save(out)
`;
  try { execFileSync('python3', ['-c', py, JSON.stringify(files), sheet, fmt]); console.log(`folha de contato: ${sheet}`); } catch (e) { console.error('falha ao montar folha de contato', e.message); }
}
console.log(`quadros: ${files.map(x => x.f).join('\n')}`);
const errs = [...meta2.errors, ...logs];
if (errs.length) { console.log('\nERROS/AVISOS:'); for (const e of errs) console.log('  ' + e); } else console.log('sem erros de runtime');
if (rec) console.log(`cena ${rec.id}: start=${rec.start}s end=${rec.end}s (tempos acima são locais)`);
