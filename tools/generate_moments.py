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


def cards_html():
    out = []
    for slot, (slug, label) in enumerate(CARDS):
        hidden = "" if slot == 0 else ' aria-hidden="true" inert'
        out.append(
            f"""<div id="card-{slug}" class="stack-card" data-card="{slug}" data-label="{html.escape(label)}" data-slot="{slot}"{hidden}>
  <div class="stack-card__backplate"></div>
  <span class="stack-card__layer stack-card__layer--overhang-start"></span>
  <span class="stack-card__layer stack-card__layer--figure"></span>
  <span class="stack-card__layer stack-card__layer--overhang-end"></span>
  <div class="stack-card__text">
    <p class="visually-hidden">{html.escape(label)} scene (placeholder)</p>
    <span class="ph-stack" aria-hidden="true">
      <span class="ph ph--bar ph--w-30"></span>
      <span class="ph ph--bar ph--w-90"></span>
    </span>
  </div>
</div>"""
        )
    return indent("\n".join(out), 18)


def lever_cards_html(levers, selected):
    out = []
    for lever in levers:
        sel = " data-selected" if lever["slug"] == selected else ""
        out.append(
            f"""<div id="lever-{lever["slug"]}" class="lever-card" data-lever-card="{lever["slug"]}"{sel}>
  <p class="visually-hidden">{html.escape(lever["label"])} (placeholder)</p>
  <span class="ph ph--bar ph--w-60" aria-hidden="true"></span>
  <span class="ph-stack" aria-hidden="true">
    <span class="ph ph--bar ph--w-100"></span>
    <span class="ph ph--bar ph--w-75"></span>
  </span>
  <span class="ph ph--pill ph--w-40" aria-hidden="true"></span>
</div>"""
        )
    return indent("\n".join(out), 14)


def detail_panels_html(levers, selected):
    out = []
    for lever in levers:
        hidden = "" if lever["slug"] == selected else " hidden"
        out.append(
            f"""<div id="detail-{lever["slug"]}" class="lever-detail-panel" data-lever-detail="{lever["slug"]}"{hidden}>
  <div class="lever-detail__graphic" aria-hidden="true"></div>
  <div class="lever-detail__text">
    <h3 class="visually-hidden">{html.escape(lever["label"])} (placeholder)</h3>
    <span class="ph ph--bar-lg ph--w-75" aria-hidden="true"></span>
    <span class="ph-stack" aria-hidden="true">
      <span class="ph ph--bar ph--w-100"></span>
      <span class="ph ph--bar ph--w-100"></span>
      <span class="ph ph--bar ph--w-90"></span>
      <span class="ph ph--bar ph--w-60"></span>
    </span>
    <span class="lever-detail__chips" aria-hidden="true">
      <span class="ph ph--pill"></span>
      <span class="ph ph--pill"></span>
      <span class="ph ph--pill"></span>
    </span>
  </div>
</div>"""
        )
    return indent("\n".join(out), 10)


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
            .replace("{{CARDS}}", cards_html())
            .replace("{{LEVER_CARDS}}", lever_cards_html(site["levers"], selected))
            .replace("{{DETAIL_PANELS}}", detail_panels_html(site["levers"], selected))
            .replace("{{BUILD_DATE}}", build_date)
        )
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        print(f"wrote {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
