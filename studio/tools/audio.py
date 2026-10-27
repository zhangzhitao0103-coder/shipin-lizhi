"""配乐、音效与混音：全部由代码合成，无版权素材。
用法：python audio.py <构建目录>  → mix_silent.wav（无配音）、mix_voice.wav（AI 配音）
"""
import json
import os
import subprocess
import sys

import numpy as np
import scipy.signal as ss
import soundfile as sf

B = sys.argv[1]
TL = json.load(open(os.path.join(B, "timeline.json"), encoding="utf-8"))
SR = 48000
N = int(TL["total"] * SR) + SR
rng = np.random.default_rng(7)

NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}


def chord(name):
    minor = name.endswith("m")
    root = NOTE[name[:-1] if minor else name]
    return root, [0, 3 if minor else 4, 7]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def env_ar(n, a, r):
    e = np.ones(n, dtype=np.float32)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, fc, order=2):
    sos = ss.butter(order, min(fc, SR / 2 - 100), "low", fs=SR, output="sos")
    return ss.sosfilt(sos, x, axis=0).astype(np.float32)


def highpass(x, fc, order=2):
    sos = ss.butter(order, fc, "high", fs=SR, output="sos")
    return ss.sosfilt(sos, x, axis=0).astype(np.float32)


def bandpass(x, lo, hi, order=2):
    sos = ss.butter(order, [lo, hi], "band", fs=SR, output="sos")
    return ss.sosfilt(sos, x, axis=0).astype(np.float32)


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        buf[i:i + len(sig), 0] += sig * gain * l * 1.414
        buf[i:i + len(sig), 1] += sig * gain * r * 1.414
    else:
        buf[i:i + len(sig)] += sig * gain


def reverb_ir(sec=2.8, seed=3):
    n = int(sec * SR)
    r = np.random.default_rng(seed)
    t = np.arange(n) / SR
    decay = np.exp(-t * 6.9 / sec)
    ir = np.stack([r.standard_normal(n) * decay, r.standard_normal(n) * decay], 1).astype(np.float32)
    ir = lowpass(ir, 5000)
    ir[: int(0.02 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(0))


def reverb(x, wet=0.3, sec=2.8):
    ir = reverb_ir(sec)
    y = np.stack([ss.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1).astype(np.float32)
    return x * (1 - wet) + y * wet * 1.6


# ---------- 乐器 ----------
def piano(f, dur=3.2, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > SR / 2.2: break
        y += (1 / k ** 1.4) * np.exp(-t * (1.2 + 0.9 * k)) * np.sin(2 * np.pi * fk * t + k)
    att = np.minimum(1, t / 0.004)
    ham = rng.standard_normal(n).astype(np.float32) * np.exp(-t * 90) * 0.04
    y = (y * att + lowpass(ham, 3000)) * vel
    return y * env_ar(n, 0, 0.25)


def pad_note(f, dur, bright):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for det in (-0.12, 0.0, 0.11):
        ff = f * 2 ** (det / 12)
        for k in range(1, 10):
            if ff * k > SR / 2.5: break
            y += (1 / k) * np.sin(2 * np.pi * ff * k * t + det * 10 + k)
    return lowpass(y / 6, 500 + 2200 * bright)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 80 * np.exp(-t * 28)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)


def pluck(f, dur=1.2):
    n = int(dur * SR)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p).astype(np.float32)
    out = np.zeros(n, np.float32)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return lowpass(out, 3500)


# ---------- 配乐 ----------
def music():
    m = TL["music"]
    secs = m["sections"]
    out = np.zeros((N, 2), np.float32)
    style = m.get("style", "cinema")
    chords = m["chords"]
    # 情绪曲线（平滑）
    mood = np.zeros(N, np.float32)
    for s in secs:
        mood[int(s["s"] * SR): int(s["e"] * SR)] = s["mood"]
    mood[int(secs[-1]["e"] * SR):] = 0.35
    win = int(0.5 * SR)
    mood = np.convolve(mood, np.ones(win) / win, mode="same").astype(np.float32)

    for i, s in enumerate(secs):
        root, iv = chord(chords[i % len(chords)])
        d = s["e"] - s["s"] + 1.2
        bright = 0.25 + 0.6 * s["mood"]
        notes = [36 + root, 48 + root + iv[2], 48 + root + iv[1] + 12, 60 + root]
        p = sum(pad_note(hz(x), d, bright) for x in notes)
        p *= env_ar(len(p), 0.6, 0.9) * (0.05 + 0.07 * s["mood"])
        add(out, p, max(0, s["s"] - 0.3), pan=0)
        # 低音
        tt = np.arange(int(d * SR)) / SR
        bass = (np.sin(2 * np.pi * hz(24 + root + 12) * tt) * 0.6 + 0.2 * np.sin(4 * np.pi * hz(24 + root + 12) * tt)).astype(np.float32)
        add(out, bass * env_ar(len(bass), 0.5, 0.9) * 0.05 * (0.4 + s["mood"]), max(0, s["s"] - 0.3))
        # 钢琴分解和弦
        r = np.random.default_rng(100 + i)
        pool = [60 + root + x for x in iv] + [72 + root + x for x in iv]
        step = 1.25 - 0.75 * s["mood"] if style == "cinema" else 60 / m.get("bpm", 96) / 2
        tt0 = s["s"] + 0.05
        j = 0
        while style in ("cinema", "pulse") and tt0 < s["e"]:
            note = pool[(j * 2 + r.integers(0, 2)) % len(pool)] if style == "cinema" else pool[[0, 1, 2, 3, 2, 1][j % 6]]
            vel = 0.5 + 0.5 * r.random()
            if style == "cinema":
                add(out, piano(hz(note), 3.0, vel) * 0.10, tt0, pan=(r.random() - 0.5) * 0.6)
            elif s["mood"] > 0.35:
                add(out, pluck(hz(note), 0.9) * 0.10 * vel, tt0, pan=(r.random() - 0.5) * 0.6)
            tt0 += step * (1 + (r.random() - 0.5) * (0.3 if style == "cinema" else 0))
            j += 1
        # 节奏型（信息图风）
        if style == "pulse" and s["mood"] > 0.25:
            beat = 60 / m.get("bpm", 96)
            k0 = np.ceil(s["s"] / beat) * beat
            while k0 < s["e"]:
                add(out, kick() * 0.20 * s["mood"], k0)
                hat = highpass(rng.standard_normal(int(0.05 * SR)).astype(np.float32), 7000) * np.exp(-np.arange(int(0.05 * SR)) / SR * 80)
                add(out, hat * 0.03 * s["mood"], k0 + beat / 2, pan=0.3)
                k0 += beat
        # lo-fi：慢速摇摆鼓 + 柔和电钢和弦
        if style == "lofi":
            beat = 60 / m.get("bpm", 80)
            k0 = np.ceil(s["s"] / beat) * beat
            while k0 < s["e"]:
                bi = int(round(k0 / beat)) % 4
                if bi in (0, 2):
                    for x in [48 + root, 55 + root, 60 + root + iv[1], 62 + root]:  # 根音、五度、三度、九度
                        add(out, lowpass(piano(hz(x), 1.6, 0.55), 1800) * 0.07, k0 + 0.012 * r.random())
                if s["mood"] > 0.25:
                    if bi in (0, 2): add(out, lowpass(kick(), 900) * 0.16, k0)
                    if bi in (1, 3):
                        sn = bandpass(rng.standard_normal(int(0.12 * SR)).astype(np.float32), 900, 4000) * np.exp(-np.arange(int(0.12 * SR)) / SR * 30)
                        add(out, sn * 0.035, k0, pan=-0.1)
                    hat = highpass(rng.standard_normal(int(0.03 * SR)).astype(np.float32), 6000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 120)
                    add(out, hat * 0.02, k0, pan=0.25); add(out, hat * 0.014, k0 + beat * 0.62, pan=0.25)
                k0 += beat
        # 八音盒：高音铃声分解和弦
        if style == "bell":
            step = 60 / m.get("bpm", 90) / 2
            tt0, j = s["s"] + 0.05, 0
            while tt0 < s["e"]:
                note = 72 + root + [0, iv[1], iv[2], 12, iv[2], iv[1]][j % 6]
                tb = np.arange(int(1.6 * SR)) / SR
                bl = sum(a * np.exp(-tb * d) * np.sin(2 * np.pi * hz(note) * p * tb) for p, a, d in [(1, 1, 3.0), (3.0, 0.25, 6), (5.2, 0.08, 9)])
                add(out, bl.astype(np.float32) * 0.05 * (0.6 + 0.4 * r.random()), tt0, pan=(r.random() - 0.5) * 0.5)
                tt0 += step; j += 1
    if style == "lofi":
        # 黑胶底噪
        crack = np.zeros(N, np.float32); idx = rng.integers(0, N, int(TL["total"] * 9)); crack[idx] = rng.uniform(-1, 1, len(idx)).astype(np.float32)
        hiss = lowpass(rng.standard_normal(N).astype(np.float32), 4000) * 0.004
        add(out, lowpass(crack, 3000) * 0.05 + hiss, 0)
    out *= (0.55 + 0.6 * mood)[:, None]
    out = reverb(out, 0.38, 3.2)
    # 收尾淡出
    fe = int(TL["total"] * SR)
    out[fe - SR:fe] *= np.linspace(1, 0, SR)[:, None]
    out[fe:] = 0
    return out


# ---------- 音效 ----------
def sfx_sig(s):
    typ = s["type"]
    if typ == "tick":
        n = int(0.06 * SR)
        x = bandpass(rng.standard_normal(n).astype(np.float32), 2000, 5000) * np.exp(-np.arange(n) / SR * 120)
        return x * 0.5
    if typ == "ding":
        n = int(2.5 * SR); t = np.arange(n) / SR
        y = sum(a * np.exp(-t * d) * np.sin(2 * np.pi * 1318.5 * p * t) for p, a, d in [(1, 1, 2.2), (2.0, 0.4, 3.5), (2.76, 0.3, 4.5), (5.4, 0.12, 7)])
        return y.astype(np.float32) * 0.22
    if typ == "boom":
        n = int(3.0 * SR); t = np.arange(n) / SR
        f = 32 + 60 * np.exp(-t * 6)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
        noise = lowpass(rng.standard_normal(n).astype(np.float32), 400) * np.exp(-t * 5) * 0.6
        return (y + noise).astype(np.float32) * 0.55
    if typ == "riser":
        d = max(0.6, s.get("dur") or 2.0); n = int(d * SR); t = np.arange(n) / SR
        x = rng.standard_normal(n).astype(np.float32)
        out = np.zeros(n, np.float32)
        seg = int(0.05 * SR)
        for i in range(0, n, seg):
            c = 300 * (5000 / 300) ** (i / n)
            out[i:i + seg] = bandpass(x[i:i + seg + 400], c * 0.7, min(c * 1.4, 20000))[: len(out[i:i + seg])]
        tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2 * t / d)) / SR)
        amp = (t / d) ** 2.2
        return ((out * 0.5 + tone * 0.15) * amp).astype(np.float32) * 0.35
    if typ == "whoosh":
        n = int(0.9 * SR); t = np.arange(n) / SR
        x = bandpass(rng.standard_normal(n).astype(np.float32), 400, 2500)
        return x * np.sin(np.pi * t / 0.9) ** 2 * 0.22
    if typ == "swell":
        n = int(1.6 * SR); t = np.arange(n) / SR
        x = highpass(rng.standard_normal(n).astype(np.float32), 3000) * (t / 1.6) ** 3
        return x * 0.18
    if typ == "brand":
        y = np.zeros(int(3 * SR), np.float32)
        for i, m in enumerate([72, 76, 79, 86]):
            p = piano(hz(m), 2.6, 0.8)
            y[int(i * 0.09 * SR): int(i * 0.09 * SR) + len(p)] += p[: len(y) - int(i * 0.09 * SR)]
        return y * 0.16
    if typ == "boil":
        d = s.get("dur") or 3.0; n = int(d * SR); t = np.arange(n) / SR
        x = lowpass(rng.standard_normal(n).astype(np.float32), 900)
        mod = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7.3 * t) * np.sin(2 * np.pi * 3.1 * t + 1))
        return x * mod * env_ar(n, 1.0, 1.0) * 0.06
    return None


def sfx_bus():
    out = np.zeros((N, 2), np.float32)
    for s in TL["sfx"]:
        if s["type"] == "ticks":
            for k in range(s.get("n", 4)):
                add(out, sfx_sig({"type": "tick"}), s["at"] + k * s.get("gap", 0.15), 0.8, pan=(k % 2 - 0.5) * 0.4)
            continue
        if s["type"] == "train":  # 加速的滴答声
            t, d = s["at"], s["dur"]
            while t < s["at"] + d:
                k = (t - s["at"]) / d
                add(out, sfx_sig({"type": "tick"}), t, 0.6)
                t += 1 / (s["r0"] + (s["r1"] - s["r0"]) * k * k)
            continue
        sig = sfx_sig(s)
        if sig is not None:
            add(out, sig, s["at"])
    return reverb(out, 0.22, 2.0)


def voice_bus():
    out = np.zeros((N, 2), np.float32)
    vd = os.path.join(B, "voice")
    for v in TL["voice"]:
        a, sr = sf.read(os.path.join(vd, v["id"] + ".wav"), dtype="float32")
        a = highpass(a, 90)
        add(out, a, v["at"], 0.95)
    return reverb(out, 0.08, 1.2)


def finish(x, path):
    x = np.tanh(x * 1.1) / np.tanh(1.1)
    raw = path.replace(".wav", "_raw.wav")
    sf.write(raw, x[: int(TL["total"] * SR)], SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), path], check=True)
    os.remove(raw)


mus, fx, vo = music(), sfx_bus(), voice_bus()
venv = np.abs(vo).max(1)
w = int(0.25 * SR)
venv = np.convolve(venv > 0.01, np.ones(w) / w, mode="same").astype(np.float32)
duck = 1 - 0.5 * np.clip(venv * 1.5, 0, 1)
finish(mus * 0.9 + fx, os.path.join(B, "mix_silent.wav"))
finish(mus * duck[:, None] * 0.75 + fx * 0.85 + vo, os.path.join(B, "mix_voice.wav"))
print("  混音完成")
