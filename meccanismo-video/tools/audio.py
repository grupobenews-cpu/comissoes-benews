#!/usr/bin/env python3
"""
Trilha sonora sintetizada do vídeo Meccanismo (120 BPM, Ré menor, i–VI–III–VII).

  python3 tools/audio.py --cues out/cues.json --arrangement tools/arrangement.json --out out/soundtrack.wav

- arrangement.json: lista de seções por compasso (1 compasso = 2 s) com as camadas ativas e parâmetros.
- cues.json: gerado pelo render (tempos dos impactos/whooshes/risers registrados pelas cenas).
Tudo é determinístico (sementes fixas).
"""
import argparse, json, math
import numpy as np
from scipy import signal

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
RNG = np.random.default_rng(20260929)

def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)

# Progressão i–VI–III–VII em Ré menor (acordes em MIDI, voicing aberto)
PROG = [
    {'root': 38, 'chord': [50, 53, 57, 62, 65]},  # Dm
    {'root': 34, 'chord': [50, 53, 58, 62, 65]},  # Bb (add D)
    {'root': 41, 'chord': [48, 53, 57, 60, 65]},  # F
    {'root': 36, 'chord': [48, 52, 55, 60, 64]},  # C
]

# ------------------------------------------------------------------ util
def env_adsr(n, a, d, s, r, sr=SR):
    a_n, d_n, r_n = int(a * sr), int(d * sr), int(r * sr)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([
        np.linspace(0, 1, max(a_n, 1), endpoint=False),
        np.linspace(1, s, max(d_n, 1), endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, max(r_n, 1)),
    ])
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]

def lp(x, fc, q=0.707, order=2):
    fc = min(max(fc, 20), SR * 0.45)
    b, a = signal.butter(order, fc / (SR / 2), 'low')
    return signal.lfilter(b, a, x)

def hp(x, fc, order=2):
    fc = min(max(fc, 20), SR * 0.45)
    b, a = signal.butter(order, fc / (SR / 2), 'high')
    return signal.lfilter(b, a, x)

def bp(x, lo, hi, order=2):
    lo = max(lo, 20); hi = min(hi, SR * 0.45)
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)

def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * freq + phase) % 1.0) - 1

def sweep_filter(x, f0, f1, kind='low', block=512, curve='exp'):
    """Filtro com corte variável (bloco a bloco, com estado)."""
    out = np.zeros_like(x)
    nb = int(math.ceil(len(x) / block))
    zi = None
    for i in range(nb):
        k = i / max(nb - 1, 1)
        fc = f0 * (f1 / f0) ** k if curve == 'exp' else f0 + (f1 - f0) * k
        fc = min(max(fc, 25), SR * 0.45)
        if kind == 'low':
            b, a = signal.butter(2, fc / (SR / 2), 'low')
        elif kind == 'high':
            b, a = signal.butter(2, fc / (SR / 2), 'high')
        else:
            lo, hi = fc / 1.6, min(fc * 1.6, SR * 0.45)
            b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
        seg = x[i * block:(i + 1) * block]
        if zi is None or len(zi) != max(len(a), len(b)) - 1:
            zi = signal.lfilter_zi(b, a) * 0
        y, zi = signal.lfilter(b, a, seg, zi=zi)
        out[i * block:i * block + len(seg)] = y
    return out

def place(buf, x, t, gain=1.0, pan=0.0):
    """Mistura mono x no buffer estéreo em t (s) com pan (-1..1, lei de potência constante)."""
    i = int(round(t * SR))
    if i >= buf.shape[1] or len(x) == 0:
        return
    j0 = max(0, i)
    x = x[j0 - i:]
    n = min(len(x), buf.shape[1] - j0)
    if n <= 0:
        return
    ang = (pan + 1) * math.pi / 4
    buf[0, j0:j0 + n] += x[:n] * gain * math.cos(ang)
    buf[1, j0:j0 + n] += x[:n] * gain * math.sin(ang)

def make_ir(dur=2.6, decay=2.2, seed=7):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * (6.9 / decay))
    L = r.standard_normal(n) * env
    R = r.standard_normal(n) * env
    L = lp(L, 6000); R = lp(R, 6000)
    pre = int(0.012 * SR)
    L = np.concatenate([np.zeros(pre), L]); R = np.concatenate([np.zeros(pre), R])
    return np.stack([L, R]) / np.sqrt(np.sum(L ** 2))

def reverb(buf, ir):
    out = np.zeros_like(buf)
    for c in range(2):
        y = signal.fftconvolve(buf[c], ir[c])[:buf.shape[1]]
        out[c] = y
    return out

# ------------------------------------------------------------------ instrumentos
def kick(vel=1.0):
    n = int(0.55 * SR)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(RNG.standard_normal(n) * np.exp(-t * 400), 2500) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9 * vel

def clap(vel=1.0):
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    noise = RNG.standard_normal(n)
    env = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = int(d * SR)
        env[i:] += np.exp(-(t[:n - i]) * (180 if k < 2 else 22))
    x = bp(noise * env, 900, 5200)
    return x * 0.55 * vel

def hat(vel=1.0, open_=False):
    n = int((0.28 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    x = hp(RNG.standard_normal(n), 7500) * np.exp(-t * (14 if open_ else 70))
    return x * 0.28 * vel

def tick(vel=1.0, pitch=1.0):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * pitch * t) * a for f, a in [(2860, 1), (4170, 0.6), (6230, 0.35)])
    x = x * np.exp(-t * 140) + hp(RNG.standard_normal(n), 3000) * np.exp(-t * 400) * 0.4
    return x * 0.22 * vel

def pad_chord(notes, dur, cutoff=1800, bright=0.0):
    n = int(dur * SR)
    x = np.zeros(n)
    for m in notes:
        f = midi_hz(m)
        for det in (-0.11, -0.04, 0.03, 0.09):
            x += saw(f * 2 ** (det / 12), n, phase=RNG.random()) * 0.12
    x = lp(x, cutoff * (1 + bright))
    x = lp(x, cutoff * 1.4 * (1 + bright))
    e = env_adsr(n, 0.35, 0.4, 0.85, 0.6)
    return x * e * 0.55

def sub_note(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi_hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return x * env_adsr(n, 0.02, 0.1, 0.9, 0.08) * 0.55

def bass_pluck(m, dur=0.24, cutoff=900):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi_hz(m)
    x = saw(f, n) * 0.6 + np.sin(2 * np.pi * f / 2 * t) * 0.6
    x = sweep_filter(x, cutoff * 2.2, cutoff * 0.5, 'low', block=256)
    return x * env_adsr(n, 0.004, 0.08, 0.6, 0.08) * 0.5

def arp_pluck(m, dur=0.22, cutoff=3000):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi_hz(m)
    x = (saw(f, n) + np.sign(np.sin(2 * np.pi * f * 1.003 * t)) * 0.5) * 0.5
    x = sweep_filter(x, cutoff * 1.8, cutoff * 0.35, 'low', block=256)
    return x * np.exp(-t * 11) * 0.32

def bell(m, dur=2.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi_hz(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 3)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.2)
    return x * 0.28

# ------------------------------------------------------------------ efeitos
def sfx_thump(g=1.0):
    # impacto leve (acentos secundários): corpo curto, pouco sub, sem cauda longa
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 60 + 90 * np.exp(-t * 25)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    snap = bp(RNG.standard_normal(n), 1200, 6000) * np.exp(-t * 45) * 0.35
    return np.tanh((body + snap) * 1.2) * 0.6 * g

def sfx_impact(g=1.0):
    if g < 0.65:
        return sfx_thump(g / 0.65 * 0.9)
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 30 + 45 * np.exp(-t * 7)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    crack = bp(RNG.standard_normal(n), 700, 7000) * np.exp(-t * 16) * 0.55
    thump = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 14) * 0.5
    return np.tanh((boom * 1.1 + crack + thump) * 1.3) * 0.8 * g

def sfx_whoosh(g=1.0, dur=0.9):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = RNG.standard_normal(n)
    y = sweep_filter(x, 350, 4200, 'band', block=256)
    env = np.sin(np.pi * t) ** 2
    return y * env * 0.9 * g

def sfx_riser(g=1.0, dur=2.0):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    noise = sweep_filter(RNG.standard_normal(n), 400, 9000, 'band', block=256) * 0.7
    f = 180 * (8 ** t)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.18 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.1
    env = t ** 2.2
    return (noise + tone) * env * 0.75 * g

def sfx_reverse(g=1.0, dur=1.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = hp(RNG.standard_normal(n), 3500) * np.exp(-t * 3.2)
    x += bell(62, dur)[:n] * 0.5
    return x[::-1] * 0.5 * g

def sfx_tick(g=1.0):
    return tick(1.8 * g, pitch=1.15)

def sfx_click(g=1.0):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 1650 * t) * np.exp(-t * 260) + hp(RNG.standard_normal(n), 4000) * np.exp(-t * 600) * 0.5
    return x * 0.45 * g

def sfx_subdrop(g=1.0):
    n = int(1.8 * SR)
    t = np.arange(n) / SR
    f = 26 + 64 * np.exp(-t * 2.6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) * 0.9 * g

def sfx_glitch(g=1.0, seed=3):
    r = np.random.default_rng(seed)
    n = int(0.36 * SR)
    x = np.zeros(n)
    i = 0
    while i < n:
        L = int(r.uniform(0.012, 0.045) * SR)
        kind = r.integers(0, 3)
        seg_t = np.arange(min(L, n - i)) / SR
        if kind == 0:
            seg = np.sign(np.sin(2 * np.pi * r.uniform(200, 1400) * seg_t))
        elif kind == 1:
            seg = r.standard_normal(len(seg_t))
        else:
            seg = np.zeros(len(seg_t))
        x[i:i + len(seg)] = seg * r.uniform(0.3, 1)
        i += L
    x = np.round(x * 6) / 6
    return hp(x, 300) * 0.28 * g

def sfx_chime(g=1.0):
    a = bell(74, 2.4)
    b = np.pad(bell(81, 2.2), (int(0.08 * SR), 0))
    b = np.pad(b, (0, max(0, len(a) - len(b))))[:len(a)]
    return (a + b * 0.7) * 0.8 * g

def sfx_stop(g=1.0):
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 380 * np.exp(-t * 4.5) + 40
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) * 0.4 * g

SFX = {
    'impact': (sfx_impact, 0.0), 'whoosh': (sfx_whoosh, 0.45), 'riser': (sfx_riser, 2.0), 'reverse': (sfx_reverse, 1.3),
    'tick': (sfx_tick, 0.0), 'click': (sfx_click, 0.0), 'sub-drop': (sfx_subdrop, 0.0), 'glitch': (sfx_glitch, 0.0),
    'chime': (sfx_chime, 0.0), 'stop': (sfx_stop, 0.0),
}

# ------------------------------------------------------------------ arranjo
def build_music(duration, arrangement):
    n = int(math.ceil(duration * SR)) + SR * 3
    dry = np.zeros((2, n))
    wet_send = np.zeros((2, n))
    kicks = []
    nbars = int(math.ceil(duration / BAR))
    sec_for_bar = {}
    for s in arrangement:
        for b in range(int(s['from']), int(s['to'])):
            sec_for_bar[b] = s
    for b in range(nbars):
        s = sec_for_bar.get(b)
        if not s:
            continue
        L = set(s.get('layers', []))
        t0 = b * BAR
        ch = PROG[(b + int(s.get('prog_offset', 0))) % 4]
        span = max(1, int(s['to']) - int(s['from']))
        k = (b - int(s['from'])) / span  # progresso dentro da seção
        cut0, cut1 = s.get('cutoff', [1400, 1400])
        cutoff = cut0 * (cut1 / cut0) ** k
        vol = s.get('gain', 1.0)
        if 'pad' in L:
            x = pad_chord(ch['chord'], BAR + 0.6, cutoff=cutoff)
            place(dry, x, t0, 0.55 * vol, -0.15); place(dry, x, t0 + 0.012, 0.55 * vol, 0.15)
            place(wet_send, x, t0, 0.5 * vol)
        if 'sub' in L:
            place(dry, sub_note(ch['root'], BAR), t0, 0.7 * vol)
        if 'bass' in L:
            for i in range(8):
                m = ch['root'] + (12 if i % 4 == 3 else 0)
                place(dry, bass_pluck(m, 0.24, cutoff * 0.6), t0 + i * BEAT / 2 + BEAT / 2 * 0.0, 0.8 * vol)
        if 'arp' in L:
            notes = ch['chord'][1:] + [ch['chord'][2] + 12]
            pattern = [0, 2, 1, 3, 4, 2, 3, 1]
            for i in range(16):
                m = notes[pattern[i % 8] % len(notes)] + 12
                x = arp_pluck(m, 0.22, cutoff * 1.8)
                pan = -0.35 if i % 2 == 0 else 0.35
                tt = t0 + i * BEAT / 4
                place(dry, x, tt, 0.55 * vol, pan)
                place(dry, x, tt + 0.375, 0.22 * vol, -pan)  # eco pontuado
                place(dry, x, tt + 0.75, 0.1 * vol, pan)
                place(wet_send, x, tt, 0.25 * vol)
        if 'kick' in L:
            for i in range(4):
                place(dry, kick(), t0 + i * BEAT, 0.95 * vol)
                kicks.append(t0 + i * BEAT)
        if 'kick-half' in L:
            for i in (0, 2):
                place(dry, kick(0.9), t0 + i * BEAT, 0.9 * vol)
                kicks.append(t0 + i * BEAT)
        if 'clap' in L:
            for i in (1, 3):
                x = clap()
                place(dry, x, t0 + i * BEAT, 0.8 * vol); place(wet_send, x, t0 + i * BEAT, 0.35 * vol)
        if 'hats' in L:
            for i in range(16):
                v = 1.0 if i % 4 == 2 else 0.45 if i % 2 == 1 else 0.25
                place(dry, hat(v, open_=(i % 8 == 6)), t0 + i * BEAT / 4, 0.8 * vol, 0.25 if i % 2 else -0.2)
        if 'ticks' in L:
            for i in range(8):
                place(dry, tick(1.0 if i % 2 == 0 else 0.55, pitch=1.0 if i % 4 else 1.3), t0 + i * BEAT / 2, 0.9 * vol, 0.4 if i % 2 else -0.4)
        if 'bell' in L and b % 2 == 0:
            place(dry, bell(ch['chord'][-1] + 12), t0, 0.35 * vol, 0.2)
            place(wet_send, bell(ch['chord'][-1] + 12), t0, 0.5 * vol)
    # sidechain (duck) nos kicks
    if kicks:
        g = np.ones(n)
        tt = np.arange(n) / SR
        for kt in kicks:
            i = int(kt * SR)
            j = min(n, i + int(0.35 * SR))
            g[i:j] = np.minimum(g[i:j], 1 - 0.55 * np.exp(-(tt[i:j] - kt) / 0.09))
        dry[:, :] *= 0.55 + 0.45 * g  # duck parcial (o kick também passa pelo ganho, mas o ataque dele fica intacto)
    return dry, wet_send

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cues', default='out/cues.json')
    ap.add_argument('--arrangement', default='tools/arrangement.json')
    ap.add_argument('--out', default='out/soundtrack.wav')
    ap.add_argument('--voice', default='', help='wav mono 48 kHz com a locução já posicionada (tools/voice.py)')
    a = ap.parse_args()
    cj = json.load(open(a.cues))
    arr = json.load(open(a.arrangement))
    duration = float(cj['duration'])
    sections = arr['sections']
    music, send = build_music(duration, sections)
    n = music.shape[1]
    sfx = np.zeros((2, n))
    sfx_send = np.zeros((2, n))
    cues = list(cj['cues']) + [dict(c, scene='arrangement') for c in arr.get('extra_cues', [])]
    cues.sort(key=lambda c: float(c['t']))
    for i, c in enumerate(cues):
        kind = c['kind']
        if kind not in SFX:
            continue
        fn, lead = SFX[kind]
        x = fn(float(c.get('gain', 1)))
        t = float(c['t']) - lead
        pan = ((i * 37) % 7 - 3) / 10.0
        place(sfx, x, t, 0.9, pan if kind in ('whoosh', 'tick', 'click', 'glitch') else 0)
        place(sfx_send, x, t, 0.35 if kind in ('impact', 'chime', 'reverse', 'whoosh') else 0.12)
    # "stop": derruba a música até o próximo compasso
    gain = np.ones(n)
    for c in cj['cues']:
        if c['kind'] == 'stop':
            i = int(float(c['t']) * SR)
            nxt = int(math.ceil((float(c['t']) + 1e-3) / BAR) * BAR * SR)
            ramp = int(0.25 * SR)
            gain[i:i + ramp] = np.minimum(gain[i:i + ramp], np.linspace(1, 0.05, len(gain[i:i + ramp])))
            gain[i + ramp:nxt] = np.minimum(gain[i + ramp:nxt], 0.05)
    for s in arr.get('duck', []):  # seções silenciosas explícitas {from_s, to_s, level}
        i0, i1 = int(s['from_s'] * SR), int(s['to_s'] * SR)
        gain[i0:i1] = np.minimum(gain[i0:i1], s.get('level', 0.1))
    gain = signal.filtfilt(*signal.butter(1, 12 / (SR / 2)), gain)  # suaviza as rampas
    music *= gain
    send *= gain
    # locução: envelope da voz controla o ducking da música, dos efeitos e da reverb
    voice = None
    if a.voice:
        from scipy.io import wavfile as _wf
        vsr, vv = _wf.read(a.voice)
        assert vsr == SR, 'a locução precisa estar em 48 kHz'
        vv = vv.astype(np.float64) / 32768.0
        voice = np.zeros(n)
        voice[:min(n, len(vv))] = vv[:n]
        # envelope com ataque rápido (~25 ms) e soltura lenta (~400 ms), antecipado em 60 ms
        rect = np.abs(voice)
        env = np.zeros(n)
        att, rel = np.exp(-1 / (0.025 * SR)), np.exp(-1 / (0.40 * SR))
        e = 0.0
        blk = 64
        for i in range(0, n, blk):
            v = rect[i:i + blk].max() if i < n else 0
            c = att if v > e else rel
            e = c ** blk * e + (1 - c ** blk) * v
            env[i:i + blk] = e
        env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1) if np.any(env > 1e-4) else env
        lead = int(0.06 * SR)
        env = np.concatenate([env[lead:], np.zeros(lead)])
        env = np.maximum(env, 0)
        duck_m = 1 - arr.get('duck_music', 0.62) * env
        duck_s = 1 - arr.get('duck_sfx', 0.35) * env
        music *= duck_m
        send *= duck_m
        sfx *= duck_s
        sfx_send *= duck_s
    ir = make_ir()
    wet = reverb(send + sfx_send, ir)
    mix = music * arr.get('music_gain', 0.8) + sfx * arr.get('sfx_gain', 0.85) + wet * arr.get('reverb_gain', 0.55)
    if voice is not None:
        # nível da voz: ~9 dB acima do bed nos trechos em que ela fala
        speaking = np.abs(signal.lfilter([1 - 0.999], [1, -0.999], voice ** 2)) > 1e-5
        bed_rms = np.sqrt(np.mean(np.sum(mix ** 2, axis=0)[speaking] / 2) + 1e-12)
        vo_rms = np.sqrt(np.mean(voice[speaking] ** 2) + 1e-12)
        vg = bed_rms * 10 ** (arr.get('voice_over_bed_db', 9) / 20) / vo_rms
        # saturação suave só no bed (a voz fica limpa) e depois soma a voz
        mix = np.tanh(mix * 1.15) / np.tanh(1.15)
        vroom = reverb(np.stack([voice, voice]) * 0.5, make_ir(dur=0.9, decay=0.45, seed=11))
        mix = mix + np.stack([voice, voice]) * vg + vroom * vg * arr.get('voice_room', 0.05)
        print(f'locução: ganho {20 * np.log10(vg):+.1f} dB · ducking música {arr.get("duck_music", 0.62)} · efeitos {arr.get("duck_sfx", 0.35)}')
    # final: corta 1 s após o fim do vídeo com fade
    end = int((duration) * SR)
    mix = mix[:, :end]
    fade = int(arr.get('fade_out', 2.5) * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
    fin = int(0.02 * SR)
    mix[:, :fin] *= np.linspace(0, 1, fin)
    # master: HP de limpeza, saturação suave, normalização
    mix = np.stack([hp(mix[0], 28), hp(mix[1], 28)])
    if voice is None:
        mix = np.tanh(mix * 1.15) / np.tanh(1.15)
    peak = np.max(np.abs(mix))
    mix = mix / peak * 10 ** (-1.0 / 20)
    rms = np.sqrt(np.mean(mix ** 2))
    print(f'duração {duration:.2f}s · pico -1.0 dBFS · RMS {20 * np.log10(rms):.1f} dBFS · {len(cj["cues"])} cues')
    from scipy.io import wavfile
    wavfile.write(a.out, SR, (mix.T * 32767).astype(np.int16))
    print('ok →', a.out)

if __name__ == '__main__':
    main()
