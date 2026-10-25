"""有道领世 logo 的矢量复刻（用于片尾落版）。

若 assets/logo.png 存在（官方原图），片尾优先使用原图。
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO_FILE = os.path.join(HERE, "assets", "logo.png")
FONT_PATH = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"

BLUE = (30, 98, 255)
ORANGE = (255, 150, 20)
TEXT = (51, 51, 51)


def _gradient(w, h, top, bottom):
    y = np.linspace(0, 1, h)[:, None, None]
    arr = np.array(top, float) * (1 - y) + np.array(bottom, float) * y
    return Image.fromarray(np.repeat(arr, w, axis=1).astype(np.uint8), "RGB")


def draw_logo(height=110):
    """返回 RGBA 的 logo（透明底，深色文字），高度为 height；height=None 时返回原图原尺寸。"""
    if os.path.exists(LOGO_FILE):
        im = Image.open(LOGO_FILE).convert("RGBA")
        if height is None or height == im.height:
            return im  # 官方原图：原尺寸、原像素，不做任何改动
        return im.resize((int(im.width * height / im.height), height), Image.LANCZOS)

    s = 4  # 超采样抗锯齿
    W, H = 540 * s, 110 * s
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    def P(x, y):
        return (x * s, y * s)

    # 左侧：蓝色小圈 + 斜向下到底部尖角
    blue = Image.new("L", (W, H), 0)
    bd = ImageDraw.Draw(blue)
    bd.ellipse([*P(3, 24), *P(37, 58)], outline=255, width=11 * s)
    bd.line([P(30, 50), P(108, 100)], fill=255, width=15 * s)
    bd.ellipse([*P(101, 93), *P(115, 107)], fill=255)
    im.paste(Image.new("RGB", (W, H), BLUE), (0, 0), blue)

    # 右侧：顶部横笔 + 斜笔到尖角，橙→蓝渐变
    grad = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(grad)
    gd.polygon([P(66, 2), P(162, 2), P(117, 106), P(99, 97), P(132, 22), P(74, 22)], fill=255)
    im.paste(_gradient(W, H, ORANGE, BLUE), (0, 0), grad)

    # 文字
    f = ImageFont.truetype(FONT_PATH, 84 * s)
    ImageDraw.Draw(im).text(P(176, 8), "有道领世", font=f, fill=TEXT + (255,),
                            stroke_width=3 * s, stroke_fill=TEXT + (255,))
    im = im.resize((540, 110), Image.LANCZOS)
    return im.resize((int(540 * height / 110), height), Image.LANCZOS)


if __name__ == "__main__":
    bg = Image.new("RGBA", (600, 160), (255, 255, 255, 255))
    lg = draw_logo()
    bg.alpha_composite(lg, (30, 25))
    bg.save(os.path.join(HERE, "assets", "logo_preview.png"))
