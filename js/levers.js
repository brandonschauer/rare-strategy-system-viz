/**
 * Lever selection and URL state (REQUIREMENTS §2.3, §4.5, §4.6).
 *
 * Stage 1 frame: resolves the selected lever from ?lever= (falling back to the moment's
 * highest-significance lever), marks the matching lever card, toggles `hidden` on the Panel 3
 * detail panels, and keeps ?lever= in sync with history.replaceState. Stage 2 adds the
 * WAI-ARIA Tabs pattern, scroll track and hover/selected styling on top of this.
 *
 * Text is never re-rendered: panels are only shown or hidden, so Overnote anchors survive.
 * Every change dispatches `viz:statechange` with { lever } for annotate.js.
 */
import { defaultLeverFor, getLever } from './site-data.js';

const moment = document.body.dataset.moment;

function readUrlLever() {
  const slug = new URLSearchParams(location.search).get('lever');
  return slug && getLever(slug) ? slug : null;
}

function writeUrlLever(slug) {
  const url = new URL(location.href);
  if (url.searchParams.get('lever') === slug) return;
  url.searchParams.set('lever', slug);
  history.replaceState(history.state, '', url);
}

export function selectLever(slug, { updateUrl = true } = {}) {
  if (!getLever(slug)) return;
  for (const card of document.querySelectorAll('[data-lever-card]')) {
    card.toggleAttribute('data-selected', card.dataset.leverCard === slug);
  }
  for (const panel of document.querySelectorAll('[data-lever-detail]')) {
    panel.hidden = panel.dataset.leverDetail !== slug;
  }
  if (updateUrl) writeUrlLever(slug);
  document.dispatchEvent(new CustomEvent('viz:statechange', { detail: { lever: slug, source: 'levers' } }));
}


// An invalid or missing ?lever= falls back to the default without rewriting the URL.
selectLever(readUrlLever() ?? defaultLeverFor(moment), { updateUrl: false });
