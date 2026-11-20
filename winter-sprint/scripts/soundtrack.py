"""
Procedural soundtrack (royalty-free): music bed + sound effects.

Reads assets/events.json (visual beats exported by `node scripts/render.mjs --events`)
and writes assets/music.wav and assets/sfx.wav (48 kHz stereo, 60 s).

Music (D minor → D major):
  intro      drone + tension                       0 → B
  build 1    bass pulse + pad chords, kick, hats   B → I
  build 2    taiko + string ostinato, crescendo    I → J
  breakdown  near silence, dark pad (heartbeat in SFX)   J → crack
  climax     full drums, Bb–C–D major, sunrise     crack → end, ring-out
"""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(3)

data = json.load(open(os.path.join(ROOT, "assets", "events.json")))
EV, T = data["events"], data["times"]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos"), x)


def saw(f, n, ph=0.0):
    t = np.arange(n) / SR
    return 2 * ((f * t + ph) % 1.0) - 1


def add(bus, x, t0, gain=1.0, pan=0.5):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    if i0 < 0:
        x = x[-i0:]
        i0 = 0
    x = x[: N - i0]
    l, r = np.cos(pan * np.pi / 2), np.sin(pan * np.pi / 2)
    bus[i0:i0 + len(x), 0] += x * gain * l * 1.41
    bus[i0:i0 + len(x), 1] += x * gain * r * 1.41


def env_adsr(n, a, r):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-3))
    tail = n / SR - t
    return e * np.minimum(1, tail / max(r, 1e-3))


def reverb(x, secs=2.2, decay=0.5, mix=0.3, seed=1):
    g = np.random.default_rng(seed)
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = g.standard_normal(n) * np.exp(-t / decay)
        ir = lp(ir, 6000)
        ir /= np.sqrt((ir ** 2).sum())
        out[:, ch] = x[:, ch] + mix * fftconvolve(x[:, ch], ir)[: len(x)]
    return out


# ============================================================ MUSIC
music = np.zeros((N, 2))
B, I, J, CR, K, END = T["B"], T["I"], T["J"], T["crack"], T["K"], T["end"]


def pad(notes, t0, t1, cutoff=1800, gain=0.05, a=0.8, r=1.4):
    n = int((t1 - t0 + r) * SR)
    for j, m in enumerate(notes):
        f = hz(m)
        for det, pan in [(-0.006, 0.2), (0.0, 0.5), (0.006, 0.8)]:
            x = lp(saw(f * (1 + det), n, rng.random()), cutoff) * env_adsr(n, a, r)
            add(music, x, t0, gain, pan)


# intro drone (D1 + D2) swelling into the big hit
n = int((B + 1.0) * SR)
tt = np.arange(n) / SR
drone = (np.sin(2 * np.pi * hz(26) * tt) * 0.8 + lp(saw(hz(38), n), 300) * 0.5) * env_adsr(n, 1.2, 1.0)
add(music, drone, 0.0, 0.32)

# chord progression for build sections (Dm – Bb – F – C), 4 s per chord
PROG = [[50, 53, 57, 62], [46, 50, 53, 58], [45, 48, 53, 57], [43, 48, 52, 55]]
BASS = [38, 34, 41, 36]
BEAT = 0.5
t = B
k = 0
while t < J - 0.05:
    t1 = min(t + 4.0, J)
    build = (t - B) / (J - B)
    pad(PROG[k % 4], t, t1, cutoff=1200 + 2000 * build, gain=0.032 + 0.03 * build, r=0.6)
    # bass pulse: 8th notes
    s = t
    while s < t1 - 0.01:
        nn = int(0.24 * SR)
        x = lp(saw(hz(BASS[k % 4]), nn), 700 + 900 * build) * np.exp(-np.arange(nn) / SR / 0.12)
        add(music, x, s, 0.16 + 0.08 * build, 0.5)
        s += 0.25
    t = t1
    k += 1

# string ostinato (16ths, upper octave) in build 2
t = I
k = 0
arp = [[62, 65, 69, 65], [58, 62, 65, 62], [57, 60, 65, 60], [55, 60, 64, 60]]
while t < J - 0.05:
    chord = arp[int((t - B) // 4.0) % 4]
    nn = int(0.12 * SR)
    f = hz(chord[k % 4] + 12)
    x = lp(saw(f, nn) + 0.5 * saw(f * 1.004, nn), 3500) * np.exp(-np.arange(nn) / SR / 0.06)
    cres = (t - I) / (J - I)
    add(music, x, t, 0.03 + 0.05 * cres, 0.3 + 0.4 * (k % 2))
    t += 0.125
    k += 1


def kick():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 45 + 110 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.18) + 0.3 * hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.004)


def taiko():
    n = int(0.8 * SR)
    tt = np.arange(n) / SR
    f = 62 + 40 * np.exp(-tt / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.35)
    skin = bp(rng.standard_normal(n), 150, 900) * np.exp(-tt / 0.06)
    return body + 0.6 * skin


def hat():
    n = int(0.06 * SR)
    return hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR / 0.012)


def snare():
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1200, 6000) * np.exp(-tt / 0.08) + 0.4 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / 0.05)


KICK, TAIKO, HAT, SNARE = kick(), taiko(), hat(), snare()
# build 1 drums: soft kick on beats from shot D, hats from shot F
t = T.get("D", B)
while t < I:
    add(music, KICK, t, 0.22)
    t += BEAT
t = T.get("F", B)
while t < I:
    add(music, HAT, t + 0.25, 0.05, 0.65)
    t += BEAT
# build 2: taiko pattern + snare backbeat
t, beat = I, 0
while t < J - 0.1:
    cres = (t - I) / (J - I)
    add(music, KICK, t, 0.3)
    if beat % 4 in (0, 2):
        add(music, TAIKO, t, 0.25 + 0.2 * cres, 0.4)
    if beat % 4 == 3:
        add(music, TAIKO, t + 0.25, 0.2 + 0.2 * cres, 0.6)
    if beat % 2 == 1:
        add(music, SNARE, t, 0.12 + 0.1 * cres)
    add(music, HAT, t + 0.25, 0.06, 0.65)
    t += BEAT
    beat += 1
# snare roll into the breakdown
t = J - 1.5
while t < J - 0.05:
    add(music, SNARE, t, 0.06 + 0.16 * (t - J + 1.5) / 1.5)
    t += 0.0625

# breakdown: dark sustained pad + sub
pad([38, 45, 50, 52], J, CR, cutoff=700, gain=0.045, a=0.4, r=0.3)
n = int((CR - J + 0.2) * SR)
add(music, np.sin(2 * np.pi * hz(26) * np.arange(n) / SR) * env_adsr(n, 0.3, 0.2), J, 0.25)

# climax: Bb – C – D (major) …, full drums until the final hit
CLIMAX = [(CR, [46, 50, 53, 58, 62], 34), (CR + 1.3, [48, 52, 55, 60, 64], 36), (K, [50, 54, 57, 62, 66], 38)]
for i, (t0, notes, bass) in enumerate(CLIMAX):
    t1 = CLIMAX[i + 1][0] if i + 1 < len(CLIMAX) else DUR
    pad(notes, t0, t1, cutoff=3200, gain=0.05, a=0.05 if i == 0 else 0.3, r=1.5 if i == 2 else 0.4)
    pad([m + 12 for m in notes[2:]], t0, t1, cutoff=5000, gain=0.018, a=0.3, r=1.5)
    nn = int((t1 - t0) * SR)
    add(music, lp(saw(hz(bass), nn), 400) * env_adsr(nn, 0.02, 0.6), t0, 0.15)
t, beat = CR, 0
while t < END - 0.05:
    add(music, KICK, t, 0.32)
    if beat % 2 == 0:
        add(music, TAIKO, t, 0.32, 0.45)
    if beat % 2 == 1:
        add(music, SNARE, t, 0.16)
    add(music, HAT, t + 0.25, 0.07, 0.6)
    t += BEAT
    beat += 1
# sunrise shimmer
for j, (dt, m) in enumerate([(0, 74), (0.25, 78), (0.5, 81), (0.75, 86), (1.0, 81), (1.25, 78)] * 3):
    t0 = K + 0.2 + dt + (j // 6) * 1.6
    nn = int(1.6 * SR)
    tt = np.arange(nn) / SR
    x = (np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.01 * tt)) * np.exp(-tt / 0.5)
    add(music, x, t0, 0.035, 0.3 + 0.4 * (j % 2))

music = reverb(music, secs=2.6, decay=0.6, mix=0.35, seed=5)
fade = np.ones(N)
fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 2
music *= fade[:, None]

# ============================================================ SFX
sfx = np.zeros((N, 2))


def noise(n):
    return rng.standard_normal(n)


def s_tick():
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    return bp(noise(n), 2000, 7000) * np.exp(-tt / 0.004) + 0.5 * np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / 0.01)


def s_heart():
    out = np.zeros(int(0.6 * SR))
    for dt, g in [(0, 1), (0.2, 0.7)]:
        n = int(0.25 * SR)
        tt = np.arange(n) / SR
        x = np.sin(2 * np.pi * (48 + 30 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.09)
        out[int(dt * SR):int(dt * SR) + n] += g * x
    return lp(out, 200)


def s_boom(length=1.6, f0=60, f1=28):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt / 0.15)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (length * 0.45))


def s_impact():
    n = int(1.4 * SR)
    tt = np.arange(n) / SR
    x = s_boom(1.4, 90, 35) * 0.9
    x += lp(noise(n), 2500) * np.exp(-tt / 0.06) * 0.8
    x += bp(noise(n), 2000, 9000) * np.exp(-tt / 0.012) * 0.4
    return x


def s_big():
    n = int(2.5 * SR)
    tt = np.arange(n) / SR
    x = np.zeros(n)
    x[: int(1.4 * SR)] += s_impact() * 1.1
    x += s_boom(2.5, 70, 26) * 0.9
    braam = sum(lp(saw(hz(m), n, rng.random()), 500) for m in (26, 33, 38, 45)) / 3
    x += braam * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.9) * 0.6
    x += hp(noise(n), 3500) * np.exp(-tt / 0.5) * 0.25   # crash
    return x


def s_hit():
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    return s_boom(0.6, 120, 45) * 0.8 + lp(noise(n), 3000) * np.exp(-tt / 0.03) * 0.5


def s_whoosh(length=0.5):
    n = int(length * SR)
    tt = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(tt / length, 0, 1)) ** 2
    return bp(noise(n), 300, 3500) * e


def s_riser(length):
    n = int(length * SR)
    tt = np.arange(n) / SR
    k = tt / length
    f = 150 * (1 + 7 * k ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    nz = hp(noise(n), 1500) * 0.6
    return (tone + nz * k) * k ** 2


def s_stamp():
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * (70 + 80 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.1)
            + bp(noise(n), 600, 2500) * np.exp(-tt / 0.03) * 0.9)


def s_crack(length=0.45):
    n = int(length * SR)
    x = np.zeros(n)
    g = np.random.default_rng(9)
    times = np.sort(g.random(40) ** 2 * length * 0.8)
    for tc in times:
        i = int(tc * SR)
        m = int(0.004 * SR)
        x[i:i + m] += hp(g.standard_normal(m), 2500) * g.uniform(0.3, 1.0)
    tt = np.arange(n) / SR
    x += s_boom(length, 110, 50)[:n] * 0.6
    x += bp(noise(n), 3000, 10000) * np.exp(-tt / 0.05) * 0.3
    return x


def s_shatter():
    n = int(1.4 * SR)
    x = np.zeros(n)
    g = np.random.default_rng(13)
    for _ in range(70):
        i = int(g.random() ** 1.6 * 1.0 * SR)
        m = int(0.25 * SR)
        tt = np.arange(m) / SR
        f = g.uniform(2500, 8000)
        x[i:i + m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / g.uniform(0.02, 0.08)) * g.uniform(0.1, 0.4)
    tt = np.arange(n) / SR
    x += hp(noise(n), 4000) * np.exp(-tt / 0.25) * 0.4
    return x


def s_flip():
    n = int(0.2 * SR)
    tt = np.arange(n) / SR
    return bp(noise(n), 1500, 7000) * np.sin(np.pi * tt / 0.2) * (0.6 + 0.4 * np.sin(2 * np.pi * 35 * tt))


def s_scan(length=1.1):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = 700 + 500 * tt / length
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * tt))
    return x * env_adsr(n, 0.05, 0.2) * 0.4 + bp(noise(n), 2000, 6000) * 0.08


def s_brush():
    n = int(0.28 * SR)
    tt = np.arange(n) / SR
    return bp(noise(n), 800, 5000) * np.sin(np.pi * tt / 0.28) ** 2 * np.exp(-tt / 0.2)


def s_burst():
    n = int(1.2 * SR)
    x = np.zeros(n)
    g = np.random.default_rng(21)
    for _ in range(30):
        i = int(g.random() * 0.6 * SR)
        m = int(0.4 * SR)
        tt = np.arange(m) / SR
        x[i:i + m] += np.sin(2 * np.pi * g.uniform(3000, 9000) * tt) * np.exp(-tt / 0.06) * 0.25
    return x


def s_shine():
    n = int(2.5 * SR)
    tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt / 1.0) for m in (86, 90, 93, 98)) * 0.2


GAIN = dict(tick=0.35, heart=0.9, boom=0.7, impact=0.5, big=0.62, hit=0.4, whoosh=0.35, riser=0.35,
            stamp=0.6, crack=0.55, shatter=0.5, flip=0.35, scan=0.3, brush=0.25, burst=0.35, shine=0.3)
for e in EV:
    k, t0 = e["k"], e["t"]
    pan = 0.5 + 0.35 * (e.get("x", 540) - 540) / 540
    if k == "riser":
        x = s_riser(e.get("dur", 0.8))
        t0 = t0
    elif k == "scan":
        x = s_scan(e.get("dur", 1.1))
    elif k == "whoosh":
        x = s_whoosh(0.5)
        t0 -= 0.15
    else:
        if k in ("impact", "big", "crack", "stamp", "hit", "shatter"):
            t0 -= 0.07          # land the hit just before the syllable so it never masks the word
        fn = dict(tick=s_tick, heart=s_heart, boom=lambda: s_boom(2.2, 55, 24), impact=s_impact, big=s_big,
                  hit=s_hit, stamp=s_stamp, crack=s_crack, shatter=s_shatter, flip=s_flip, brush=s_brush,
                  burst=s_burst, shine=s_shine).get(k)
        if fn is None:
            continue
        x = fn()
    add(sfx, x, t0, GAIN[k], pan)

sfx = reverb(sfx, secs=1.8, decay=0.4, mix=0.22, seed=8)

for name, bus in [("music", music), ("sfx", sfx)]:
    bus = bus / max(1e-9, np.abs(bus).max()) * 0.89
    sf.write(os.path.join(ROOT, "assets", f"{name}.wav"), bus.astype(np.float32), SR, subtype="PCM_16")
    print(f"assets/{name}.wav written")
