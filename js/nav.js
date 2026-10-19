/**
 * Global nav (REQUIREMENTS §4.1). Renders the Moments and Levers disclosure menus from
 * site-data.js into <nav data-nav-root> so every page shares one source.
 *
 * - Desktop/tablet: two disclosure menus beside the logo.
 * - Mobile (< 640px): one "Explore" button opens a sheet holding both menus, expanded.
 * - Keyboard: Enter/Space opens (focus moves into the list), arrows/Home/End move,
 *   Esc closes and returns focus. Outside click or tabbing away closes.
 * - Levers menu (this phase): never marks a lever as selected. Choosing one opens a modal
 *   dialog explaining that it will lead to a lever summary page (§2.4); the page's own lever
 *   selection is untouched. Items stay real links so a later phase only changes their href
 *   to /levers/<slug>/ and drops the dialog.
 */
import { LEVERS, MOMENTS, momentHref } from './site-data.js';

const MOBILE = window.matchMedia('(max-width: 639px)');

const CHEVRON =
  '<svg class="nav-menu__chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK =
  '<svg class="nav-menu__check" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function el(tag, attrs = {}, html = '') {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value != null && value !== false) node.setAttribute(key, value === true ? '' : value);
  }
  if (html) node.innerHTML = html;
  return node;
}

function buildMenu(id, label, items) {
  const wrap = el('div', { class: 'nav-menu', 'data-menu': id });
  const button = el('button', {
    class: 'nav-menu__button',
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': `nav-menu-${id}`,
  });
  button.append(el('span', {}, label));
  button.insertAdjacentHTML('beforeend', CHEVRON);
  const list = el('ul', { class: 'nav-menu__list', id: `nav-menu-${id}`, 'aria-label': label });
  for (const item of items) {
    const li = el('li');
    const a = el('a', { class: 'nav-menu__item', href: item.href, ...item.attrs });
    a.insertAdjacentHTML('beforeend', CHECK);
    const text = el('span', { class: 'nav-menu__label' });
    text.textContent = item.label;
    a.append(text);
    if (item.note) {
      const note = el('span', { class: 'nav-menu__note' });
      note.textContent = item.note;
      a.append(note);
    }
    li.append(a);
    list.append(li);
  }
  wrap.append(button, list);
  return { wrap, button, list };
}

export function initNav() {
  const root = document.querySelector('[data-nav-root]');
  if (!root) return;
  const current = document.body.dataset.moment;

  const moments = buildMenu(
    'moments',
    'Moments',
    MOMENTS.map((m) => ({
      label: m.label,
      href: momentHref(m.slug),
      note: m.state === 'skeleton' ? '(in development)' : '',
      attrs: { 'aria-current': m.slug === current ? 'page' : null, 'data-slug': m.slug },
    })),
  );
  const levers = buildMenu(
    'levers',
    'Levers',
    LEVERS.map((l) => ({
      label: l.label,
      href: `?lever=${l.slug}`,
      attrs: { 'data-lever': l.slug, title: l.definition },
    })),
  );

  const explore = el('button', {
    class: 'nav-explore',
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': 'nav-sheet',
  });
  explore.append(el('span', {}, 'Explore'));
  explore.insertAdjacentHTML('beforeend', CHEVRON);
  const sheet = el('div', { class: 'nav-sheet', id: 'nav-sheet' });
  sheet.append(moments.wrap, levers.wrap);
  root.replaceChildren(explore, sheet);

  const menus = [moments, levers];
  const items = (menu) => [...menu.list.querySelectorAll('.nav-menu__item')];

  function setMenu(menu, open) {
    menu.button.setAttribute('aria-expanded', String(open));
    menu.wrap.classList.toggle('is-open', open);
  }

  function setSheet(open) {
    explore.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-sheet-open', open);
    // In the sheet both menus are shown expanded (§4.1: "opens both menus in a sheet").
    menus.forEach((m) => setMenu(m, open));
  }

  function closeAll({ focus } = {}) {
    if (MOBILE.matches) {
      if (explore.getAttribute('aria-expanded') === 'true') {
        setSheet(false);
        if (focus) explore.focus();
      }
      return;
    }
    const open = menus.find((m) => m.button.getAttribute('aria-expanded') === 'true');
    menus.forEach((m) => setMenu(m, false));
    if (focus && open) open.button.focus();
  }

  function openMenu(menu, { focusItem } = {}) {
    menus.forEach((m) => setMenu(m, m === menu));
    if (focusItem) {
      const list = items(menu);
      const target =
        focusItem === 'last'
          ? list[list.length - 1]
          : list.find((a) => a.hasAttribute('aria-current')) ?? list[0];
      target?.focus();
    }
  }

  for (const menu of menus) {
    menu.button.addEventListener('click', (event) => {
      const isOpen = menu.button.getAttribute('aria-expanded') === 'true';
      if (isOpen) return setMenu(menu, false);
      // event.detail === 0 means the click came from Enter/Space: move focus into the list.
      openMenu(menu, { focusItem: event.detail === 0 ? 'first' : null });
    });

    menu.button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openMenu(menu, { focusItem: 'first' });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openMenu(menu, { focusItem: 'last' });
      }
    });

    menu.list.addEventListener('keydown', (event) => {
      const list = items(menu);
      const index = list.indexOf(document.activeElement);
      let next = null;
      if (event.key === 'ArrowDown') next = list[(index + 1) % list.length];
      else if (event.key === 'ArrowUp') next = list[(index - 1 + list.length) % list.length];
      else if (event.key === 'Home') next = list[0];
      else if (event.key === 'End') next = list[list.length - 1];
      if (next) {
        event.preventDefault();
        next.focus();
      }
    });
  }

  explore.addEventListener('click', (event) => {
    const open = explore.getAttribute('aria-expanded') !== 'true';
    setSheet(open);
    if (open && event.detail === 0) items(moments)[0]?.focus();
  });

  // Esc closes the open menu (or the sheet) and returns focus to its button.
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAll({ focus: true });
    }
  });

  // Outside click and tabbing away both close.
  document.addEventListener('pointerdown', (event) => {
    if (!root.contains(event.target)) closeAll();
  });
  root.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !root.contains(event.relatedTarget)) closeAll();
  });

  // Switching between the mobile sheet and desktop menus resets everything to closed.
  MOBILE.addEventListener('change', () => {
    setSheet(false);
    menus.forEach((m) => setMenu(m, false));
  });

  // Levers menu: explain the planned lever pages in a dialog instead of selecting anything.
  const dialog = buildLeverDialog();
  let returnFocus = null;
  levers.list.addEventListener('click', (event) => {
    const link = event.target.closest('[data-lever]');
    if (!link) return;
    event.preventDefault();
    returnFocus = MOBILE.matches ? explore : levers.button;
    closeAll();
    dialog.querySelector('.lever-dialog__title').textContent = link.querySelector('.nav-menu__label').textContent;
    dialog.showModal();
  });
  dialog.addEventListener('close', () => returnFocus?.focus());
}

/** A native modal <dialog>: focus is trapped, Esc closes, and it sits in the top layer. */
function buildLeverDialog() {
  const dialog = el('dialog', { class: 'lever-dialog', 'aria-labelledby': 'lever-dialog-title' });
  dialog.innerHTML = `
    <form method="dialog" class="lever-dialog__body">
      <h2 id="lever-dialog-title" class="lever-dialog__title"></h2>
      <p>Selecting a lever would present a page with a summary of the lever capabilities along with a consolidated list of the required capabilities associated with each moment.</p>
      <button class="lever-dialog__close" type="submit" autofocus>OK</button>
    </form>`;
  // A click on the backdrop (outside the body) closes it too.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.body.append(dialog);
  return dialog;
}

initNav();
