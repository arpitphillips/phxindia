#!/usr/bin/env python3
"""Generate deterministic duotone SVG placeholder art for the PHX rebuild.

The studio's real photographs are copyrighted and were not reachable from
the build environment, so gallery tiles ship with quiet, architectural
placeholder compositions. Re-run this script to regenerate them; swap the
<img> sources in site/ to real photography when available (see README).
"""

from __future__ import annotations

import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "site" / "assets" / "img"

# Warm, desaturated pairs that sit well on the site's paper background.
PALETTES = [
    ("#d8d2c8", "#a39b8d"),
    ("#cfc9c2", "#8e867b"),
    ("#e0dad0", "#b0a698"),
    ("#d5cec6", "#97907f"),
    ("#dcd5cb", "#a89f90"),
    ("#d2cbc1", "#8b8273"),
]


def planes(rng: random.Random, w: int, h: int) -> str:
    """A few translucent rectangles + hairlines suggesting walls and light."""
    shapes = []
    for _ in range(rng.randint(3, 5)):
        rw = rng.randint(w // 6, w // 2)
        rh = rng.randint(h // 4, int(h * 0.85))
        x = rng.randint(0, w - rw)
        y = rng.randint(0, h - rh)
        opacity = rng.choice([0.05, 0.08, 0.12])
        tone = rng.choice(["#ffffff", "#1d1b18"])
        shapes.append(
            f'<rect x="{x}" y="{y}" width="{rw}" height="{rh}" '
            f'fill="{tone}" fill-opacity="{opacity}"/>'
        )
    for _ in range(rng.randint(2, 3)):
        x = rng.randint(w // 8, w - w // 8)
        shapes.append(
            f'<line x1="{x}" y1="0" x2="{x}" y2="{h}" '
            f'stroke="#1d1b18" stroke-opacity="0.10" stroke-width="2"/>'
        )
    return "".join(shapes)


def svg(name: str, w: int, h: int, seed: int) -> None:
    rng = random.Random(seed)
    c1, c2 = PALETTES[seed % len(PALETTES)]
    angle = rng.choice([(0, 0, 1, 1), (1, 0, 0, 1), (0, 0, 0, 1), (0, 0, 1, 0)])
    x1, y1, x2, y2 = angle
    body = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'role="img" aria-label="Placeholder artwork">'
        f'<defs><linearGradient id="g" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
        f'<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/>'
        f"</linearGradient></defs>"
        f'<rect width="{w}" height="{h}" fill="url(#g)"/>'
        f"{planes(rng, w, h)}"
        f"</svg>"
    )
    (OUT / name).write_text(body, encoding="utf-8")
    print(f"wrote {OUT / name}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for i in range(1, 13):  # gallery tiles, 4:5
        svg(f"ph-work-{i:02d}.svg", 800, 1000, seed=i)
    for i in range(1, 4):  # film stills, 3:2
        svg(f"ph-film-{i:02d}.svg", 1200, 800, seed=100 + i)
    for i in range(1, 6):  # team portraits, 4:5
        svg(f"ph-portrait-{i:02d}.svg", 800, 1000, seed=200 + i)
    # Favicon: serif P monogram on ink.
    favicon = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<rect width="64" height="64" fill="#141414"/>'
        '<text x="32" y="44" font-family="Georgia, serif" font-size="36" '
        'fill="#fbfaf8" text-anchor="middle">P</text></svg>'
    )
    (OUT / "favicon.svg").write_text(favicon, encoding="utf-8")
    print(f"wrote {OUT / 'favicon.svg'}")


if __name__ == "__main__":
    main()
