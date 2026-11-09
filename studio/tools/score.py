"""真实乐器配乐：按时间轴的分段（和弦、情绪、风格）编配 MIDI，用 FluidSynth + FluidR3 GM 音色库（MIT 许可）渲染。
用法：由 audio.py 调用 render(TL, out_wav)；FluidSynth 或音色库不可用时返回 False，audio.py 改用代码合成。
"""
import os
import shutil
import subprocess

import mido
import numpy as np

SF2 = os.environ.get("SF2", "/usr/share/sounds/sf2/FluidR3_GM.sf2")
NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
# GM 音色编号（从 0 开始）
PIANO, RHODES, CELESTA, GLOCK, MUSICBOX, HARP, STRINGS, SLOWSTR, PIZZ, CELLO, BASS = 0, 4, 8, 9, 10, 46, 48, 49, 45, 42, 43
TIMPANI, CHOIR, HORN, BRASS, TAIKO, ACBASS, PAD = 47, 52, 60, 61, 116, 32, 89
KICK, SNARE, RIM, HAT, CRASH = 36, 38, 37, 42, 49


def chord(name):
    minor = name.endswith("m")
    root = NOTE[name[:-1] if minor else name]
    return root, minor


class Score:
    """按秒排音符，最后统一写成 MIDI（120 BPM、每拍 480 tick → 1 秒 = 960 tick）"""

    def __init__(self):
        self.ev, self.ch = [], {}

    def chan(self, prog):
        if prog == "drums":
            return 9
        if prog not in self.ch:
            free = [c for c in range(16) if c != 9 and c not in self.ch.values()]
            self.ch[prog] = free[0]
        return self.ch[prog]

    def note(self, prog, pitch, t, dur, vel):
        if dur <= 0 or not (0 <= pitch <= 127):
            return
        c = self.chan(prog)
        v = int(max(1, min(127, vel)))
        self.ev.append((t, 1, mido.Message("note_on", channel=c, note=int(pitch), velocity=v)))
        self.ev.append((t + dur, 0, mido.Message("note_off", channel=c, note=int(pitch), velocity=0)))

    def cc(self, prog, t, num, val):
        self.ev.append((t, 2, mido.Message("control_change", channel=self.chan(prog), control=num, value=int(max(0, min(127, val))))))

    def save(self, path):
        mid = mido.MidiFile(ticks_per_beat=480)
        tr = mido.MidiTrack(); mid.tracks.append(tr)
        tr.append(mido.MetaMessage("set_tempo", tempo=500000, time=0))
        for prog, c in self.ch.items():
            tr.append(mido.Message("program_change", channel=c, program=prog, time=0))
            tr.append(mido.Message("control_change", channel=c, control=91, value=70, time=0))   # 混响
            tr.append(mido.Message("control_change", channel=c, control=93, value=20, time=0))   # 合唱
        last = 0
        for t, _, msg in sorted(self.ev, key=lambda e: (e[0], e[1])):
            tick = int(round(t * 960))
            tr.append(msg.copy(time=max(0, tick - last))); last = max(last, tick)
        mid.save(path)


def triad(root, minor, base):
    return [base + root, base + root + (3 if minor else 4), base + root + 7]


def arrange(TL):
    m = TL["music"]
    secs, chords, style = m["sections"], m["chords"], m.get("style", "cinema")
    bpm = m.get("bpm", {"pulse": 100, "lofi": 80, "bell": 90, "epic": 112}.get(style, 76))
    beat = 60 / bpm
    sc = Score()
    rng = np.random.default_rng(11)
    for i, s in enumerate(secs):
        root, minor = chord(chords[i % len(chords)])
        t0, t1, mood = s["s"], s["e"], s.get("mood", 0.5)
        d = t1 - t0
        tri = triad(root, minor, 60)
        # 弦乐铺底：所有风格都有，情绪越高越满
        sc.cc(STRINGS, t0, 11, 70 + 50 * mood)
        for p in [tri[0] - 12, tri[1], tri[2]] + ([tri[0] + 12] if mood > 0.6 else []):
            sc.note(STRINGS if mood > 0.45 else SLOWSTR, p, t0, d + 0.25, 38 + 55 * mood)
        # 低音
        bass = (CELLO if style in ("cinema", "epic") else ACBASS if style in ("lofi", "pulse") else CELLO)
        for k in range(max(1, int(d // (beat * 4)) + 1)):
            tb = t0 + k * beat * 4
            if tb < t1 - 0.1:
                sc.note(bass, 36 + root, tb, min(beat * 4, t1 - tb) + 0.1, 55 + 45 * mood)
        if style == "cinema":
            # 钢琴分解和弦：情绪越高越密
            step = 0.75 - 0.4 * mood
            pool = tri + [tri[0] + 12, tri[1] + 12]
            t, j = t0 + 0.05, 0
            while t < t1:
                sc.note(PIANO, pool[(j * 2 + int(rng.integers(0, 2))) % len(pool)], t, 1.6, 48 + 40 * mood + rng.integers(-6, 6))
                t += step; j += 1
            if mood >= 0.7:
                sc.note(HORN, tri[0] - 12, t0, d, 50 + 40 * mood); sc.note(HORN, tri[2] - 12, t0, d, 45 + 40 * mood)
            if mood >= 0.9:
                for p in tri: sc.note(CHOIR, p, t0, d, 70)
        elif style == "pulse":
            t, j = np.ceil(t0 / (beat / 2)) * (beat / 2), 0
            pool = [tri[0], tri[1], tri[2], tri[0] + 12, tri[2], tri[1]]
            while t < t1:
                sc.note(PIZZ if mood < 0.6 else PIANO, pool[j % 6], t, beat * 0.45, 55 + 40 * mood)
                bi = int(round(t / (beat / 2))) % 8
                if mood > 0.35:
                    if bi in (0, 4): sc.note("drums", KICK, t, 0.1, 60 + 50 * mood)
                    if bi % 2 == 1: sc.note("drums", HAT, t, 0.05, 35 + 30 * mood)
                    if mood > 0.7 and bi in (2, 6): sc.note("drums", SNARE, t, 0.1, 55 + 40 * mood)
                t += beat / 2; j += 1
        elif style == "lofi":
            sev = 10 if minor else 11
            voicing = [48 + root, 55 + root, 60 + root + (3 if minor else 4), 60 + root + sev, 62 + root + 12]
            t = np.ceil(t0 / beat) * beat
            while t < t1:
                bi = int(round(t / beat)) % 4
                if bi in (0, 2):
                    for p in voicing: sc.note(RHODES, p, t + rng.random() * 0.02, beat * 1.6, 45 + 25 * mood)
                if mood > 0.25:
                    if bi in (0, 2): sc.note("drums", KICK, t, 0.1, 55 + 30 * mood)
                    if bi in (1, 3): sc.note("drums", RIM, t, 0.1, 50 + 25 * mood)
                    sc.note("drums", HAT, t, 0.05, 30 + 20 * mood); sc.note("drums", HAT, t + beat * 0.62, 0.05, 22 + 15 * mood)
                t += beat
        elif style == "bell":
            t, j = t0 + 0.05, 0
            pool = [tri[0] + 12, tri[1] + 12, tri[2] + 12, tri[0] + 24, tri[2] + 12, tri[1] + 12]
            while t < t1:
                sc.note(MUSICBOX, pool[j % 6], t, beat, 60 + 30 * mood)
                if j % 4 == 0: sc.note(HARP, tri[0], t, beat * 2, 45 + 25 * mood)
                t += beat / 2; j += 1
        elif style == "epic":
            if mood < 0.55:
                t, j = t0 + 0.1, 0
                pool = tri + [tri[0] + 12]
                while t < t1:
                    sc.note(PIANO, pool[j % 4], t, 2.0, 46 + 30 * mood); t += 0.9 - 0.4 * mood; j += 1
            else:
                t, j = np.ceil(t0 / (beat / 2)) * (beat / 2), 0
                while t < t1:
                    sc.note(STRINGS, [36 + root, 43 + root][j % 2] + 12, t, beat * 0.42, 60 + 45 * mood)
                    bi = int(round(t / (beat / 2))) % 8
                    if mood >= 0.7 and bi in (0, 3, 4): sc.note(TAIKO, 50, t, 0.4, 80 + 40 * mood)
                    if mood >= 0.85 and bi in (2, 6): sc.note("drums", SNARE, t, 0.1, 70 + 40 * mood)
                    t += beat / 2; j += 1
                if mood >= 0.8:
                    for p in tri: sc.note(BRASS, p - 12, t0, d, 55 + 50 * mood)
                    sc.note(TIMPANI, 36 + root, t0, 1.2, 100)
                if mood >= 0.95:
                    for p in tri: sc.note(CHOIR, p, t0, d, 78)
                    sc.note("drums", CRASH, t0, 1.0, 90)
    # 片尾：主和弦长音收束
    end = TL["endcard"]["s"]
    root, minor = chord(chords[0] if style != "epic" else chords[-1])
    for p in triad(root, minor, 60) + [48 + root]:
        sc.note(STRINGS, p, end, TL["total"] - end + 0.5, 60); sc.note(PIANO, p, end + 0.05, 3.0, 55)
    return sc


def render(TL, out_wav, workdir):
    if not shutil.which("fluidsynth") or not os.path.exists(SF2):
        return False
    mid = os.path.join(workdir, "score.mid")
    arrange(TL).save(mid)
    subprocess.run(["fluidsynth", "-ni", "-g", "0.8", "-r", "48000", "-o", "synth.reverb.room-size=0.7", "-o", "synth.reverb.level=0.6",
                    "-F", out_wav, SF2, mid], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return True
