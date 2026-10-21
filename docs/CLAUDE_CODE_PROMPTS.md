# Claude Code Prompts — Rare Strategy System Viz

Run each stage in its own Claude Code session, from the repo root (`rare-strategy-system-viz/`). Review the result and annotate it with Overnote before starting the next stage. Then click **Export review** in any page's footer and save the file in `reviews/stage-N/` for the stage you reviewed. Each later prompt reads that folder first. See [`reviews/README.md`](../reviews/README.md). Each prompt is self-contained and points at [`REQUIREMENTS.md`](REQUIREMENTS.md), which is the source of truth.

**Before Stage 1**

- ✅ The Rare Design System specs are at `../rare-design-system-main/`, outside this repo. They include restricted material, so they are referenced, never copied in.
- Confirm that `../speak-sustainability/design-tokens/build/rare-core.css` is current. It is the published Core token build this project vendors.
- ✅ The Rare logo assets (stacked lockup, PNG and EPS) are in `assets/logo/`. Use only the stacked lockup; there is no acceptable horizontal one (Q1).
- Answer what you can of the open questions in REQUIREMENTS.md §13, or accept the defaults.
- `git init` this folder and create an empty GitHub repo named `rare-strategy-system-viz`.

---

## Stage 1 — Frame: scaffold, global nav, panels, all 7 pages

```text
You are building Stage 1 of a static, responsive concept site that visualizes how Rare's 2030
Strategy comes about through "human milestone moments." Read these first, in full:

- docs/REQUIREMENTS.md         (source of truth — follow it; §11 defines this stage)
- rare-strategy-2030.md        (strategy context)
- ../overnote/docs/OVERNOTE_REQUIREMENT.md   (annotation layer integration rules)
- concepts/*.jpeg              (LEGO mockup of the page STRUCTURE — look at all three. Its colours
                                 are not a spec; use the colour plan in REQUIREMENTS.md §6.4)
- ../rare-design-system-main/ — the Rare Design System specs. Read README, 1-Charter, 2-Layer-and-Naming,
  3-Font-System, 4-WSG-Starter-Set and change-agent-site-Design-Iteration-Guardrails, and look at
  examples-current-state/*.png. They win over this prompt on any design-system question.
- ../speak-sustainability/design-tokens/README.md and build/rare-core.css — the published Core tokens.

Goal of Stage 1: the frame only — no rich components, no final content, no illustrations.

Do this:
1. FIRST create .gitignore containing *.eps, assets/src/logo/ and node_modules/. Never copy files
   from ../rare-design-system-main/ into this repo; it holds restricted docs. Then create the file structure in REQUIREMENTS.md §10 (static
   HTML/CSS/vanilla ES modules, no framework, no build step, add .nojekyll). Add a root index.html
   that redirects to moments/1-millionth-farmer/.
2. Tokens, per REQUIREMENTS.md §6:
   - Copy ../speak-sustainability/design-tokens/build/rare-core.css to css/rare-core.css byte-for-byte.
     Never edit it.
   - Author css/viz-tokens.css with PRODUCT-SCOPE --viz-* tokens that reference only --rare-*
     tokens, plus the Overnote theme mapping in §9.
   - Create docs/TOKEN_GAPS.md seeded with the gaps table in §6.2.
   - Load Source Sans 3 (400/600/700) and Barlow Semi Condensed (600/700/800) from Google Fonts with
     preconnect, display=swap and the latin subset.
   - Rule for all stages: no hard-coded hex, off-grid px or font names outside the token files. If
     a value is missing, use the nearest token and log the gap; never invent a primitive.
3. Build js/site-data.js with the 7 moments (label, slug, state: full|skeleton, lever
   significance ranking) and 4 levers (label, slug, definition) exactly as in §2.
4. Logo (§6.4): move the supplied files in assets/logo/ to assets/src/logo/. Use macOS `sips` to
   export a web-safe rare-logo-rgb.png at 1x and 2x of the 56px nav display
   height. Each must be ≤ 10 KB, with no change to the artwork.
   Build the global nav (§4.1): the stacked logo at --viz-nav-logo-height (56px, 44px on mobile), Moments menu, Levers menu, accessible
   disclosure menus, sticky on desktop, "Explore" sheet on mobile. Render it from site-data.js
   via js/nav.js so all pages share it. The Levers menu should, for now, set ?lever=<slug> via
   history.replaceState and scroll to #lever-detail.
5. Create one HTML template with three panels as labelled <section>s using the stable IDs in
   §3.1. Panel 1 is #moment, containing #moment-statement above #moment-visual. Panel 2 is
   #levers. #orchestration wraps Panels 1 and 2. Panel 3 is #lever-detail, then #site-footer, plus empty placeholders for the 3 cards, the
   orchestrator, the 4 lever cards and the 4 detail panels. Lay the panels out per §3 and §5
   (single column, max-width ~1200px, orchestrator gutter on desktop).
6. Generate all 7 pages at moments/<slug>/index.html from that template. Every page is a
   skeleton for now (§4.8: neutral static placeholder shapes, no "in development" label on the page,
   noindex). The 1-millionth-farmer page gets only its real Panel 1 statement text and footer concept note
   from §4.2 and §4.7. Use relative asset paths (../../css/…, ../../js/…).
7. Integrate Overnote per §9: copy ../overnote/src/overnote.js to js/overnote.js unmodified,
   write js/annotate.js (storageKey per pathname, ignore '#global-nav, .stack-controls,
   .lever-scroll-btn', reviewer-name prompt stored in localStorage, refresh() on a
   'viz:statechange' event), and load it before </body> on every page. Keep all page z-index
   values below 1000.
8. Add a short README.md (how to run locally with `python3 -m http.server`, how to deploy) and
   a CLAUDE.md that points future sessions to docs/REQUIREMENTS.md and lists the conventions
   (stable IDs, real DOM text, no build step, relative paths, z-index ceiling).

Verify before finishing:
- Serve locally and open every moment page in the browser at 390px, 768px and 1280px widths.
  Check the nav menus work by keyboard and touch, the moments menu navigates and marks the
  current page, the levers menu updates ?lever=, and there is no horizontal page scroll.
- Run the Overnote acceptance checklist (OVERNOTE_REQUIREMENT.md §6) on two pages, including
  confirming that annotations on one page don't appear on another.
- Grep css/ and the HTML for hard-coded hex values and font names outside the token files. There
  should be none. Diff css/rare-core.css against its source; it must be identical.
- Confirm `git status` lists no .eps files, nothing under assets/src/logo/, and no design-system docs.
- No console errors.
Report what you verified, anything you couldn't, and the decisions you made where the spec
was silent. Do not commit or push until I confirm.
```

---

## Stage 2 — Components and interactivity

```text
Stage 2 of the Rare Strategy System Viz. Read docs/REQUIREMENTS.md (§4, §5, §6, §8, §9, §11) and
CLAUDE.md first, then look at the current code, the LEGO mockups in concepts/, and the Change Agent
screenshot in ../rare-design-system-main/examples-current-state/. Its hero (a figure breaking out of a
rounded green panel) and its card carousel ("n of N" plus arrow buttons) are the composition
references for the card stack and the lever track. All values come from --rare-* or --viz-* tokens;
log any gap in docs/TOKEN_GAPS.md.

REVIEW FIRST: read every JSON file in reviews/stage-1/ (format in reviews/README.md). These
are my Overnote comments on Stage 1. Before building, list each comment (page, quoted text or
pinned element, comment) with how you'll handle it: fix now, fold into this stage, or decline with
a reason. Address the fixes as part of this stage. In your final report, give each comment's
outcome. If the folder is empty or missing, say so and carry on.

Goal: build every component and interaction with PLACEHOLDER content (neutral shapes, short
dummy labels), working identically on all 7 pages. Real copy and art come in Stage 3.

Build:
1. Card stack (js/card-stack.js, §4.3). Each card is a transparent frame, an inset opaque
   rounded backplate, and content layers that can overflow the backplate but not the frame.
   Prove the off-edge effect with a placeholder shape on each card that pokes past the backplate.
   Default order front→back: card-human-nature, card-community, card-policy. Community peeks
   left and policy peeks up-right (per the mockup). A single Next arrow button in
   .stack-controls (no Previous), with no visible counter, just a visually hidden live region announcing each scene. Next is triggered by click/tap,
   Enter/Space, Right Arrow inside the stack, and a swipe either way on the front card. Back
   cards are not clickable. inert/aria-hidden on back cards.
   The flip must follow the real-card physics in §4.3 exactly, because this is the heart of the
   component:
   - pull the front card sideways until it fully clears the deck (it may leave the browser frame)
   - advance the other cards
   - drop its z-order only once nothing overlaps it
   - tuck it into the back slot
   No cross-fade, no opacity animation, and no card ever passing through another. Use about 1s
   in total, set by --viz-motion-* tokens, with a one-deep input queue. Use overflow-x: clip on
   the page wrapper so off-screen travel never creates a scrollbar. Also build the shortened
   reduced-motion variant from §4.3.
2. Lever tabs (js/levers.js, §4.5). WAI-ARIA tabs in a horizontal scroll-snap track, edge
   fades and scroll buttons (.lever-scroll-btn) only when overflowing, significance tag
   (Primary/Strong/Supporting), hover vs focus vs selected states, caret under the selected card
   pointing into Panel 3. Default selection = highest-significance lever for the page's moment
   (from site-data.js); for 1-millionth-farmer that is behavior-tech, the 2nd card — scroll it
   into view. A valid ?lever= overrides; invalid falls back. Selection updates ?lever= with
   replaceState. Wire the nav Levers menu to the same select function.
3. Panel 3 (§4.6). Four role="tabpanel" detail blocks pre-rendered in HTML and toggled with
   `hidden`. Each has a graphic box with a figcaption, an h3 subtitle, a description and capability
   chips. Short cross-fade; two-column on desktop, stacked on mobile.
4. Orchestrator (js/orchestrator.js, §4.4). A placeholder figure in the right gutter straddling
   Panels 1/2, and an aria-hidden SVG overlay in #orchestration drawing a cubic Bézier from the
   selected lever card through the figure's hands to the card stack. Recompute on selection,
   ResizeObserver, lever-track scroll and stack flips. Attach to the track edge when the selected
   card is scrolled out of view. Animated draw on change (instant under reduced motion). On
   mobile, a short vertical connector. The pipe runs behind text and headings it crosses.
   No affinity badge on the cards (§4.4, removed in the Stage 2 review).
5. Dispatch CustomEvent('viz:statechange') after every lever change, and after each card flip
   lands, so annotate.js calls overnote.refresh().
6. Illustration spec (§7). Write docs/ILLUSTRATION_SPECS.md listing every art asset the
   1-millionth-farmer page needs, so I can generate the art while reviewing this stage. That means
   each card's background, figure and overhang layers, plus the orchestrator figure. For each,
   give: filename, layer role, which backplate edges it overflows and by how much, 1x/2x pixel
   dimensions, transparent background, accent ramp, alt text, and a short visual brief I can
   paste into my generation system. Fill every slot with a token-coloured placeholder silhouette
   at exactly those dimensions, so final files drop in by name. Create assets/CREDITS.md with
   empty columns: asset, source (stock/AI re-render/original), licence, creator, attribution.

Verify before finishing:
- Flip physics: record the flip at 1280 and 390 (a short GIF or a frame sequence). Check frame by
  frame that the front card fully clears the deck before re-stacking, that no card passes through
  another, that overhanging layers move with their card, and that no horizontal scrollbar
  appears. Press Next rapidly five times and confirm the cards never jump.
- In the browser at 360, 390, 768, 1024 and 1440px: flip the stack by every input method,
  select every lever by mouse, keyboard and nav menu, scroll the lever track, and resize the
  window. Confirm the pipe stays attached throughout. Take screenshots at 390 and 1280.
- Load ?lever=policy, ?lever=bogus, and no param.
- Keyboard-only pass through the whole page. Emulate prefers-reduced-motion.
- Overnote: in Sticky mode the nav and arrow buttons still work. Pin a note on a lever card and
  on a detail panel, switch levers, and reload. Notes reattach.
- No console errors.
Report results with the screenshots, what you couldn't verify, and any spec gaps. Don't commit
or push until I confirm.
```

---

## Stage 3 — Content, illustrations and graphics (1 Millionth Farmer)

```text
Stage 3 of the Rare Strategy System Viz. Read docs/REQUIREMENTS.md (§4.2–4.7, §6, §7),
rare-strategy-2030.md, and ../rare-design-system-main/4-WSG-Starter-Set.md, then review the current
1-millionth-farmer page in the browser.

REVIEW FIRST: read every JSON file in reviews/stage-2/ (format in reviews/README.md). These
are my Overnote comments on Stage 2. Before building, list each comment (page, quoted text or
pinned element, comment) with how you'll handle it: fix now, fold into this stage, or decline with
a reason. Address the fixes as part of this stage. In your final report, give each comment's
outcome. If the folder is empty or missing, say so and carry on.

Goal: make moments/1-millionth-farmer/ the fully realized page. The other 6 stay skeletons.

Do this:
1. Content. Replace placeholders with the drafted copy in §4.2–4.7: title, description,
   context line, card labels and captions, the Levers heading, the four lever card descriptions
   and significance values, the four Panel 3 subtitles, descriptions and capability chips, and
   the footer. Keep the copy as written unless it breaks a layout. If you change any wording,
   list each change. Do not invent statistics: every figure must trace to
   rare-strategy-2030.md.
2. Card art (§7). I generate and supply the illustrations; do not create final art. My files
   are in assets/src/moment-1/ and are named per docs/ILLUSTRATION_SPECS.md. For each one:
   - check it against its spec (dimensions, transparency, overflow edges) and list any mismatch
   - optimize it into assets/img/moment-1/ (AVIF or WebP plus PNG fallback, 1x/2x srcset; keep
     SVG as SVG)
   - swap it in for its placeholder, and adjust the overhang positioning so it breaks the
     backplate edge as specified
   - confirm the Human & Nature phone tip is HTML text over the phone, not baked into the image
   Leave the placeholder in any slot without a supplied file, and list those slots. Fill in the
   technical columns of assets/CREDITS.md and flag any row where I still need to record a
   source or licence.
3. Panel 3 graphics. Build the four inline-SVG diagrams in §4.6 (barrier-to-habit path, capital
   flow, nested rights rings, narrative ripples) in token colours. All labels must also be in the
   HTML figcaption or a visually hidden description.
4. Orchestrator. Swap in my supplied orchestrator figure the same way as the card art. Retune
   the pipe's attachment point to the figure's hands, and give the pipe a ribbed or textured
   stroke in an accent token.
5. Polish. Check type, spacing and colour against the tokens and the Change Agent and Speak
   Sustainability sites. Hold the WSG budget in §7: ≤ 500 KB first view (hard cap 1 MB), with
   images ≤ 230 KB and fonts ≤ 100 KB. Lazy-load below-the-fold art and the inactive Panel 3
   graphics.

Verify before finishing:
- Screenshots at 390, 768 and 1280px, with every lever selected at 1280.
- Lighthouse on a mobile profile: every category ≥ 90 (Accessibility and Best Practices ≥ 95).
  SEO is exempt because of noindex. Also report first-view transfer size by asset class and the
  Website Carbon estimate (target ≤ 0.19 g CO₂e). Report the actual numbers.
- Contrast check on all text over art and over each panel colour.
- Run the full acceptance list in REQUIREMENTS.md §12 and report each item as pass, fail or
  not verified.
- Overnote: highlight a sentence in Panel 3 and a card caption, reload, and confirm they
  reattach.
- Re-run the Stage 2 flip-physics check with the real art, since larger overhangs need more
  travel to clear the deck.
Don't commit or push until I confirm.
```

---

## Stage 4 (optional) — Deploy to GitHub Pages

```text
Deploy the Rare Strategy System Viz to GitHub Pages. Read README.md and CLAUDE.md. First read
reviews/stage-3/ the same way as the earlier stages: list each comment, fix what's needed, and
report the outcomes. Confirm that `git status` shows no files from reviews/ other than README.md.
Commit the work on a branch, open a PR to main, and once I approve and merge it, enable Pages
from the main branch root. Then open the live URL
(https://<owner>.github.io/rare-strategy-system-viz/) and confirm: the root redirects, all 7
moment pages load, ?lever= deep links work, Overnote loads (check that the module paths resolve
under the repo prefix), and there are no console errors. Report the live URL and the results.
```
