#!/usr/bin/env python3
"""Monta a trilha de locução a partir dos clipes em audio/vo/ e do plano audio/vo/plan.json.

  python3 tools/voice.py --analyze          # lista os segmentos de fala de cada clipe
  python3 tools/voice.py --out out/voice.wav # gera a locução posicionada na linha do tempo (48 kHz mono)

plan.json: lista de colocações {clip, segs: [i, ...] | "all", at: segundos globais, tempo: 1.0, gap: s entre segmentos (opcional)}.
Os segmentos são trechos de fala detectados por energia (pausas ≥ 0,3 s separam segmentos).
"""
import argparse, json, os, subprocess
import numpy as np
from scipy import signal
import imageio_ffmpeg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(ROOT, 'audio', 'vo')
SR = 48000
FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(path, tempo=1.0):
    af = ['-af', f'atempo={tempo:.4f}'] if abs(tempo - 1) > 1e-3 else []
    raw = subprocess.run([FF, '-v', 'error', '-i', path, *af, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def segments(x, thr_db=-36, min_gap=0.3, min_len=0.12, pad=0.03):
    hop = int(0.01 * SR)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / (rms.max() + 1e-12))
    on = db > thr_db
    segs, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            segs.append([i, j])
            i = j
        else:
            i += 1
    merged = []
    for s in segs:
        if merged and (s[0] - merged[-1][1]) * 0.01 < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    out = []
    for a, b in merged:
        if (b - a) * 0.01 < min_len:
            continue
        out.append((max(0, a * 0.01 - pad), min(len(x) / SR, b * 0.01 + pad)))
    return out


def process(v):
    """Cadeia de voz: HPF, presença, compressão suave, normalização de pico."""
    b, a = signal.butter(2, 90 / (SR / 2), 'high')
    v = signal.lfilter(b, a, v)
    # presença (+2,5 dB em ~3,2 kHz, peaking)
    f0, g, q = 3200, 2.5, 0.9
    A = 10 ** (g / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    bb = [1 + al * A, -2 * np.cos(w), 1 - al * A]; aa = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    v = signal.lfilter(np.array(bb) / aa[0], np.array(aa) / aa[0], v)
    # compressor RMS simples (razão 3:1 acima de -22 dBFS)
    env = np.sqrt(signal.lfilter([1 - 0.995], [1, -0.995], v ** 2) + 1e-12)
    lvl = 20 * np.log10(env)
    over = np.maximum(0, lvl - (-22))
    gain = 10 ** (-(over * (1 - 1 / 3)) / 20)
    v = v * gain
    return v / (np.max(np.abs(v)) + 1e-9) * 0.89


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--analyze', action='store_true')
    ap.add_argument('--out', default=os.path.join(ROOT, 'out', 'voice.wav'))
    ap.add_argument('--duration', type=float, default=100.0)
    a = ap.parse_args()
    if a.analyze:
        for f in sorted(os.listdir(VO)):
            if not f.endswith('.mp3'):
                continue
            x = load(os.path.join(VO, f))
            segs = segments(x)
            print(f"{f:10} {len(x) / SR:5.2f}s  " + '  '.join(f"[{i}] {s:.2f}–{e:.2f}" for i, (s, e) in enumerate(segs)))
        return
    plan = json.load(open(os.path.join(VO, 'plan.json')))
    track = np.zeros(int((a.duration + 2) * SR))
    report = []
    for p in plan['placements']:
        x = load(os.path.join(VO, p['clip'] + '.mp3'), p.get('tempo', 1.0))
        segs = segments(x)
        idx = range(len(segs)) if p.get('segs', 'all') == 'all' else p['segs']
        parts = []
        for k, i in enumerate(idx):
            s, e = segs[i]
            chunk = x[int(s * SR):int(e * SR)].copy()
            fade = int(0.012 * SR)
            chunk[:fade] *= np.linspace(0, 1, fade); chunk[-fade:] *= np.linspace(1, 0, fade)
            if k > 0:
                gap = p.get('gap')
                if gap is None:
                    gap = segs[i][0] - segs[list(idx)[k - 1]][1]
                parts.append(np.zeros(int(gap * SR)))
            parts.append(chunk)
        clip = np.concatenate(parts)
        i0 = int(p['at'] * SR)
        track[i0:i0 + len(clip)] += clip
        report.append((p['at'], p['at'] + len(clip) / SR, p['clip'], p.get('text', '')))
    report.sort()
    for k, (s, e, c, t) in enumerate(report):
        warn = ''
        if k + 1 < len(report) and e > report[k + 1][0] - 0.12:
            warn = f'  ⚠ encosta/sobrepõe {report[k + 1][2]}'
        print(f"{s:7.2f}–{e:7.2f}  {c}  {t}{warn}")
    track = process(track[:int(a.duration * SR)])
    from scipy.io import wavfile
    wavfile.write(a.out, SR, (track * 32767).astype(np.int16))
    print('ok →', a.out)


if __name__ == '__main__':
    main()
