# Rare Strategy System Viz

A static concept site showing how Rare's 2030 Strategy comes about through "human milestone moments". Each moment page shows the moment, the four levers that make it possible, what each lever has to do, and a Rare team member orchestrating them. The spec is [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md).

**Status:** Stage 1 (frame). All 7 moment pages are skeletons. See REQUIREMENTS §11 for the stages.

## Run locally

ES modules don't load from `file://`, so serve the repo root:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/ (it redirects to `moments/1-millionth-farmer/`).

## Regenerate the moment pages

The 7 pages share one template. After changing `templates/moment.html` or `js/site-data.js`:

```bash
python3 tools/generate_moments.py
```

This is a dev-time helper, not a build step: the generated HTML is committed and served as is. A page whose `<html>` has `data-authored="true"` is never overwritten.

## Review with Overnote

Annotate with the toolbar (bottom right), then click **Export review** in any page's footer. Save the file in `reviews/stage-N/` so the next stage's session can work through it. See [reviews/README.md](reviews/README.md). Comments are kept per browser and per address, so export from the same browser and address you annotated in.

## Deploy

GitHub Pages, serving the `main` branch root (Settings → Pages → Deploy from a branch → `main` / root). The `.nojekyll` file stops Jekyll processing. All asset paths are relative, so the `/rare-strategy-system-viz/` project prefix needs no configuration. At launch, check the deployed URL with the Green Web Foundation checker.

Everything on the branch is published, so don't commit design-system documents or print logo files. `.gitignore` keeps `*.eps`, `assets/src/logo/`, `rare-strategy-2030.md` and `concepts/` local only.

## Layout

- `css/rare-core.css`: Rare Core tokens, vendored unmodified from `speak-sustainability/design-tokens/build/`.
- `css/viz-tokens.css`: product-scope `--viz-*` tokens and the Overnote theme. Gaps are logged in [docs/TOKEN_GAPS.md](docs/TOKEN_GAPS.md).
- `js/site-data.js`: moments and levers for the menus and default lever selection.
- `js/annotate.js`: Overnote setup. `js/overnote.js` is vendored unmodified.
