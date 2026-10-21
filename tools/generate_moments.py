#!/usr/bin/env python3
"""Generate moments/<slug>/index.html from templates/moment.html and js/site-data.js.

Dev-time scaffolding only: the site itself has no build step and the generated HTML is
committed. Run from the repo root:  python3 tools/generate_moments.py

A page whose <html> carries data-authored="true" has been hand-authored (Stage 3) and is
never overwritten.
"""
import datetime
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "templates" / "moment.html"
SITE_DATA = ROOT / "js" / "site-data.js"

# Real Panel 1 statement text (REQUIREMENTS §4.2). Every other moment gets placeholders.
STATEMENTS = {
    "1-millionth-farmer": {
        "eyebrow": "Moment:",
        "title": "The 1 millionth smallholder farmer is equipped with tailored advice to shift to climate-resilient regenerative practices",
        "description": "A cacao farmer adds locally tailored guidance to their phone.",
    },
}

CARDS = [
    ("human-nature", "Human & Nature"),
    ("community", "Community"),
    ("policy", "Policy"),
]

SIGNIFICANCE = ["primary", "strong", "supporting"]

# A 25-word placeholder caption: the longest a card caption may be (REQUIREMENTS §4.3).
CAPTION_PLACEHOLDER = (
    "Placeholder caption of twenty-five words showing how much room this card leaves for a real "
    "sentence about the scene, the people in it, and why."
)

# Moments whose illustration slots are wired to named files (docs/ILLUSTRATION_SPECS.md).
# Until the final art lands, each file is a token-coloured placeholder at the exact size.
# Every other moment shows neutral placeholder shapes in the same slots (§4.8).
ART = {
    "1-millionth-farmer": "../../assets/img/moment-1/",
}

# Card layer slots: (layer, alt-is-meaningful). Geometry lives in css/components/moment.css.
LAYERS = ["figure", "overhang-start", "overhang-end"]
LAYER_SIZE = {"bg": (512, 384), "figure": (192, 320), "overhang-start": (192, 160), "overhang-end": (176, 160)}
ORCHESTRATOR_SIZE = (128, 208)

ALT = {
    "human-nature": "A smallholder farmer in a cacao field holding a smartphone (placeholder art).",
    "community": "A farmer, an extension agent and a student, the adults holding smartphones (placeholder art).",
    "policy": "A mayor and a national government representative with plans and maps (placeholder art).",
}

def load_site():
    source = SITE_DATA.read_text(encoding="utf-8")
    match = re.search(r"/\* JSON:BEGIN \*/(.*?)/\* JSON:END \*/", source, re.S)
    return json.loads(match.group(1))


def default_lever(moment, levers):
    for level in SIGNIFICANCE:
        for lever in levers:
            if moment["significance"].get(lever["slug"]) == level:
                return lever["slug"]
    return levers[0]["slug"]


def indent(block, spaces):
    pad = " " * spaces
    return "\n".join(pad + line if line else line for line in block.strip("\n").split("\n"))


def statement_html(moment):
    content = STATEMENTS.get(moment["slug"])
    if content:
        lines = [
            f'<p class="eyebrow">{html.escape(content["eyebrow"])}</p>',
            f'<h1 id="moment-title" class="moment-title">{html.escape(content["title"])}</h1>',
            f'<p class="moment-description">{html.escape(content["description"])}</p>',
        ]
    else:
        lines = [
            f'<h1 id="moment-title" class="visually-hidden">{html.escape(moment["label"])}</h1>',
            '<span class="ph ph--bar ph--w-20" aria-hidden="true"></span>',
            '<span class="ph-stack" aria-hidden="true">',
            '  <span class="ph ph--bar-lg ph--w-90"></span>',
            '  <span class="ph ph--bar-lg ph--w-60"></span>',
            "</span>",
            '<span class="ph ph--bar ph--w-75" aria-hidden="true"></span>',
        ]
    return indent("\n".join(lines), 14)


def layer_html(art, card, layer, cls):
    width, height = LAYER_SIZE[layer]
    if not art:
        return f'<span class="{cls} stack-card__layer--{layer}" aria-hidden="true"></span>'
    alt = html.escape(ALT[card]) if layer == "figure" else ""
    return (
        f'<img class="{cls} stack-card__layer--{layer}" src="{art}card-{card}-{layer}.svg" '
        f'width="{width}" height="{height}" alt="{alt}" decoding="async">'
    )


def cards_html(moment):
    art = ART.get(moment["slug"])
    out = []
    for slot, (slug, label) in enumerate(CARDS):
        hidden = " data-front" if slot == 0 else ' aria-hidden="true" inert'
        bg = (
            f'\n      <img class="stack-card__bg" src="{art}card-{slug}-bg.svg" width="512" height="384" alt="" decoding="async">\n    '
            if art
            else ""
        )
        layers = "\n".join("    " + layer_html(art, slug, layer, "stack-card__layer") for layer in LAYERS)
        out.append(
            f"""<div id="card-{slug}" class="stack-card stack-card--{slug}" data-card="{slug}" data-label="{html.escape(label)}" data-slot="{slot}"{hidden}>
  <div class="stack-card__backplate">
    <div class="stack-card__scene">{bg}</div>
    <div class="stack-card__text">
      <p class="stack-card__label">{html.escape(label)}</p>
      <p class="stack-card__caption">{html.escape(CAPTION_PLACEHOLDER)}</p>
    </div>
  </div>
  <div class="stack-card__art">
{layers}
  </div>
</div>"""
        )
    return indent("\n".join(out), 18)


def orchestrator_html(moment):
    art = ART.get(moment["slug"])
    w, h = ORCHESTRATOR_SIZE
    if art:
        body = f'<img class="orchestrator__art" src="{art}orchestrator.svg" width="{w}" height="{h}" alt="" decoding="async">'
        hands = f'<img class="orchestrator__hands" src="{art}orchestrator-hands.svg" width="{w}" height="{h}" alt="" decoding="async">'
    else:
        body = """<span class="orchestrator__art orchestrator__silhouette">
  <span class="orchestrator__head"></span>
  <span class="orchestrator__body"></span>
</span>"""
        hands = '<span class="orchestrator__hands orchestrator__hands--ph"></span>'
    return indent(
        f"""<div class="orchestrator__figure" aria-hidden="true">
{indent(body, 2)}
{indent(hands, 2)}
  <span class="orchestrator__grip" data-orchestrator-grip></span>
</div>""",
        12,
    )


def significance_of(moment, lever):
    # Skeleton moments only rank their primary lever so far (site-data.js marks it draft);
    # unranked levers show as Supporting until the content is planned.
    return moment["significance"].get(lever["slug"], "supporting")


def lever_cards_html(moment, levers, selected):
    out = []
    for lever in levers:
        slug = lever["slug"]
        is_sel = slug == selected
        level = significance_of(moment, lever)
        out.append(
            f"""<div id="lever-{slug}" class="lever-card" role="tab" data-lever-card="{slug}" aria-controls="detail-{slug}" aria-selected="{"true" if is_sel else "false"}" tabindex="{"0" if is_sel else "-1"}">
  <p class="lever-card__title">{html.escape(lever["label"])}</p>
  <p class="visually-hidden">Description placeholder.</p>
  <span class="ph-stack" aria-hidden="true">
    <span class="ph ph--bar ph--w-100"></span>
    <span class="ph ph--bar ph--w-75"></span>
  </span>
  <p class="lever-card__meta">
    <span class="sig-tag sig-tag--{level}">{level.capitalize()}</span>
  </p>
</div>"""
        )
    return indent("\n".join(out), 16)


def detail_panels_html(levers, selected):
    out = []
    for lever in levers:
        slug = lever["slug"]
        hidden = "" if slug == selected else " hidden"
        label = html.escape(lever["label"])
        out.append(
            f"""<div id="detail-{slug}" class="lever-detail-panel" role="tabpanel" data-lever-detail="{slug}" aria-labelledby="lever-{slug}" tabindex="0"{hidden}>
  <figure class="lever-detail__graphic">
    <div class="lever-detail__graphic-box" aria-hidden="true">
      <span class="ph lever-detail__node"></span>
      <span class="lever-detail__flow"></span>
      <span class="ph lever-detail__node"></span>
      <span class="lever-detail__flow"></span>
      <span class="ph lever-detail__node"></span>
    </div>
    <figcaption class="lever-detail__caption">Graphic placeholder</figcaption>
  </figure>
  <div class="lever-detail__text">
    <p class="lever-detail__lever">{label}</p>
    <h3 class="lever-detail__subtitle">Subtitle placeholder</h3>
    <p class="visually-hidden">Description placeholder.</p>
    <span class="ph-stack" aria-hidden="true">
      <span class="ph ph--bar ph--w-100"></span>
      <span class="ph ph--bar ph--w-100"></span>
      <span class="ph ph--bar ph--w-90"></span>
      <span class="ph ph--bar ph--w-60"></span>
    </span>
    <p class="lever-detail__chips-label">Rare capabilities drawn on</p>
    <ul class="lever-detail__chips">
      <li class="chip">Capability A</li>
      <li class="chip">Capability B</li>
      <li class="chip">Capability C</li>
    </ul>
  </div>
</div>"""
        )
    return indent("\n".join(out), 12)


def main():
    site = load_site()
    template = TEMPLATE.read_text(encoding="utf-8")
    build_date = datetime.date.today().strftime("%-d %B %Y")
    for moment in site["moments"]:
        target = ROOT / "moments" / moment["slug"] / "index.html"
        if target.exists() and 'data-authored="true"' in target.read_text(encoding="utf-8")[:400]:
            print(f"skip  {target.relative_to(ROOT)} (hand-authored)")
            continue
        selected = default_lever(moment, site["levers"])
        page = (
            template.replace("{{STATE}}", "skeleton")
            .replace("{{LABEL}}", html.escape(moment["label"]))
            .replace("{{SLUG}}", moment["slug"])
            .replace("{{STATEMENT}}", statement_html(moment))
            .replace("{{CARDS}}", cards_html(moment))
            .replace("{{ORCHESTRATOR}}", orchestrator_html(moment))
            .replace("{{LEVER_CARDS}}", lever_cards_html(moment, site["levers"], selected))
            .replace("{{DETAIL_PANELS}}", detail_panels_html(site["levers"], selected))
            .replace("{{BUILD_DATE}}", build_date)
        )
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        print(f"wrote {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
