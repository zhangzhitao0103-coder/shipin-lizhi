"""AI 配音：sherpa-onnx + Kokoro v1.1-zh，离线生成每个节拍的旁白。
用法：python tts.py <模型目录> <构建目录>    环境变量 VOICE_SID（默认 58，男声）、VOICE_SPEED（默认 1.05）
"""
import hashlib
import json
import os
import sys

import numpy as np
import scipy.signal as ss
import soundfile as sf

M, B = sys.argv[1], sys.argv[2]
SID = int(os.environ.get("VOICE_SID", "58"))
SPEED = float(os.environ.get("VOICE_SPEED", "1.05"))
SR = 48000

beats = json.load(open(os.path.join(B, "beats.json"), encoding="utf-8"))
vd = os.path.join(B, "voice")
os.makedirs(vd, exist_ok=True)
manifest_path = os.path.join(vd, "manifest.json")
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}

tts = None


def engine():
    global tts
    if tts is None:
        import sherpa_onnx
        k = os.path.join(M, "kokoro-multi-lang-v1_1") + "/"
        cfg = sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                    model=k + "model.onnx", voices=k + "voices.bin", tokens=k + "tokens.txt",
                    data_dir=k + "espeak-ng-data", dict_dir=k + "dict",
                    lexicon=k + "lexicon-us-en.txt," + k + "lexicon-zh.txt"),
                num_threads=4),
            rule_fsts=k + "phone-zh.fst," + k + "date-zh.fst," + k + "number-zh.fst",
            max_num_sentences=1)
        tts = sherpa_onnx.OfflineTts(cfg)
    return tts


def trim(a, sr, db=-42):
    thr = 10 ** (db / 20) * np.max(np.abs(a))
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    s, e = max(0, idx[0] - int(0.02 * sr)), min(len(a), idx[-1] + int(0.08 * sr))
    return a[s:e]


durations = {}
for b in beats:
    text = b["voice"].strip()
    if not text:
        continue
    key = hashlib.md5(f"{SID}|{SPEED}|{text}".encode()).hexdigest()
    out = os.path.join(vd, b["id"] + ".wav")
    if manifest.get(b["id"]) != key or not os.path.exists(out):
        g = engine().generate(text, sid=SID, speed=SPEED)
        a = trim(np.array(g.samples, dtype=np.float32), g.sample_rate)
        a = ss.resample_poly(a, SR, g.sample_rate).astype(np.float32)
        a = a / (np.max(np.abs(a)) + 1e-9) * 0.7
        sf.write(out, a, SR)
        manifest[b["id"]] = key
        print("  配音", b["id"], f"{len(a)/SR:.2f}s", text)
    durations[b["id"]] = round(sf.info(out).duration, 3)

json.dump(manifest, open(manifest_path, "w"))
json.dump(durations, open(os.path.join(vd, "durations.json"), "w"), indent=1)
