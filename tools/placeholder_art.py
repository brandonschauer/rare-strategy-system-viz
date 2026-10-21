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
# pot with foliage. Policy: a rolled plan and an official seal. Shapes only: nothing shows a
# screen, chart or report to the viewer, and the people hold the phones.
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
    "policy": lambda base, ink, extra: f"""<!-- rolled plan {base} / {ink}, official seal {ink} -->
<rect x="16" y="112" width="120" height="36" rx="18" transform="rotate(-12 76 130)" fill="{c(base)}"/>
<ellipse cx="22" cy="142" rx="10" ry="18" transform="rotate(-12 22 142)" fill="{c(ink)}"/>
<rect x="56" y="76" width="96" height="28" rx="14" transform="rotate(8 104 90)" fill="{c(base)}" fill-opacity="0.8"/>
<circle cx="140" cy="132" r="26" fill="{c(ink)}"/>
<circle cx="140" cy="132" r="16" fill="none" stroke="{c(base)}" stroke-width="4"/>""",
}


def person(cx, top, scale, fill, accent=None):
    """A standing silhouette: head, body, legs, and optionally a phone held toward the person."""
    s = scale
    head = f'<circle cx="{cx}" cy="{top + 36 * s:.0f}" r="{30 * s:.0f}" fill="{fill}"/>'
    body = f'<rect x="{cx - 44 * s:.0f}" y="{top + 72 * s:.0f}" width="{88 * s:.0f}" height="{128 * s:.0f}" rx="{34 * s:.0f}" fill="{fill}"/>'
    legs = (
        f'<rect x="{cx - 34 * s:.0f}" y="{top + 186 * s:.0f}" width="{26 * s:.0f}" height="{84 * s:.0f}" rx="{10 * s:.0f}" fill="{fill}"/>'
        f'<rect x="{cx + 8 * s:.0f}" y="{top + 186 * s:.0f}" width="{26 * s:.0f}" height="{84 * s:.0f}" rx="{10 * s:.0f}" fill="{fill}"/>'
    )
    # The phone's back only: its screen faces the person (no screens toward the viewer).
    phone = (
        f'<rect x="{cx + 28 * s:.0f}" y="{top + 104 * s:.0f}" width="{30 * s:.0f}" height="{50 * s:.0f}" rx="{6 * s:.0f}" fill="{accent}"/>'
        if accent
        else ""
    )
    return head + body + legs + phone


# Figure layers per card. Human & Nature: one farmer with a phone. Community: three people
# overlapping, the adults with phones. Policy: two people, one holding a rolled plan.
FIGURE = {
    "human-nature": lambda base, ink, extra: f"""<!-- one farmer {ink}, phone back {base} -->
<circle cx="96" cy="48" r="36" fill="{c(ink)}"/>
<rect x="44" y="92" width="104" height="148" rx="40" fill="{c(ink)}"/>
<rect x="56" y="224" width="32" height="96" rx="12" fill="{c(ink)}"/>
<rect x="104" y="224" width="32" height="96" rx="12" fill="{c(ink)}"/>
<rect x="116" y="132" width="40" height="64" rx="8" fill="{c(base)}"/>""",
    "community": lambda base, ink, extra: f"""<!-- three people overlapping: {base} behind, {ink} in front -->
{person(146, 40, 1.0, c(base))}
{person(48, 26, 1.05, c(ink), c(base))}
{person(104, 0, 1.15, c(ink), c(base))}""",
    "policy": lambda base, ink, extra: f"""<!-- two people {base} / {ink}, rolled plan {base} -->
{person(132, 14, 1.1, c(base))}
{person(64, 0, 1.15, c(ink))}
<rect x="76" y="140" width="96" height="22" rx="11" transform="rotate(-18 124 151)" fill="{c(base)}"/>""",
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
        svg(f"card-{card}-figure.svg", 192, 320, FIGURE[card](base, ink, extra), "figure, breaks the top edge")
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
