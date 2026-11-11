# 生成《发布排期表.xlsx》：按发布日期排列视频、视频号封面、朋友圈文案与分类
# 用法：python3 tools/schedule_xlsx.py  → ../docs/发布排期表.xlsx
import datetime as dt, glob, io, os, re, subprocess, sys, urllib.parse
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XImage
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from publish_data import SCHEDULE, CAPTIONS, NOTES, AUDIENCE_PARENT, AUDIENCE_G3

REPO = "https://github.com/zhangzhitao0103-coder/shipin-lizhi/blob/claude/friendly-curie-ih1pc9/studio/"
CATS = {"A": "时间的力量", "B": "迈出第一步", "C": "坚持到临界点", "D": "每天一点点", "E": "集中力量", "F": "方法与借力", "G": "差距与竞争",
        "H": "短板决定上限", "I": "关键窗口期", "J": "你也可以", "K": "家长专属", "L": "心态与抗压", "M": "期末冲刺", "N": "寒假规划", "W": "致高三"}
# 一级分类（情绪组），与封面标签配色一致：红 = 塑危，橙 = 激励，蓝 = 赋能，深红 = 致高三
L1 = {**{k: "塑危·制造紧迫感" for k in "AGHI"}, **{k: "激励·行动与坚持" for k in "BCD"},
      **{k: "赋能·方法与心态" for k in "EFJKLMN"}, "W": "致高三·节点关怀"}
L1_COLOR = {"塑危·制造紧迫感": "FDE2E2", "激励·行动与坚持": "FEF0D6", "赋能·方法与心态": "DCE8FB", "致高三·节点关怀": "F8D0D6"}
WEEK = "一二三四五六日"

def title_of(i):
    f = glob.glob(os.path.join(ROOT, "out", f"{i}_*_AI配音.mp4"))[0]
    return os.path.basename(f)[len(i) + 1:-len("_AI配音.mp4")]

def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode())

def link(rel):
    return REPO + urllib.parse.quote(rel)

def audience(i):
    if i[0] == "K" or i in AUDIENCE_PARENT: return "家长"
    if i in AUDIENCE_G3: return "高三学生"
    if i == "I2": return "高一学生/家长"
    return "高中生"

ids = [s[1] for s in SCHEDULE]
assert len(ids) == len(set(ids)) == 74, len(ids)
assert set(ids) == set(CAPTIONS), set(ids) ^ set(CAPTIONS)

wb = Workbook()
ws = wb.active; ws.title = "发布排期"
thin = Side(style="thin", color="D0D0D0"); BD = Border(left=thin, right=thin, top=thin, bottom=thin)
HF = PatternFill("solid", fgColor="1D3C8F"); HFont = Font(name="微软雅黑", bold=True, color="FFFFFF", size=11)
BF = Font(name="微软雅黑", size=10); LF = Font(name="微软雅黑", size=10, color="1155CC", underline="single")
WRAP = Alignment(wrap_text=True, vertical="center"); CEN = Alignment(horizontal="center", vertical="center", wrap_text=True)

cols = [("序号", 6), ("发布日期", 12), ("星期", 6), ("节点/场景", 20), ("编号", 7), ("一级分类\n（情绪组）", 16), ("二级分类\n（主题类型）", 14),
        ("三级\n（视频标题）", 26), ("受众", 10), ("时长\n（秒）", 8), ("视频号封面\n（3:4）", 20), ("朋友圈文案（四句）", 56),
        ("AI配音版", 12), ("无配音版", 12), ("视频号封面\n文件", 12), ("竖版封面\n文件", 12), ("备注", 30), ("发布状态", 10)]
for c, (name, w) in enumerate(cols, 1):
    cell = ws.cell(row=1, column=c, value=name); cell.fill = HF; cell.font = HFont; cell.alignment = CEN; cell.border = BD
    ws.column_dimensions[cell.column_letter].width = w
ws.row_dimensions[1].height = 36
ws.freeze_panes = "F2"

thumbs = os.path.join(ROOT, "build", "_thumbs"); os.makedirs(thumbs, exist_ok=True)
for r, (d, i, scene) in enumerate(SCHEDULE, 2):
    t = title_of(i); date = dt.date.fromisoformat(d)
    files = {k: f"out/{i}_{t}_{k}.mp4" for k in ("AI配音", "无配音")}
    cover34 = f"out/视频号封面/{i}_{t}_视频号封面.jpg"; cover916 = f"out/{i}_{t}_封面.jpg"
    for p in [*files.values(), cover34, cover916]: assert os.path.exists(os.path.join(ROOT, p)), p
    row = [r - 1, date, "周" + WEEK[date.weekday()], scene, i, L1[i[0]], CATS[i[0]], t, audience(i),
           round(duration(os.path.join(ROOT, files["AI配音"])), 1), None, "\n".join(CAPTIONS[i]),
           "打开", "打开", "打开", "打开", NOTES.get(i, ""), "未发布"]
    for c, v in enumerate(row, 1):
        cell = ws.cell(row=r, column=c, value=v); cell.font = BF; cell.border = BD
        cell.alignment = WRAP if c in (4, 8, 12, 17) else CEN
    ws.cell(row=r, column=2).number_format = "yyyy-mm-dd"
    ws.cell(row=r, column=6).fill = PatternFill("solid", fgColor=L1_COLOR[L1[i[0]]])
    for c, p in zip((13, 14, 15, 16), (files["AI配音"], files["无配音"], cover34, cover916)):
        ws.cell(row=r, column=c).hyperlink = link(p); ws.cell(row=r, column=c).font = LF
    if i in ("A1", "A5"): ws.cell(row=r, column=17).font = Font(name="微软雅黑", size=10, color="C00000", bold=True)
    # 缩略图（120×160 像素）
    tp = os.path.join(thumbs, i + ".png"); Image.open(os.path.join(ROOT, cover34)).resize((120, 160), Image.LANCZOS).save(tp)
    img = XImage(tp); img.width, img.height = 120, 160
    ws.add_image(img, f"K{r}")
    ws.row_dimensions[r].height = 126
ws.auto_filter.ref = f"A1:R{len(SCHEDULE) + 1}"
dv = DataValidation(type="list", formula1='"未发布,已发布,暂缓"', allow_blank=True); ws.add_data_validation(dv); dv.add(f"R2:R{len(SCHEDULE) + 1}")
last = len(SCHEDULE) + 1

# —— 分类体系 ——
ws2 = wb.create_sheet("分类体系")
hdr = ["一级分类（情绪组）", "二级编号", "二级分类（主题类型）", "已制作条数", "已发布条数", "包含视频（编号·标题）"]
for c, h in enumerate(hdr, 1):
    cell = ws2.cell(row=1, column=c, value=h); cell.fill = HF; cell.font = HFont; cell.alignment = CEN; cell.border = BD
for c, w in zip("ABCDEF", (18, 9, 16, 11, 11, 90)): ws2.column_dimensions[c].width = w
r = 2
for grp in ["塑危·制造紧迫感", "激励·行动与坚持", "赋能·方法与心态", "致高三·节点关怀"]:
    for k in [k for k in CATS if L1[k] == grp]:
        vids = sorted([i for i in ids if i[0] == k], key=lambda x: int(x[1:]))
        vals = [grp, k, CATS[k], f'=COUNTIF(发布排期!G2:G{last},C{r})', f'=COUNTIFS(发布排期!G2:G{last},C{r},发布排期!R2:R{last},"已发布")',
                "；".join(f"{v}·{title_of(v)}" for v in vids)]
        for c, v in enumerate(vals, 1):
            cell = ws2.cell(row=r, column=c, value=v); cell.font = BF; cell.border = BD; cell.alignment = WRAP if c == 6 else CEN
        ws2.cell(row=r, column=1).fill = PatternFill("solid", fgColor=L1_COLOR[grp])
        ws2.row_dimensions[r].height = 34
        r += 1
ws2.cell(row=r, column=3, value="合计").font = Font(name="微软雅黑", bold=True)
ws2.cell(row=r, column=4, value=f"=SUM(D2:D{r - 1})").font = Font(name="微软雅黑", bold=True)
ws2.cell(row=r, column=5, value=f"=SUM(E2:E{r - 1})").font = Font(name="微软雅黑", bold=True)
r += 2
ws2.cell(row=r, column=1, value="一级分类小计").font = Font(name="微软雅黑", bold=True); r += 1
for grp in L1_COLOR:
    ws2.cell(row=r, column=1, value=grp).font = BF
    ws2.cell(row=r, column=4, value=f'=COUNTIF(发布排期!F2:F{last},A{r})').font = BF
    ws2.cell(row=r, column=1).fill = PatternFill("solid", fgColor=L1_COLOR[grp]); r += 1
ws2.cell(row=r + 1, column=1, value="受众小计").font = Font(name="微软雅黑", bold=True); r += 2
for a in ["高中生", "家长", "高三学生", "高一学生/家长"]:
    ws2.cell(row=r, column=1, value=a).font = BF
    ws2.cell(row=r, column=4, value=f'=COUNTIF(发布排期!I2:I{last},A{r})').font = BF; r += 1

# —— 说明 ——
ws3 = wb.create_sheet("说明")
ws3.column_dimensions["A"].width = 18; ws3.column_dimensions["B"].width = 100
notes = [
    ("用途", "74 条励志短视频的发布排期、视频号封面与朋友圈文案总表，留作后续发布使用。"),
    ("分类层级", "一级＝情绪组（塑危 / 激励 / 赋能 / 致高三，与封面左上角标签颜色一致）；二级＝主题类型（A–N、W，共 15 类）；三级＝单条视频标题。"),
    ("排期规则", "从 2026-11-12 起，按用户节点排：期中后（11 月）→ 常青内容 → 期末前 4 周（12/21 起）→ 期末前 1 周 → 寒假前 → 寒假中 → 开学 → 高考百日（2027-02-27）。周末多排家长向内容。"),
    ("节点假设", "期末约 1 月中下旬、寒假约 1/23–2/21、春节 2027-02-06，各地不同，请按本地学校日历前后挪动；I4 必须在 2027-02-27 发。"),
    ("需更新", "A1（高考倒计时 226 天）、A5（剩 32 个周末）的数字按旧日期计算，发布前需按发布日重算并重新生成视频。"),
    ("视频版本", "AI配音版：带人声配音，适合视频号 / 朋友圈直接发；无配音版：只有配乐和音效，可自行配音或二次剪辑。"),
    ("视频号封面", "3:4（1080×1440），文件在 studio/out/视频号封面/；上传视频号时选“自定义封面”。竖版封面（9:16）可用作朋友圈视频首帧或其他平台。"),
    ("朋友圈文案", "每条四句、每句开头一个 emoji，不含行动指令；数字与视频内容一致，可直接复制单元格（单元格内已换行）。"),
    ("链接", "“打开”为 GitHub 仓库链接（分支 claude/friendly-curie-ih1pc9），需有仓库访问权限。"),
    ("发布状态", "最后一列可下拉选择 未发布 / 已发布 / 暂缓；“分类体系”表会自动统计各类已发布条数。"),
]
for r, (a, b) in enumerate(notes, 1):
    ws3.cell(row=r, column=1, value=a).font = Font(name="微软雅黑", bold=True, size=10)
    c = ws3.cell(row=r, column=2, value=b); c.font = BF; c.alignment = WRAP
    ws3.row_dimensions[r].height = 36

out = os.path.join(os.path.dirname(ROOT), "docs", "发布排期表.xlsx")
wb.save(out); print("saved", out)
