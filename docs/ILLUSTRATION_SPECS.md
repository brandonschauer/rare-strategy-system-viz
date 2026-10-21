# Illustration specs: 1 Millionth Smallholder Farmer

Every art asset the `1-millionth-farmer` page needs (REQUIREMENTS §4.3, §4.4, §7). Each slot already holds a token-coloured placeholder at exactly the size below, so a final file drops in under the same name with no layout change.

- **Placeholders:** `assets/img/moment-1/*.svg`, written by `tools/placeholder_art.py`.
- **Finals:** optimised exports go in `assets/img/moment-1/` under the same basenames. Originals stay in `assets/src/moment-1/` (not committed if the licence restricts redistribution). Log every final in [`assets/CREDITS.md`](../assets/CREDITS.md).
- **Format:** SVG preferred for figures and props (flat, small, sharp). If a layer has to be raster (an AI re-render of a photo, a painterly texture), export it as **WebP with alpha** at the 2× size, keep the basename, and say so in Stage 3. The page then changes only that `src` extension.
- **Transparency:** every layer has a **transparent background**. The backplate tint shows through. Nothing is drawn outside the shapes themselves: no white boxes, no drop shadows (the page adds elevation).
- **Panel 3 graphics** are not listed. They are inline SVG drawn in Stage 3 from token colours (§7), with labels in HTML captions.

## How a card is built

The art lives in a **640 × 480 art frame** at 1×, pinned to the top of each card. Every number below is in that frame's pixels. The page scales the whole frame, so the art keeps these proportions at any width (the front card renders at up to about 615px wide on desktop and about 300px on a 360px phone).

```
 art frame 640 × 480 (transparent; nothing may cross it)
 ┌────────────────────────────────────────────────────────┐
 │  64px                                            64px  │ 48px
 │    ┌──────────── scene 512 × 384 ────────────────────┐ │
 │    │ at (64, 48): top of the backplate, radius 24,    │ │
 │    │ the card's 100 tint                              │ │
 │    ├──────────────────────────────────────────────────┤ │ ← y 432, the scene's bottom line
 └────┤ caption band (HTML label + 10–25 word caption)   ├─┘
      │ grows with its text; no art here                 │
      └──────────────────────────────────────────────────┘
```

- The **backplate** is the scene plus a **caption band** below it (REQUIREMENTS §4.3, Stage 2 review). The band holds the card label and a 10–25 word caption as real HTML text, and grows with the text, so the backplate is taller than the scene. **No art goes in the caption band**, and no text goes over the art, so captions never cover faces.
- The **inset band** around the scene (64px left and right, 48px on top) is the only room a layer has to break the edge. A layer may overhang into it but **never past the art frame**, and never below the scene's bottom line at y 432.
- **Layer order**, back to front: background → figure → overhang start → overhang end.
- **No lever markers on the cards** (no badges or pills; REQUIREMENTS §4.4), so the scene has no corner to keep clear.
- **No phone screens.** People hold their phones, but the screens face them, not the viewer, and no layer shows a screen (Stage 2 review).
- **Card labels are authored per moment** (REQUIREMENTS §4.3, Stage 2 review). The label in the caption band ("Human & Nature", "Community", "Policy" on this page) is the moment's own text and may differ on other moments. The art never depends on it: no label text, initials or role names in any layer. The three card *roles* (Human & Nature, Community, Policy) are what set each card's subject and colour ramp below.
- **Nothing presented to the viewer.** No layer shows a phone screen, chart, report or data display facing the viewer (Stage 2 review). Plans and maps may appear as objects people are working from.
- **Back cards** show only a strip: Community peeks out on the **left**, Policy **above and to the right**. The overhang-start and figure layers are what read on those strips, so give them strong silhouettes.

## Accent ramps (§6.4, §7)

Flat colour from the card's own family only, plus skin and hair tones as needed. Values are the Rare Core primitives in `css/rare-core.css`.

| Card | Backplate (fixed) | Main fills | Ink and line | Extra |
| --- | --- | --- | --- | --- |
| Human & Nature | `lime-100` | `lime-500` | `lime-700` | `green-500` foliage |
| Community | `cyan-100` | `cyan-500` | `cyan-700` | — |
| Policy | `orange-100` | `orange-500` | `orange-700` | — |
| Orchestrator | (sits on the canvas) | `green-500` Rare shirt | `gray-700` | `blue-500` cap |

**Shared style for every asset:** flat, warm, human, in the Change Agent illustration language. Limited palette from the ramp above, a consistent line weight (or none), no gradients, no text, no logos. People from the tropical regions where Rare works, shown with dignity and agency, as protagonists. Not tied to one country (Q8). Stock and AI re-rendered art is normalised to this look before export.

---

## Card 1: Human & Nature (`card-human-nature`)

Depicts a smallholder farmer using a smartphone in their cacao field. Cacao pods and shade-tree leaves break the frame; the phone stays in the farmer's hands with its screen turned toward them.

### `card-human-nature-bg.svg`

| | |
| --- | --- |
| Layer role | Background scene, clipped to the backplate's rounded corners |
| Overflows | None. Fills the backplate exactly. |
| Placement | (64, 48) in the frame |
| 1× / 2× | **512 × 384** / **1024 × 768** |
| Background | Transparent (the `lime-100` backplate shows through any gaps) |
| Accent ramp | `lime-500`, `green-500`, a little `lime-700` |
| Alt text | none (decorative, `alt=""`) |

> **Brief:** Flat illustrated background of a shaded cacao agroforestry plot in a tropical region: rolling ground in soft lime and green bands, a few slim shade-tree trunks and a soft canopy line near the top, distant hills. Calm, low detail, no people, no text. Transparent PNG/SVG, 1024 × 768.

### `card-human-nature-figure.svg`

| | |
| --- | --- |
| Layer role | Main figure: the farmer |
| Overflows | **Top edge by 32px** (head and hat rise above the backplate). No other edge. |
| Placement | (320, 16) in the frame |
| 1× / 2× | **192 × 320** / **384 × 640** |
| Background | Transparent |
| Accent ramp | `lime-700` clothing, `lime-500` accents, natural skin tones |
| Alt text | "A smallholder cacao farmer in their field reads tailored advice on a smartphone." |

> **Brief:** Full-length flat illustration of a smallholder cacao farmer (any gender, from a tropical cacao-growing region) standing in their field, looking at a smartphone held at chest height, confident and engaged. The screen faces the farmer; we see only the back or edge of the phone. Work clothes and a sun hat in lime-700 and lime-500. Facing slightly left, toward the centre of the card. The head and hat sit in the top 64px of the canvas so they rise above the card edge. No text, no logos. Transparent, 384 × 640.

### `card-human-nature-overhang-start.svg`

| | |
| --- | --- |
| Layer role | Foreground foliage that breaks the top-left corner |
| Overflows | **Left edge by 56px**, **top edge by 40px** |
| Placement | (8, 8) in the frame |
| 1× / 2× | **192 × 160** / **384 × 320** |
| Background | Transparent |
| Accent ramp | `green-500`, `lime-500`, `lime-700` |
| Alt text | none (decorative) |

> **Brief:** A cluster of large cacao and shade-tree leaves reaching in from the top-left, flat shapes in green-500, lime-500 and lime-700, a few overlapping. Dense toward the top-left corner of the canvas, thinning toward the bottom-right. No text. Transparent, 384 × 320.

### `card-human-nature-overhang-end.svg`

| | |
| --- | --- |
| Layer role | Foreground props that break the right edge: cacao pods on a stem with a leaf |
| Overflows | **Right edge by 56px**. Rests on the scene's bottom line; never into the caption band. |
| Placement | (456, 272) in the frame |
| 1× / 2× | **176 × 160** / **352 × 320** |
| Background | Transparent |
| Accent ramp | `lime-500` and `lime-700` pods, `green-500` leaf |
| Alt text | none (decorative; the caption carries the meaning) |

> **Brief:** Two or three ripe cacao pods hanging from a short woody stem, with one broad cacao leaf, flat lime-500, lime-700 and green-500. Fills the right half of the canvas and is cut flat along the bottom edge (it sits on the scene's bottom line). No phone, no text. Transparent, 352 × 320.

---

## Card 2: Community (`card-community`)

Depicts two or three community members, for example another farmer, an extension agent and a student; anyone holding a smartphone has the screen turned toward themselves.

### `card-community-bg.svg`

| | |
| --- | --- |
| Layer role | Background scene, clipped to the backplate |
| Overflows | None |
| Placement | (64, 48) |
| 1× / 2× | **512 × 384** / **1024 × 768** |
| Background | Transparent (`cyan-100` backplate shows through) |
| Accent ramp | `cyan-500`, a little `cyan-700` |
| Alt text | none (decorative) |

> **Brief:** Flat background of a village meeting spot at the edge of farmland: a simple open-sided shelter or a large tree, ground bands and a low horizon in soft cyan tones. No people, no text. Transparent, 1024 × 768.

### `card-community-figure.svg`

| | |
| --- | --- |
| Layer role | Figure group: **two or three** community members, for example a farmer, a local partner's extension agent and a student |
| Overflows | **Top edge by 32px** |
| Placement | (320, 16) |
| 1× / 2× | **192 × 320** / **384 × 640** |
| Background | Transparent |
| Accent ramp | `cyan-700`, `cyan-500`, natural skin tones |
| Alt text | "A farmer and a local extension agent talk over advice on their phones while a student looks on." |

> **Brief:** Two or three community members standing close together, full length, flat style, for example a farmer and an extension agent (with a partner-organisation lanyard, no logo) each holding a smartphone and talking it over, with the screens turned toward themselves (never toward the viewer), and a student beside them looking on. Mixed ages and genders, from a tropical farming community, relaxed and collegial. Clothing in cyan-700 and cyan-500. The tallest head reaches the top 64px of the canvas. A narrow canvas, so overlap the figures. No text. Transparent, 384 × 640.

### `card-community-overhang-start.svg`

| | |
| --- | --- |
| Layer role | Foreground foliage or bunting breaking the top-left corner |
| Overflows | **Left by 56px**, **top by 40px** |
| Placement | (8, 8) |
| 1× / 2× | **192 × 160** / **384 × 320** |
| Background | Transparent |
| Accent ramp | `cyan-500`, `cyan-700` |
| Alt text | none (decorative) |

> **Brief:** Leaves from an overhanging tree, or a short string of simple pennant bunting, entering from the top-left corner in cyan-500 and cyan-700. Strong silhouette (this is what shows when the card peeks out on the left). No text. Transparent, 384 × 320.

### `card-community-overhang-end.svg`

| | |
| --- | --- |
| Layer role | Foreground prop that breaks the right edge: a seedling in a pot, with foliage |
| Overflows | **Right edge by 56px**. Rests on the scene's bottom line; never into the caption band. |
| Placement | (456, 272) |
| 1× / 2× | **176 × 160** / **352 × 320** |
| Background | Transparent |
| Accent ramp | `cyan-700` pot, `cyan-500` leaves |
| Alt text | none (decorative) |

> **Brief:** A young seedling with a few leaves growing in a simple clay pot, standing on the bottom edge of the canvas, with a sprig of foliage reaching in behind it from the right. Flat cyan-700 pot and cyan-500 leaves. No phone, no screen, no text. Transparent, 352 × 320.

---

## Card 3: Policy (`card-policy`)

Depicts two people, a mayor and a national government representative, with the plans and maps they are working from. Nothing presents a screen, chart or report toward the viewer.

### `card-policy-bg.svg`

| | |
| --- | --- |
| Layer role | Background scene, clipped to the backplate |
| Overflows | None |
| Placement | (64, 48) |
| 1× / 2× | **512 × 384** / **1024 × 768** |
| Background | Transparent (`orange-100` backplate shows through) |
| Accent ramp | `orange-500`, a little `orange-700` |
| Alt text | none (decorative) |

> **Brief:** Flat background of a municipal office or town-hall steps opening onto the landscape: a simple civic facade or table edge, a window with farmland beyond, in soft orange tones. No people, no flags, no text. Transparent, 1024 × 768.

### `card-policy-figure.svg`

| | |
| --- | --- |
| Layer role | Figure pair: **two people**, a mayor and a national government representative, with the plans and maps they are working from |
| Overflows | **Top edge by 32px** |
| Placement | (320, 16) |
| 1× / 2× | **192 × 320** / **384 × 640** |
| Background | Transparent |
| Accent ramp | `orange-700`, `orange-500`, natural skin tones |
| Alt text | "A mayor and a national government representative work from a land-use plan and a map together." |

> **Brief:** Two officials standing full length, flat style: a local mayor (sash optional, no insignia) and a national government representative, working together from a partly unrolled land-use plan and a folded map that they hold between them. No tablet or screen, and the plan's face is toward them, not the viewer. Professional but approachable, from a tropical country, not tied to one nation. Clothing in orange-700 and orange-500. The taller head reaches the top 64px. No text. Transparent, 384 × 640.

### `card-policy-overhang-start.svg`

| | |
| --- | --- |
| Layer role | Foreground prop breaking the top-left corner |
| Overflows | **Left by 56px**, **top by 40px** |
| Placement | (8, 8) |
| 1× / 2× | **192 × 160** / **384 × 320** |
| Background | Transparent |
| Accent ramp | `orange-500`, `orange-700` |
| Alt text | none (decorative) |

> **Brief:** A large unrolled map or zoning plan curling in from the top-left corner, showing plots and a river as simple shapes (**no labels**), flat orange-500 with orange-700 lines. Transparent, 384 × 320.

### `card-policy-overhang-end.svg`

| | |
| --- | --- |
| Layer role | Foreground props breaking the right edge: a rolled plan and an official seal (civic, not data) |
| Overflows | **Right by 56px**. Rests on the scene's bottom line; never into the caption band. |
| Placement | (456, 272) |
| 1× / 2× | **176 × 160** / **352 × 320** |
| Background | Transparent |
| Accent ramp | `orange-700`, `orange-500` |
| Alt text | none (decorative) |

> **Brief:** A rolled-up plan tied with a ribbon, lying at an angle with a second roll behind it, and a round official seal or stamp beside them (a plain emblem shape, **no text, numbers or national insignia**). No clipboard, chart, report or screen. Flat orange-700 and orange-500. Resting on the bottom edge of the canvas. Transparent, 352 × 320.

---

## Orchestrator (`orchestrator`)

The Rare team member who connects the levers to the moment (§4.4). The page draws the pipe (a ribbed Rare Blue tube) between two layers of this figure, so the tube runs in front of the body and **behind the hands**.

The canvas is **128 × 208** at 1× (13 : 8). It renders 128px wide on desktop (in the right gutter, centred on the Panel 1 / Panel 2 boundary) and 80px wide below 1024px (between the panels). The pipe passes through the **grip point at (64, 108)**: 50% across, 52% down. Both files share the canvas exactly, so they register.

### `orchestrator.svg`

| | |
| --- | --- |
| Layer role | Body: everything except the hands |
| Overflows | None (stands alone on the page canvas) |
| 1× / 2× | **128 × 208** / **256 × 416** |
| Background | Transparent |
| Accent ramp | `green-500` patterned Rare shirt, `blue-500` cap, `gray-700` trousers, natural skin tones |
| Alt text | none. The figure is `aria-hidden`; its meaning is in the page's visually hidden caption. |

> **Brief:** Full-length flat illustration of a Rare staff member facing the viewer, standing, both forearms raised in front of the chest as if holding a hose at chest height. A cap in Rare Blue and a short-sleeved patterned shirt in Rare Green (pattern subtle, no logo), grey trousers. Friendly, capable, quietly in charge. **Draw the body without the hands** (they are a separate layer). The point where the hands meet must sit at x 64, y 108 of a 128 × 208 canvas (256 × 416 at 2×). No text. Transparent.

### `orchestrator-hands.svg`

| | |
| --- | --- |
| Layer role | Hands (and the ends of the forearms), layered above the pipe |
| Overflows | None |
| 1× / 2× | **128 × 208** / **256 × 416** (same canvas as the body) |
| Background | Transparent; everything except the hands is empty |
| Accent ramp | Skin tones to match the body, sleeve cuffs in `green-500` |
| Alt text | none (decorative) |

> **Brief:** On the same 128 × 208 canvas as the body, only the two hands and a short length of forearm: both hands closed in a grip around an invisible vertical tube about 8px thick at 1× (the pipe runs straight up and down through the hands on every layout), centred on x 64, y 108. Everything else transparent, so a blue tube drawn underneath looks held. Transparent, 256 × 416 at 2×.

---

## Checklist when the finals arrive (Stage 3)

- [ ] Each file matches its canvas exactly (1× or 2× as above) and has a transparent background.
- [ ] Every overhang stays within its listed edges, nothing reaches past the 640 × 480 art frame, and nothing drops below the scene's bottom line (y 432).
- [ ] No phone screen, chart, report or data display faces the viewer in any layer.
- [ ] No layer contains card label text or depends on it (labels are authored per moment).
- [ ] No text, numbers or logos in any art.
- [ ] Colours stay inside the card's ramp; the orchestrator's grip point is at (64, 108).
- [ ] Each asset is logged in `assets/CREDITS.md` with its source and licence.
- [ ] First-view image weight stays within the WSG budget (§7: images ≤ 230 KB first view).
