/**
 * Orchestrator pipe (REQUIREMENTS §4.4).
 *
 * Draws a ribbed tube in the aria-hidden SVG overlay inside #orchestration: from the front
 * card's backplate edge, through the orchestrator's hands, to the top edge of the selected
 * lever card. Two cubic Béziers that share a vertical tangent at the hands, so the line runs
 * smoothly through them.
 *   - Desktop (≥ 1024px): leaves the stack's right edge, curves down to the figure in the
 *     right gutter, then down to the lever card.
 *   - Below 1024px: a short vertical connector from the stack's bottom edge, through the
 *     figure between the panels, to the lever card.
 * If the selected card is scrolled out of the track's view, the pipe attaches to the nearest
 * visible edge of the track.
 *
 * Recomputed on lever change (`viz:leverchange`, with a stroke draw of --viz-motion-pipe,
 * instant under reduced motion), card flips and other state changes (`viz:statechange`),
 * resize (ResizeObserver), lever-track scroll, and font or image loads.
 */
const root = document.getElementById('orchestration');
const svg = root?.querySelector('.orchestrator-pipe');
const grip = root?.querySelector('[data-orchestrator-grip]');
const deck = root?.querySelector('.card-stack__deck');
const track = root?.querySelector('.lever-track');
const DESKTOP = window.matchMedia('(min-width: 1024px)');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const NS = 'http://www.w3.org/2000/svg';

let tube;
let ribs;
let reveal;
let drawing = null;

function make(tag, attrs = {}, parent = svg) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  parent.append(node);
  return node;
}

function build() {
  const defs = make('defs');
  const mask = make('mask', { id: 'orchestrator-pipe-mask', maskUnits: 'userSpaceOnUse', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  reveal = make('path', { class: 'orchestrator-pipe__reveal', pathLength: '1' }, mask);
  const group = make('g', { mask: 'url(#orchestrator-pipe-mask)' });
  tube = make('path', { class: 'orchestrator-pipe__tube' }, group);
  ribs = make('path', { class: 'orchestrator-pipe__ribs' }, group);
}

const px = (n) => Math.round(n * 10) / 10;

function geometry() {
  const tab = track.querySelector('[aria-selected="true"]');
  const front = deck.querySelector('.stack-card[data-slot="0"] .stack-card__backplate');
  if (!tab || !front) return null;
  const origin = root.getBoundingClientRect();
  const stack = deck.getBoundingClientRect();
  const hands = grip.getBoundingClientRect();
  const card = tab.getBoundingClientRect();
  const view = track.getBoundingClientRect();
  // How far each end tucks under the element it plugs into.
  const tuck = parseFloat(getComputedStyle(tube).strokeWidth) || 0;

  // The backplate's rest box inside the deck. offset* ignore transforms, so this holds even
  // while a card is mid-flip.
  const plate = {
    left: stack.left + front.offsetLeft,
    top: stack.top + front.offsetTop,
    width: front.offsetWidth,
    height: front.offsetHeight,
  };

  const desktop = DESKTOP.matches;
  const start = desktop
    ? { x: plate.left + plate.width - tuck, y: plate.top + plate.height * 0.75 }
    : { x: plate.left + plate.width / 2, y: plate.top + plate.height - tuck };
  const startDir = desktop ? { x: 1, y: 0 } : { x: 0, y: 1 };
  const mid = { x: hands.left, y: hands.top };
  const margin = tuck * 3;
  const end = {
    x: Math.min(Math.max(card.left + card.width / 2, view.left + margin), view.right - margin),
    y: card.top + tuck,
  };

  const shift = (p) => ({ x: p.x - origin.left, y: p.y - origin.top });
  return { start: shift(start), startDir, mid: shift(mid), end: shift(end) };
}

function pathFor({ start, startDir, mid, end }) {
  const reach1 = Math.max(Math.abs(mid.x - start.x), Math.abs(mid.y - start.y)) * 0.55;
  const into = Math.abs(mid.y - start.y) * 0.6;
  const out = Math.abs(end.y - mid.y) * 0.6;
  const c1 = { x: start.x + startDir.x * reach1, y: start.y + startDir.y * reach1 };
  const c2 = { x: mid.x, y: mid.y - into };
  const c3 = { x: mid.x, y: mid.y + out };
  const c4 = { x: end.x, y: end.y - out };
  const pt = (p) => `${px(p.x)} ${px(p.y)}`;
  return `M ${pt(start)} C ${pt(c1)}, ${pt(c2)}, ${pt(mid)} C ${pt(c3)}, ${pt(c4)}, ${pt(end)}`;
}

function readPipeTiming() {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;visibility:hidden;transition-duration:var(--viz-motion-pipe);' +
    'transition-timing-function:var(--rare-motion-easing-standard)';
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const timing = { duration: parseFloat(style.transitionDuration) * 1000, easing: style.transitionTimingFunction };
  probe.remove();
  return timing;
}

export function updatePipe({ animate = false } = {}) {
  const shape = geometry();
  if (!shape) return;
  const d = pathFor(shape);
  for (const path of [tube, ribs, reveal]) path.setAttribute('d', d);
  if (!animate || REDUCED.matches) return;
  drawing?.cancel();
  drawing = reveal.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], readPipeTiming());
}

if (root && svg && grip && deck && track) {
  build();
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => updatePipe());
  };
  document.addEventListener('viz:leverchange', (event) => updatePipe({ animate: event.detail?.animate }));
  document.addEventListener('viz:statechange', schedule);
  track.addEventListener('scroll', schedule, { passive: true });
  const resize = new ResizeObserver(schedule);
  [root, deck, track].forEach((el) => resize.observe(el));
  DESKTOP.addEventListener('change', schedule);
  document.fonts?.ready.then(schedule);
  root.querySelectorAll('img').forEach((img) => img.complete || img.addEventListener('load', schedule, { once: true }));
  updatePipe();
}
