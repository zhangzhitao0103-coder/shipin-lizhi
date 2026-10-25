"""离线中文 AI 配音：zhtts（FastSpeech2 + MB-MelGAN，模型随 PyPI 包分发）。

模型含 TF Select 算子，需要 Python 3.11 + tensorflow-cpu 2.15：
    uv venv -p python3.11 ttsenv
    VIRTUAL_ENV=ttsenv uv pip install "tensorflow-cpu==2.15.1" "numpy<2" scipy pypinyin
    VIRTUAL_ENV=ttsenv uv pip install --no-deps zhtts
    ttsenv/bin/python voice.py        # 输出到 assets/voiceover/vo_XX.wav

每句先按正常语速合成；超出 timeline.py 给的时长窗口时自动加快语速重合成。
"""
import os

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")

import numpy as np  # noqa: E402
from scipy.io import wavfile  # noqa: E402
from zhtts import TTS  # noqa: E402

from timeline import VO  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
VO_DIR = os.path.join(HERE, "assets", "voiceover")
VOICE_SR = 24000
MIN_SPEED = 0.78  # FastSpeech2 的时长系数，越小越快


class Voice(TTS):
    """在 zhtts 的基础上增加语速控制。"""

    def __init__(self):
        super().__init__("FASTSPEECH2")
        self.speed = 1.0

    def prepare_input(self, input_ids):
        input_ids = np.expand_dims(np.array(input_ids, np.int32), 0)
        return (input_ids,
                np.array([0], np.int32),
                np.array([self.speed], np.float32),
                np.array([1.0], np.float32),
                np.array([1.0], np.float32))

    def say(self, text, speed=1.0, pause=0.1):
        """按标点切分后逐段合成，段间留短停顿。"""
        self.speed = speed
        parts = []
        for sen in _split(text):
            parts.append(self.mel2audio(self.text2mel(sen)))
            parts.append(np.zeros(int(pause * VOICE_SR), np.float32))
        audio = np.concatenate(parts[:-1])
        return audio / (np.max(np.abs(audio)) + 1e-9)


def _split(text):
    out, cur = [], ""
    for ch in text:
        cur += ch
        if ch in "，。！？、；":
            out.append(cur)
            cur = ""
    if cur:
        out.append(cur)
    return out


def main():
    os.makedirs(VO_DIR, exist_ok=True)
    v = Voice()
    for i, (start, end, text, _) in enumerate(VO):
        window = end - start
        speed = 0.95
        audio = v.say(text, speed)
        for _ in range(3):  # 语速与时长不完全成正比，迭代逼近
            if len(audio) / VOICE_SR <= window or speed <= MIN_SPEED:
                break
            speed = max(MIN_SPEED, speed * window / (len(audio) / VOICE_SR) - 0.005)
            audio = v.say(text, speed)
        dur = len(audio) / VOICE_SR
        flag = "  <-- 超出窗口" if dur > window + 0.05 else ""
        print(f"vo_{i:02d}  {start:5.2f}s  时长 {dur:4.2f}s / 窗口 {window:4.2f}s  语速 {speed:.2f}  {text}{flag}")
        wavfile.write(os.path.join(VO_DIR, f"vo_{i:02d}.wav"), VOICE_SR, (audio * 0.95 * 32767).astype(np.int16))


if __name__ == "__main__":
    main()
