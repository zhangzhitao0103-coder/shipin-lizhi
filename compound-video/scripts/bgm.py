"""
Procedurally generated, royalty-free soft background music (30 s, 48 kHz stereo).
Warm pad chords that change on the scene boundaries + sparse soft bell notes,
light reverb. Output: assets/bgm.wav

Usage: python3 scripts/bgm.py
"""
import os
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 30.0
N = int(SR * DUR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# (start, end, chord midi notes) aligned with the scenes
CHORDS = [
    (0.0, 4.2, [48, 55, 64, 71, 74]),       # Cmaj9
    (4.0, 9.2, [45, 52, 60, 67, 71]),       # Am9
    (9.0, 13.2, [41, 48, 57, 64, 67]),      # Fmaj9
    (13.0, 17.2, [43, 50, 59, 62, 69]),     # G6/9
    (17.0, 20.2, [45, 52, 60, 64, 67]),     # Am7
    (20.0, 23.2, [38, 45, 53, 60, 64]),     # Dm9
    (23.0, 26.6, [41, 48, 57, 64, 69]),     # Fmaj7
    (26.4, 30.0, [48, 55, 64, 67, 74]),     # Cadd9 (resolution)
]

# sparse bell notes (time, midi)
BELLS = [(0.5, 76), (2.2, 79), (4.6, 72), (6.4, 76), (9.4, 77), (11.2, 81), (13.4, 79),
         (15.4, 83), (17.6, 72), (19.4, 76), (21.2, 74), (23.4, 81), (25.0, 76), (26.6, 79),
         (28.0, 84)]


def pad_voice(f, t, detune):
    ph = rng.uniform(0, 2 * np.pi, 3)
    x = np.zeros_like(t)
    for k, amp in [(1, 1.0), (2, 0.28), (3, 0.10), (4, 0.04)]:
        x += amp * np.sin(2 * np.pi * f * k * (1 + detune) * t + ph[k - 1 if k <= 3 else 2])
    # slow tremolo for movement
    return x * (1 + 0.08 * np.sin(2 * np.pi * 0.23 * t + ph[0]))


L = np.zeros(N)
R = np.zeros(N)
for (a, b, notes) in CHORDS:
    i0, i1 = int(a * SR), min(N, int((b + 1.6) * SR))
    t = t_all[i0:i1] - a
    length = b - a
    env = np.clip(t / 1.4, 0, 1) ** 1.5                        # soft attack
    env *= np.clip((length + 1.6 - t) / 1.8, 0, 1)            # release into next chord
    for j, m in enumerate(notes):
        f = midi_hz(m)
        g = 0.22 if j == 0 else 0.16
        L[i0:i1] += g * env * pad_voice(f, t, -0.0018 * (j % 2 + 1))
        R[i0:i1] += g * env * pad_voice(f, t, +0.0018 * (j % 2 + 1))

for (a, m) in BELLS:
    i0 = int(a * SR)
    i1 = min(N, i0 + int(3.5 * SR))
    t = t_all[i0:i1] - a
    f = midi_hz(m)
    env = (1 - np.exp(-t / 0.006)) * np.exp(-t / 0.9)
    x = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2.01 * f * t) * np.exp(-t / 0.3)
         + 0.08 * np.sin(2 * np.pi * 3.98 * f * t) * np.exp(-t / 0.15))
    pan = rng.uniform(0.35, 0.65)
    L[i0:i1] += 0.10 * env * x * (1 - pan) * 2
    R[i0:i1] += 0.10 * env * x * pan * 2

# simple one-pole low-pass to keep it soft
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y

try:
    from scipy.signal import lfilter
    def lowpass(x, fc):  # noqa: F811
        a = np.exp(-2 * np.pi * fc / SR)
        return lfilter([1 - a], [1, -a], x)
except ImportError:
    pass

L, R = lowpass(L, 3200), lowpass(R, 3200)

# light reverb: convolution with decaying noise
ir_len = int(2.2 * SR)
ir_t = np.arange(ir_len) / SR
for ch in (0, 1):
    ir = rng.standard_normal(ir_len) * np.exp(-ir_t / 0.55)
    ir[0] = 0
    ir /= np.sqrt((ir ** 2).sum())
    src = L if ch == 0 else R
    wet = np.fft.irfft(np.fft.rfft(src, 2 * N) * np.fft.rfft(ir, 2 * N))[:N]
    if ch == 0:
        Lw = 0.78 * src + 0.35 * wet
    else:
        Rw = 0.78 * src + 0.35 * wet

out = np.stack([Lw, Rw], 1)
fade_in = np.clip(t_all / 1.2, 0, 1)
fade_out = np.clip((DUR - t_all) / 2.0, 0, 1)
out *= (fade_in * fade_out)[:, None]
out *= 0.5 / np.abs(out).max()
sf.write(os.path.join(ROOT, "assets", "bgm.wav"), out.astype(np.float32), SR, subtype="PCM_16")
print("assets/bgm.wav written")
