#!/usr/bin/env python3
"""Write the token-coloured placeholder silhouettes listed in docs/ILLUSTRATION_SPECS.md.

Dev-time only; the output in assets/img/moment-1/ is committed. Each file has the exact 1x
canvas of its slot, a transparent background and flat shapes in the card's accent ramp, so the
final art drops in under the same name. Run from the repo root:  python3 tools/placeholder_art.py

Colours are the Rare Core primitives (css/rare-core.css), named beside each value. An <img>
cannot read CSS custom properties, so the hex values are repeated here, in art files only.
"""
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "img" / "moment-1"

CORE = {  # copied from css/rare-core.css
    "lime-500": "#7ab800", "lime-700": "#4a6b00",
    "cyan-500": "#00afd8", "cyan-700": "#08627a",
    "orange-500": "#f58233", "orange-700": "#a34d17",
    "green-500": "#008542", "gray-700": "#5e6a71", "gray-200": "#dde3e8", "blue-500": "#005bbb",
}

CARDS = {
    "human-nature": ("lime-500", "lime-700", "green-500"),
    "community": ("cyan-500", "cyan-700", "cyan-500"),
    "policy": ("orange-500", "orange-700", "orange-500"),
}


def svg(name, w, h, body, note):
    text = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">\n'
        f"<!-- PLACEHOLDER {name}: {note}. Replace with the final art at the same canvas. -->\n"
        f"{body}\n</svg>\n"
    )
    (OUT / name).write_text(text, encoding="utf-8")


def c(token):
    return CORE[token]


# Overhang-end props per card. Human & Nature: cacao pods and a leaf. Community: a seedling in a
# pot with foliage. Policy: a clipboard report. Shapes only; the people hold the phones.
OVERHANG_END = {
    "human-nature": lambda base, ink, extra: f"""<!-- cacao pods {base} / {ink}, leaf {extra} -->
<path d="M96 8 Q104 40 88 64" fill="none" stroke="{c(ink)}" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="128" cy="44" rx="40" ry="18" transform="rotate(-30 128 44)" fill="{c(extra)}"/>
<ellipse cx="72" cy="104" rx="28" ry="48" transform="rotate(-14 72 104)" fill="{c(base)}"/>
<ellipse cx="124" cy="112" rx="24" ry="42" transform="rotate(16 124 112)" fill="{c(ink)}"/>""",
    "community": lambda base, ink, extra: f"""<!-- seedling in a pot {ink} / {base}, foliage {base} -->
<ellipse cx="136" cy="72" rx="36" ry="16" transform="rotate(-24 136 72)" fill="{c(base)}"/>
<ellipse cx="40" cy="88" rx="32" ry="14" transform="rotate(20 40 88)" fill="{c(base)}" fill-opacity="0.7"/>
<path d="M88 112 V56" stroke="{c(ink)}" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="68" cy="56" rx="22" ry="11" transform="rotate(24 68 56)" fill="{c(base)}"/>
<ellipse cx="108" cy="44" rx="24" ry="11" transform="rotate(-28 108 44)" fill="{c(base)}"/>
<path d="M52 108 H124 L112 160 H64 Z" fill="{c(ink)}"/>""",
    "policy": lambda base, ink, extra: f"""<!-- report {ink} / {base} -->
<rect x="24" y="16" width="96" height="136" rx="10" fill="{c(ink)}"/>
<rect x="36" y="36" width="72" height="104" rx="4" fill="{c(base)}"/>
<rect x="48" y="96" width="12" height="32" fill="{c(ink)}"/>
<rect x="68" y="76" width="12" height="52" fill="{c(ink)}"/>
<rect x="88" y="56" width="12" height="72" fill="{c(ink)}"/>
<circle cx="144" cy="128" r="24" fill="{c(base)}"/>""",
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for card, (base, ink, extra) in CARDS.items():
        # Background scene: fills the backplate (512 x 384), ground and horizon only.
        svg(f"card-{card}-bg.svg", 512, 384, f"""<!-- {base} / {ink} -->
<ellipse cx="400" cy="96" rx="40" ry="40" fill="{c(base)}" fill-opacity="0.35"/>
<path d="M0 260 Q128 200 256 248 T512 232 V384 H0 Z" fill="{c(base)}" fill-opacity="0.3"/>
<path d="M0 312 Q160 272 320 304 T512 300 V384 H0 Z" fill="{c(extra)}" fill-opacity="0.35"/>""",
            "background, no overflow")
        # Figure: 192 x 320, breaks the backplate's top edge by 32px.
        svg(f"card-{card}-figure.svg", 192, 320, f"""<!-- {ink} -->
<circle cx="96" cy="48" r="36" fill="{c(ink)}"/>
<rect x="44" y="92" width="104" height="148" rx="40" fill="{c(ink)}"/>
<rect x="56" y="224" width="32" height="96" rx="12" fill="{c(ink)}"/>
<rect x="104" y="224" width="32" height="96" rx="12" fill="{c(ink)}"/>
<rect x="116" y="132" width="40" height="64" rx="8" fill="{c(base)}"/>""",
            "figure, breaks the top edge")
        # Overhang start: 192 x 160, breaks the left edge by 56px and the top by 40px.
        svg(f"card-{card}-overhang-start.svg", 192, 160, f"""<!-- {base} / {extra} -->
<ellipse cx="72" cy="56" rx="64" ry="28" transform="rotate(-24 72 56)" fill="{c(base)}"/>
<ellipse cx="120" cy="96" rx="64" ry="24" transform="rotate(18 120 96)" fill="{c(extra)}"/>
<ellipse cx="56" cy="116" rx="48" ry="20" transform="rotate(-8 56 116)" fill="{c(ink)}" fill-opacity="0.7"/>""",
            "overhang, breaks the left and top edges")
        # Overhang end: 176 x 160, breaks the right edge by 56px and rests on the scene's bottom
        # line. No phone screens on any card (Stage 2 review): props only.
        svg(f"card-{card}-overhang-end.svg", 176, 160, OVERHANG_END[card](base, ink, extra),
            "overhang, breaks the right edge")

    # Orchestrator: 128 x 208, hands at (64, 108) = 50% / 52% of the canvas.
    svg("orchestrator.svg", 128, 208, f"""<!-- cap blue-500, shirt green-500 (Rare shirt), trousers gray-700 -->
<circle cx="64" cy="34" r="22" fill="{c('gray-700')}"/>
<path d="M40 26 Q64 4 88 26 Z" fill="{c('blue-500')}"/>
<rect x="34" y="60" width="60" height="76" rx="22" fill="{c('green-500')}"/>
<rect x="38" y="128" width="22" height="80" rx="8" fill="{c('gray-700')}"/>
<rect x="68" y="128" width="22" height="80" rx="8" fill="{c('gray-700')}"/>""",
        "orchestrator body; the pipe passes in front of it")
    svg("orchestrator-hands.svg", 128, 208, f"""<!-- hands over the pipe, gray-700 -->
<path d="M28 76 Q22 104 50 108" fill="none" stroke="{c('gray-700')}" stroke-width="10" stroke-linecap="round"/>
<path d="M100 76 Q106 104 78 108" fill="none" stroke="{c('gray-700')}" stroke-width="10" stroke-linecap="round"/>
<circle cx="54" cy="108" r="9" fill="{c('gray-700')}"/>
<circle cx="74" cy="108" r="9" fill="{c('gray-700')}"/>""",
        "orchestrator hands, layered above the pipe")
    print(f"wrote {len(list(OUT.glob('*.svg')))} files to {OUT}")


if __name__ == "__main__":
    main()
