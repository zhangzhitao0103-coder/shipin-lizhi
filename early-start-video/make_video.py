#!/usr/bin/env python3
"""《同一个目标，两条路》——高中励志短视频生成脚本。

画面：竖屏 1080x1920 / 30fps / 35.5 秒，极简动态图形（PIL 逐帧绘制）。
声音：AI 配音（voice.py 预先生成到 assets/voiceover）+ numpy 合成的钢琴、弦乐、鼓点和音效，版权干净。

用法：
    python3 make_video.py                     # 生成完整版、纯配乐版和封面
    python3 make_video.py --preview 2.6,12,24 # 只导出指定时间点的预览帧
"""
import argparse
import math
import os
import shutil
import subprocess
import tempfile
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.io import wavfile
from scipy.signal import resample_poly

from logo import draw_logo
from timeline import VO

W, H, FPS, DUR = 1080, 1920, 30, 35.5
SR = 44100
FONT_PATH = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "output")
NAME = "越早开始_高考越轻松"

GOLD = (255, 184, 64)
RED = (236, 82, 78)
GRAY = (150, 158, 178)
WHITE = (242, 243, 248)
DIM = (110, 118, 142)


# ---------------------------------------------------------------- 缓动与工具
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def lin(t, t0, t1):
    return clamp((t - t0) / (t1 - t0))


def ease(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def back_out(x):
    x = clamp(x)
    c = 1.70158
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def env(t, a, b, fi=0.4, fo=0.4):
    """在 a 时刻淡入、b 时刻淡出完毕。"""
    return ease(lin(t, a, a + fi)) * (1 - ease(lin(t, b - fo, b)))


def mix(c1, c2, k):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * k) for i in range(3))


def rgba(c, a=1.0):
    return (c[0], c[1], c[2], int(255 * clamp(a)))


# ---------------------------------------------------------------- 文字精灵
_fonts, _sprites = {}, {}


def font(size):
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT_PATH, size)
    return _fonts[size]


def text_sprite(text, size, color, stroke=1):
    key = ("t", text, size, color, stroke)
    if key not in _sprites:
        f = font(size)
        asc, desc = f.getmetrics()
        w = int(math.ceil(f.getlength(text))) + 2 * stroke + 4
        im = Image.new("RGBA", (w, asc + desc + 2 * stroke + 4), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((stroke + 2, stroke + 2), text, font=f, fill=rgba(color),
                                stroke_width=stroke, stroke_fill=rgba(color))
        _sprites[key] = im
    return _sprites[key]


def rich_sprite(segs, size, nchars=None, stroke=1):
    """多色文字；nchars 用于打字机效果（按完整宽度排版，逐字显现不跳动）。"""
    key = ("r", tuple(segs), size, nchars, stroke)
    if key not in _sprites:
        f = font(size)
        full = sum(f.getlength(s) for s, _ in segs)
        base = text_sprite(segs[0][0], size, segs[0][1], stroke)
        im = Image.new("RGBA", (int(full) + 2 * stroke + 8, base.height), (0, 0, 0, 0))
        x, left = 0.0, (10 ** 6 if nchars is None else nchars)
        for s, c in segs:
            part = s[:max(0, left)]
            left -= len(s)
            if part:
                im.alpha_composite(text_sprite(part, size, c, stroke), (int(x), 0))
            x += f.getlength(s)
        _sprites[key] = im
    return _sprites[key]


def pill_sprite(text, size, color):
    key = ("p", text, size, color)
    if key not in _sprites:
        sp = text_sprite(text, size, color)
        w, h = sp.width + 44, sp.height + 16
        im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(im).rounded_rectangle([0, 0, w - 1, h - 1], radius=h // 2,
                                             fill=rgba(color, 0.2), outline=rgba(color, 0.9), width=3)
        im.alpha_composite(sp, ((w - sp.width) // 2, (h - sp.height) // 2))
        _sprites[key] = im
    return _sprites[key]


def glow_sprite(sp, r=14):
    key = ("g", id(sp), r)
    if key not in _sprites:
        im = Image.new("RGBA", (sp.width + 4 * r, sp.height + 4 * r), (0, 0, 0, 0))
        im.alpha_composite(sp, (2 * r, 2 * r))
        _sprites[key] = im.filter(ImageFilter.GaussianBlur(r))
    return _sprites[key]


def blit(img, sp, cx, cy, a=1.0, scale=1.0):
    """把精灵以 (cx, cy) 为中心贴到 RGB 帧或 RGBA 图层上。"""
    if sp is None or a <= 0.004 or scale <= 0.02:
        return
    if abs(scale - 1.0) > 1e-3:
        sp = sp.resize((max(1, int(sp.width * scale)), max(1, int(sp.height * scale))), Image.BICUBIC)
    mask = sp.getchannel("A")
    if a < 0.999:
        mask = mask.point(lambda v: int(v * a))
    x, y = int(cx - sp.width / 2), int(cy - sp.height / 2)
    if img.mode == "RGB":
        img.paste(sp, (x, y), mask)
        return
    src = sp.copy()
    src.putalpha(mask)
    cx0, cy0 = max(0, -x), max(0, -y)
    if cx0 >= src.width or cy0 >= src.height:
        return
    src = src.crop((cx0, cy0, src.width, src.height))
    img.alpha_composite(src, (x + cx0, y + cy0))


def txt(img, s, size, col, cx, cy, a=1.0, scale=1.0, stroke=1):
    blit(img, text_sprite(s, size, col, stroke), cx, cy, a, scale)


def txt_left(img, s, size, col, x, cy, a=1.0, stroke=1):
    sp = text_sprite(s, size, col, stroke)
    blit(img, sp, x + sp.width / 2, cy, a)


# ---------------------------------------------------------------- 背景与粒子
def make_bg(top, bottom, glow=None):
    y = np.linspace(0, 1, H)[:, None, None]
    arr = np.array(top, float) * (1 - y) + np.array(bottom, float) * y
    arr = np.repeat(arr, W, axis=1)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2)
    arr *= (1 - 0.55 * np.clip(r, 0, 1) ** 2)[:, :, None]
    if glow is not None:
        g = np.exp(-(((xx - W / 2) / 520.0) ** 2 + ((yy - 980) / 700.0) ** 2))
        arr += np.array(glow, float) * g[:, :, None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


BG = make_bg((9, 12, 28), (20, 26, 54))
BG_WARM = make_bg((22, 16, 18), (40, 28, 30), glow=(70, 44, 10))
BLACK = Image.new("RGB", (W, H), (0, 0, 0))

_rng = np.random.default_rng(7)
DUST = [tuple(_rng.uniform(lo, hi) for lo, hi in ((0, W), (0, H), (8, 30), (1.5, 4), (0, 6.3), (0.06, 0.22)))
        for _ in range(55)]
SPARKS = [tuple(_rng.uniform(lo, hi) for lo, hi in ((0, W), (0, H), (60, 170), (2, 5), (0, 6.3), (0.2, 0.6)))
          for _ in range(80)]


def particles(d, t):
    for x, y, v, r, ph, al in DUST:
        yy = (y - v * t) % H
        xx = x + 12 * math.sin(t * 0.5 + ph)
        a = al * (0.6 + 0.4 * math.sin(t * 1.3 + ph))
        d.ellipse([xx - r, yy - r, xx + r, yy + r], fill=rgba(WHITE, a))
    k = ease(lin(t, 30.4, 31.3))
    if k > 0:
        for x, y, v, r, ph, al in SPARKS:
            yy = (y - v * t) % H
            xx = x + 18 * math.sin(t * 0.8 + ph)
            a = k * al * (0.55 + 0.45 * math.sin(t * 3 + ph))
            d.ellipse([xx - r, yy - r, xx + r, yy + r], fill=rgba(GOLD, a))


# ---------------------------------------------------------------- 配音与字幕
VO_DIR = os.path.join(HERE, "assets", "voiceover")


def vo_clip(i):
    """第 i 条配音（44.1kHz 单声道 float），文件缺失时返回 None。"""
    path = os.path.join(VO_DIR, f"vo_{i:02d}.wav")
    if not os.path.exists(path):
        return None
    sr, a = wavfile.read(path)
    a = a.astype(np.float64) / 32768.0
    return resample_poly(a, SR, sr) if sr != SR else a


def make_subs():
    """字幕跟随实际配音时长；没有配音文件时按时间窗口显示。"""
    subs = []
    for i, (start, end, _, sub) in enumerate(VO):
        if sub is None:
            continue
        clip = vo_clip(i)
        stop = start + len(clip) / SR + 0.25 if clip is not None else end
        nxt = VO[i + 1][0] if i + 1 < len(VO) else DUR
        subs.append((start - 0.05, min(stop, nxt - 0.02), sub))
    return subs


SUBS = make_subs()


def subtitle(img, d, s, t, t0, t1):
    a = env(t, t0, t1, 0.15, 0.15)
    if a <= 0:
        return
    sp = text_sprite(s, 52, WHITE)
    if sp.width > 900:
        sp = text_sprite(s, 46, WHITE)
    bw, bh, cy = sp.width + 80, 96, 1665
    d.rounded_rectangle([540 - bw / 2, cy - bh / 2, 540 + bw / 2, cy + bh / 2], radius=48,
                        fill=(0, 0, 0, int(120 * a)))
    blit(img, sp, 540, cy, a)


# ---------------------------------------------------------------- 0–3s 钩子
HOOK = [
    ([("同样想考", WHITE), ("600", GOLD), ("分", WHITE)], 0.25, 800),
    ([("为什么有人", WHITE), ("轻松", GOLD)], 1.05, 930),
    ([("有人", WHITE), ("拼命", RED), ("？", WHITE)], 1.75, 1060),
]
TYPE_STEP = 0.075


def scene_hook(img, d, t):
    a = 1 - ease(lin(t, 2.65, 3.0))
    for segs, t0, y in HOOK:
        n = len("".join(s for s, _ in segs))
        k = int(clamp((t - t0) / TYPE_STEP + 1, 0, n))
        if k > 0:
            blit(img, rich_sprite(segs, 92, k, 2), 540, y, a)


# ---------------------------------------------------------------- 3–9s 起跑线
A_ITEMS = [("整理错题", 4.2), ("制定计划", 5.0), ("每日复盘", 5.8)]
B_ITEMS = [("刷会儿手机", 4.6), ("作业明天再说", 5.4), ("高三再努力", 6.2)]


def draw_book(d, cx, cy, a):
    for s in (-1, 1):
        pts = [(cx + s * 6, cy - 60), (cx + s * 120, cy - 80), (cx + s * 120, cy + 60), (cx + s * 6, cy + 80)]
        d.polygon(pts, fill=rgba(GOLD, 0.14 * a), outline=rgba(GOLD, a), width=5)
        for i in range(4):
            y = cy - 42 + i * 30
            d.line([(cx + s * 24, y + 4), (cx + s * 100, y - 9)], fill=rgba(GOLD, 0.7 * a), width=4)


def draw_phone(d, cx, cy, a, t):
    d.rounded_rectangle([cx - 75, cy - 130, cx + 75, cy + 130], radius=22,
                        fill=rgba((28, 34, 58), a), outline=rgba(GRAY, a), width=5)
    top, bot = cy - 108, cy + 108
    off = (t * 140) % 72
    for i in range(-1, 5):
        y0 = top + i * 72 - off + 72
        y1 = y0 + 50
        c0, c1 = max(y0, top), min(y1, bot)
        if c1 > c0:
            d.rectangle([cx - 56, c0, cx + 56, c1], fill=rgba(GRAY, 0.35 * a))


def scene_split(img, d, t):
    A = env(t, 3.0, 9.0, 0.4, 0.45)
    if A <= 0:
        return
    txt(img, "高一 · 同一起跑线", 64, WHITE, 540, 300, A * ease(lin(t, 3.1, 3.6)), stroke=2)
    g = ease_out(lin(t, 3.2, 3.9))
    d.line([(540, 420), (540, 420 + 780 * g)], fill=rgba(DIM, 0.6 * A), width=3)
    pop = back_out(lin(t, 3.3, 3.8))
    txt(img, "A同学", 60, GOLD, 270, 480, A * ease(lin(t, 3.3, 3.6)), 0.7 + 0.3 * pop, 2)
    txt(img, "B同学", 60, GRAY, 810, 480, A * ease(lin(t, 3.3, 3.6)), 0.7 + 0.3 * pop, 2)

    ia = A * ease(lin(t, 3.5, 4.0))
    draw_book(d, 270, 715, ia)
    draw_phone(d, 785, 715, ia, t)
    bp = back_out(lin(t, 4.3, 4.7))
    if bp > 0.02:
        bx, by, bw, bh = 950, 565, 180 * bp, 70 * bp
        d.rounded_rectangle([bx - bw / 2, by - bh / 2, bx + bw / 2, by + bh / 2], radius=int(30 * bp),
                            fill=rgba(WHITE, 0.92 * A))
        d.polygon([(bx - 50 * bp, by + bh / 2 - 2), (bx - 75 * bp, by + bh / 2 + 22 * bp),
                   (bx - 22 * bp, by + bh / 2 - 2)], fill=rgba(WHITE, 0.92 * A))
        txt(img, "还早呢～", 36, (60, 66, 90), bx, by, A, bp, 0)

    for i, (s, t0) in enumerate(A_ITEMS):
        y = 935 + i * 92
        a = A * ease(lin(t, t0 - 0.3, t0))
        if a <= 0:
            continue
        d.rounded_rectangle([118, y - 20, 158, y + 20], radius=8, outline=rgba(GOLD, a), width=4)
        k = ease_out(lin(t, t0, t0 + 0.25))
        p0, p1, p2 = (126, y), (136, y + 11), (154, y - 14)
        if k > 0:
            m = min(1.0, k * 2)
            pa = (p0[0] + (p1[0] - p0[0]) * m, p0[1] + (p1[1] - p0[1]) * m)
            pts = [p0, pa]
            if k > 0.5:
                m2 = (k - 0.5) * 2
                pts.append((p1[0] + (p2[0] - p1[0]) * m2, p1[1] + (p2[1] - p1[1]) * m2))
            d.line(pts, fill=rgba(GOLD, a), width=6, joint="curve")
        txt_left(img, s, 44, WHITE, 180, y, a)

    for i, (s, t0) in enumerate(B_ITEMS):
        y = 935 + i * 92
        a = A * ease(lin(t, t0 - 0.3, t0))
        if a <= 0:
            continue
        d.ellipse([622, y - 9, 640, y + 9], fill=rgba(GRAY, 0.8 * a))
        txt_left(img, s, 44, GRAY, 660, y, a)

    la = A * ease(lin(t, 3.8, 4.3))
    for x in range(70, 1010, 34):
        d.line([(x, 1270), (min(x + 18, 1010), 1270)], fill=rgba(WHITE, 0.45 * la), width=4)
    txt(img, "起跑线", 34, DIM, 540, 1320, la)
    for cx, col in ((270, GOLD), (810, GRAY)):
        r = 16 + 3 * math.sin(t * 5)
        d.ellipse([cx - r, 1270 - r, cx + r, 1270 + r], fill=rgba(col, la))


# ---------------------------------------------------------------- 9–31s 坐标图
X0, XG2, XG3, X1 = 150, 417, 683, 950
XA = 880              # A 在高三中段就达到目标分
YB, YT, AXIS_Y = 1420, 760, 1470
NSTEP = 9
A_TAGS = [("学习方法", 270), ("学习习惯", 425), ("知识基础", 600)]


def a_y(x):
    p = clamp((x - X0) / (XA - X0))
    s = p * NSTEP
    i = min(int(s), NSTEP - 1)
    f = s - i
    return YB - (YB - YT) * (i + ease((f - 0.5) / 0.5)) / NSTEP


def b_y(x):
    if x <= XG3:
        s = (x - X0) / (XG3 - X0)
        return YB - 22 * (1 - math.exp(-(x - X0) / 50)) - 8 * math.sin((x - X0) / 36) + 18 * math.sin(math.pi * s)
    q = (x - XG3) / (X1 - XG3)
    y0 = b_y(XG3)
    jit = (11 * math.sin(q * 41) + 6 * math.sin(q * 97)) * (1 - q)
    return y0 - (y0 - YT) * q + jit


def a_head(t):
    if t < 16.5:
        return X0 + (XG3 - X0) * lin(t, 9.6, 16.0)
    return XG3 + (XA - XG3) * ease_out(lin(t, 17.0, 19.4))


def b_head(t):
    if t < 16.5:
        return X0 + (XG3 - X0) * lin(t, 9.6, 16.0)
    return XG3 + (X1 - XG3) * lin(t, 18.0, 22.6) ** 1.2


def tag_time(x):
    return 9.6 + 6.4 * (x - X0) / (XG3 - X0)


def poly(fn, x0, x1, step=3):
    xs = list(np.arange(x0, x1, step)) + [x1]
    return [(float(x), fn(x)) for x in xs]


def dashed(d, x0, x1, y, col, width=3, dash=18, gap=14):
    x = x0
    while x < x1:
        d.line([(x, y), (min(x + dash, x1), y)], fill=col, width=width)
        x += dash + gap


def head(d, x, y, col, t, speed=1.5):
    ph = (t * speed) % 1
    ring = 12 + 14 * ph
    d.ellipse([x - ring, y - ring * 0.45, x + ring, y + ring * 0.45], outline=rgba(col, 0.8 * (1 - ph)), width=3)
    d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=rgba(col), outline=rgba(WHITE), width=2)


def stick(d, x, y, col, ph, amp=1.0, lean=0.0, cheer=0.0, h=78):
    """站在 (x, y) 的火柴人：ph 为步伐相位，amp 为摆动幅度，lean>0 前倾，cheer 为举手程度。"""
    c = rgba(col)
    s = math.sin(ph) * amp
    hip = (x + lean * 6, y - h * 0.42)
    neck = (x + lean * h * 0.38, y - h * 0.8)
    hd = (neck[0] + lean * 7, neck[1] - 13)
    for k in (1, -1):
        knee = (hip[0] + k * 9 * s + 4 + lean * 4, hip[1] + h * 0.2)
        foot = (x + k * 15 * s, y)
        d.line([hip, knee, foot], fill=c, width=7, joint="curve")
    d.line([hip, neck], fill=c, width=8)
    sh = (neck[0] - lean * 2, neck[1] + 8)
    for k in (1, -1):
        if cheer > 0:
            hand = (sh[0] + k * (14 + 6 * cheer), sh[1] - 34 * cheer + 26 * (1 - cheer))
            elbow = ((sh[0] + hand[0]) / 2 + k * 8, (sh[1] + hand[1]) / 2)
        else:
            hand = (sh[0] - k * 15 * s + lean * 14, sh[1] + 28 - lean * 6)
            elbow = ((sh[0] + hand[0]) / 2 - k * 3, (sh[1] + hand[1]) / 2 + 2)
        d.line([sh, elbow, hand], fill=c, width=6, joint="curve")
    d.ellipse([hd[0] - 12, hd[1] - 12, hd[0] + 12, hd[1] + 12], fill=c)


def star(d, x, y, r, a, rot):
    pts = []
    for i in range(8):
        ang = rot + i * math.pi / 4
        rr = r if i % 2 == 0 else r * 0.3
        pts.append((x + rr * math.cos(ang), y + rr * math.sin(ang)))
    d.polygon(pts, fill=rgba(GOLD, a))


def scene_chart(img, d, t):
    CA = ease(lin(t, 9.0, 9.6)) * (1 - 0.9 * ease(lin(t, 27.2, 27.9))) * (1 - ease(lin(t, 30.0, 30.5)))
    if CA <= 0.004:
        return
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(L)

    # 当前所在学年高亮
    ax = a_head(t)
    if t < 16.8:
        band = (X0, XG2) if ax < XG2 else (XG2, XG3)
        ld.rectangle([band[0], YT - 60, band[1], AXIS_Y], fill=rgba(WHITE, 0.05))
    else:
        ld.rectangle([XG3, YT - 60, X1, AXIS_Y], fill=rgba(RED, 0.08 * ease(lin(t, 16.8, 17.4))))

    # 坐标轴与目标线
    ld.line([(X0 - 30, AXIS_Y), (X1 + 40, AXIS_Y)], fill=rgba(DIM), width=4)
    for x in (XG2, XG3):
        ld.line([(x, AXIS_Y - 10), (x, AXIS_Y + 10)], fill=rgba(DIM), width=4)
    for s, x in (("高一", 283), ("高二", 550), ("高三", 817)):
        blit(L, text_sprite(s, 40, WHITE), x, AXIS_Y + 50, 0.85)
    ld.line([(X1, AXIS_Y), (X1, AXIS_Y - 46)], fill=rgba(GOLD), width=4)
    ld.polygon([(X1, AXIS_Y - 46), (X1 + 34, AXIS_Y - 36), (X1, AXIS_Y - 26)], fill=rgba(GOLD))
    blit(L, text_sprite("高考", 40, GOLD), X1, AXIS_Y + 50)
    dashed(ld, X0, X1, YT, rgba(GOLD, 0.75))
    tl = text_sprite("理想分数线 600", 36, GOLD)
    blit(L, tl, X0 + tl.width / 2, YT - 38, 0.9)

    # A：稳稳上台阶
    pa = poly(a_y, X0, ax)
    if len(pa) > 1:
        ld.line(pa, fill=rgba(GOLD, 0.25), width=26, joint="curve")
        ld.line(pa, fill=rgba(GOLD), width=10, joint="curve")
    # B：先躺平，再爬墙
    bx = b_head(t)
    pb = poly(b_y, X0, bx)
    for i in range(0, len(pb) - 1, 6):
        seg = pb[i:i + 7]
        k = clamp((seg[0][0] - XG3) / (X1 - XG3))
        ld.line(seg, fill=rgba(mix(GRAY, RED, k)), width=10, joint="curve")

    # A 的标签
    for s, x in A_TAGS:
        k = back_out(lin(t, tag_time(x), tag_time(x) + 0.35))
        blit(L, pill_sprite(s, 34, GOLD), x - 112, a_y(x) - 58, 1.0, k)

    # 差距标注
    ga = env(t, 15.6, 17.3, 0.4, 0.4)
    if ga > 0:
        gx, gy0, gy1 = 718, a_y(XG3) + 8, b_y(XG3) - 8
        col = rgba(WHITE, 0.85 * ga)
        ld.line([(gx, gy0), (gx, gy1)], fill=col, width=4)
        for yy in (gy0, gy1):
            ld.line([(gx - 14, yy), (gx + 14, yy)], fill=col, width=4)
        blit(L, text_sprite("差距", 44, RED, 2), gx + 62, (gy0 + gy1) / 2, ga)

    # 两个火柴人：A 稳步走、到达后举手；B 先慢悠悠后仰，再吃力前倾爬坡
    a_moving = abs(a_head(t) - a_head(t - 0.1)) > 0.5
    head(d=ld, x=ax, y=a_y(ax), col=GOLD, t=t)
    stick(ld, ax, a_y(ax) - 8, GOLD, ax / 11, 1.0 if a_moving else 0.15,
          lean=0.15 if a_moving else 0.0, cheer=ease(lin(t, 19.5, 20.0)))
    bcol = mix(GRAY, RED, clamp((bx - XG3) / (X1 - XG3)))
    climbing = 18.0 < t < 22.6
    shake = 3 * math.sin(t * 43) if climbing else 0.0
    b_moving = abs(b_head(t) - b_head(t - 0.1)) > 0.5
    head(d=ld, x=bx + shake, y=b_y(bx) + shake, col=bcol, t=t, speed=1.5 if t < 18 else 3.0)
    stick(ld, bx + shake, b_y(bx) - 8, bcol, (bx / 11) if not climbing else t * 14,
          1.0 if b_moving else 0.15, lean=0.9 if climbing or t > 22.6 else -0.25)
    if climbing or 22.6 <= t < 26.4:
        for i in range(2):  # 汗珠
            ph = (t * 1.6 + i * 0.5) % 1
            sx, sy = bx - 30 - i * 14, b_y(bx) - 86 + ph * 40
            ld.ellipse([sx - 5, sy - 7, sx + 5, sy + 7], fill=rgba((120, 190, 255), 1 - ph))

    # 终点：A 周围的小星星
    sa = ease(lin(t, 19.4, 20.0))
    if sa > 0:
        for i in range(3):
            ang = t * 1.2 + i * 2.1
            star(ld, ax + 52 * math.cos(ang), a_y(ax) - 70 + 44 * math.sin(ang), 11, sa * 0.9, t * 2 + i)

    if CA < 0.999:
        L.putalpha(L.getchannel("A").point(lambda v: int(v * CA)))
    img.paste(L, (0, 0), L)

    # ---- 顶部信息区
    a = env(t, 9.6, 17.0)
    if a > 0:
        txt(img, "差距，是一点点拉开的", 64, WHITE, 540, 360, a, stroke=2)

    a = env(t, 17.0, 22.0, 0.3, 0.4)
    if a > 0:
        txt(img, "距离高考", 44, WHITE, 290, 230, a)
        n = int(round(365 - (365 - 30) * ease(lin(t, 17.4, 21.4))))
        sp = text_sprite(str(n), 150, RED, 2)
        blit(img, sp, 270, 370, a)
        txt(img, "天", 48, WHITE, 270 + sp.width / 2 + 34, 410, a)
        txt(img, "B的高三任务", 36, GRAY, 790, 150, a)
        for i, (s, t0) in enumerate((("高一欠账", 17.3), ("高二欠账", 17.75), ("高三新课", 18.2))):
            k = ease_out(lin(t, t0, t0 + 0.3))
            if k <= 0:
                continue
            cy = 450 - i * 110 - 260 * (1 - k)
            d.rounded_rectangle([600, cy - 50, 980, cy + 50], radius=14, fill=rgba(RED, 0.88 * a * k))
            txt(img, s, 46, WHITE, 790, cy, a * k)

    a = env(t, 22.0, 26.4, 0.35, 0.4)
    if a > 0:
        d.rounded_rectangle([70, 150, 1010, 600], radius=36, fill=rgba(WHITE, 0.06 * a),
                            outline=rgba(DIM, 0.8 * a), width=3)
        txt(img, "同样提高 100 分", 54, WHITE, 540, 225, a, stroke=2)
        d.line([(540, 290), (540, 445)], fill=rgba(DIM, 0.8 * a), width=3)
        va = 2.8 * ease_out(lin(t, 22.4, 23.0))
        vb = 8.3 * ease_out(lin(t, 22.9, 23.5))
        txt(img, "A · 用3年", 40, GOLD, 300, 320, a)
        txt(img, f"每月 +{va:.1f}分", 60, GOLD, 300, 405, a, stroke=2)
        txt(img, "B · 只剩1年", 40, RED, 780, 320, a * ease(lin(t, 22.7, 23.0)))
        txt(img, f"每月 +{vb:.1f}分", 60, RED, 780, 405, a * ease(lin(t, 22.7, 23.0)), stroke=2)
        k = back_out(lin(t, 23.6, 24.0))
        blit(img, rich_sprite([("压力是 ", WHITE), ("3", RED), (" 倍", WHITE)], 76, None, 2), 540, 525, a, k)

    a = env(t, 26.2, 27.45, 0.3, 0.3)
    if a > 0:
        blit(img, pill_sprite("A：提前达标，从容冲刺", 44, GOLD), 540, 300, a)
        blit(img, pill_sprite("B：卡线上岸，精疲力尽", 44, RED), 540, 410, a)


# ---------------------------------------------------------------- 27.4–30.5s 点题
def scene_statement(img, d, t):
    out = 1 - ease(lin(t, 30.1, 30.5))
    lines = (([("你现在省下的力气", WHITE)], 27.45, 890),
             ([("高三都要", WHITE), ("加倍还回来", RED)], 28.85, 1020))
    for segs, t0, y in lines:
        k = ease_out(lin(t, t0, t0 + 0.5))
        sc = 1 + 0.06 * math.exp(-((t - 29.4) * 6) ** 2) if t0 == 28.85 else 1.0
        blit(img, rich_sprite(segs, 82, None, 2), 540, y + 30 * (1 - k), k * out, sc)


# ---------------------------------------------------------------- 30.5–35.5s 收尾 + 品牌落版
LOGO_T = 32.75


def logo_card():
    key = ("logo",)
    if key not in _sprites:
        lg = draw_logo(None)
        w, h = lg.width + 120, lg.height + 84
        im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(im).rounded_rectangle([0, 0, w - 1, h - 1], radius=40, fill=(255, 255, 255, 255))
        im.alpha_composite(lg, (60, (h - lg.height) // 2))
        _sprites[key] = im
    return _sprites[key]


def scene_end(img, d, t):
    # 第一屏：越早开始，高考越轻松
    out = 1 - ease(lin(t, LOGO_T - 0.3, LOGO_T + 0.1))
    up = -60 * ease(lin(t, LOGO_T - 0.3, LOGO_T + 0.1))
    if out > 0:
        k1 = back_out(lin(t, 30.6, 31.1))
        sp1 = text_sprite("越早开始", 132, GOLD, 3)
        blit(img, glow_sprite(sp1), 540, 800 + up, 0.55 * ease(lin(t, 30.6, 31.1)) * out, 0.6 + 0.4 * k1)
        blit(img, sp1, 540, 800 + up, ease(lin(t, 30.6, 30.9)) * out, 0.6 + 0.4 * k1)
        k2 = back_out(lin(t, 31.55, 32.05))
        blit(img, text_sprite("高考越轻松", 132, WHITE, 3), 540, 960 + up,
             ease(lin(t, 31.55, 31.85)) * out, 0.6 + 0.4 * k2)
        half = 260 * ease_out(lin(t, 31.9, 32.3))
        if half > 1:
            d.line([(540 - half, 1075 + up), (540 + half, 1075 + up)], fill=rgba(GOLD, 0.9 * out), width=4)
        txt(img, "高一高二，就是拉开差距的时候", 50, WHITE, 540, 1160 + up, 0.92 * ease(lin(t, 32.0, 32.4)) * out)

    # 第二屏：logo + 品牌口号
    k = ease_out(lin(t, LOGO_T, LOGO_T + 0.45))
    a = ease(lin(t, LOGO_T, LOGO_T + 0.3))
    if a > 0:
        card = logo_card()
        # logo 卡片只做淡入和轻微上移，不缩放，保证官方 logo 像素不变
        blit(img, glow_sprite(card, 30), 540, 860, 0.35 * a)
        blit(img, card, 540, int(860 + 20 * (1 - k)), a)
        k3 = ease_out(lin(t, LOGO_T + 0.35, LOGO_T + 0.8))
        segs = [("高效学习，从", WHITE), ("有道领世", GOLD), ("开始", WHITE)]
        blit(img, rich_sprite(segs, 68, None, 2), 540, 1085 + 24 * (1 - k3), k3)


def render(t):
    img = BG.copy()
    k = ease(lin(t, 30.2, 31.0))
    if k > 0:
        img = Image.blend(img, BG_WARM, k)
    d = ImageDraw.Draw(img, "RGBA")
    particles(d, t)
    if t < 3.05:
        scene_hook(img, d, t)
    if 2.95 < t < 9.05:
        scene_split(img, d, t)
    if 8.95 < t < 30.55:
        scene_chart(img, d, t)
    if 27.4 < t < 30.55:
        scene_statement(img, d, t)
    if t > 30.5:
        scene_end(img, d, t)
    for a, b, s in SUBS:
        subtitle(img, d, s, t, a, b)
    fade = min(ease(lin(t, 0.0, 0.25)), 1 - ease(lin(t, DUR - 0.45, DUR)))
    if fade < 1:
        img = Image.blend(BLACK, img, fade)
    return img


# ================================================================ 配乐合成
NOTE_IDX = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1,
            "A": 0, "A#": 1, "B": 2}


def nf(s):
    return 440.0 * 2 ** ((NOTE_IDX[s[:-1]] + 12 * (int(s[-1]) - 4)) / 12)


CHORDS = {
    "Am": ["A2", "A3", "C4", "E4", "A4", "C5"],
    "F": ["F2", "F3", "A3", "C4", "F4", "A4"],
    "C": ["C3", "G3", "C4", "E4", "G4", "C5"],
    "G": ["G2", "G3", "B3", "D4", "G4", "B4"],
}
PROG = ["Am", "F", "C", "G"]
_noise = np.random.default_rng(3)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def piano(freq, vel=1.0, dur=2.6):
    t = tt(dur)
    y = np.zeros_like(t)
    for k in range(1, 9):
        f = freq * k * math.sqrt(1 + 0.0004 * k * k)
        if f > SR / 2 - 2000:
            break
        y += np.sin(2 * np.pi * f * t) * np.exp(-t * (1.1 + 0.9 * k) * (freq / 440) ** 0.3) / k ** 1.3
    y *= np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.08)
    return 0.22 * vel * y


def pad(freqs, dur, att=1.0, rel=1.2):
    t = tt(dur)
    y = np.zeros_like(t)
    vib = 0.003 * np.sin(2 * np.pi * 5 * t)
    for f in freqs:
        for det in (-0.003, 0.003):
            for k in range(1, 7):
                y += np.sin(2 * np.pi * f * (1 + det) * k * t * (1 + vib)) / k ** 1.6
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur - t) / rel))
    return 0.025 * y * e


def kick():
    t = tt(0.45)
    ph = 2 * np.pi * np.cumsum(45 + 95 * np.exp(-t * 28)) / SR
    return 0.9 * np.sin(ph) * np.exp(-t * 7)


def snare(vel=1.0):
    t = tt(0.3)
    n = np.diff(_noise.standard_normal(len(t) + 1))
    return vel * (0.25 * n * np.exp(-t * 20) + 0.35 * np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25))


def hat():
    t = tt(0.06)
    return 0.09 * np.diff(_noise.standard_normal(len(t) + 1)) * np.exp(-t * 70)


def blip(f0, f1, dur, gain):
    t = tt(dur)
    ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * t / dur) / SR
    return gain * np.sin(ph) * np.exp(-t * 30) * np.minimum(1, t / 0.003)


def click():
    t = tt(0.012)
    return 0.07 * np.diff(_noise.standard_normal(len(t) + 1)) * np.exp(-t * 400)


def thud():
    t = tt(0.4)
    ph = 2 * np.pi * np.cumsum(55 + 60 * np.exp(-t * 20)) / SR
    return 0.7 * np.sin(ph) * np.exp(-t * 9) + 0.06 * _noise.standard_normal(len(t)) * np.exp(-t * 30)


def boom():
    t = tt(2.2)
    ph = 2 * np.pi * np.cumsum(38 + 50 * np.exp(-t * 6)) / SR
    return 0.9 * np.sin(ph) * np.exp(-t * 2.2) + 0.12 * _noise.standard_normal(len(t)) * np.exp(-t * 8)


def whoosh(dur=0.7, gain=0.18):
    t = tt(dur)
    n = np.convolve(_noise.standard_normal(len(t)), np.ones(6) / 6, "same")
    return gain * n * np.sin(np.pi * t / dur) ** 2


def riser(dur=1.5):
    t = tt(dur)
    n = np.diff(_noise.standard_normal(len(t) + 1))
    return 0.12 * n * (t / dur) ** 2.5


def crash():
    t = tt(1.8)
    return 0.12 * np.diff(_noise.standard_normal(len(t) + 1)) * np.exp(-t * 2.5)


def reverb(x, seed, rt=2.0):
    rng = np.random.default_rng(seed)
    t = tt(rt)
    ir = rng.standard_normal(len(t)) * np.exp(-t * 6.9 / rt)
    ir = np.convolve(ir, np.ones(5) / 5, "same")
    ir = np.concatenate([np.zeros(int(0.02 * SR)), ir])
    ir /= np.sqrt(np.sum(ir ** 2))
    n = 1 << int(math.ceil(math.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:len(x)]


def compose():
    N = int(DUR * SR)
    wet = np.zeros((2, N))
    dry = np.zeros((2, N))

    def add(buf, start, sig, gain=1.0, pan=0.0):
        i = int(start * SR)
        if i >= N:
            return
        n = min(len(sig), N - i)
        l, r = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
        buf[0, i:i + n] += sig[:n] * gain * l
        buf[1, i:i + n] += sig[:n] * gain * r

    # 0–3s：一声钢琴单音 + 打字声
    add(wet, 0.25, piano(nf("A4"), 0.9, 3.0))
    add(wet, 0.25, piano(nf("A3"), 0.5, 3.0))
    for segs, t0, _ in HOOK:
        for i in range(len("".join(s for s, _ in segs))):
            add(dry, t0 + i * TYPE_STEP, click(), 1.0, 0.3 * math.sin(i))

    # 3–26s：琶音（前段八分、后段十六分），9s 起加弦乐与低音，17s 起加鼓
    for i in range(12):
        st = 3.0 + 2 * i
        ch = CHORDS[PROG[i % 4]]
        fast = st >= 17.0
        steps = 16 if fast else 8
        pat = [1, 2, 3, 4, 5, 4, 3, 2]
        vel = 0.55 if st < 9 else (0.65 if not fast else 0.6)
        for j in range(steps):
            nt = st + j * (2.0 / steps)
            if nt >= 26.0:
                break
            v = vel * (1.15 if j % 4 == 0 else 1.0)
            add(wet, nt, piano(nf(ch[pat[j % 8]]), v, 1.6 if fast else 2.4), 1.0, 0.25 * math.sin(j))
        if st >= 9.0:
            add(wet, st, pad([nf(n) for n in ch[1:4]], 2.6 if st < 25 else 1.6, 0.6, 0.9),
                ease(lin(st, 9.0, 13.0)) * (1.25 if fast else 1.0))
            add(wet, st, piano(nf(ch[0]), 0.9, 2.0))
            add(dry, st, piano(nf(ch[0]) / 2, 0.6, 2.0))

    add(dry, 15.5, riser(1.5))
    add(wet, 17.0, crash())
    beat = 17.0
    while beat < 25.0:
        add(dry, beat, kick(), 0.6)
        if beat >= 19.0 and int(round((beat - 17.0) / 0.5)) % 2 == 1:
            add(dry, beat, snare(), 0.65)
        add(dry, beat + 0.25, hat(), 1.0, 0.4)
        beat += 0.5
    for j in range(8):  # 25–26s 军鼓渐强过门
        add(dry, 25.0 + j * 0.125, snare(0.4 + 0.08 * j))
    add(dry, 25.0, kick(), 0.8)
    add(dry, 25.5, kick(), 0.8)

    # 26–30.5s：只剩钢琴
    for n in ("G3", "B3", "D4"):
        add(wet, 26.0, piano(nf(n), 0.45, 1.8))
    add(dry, 27.45, boom(), 0.9)
    for n in ("A2", "A3", "E4", "A4"):
        add(wet, 27.45, piano(nf(n), 0.8, 3.0))
    for n, st in (("E5", 28.1), ("D5", 28.85), ("C5", 29.4), ("B4", 30.0)):
        add(wet, st, piano(nf(n), 0.7, 2.4))
    for n in ("F3", "A3", "C4"):
        add(wet, 29.4, piano(nf(n), 0.45, 2.0))

    # 30.6s 起：C 大调解决 + 闪光；32.75s logo 出现时一声清亮的琶音
    for n in ("C3", "G3", "C4", "E4", "G4"):
        add(wet, 30.6, piano(nf(n), 0.8, 4.5))
    add(wet, 30.6, pad([nf("C4"), nf("E4"), nf("G4")], DUR - 30.6, 1.2, 1.6), 1.1)
    for i, n in enumerate(("C6", "E6", "G6", "C7")):
        add(wet, 30.7 + i * 0.09, piano(nf(n), 0.35, 1.5), 1.0, -0.5 + i * 0.33)
    for n, st in (("G4", 31.55), ("E5", 32.1)):
        add(wet, st, piano(nf(n), 0.55, 2.0))
    for i, n in enumerate(("C5", "E5", "G5", "C6")):
        add(wet, LOGO_T + i * 0.07, piano(nf(n), 0.5, 2.5), 1.0, -0.3 + i * 0.2)
    for n in ("F3", "A3", "C4", "F4"):
        add(wet, 33.9, piano(nf(n), 0.4, 1.6))
    for n in ("C3", "G3", "C4", "E4"):
        add(wet, 34.5, piano(nf(n), 0.45, 1.0))

    # 画面音效
    for _, t0 in A_ITEMS:
        add(dry, t0, blip(900, 1350, 0.12, 0.25), 1.0, -0.4)
    for _, t0 in B_ITEMS:
        add(dry, t0, blip(320, 210, 0.15, 0.22), 1.0, 0.4)
    add(dry, 4.3, blip(600, 750, 0.1, 0.15), 1.0, 0.5)
    for _, x in A_TAGS:
        add(dry, tag_time(x), blip(1000, 1500, 0.1, 0.22))
    for t0 in (17.3, 17.75, 18.2):
        add(dry, t0 + 0.28, thud(), 0.8)
    add(dry, 21.8, whoosh(), 1.0)
    add(dry, 23.6, thud(), 0.6)
    add(dry, 29.9, whoosh(1.0, 0.12), 1.0)
    add(dry, LOGO_T - 0.35, whoosh(0.6, 0.1), 1.0)

    out = dry + wet
    out[0] += 0.35 * reverb(wet[0] + 0.15 * dry[0], 11)
    out[1] += 0.35 * reverb(wet[1] + 0.15 * dry[1], 12)
    t = np.arange(N) / SR
    out *= np.minimum(1, t / 0.02) * np.clip((DUR - t) / 0.8, 0, 1)
    out = np.tanh(1.3 * out / np.max(np.abs(out)))
    return out / np.max(np.abs(out)) * 0.9


def smooth(x, sec):
    n = max(1, int(sec * SR))
    c = np.cumsum(np.concatenate([np.zeros(n), x, np.zeros(n)]))
    return ((c[2 * n:] - c[:-2 * n]) / (2 * n))[:len(x)]


def mix_voice(music):
    """把配音铺到时间轴上，配音时音乐自动压低（侧链闪避）。"""
    N = music.shape[1]
    vo = np.zeros(N)
    active = np.zeros(N)
    for i, (start, _, _, _) in enumerate(VO):
        clip = vo_clip(i)
        if clip is None:
            continue
        a = int(start * SR)
        n = min(len(clip), N - a)
        vo[a:a + n] += clip[:n]
        active[a:a + n] = 1.0
    if not active.any():
        return music
    vo = np.convolve(vo, [1.0, -0.6], "same")  # 轻微提亮、去闷
    vo /= np.max(np.abs(vo))
    on = np.clip(smooth(active, 0.18), 0, 1)
    duck = 1 - 0.78 * on
    # 配乐较满的段落（鼓点段）再额外压低，保证音乐始终比人声低约 9dB
    bed = np.sqrt(smooth((music[0] * duck * 0.8) ** 2, 0.25)) + 1e-6
    voice = np.sqrt(smooth((vo * 0.95) ** 2, 0.6))
    duck *= smooth(np.where(on > 0.5, np.minimum(1.0, voice * 0.35 / bed), 1.0), 0.15)
    room = reverb(vo, 21, 1.0)
    out = music * duck[None, :] * 0.8 + (vo + 0.06 * room)[None, :] * 0.95
    out = np.tanh(1.2 * out / np.max(np.abs(out)))
    return out / np.max(np.abs(out)) * 0.9


def write_wav(path, stereo):
    pcm = (np.clip(stereo.T, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ================================================================ 主流程
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", help="逗号分隔的时间点（秒），只导出预览帧")
    ap.add_argument("--preview-dir", default=os.path.join(HERE, "preview"))
    args = ap.parse_args()

    if args.preview:
        os.makedirs(args.preview_dir, exist_ok=True)
        for s in args.preview.split(","):
            render(float(s)).save(os.path.join(args.preview_dir, f"frame_{float(s):05.1f}.png"))
        return

    os.makedirs(OUT_DIR, exist_ok=True)
    tmp = tempfile.mkdtemp()
    try:
        music = compose()
        tracks = {"完整版": mix_voice(music), "无配音版": music}
        silent = os.path.join(tmp, "video.mp4")
        ff = subprocess.Popen(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
             "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
             "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", silent],
            stdin=subprocess.PIPE)
        for i in range(int(DUR * FPS)):
            ff.stdin.write(render(i / FPS).tobytes())
        ff.stdin.close()
        if ff.wait() != 0:
            raise SystemExit("ffmpeg 编码失败")

        for label, audio in tracks.items():
            wav = os.path.join(tmp, f"{label}.wav")
            write_wav(wav, audio)
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", silent, "-i", wav,
                 "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                 "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "aac", "-b:a", "192k",
                 "-shortest", "-movflags", "+faststart", os.path.join(OUT_DIR, f"{NAME}_{label}.mp4")],
                check=True)
        render(24.5).save(os.path.join(OUT_DIR, "封面.png"))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
