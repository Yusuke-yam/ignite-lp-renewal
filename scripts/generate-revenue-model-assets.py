from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "scripts" / "revenue-model-assets.json"
GOLD = (194, 122, 5)
GOLD_OUTLINE = (213, 141, 16)
PANEL_FILL = (255, 255, 252)
TEXT_DARK = (23, 23, 23)


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size, index=index)
    except OSError:
        return ImageFont.truetype("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", size)


def box_from_ratio(width: int, height: int, ratio: dict[str, float]) -> tuple[int, int, int, int]:
    return (
        round(width * ratio["left"]),
        round(height * ratio["top"]),
        round(width * ratio["right"]),
        round(height * ratio["bottom"])
    )


def draw_arrow(draw: ImageDraw.ImageDraw, center: tuple[int, int], size: int) -> None:
    cx, cy = center
    shaft_width = round(size * 0.34)
    shaft_length = round(size * 0.42)
    head_length = round(size * 0.48)
    head_height = round(size * 0.82)
    x0 = cx - (shaft_length + head_length) // 2
    y0 = cy - shaft_width // 2
    points = [
        (x0, y0),
        (x0 + shaft_length, y0),
        (x0 + shaft_length, cy - head_height // 2),
        (x0 + shaft_length + head_length, cy),
        (x0 + shaft_length, cy + head_height // 2),
        (x0 + shaft_length, y0 + shaft_width),
        (x0, y0 + shaft_width)
    ]
    draw.polygon(points, fill=GOLD)


def redraw_revenue_frame(image: Image.Image, framework: dict[str, object]) -> None:
    draw = ImageDraw.Draw(image)
    panel = box_from_ratio(image.width, image.height, framework["panel"])
    radius = round(float(framework["panel"].get("radius", 16)))
    draw.rounded_rectangle(panel, radius=radius, fill=PANEL_FILL, outline=GOLD_OUTLINE, width=3)


def render_case(case: dict[str, object], labels: list[str], framework: dict[str, object]) -> None:
    source = ROOT / str(case["source"])
    output = ROOT / str(case["output"])
    if not source.exists():
        raise FileNotFoundError(f"source asset not found: {source}")

    image = Image.open(source).convert("RGBA")
    width, height = image.size
    panel = box_from_ratio(width, height, framework["panel"])
    repair = case.get("panelRepair", {})
    if repair.get("redrawFrame"):
        redraw_revenue_frame(image, framework)
    draw = ImageDraw.Draw(image)

    amount_font = font("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", round(height * 0.052), index=2)
    label_font = font("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", round(height * 0.026))
    panel_width = panel[2] - panel[0]
    panel_height = panel[3] - panel[1]
    amount_y = panel[1] + round(panel_height * framework["amountY"])
    label_y = panel[1] + round(panel_height * framework["labelY"])
    clear_top = panel[1] + round(panel_height * framework["clearTop"])
    clear_bottom = panel[1] + round(panel_height * framework["clearBottom"])
    clear_clip_right = round(width * framework["clearClipRight"])

    arrow_y = panel[1] + round(panel_height * framework["amountY"])
    arrow_size = round(height * 0.065)
    arrow_clear_width = round(panel_width * framework["arrowClearBoxWidth"])
    for x_ratio in framework["arrowPositions"]:
        x = panel[0] + round(panel_width * x_ratio)
        draw.rounded_rectangle(
            (x - arrow_clear_width // 2, clear_top, min(x + arrow_clear_width // 2, clear_clip_right), clear_bottom),
            radius=8,
            fill=PANEL_FILL
        )

    for x_ratio, clear_width_ratio in zip(framework["amountPositions"], framework["clearBoxWidths"]):
        x = panel[0] + round(panel_width * x_ratio)
        clear_width = round(panel_width * clear_width_ratio)
        draw.rounded_rectangle(
            (x - clear_width // 2, clear_top, min(x + clear_width // 2, clear_clip_right), clear_bottom),
            radius=8,
            fill=PANEL_FILL
        )

    for x_ratio in framework["arrowPositions"]:
        draw_arrow(draw, (panel[0] + round(panel_width * x_ratio), arrow_y), arrow_size)

    for amount, label_text, x_ratio in zip(case["amounts"], labels, framework["amountPositions"]):
        x = panel[0] + round(panel_width * x_ratio)
        draw.text((x, amount_y), amount, font=amount_font, fill=GOLD, anchor="mm")
        draw.text((x, label_y), label_text, font=label_font, fill=TEXT_DARK, anchor="mm")

    image.convert("RGB").save(output, optimize=True)
    print(f"{output.relative_to(ROOT)} {width}x{height}")


def main() -> None:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    labels = config["labels"]
    framework = config["framework"]
    if not framework.get("preserveOriginalFrame"):
        raise ValueError("framework.preserveOriginalFrame must be true to avoid double-drawn revenue frames")

    for case in config["cases"].values():
        render_case(case, labels, framework)


if __name__ == "__main__":
    main()
