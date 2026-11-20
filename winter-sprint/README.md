# 潜心奋战冬三月，夯基提能胜百天 · 60 秒高三励志视频

竖屏 1080×1920，30fps，60 秒。中文男声配音，烧录字幕，原创配乐与音效。

- **成片：** `output/winter_sprint_60s_1080x1920.mp4`
- **字幕：** `output/subtitles.srt`（外挂字幕，上传平台时可用）
- **封面：** `output/cover.png`

## 内容结构

整体逻辑是：时间紧 → 你在哪 → 为什么（一轮的价值）→ 怎么做（冬三月规划）→ 信念 → 号召。

视觉从深夜冰蓝走到日出金红：开头冷，规划段逐渐回暖，“黑马”段先压暗、再破冰，结尾日出。

| 镜头 | 内容 | 主要动效 |
|---|---|---|
| A | 距离高考 199 天 | 数字从天而降砸到画面上，画面震动、冲击波、闪白；小时和分钟倒计时飞速减少 |
| B | 冬三月 + 百天 = 全部 | 三张日历砸落，并成进度条；“全部”二字重砸 |
| C | 你正处在一轮攻坚阶段 | 复习路线依次点亮，“你在这里”定位针落下，盖下“攻坚”印章 |
| D | 一轮：全面、系统、回归教材 | 三个词逐个砸下，书本放出光芒，“回归教材”金色扫光 |
| E | 七八成分数在基础和中档题 | 难度条按 易30 / 中50 / 难20 拆分，括号框住前两段，百分比滚动到 80% |
| F | 命题反套路，阅卷看步骤 | 试卷盖“反套路”章，逐步弹出步骤分，“基本功”重砸并火花迸射 |
| G | 一轮漏洞，二轮放大；一模检验 | 砖块堆成地基、大楼升起；裂缝从地基一路爬上楼体，窗户闪红；“一模·联考”扫描光扫过 |
| H | 一轮定下限，二轮拉上限 | 下半屏地板重重落下，上半屏箭头冲顶 |
| I | 冬三月作战图 | 四个时间节点（12月、1月、寒假、2月）逐个飞入，进度线向下推进，背景逐渐回暖 |
| J | 乾坤未定，你我皆是黑马 | 棋盘上黑马从雾中升起，“只说明过去”化为烟尘；冰面炸裂、碎片飞散，书法大字砸下 |
| K | 主题口号与落版 | 日出与上升的火星，“潜心奋战冬三月”逐字书写，“夯基提能胜百天”重砸，最后出倒计时 |

## 配音

- 用离线神经语音合成：sherpa-onnx + Kokoro v1.1-zh。
- **声音选择：** 我测了模型里 103 个说话人，按音高和语调起伏筛选，选了 81 号（低沉男声，语调起伏大）。
- **语速：** 全程 1.0，没有加速。超时的地方是精简文案解决的。
- **防止断错句：** 每句话整句合成，句与句之间的停顿由人工设定。
- **读音核对：** 逐一查了模型字典中的多音字，夯 hāng、模 mó、乾 qián、色 sè、寒假 jià、薄 bó 都正确。
- **转写核对：** 用离线语音识别（Paraformer）把干声和最终混音都转写回文字，与文案逐句比对。剩下的差异只有同音字，比如“冬/东”“誓师/事诗”，这是识别模型的写法问题，不是读错。
- **后期处理：** 加厚低频（胸腔感）、提升人声清晰度、压缩、加一点厅堂混响。
- **字幕切分：** 用语音识别统计每个停顿点之前已经读出的字数，在字数对上的停顿处切分（`scripts/tts.py --asr-dir`）。

## 音乐与音效（`scripts/soundtrack.py`，全部程序合成，无版权问题）

- **配乐（D 小调转 D 大调）：** 开场低频铺底；分析段是贝斯脉冲加铺底和弦；规划段加入太鼓和快速弦乐、逐渐推进；“排名只说明过去”突然抽空，只剩心跳；破冰时全编制进入高潮；日出时转为大调。
- **音效：** 由画面导出的 83 个节拍点自动对齐，包括重击、低频轰鸣、呼啸、冰裂、碎冰、盖章、翻页、扫描、笔刷、火花。
- **混音：** 配乐和音效在人声出现时自动压低；重击都提前 0.07 秒落下，不会盖住字。成片响度为 -14 LUFS，符合短视频平台标准。

## 修改与重新生成

需要：Node 18+、Playwright（Chromium）、ffmpeg、Python 3（numpy、scipy、soundfile）。

```bash
npm install
./build.sh                                  # 用现有配音重新出片（约 7–8 分钟）
node scripts/render.mjs --stills 1.5,30,55  # 只截几张静帧到 output/preview/，用来检查画面
```

- **更新倒计时天数：** 改 `src/scene.js` 顶部 `CFG.today` 为发布日期，所有“199”会自动重算。配音说的是“不到两百天”，12 月上旬之前发布都成立。
- **改文案或配音：** 编辑 `scripts/tts.py` 里的 `SENTENCES`，然后执行：
  ```bash
  pip install sherpa-onnx soundfile
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-paraformer-zh-small-2024-03-09.tar.bz2
  tar xjf kokoro-multi-lang-v1_1.tar.bz2 && tar xjf sherpa-onnx-paraformer-zh-small-2024-03-09.tar.bz2
  ./build.sh --tts ./kokoro-multi-lang-v1_1 ./sherpa-onnx-paraformer-zh-small-2024-03-09
  ```
  画面里所有镜头的时间点都跟着配音时间轴自动调整，不需要手动对齐。
- **换真人配音：** 把录音放到 `assets/voice.wav`（60 秒时间轴），按录音修改 `assets/timeline.json` 里每句的起止时间，再执行 `./build.sh`。

## 目录

```
src/        index.html · style.css · scene.js（动画，每帧都是时间 t 的纯函数）· knight.js（黑马轮廓）
scripts/    tts.py · soundtrack.py · mix.sh · render.mjs
assets/     voice.wav · music.wav · sfx.wav · mix.wav · timeline.json · events.json · knight.svg
output/     成片 MP4 · subtitles.srt · cover.png
```

## 字体与素材许可

- Noto Sans SC、Anton、Ma Shan Zheng：SIL Open Font License，经 @fontsource 引入。
- 黑马轮廓提取自 DejaVu Sans（Bitstream Vera / DejaVu 许可）。
