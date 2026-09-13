#!/usr/bin/env python3
"""Генератор иконок для FPV Detector PWA."""
import os

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Установите Pillow: pip install pillow")
    raise SystemExit(1)


def make_icon(size: int, path: str):
    """Рисует иконку заданного размера и сохраняет в PNG."""
    # Масштаб относительно базового размера 512
    s = size / 512.0
    img = Image.new("RGB", (size, size), "#0a0a0a")
    d = ImageDraw.Draw(img)

    # Градиентный фон
    for y in range(size):
        c = int(15 + (y / size) * 25)
        d.line([(0, y), (size, y)], fill=(c, c, c))

    # Зелёный круг
    pad = int(80 * s)
    d.ellipse([pad, pad, size - pad, size - pad], fill="#00e676")

    # Концентрические дуги (волны сигнала радара)
    cx = size // 2
    for r, w in [(70, 10), (120, 10), (170, 10)]:
        rr = int(r * s)
        ww = max(2, int(w * s))
        d.arc([cx - rr, cx - rr, cx + rr, cx + rr], 220, 320,
              fill="#0a0a0a", width=ww)

    # Центральная точка
    c = int(16 * s)
    d.ellipse([cx - c, cx - c, cx + c, cx + c], fill="#0a0a0a")

    img.save(path, "PNG", optimize=True)
    print(f"✅ {path} ({size}×{size})")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    make_icon(192, os.path.join(here, "icon-192.png"))
    make_icon(512, os.path.join(here, "icon-512.png"))
    print("\nГотово. Иконки созданы рядом со скриптом.")