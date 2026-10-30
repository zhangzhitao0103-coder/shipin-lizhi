"""AI 配音：sherpa-onnx + Kokoro v1.1-zh，离线生成每个节拍的旁白。
用法：python tts.py <模型目录> <构建目录>    环境变量 VOICE_SID（默认 58，男声）、VOICE_SPEED（默认 1.05）
节拍里可单独指定 sid / speed，覆盖整集的音色和语速
VOICE_ENGINE=zipvoice 时改用 ZipVoice（k2-fsa，零样本，韵律更自然）：VOICE_PROMPT=male/female 选参考音色，节拍里可用 prompt 覆盖。
参考音色由开源模型合成（male：Kokoro 男声，female：Matcha 标贝女声），不使用任何真人录音
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
ENGINE = os.environ.get("VOICE_ENGINE", "kokoro")
PROMPT = os.environ.get("VOICE_PROMPT", "male")
PROMPT_TEXT = "每一个清晨，都是新的开始，认真对待每一天。"
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


def other(kind):
    """Matcha 标贝女声 / ZipVoice，按需加载"""
    global _mat, _zv
    import sherpa_onnx
    if kind == "matcha":
        if "_mat" not in globals():
            m = os.path.join(M, "matcha-icefall-zh-baker") + "/"
            _mat = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(matcha=sherpa_onnx.OfflineTtsMatchaModelConfig(
                acoustic_model=m + "model-steps-3.onnx", vocoder=os.path.join(M, "vocos-22khz-univ.onnx"), lexicon=m + "lexicon.txt", tokens=m + "tokens.txt", dict_dir=m + "dict"), num_threads=4), max_num_sentences=1))
        return _mat
    if "_zv" not in globals():
        z = os.path.join(M, "sherpa-onnx-zipvoice-distill-int8-zh-en-emilia") + "/"
        _zv = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(
            tokens=z + "tokens.txt", encoder=z + "encoder.int8.onnx", decoder=z + "decoder.int8.onnx", vocoder=os.path.join(M, "vocos_24khz.onnx"),
            data_dir=z + "espeak-ng-data", lexicon=z + "lexicon.txt"), num_threads=4), max_num_sentences=1))
    return _zv


def prompt_audio(kind):
    """参考音色：用开源模型合成一段固定的话，缓存到模型目录"""
    p = os.path.join(M, f"zv_prompt_{kind}.wav")
    if not os.path.exists(p):
        g = engine().generate(PROMPT_TEXT, sid=58, speed=1.0) if kind == "male" else other("matcha").generate(PROMPT_TEXT, sid=0, speed=1.0)
        sf.write(p, np.array(g.samples, dtype=np.float32), g.sample_rate)
    a, sr = sf.read(p, dtype="float32")
    return a, sr


class Audio:
    def __init__(self, samples, sample_rate): self.samples, self.sample_rate = samples, sample_rate


def stretch(a, sr, speed):
    """不改音高地加速：ffmpeg atempo（ZipVoice 直接用 speed>1 会丢字）"""
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as d:
        i, o = os.path.join(d, "i.wav"), os.path.join(d, "o.wav")
        sf.write(i, a, sr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", i, "-filter:a", f"atempo={speed}", o], check=True)
        return sf.read(o, dtype="float32")[0]


def synth(text, sid, speed, prompt):
    if ENGINE == "zipvoice":
        a, sr = prompt_audio(prompt)
        g = other("zipvoice").generate(text, PROMPT_TEXT, a.tolist(), sr, 1.0, 4)
        x = np.array(g.samples, dtype=np.float32)
        return Audio(stretch(x, g.sample_rate, speed) if abs(speed - 1) > 0.01 else x, g.sample_rate)
    return engine().generate(text, sid=sid, speed=speed)


durations = {}
for b in beats:
    text = b["voice"].strip()
    if not text:
        continue
    sid, speed = int(b.get("sid") or SID), float(b.get("speed") or SPEED)
    prompt = b.get("prompt") or PROMPT
    key = hashlib.md5((f"{sid}|{speed}|{text}" if ENGINE == "kokoro" else f"{ENGINE}2|{prompt}|{speed}|{text}").encode()).hexdigest()
    out = os.path.join(vd, b["id"] + ".wav")
    if manifest.get(b["id"]) != key or not os.path.exists(out):
        g = synth(text, sid, speed, prompt)
        a = trim(np.array(g.samples, dtype=np.float32), g.sample_rate)
        a = ss.resample_poly(a, SR, g.sample_rate).astype(np.float32)
        a = a / (np.max(np.abs(a)) + 1e-9) * 0.7
        sf.write(out, a, SR)
        manifest[b["id"]] = key
        print("  配音", b["id"], f"{len(a)/SR:.2f}s", text)
    durations[b["id"]] = round(sf.info(out).duration, 3)

json.dump(manifest, open(manifest_path, "w"))
json.dump(durations, open(os.path.join(vd, "durations.json"), "w"), indent=1)
