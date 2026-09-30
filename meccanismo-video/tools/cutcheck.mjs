// Verifica os match cuts no vídeo completo: último quadro da cena N vs primeiro da N+1.
//   node tools/cutcheck.mjs [--out out/snaps/cuts]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { args, launch, openStage, capture, ROOT } from './lib.mjs';
const a = args();
const fmt = a.format === 'v' ? 'v' : 'h';
const out = path.resolve(ROOT, a.out || (fmt === 'v' ? 'out/snaps-v/cuts' : 'out/snaps/cuts'));
fs.mkdirSync(out, { recursive: true });
const b = await launch();
const { page, meta, logs } = await openStage(b, '', fmt);
const cdp = await page.context().newCDPSession(page);
const cuts = meta.scenes.slice(1).map(s => s.start);
const pairs = [];
for (const T of cuts) {
  // caminho sequencial curto até o corte (como no render)
  for (let t = T - 0.5; t < T - 1 / 30 - 1e-6; t += 1 / 30) await page.evaluate(tt => window.__seek(tt), t);
  const A = path.join(out, `cut_${T}_a.png`), B = path.join(out, `cut_${T}_b.png`);
  fs.writeFileSync(A, await capture(page, cdp, T - 1 / 30, 30, 'png'));
  fs.writeFileSync(B, await capture(page, cdp, T, 30, 'png'));
  pairs.push({ T, A, B });
}
const m2 = await page.evaluate(() => window.__meta());
await b.close();
const py = `
import sys, json
import numpy as np
from PIL import Image, ImageDraw
pairs = json.loads(sys.argv[1]); out = sys.argv[2]
rows = []
for p in pairs:
    a = np.asarray(Image.open(p['A']).convert('RGB')).astype(int); b = np.asarray(Image.open(p['B']).convert('RGB')).astype(int)
    d = np.abs(a - b).max(axis=2)
    frac = (d > 40).mean() * 100
    print(f"corte {p['T']:6.1f}s  diff médio {d.mean():5.2f}  pixels >40: {frac:5.2f}%  máx {d.max()}")
    tw, th = (640, 360) if a.shape[1] > a.shape[0] else (270, 480)
    ia = Image.open(p['A']).convert('RGB').resize((tw, th)); ib = Image.open(p['B']).convert('RGB').resize((tw, th))
    dd = Image.fromarray(np.clip(d * 4, 0, 255).astype('uint8')).convert('RGB').resize((tw, th))
    row = Image.new('RGB', (tw * 3 + 16, th + 30), (8, 4, 14)); row.paste(ia, (0, 30)); row.paste(ib, (tw + 8, 30)); row.paste(dd, (2 * tw + 16, 30))
    ImageDraw.Draw(row).text((6, 6), f"corte {p['T']}s   [N: ultimo quadro]   [N+1: primeiro quadro]   [diferenca x4]   >40: {frac:.2f}%", fill=(196, 181, 253))
    rows.append(row)
sheet = Image.new('RGB', (rows[0].width, sum(r.height for r in rows)))
y = 0
for r in rows: sheet.paste(r, (0, y)); y += r.height
sheet.save(out)
`;
execFileSync('python3', ['-c', py, JSON.stringify(pairs), path.join(out, 'cuts.png')], { stdio: 'inherit' });
const errs = [...m2.errors, ...logs];
console.log(errs.length ? 'ERROS:\n' + errs.join('\n') : 'sem erros de runtime');
