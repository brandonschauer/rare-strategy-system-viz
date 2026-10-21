/**
 * Panel 1 card stack (REQUIREMENTS §4.3).
 *
 * Every change of order is one "move" with real-card physics, as a hand working a deck:
 *   1. Pull out: one card slides sideways (tilting, shadow deepening) until its whole frame,
 *      overhanging layers included, is clear of every other card. It may leave the browser
 *      frame; .page clips the overflow so no scrollbar appears.
 *   2. Shift, starting one offset later: the cards whose slot changes move to their new slots.
 *   3. Re-stack at the apex: only once the moving card is clear does its z-order change. That
 *      is the one moment depth changes, and nothing overlaps it then.
 *   4. Slide in: it slides into its new slot and settles.
 * Two moves use it:
 *   - Rotate: the front card goes to the back ([A, B, C] → [B, C, A]); it leaves toward the
 *     button (or the way it was swiped) and tucks in underneath.
 *   - Bring to front: a peeking back card comes to the top and the others keep their order
 *     behind it ([A, B, C], click C → [C, A, B]). It leaves toward the side it peeks from
 *     (Community left, Policy right), underneath, then rises at the apex and slides in on top.
 * No opacity is ever animated, so nothing fades; only transform moves (plus the backplate
 * shadow, via CSS). Rest positions come from CSS (data-slot); this module reads them as
 * computed transforms, so the layout stays in one place. Timing comes from --viz-motion-*.
 *
 * Inputs: the Rotate button (click, tap, Enter, Space), Right Arrow anywhere in the stack
 * region, a horizontal swipe on the front card in either direction, and a click or tap on a
 * peeking card (a pointer shortcut: back cards stay inert, so keyboard users rotate). One move
 * during another is queued; more are ignored, so cards never jump. In Overnote's Sticky mode
 * Overnote takes the click, so a click pins a note instead of bringing a card forward.
 * Reduced motion: the same sequence, shorter (about 300ms legs), with no tilt or overshoot.
 *
 * When a card lands: back cards get inert + aria-hidden, the live region announces the scene
 * with the moment's own card label ("Scene 2 of 3: Community"), and `viz:statechange` fires
 * so Overnote and the pipe refresh.
 */
const region = document.getElementById('moment-visual');
const deck = region?.querySelector('.card-stack__deck');
const next = region?.querySelector('.stack-next');
const announcer = region?.querySelector('.stack-announcer');
// DOM order is the default front-to-back order, so it also gives each scene's number.
const cards = deck ? [...deck.querySelectorAll('.stack-card')] : [];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const IDENTITY = 'matrix(1, 0, 0, 1, 0, 0)';
// Pointer travel before a press counts as a drag rather than a tap.
const DRAG_START = 8;

let busy = false;
let queued = null;
let drag = null;
let tap = null;

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

/* ---- Moves and the one-deep queue -------------------------------------------------------- */

/** A move: rotate ({ rotate: direction }) or bring a card forward ({ front: card }). */
function request(move) {
  if (busy) {
    queued ??= move;
    return;
  }
  run(move);
}

/** Runs one move, then the queued one if any. A failure never leaves the stack locked. */
async function run(move, fromX = 0) {
  busy = true;
  clearPeekHover();
  try {
    const order = bySlot();
    if (move.front) {
      const index = order.indexOf(move.front);
      // Already in front (a queued click that an earlier move made moot): nothing to do.
      if (index > 0) {
        const finalOrder = [move.front, ...order.filter((card) => card !== move.front)];
        // Community peeks from the left (slot 1), Policy from the upper right (slot 2).
        await animateMove(move.front, index === 1 ? -1 : 1, finalOrder, 0);
      }
    } else {
      const [front, ...rest] = order;
      await animateMove(front, move.rotate, [...rest, front], fromX);
    }
  } finally {
    busy = false;
  }
  if (queued !== null) {
    const nextMove = queued;
    queued = null;
    run(nextMove);
  }
}

/**
 * Moves one card out of the deck sideways, shifts the others into their slots in finalOrder,
 * changes depth only at the apex, then slides the card into its own new slot.
 */
async function animateMove(mover, direction, finalOrder, fromX) {
  const t = readTokens();
  const reduced = REDUCED.matches;
  const leg = reduced ? t.legReduced : t.leg;
  const offset = reduced ? t.offsetReduced : t.offset;
  const tilt = reduced ? 0 : t.tilt * direction;
  const timing = { duration: leg, easing: t.easing, fill: 'both' };

  const order = bySlot();
  mover.style.transform = '';
  const rests = order.map(restTransform); // the rest transform of each slot
  const from = order.indexOf(mover);
  const to = finalOrder.indexOf(mover);

  // How far the card must travel for its frame to clear every slot the deck occupies (the
  // shifting cards only ever move between those slots). Its own rest rect is measured without
  // any swipe offset; the tilt widens its bounding box, so that is added to the margin.
  const frames = order.map((card) => card.getBoundingClientRect());
  const own = frames[from];
  const margin =
    t.gap + own.height * Math.abs(Math.sin((tilt * Math.PI) / 180)) + (reduced ? 0 : own.width * t.overshoot);
  const dx =
    direction > 0
      ? Math.max(...frames.map((r) => r.right)) - own.left + margin
      : Math.min(...frames.map((r) => r.left)) - own.right - margin;

  // 1. Pull out, keeping the card's own slot scale while it travels.
  mover.classList.add('is-pulled');
  const out = `translateX(${dx}px) rotate(${tilt}deg) ${rests[from]}`;
  const pull = mover.animate(
    [{ transform: `translateX(${fromX}px) rotate(0deg) ${rests[from]}` }, { transform: out }],
    timing,
  );

  // 2. Shift the others to their new slots, starting one offset later. Their order relative to
  //    each other never changes, so none of them passes through another.
  const shifts = order
    .filter((card) => card !== mover && finalOrder.indexOf(card) !== order.indexOf(card))
    .map((card) =>
      card.animate(
        [{ transform: rests[order.indexOf(card)] }, { transform: rests[finalOrder.indexOf(card)] }],
        { ...timing, delay: offset },
      ),
    );

  await pull.finished;

  // 3. Re-stack at the apex: the moving card is clear of the deck, so depth changes now.
  //    Running animations hold every card where it is; only z-order changes.
  finalOrder.forEach((card, slot) => (card.dataset.slot = String(slot)));
  mover.classList.remove('is-pulled');

  // 4. Slide in to the new slot.
  const settle = mover.animate([{ transform: out }, { transform: rests[to] }], timing);
  pull.cancel();

  await Promise.all([settle.finished, ...shifts.map((a) => a.finished)]);
  // The CSS rest positions now match where every animation ended, so dropping them is seamless.
  [settle, ...shifts].forEach((a) => a.cancel());
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
  // The label is the moment's own (authored per moment); skeleton pages have none yet.
  const label = front.dataset.label;
  announcer.textContent = `Scene ${cards.indexOf(front) + 1} of ${cards.length}${label ? `: ${label}` : ''}`;
  document.dispatchEvent(
    new CustomEvent('viz:statechange', { detail: { card: front.dataset.card, source: 'card-stack' } }),
  );
}

/* ---- Pointer: which card is under the pointer -------------------------------------------
 * Back cards are inert, so pointer events never land on them. The deck works out from
 * geometry which card is visible at a point: the first card, front to back, whose backplate
 * or art layers contain it. */

function cardAt(x, y) {
  const inside = (el) => {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  return (
    bySlot().find((card) =>
      [card.querySelector('.stack-card__backplate'), ...card.querySelectorAll('.stack-card__layer')].some(inside),
    ) ?? null
  );
}

/* Peeking cards: a pointer cursor and a slight lift on hover (pointer devices). */
function setPeekHover(card) {
  for (const c of cards) c.toggleAttribute('data-peek-hover', c === card);
  deck.toggleAttribute('data-peek-hover', Boolean(card));
}

function clearPeekHover() {
  setPeekHover(null);
}

/* ---- Swipe on the front card, tap on a peeking card --------------------------------------
 * On the front card the card follows the pointer horizontally; past --viz-stack-swipe-min it
 * is thrown that way (the pull continues from where the finger let go), otherwise it springs
 * back. Vertical movement is left to the page (touch-action: pan-y). A press on a peeking
 * card that doesn't travel is a tap; its click brings that card to the front. */

function endDrag(event, { cancelled = false } = {}) {
  if (!drag || event.pointerId !== drag.id) return;
  const { card, dx, active } = drag;
  drag = null;
  if (!active) return;
  const t = readTokens();
  if (!cancelled && Math.abs(dx) >= t.swipeMin && !busy) {
    run({ rotate: Math.sign(dx) }, dx);
    return;
  }
  card.style.transform = '';
  card.animate([{ transform: `translateX(${dx}px)` }, { transform: IDENTITY }], {
    duration: REDUCED.matches ? t.offsetReduced : t.legReduced,
    easing: t.easing,
  });
}

function initPointer() {
  deck.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const card = cardAt(event.clientX, event.clientY);
    tap = card && card.dataset.slot !== '0' ? { id: event.pointerId, card, x0: event.clientX, y0: event.clientY } : null;
    if (busy || !card || card.dataset.slot !== '0') return;
    drag = { id: event.pointerId, card, x0: event.clientX, y0: event.clientY, dx: 0, active: false };
  });

  deck.addEventListener('pointermove', (event) => {
    if (tap && event.pointerId === tap.id && Math.hypot(event.clientX - tap.x0, event.clientY - tap.y0) > DRAG_START) {
      tap = null;
    }
    if (!drag || event.pointerId !== drag.id) {
      if (event.pointerType === 'mouse' && !busy) {
        const card = cardAt(event.clientX, event.clientY);
        setPeekHover(card && card.dataset.slot !== '0' ? card : null);
      }
      return;
    }
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
  deck.addEventListener('pointercancel', (event) => {
    tap = null;
    endDrag(event, { cancelled: true });
  });
  deck.addEventListener('pointerleave', clearPeekHover);

  // A click, not pointerup, so Overnote's Sticky mode (which takes clicks) wins.
  deck.addEventListener('click', () => {
    if (!tap) return;
    const { card } = tap;
    tap = null;
    request({ front: card });
  });

  // Dragging an image or selecting text would fight the swipe.
  deck.addEventListener('dragstart', (event) => event.preventDefault());
}

if (deck && next && announcer && cards.length) {
  next.addEventListener('click', () => request({ rotate: 1 }));
  region.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    request({ rotate: 1 });
  });
  initPointer();
}
