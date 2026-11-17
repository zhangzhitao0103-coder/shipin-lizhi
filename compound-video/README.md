# 复利的力量 · 30 秒知识动画

9:16 竖屏，1080×1920，30 fps，30 秒，中文配音 + 中文字幕 + 轻柔背景音乐。
风格取自「数学思想 Vol.07」海报：米白纸张底色、深墨绿公式、橙色增长、红色下降。

**成片：** `output/compound_growth_30s_1080x1920.mp4`
**字幕文件：** `output/subtitles.srt`（画面里已经烧录了字幕，这个文件可以上传到平台作为外挂字幕）

## 分镜与实现

| 时间 | 画面 | 配音 |
|---|---|---|
| 0–4 s | 「每天一点点，」逐字出现，「差距被放大」弹出后再放大，橙色下划线 | 每天一点点，为什么一年后差距这么大？ |
| 4–9 s | 1ⁿ = 1，n 依次取 1→2→3→10→100→365，结果每次都用 `Math.pow(1,n)` 算出；「每天不增不减」；平直的示意线 | 如果始终停在原地，时间过去，结果依然是一。 |
| 9–17 s | 1.01ᵈ，d 从 0 递增到 365，结果逐帧计算，最终停在 37.8；橙色曲线从平缓到上扬，标注「理论示意」 | 假设每天在前一天的基础上进步百分之一，一年后，理论值约为起点的三十七点八倍。 |
| 17–23 s | 0.99ᵈ，d 从 0 递增到 365，最终停在 0.03；红色曲线逼近 0 但不穿过 0，注明「趋近于 0，但不会等于 0」 | 如果每天退步百分之一，一年后，理论值只剩起点的约百分之三。 |
| 23–30 s | 1、37.8、0.03 三栏并列，随后淡出，落到结尾句；附免责小字 | 学习的积累，来自每天做对一点。复利不是奇迹，而是持续做对的事。 |

### 准确性
- 公式全部是真实文本排版（Playfair Display 数字 + Noto Serif SC 运算符），上标、`=`、`≈` 都是字符，不是图片。
- 画面上的所有数值都是逐帧用 `Math.pow` 算出来的（`src/scene.js`），没有随机滚动。显示规则只负责四舍五入：
  - 1.01ᵈ：小于 10 时保留 2 位小数，大于等于 10 时保留 1 位 → 1.01³⁶⁵ = 37.783… → **37.8**
  - 0.99ᵈ：保留 2 位小数 → 0.99³⁶⁵ = 0.02552… → **0.03**
  - 只有显示的数恰好等于真实值时才用「=」（如 d = 0、d = 1），其余一律用「≈」。
- 曲线按每一天的真实值逐点绘制，标注「理论示意」。结尾有免责小字：「注：复利模型用于说明积累效应，不代表学习成绩按固定比例增长。」

### 配音与字幕
- 配音用离线神经 TTS 生成：sherpa-onnx + Kokoro v1.1-zh，说话人 60，男声，**语速 1.0（没有加速）**。每个场景整句合成，所以语调连贯。
- 原文案有两句超出时长，按要求精简了文案，没有加速：
  - 0–4 s：「每天的一点点，为什么会在一年后拉开差距？」→「每天一点点，为什么一年后差距这么大？」
  - 23–30 s：「学习的积累，也来自每天做对一点。」→「学习的积累，来自每天做对一点。」
- 字幕时间轴来自实际音频：在每句话的停顿处切分（`assets/timeline.json`）。另外用离线语音识别（Paraformer）把每段配音转写回文字核对，转写结果与文案一致；仅有的几处差别都是同音字（如「复利」被识别成「富利」），属于识别模型的写法问题，不是发音错误。
- 背景音乐是程序合成的柔和铺底和弦加稀疏铃音，版权无忧（`scripts/bgm.py`）。人声出现时音乐会自动压低（sidechain），整体比人声低约 17 dB；成片响度为 -16 LUFS。

## 目录

```
src/index.html, style.css, scene.js   动画本体（每帧都是时间 t 的纯函数：window.renderFrame(t)）
scripts/tts.py                        离线配音 + 字幕时间轴（timeline.json / subtitles.srt）
scripts/bgm.py                        背景音乐合成
scripts/mix.sh                        人声/音乐混音 + 响度标准化 → assets/mix.wav
scripts/render.mjs                    Chromium 逐帧渲染 → ffmpeg 编码 MP4
assets/                               voice.wav, bgm.wav, mix.wav, timeline.json
output/                               成片 MP4、字幕、封面
build.sh                              一键重建
```

## 怎么修改、怎么重新生成

需要：Node 18+、Playwright（Chromium）、ffmpeg、Python 3（numpy、soundfile）。

```bash
npm install
./build.sh                       # 用现有配音重新渲染视频（约 3–5 分钟）
node scripts/render.mjs --preview   # 只出若干静帧到 output/preview/，用来快速看排版
```

- **改画面、配色、时间点：** 改 `src/style.css` 和 `src/scene.js`。时间点写在各个 `render*` 函数里；结尾两行和字幕跟随配音时间轴（`cue(...)`）。
- **改文案或配音：** 先编辑 `scripts/tts.py` 里的 `SCENES`（`say` 是配音文本，`sub` 是字幕文本），再执行：
  ```bash
  pip install sherpa-onnx soundfile
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
  tar xjf kokoro-multi-lang-v1_1.tar.bz2
  ./build.sh --tts ./kokoro-multi-lang-v1_1
  ```
  脚本会检查每个场景是否超时（打印 OK / OVER）。换声音可以加参数 `--sid N`（模型共 103 个说话人）。
- **换成真人或商用配音：** 把录音放到 `assets/voice.wav`（30 秒时间轴），同步修改 `assets/timeline.json` 里每句的起止时间，然后执行 `./build.sh`。

## 字体许可
Noto Serif SC、Playfair Display 均为 SIL Open Font License，经 npm 包 @fontsource 引入。
