# Rare Strategy System Viz — Requirements

**Status:** Draft v0.9 · 2026-10-20 (v0.2: aligned to the Rare Design System; v0.3: moment statement and visualization merged into Panel 1, and panels renumbered 1–3; v0.4: Next-only physical card flip, lever pages planned, Q2/Q4/Q6 resolved; v0.5: all open questions resolved, colour plan drawn from Rare tokens rather than LEGO colours; v0.6: Stage 1 review: rare.org-style non-sticky header with site title, revised description, no scene counter, no "in development" label, stronger selected-lever indicator; v0.7: Levers menu opens an explanatory dialog instead of selecting a lever; v0.8: Stage 2 review: roomier logo tab, menu label matches title, 10–25 word captions, no affinity badge, no pips, no "Shown below", lever stem styled like the pipe, pipe behind text; v0.9: Stage 2 review round 2: "personally tailored", click a peeking card to bring it forward, "Rotate" hover label, per-moment card labels, Community 2–3 people, Policy two people with no viewer-facing data)
**Source context:** [`rare-strategy-2030.md`](../rare-strategy-2030.md) · [Overnote requirement](../../overnote/docs/OVERNOTE_REQUIREMENT.md) · LEGO mockups in [`concepts/`](../concepts/) · Rare Design System (`../rare-design-system-main/`) · Core tokens (`../speak-sustainability/design-tokens/build/rare-core.css`)

---

## 1. Purpose

A series of responsive web pages that explore how Rare's 2030 Strategy comes about in practice. Each page takes one **human milestone moment** and shows the system behind it:

- **Moment:** what happens to real people and nature (Panel 1)
- **Levers:** which of Rare's four levers make it possible, and how much each matters (Panel 2)
- **Lever requirements:** what each lever has to do, and which Rare capabilities it draws on (Panel 3)
- **Orchestration:** a Rare team member connecting the levers to the moment, showing that Rare orchestrates and partners deliver (straddles Panels 1–2)

The story follows the strategy's mental model (§12): local action → community-led systems → scaled solutions → systems change. A visitor should leave understanding that **the moment is community-led, and Rare's levers remove the barriers around it.**

### 1.1 Audience

- **Primary:** Rare leadership, board, and strategy teams, for alignment and stress-testing (strategy §0).
- **Secondary:** partners and funders, if the concept graduates.
- **Reviewers:** internal stakeholders annotating the concept with Overnote.

### 1.2 Scope of this phase

| In scope | Out of scope (later phases) |
| --- | --- |
| One fully built page: **1 Millionth Farmer** | Full content for the other 6 moments |
| Skeleton pages for the 6 other moments | Lever pages (§2.4) |
| Global nav with moment and lever menus | CMS or authoring tooling |
| Overnote with `localStorage` persistence | Supabase-backed shared comments (ships with Overnote; see §9) |
| GitHub Pages deployment | Custom domain, analytics |

---

## 2. Information architecture

### 2.1 Moments

Each moment has its own URL. That is required: Overnote stores annotations per `location.pathname` (see §9).

| # | Menu label | Slug | Build state | Likely primary lever (draft, for later) |
| --- | --- | --- | --- | --- |
| 1 | 1 Millionth Smallholder Farmer | `1-millionth-farmer` | **Full** | Behavioral Science & Technology |
| 2 | Coastal 5,000 Convening | `coastal-5000-convening` | Skeleton | Narrative Shift |
| 3 | Impact Bond III Launch | `impact-bond-iii-launch` | Skeleton | Finance & Markets |
| 4 | Local Training: Partner-Led | `local-training-partner-led` | Skeleton | Behavioral Science & Technology |
| 5 | Policy Win: Press coverage of community | `policy-win-press-coverage` | Skeleton | Policy |
| 6 | Savings Club makes 1,000th Loan | `savings-club-1000th-loan` | Skeleton | Finance & Markets |
| 7 | NGO partner credits Behavioral Design Agent | `ngo-partner-credits-bda` | Skeleton | Behavioral Science & Technology |

Moment 1's menu label matches its title wording, "1 Millionth Smallholder Farmer" (Stage 2 review). Its slug stays `1-millionth-farmer`, because changing a URL would orphan its Overnote annotations and break links.

The "likely primary lever" column is a placeholder for content planning. It is not built in this phase.

### 2.2 Levers

Fixed order, matching strategy §6:

| Order | Lever | Slug | Strategy definition |
| --- | --- | --- | --- |
| 1 | Policy | `policy` | Secure rights and elevate community voice |
| 2 | Behavioral Science & Technology | `behavior-tech` | Drive behavior change and improve delivery systems |
| 3 | Finance & Markets | `finance-markets` | Unlock capital through blended finance and markets |
| 4 | Narrative Shift | `narrative` | Shift norms and values through storytelling |

### 2.3 URL structure (GitHub Pages project site)

```
/rare-strategy-system-viz/                          → redirects to /moments/1-millionth-farmer/
/rare-strategy-system-viz/moments/<slug>/           → one moment page (index.html)
/rare-strategy-system-viz/moments/<slug>/?lever=<lever-slug>
                                                    → same page with that lever selected
```

- Lever state uses a **query parameter**, never a separate path, so a page keeps a single Overnote storage key.
- All moment pages sit at the same depth, so shared assets use relative paths (`../../css/…`, `../../js/…`). These work both locally and under the Pages repo prefix.
- Reserved for a later phase: `/rare-strategy-system-viz/levers/<lever-slug>/` (see §2.4). It sits at the same depth as moment pages, so the same relative paths work.

### 2.4 Future: lever pages (not built in this phase)

Long term, each lever gets its own page that brings together what that lever must achieve across **all** moments:

1. **Overall summary:** what the lever is (strategy §6), what it must achieve across the moments, and the Rare capabilities it draws on most.
2. **Moment by moment:** each of the 7 moments in order, with its significance for that moment (Primary / Strong / Supporting), a short statement of what the moment requires of the lever, and a link to that moment page with `?lever=<slug>`.

Implications for this phase:
- **Levers dropdown:** for now it opens a dialog describing the planned lever page (§4.1). When lever pages exist, it will navigate to `/levers/<slug>/` instead. Keep the menu's item markup as links so the change is just a different `href`.
- **Content readiness:** each moment page already authors a per-lever card description and Panel 3 detail. To make lever pages easy to assemble later without copying text by hand, `site-data.js` records each moment's lever significance, and the per-lever card descriptions are kept short and self-contained enough to be reused on a lever page.

---

## 3. Page anatomy

The layout follows the LEGO mockup: a single vertical column of stacked panels, with the orchestrator figure in the right gutter between Panels 1 and 2.

Panel 1 combines the moment's statement and its visualization. The two do the same job, explaining one moment, so they share one panel. The statement always sits **above** the card stack. The card stack's requirements stay in their own subsection (§4.3) because it is the most complex component.

```
┌──────────────────────────────────────────────┐
│ [Logo] Site title    [Moments ▾] [Levers ▾]  │  on Panel 1 bg; scrolls away
├──────────────────────────────────────────────┤
│ PANEL 1  Moment                              │
│   Moment:                                    │  ┐ statement
│   <Title>                                    │  │ (§4.2)
│   <Description>                              │  ┘
│   ┌community┐┌──front card──┐┌policy┐  [›]   │  ┐ scenes:
│   └─────────┘└──────────────┘└──────┘        │  ┘ card stack (§4.3)
│                                    🧍 Rare ──┐│  orchestrator + pipe
├────────────────────────────────────────────┼─┤
│ PANEL 2  Levers: <phrase>                  │ ││
│   [Policy] [Behav. Sci & Tech] [Fin] [Narr]◄┘ │  horizontal scroll
├──────────────────────▼───────────────────────┤  caret under selected lever
│ PANEL 3  Lever requirements                  │
│   [graphic]   Subtitle / description         │
│               Rare capabilities drawn on     │
├──────────────────────────────────────────────┤
│ FOOTER  Concept note                         │
└──────────────────────────────────────────────┘
```

### 3.1 Stable IDs (required for Overnote sticky notes)

| Element | `id` |
| --- | --- |
| Global nav | `global-nav` |
| Panel 1 (Moment `<section>`) | `moment` |
| Panel 1 statement block (eyebrow, title, description) | `moment-statement` |
| Panel 1 scenes (card stack region) | `moment-visual` |
| Each layered card | `card-human-nature`, `card-community`, `card-policy` |
| Orchestration zone wrapper (Panels 1–2 + pipe) | `orchestration` |
| Orchestrator figure | `orchestrator` |
| Panel 2 | `levers` |
| Each lever card | `lever-policy`, `lever-behavior-tech`, `lever-finance-markets`, `lever-narrative` |
| Panel 3 | `lever-detail` |
| Each lever detail panel | `detail-policy`, `detail-behavior-tech`, `detail-finance-markets`, `detail-narrative` |
| Footer | `site-footer` |

---

## 4. Component requirements

### 4.1 Global nav

- **Layout, modelled on rare.org's header at the top of its page** (changed after the Stage 1 review):
  - **Logo tab.** The stacked full-colour lockup (§6.4) sits in a narrow white tab (`background-default`) attached to the top edge of the page. The tab has square top corners flush with the viewport, rounded bottom corners (`radius-lg`) and a soft shadow, and gives the logo generous negative space, like rare.org (Stage 2 review). Use `space-7` padding on each side and `space-6` top and bottom on desktop, so the logo fills only about 40% of the tab's width (rare.org's tile is 118 × 127px around a 60 × 78px logo). On mobile, use `space-5` and `space-4`. It hangs over the top of Panel 1. It links to the site root, with alt text "Rare".
  - **Site title.** "Moments that deliver Rare's strategy" sits between the logo tab and the menus, in `--rare-font-family-display`, `text-default`, at about `font-size-500`. It's a site title, not the page `<h1>` (the moment title stays the only `<h1>`).
  - **Menus** (Moments, Levers) on the right, as below.
  - **No separate nav bar.** There is no nav background and no bottom rule. The title and menus sit directly on Panel 1's background (`background-subtle`), so the nav reads as the top of Panel 1.
  - **Not sticky.** The whole header scrolls out of view with the page. (rare.org itself switches to a compact sticky header on scroll; this page deliberately doesn't.)
- **Moments dropdown:** lists all 7 moments in §2.1 order and shows the current moment as selected. Choosing one navigates to that moment's URL. Skeleton moments are marked "(in development)" in the menu.
- **Levers dropdown:** lists the 4 levers. It never shows a lever as selected, because it isn't tied to the page's lever selection (that lives in Panel 2).
  - **In this phase**, choosing a lever opens a simple modal dialog over the page. Its heading is the lever's name, and its text reads: *"Selecting a lever would present a page with a summary of the lever capabilities along with a consolidated list of the required capabilities associated with each moment."* An **OK** button closes it, as do Esc and a click on the dimmed backdrop. Focus moves to OK when it opens and returns to the Levers button (or Explore on mobile) when it closes. Choosing a lever changes nothing on the page: not Panel 2, not Panel 3, not `?lever=`.
  - Build it as a native `<dialog>` opened with `showModal()`, so it traps focus and sits in the top layer above the page. Keep it in Overnote's `ignore` list so OK stays clickable in Sticky mode. The dimmed backdrop is the product token `--viz-scrim` (logged in `TOKEN_GAPS.md`).
  - **Later**, choosing a lever navigates to that lever's page (§2.4) and the dialog is removed.
- Both menus are real disclosure menus: a `<button aria-expanded>` that opens a list of links or options. Keyboard: Enter/Space opens; arrow keys move; Esc closes and returns focus. They close on outside click.
- **Mobile:** the logo tab stays (at the 44px logo height). The site title moves below the logo row, or shortens to fit, and the two menus collapse into a single "Explore" button that opens both in a sheet. Nothing is sticky.
- Menu contents come from one shared data module (`js/site-data.js`) so all 7 pages stay in sync.

### 4.2 Panel 1 — Moment: statement

The top of Panel 1, the `#moment-statement` block. It introduces the scenes directly below it, so keep the spacing between statement and stack tight (`space-6` to `space-7`) and don't add a divider.


| Element | Content (1 Millionth Farmer) |
| --- | --- |
| Eyebrow | `Moment:` |
| Title (phrase-based, `<h1>`) | The 1 millionth smallholder farmer is equipped with tailored advice to shift to climate-resilient regenerative practices |
| Description (10–15 words) | A cacao farmer adds personally tailored guidance to their phone. *(10 words; revised in the Stage 1 and Stage 2 reviews)* |

*Note:* the suggested title had two typos, "advise" and "client-resilient". They are corrected above to "advice" and "climate-resilient".

Type: the eyebrow and title use `--rare-font-family-display`. The title is a long phrase, so clamp it between `--rare-font-size-700` and `--rare-font-size-900` rather than using the 64px hero size. It is not uppercase (unlike Change Agent's short hero headline), because 18+ words in caps would hurt readability.

Optional context line, in a muted style: *One in six of the 6 million people Rare aims to see adopt sustainable practices by 2030.* This derives from the 6M community target in strategy §4.2.

### 4.3 Panel 1 — Moment: scenes (layered card stack)

The lower part of Panel 1, the `#moment-visual` region beneath the statement.

**Structure of each card**

1. **Card frame:** a transparent container that sets the card's bounds and holds every content element.
2. **Backplate:** a smaller, opaque, rounded rectangle inset inside the frame (for example, inset 8–12% on each side). It is the visual "card" the eye reads.
3. **Content layers:** illustration cut-outs (people, plants, props) positioned over the backplate. Some layers deliberately **extend past the backplate's edges** but stay inside the frame. This creates the "off the edge" effect, like the leaves and figures that overhang the baseplates in the LEGO mockup.
4. **Label and caption** as real HTML text (not inside an image or SVG) so they can be annotated: a short card label and a caption of **10–25 words** (Stage 2 review). **Labels are content, not fixed names** (Stage 2 review): each moment authors its own label for each card. The three card *roles* (`human-nature`, `community`, `policy`) stay fixed, because they set the ids, the order and the colour tints. The labels below are the drafts for this moment only. The text box must fit 25 words without overflowing or covering faces at every width from 360px up. Test it with a 25-word placeholder.

**The cards (default z-order, front to back)**

| Z | Card | Label | Depicts | Caption (draft) |
| --- | --- | --- | --- | --- |
| 1 (front, centred) | `card-human-nature` | Human & Nature | Smallholder farmer using a smartphone in their cacao field. Cacao pods, shade-tree leaves and a phone screen showing an advice tip break the frame. | Advice about this plot, this season, in the farmer's own language. |
| 2 | `card-community` | Community | **Two or three** community members, for example another farmer, an extension agent and a student. Anyone holding a smartphone has the screen turned toward themselves. | Peers and a local partner's extension agent make the new practice normal and supported. |
| 3 | `card-policy` | Policy | **Two people**: a mayor and a national government representative, with plans and maps they are working from. **No screen, chart or report is presented toward the viewer** (Stage 2 review). | Local and national government back the practice with rights, plans and programs. |

**Offset and layout**

- Back cards are offset so a strip of each is always visible. Following the mockup, the community card peeks out to the **left** and the policy card peeks out **up and to the right**.
- Desktop: the stack is centred in Panel 1 with offsets of about 6–10% of card width. Mobile: offsets shrink to roughly 16–24px so the front card can use most of the width.

**Flip control**

- **A single Next control** (an arrow button, `--rare-size-control-md`) sits beside the stack: on the right on desktop, below on mobile. There is no Previous control.
- **Hover label** (Stage 2 review): on hover and on keyboard focus, the button reveals a short text label, **"Rotate"**, saying what it will do. The label slides or appears beside the button (toward the stack on desktop, above it on mobile) in `text-muted`, using the motion tokens, and hides again on leave or blur. Its accessible name is "Rotate scenes", so the visible word is part of the name (WCAG 2.5.3). On touch-only devices (`hover: none`) the label shows permanently beside the button. There is **no visible position counter** (removed in the Stage 1 review). A visually hidden live region announces the new front card, for example "Scene 2 of 3: Community". The order cycles: after the third card, Next brings the first card back to the front.
- **Inputs that trigger Next:**
  - clicking or tapping the button
  - Enter or Space on the focused button
  - the Right Arrow key while focus is anywhere inside the stack region
  - a horizontal swipe on the front card, in either direction. The card is thrown out the way it was swiped.

- **Clicking a peeking card brings it to the front** (Stage 2 review). Clicking or tapping the visible edge of a back card pulls that card out of the deck and places it on top. The other cards keep their order behind it, so [A, B, C] with C clicked becomes [C, A, B]. Peeking cards show a pointer cursor and a slight lift on hover. This is a pointer shortcut. Keyboard users use Rotate, so back-card content stays `inert` and `aria-hidden`.
- **Bring-to-front physics** follow the same rules as the flip. The clicked card slides out sideways, toward the side it peeks from, until its frame is fully clear of the deck. At that apex its z-order rises to the top; this is the only depth change, and nothing overlaps it. The cards that were in front of it move back one slot each, and it slides into the front slot. No fades, and nothing passes through anything. It uses the same `--viz-motion-*` legs and reduced-motion variant, joins the same one-deep queue, dispatches `viz:statechange` and announces the new front card in the live region.

**Flip animation: real-card physics**

The flip should look like a hand pulling the top card off a physical deck and tucking it under the bottom. **No cross-fades. A card never passes through another card**, and no layer appears to jump depth while cards overlap. Smoothness matters more than speed, so the motion can take as long as it needs.

1. **Pull out (about 450ms).** The front card slides sideways (to the right on desktop, toward the control) until its frame, including any layers that break the backplate edge, is **completely clear of the other cards**. It may travel past the panel and **out of the browser frame**. It tilts slightly (2–4°) and its shadow deepens, as if lifted.
2. **Advance, starting during step 1 and offset by about 100ms.** The remaining cards move up one position each, translating and scaling into the slots ahead of them. Nothing overlaps the departing card, because it is already moving away.
3. **Re-stack at the apex.** Only when the departing card is fully clear does its z-order drop to the back of the deck. This is the single moment depth changes, and nothing is overlapping when it happens.
4. **Tuck in (about 450ms).** The card slides back into the rear slot with its peek offset. Its tilt and shadow settle as it lands.

- Total time is about 900–1100ms, using `--rare-motion-easing-standard` for each leg. Durations are `--viz-motion-*` product tokens (see the token gaps in §6.2).
- **Layers travel together.** Every content layer, including the ones that break the backplate edge, moves and rotates with its card as one unit (a single transform on the card frame).
- **No scrollbars.** Off-screen travel must not create horizontal page scroll. Use `overflow-x: clip` on the page wrapper, not on the stack, so the card can leave the frame. Overnote's UI stays above the moving card.
- **Interruptions.** A trigger during an animation is queued, but only one: the next flip starts when the current one lands. Rapid presses never cause cards to teleport.
- **Implementation.** Use the Web Animations API, or CSS transitions sequenced by JS. Animate `transform` (plus `box-shadow` or `filter: drop-shadow` for the lift) and never `opacity`, so the work stays on the GPU and nothing fades. Dispatch `viz:statechange` when the card lands, and recompute the orchestrator pipe then.
- **Reduced motion.** The physical animation is the default for everyone. For visitors whose system is set to `prefers-reduced-motion: reduce`, the same sequence plays in a shortened form: a short sideways slide that just clears the stack, with no tilt and no off-screen travel, at about 300ms per leg. It still follows the rule that cards never pass through each other, and still uses no cross-fade. This keeps faith with the physics while respecting the visitor's setting, which is an accessibility expectation and WSG 2.10 in the Rare Design System.
- **Accessibility.** The stack is a `region` labelled "Moment scenes". Only the front card's content is exposed to assistive tech; the others have `aria-hidden` and `inert`. The visually hidden live region (`aria-live="polite"`) announces once each card lands. Focus stays on the Next button throughout.

### 4.4 Orchestrator (straddles Panels 1 and 2)

- A **Rare team member** figure stands in the right gutter, overlapping the boundary between Panels 1 and 2. They hold a **pipe or line** connecting the **selected lever card** in Panel 2 to the **card stack** in Panel 1.
- The pipe is an SVG overlay inside `#orchestration`. It is `aria-hidden="true"` and `pointer-events: none`. **Layering** (Stage 2 review): the pipe runs *behind* page content it crosses. Headings, text and placeholder bars (for example the "Levers:" heading) sit on top of it. Only the cards it connects should look physically attached to it. Its path is a smooth cubic Bézier from the top edge of the selected lever card, through the figure's hands, to the stack edge.
- **Recompute the path** on: lever selection, window resize (`ResizeObserver` on `#orchestration`), horizontal scroll of the lever track, and card-stack flips. If the selected card is scrolled out of view, the pipe attaches to the nearest visible edge of the track.
- On lever change, the pipe animates to the new card (stroke-dash draw, about 500ms; instant under reduced motion).
- **No lever-to-card affinity badge** (removed in the Stage 2 review, reversing Q5). Moment cards carry no lever pills or badges; the pipe alone connects the selected lever to the stack.
- **Mobile:** the figure shrinks and sits between Panels 1 and 2. The pipe becomes a short vertical connector from the stack to the lever track.
- The figure has a visually hidden description: "A Rare team member connects the levers to the moment. Rare orchestrates; local partners deliver."
- Stays below Overnote's z-index (see §9).

### 4.5 Panel 2 — Levers

- **Heading:** `Levers:` followed by a short phrase. Draft: **"Levers: What clears the path for a farmer"**
- **Four lever cards** in the fixed order from §2.2. Each card has:
  - A lever title
  - A one-sentence description of how this lever enables *this* moment
  - A **significance indicator** (recommended): a labelled tag such as **Primary**, **Strong** or **Supporting**, with **no pip meter** (removed in the Stage 2 review; the tag alone carries significance). Levers are allowed to differ in importance.
- **Scrolling:** the cards sit in a horizontal track that scrolls left and right when they do not fit (`overflow-x: auto`, `scroll-snap-type: x mandatory`). Edge fades and small scroll buttons appear only when there is overflow. On wide desktops all four may fit with no scroll.
- **Hover and focus:** lift (translateY −2 to −4px), stronger shadow, border or accent tint, and a pointer cursor. A matching visible focus ring for keyboard users.
- **Selected state:** distinct from hover. Use a solid accent border or background and a **caret** under the card pointing down into Panel 3. The caret echoes the notch in the LEGO mockup; colours are in §6.4. **The indicator must be strong** (Stage 1 review): it has to read unmistakably as "this card is choosing what Panel 3 shows", not just as a highlighted card. Stage 2 should explore options such as a larger caret, a connecting band from the card into Panel 3's top rule, or repeating the lever's name in Panel 3's heading, and pick the clearest.
  - **As built and revised in the Stage 2 review:** the stem (arrow) that runs down from the selected card into Panel 3 is drawn **in the same style as the orchestrator pipe**: same stroke colour, width and ribbed texture. Rare's connections then read as one visual system. There is **no "Shown below" text** on the card; the arrow already says it.
- **Pattern:** WAI-ARIA **Tabs**. The track is `role="tablist"`, cards are `role="tab"` with `aria-selected` and `aria-controls="detail-<slug>"`, and Panel 3's details are `role="tabpanel"`. Arrow keys move between tabs; Enter/Space selects.
- **Default selection on load:** the lever with the highest significance for the moment. For 1 Millionth Farmer that is **Behavioral Science & Technology**, the second card. If it is not visible in the track, scroll it into view. A valid `?lever=` in the URL overrides the default.

**Lever card content (1 Millionth Farmer)**

| Lever | Significance | Card description |
| --- | --- | --- |
| Policy | Supporting | Secure land rights and public extension programs give farmers a reason to invest for the long term. |
| Behavioral Science & Technology | **Primary** (default) | Behavioral design and a digital advisory tool turn agronomy into advice a farmer acts on. |
| Finance & Markets | Strong | Savings, credit and buyers who pay more cover the cost of switching practices. |
| Narrative Shift | Supporting | Stories from peers make regenerative farming what respected farmers do. |

### 4.6 Panel 3 — Lever requirements for the moment

Panel 3 changes with the lever selected in Panel 2. All four detail panels are rendered in the HTML, and the inactive ones use `hidden`. This keeps all text real, indexable and annotatable.

Each detail panel contains:

1. **Graphic:** illustrates the lever's added value. It is an inline SVG or image with an HTML `<figcaption>`. Any text inside the graphic is repeated in the caption or a visually hidden description.
2. **Subtitle** (`<h3>`)
3. **Description:** 60–90 words on what the lever does to enable the moment
4. **Rare capabilities drawn on** (recommended, because the panel is about *requirements*): 2–3 chips taken from strategy §7

Transition: cross-fade or slide (about 250ms) when the lever changes. On mobile, the graphic stacks above the text.

**Detail content (1 Millionth Farmer), draft**

**Behavioral Science & Technology** *(default)*
- **Graphic:** "From barrier to habit." A four-step path: *Barrier identified → Message designed → Delivered by a local agent → Practice adopted*, with a feedback arrow from the end back to the start labelled *learn & adapt*.
- **Subtitle:** Advice designed for how farmers actually decide
- **Description:** Farmers don't switch practices because of information alone. They weigh risk to this season's harvest, habit, and what their neighbours do. Rare's behavioral design turns those barriers into tailored prompts, which a local partner's extension agent delivers through a mobile advisory tool matched to each plot, crop and season. Monitoring shows which messages lead to real adoption, and the tool improves with every cycle. The tool scales through partners, not through Rare staff.
- **Capabilities:** Technology platforms · Monitoring, evaluation & learning · Communications systems

**Finance & Markets**
- **Graphic:** "Capital that reaches the farm." A flow: *Investors & donors → blended finance → local savings club / credit → farmer*, with a return arrow *regenerative cacao → buyers paying a premium*.
- **Subtitle:** Making the switch affordable
- **Description:** Regenerative practices often cost money and yield in the first seasons. Blended finance takes on early risk so local lenders and savings clubs can offer farmers small, flexible credit. Market links with buyers who value climate-resilient cacao turn better practice into better prices. Together they address the "capital misallocation" problem the strategy names: less than 5% of capital reaches communities.
- **Capabilities:** Financial infrastructure · Legal & governance systems

**Policy**
- **Graphic:** "Rights that make the long term worth it." Nested rings: *National policy ⊃ Municipal plan ⊃ Community governance ⊃ Farm plot*.
- **Subtitle:** Rights that make long-term investment rational
- **Description:** A farmer plants shade trees and rebuilds soil only if they will still farm that land in ten years. Secure tenure, plus municipal and national programs that recognise regenerative practices in extension services and agricultural support, make that investment rational. Community voice in local planning keeps governance inclusive and prevents elite capture.
- **Capabilities:** Legal & governance systems · Monitoring, evaluation & learning

**Narrative Shift**
- **Graphic:** "One story becomes the norm." Concentric ripples: *one farmer → peers → village → region*.
- **Subtitle:** Making the new practice the normal one
- **Description:** People adopt what people like them are already doing. Early adopters' stories, shared over community radio, messaging groups and field days, show regenerative farming as what respected farmers do rather than an outside idea. As the norm shifts, adoption becomes self-sustaining, and the stories feed the wider narrative impressions that move systems resilience.
- **Capabilities:** Communications systems · Fundraising capacity

> Content guardrails: no invented statistics. Figures used must trace to `rare-strategy-2030.md` (6M adopters, <5% capital, 3.9B impressions, etc.). Rare SMEs to validate wording before any external use.

### 4.7 Footer

- **Concept note (draft):** *This page is a concept. It explores how Rare's 2030 Strategy, community-led solutions supported by four levers (Policy, Behavioral Science & Technology, Finance & Markets and Narrative Shift), comes together in a single human moment. People, places, figures and illustrations are illustrative and are not official Rare data or commitments.*
- A reviewer line: *Reviewing? Use the annotation toolbar (bottom right) to highlight text or pin notes.*
- A link to the strategy source document (if appropriate) and the build date.

### 4.8 Skeleton pages (the 6 other moments)

- Use the **same template and IDs** as the full page, so they can be filled in later without structural changes.
- The global nav works fully, and the Moments menu shows the current moment as selected.
- Every panel shows its **components as neutral placeholder shapes** with no specific content: eyebrow bar, title bars, description bar, three offset card frames with backplates, flip control, orchestrator silhouette and pipe, four lever card outlines, the Panel 3 graphic box and text bars, and the footer (the footer keeps its concept note).
- No shimmer animation (it reads as "loading" rather than "not built yet"). Use static muted blocks.
- No "in development" label on the page (removed in the Stage 1 review). The Moments menu already marks skeleton moments "(in development)". Pages still carry `<meta name="robots" content="noindex">`.
- Interactions can be live with placeholder data (the stack flips, levers select) so reviewers can feel the template. This is preferred but optional.

---

## 5. Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| **Mobile** < 640px | Single column. Nav collapses to logo plus an "Explore" sheet. Card stack fills the width with small offsets and the flip control below it. The orchestrator is small, between Panels 1 and 2, with a vertical pipe. The lever track scrolls with snap (about 1.2 cards visible). Panel 3 graphic sits above the text. |
| **Tablet** 640–1023px | Same column, more padding. About 2.5 lever cards visible. Panel 3 can go two columns from 800px. |
| **Desktop** ≥ 1024px | Content max-width `--rare-size-container` (1220px), centred. The flip control sits to the right of the stack. The orchestrator is in the right gutter, straddling Panels 1 and 2. All four lever cards fit if space allows. Panel 3 is two columns (graphic left, text right, as in the mockup). |

- Fluid type and spacing with `clamp()`. Nothing should scroll horizontally except the lever track.
- Test at 360, 390, 768, 1024, 1280 and 1440px widths.

---

## 6. Visual design: Rare Design System alignment

### 6.1 Where the system lives

- **Specs (the "why and what"):** the Rare Design System repo, a copy of which is at `../rare-design-system-main/`, outside this repo. Read the Charter, Layer & Naming Spec, Font System Spec, WSG Starter Set, and the Design Iteration Guardrails. It contains material marked restricted (doc 4a), so **never copy its files into this repo**. Reference them only.
- **Tokens (the "how"):** the published Core build is `../speak-sustainability/design-tokens/build/rare-core.css`: primitives and semantics only, with no product-scope tokens. This project **vendors that file unmodified** as `css/rare-core.css`. To upgrade, replace it from the source; never hand-edit it. Once the standalone `rare-tokens` package exists, take it from there instead.
- **Reference implementations:** the Change Agent landing page (screenshot in `../rare-design-system-main/examples-current-state/`), Speak Sustainability, and rare.org.

### 6.2 Grade and governing rules

- This site is a **Consumer-grade** surface: static, content-led, and judged on payload. It is a *product*, so it consumes Core tokens and **may not invent primitives or brand decisions**.
- **Share tokens, not components.** Components are built here in static HTML/CSS, bound only to `--rare-*` tokens.
- **No hard-coded values that a token covers:** no hex, no off-grid px, no font names outside the token stacks.
- **Product-scope tokens** go in a hand-authored `css/viz-tokens.css` and use a `--viz-*` prefix. Each one references `--rare-*` tokens and carries a `PRODUCT-SCOPE` comment. They are limited to this page's composition values (card offsets, stack frame inset, orchestrator size, the lever card width clamp). Viewport-relative `clamp()` math lives only here, never in a semantic token, as the Core README requires.
- **When a value is genuinely missing from Core, do not invent it.** Use the nearest existing token and log the gap in `docs/TOKEN_GAPS.md`, so the system owner can decide whether to promote it to Core. The one gap known so far (colour needs none; see §6.4):

| Need | Interim binding | Proposed Core token |
| --- | --- | --- |
| Card-stack flip legs (about 450ms each, about 1s in total) and pipe draw (about 500ms), all longer than `motion.duration.base` (200ms) | `--viz-motion-flip-leg` and `--viz-motion-pipe`, written as multiples of `--rare-motion-duration-base` | `motion.duration.slow` (and perhaps `-slower`) |

### 6.3 Tokens to use (from `rare-core.css`)

| Concern | Tokens |
| --- | --- |
| Text | `--rare-color-text-default` (ink `#1a1d1f`), `-text-muted` (gray-700), `-text-on-brand` (white), `-text-feature` (yellow-700) |
| Backgrounds (3-tier depth) | `--rare-color-background-default` (white, raised cards), `-subtle` (gray-50, page canvas), `-muted` (gray-100, alternating bands) |
| Brand surfaces | `--rare-color-surface-brand` (green-500 `#008542`; white text passes AA at 4.7:1 with no margin, so use semibold or larger) |
| Action and focus | `--rare-color-action-primary` (blue-500 `#005bbb`), `-action-primary-hover`, `--rare-color-focus-ring`, `--rare-border-width-focus` (3px), `--rare-border-offset-focus` (2px) |
| Accents (tint / base / AA-safe ink) | cyan, lime, orange, yellow and red in `100 / 500 / 700`. On a tint, use the 700 shade as text. |
| Type families | `--rare-font-family-display` (Barlow Semi Condensed, for headlines and callouts only, never body text) and `--rare-font-family-text` (Source Sans 3) |
| Type scale | `--rare-font-size-200…700, 900, 1000` (14 to 64px). `--rare-font-size-hero` / `-hero-min` are a role pair; the page composes its own `clamp()`. Body copy is size 400 (18px). |
| Weights, line heights | `--rare-font-weight-regular / semibold / bold / extrabold`; `--rare-line-height-tight / normal / relaxed` |
| Space | `--rare-space-0…11` (4px base, up to 72px). Gutter = `space-6`. |
| Radius | `sm 4 / md 8 / lg 12 / card 14 / xl 24 / pill` |
| Size | `--rare-size-container` (1220px), `-container-narrow` (820px), `-control-sm` (28px), `-control-md` (40px: arrows and icon buttons) |
| Elevation | `--rare-elevation-z-base 0 / raised 1 / sticky 2 / overlay 20 / modal 30`. All far below Overnote's ~2147483000. |
| Motion | `--rare-motion-duration-fast` (150ms, hover), `-base` (200ms), `--rare-motion-easing-standard` |

### 6.4 Applying it to this page

- **Fonts:** Google Fonts. Load only Source Sans 3 (400/600/700) and Barlow Semi Condensed (600/700/800), with `display=swap`, the latin subset and `preconnect`. Font budget is ≤ 100 KB. Licensed Univers and PF Square Sans swap in later through the token stack only; that is already designed for.
- **Brand name:** always "Rare" (uppercase R, rest lowercase), never "RARE".
- **Logo:** the official assets from the brand-guide DAM are in `assets/logo/`. They are the **stacked lockup** (four icons above the "rare" wordmark, with ™), in three colourways, each as a digital PNG and a print EPS:

  | Supplied file | Colourway | Use on this site |
  | --- | --- | --- |
  | `4729_…_RGB_Digital_Use.png` (671×900) | Full colour | Nav and any light surface (`background-default` / `-subtle` / `-muted`) |
  | `4730_…_White_Digital_Use.png` (671×900) | White | Not needed in the current colour plan (no dark surfaces). Export it only if a dark or brand surface is added later. |
  | `4732_…_Black_Digital_Use.png` (3000×2250, heavily padded) | Black | Not used. Kept for single-colour contexts. |
  | `*_Print_Use.eps` | All three | **Not for web.** Never served or committed. |

  - **Web exports (Stage 1):** the filenames contain spaces and the source PNGs are much larger than the display size. Export web-safe copies with macOS's built-in `sips`: `assets/logo/rare-logo-rgb.png` and `rare-logo-white.png` at 1× and 2× of the display height. Serve them with `srcset` and explicit `width`/`height` (to avoid layout shift). Each should be ≤ 10 KB. Move the supplied originals to `assets/src/logo/`, and list `*.eps` and `assets/src/logo/` in `.gitignore`.
  - **Size in the nav:** a stacked lockup is tall and narrow, so give it `--viz-nav-logo-height` of **56px on desktop and 44px on mobile**. That keeps the wordmark legible at about 12px. The nav bar grows to fit, with `space-2` vertical padding. Never crop, separate, recolour or redraw the lockup to make it fit; that would break the brand rules. **There is no acceptable horizontal lockup.** Don't use one, and don't create one by placing the icons beside the wordmark.
  - **SVG later:** if Rare supplies an SVG, or a designer converts the EPS, drop it in as `rare-logo-rgb.svg` and switch the `<img src>`. No other changes are needed.
  - The lockup's wordmark is lowercase by design. In running text, the name is still written "Rare".
- **Eyebrows** (for example "Moment:" and "Levers:"): follow the Change Agent pattern of a small display-face label in an AA-safe accent ink, such as `cyan-700` or `text-feature`, above a display headline.
- **Colour plan.** The LEGO mockup's colours are **not** a spec; they reflect the bricks that were available. Colour comes only from the Rare Design System, chosen for a calm, accessible look that serves the story. The palette carries meaning:
  - **Neutrals are the structure:** canvas, bands and cards.
  - **Soft accent tints are the moment's world:** the people and nature in each scene.
  - **Rare Blue is Rare's own hand:** selection, the Next control and the orchestrator's pipe. Wherever Rare is orchestrating, the colour is blue.

| Element | Background | Text and details | Contrast (checked) |
| --- | --- | --- | --- |
| Page canvas | `background-subtle` | `text-default` | — |
| Global nav | Logo tab: `background-default` with a soft shadow. Title and menus: no background of their own, sitting on Panel 1's `background-subtle` | Site title in `text-default`; menu buttons in `action-primary` | ink on gray-50 ≫ AA; blue-500 on gray-50 ≈ 6.0 |
| **Panel 1: Moment** | `background-subtle` (the canvas, so the coloured cards carry the panel) | "Moment:" eyebrow in `lime-700`; title in `text-default`; description and context line in `text-muted` | lime-700 on gray-50 5.71; gray-700 on gray-50 5.13 |
| Card backplates | Each card keeps its own tint, whatever its position in the stack: **Human & Nature `lime-100`**, **Community `cyan-100`**, **Policy `orange-100`**. Radius `xl`. The front card is distinguished by elevation (a stronger shadow), not colour. | Label and caption in the matching ink: `lime-700`, `cyan-700`, `orange-700`. The art uses the same ramp (§7). | 5.61, 6.13, 5.19 |
| Next button | `action-primary` button (hover `action-primary-hover`) | White arrow | white on blue-500 6.53 |
| **Panel 2: Levers** | `background-muted` band, which separates it from Panel 1 | "Levers:" eyebrow in `cyan-700` (on white chip) or `text-default`; heading in `text-default` | ink on gray-100 14.4 |
| Lever card: resting | `background-default`, `border-default` and a soft shadow (the light border alone isn't enough to outline the card, at 1.29:1) | Title in `text-default`; description in `text-muted` | gray-700 on white 5.56 |
| Lever card: hover | Lifts, with the border changing to `border-strong` | — | border 5.56 vs white |
| Lever card: selected | `blue-50` fill with a 2px `action-primary` border, and a caret in `action-primary` pointing into Panel 3 | Title in `text-default` | ink on blue-50 14.8; border 6.53 |
| Significance tag | **Primary:** `yellow-100` with `text-feature` (yellow-700 ink), matching Change Agent's featured card. **Strong / Supporting:** `background-muted` with `text-muted`. | — | 5.62; 4.73 |
| **Panel 3: Lever requirements** | `background-default`, with a 4px `action-primary` top rule that meets the caret, so the panel reads as connected to the selected lever | Subtitle in `text-default`; body in `text-default`; capability chips in `blue-50` / `action-primary` | 14.8; 5.71 |
| Panel 3 graphics | Inline SVG on white | Flows and arrows in `action-primary`; nodes in the lime, cyan and orange tints with their 700 ink for labels; the related card's tint as the highlight | per pair above |
| Orchestrator pipe | — | `action-primary`, with a ribbed or dashed texture | 6.53 vs white |
| Footer | `background-muted` | `text-muted`; links in `action-primary` | 4.73; 5.55 |

  - **Green** (`surface-brand`, green-500) is kept for small, bold brand moments, such as the orchestrator figure's Rare shirt in the art. Don't use it for small text on the canvas, where it falls just under AA (4.37:1).
  - The supplied **white logo** is not needed in this plan, because no dark surface is used.

- **Reusable patterns from Change Agent:**
  - The hero, where an illustrated figure breaks out of a rounded `surface-brand` panel, is the model for the card stack's off-the-edge effect.
  - The use-case carousel (a horizontal card scroller with an "n of N" counter and 40px arrow buttons) is the model for both the lever track and the stack controls.
  - The featured-card treatment (yellow tint plus yellow-700 ink) is a candidate for the lever "Primary" tag.
- **Colour scheme:** light only. Core defines no dark mode.

---

## 7. Illustration and graphics direction (Stage 3)

- **Layered cut-outs:** every card's art is built from separate transparent layers (background scene, figures, foreground foliage and props) so elements can break the backplate edge and could get subtle parallax later.
- **Style:** match the Change Agent illustration language: flat, warm, human figures in a limited palette tinted from Rare's brand ramps. Each card uses its own accent family, matching its backplate tint in §6.4: lime and green for Human & Nature, cyan for Community, orange for Policy. This keeps the three cards distinct, keeps the brand coherent, and keeps files small. Show people from the regions where Rare works with dignity and agency, as protagonists rather than beneficiaries.
- **Formats:** SVG preferred for figures and props (small, sharp at any size, recolourable with tokens via `currentColor` or CSS variables). AVIF or WebP only for any painterly or photographic layer, with responsive `srcset` and `loading="lazy"` below the fold.
- **Budget (WSG Starter Set, binding for Consumer grade):**

| Asset class | Target (compressed) |
| --- | --- |
| HTML | ≤ 30 KB |
| CSS (including `rare-core.css`) | ≤ 40 KB |
| JavaScript (excluding Overnote) | ≤ 100 KB |
| Web fonts | ≤ 100 KB |
| Images (first view) | ≤ 230 KB |
| **Total first view** | **≤ 500 KB** (hard cap 1 MB) |

  Card art below the fold and the inactive Panel 3 graphics load lazily. Overnote is review tooling, so its weight is reported separately from the budget.
- **Sourcing (decided, Q4):** Brandon generates and specifies the illustrations. The mix is expected to include stock photos and illustrations, plus photos re-rendered through an AI-driven, Rare-branded illustration system. So:
  - **Claude Code does not create final art.** It builds the layer structure and placeholders, and writes the specification each asset must meet.
  - **Illustration spec:** `docs/ILLUSTRATION_SPECS.md` lists every asset the page needs (each card's background, figure and overhang layers, the orchestrator, Panel 3 graphics if they are not inline SVG). For each it gives the filename, layer role, intended overflow edges, pixel dimensions at 1× and 2×, transparent-background requirement, accent ramp, alt text, and a short visual brief drawn from §4.3 and this section. Write it so it can be pasted into the generation system as a prompt brief.
  - **Placeholders:** each layer slot is filled with a flat token-coloured silhouette of the right size and overflow, so final assets drop in by filename with no layout changes.
  - **Provenance and licensing:** `assets/CREDITS.md` records every final asset's source (stock provider and licence, the AI system and its source photo, or original), the creator, and any attribution the licence requires. Stock assets need a licence that covers web use.
  - **Consistency across sources:** stock and AI re-rendered art must be normalised to one look: flat, warm, a limited palette from the card's accent ramp, consistent line weight, and people shown with dignity. Do this before the art is exported.
  - Store originals in `assets/src/` (not committed, if a licence restricts redistribution) and optimised exports in `assets/img/`.
- **Panel 3 graphics:** simple, diagrammatic inline SVG using token colours. Labels go in HTML captions so they can be annotated.
- **Orchestrator:** the Rare team member is styled as staff (the mockup shows a cap and patterned shirt). The pipe is `action-primary` (Rare Blue, the colour of Rare's own hand in §6.4), with a ribbed or dashed stroke as a nod to the LEGO flex tube.

---

## 8. Accessibility (WCAG 2.2 AA)

- Semantic landmarks: `header` / `nav` / `main` / `section` (one per panel, each labelled) / `footer`.
- A single `<h1>`: the moment title, which also labels Panel 1 (`aria-labelledby`). Panel 2 and 3 headings are `<h2>`. Detail subtitles are `<h3>`. The card stack is a labelled region inside Panel 1, not a separate section.
- Colour contrast of at least 4.5:1 for text and 3:1 for UI and focus indicators. On accent tints, use the `*-700` ink. White on `surface-brand` has no margin, so don't use thin or small text there.
- Everything works by keyboard. Focus order follows the visual order. Visible focus everywhere, using `focus-ring` and `border-width-focus` / `border-offset-focus`.
- `prefers-reduced-motion` honoured for the stack, pipe and Panel 3 transitions (WSG 2.10 / 3.9). The stack keeps a shortened physical motion rather than a cross-fade (§4.3).
- Every image has meaningful `alt` text, or empty `alt` when decorative. The pipe SVG is decorative.
- Interactive targets are at least `--rare-size-control-md` (40px).

## 9. Overnote annotation layer

Follow [`OVERNOTE_REQUIREMENT.md`](../../overnote/docs/OVERNOTE_REQUIREMENT.md) in full. Project-specific decisions:

- **Files:** copy `overnote/src/overnote.js` to `js/overnote.js` unmodified. `js/annotate.js` is the only setup module and the only file to change when Supabase storage ships.
- **Loading:** each page loads `<script type="module" src="../../js/annotate.js"></script>` just before `</body>`.
- **Storage key:** `overnote:${location.pathname}`, giving one key per moment page. This is why lever state is a query parameter.
- **`ignore`:** `#global-nav, .stack-controls, .lever-scroll-btn, .review-tools`. These controls must stay clickable in Sticky mode. Lever cards are **not** ignored, so reviewers can annotate them. Reviewers switch to View mode to change levers.
- **Dynamic content:** when a lever or card changes, the page dispatches a `CustomEvent('viz:statechange')`. `annotate.js` listens for it and calls `overnote.refresh()`.
- **Author name:** `annotate.js` asks for a reviewer name once and stores it in `localStorage['rare-viz:reviewer']`. It falls back to "Reviewer".
- **Theming:** in `css/viz-tokens.css`, map `--overnote-font` to `var(--rare-font-family-text)`, `--overnote-accent` to `var(--rare-color-action-primary)`, `--overnote-focus-ring` to `var(--rare-color-focus-ring)`, and the surface, text and border variables to the matching `--rare-color-*` semantics.
- **Stacking:** use only the `--rare-elevation-z-*` tokens (maximum 30). Overnote's UI uses about 2147483000.
- **Content rules:** all reviewable text is real DOM text. Do not put text in canvas or SVG without an HTML equivalent. Do not run timers that rewrite text nodes. Panel 3 text must not be re-rendered from JS after load; toggle `hidden` instead.
- **Review export:** `annotate.js` adds an **Export review** button (`.review-tools`) to the footer. It downloads one `review-YYYY-MM-DD.json` file holding every comment saved in this browser across all of the site's pages: live data for the current page, `localStorage` for the rest, and only `overnote:` keys under this site's root path. The format is `rare-viz-review` v1, documented in `reviews/README.md`. Files go in `reviews/stage-N/`. Each stage prompt reads the previous stage's folder first and reports what happened to each comment. Review files are gitignored, because the repo is public.
- **Supabase (future):** when Overnote's Supabase adapter ships, only `annotate.js` changes. It gets the adapter config (URL, anon key, access mode such as passphrase or signed-in) and a row-level-security policy scoped to this project. No page HTML changes.

---

## 10. Tech stack and hosting

- **Static HTML, CSS and vanilla JavaScript ES modules.** There is no framework and no build step, which matches Overnote, GitHub Pages and the Change Agent site. Tokens arrive as a vendored, pre-built CSS file, so this repo needs no Style Dictionary.
- **Structure**

```
/
├── index.html                       # redirect to featured moment
├── moments/<slug>/index.html        # 7 pages (1 full, 6 skeleton)
├── css/
│   ├── rare-core.css                # vendored Core tokens, unmodified (from speak-sustainability build)
│   ├── viz-tokens.css               # PRODUCT-SCOPE --viz-* tokens + Overnote theme mapping
│   ├── base.css                     # reset, type, layout primitives
│   └── components/                  # nav.css, card-stack.css, levers.css, …
├── js/
│   ├── site-data.js                 # moments + levers lists (menus, slugs)
│   ├── nav.js                       # renders + wires global nav
│   ├── card-stack.js
│   ├── levers.js                    # tabs, URL state, default selection
│   ├── orchestrator.js              # pipe path computation
│   ├── annotate.js                  # Overnote setup (only file Supabase touches)
│   └── overnote.js                  # vendored, unmodified
├── assets/{img,src,logo}/            # logo/ holds web exports only; originals in src/logo/ (gitignored)
├── assets/CREDITS.md                # source, licence and attribution for every final asset
├── docs/                            # this file, prompts, TOKEN_GAPS.md, ILLUSTRATION_SPECS.md
├── .gitignore                       # *.eps, assets/src/logo/, node_modules
└── .nojekyll
```

- **Moment data:** each page's content is authored **in its HTML**, which keeps text stable for Overnote. `site-data.js` holds only the shared menu data and, for each moment, its lever significance ranking (which drives default selection).
- **Local development:** `python3 -m http.server` from the repo root. ES modules do not work from `file://`.
- **Deployment:** GitHub Pages serving the `main` branch root, with a `.nojekyll` file. The project-site prefix is `/rare-strategy-system-viz/`. Relative paths make the prefix irrelevant.
- **Public but not indexed (Q7):** every page, full and skeleton, carries `<meta name="robots" content="noindex">`.
- **Publish only what the site needs.** GitHub Pages serves the whole branch, so don't commit design-system documents (they live in `../rare-design-system-main/`) or print logo files.
- **Green hosting:** GitHub Pages is the design system's provisionally green static host (WSG 4.1). At launch, check the deployed URL with the Green Web Foundation checker.
- **Browser support:** the last 2 versions of evergreen browsers and iOS Safari 16+.

---

## 11. Staged delivery

| Stage | Goal | Done when |
| --- | --- | --- |
| **1. Frame** | Repo scaffold, tokens, global nav, all panels as layout regions, 7 pages (skeleton everywhere), Overnote wired up, GitHub Pages live | All 7 URLs load. The nav switches moments and the Levers menu opens its dialog. Layout is correct at all breakpoints. Overnote checklist §6 passes. |
| **2. Components & interactivity** | Card stack with flip, lever tabs with scroll, hover and selected states, default selection, Panel 3 switching, orchestrator figure placeholder and live pipe, URL state, reduced motion, keyboard and ARIA | All interactions work with placeholder content on every page. Pipe tracks the selected lever through resize and scroll. Accessibility checks pass. |
| **3. Content & art** | 1 Millionth Farmer copy (§4), card illustrations with off-edge layers, Panel 3 graphics, orchestrator art, footer copy | The full page matches this spec. It meets the WSG budget in §7 (≤ 500 KB first view). Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95. SEO is exempt because the page is deliberately `noindex`. Carbon ≤ 0.19 g CO₂e per view. Copy is SME-reviewed. |

---

## 12. Acceptance criteria (full page)

- [ ] Nav: the logo, Moments menu (7 items, current one marked) and Levers menu work by mouse, keyboard and touch.
- [ ] Panel 1 statement shows the eyebrow, an `<h1>` title and a 10–15 word description, above the card stack.
- [ ] Panel 1 scenes: three layered, offset cards in the specified default order. Art breaks the backplate edge. The Rotate button (with its hover/focus label), Enter/Space, Right Arrow and swipe each cycle the cards. Clicking a peeking card brings it to the front with the same no-pass-through physics. The front card visibly leaves the stack before re-stacking behind it, never passing through another card. There is no horizontal page scroll during the flip. No visible counter; a screen reader announces each new scene.
- [ ] Panel 2: four lever cards in fixed order, each with title, description and significance. The track scrolls when it overflows. Hover, focus and selected states are distinct. **Behavioral Science & Technology is preselected on load.**
- [ ] Panel 3 updates when a lever is selected and shows a graphic, subtitle, description and capabilities.
- [ ] Orchestrator: the figure straddles Panels 1 and 2. The pipe connects the selected lever to the stack and re-routes on selection, resize and track scroll.
- [ ] `?lever=<slug>` deep-links to that lever. Invalid values fall back to the default.
- [ ] Footer concept note is present.
- [ ] The 6 skeleton pages render every component as placeholders.
- [ ] Responsive at 360–1440px with no stray horizontal scroll.
- [ ] Overnote acceptance checklist passes on the full page and one skeleton page.
- [ ] Design system: no hard-coded hex, off-grid px or font names outside the token files. `rare-core.css` is byte-identical to its source. Every gap is logged in `TOKEN_GAPS.md`.
- [ ] WSG budget met: ≤ 500 KB first view and Lighthouse ≥ 90 in every category except SEO.
- [ ] No console errors. Served correctly from GitHub Pages.

---

## 13. Open questions

| # | Question | Default if unanswered |
| --- | --- | --- |
| Q1 | ~~Horizontal lockup for the nav?~~ | **Resolved:** there is no acceptable horizontal lockup, so avoid it. Use the stacked lockup at 56px / 44px (§6.4). If Rare later supplies an SVG of the stacked lockup, swap it in. |
| Q2 | ~~What should the Levers dropdown do long-term?~~ | **Resolved:** navigate to lever pages that summarise the lever and list what each moment requires of it (§2.4). For now it opens a dialog describing that page (§4.1). |
| Q3 | ~~Token gaps?~~ | **Resolved:** the colour gaps are gone, because the colour plan (§6.4) uses only existing tokens and doesn't follow the LEGO colours. The one remaining gap, a slower motion duration, stays product-scope (`--viz-motion-*`) and is logged in `TOKEN_GAPS.md` in case Core wants it later. |
| Q4 | ~~Illustration sourcing?~~ | **Resolved:** generated and specified by Brandon, from a mix of stock and AI re-rendered photos in a Rare-branded style. Claude Code writes the specs and placeholders (§7). |
| Q5 | ~~Affinity badge?~~ | **Resolved, then reversed in the Stage 2 review:** no badge. Cards carry no lever markers (§4.4). |
| Q6 | ~~Moment 6 label?~~ | **Resolved:** "Savings Club makes 1,000th Loan" (`savings-club-1000th-loan`). "Land" was a typo. |
| Q7 | ~~Public or private?~~ | **Resolved:** public on GitHub Pages, with `noindex` on every page. |
| Q8 | ~~Farmer's geography?~~ | **Resolved:** an unspecified tropical cacao-growing region. Avoid details that tie it to one country. |
