# 视频工坊（代码生成短视频）

每条视频 = 一个剧集脚本（`episodes/*.js`），里面写好分镜节拍（字幕、旁白、最短时长、情绪值、音效）和画面绘制函数。构建脚本自动完成：

1. **AI 配音**：`tools/tts.py`，离线 Kokoro 中文模型，每个节拍生成一段旁白
2. **时间轴**：节拍时长 = max(最短时长, 旁白时长 + 留白)，无配音版与配音版共用同一套画面
3. **逐帧渲染**：`web/index.html` + `web/engine.js`，Chromium 无头浏览器按 30fps 截帧（画面是时间的纯函数，可并行）
4. **配乐与音效**：`tools/audio.py`，钢琴、铺底、低音、节奏和音效全部由代码合成，无版权风险
5. **合成输出**：`out/` 下生成 `*_无配音.mp4`、`*_AI配音.mp4`、`*_封面.jpg`

## 规格
- 竖版 1080×1920，30fps，H.264 + AAC，响度约 -16 LUFS
- 字幕放在顶部安全区（y≈360），超宽自动缩字号（最大 920px）；底部 1700px 以下不放关键信息
- 片尾 4.2 秒：有道领世官方 logo（`web/assets/logo_youdao_lingshi.png`，描边遮罩生长 + 逐字滑入）+ 标语「高效学习 从有道领世开始」（`E.endcard`）
- 风格主题（`E.themes`，剧集里 `theme: 'xxx'`，背景用 `E.paint`）：
  `cinema` 暗金电影 · `info` 信息图 · `neon` 霓虹科技 · `ink` 新中式水墨 · `ice` 冷蓝电影 · `white` 极简白 ·
  `notebook` 手账笔记 · `blueprint` 蓝图工程 · `magazine` 杂志排版 · `chalk` 黑板粉笔 · `warm` 暖色温情 ·
  `winter` 冬日雪景 · `pixel` 像素游戏 · `glass` 玻璃拟态 · `paper` 纸雕 · `sunrise` 晨光 · `newsprint` 复古报纸 · `space` 深空
- 字体：思源宋体/黑体、霞鹜文楷、马善政毛笔楷书、Playfair Display、JetBrains Mono（均为开源可商用授权）
- 音色：剧集里 `voice: { sid, speed }`。1 号男声沉稳 58、2 号男声清亮 100、3 号男声温和 90、4 号女声温柔 50、5 号女声明亮 40、6 号女声知性 30

## 构建
```bash
npm install                      # 安装字体（思源宋体/黑体、Playfair Display、JetBrains Mono）
export PY=/path/to/venv/bin/python   # 需要 sherpa-onnx、soundfile、scipy、numpy
export MODELS=/path/to/models        # 内含 kokoro-multi-lang-v1_1/
node tools/build.js C1 --preview     # 每个节拍各出一张预览图到 build/C1/preview
node tools/build.js C1 --workers 4   # 完整渲染
```
可选环境变量：`VOICE_SID`（音色编号，默认 58 男声）、`VOICE_SPEED`（语速，默认 1.05）。

## 新增一集
复制一个现有剧集，改 `beats`（字幕里 `{xx}` 显示为金色、`[xx]` 显示为红色）和 `draw`。数字必须由代码真实计算，或者在脚本注释里写明出处。
