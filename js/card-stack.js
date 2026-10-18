/**
 * Panel 1 card stack (REQUIREMENTS §4.3).
 *
 * Stage 1 frame: the Next button cycles the placeholder cards by re-assigning data-slot
 * (front → back) with no animation, keeps aria-hidden/inert on the back cards, and announces
 * the new front card in the visually hidden live region ("Scene 2 of 3: Community").
 * Stage 2 replaces the instant swap with the real-card flip, Right Arrow, swipe and queueing.
 */
const stack = document.getElementById('moment-visual');
const next = stack?.querySelector('.stack-next');
const announcer = stack?.querySelector('.stack-announcer');
const cards = stack ? [...stack.querySelectorAll('.stack-card')] : [];

// Cards are in default front-to-back order in the DOM; that order gives the "n of 3" position.

function front() {
  return cards.find((card) => card.dataset.slot === '0');
}

function advance() {
  for (const card of cards) {
    const slot = (Number(card.dataset.slot) + cards.length - 1) % cards.length;
    card.dataset.slot = String(slot);
    const isFront = slot === 0;
    card.toggleAttribute('inert', !isFront);
    if (isFront) card.removeAttribute('aria-hidden');
    else card.setAttribute('aria-hidden', 'true');
  }
  const card = front();
  announcer.textContent = `Scene ${cards.indexOf(card) + 1} of ${cards.length}: ${card.dataset.label}`;
  document.dispatchEvent(new CustomEvent('viz:statechange', { detail: { card: card.dataset.card, source: 'card-stack' } }));
}

if (next && announcer && cards.length) next.addEventListener('click', advance);
