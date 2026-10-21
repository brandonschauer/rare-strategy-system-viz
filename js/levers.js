/**
 * Panel 2 lever tabs, Panel 3 switching and URL state (REQUIREMENTS §2.3, §4.4–4.6).
 *
 * - WAI-ARIA Tabs with manual activation: the track is role="tablist", each lever card a
 *   role="tab" (roving tabindex on the selected one). Left/Right/Home/End move focus;
 *   Enter/Space or a click selects. Panel 3's details are role="tabpanel".
 * - Default selection is the moment's highest-significance lever (site-data.js); a valid
 *   ?lever= overrides it, an invalid one falls back without touching the URL. Choosing a lever
 *   writes ?lever= with history.replaceState. If the selected card isn't fully in the track's
 *   view on load, the track scrolls to it.
 * - The track shows edge fades and .lever-scroll-btn buttons only while it overflows.
 * - Panel 3 cross-fades between pre-rendered panels; text is never re-rendered, only `hidden`
 *   is toggled, so Overnote anchors survive. The caret on Panel 3's top rule follows the
 *   selected card's centre through track scroll and resize.
 *
 * Events: `viz:leverchange` fires at once (the orchestrator pipe redraws), and
 * `viz:statechange` fires once Panel 3 has settled (annotate.js refreshes Overnote).
 *
 * The nav's Levers menu does not select levers in this phase: it opens an explanatory dialog
 * (REQUIREMENTS v0.7, §4.1). selectLever is exported for when lever pages link back here.
 */
import { defaultLeverFor, getLever } from './site-data.js';

const moment = document.body.dataset.moment;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const track = document.querySelector('.lever-track');
const wrap = track?.closest('.lever-track-wrap');
const detail = document.getElementById('lever-detail');
const tabs = track ? [...track.querySelectorAll('[role="tab"]')] : [];
const panels = [...document.querySelectorAll('[data-lever-detail]')];
const prevButton = wrap?.querySelector('.lever-scroll-btn--prev');
const nextButton = wrap?.querySelector('.lever-scroll-btn--next');

let current = null;

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

function detailTiming() {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;visibility:hidden;transition-duration:var(--viz-motion-detail);' +
    'transition-timing-function:var(--rare-motion-easing-standard)';
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const timing = { duration: parseFloat(style.transitionDuration) * 1000, easing: style.transitionTimingFunction };
  probe.remove();
  return timing;
}

/* ---- Panel 3 ------------------------------------------------------------------------------ */

async function showPanel(slug, animate) {
  const incoming = panels.find((p) => p.dataset.leverDetail === slug);
  // Settle any cross-fade still running from a previous rapid change.
  panels.forEach((p) => p.getAnimations().forEach((a) => a.cancel()));
  const outgoing = panels.filter((p) => p !== incoming && !p.hidden);
  if (!incoming) return;

  if (!animate || REDUCED.matches || !outgoing.length) {
    panels.forEach((p) => {
      p.hidden = p !== incoming;
      p.inert = false;
      p.removeAttribute('aria-hidden');
    });
    return;
  }

  const timing = detailTiming();
  incoming.hidden = false;
  incoming.inert = false;
  incoming.removeAttribute('aria-hidden');
  outgoing.forEach((p) => {
    p.inert = true;
    p.setAttribute('aria-hidden', 'true');
  });
  const fades = [
    incoming.animate([{ opacity: 0 }, { opacity: 1 }], timing),
    ...outgoing.map((p) => p.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, fill: 'forwards' })),
  ];
  try {
    await Promise.all(fades.map((a) => a.finished));
  } catch {
    return; // cancelled by a newer change, which settles the panels itself
  }
  outgoing.forEach((p) => {
    p.hidden = true;
    p.inert = false;
    p.removeAttribute('aria-hidden');
    p.getAnimations().forEach((a) => a.cancel());
  });
}

/* ---- Track geometry: overflow, caret, scrolling ------------------------------------------ */

function updateOverflow() {
  if (!track) return;
  const max = track.scrollWidth - track.clientWidth;
  const atStart = track.scrollLeft <= 1;
  const atEnd = track.scrollLeft >= max - 1;
  const overflowing = max > 1;
  wrap.toggleAttribute('data-overflow-start', overflowing && !atStart);
  wrap.toggleAttribute('data-overflow-end', overflowing && !atEnd);
  prevButton.hidden = !overflowing || atStart;
  nextButton.hidden = !overflowing || atEnd;
}

/** Panel 3's caret sits under the selected card's centre, or hides when it is scrolled away. */
function updateCaret() {
  const tab = tabs.find((t) => t.dataset.leverCard === current);
  if (!tab || !detail) return;
  const card = tab.getBoundingClientRect();
  const view = track.getBoundingClientRect();
  const centre = card.left + card.width / 2;
  const visible = centre >= view.left && centre <= view.right;
  detail.toggleAttribute('data-caret-hidden', !visible);
  if (visible) detail.style.setProperty('--lever-caret-x', `${centre - detail.getBoundingClientRect().left}px`);
}

function updateGeometry() {
  updateOverflow();
  updateCaret();
}

/** Scroll the track (never the page) so a card is fully in view. */
function revealInTrack(tab, { instant = false } = {}) {
  const view = track.getBoundingClientRect();
  const card = tab.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
  let delta = 0;
  if (card.left < view.left + pad) delta = card.left - view.left - pad;
  else if (card.right > view.right - pad) delta = card.right - view.right + pad;
  if (delta) track.scrollBy({ left: delta, behavior: instant || REDUCED.matches ? 'instant' : 'smooth' });
}

function scrollByCard(direction) {
  const step = tabs[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
  track.scrollBy({ left: direction * step, behavior: REDUCED.matches ? 'instant' : 'smooth' });
}

/* ---- Selection ---------------------------------------------------------------------------- */

export async function selectLever(slug, { updateUrl = true, animate = true } = {}) {
  if (!getLever(slug)) return;
  const changed = slug !== current;
  current = slug;
  for (const tab of tabs) {
    const selected = tab.dataset.leverCard === slug;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  if (updateUrl) writeUrlLever(slug);
  updateCaret();
  document.dispatchEvent(new CustomEvent('viz:leverchange', { detail: { lever: slug, animate: animate && changed } }));
  await showPanel(slug, animate && changed);
  if (current !== slug) return; // superseded mid-fade; the newer change dispatches
  document.dispatchEvent(new CustomEvent('viz:statechange', { detail: { lever: slug, source: 'levers' } }));
}

function initTabs() {
  track.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) selectLever(tab.dataset.leverCard);
  });

  track.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let target = null;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    else if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (event.key === 'Home') target = tabs[0];
    else if (event.key === 'End') target = tabs[tabs.length - 1];
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectLever(tabs[index].dataset.leverCard);
      return;
    }
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    revealInTrack(target);
  });

  // A tab reached by Tab (or a click) is brought fully into view too.
  track.addEventListener('focusin', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) revealInTrack(tab);
  });

  prevButton.addEventListener('click', () => scrollByCard(-1));
  nextButton.addEventListener('click', () => scrollByCard(1));

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateGeometry);
  };
  track.addEventListener('scroll', schedule, { passive: true });
  new ResizeObserver(schedule).observe(track);
  window.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
}

if (track && tabs.length) {
  initTabs();
  // An invalid or missing ?lever= falls back to the default without rewriting the URL.
  const initial = readUrlLever() ?? defaultLeverFor(moment);
  selectLever(initial, { updateUrl: false, animate: false });
  const tab = tabs.find((t) => t.dataset.leverCard === initial);
  if (tab) revealInTrack(tab, { instant: true });
  updateGeometry();
}
