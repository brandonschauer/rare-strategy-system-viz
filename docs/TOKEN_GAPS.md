# Token gaps

Values this site needs that Rare Core (`css/rare-core.css`) does not provide. Each is bound to the nearest existing token as a product-scope `--viz-*` token in `css/viz-tokens.css`. Nothing here is a new primitive. The system owner decides whether any of them should be promoted to Core.

| Need | Interim binding | Proposed Core token | Logged |
| --- | --- | --- | --- |
| Card-stack flip legs (about 450ms each, about 1s in total) and pipe draw (about 500ms), all longer than `motion.duration.base` (200ms) | `--viz-motion-flip-leg` and `--viz-motion-pipe`, written as multiples of `--rare-motion-duration-base` | `motion.duration.slow` (and perhaps `-slower`) | REQUIREMENTS §6.2 |
| Elevation shadows: soft card shadow (lever cards, §6.4; the nav logo tab, §4.1) and a lifted shadow (front card, pulled card). Core has z-index elevation but no shadow values | `--viz-shadow-soft` / `--viz-shadow-lifted`, composed from `--rare-color-ink` (via `color-mix`) and `--rare-space-*` offsets | `elevation.shadow.raised` / `elevation.shadow.lifted` | Stage 1 |
| Nav logo display height: 56px desktop, 44px mobile (§6.4). No size step at either value | `--viz-nav-logo-height` = `space-9 + space-2`; mobile = `space-8 + space-1` | None proposed; product composition | Stage 1 |
| Responsive breakpoints (640 / 800 / 1024px). Core defines none, and media queries can't read custom properties | Documented once at the top of `css/viz-tokens.css` and reused unchanged in every component file | `breakpoint.*`, if Core wants systemic breakpoints (Guardrails, "Responsive behavior") | Stage 1 |
| Selected lever card border of 2px (§6.4). Core has `border.width.default` 1px, `-strong` 1.5px and `-focus` 3px | Not used in Stage 1. Stage 2 will bind `--rare-border-width-strong` unless Core adds a step | `border.width.heavy` (2px) | Stage 1 (for Stage 2) |
| Panel 3 cross-fade (about 250ms, §4.6) | `--rare-motion-duration-base` (200ms). Close enough; no new token | None | Stage 1 |
