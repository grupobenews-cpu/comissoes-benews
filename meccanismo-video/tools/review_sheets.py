#!/usr/bin/env python3
"""Extrai quadros de um MP4 e monta folhas de contato por trecho, para revisão.

  python3 tools/review_sheets.py out/preview-video-only.mp4 [--fps 4] [--seg 10] [--out out/review]
Saída: out/review/frames/t_<seg>.<cs>.jpg (1920×1080) e out/review/sheet_<ini>-<fim>.jpg (grade com rótulo de tempo).
"""
import argparse, glob, os, subprocess
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--fps', type=float, default=4)
ap.add_argument('--seg', type=float, default=10)
ap.add_argument('--out', default='out/review')
a = ap.parse_args()
FF = imageio_ffmpeg.get_ffmpeg_exe()
fdir = os.path.join(a.out, 'frames')
os.makedirs(fdir, exist_ok=True)
for f in glob.glob(os.path.join(fdir, '*.jpg')):
    os.remove(f)
subprocess.run([FF, '-y', '-loglevel', 'error', '-i', a.video, '-vf', f'fps={a.fps}', '-q:v', '3', os.path.join(fdir, 'raw_%05d.jpg')], check=True)
raws = sorted(glob.glob(os.path.join(fdir, 'raw_*.jpg')))
frames = []
for i, f in enumerate(raws):
    t = i / a.fps
    nf = os.path.join(fdir, f't_{t:07.3f}.jpg')
    os.rename(f, nf)
    frames.append((t, nf))
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 16)
except Exception:
    font = ImageFont.load_default()
tw, th, cols = 384, 216, 5
t0 = 0.0
dur = frames[-1][0] + 1 / a.fps
while t0 < dur - 1e-6:
    seg = [(t, f) for t, f in frames if t0 - 1e-6 <= t < t0 + a.seg - 1e-6]
    rows = (len(seg) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 26) + 6), (8, 4, 14))
    d = ImageDraw.Draw(sheet)
    for k, (t, f) in enumerate(seg):
        x = 6 + (k % cols) * (tw + 6); y = 6 + (k // cols) * (th + 26)
        sheet.paste(Image.open(f).resize((tw, th), Image.LANCZOS), (x, y + 20))
        d.text((x, y + 2), f'{t:6.2f}s', fill=(196, 181, 253), font=font)
    sheet.save(os.path.join(a.out, f'sheet_{int(t0):03d}-{int(t0 + a.seg):03d}.jpg'), quality=88)
    t0 += a.seg
print(f'{len(frames)} quadros em {fdir}; folhas em {a.out}/sheet_*.jpg')
