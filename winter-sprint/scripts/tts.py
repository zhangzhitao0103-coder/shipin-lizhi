"""
Offline Chinese voiceover + timeline for「潜心奋战冬三月，夯基提能胜百天」.

Every sentence is synthesized as one utterance (natural prosody, no wrong breaks
inside a sentence). The pause between sentences is set by hand (`gap`), so the
rhythm is controlled rather than left to the model. Subtitles are split at the
pauses the voice actually makes inside a sentence.

Usage:
    python3 scripts/tts.py --model-dir /path/to/kokoro-multi-lang-v1_1 [--sid 81]
Model (GitHub release, ~360 MB):
    https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
"""
import argparse, json, os
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOTAL = 60.0
START = 0.55          # first word

# id: used by the animation to sync shots.  gap: silence BEFORE this sentence (s)
# subs: subtitle phrases (concatenated they must equal `say` minus nothing important)
# speed 1.0 everywhere (never sped up).
SENTENCES = [
    dict(id="s1",  sec="hook",  gap=0.0,  subs=["距离高考，", "只剩不到两百天。"]),
    dict(id="s2",  sec="hook",  gap=0.35, subs=["冬三月，", "加上最后一百天，", "就是你的全部。"]),
    dict(id="s3",  sec="where", gap=0.45, subs=["此刻，", "你正处在一轮攻坚阶段。"]),
    dict(id="s4",  sec="why",   gap=0.45, subs=["一轮复习，", "全面、系统、回归教材。"]),
    dict(id="s5",  sec="why",   gap=0.35, subs=["七八成分数，", "藏在基础和中档题里。"]),
    dict(id="s6",  sec="why",   gap=0.35, subs=["命题反套路，", "阅卷看步骤，", "拼的都是基本功。"]),
    dict(id="s7",  sec="why",   gap=0.35, subs=["一轮漏洞，", "二轮放大。"]),
    dict(id="s8",  sec="why",   gap=0.25, subs=["一模成绩，", "检验的正是一轮成色。"]),
    dict(id="s9",  sec="why",   gap=0.4,  subs=["一轮定下限，", "二轮拉上限！"]),
    dict(id="s10", sec="plan",  gap=0.6,  subs=["十二月，", "攻坚薄弱，", "错题回炉。"]),
    dict(id="s11", sec="plan",  gap=0.3,  subs=["一月，", "联考检验，", "精准诊断。"]),
    dict(id="s12", sec="plan",  gap=0.3,  subs=["寒假，", "作息不放假，", "弯道超车。"]),
    dict(id="s13", sec="plan",  gap=0.3,  subs=["二月，", "一轮收官，", "冲向百日誓师。"]),
    dict(id="s14", sec="faith", gap=0.55, subs=["排名，", "只说明过去，", "不决定结局。"]),
    dict(id="s15", sec="faith", gap=0.4,  subs=["乾坤未定，", "你我皆是黑马！"]),
    dict(id="s16", sec="call",  gap=0.6,  subs=["潜心奋战冬三月，", "夯基提能胜百天！"]),
]


def trim(x, sr, thr=0.008, pad=0.02):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - int(pad * sr)): min(len(x), idx[-1] + int(pad * sr))]


def find_gaps(x, sr, win=0.01, thr_db=-40, min_len=0.015):
    hop = int(win * sr)
    n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) + 1e-9 for i in range(n)])
    silent = 20 * np.log10(rms / rms.max()) < thr_db
    gaps, i = [], 0
    while i < n:
        if silent[i]:
            j = i
            while j < n and silent[j]:
                j += 1
            if i > 0 and j < n and (j - i) * win >= min_len:
                gaps.append((i * win, j * win))
            i = j
        else:
            i += 1
    return gaps


def han_count(text):
    return sum(1 for ch in text if "\u4e00" <= ch <= "\u9fff")


def split_points(x, sr, subs, asr=None):
    """Cut points between subtitle phrases.

    Candidates are the low-energy moments inside the sentence. With an ASR model
    (--asr-dir) each candidate is checked by recognising the audio before it and
    counting the characters spoken: the cut goes where that count equals the
    characters of the phrases so far (robust to homophones). Without ASR, the
    candidate nearest the character-proportional position is used.
    """
    dur = len(x) / sr
    lens = [han_count(t) for t in subs]
    total = sum(lens)
    # energy envelope (10 ms hop, 30 ms window) and its local minima
    hop, win = int(0.01 * sr), int(0.03 * sr)
    env = np.array([np.sqrt(np.mean(x[i:i + win] ** 2)) + 1e-9 for i in range(0, len(x) - win, hop)])
    db = 20 * np.log10(env / env.max())
    minima = [i for i in range(1, len(db) - 1) if db[i] <= db[i - 1] and db[i] <= db[i + 1]]
    cuts, acc, last = [], 0, 0.0
    for L in lens[:-1]:
        acc += L
        expect = dur * acc / total
        pool = [(i * 0.01 + 0.015, db[i]) for i in minima
                if abs(i * 0.01 - expect) < 0.8 and i * 0.01 > last + 0.1]
        if not pool:
            pool = [(expect, 0.0)]
        if asr is not None:
            def spoken(c):
                st = asr.create_stream()
                st.accept_waveform(sr, x[: int(c * sr)])
                asr.decode_stream(st)
                return han_count(st.result.text)
            pool = sorted(pool, key=lambda p: p[1])[:14]          # quietest dips only
            c = min(pool, key=lambda p: (abs(spoken(p[0]) - acc), round(p[1] / 4), abs(p[0] - expect)))[0]
        else:
            c = min(pool, key=lambda p: p[1] + 10 * abs(p[0] - expect))[0]
        cuts.append(c)
        last = c
    return cuts


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model-dir", required=True)
    ap.add_argument("--sid", type=int, default=81)   # deep, expressive male voice
    ap.add_argument("--asr-dir", help="optional sherpa-onnx paraformer-zh model dir for precise subtitle cuts")
    args = ap.parse_args()

    import sherpa_onnx
    d = args.model_dir
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=f"{d}/model.onnx", voices=f"{d}/voices.bin", tokens=f"{d}/tokens.txt",
                data_dir=f"{d}/espeak-ng-data", dict_dir=f"{d}/dict",
                lexicon=f"{d}/lexicon-us-en.txt,{d}/lexicon-zh.txt"),
            num_threads=4),
        rule_fsts=f"{d}/date-zh.fst,{d}/number-zh.fst,{d}/phone-zh.fst"))

    asr = None
    if args.asr_dir:
        asr = sherpa_onnx.OfflineRecognizer.from_paraformer(
            paraformer=f"{args.asr_dir}/model.int8.onnx", tokens=f"{args.asr_dir}/tokens.txt", num_threads=4)

    sr, track = None, None
    sentences, cues = [], []
    t = START
    for s in SENTENCES:
        text = "".join(s["subs"])
        a = tts.generate(text, sid=args.sid, speed=s.get("speed", 1.0))
        if sr is None:
            sr = a.sample_rate
            track = np.zeros(int(TOTAL * sr), dtype=np.float32)
        x = trim(np.asarray(a.samples, dtype=np.float32), sr)
        t += s["gap"]
        dur = len(x) / sr
        i0 = int(t * sr)
        if i0 + len(x) > len(track):
            raise SystemExit(f"narration overflows {TOTAL}s at {s['id']}")
        track[i0:i0 + len(x)] += x
        bounds = [0.0] + split_points(x, sr, s["subs"], asr) + [dur]
        for k, sub in enumerate(s["subs"]):
            cues.append(dict(sid=s["id"], start=round(t + bounds[k], 3),
                             end=round(t + bounds[k + 1], 3), text=sub.rstrip("，、；")))
        sentences.append(dict(id=s["id"], sec=s["sec"], start=round(t, 3), end=round(t + dur, 3), text=text))
        print(f"{s['id']:4s} {s['sec']:6s} {t:6.2f} -> {t + dur:6.2f}  {text}")
        t += dur

    print(f"narration ends at {t:.2f}s (video {TOTAL}s)")
    track *= (10 ** (-1.0 / 20)) / np.abs(track).max()
    sf.write(os.path.join(ROOT, "assets", "voice.wav"), track, sr, subtype="PCM_16")
    with open(os.path.join(ROOT, "assets", "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(dict(total=TOTAL, fps=30, sentences=sentences, cues=cues), f, ensure_ascii=False, indent=1)
    with open(os.path.join(ROOT, "output", "subtitles.srt"), "w", encoding="utf-8") as f:
        for n, c in enumerate(cues, 1):
            f.write(f"{n}\n{srt_time(c['start'])} --> {srt_time(c['end'] + 0.2)}\n{c['text']}\n\n")


if __name__ == "__main__":
    main()
