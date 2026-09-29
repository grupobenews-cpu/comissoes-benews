#!/usr/bin/env python3
"""Gera a trilha a partir dos cues do render, masteriza em -14 LUFS (pico real ≤ -1,5 dBTP) e junta ao vídeo.

  python3 tools/finalize.py [--video out/meccanismo-video-only.mp4] [--out out/meccanismo.mp4]
"""
import argparse, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--video', default=os.path.join(ROOT, 'out', 'meccanismo-video-only.mp4'))
ap.add_argument('--cues', default=os.path.join(ROOT, 'out', 'cues.json'))
ap.add_argument('--out', default=os.path.join(ROOT, 'out', 'meccanismo.mp4'))
ap.add_argument('--lufs', type=float, default=-14.0)
a = ap.parse_args()

import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
raw = os.path.join(ROOT, 'out', 'soundtrack-raw.wav')
master = os.path.join(ROOT, 'out', 'soundtrack.wav')

subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'audio.py'), '--cues', a.cues,
                '--arrangement', os.path.join(ROOT, 'tools', 'arrangement.json'), '--out', raw], check=True)

# loudnorm em duas passadas (modo linear)
p = subprocess.run([FF, '-hide_banner', '-i', raw, '-af', f'loudnorm=I={a.lufs}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True)
m = json.loads(re.findall(r'\{[^{}]+\}', p.stderr)[-1])
af = (f"loudnorm=I={a.lufs}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run([FF, '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', '48000', master], check=True)
os.remove(raw)
p = subprocess.run([FF, '-hide_banner', '-i', master, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
summ = p.stderr[p.stderr.rfind('Summary'):]
I = re.search(r'I:\s+(-?[\d.]+) LUFS', summ); TP = re.search(r'Peak:\s+(-?[\d.]+) dBFS', summ)
print(f"trilha masterizada: {I.group(1) if I else '?'} LUFS integrado, pico real {TP.group(1) if TP else '?'} dBTP")

if os.path.exists(a.video):
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', a.video, '-i', master, '-map', '0:v:0', '-map', '1:a:0',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', a.out], check=True)
    print('ok →', a.out, f'({os.path.getsize(a.out) / 1e6:.1f} MB)')
else:
    print('vídeo não encontrado; só a trilha foi gerada:', master)
