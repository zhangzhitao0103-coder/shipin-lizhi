"""
Offline Chinese voiceover + subtitle timeline.

Each narration phrase is synthesized separately with sherpa-onnx (Kokoro v1.1-zh),
placed on a 30-second timeline starting at its scene's anchor, and the exact
start/end of every phrase is written to assets/timeline.json (used by the
animation for subtitles and for cue-driven beats) and output/subtitles.srt.

Usage:
    python3 scripts/tts.py --model-dir /path/to/kokoro-multi-lang-v1_1 [--sid 30] [--speed 1.0]

Model download (GitHub release, ~360 MB):
    https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
"""
import argparse, json, os
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOTAL = 30.0

# Each scene is synthesized as ONE utterance (natural prosody); subtitles are then
# split at the pauses the voice makes between phrases.
#   start = when the voice starts (s), end = latest allowed end (s)
#   say = text sent to TTS, sub = subtitle shown on screen
# Copy was shortened (not sped up) so every scene fits its time slot.
SCENES = [
    dict(id="intro", start=0.25, end=3.95, phrases=[
        dict(say="每天一点点，", sub="每天一点点，"),
        dict(say="为什么一年后差距这么大？", sub="为什么一年后差距这么大？"),
    ]),
    dict(id="one", start=4.25, end=9.0, phrases=[
        dict(say="如果始终停在原地，", sub="如果始终停在原地，"),
        dict(say="时间过去，", sub="时间过去，"),
        dict(say="结果依然是一。", sub="结果依然是 1。"),
    ]),
    dict(id="up", start=9.15, end=17.0, phrases=[
        dict(say="假设每天在前一天的基础上进步百分之一，", sub="假设每天在前一天的基础上进步 1%，"),
        dict(say="一年后，", sub="一年后，"),
        dict(say="理论值约为起点的三十七点八倍。", sub="理论值约为起点的 37.8 倍。"),
    ]),
    dict(id="down", start=17.2, end=23.0, phrases=[
        dict(say="如果每天退步百分之一，", sub="如果每天退步 1%，"),
        dict(say="一年后，理论值只剩起点的约百分之三。", sub="一年后，理论值只剩起点的约 3%。"),
    ]),
    dict(id="outro", start=23.05, end=29.8, phrases=[
        dict(say="学习的积累，", sub="学习的积累，"),
        dict(say="来自每天做对一点。", sub="来自每天做对一点。"),
        dict(say="复利不是奇迹，", sub="复利不是奇迹，"),
        dict(say="而是持续做对的事。", sub="而是持续做对的事。"),
    ]),
]


def trim(x, sr, thr=0.008, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]


def find_gaps(x, sr, win=0.01, thr_db=-32, min_len=0.02):
    """All low-energy gaps inside the utterance as (start, end) seconds."""
    hop = int(win * sr)
    frames = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) + 1e-9 for i in range(frames)])
    silent = 20 * np.log10(rms / rms.max()) < thr_db
    gaps, i = [], 0
    while i < frames:
        if silent[i]:
            j = i
            while j < frames and silent[j]:
                j += 1
            if i > 0 and j < frames and (j - i) * win >= min_len:
                gaps.append((i * win, j * win))
            i = j
        else:
            i += 1
    return gaps


def split_points(x, sr, phrases):
    """For each phrase boundary, pick the gap nearest to where it should be
    (estimated from the character count), preferring longer gaps."""
    dur = len(x) / sr
    lens = [len(p["say"].strip("，。？")) for p in phrases]
    total = sum(lens)
    gaps = find_gaps(x, sr)
    chosen, acc, last = [], 0, 0.0
    for L in lens[:-1]:
        acc += L
        expect = dur * acc / total
        cands = [g for g in gaps if g[0] > last]
        g = min(cands, key=lambda g: abs((g[0] + g[1]) / 2 - expect) - 2.0 * (g[1] - g[0]))
        chosen.append(g)
        last = g[1]
    return chosen


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model-dir", required=True)
    ap.add_argument("--sid", type=int, default=60)  # 60 = calm male voice
    ap.add_argument("--speed", type=float, default=1.0)
    args = ap.parse_args()

    import sherpa_onnx
    d = args.model_dir
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=f"{d}/model.onnx", voices=f"{d}/voices.bin", tokens=f"{d}/tokens.txt",
                data_dir=f"{d}/espeak-ng-data", dict_dir=f"{d}/dict",
                lexicon=f"{d}/lexicon-us-en.txt,{d}/lexicon-zh.txt"),
            num_threads=4),
        rule_fsts=f"{d}/date-zh.fst,{d}/number-zh.fst,{d}/phone-zh.fst")
    tts = sherpa_onnx.OfflineTts(cfg)

    sr = None
    track = None
    cues = []
    ok = True
    for sc in SCENES:
        text = "".join(p["say"] for p in sc["phrases"])
        a = tts.generate(text, sid=args.sid, speed=args.speed)
        if sr is None:
            sr = a.sample_rate
            track = np.zeros(int(TOTAL * sr), dtype=np.float32)
        x = trim(np.asarray(a.samples, dtype=np.float32), sr)
        dur = len(x) / sr
        i0 = int(sc["start"] * sr)
        track[i0:i0 + len(x)] += x[: len(track) - i0]
        pauses = split_points(x, sr, sc["phrases"])
        bounds = [0.0] + [v for p in pauses for v in p] + [dur]
        for k, ph in enumerate(sc["phrases"]):
            s0, s1 = bounds[2 * k], bounds[2 * k + 1]
            cues.append(dict(scene=sc["id"], start=round(sc["start"] + s0, 3),
                             end=round(sc["start"] + s1, 3), text=ph["sub"], say=ph["say"]))
        t = sc["start"] + dur
        if t > sc["end"]:
            ok = False
        print(f"[{'OK ' if t <= sc['end'] else 'OVER'}] {sc['id']:6s} {sc['start']:5.2f} -> {t:5.2f}  (limit {sc['end']:.2f})")

    # gentle normalisation: peak -1.5 dBFS
    track *= (10 ** (-1.5 / 20)) / max(1e-6, np.abs(track).max())
    sf.write(os.path.join(ROOT, "assets", "voice.wav"), track, sr, subtype="PCM_16")

    with open(os.path.join(ROOT, "assets", "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(dict(total=TOTAL, fps=30, cues=cues), f, ensure_ascii=False, indent=2)

    with open(os.path.join(ROOT, "output", "subtitles.srt"), "w", encoding="utf-8") as f:
        for n, c in enumerate(cues, 1):
            f.write(f"{n}\n{srt_time(c['start'])} --> {srt_time(c['end'] + 0.25)}\n{c['text']}\n\n")
    print("all scenes fit" if ok else "WARNING: some scenes overflow - shorten the narration")


if __name__ == "__main__":
    main()
