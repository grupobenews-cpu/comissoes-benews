#!/usr/bin/env python3
"""Gera src/timing.js, src/scenes/manifest.js e storyboard/scenes/<id>.md a partir de storyboard/storyboard.json."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sb = json.load(open(os.path.join(ROOT, 'storyboard', 'storyboard.json')))
scenes = sb['scenes']
TAILS = json.load(open(os.path.join(ROOT, 'storyboard', 'tails.json'))) if os.path.exists(os.path.join(ROOT, 'storyboard', 'tails.json')) else {}

def slug(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9-]+', '-', s)
    return re.sub(r'-+', '-', s).strip('-')

timing = {}
files = []
for i, s in enumerate(scenes):
    sid = slug(s['id'])
    s['id'] = sid
    timing[sid] = {'start': s['start'], 'duration': s['duration'], 'tail': TAILS.get(sid, 0)}
    files.append(f'{sid}.js')

open(os.path.join(ROOT, 'src', 'timing.js'), 'w').write(
    '/* Gerado por tools/storyboard_sync.py a partir de storyboard/storyboard.json — não editar à mão. */\n'
    'window.MECCA_TIMING = ' + json.dumps(timing, indent=1) + ';\n')
open(os.path.join(ROOT, 'src', 'scenes', 'manifest.js'), 'w').write(
    '/* Gerado por tools/storyboard_sync.py — ordem das cenas. */\nwindow.MECCA_SCENES = ' + json.dumps(files) + ';\n')

os.makedirs(os.path.join(ROOT, 'storyboard', 'scenes'), exist_ok=True)

def scene_md(s, full=True):
    out = [f"### {s['id']} — {s['name']}", f"- início global: {s['start']} s · duração: {s['duration']} s · tail (sobreposição após o fim): {timing[s['id']]['tail']} s",
           f"- objetivo: {s['purpose']}", '', '**Texto na tela** (tempos relativos à cena):']
    for t in s['text']:
        out.append(f"- [{t['t_in']}–{t['t_out']} s] «{t['content']}» — estilo: {t['style']} — animação: {t['animation']}")
    if full:
        out += ['', f"**Layout:** {s['layout']}", '', f"**Visuais:** {s['visuals']}", '', f"**Coreografia:** {s['choreography']}", '']
    out.append(f"**Transição de saída:** {s['transition_out']}")
    if full:
        out.append('')
        out.append('**Cues de som** (tempo local): ' + '; '.join(f"{c['t']}s {c['kind']}" + (f" ({c.get('note')})" if c.get('note') else '') for c in s['sound_cues']))
    return '\n'.join(out)

for i, s in enumerate(scenes):
    prev = scenes[i - 1] if i > 0 else None
    nxt = scenes[i + 1] if i + 1 < len(scenes) else None
    md = [f"# Cena {i + 1}/{len(scenes)}: {s['id']}", '', '## Motivos visuais globais (valem para todas as cenas)', sb['global_motifs'], '',
          '## ESTA CENA (implemente exatamente isto)', scene_md(s, True), '']
    if prev:
        md += ['## Cena ANTERIOR (contexto para a transição de entrada — outra pessoa implementa)', scene_md(prev, True), '']
    if nxt:
        md += ['## Cena SEGUINTE (contexto para a transição de saída — outra pessoa implementa)', scene_md(nxt, True), '']
    open(os.path.join(ROOT, 'storyboard', 'scenes', f"{s['id']}.md"), 'w').write('\n'.join(md) + '\n')

json.dump(sb, open(os.path.join(ROOT, 'storyboard', 'storyboard.json'), 'w'), ensure_ascii=False, indent=1)
total = max(s['start'] + s['duration'] for s in scenes)
print(f"{len(scenes)} cenas · {total:.1f} s")
for s in scenes:
    print(f"  {s['start']:6.1f}  {s['duration']:5.1f}  {s['id']}")
