/**
 * Overnote setup (REQUIREMENTS §9). The only setup module, and the only file that changes
 * when Overnote's Supabase adapter ships. js/overnote.js is vendored unmodified.
 */
import Overnote from './overnote.js';
import { MOMENTS, LEVERS } from './site-data.js';

const REVIEWER_KEY = 'rare-viz:reviewer';
const FALLBACK_AUTHOR = 'Reviewer';
const STORAGE_PREFIX = 'overnote:';
// Site root path ('/' locally, '/rare-strategy-system-viz/' on GitHub Pages), derived from this
// module's own URL.
const SITE_ROOT = new URL('../', import.meta.url).pathname;
// This site's pages (moments now; lever pages are reserved for later, REQUIREMENTS §2.4). Review
// exports include only these, so another Overnote project served earlier from the same origin
// (e.g. localhost:8000) never leaks into a review file.
const SITE_PAGES = new Set([
  ...MOMENTS.map((m) => `moments/${m.slug}/`),
  ...LEVERS.map((l) => `levers/${l.slug}/`),
]);
const pageOf = (path) => path.slice(SITE_ROOT.length).replace(/index\.html$/, '');
const isSitePage = (path) => path.startsWith(SITE_ROOT) && SITE_PAGES.has(pageOf(path));

function readReviewer() {
  try {
    return localStorage.getItem(REVIEWER_KEY);
  } catch {
    return null;
  }
}

function saveReviewer(name) {
  try {
    localStorage.setItem(REVIEWER_KEY, name);
  } catch {
    /* Storage blocked: the name lasts for this page view only. */
  }
}

const overnote = new Overnote({
  author: readReviewer() || FALLBACK_AUTHOR,
  storageKey: `overnote:${location.pathname}`, // one key per moment page; lever state is a query param
  ignore: '#global-nav, .site-header__logo-tab, .lever-dialog, .stack-controls, .lever-scroll-btn, .review-tools',
  position: 'bottom-right',
});

overnote.init();
window.overnote = overnote;

// Ask for a reviewer name once, the first time someone starts annotating (not on page load,
// so visitors who only read the page are never prompted).
overnote.on('modechange', ({ mode }) => {
  if (mode === 'off' || readReviewer() !== null) return;
  const name = (window.prompt('Your name for review comments?', '') || '').trim() || FALLBACK_AUTHOR;
  saveReviewer(name);
  overnote.options.author = name;
});

// Re-anchor annotations whenever the page swaps lever or card state.
document.addEventListener('viz:statechange', () => overnote.refresh());

/* ---- Review export ------------------------------------------------------------------------
 * One JSON file holding every comment saved in this browser across all of this site's pages,
 * for handing to the next stage's Claude Code session (see reviews/README.md). Annotations live
 * in localStorage, one key per page, so the current page's live state is read from Overnote and
 * every other page's from storage. */

function storedPagePaths() {
  const paths = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(STORAGE_PREFIX)) continue;
      const path = key.slice(STORAGE_PREFIX.length);
      if (isSitePage(path)) paths.push(path);
    }
  } catch {
    /* Storage blocked: only the current page can be exported. */
  }
  return paths;
}

function readStoredAnnotations(path) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + path));
    return Array.isArray(data?.annotations) ? data.annotations : [];
  } catch {
    return [];
  }
}

export function collectReview() {
  const paths = new Set([...storedPagePaths(), location.pathname]);
  const pages = [...paths]
    .sort()
    .map((path) => ({
      page: pageOf(path),
      annotations: path === location.pathname ? overnote.exportAnnotations().annotations : readStoredAnnotations(path),
    }))
    .filter(({ annotations }) => annotations.length);
  const commentCount = pages.reduce(
    (sum, { annotations }) => sum + annotations.reduce((n, a) => n + (a.comments?.length || 0), 0),
    0
  );
  return {
    format: 'rare-viz-review',
    version: 1,
    site: location.origin + SITE_ROOT,
    exportedAt: new Date().toISOString(),
    reviewer: readReviewer() || FALLBACK_AUTHOR,
    pageCount: pages.length,
    commentCount,
    pages,
  };
}

function downloadJson(data, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function mountReviewTools() {
  const footer = document.querySelector('#site-footer .site-footer__inner');
  if (!footer) return;

  const tools = document.createElement('div');
  tools.className = 'review-tools';
  const button = Object.assign(document.createElement('button'), {
    type: 'button',
    className: 'review-tools__export',
    textContent: 'Export review',
  });
  const status = Object.assign(document.createElement('span'), { className: 'review-tools__status' });
  status.setAttribute('role', 'status');
  tools.append(button, status);
  footer.insertBefore(tools, footer.querySelector('.site-footer__meta'));

  button.addEventListener('click', () => {
    const review = collectReview();
    if (!review.commentCount) {
      status.textContent = 'No comments to export yet.';
      return;
    }
    const date = review.exportedAt.slice(0, 10);
    downloadJson(review, `review-${date}.json`);
    const pages = review.pageCount === 1 ? 'page' : 'pages';
    const comments = review.commentCount === 1 ? 'comment' : 'comments';
    status.textContent = `Exported ${review.commentCount} ${comments} from ${review.pageCount} ${pages}. Save it in reviews/stage-N/.`;
  });
}

mountReviewTools();
