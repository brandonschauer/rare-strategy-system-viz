/**
 * Panel 1 card stack (REQUIREMENTS §4.3).
 *
 * The flip follows real-card physics, as a hand pulling the top card off a deck:
 *   1. Pull out: the front card slides sideways (tilting, shadow deepening) until its whole
 *      frame, overhanging layers included, is clear of every other card. It may leave the
 *      browser frame; .page clips the overflow so no scrollbar appears.
 *   2. Advance, starting one offset later: the other cards move up one slot each, underneath.
 *   3. Re-stack at the apex: only once the pulled card is clear does its z-order drop to the
 *      back. That is the one moment depth changes, and nothing overlaps it then.
 *   4. Tuck in: it slides back into the rear slot underneath the others and settles.
 * No opacity is ever animated, so nothing fades; only transform moves (plus the backplate
 * shadow, via CSS). Rest positions come from CSS (data-slot); this module reads them as
 * computed transforms, so the layout stays in one place. Timing comes from --viz-motion-*.
 *
 * Inputs: the Next button (click, tap, Enter, Space), Right Arrow anywhere in the stack
 * region, and a horizontal swipe on the front card in either direction (thrown the way it was
 * swiped). One trigger during a flip is queued; more are ignored, so cards never jump.
 * Reduced motion: the same sequence, shorter (about 300ms legs), with no tilt or overshoot.
 *
 * When a card lands: back cards get inert + aria-hidden, the live region announces the scene
 * ("Scene 2 of 3: Community"), and `viz:statechange` fires so Overnote and the pipe refresh.
 */
const region = document.getElementById('moment-visual');
const deck = region?.querySelector('.card-stack__deck');
const next = region?.querySelector('.stack-next');
const announcer = region?.querySelector('.stack-announcer');
// DOM order is the default front-to-back order, so it also gives each scene's number.
const cards = deck ? [...deck.querySelectorAll('.stack-card')] : [];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const IDENTITY = 'matrix(1, 0, 0, 1, 0, 0)';
// Pointer travel before a press on the front card counts as a drag rather than a tap.
const DRAG_START = 8;

let busy = false;
let queued = null;
let drag = null;

/** Resolve the --viz-* motion and gesture tokens to numbers through a hidden probe element. */
function readTokens() {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;' +
    'transition-property:transform,color,background-color,border-color;' +
    'transition-duration:var(--viz-motion-flip-leg),var(--viz-motion-flip-leg-reduced),' +
    'var(--viz-motion-flip-offset),var(--viz-motion-flip-offset-reduced);' +
    'transition-timing-function:var(--rare-motion-easing-standard);' +
    'width:var(--viz-stack-swipe-min);height:var(--rare-space-6);rotate:var(--viz-stack-tilt);';
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const [leg, legReduced, offset, offsetReduced] = style.transitionDuration
    .split(',')
    .map((s) => parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000));
  const tokens = {
    leg,
    legReduced,
    offset,
    offsetReduced,
    easing: style.transitionTimingFunction,
    swipeMin: parseFloat(style.width),
    gap: parseFloat(style.height),
    tilt: parseFloat(style.rotate) || 0,
    overshoot: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--viz-stack-overshoot')) || 0,
  };
  probe.remove();
  return tokens;
}

const bySlot = () => [...cards].sort((a, b) => Number(a.dataset.slot) - Number(b.dataset.slot));
const restTransform = (card) => {
  const value = getComputedStyle(card).transform;
  return value === 'none' ? IDENTITY : value;
};

function request(direction = 1) {
  if (busy) {
    queued ??= direction;
    return;
  }
  flip(direction);
}

/** Runs one flip, then the queued one if any. A failure never leaves the stack locked. */
async function flip(direction, fromX = 0) {
  busy = true;
  try {
    await runFlip(direction, fromX);
  } finally {
    busy = false;
  }
  if (queued !== null) {
    const nextDirection = queued;
    queued = null;
    flip(nextDirection);
  }
}

async function runFlip(direction, fromX) {
  const t = readTokens();
  const reduced = REDUCED.matches;
  const leg = reduced ? t.legReduced : t.leg;
  const offset = reduced ? t.offsetReduced : t.offset;
  const tilt = reduced ? 0 : t.tilt * direction;
  const timing = { duration: leg, easing: t.easing, fill: 'both' };

  const order = bySlot();
  const [pulled, ...rest] = order;
  pulled.style.transform = '';
  const rests = order.map(restTransform);

  // How far the front card must travel for its frame to clear every slot the deck occupies
  // (the advancing cards only ever move within those slots). Its own rest rect is measured
  // without any swipe offset; the tilt widens its bounding box, so that is added to the margin.
  const frames = order.map((card) => card.getBoundingClientRect());
  const own = frames[0];
  const margin =
    t.gap + own.height * Math.abs(Math.sin((tilt * Math.PI) / 180)) + (reduced ? 0 : own.width * t.overshoot);
  const dx =
    direction > 0
      ? Math.max(...frames.map((r) => r.right)) - own.left + margin
      : Math.min(...frames.map((r) => r.left)) - own.right - margin;

  // 1. Pull out.
  pulled.classList.add('is-pulled');
  const out = `translateX(${dx}px) rotate(${tilt}deg)`;
  const pull = pulled.animate(
    [{ transform: `translateX(${fromX}px) rotate(0deg)` }, { transform: out }],
    timing,
  );

  // 2. Advance, underneath the pulled card, starting one offset later.
  const advances = rest.map((card, i) =>
    card.animate([{ transform: rests[i + 1] }, { transform: rests[i] }], { ...timing, delay: offset }),
  );

  await pull.finished;

  // 3. Re-stack at the apex: the pulled card is clear of the deck, so depth changes now.
  //    Running animations hold every card where it is; only z-order changes.
  rest.forEach((card, i) => (card.dataset.slot = String(i)));
  pulled.dataset.slot = String(order.length - 1);
  pulled.classList.remove('is-pulled');
  pulled.removeAttribute('data-front');

  // 4. Tuck in to the rear slot, underneath the others.
  const tuck = pulled.animate([{ transform: out }, { transform: rests[order.length - 1] }], timing);
  pull.cancel();

  await Promise.all([tuck.finished, ...advances.map((a) => a.finished)]);
  // The CSS rest positions now match where every animation ended, so dropping them is seamless.
  [tuck, ...advances].forEach((a) => a.cancel());
  land();
}

function land() {
  const front = bySlot()[0];
  for (const card of cards) {
    const isFront = card === front;
    card.toggleAttribute('data-front', isFront);
    card.toggleAttribute('inert', !isFront);
    if (isFront) card.removeAttribute('aria-hidden');
    else card.setAttribute('aria-hidden', 'true');
  }
  announcer.textContent = `Scene ${cards.indexOf(front) + 1} of ${cards.length}: ${front.dataset.label}`;
  document.dispatchEvent(
    new CustomEvent('viz:statechange', { detail: { card: front.dataset.card, source: 'card-stack' } }),
  );
}

/* ---- Swipe on the front card --------------------------------------------------------------
 * The card follows the pointer horizontally; past --viz-stack-swipe-min it is thrown that way
 * (the pull continues from where the finger let go), otherwise it springs back. Vertical
 * movement is left to the page (touch-action: pan-y). */

function endDrag(event, { cancelled = false } = {}) {
  if (!drag || event.pointerId !== drag.id) return;
  const { card, dx, active } = drag;
  drag = null;
  if (!active) return;
  const t = readTokens();
  if (!cancelled && Math.abs(dx) >= t.swipeMin && !busy) {
    flip(Math.sign(dx), dx);
    return;
  }
  card.style.transform = '';
  card.animate([{ transform: `translateX(${dx}px)` }, { transform: IDENTITY }], {
    duration: REDUCED.matches ? t.offsetReduced : t.legReduced,
    easing: t.easing,
  });
}

function initSwipe() {
  deck.addEventListener('pointerdown', (event) => {
    const card = event.target.closest('.stack-card');
    if (busy || !card || card.dataset.slot !== '0' || event.button !== 0) return;
    drag = { id: event.pointerId, card, x0: event.clientX, y0: event.clientY, dx: 0, active: false };
  });

  deck.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x0;
    const dy = event.clientY - drag.y0;
    if (!drag.active) {
      if (Math.abs(dy) > DRAG_START && Math.abs(dy) > Math.abs(dx)) {
        drag = null; // a vertical gesture: let the page scroll
        return;
      }
      if (Math.abs(dx) < DRAG_START) return;
      drag.active = true;
      drag.card.setPointerCapture(event.pointerId);
    }
    drag.dx = dx;
    drag.card.style.transform = `translateX(${dx}px)`;
  });

  deck.addEventListener('pointerup', (event) => endDrag(event));
  deck.addEventListener('pointercancel', (event) => endDrag(event, { cancelled: true }));
  // Dragging an image or selecting text would fight the swipe.
  deck.addEventListener('dragstart', (event) => event.preventDefault());
}

if (deck && next && announcer && cards.length) {
  next.addEventListener('click', () => request(1));
  region.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    request(1);
  });
  initSwipe();
}
