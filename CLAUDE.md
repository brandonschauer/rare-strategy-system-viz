# Rare Strategy System Viz: notes for Claude

Read [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) first. It is the source of truth; §11 defines the stages. Stage prompts are in [docs/CLAUDE_CODE_PROMPTS.md](docs/CLAUDE_CODE_PROMPTS.md). On design-system questions, the specs in `../rare-design-system-main/` win; never copy files from there into this repo (it holds restricted docs).

## Conventions

- **No build step, no framework.** Static HTML, CSS and vanilla ES modules. Serve with `python3 -m http.server`. `tools/generate_moments.py` is a dev-time scaffold whose output is committed; it skips any page marked `data-authored="true"`.
- **Relative paths only.** Moment pages sit at `moments/<slug>/`, so assets are `../../css/…`, `../../js/…`. This works locally and under the GitHub Pages prefix.
- **Stable IDs.** Keep the IDs in REQUIREMENTS §3.1 (`global-nav`, `moment`, `moment-statement`, `moment-visual`, `card-*`, `orchestration`, `orchestrator`, `levers`, `lever-*`, `lever-detail`, `detail-*`, `site-footer`). Overnote sticky notes anchor to them.
- **Real DOM text.** Reviewable text is HTML, never inside canvas, images or SVG without an HTML equivalent. Don't re-render text from JS after load; toggle `hidden`. Dispatch `CustomEvent('viz:statechange')` after any lever or card change so `annotate.js` calls `overnote.refresh()`.
- **Lever state is a query parameter** (`?lever=<slug>`), never a path, so each page keeps one Overnote `storageKey`.
- **Header.** rare.org-style: the logo tab, `#site-title` and `<nav id="global-nav">` sit on Panel 1's canvas and scroll away; nothing is sticky. Overnote's `ignore` covers `#global-nav` and `.site-header__logo-tab`, so menus and logo stay clickable in Sticky mode; the site title stays annotatable.
- **z-index ceiling.** Use only `--rare-elevation-z-*` tokens (max 30); every page z-index stays below 1000. Overnote's UI sits at about 2147483000.
- **Tokens only.** No hard-coded hex, off-grid px or font names outside `css/rare-core.css` and `css/viz-tokens.css`. Missing value: bind the nearest token as a `--viz-*` product token and log it in `docs/TOKEN_GAPS.md`. Never invent a primitive. Never edit `css/rare-core.css`; replace it from `../speak-sustainability/design-tokens/build/rare-core.css`.
- **Breakpoints** are the documented set at the top of `css/viz-tokens.css` (640 / 800 / 1024px). Reuse them; don't add new ones.
- **Vendored, unmodified:** `css/rare-core.css`, `js/overnote.js`.
- **Not committed (gitignored, local only):** `*.eps`, `assets/src/logo/` (original brand files), `rare-strategy-2030.md` and `concepts/` (internal source material). Design-system docs never enter the repo. GitHub Pages publishes everything committed, so keep it that way.
- **Reviews.** Overnote comments are exported with the footer's **Export review** button into `reviews/stage-N/*.json` (gitignored; format in `reviews/README.md`). At the start of a stage, read the previous stage's folder, and report each comment's outcome.
- Brand name is "Rare", never "RARE". Use the stacked logo lockup only; never a horizontal one.
