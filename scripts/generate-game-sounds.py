#!/usr/bin/env python3
"""Regenerates the Word Blitz and Connections cue WAVs in src/vocabulary/sounds/ (mono, 44.1 kHz, 16-bit).

Every cue is built from the same small instrument set so the games sound like one family:
  mallet  - soft marimba/kalimba bar: a few inharmonic partials with their own decay times, a gentle detuned double, and a short filtered-noise "strike"
  bell    - quiet glassy upper layer used only for success cues (2.76x partial family, fast decay)
  knock   - muted wooden knock: a low damped body tone plus a very short dull noise burst
  click   - tiny wood tick: band-limited noise transient with a short resonant ping
A few comb/all-pass taps add a little room so the sounds do not feel dry or synthetic. All cues are then
levelled to the same loudness (RMS over the first 350 ms) with a peak ceiling, then faded at both ends.
Run:  python3 scripts/generate-game-sounds.py   (needs numpy)
"""
import wave, pathlib
import numpy as np

SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'vocabulary' / 'sounds'
rng = np.random.default_rng(20261031)           # fixed seed: regenerating gives identical files
NOTE = {'C4':261.63,'D4':293.66,'E4':329.63,'G4':392.00,'A4':440.00,'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.25,'G5':783.99,'A5':880.00,'B5':987.77,'C6':1046.50,'D6':1174.66,'G6':1567.98}

def t_axis(d): return np.arange(int(SR * d)) / SR
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def highpass(x, fc): return x - lowpass(x, fc)
def place(buf, snd, at):
    i = int(at * SR); n = min(len(snd), len(buf) - i)
    if n > 0: buf[i:i + n] += snd[:n]

def mallet(f, d=0.5, gain=1.0, bright=1.0):
    t = t_axis(d); out = np.zeros_like(t)
    for ratio, amp, decay in ((1, 1.0, 9.0), (3.98, 0.32 * bright, 18.0), (9.6, 0.10 * bright, 34.0)):
        for det, w in ((1.0, 0.6), (1.0035, 0.4)):          # detuned double = warmth
            out += amp * w * np.sin(2 * np.pi * f * ratio * det * t + rng.uniform(0, 6.28)) * np.exp(-decay * t)
    strike = highpass(lowpass(rng.standard_normal(len(t)), 3200), 500) * np.exp(-t * 420) * 0.35   # felt-mallet transient
    out = out + strike
    out *= np.minimum(1, t / 0.002)                          # 2 ms attack, no click
    return out * gain

def bell(f, d=0.6, gain=0.25):
    t = t_axis(d); out = np.zeros_like(t)
    for ratio, amp, decay in ((1, 1.0, 5.5), (2.76, 0.5, 8.0), (5.4, 0.22, 14.0), (8.9, 0.08, 22.0)):
        out += amp * np.sin(2 * np.pi * f * ratio * t + rng.uniform(0, 6.28)) * np.exp(-decay * t)
    return out * np.minimum(1, t / 0.003) * gain

def knock(f=170.0, d=0.2, gain=1.0, dull=900):
    t = t_axis(d)
    body = np.sin(2 * np.pi * f * (1 + 0.18 * np.exp(-t * 60)) * t) * np.exp(-t * 38)   # slight pitch drop = wood, not beep
    body += 0.35 * np.sin(2 * np.pi * f * 2.3 * t) * np.exp(-t * 60)
    tap = lowpass(rng.standard_normal(len(t)), dull) * np.exp(-t * 260) * 0.7
    return (body + tap) * np.minimum(1, t / 0.0015) * gain

def click(d=0.05, gain=1.0, ping=2100.0):
    t = t_axis(d)
    n = highpass(lowpass(rng.standard_normal(len(t)), 4000), 1200) * np.exp(-t * 330)
    p = np.sin(2 * np.pi * ping * t) * np.exp(-t * 150) * 0.35
    return (n + p) * gain

def room(x, wet=0.16):
    out = x.copy()
    for delay, g in ((0.011, 0.38), (0.019, 0.27), (0.031, 0.18), (0.047, 0.10)):
        k = int(delay * SR); out[k:] += wet * g * x[:-k] * 3.0
    return lowpass(out, 9000)

def finish_fade(x, tail=0.04):
    n = int(tail * SR); x[-n:] *= np.linspace(1, 0, n) ** 2; return x

def render(spec, d):
    buf = np.zeros(int(SR * d))
    for at, snd in spec: place(buf, snd, at)
    return buf

# ---------------------------------------------------------------------------------------------- cues
CUES = {}
# Connections ---------------------------------------------------------------------------------
CUES['connections-solved'] = render([(0.0, mallet(NOTE['G4'], 0.45, 1.0)), (0.095, mallet(NOTE['D5'], 0.42, 0.95)), (0.095, bell(NOTE['D5'] * 2, 0.3, 0.16)), (0.0, bell(NOTE['G4'] * 2, 0.25, 0.08))], 0.42)
CUES['connections-wrong'] = render([(0.0, knock(165.0, 0.16, 0.9, 800)), (0.0, click(0.03, 0.12, 900.0))], 0.16)
CUES['connections-finish'] = render([(0.0, mallet(NOTE['C5'], 0.8)), (0.12, mallet(NOTE['E5'], 0.75)), (0.24, mallet(NOTE['G5'], 0.7)), (0.38, mallet(NOTE['C6'], 0.6, 1.0)),
                                      (0.38, bell(NOTE['C6'] * 2, 0.5, 0.12)), (0.38, bell(NOTE['E5'], 0.55, 0.12)), (0.38, bell(NOTE['G5'], 0.55, 0.10))], 0.85)
# Word Blitz -----------------------------------------------------------------------------------
CUES['blitz-correct'] = render([(0.0, click(0.04, 0.55)), (0.0, mallet(NOTE['A5'], 0.14, 0.8, 0.8))], 0.12)
CUES['blitz-wrong'] = render([(0.0, knock(135.0, 0.13, 0.9, 700))], 0.13)
CUES['blitz-tier-2'] = render([(0.0, click(0.04, 0.45)), (0.0, mallet(NOTE['E5'], 0.2, 0.8)), (0.07, mallet(NOTE['A5'], 0.28, 0.9)), (0.07, bell(NOTE['A5'] * 2, 0.2, 0.08))], 0.26)
CUES['blitz-tier-3'] = render([(0.0, click(0.04, 0.45)), (0.0, mallet(NOTE['E5'], 0.2, 0.8)), (0.07, mallet(NOTE['A5'], 0.22, 0.85)), (0.14, mallet(NOTE['C6'], 0.3, 0.9)), (0.14, bell(NOTE['C6'] * 2, 0.24, 0.11))], 0.34)
CUES['blitz-tier-4'] = render([(0.0, click(0.04, 0.45)), (0.0, mallet(NOTE['E5'], 0.2, 0.8)), (0.07, mallet(NOTE['A5'], 0.2, 0.85)), (0.14, mallet(NOTE['C6'], 0.22, 0.9)), (0.21, mallet(NOTE['E5'] * 2, 0.3, 0.95)),
                                (0.21, bell(NOTE['E5'] * 4, 0.3, 0.10)), (0.21, bell(NOTE['C6'], 0.36, 0.10))], 0.48)
CUES['blitz-timeout'] = render([(0.0, mallet(NOTE['G4'], 0.3, 0.9, 0.7)), (0.16, mallet(NOTE['D4'], 0.36, 0.9, 0.7))], 0.46)
CUES['blitz-finish'] = render([(0.0, mallet(NOTE['G4'], 0.9)), (0.10, mallet(NOTE['B4'], 0.85)), (0.20, mallet(NOTE['D5'], 0.8)), (0.32, mallet(NOTE['G5'], 0.7)), (0.46, mallet(NOTE['B5'], 0.5, 0.8)),
                               (0.46, bell(NOTE['G5'], 0.6, 0.13)), (0.46, bell(NOTE['D5'], 0.6, 0.11)), (0.46, bell(NOTE['G6'], 0.4, 0.07))], 0.95)

# ---------------------------------------------------------------------------------------------- level + write
TARGET_RMS = 10 ** (-21.0 / 20)      # RMS of the first 350 ms (or the whole cue if shorter)
PEAK = 10 ** (-3.0 / 20)             # -3 dBFS ceiling
for name, x in CUES.items():
    x = room(x)
    x = finish_fade(x, 0.03 if len(x) / SR < 0.2 else 0.06)
    k = int(0.0008 * SR); x[:k] *= np.linspace(0, 1, k)      # 0.8 ms onset ramp: no pop at the start
    head = x[: int(0.35 * SR)]
    gain = TARGET_RMS / (np.sqrt(np.mean(head ** 2)) + 1e-9)
    gain = min(gain, PEAK / (np.max(np.abs(x)) + 1e-9) * 1.0)
    x = x * gain
    pcm = np.int16(np.clip(x, -1, 1) * 32767)
    with wave.open(str(OUT / f'{name}.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f'{name:20s} {len(x)/SR*1000:5.0f} ms  peak {20*np.log10(np.max(np.abs(x))+1e-12):6.1f} dBFS  rms350 {20*np.log10(np.sqrt(np.mean(x[:int(.35*SR)]**2))+1e-12):6.1f} dBFS')
