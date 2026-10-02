// LENS: #book, book a call with Ben over WhatsApp (FIX-PLAN-R7 P3).
// Owns: the form's validation, the prefilled wa.me link, every a[href="#book"] click, and the landing on #book when the
// page loads with that hash (a "Book a call" on case-studies / faq goes to ./#book). main.js's runway anchor handler
// returns without preventDefault for #book. No colours live here: css/site.css styles the form from tokens.
//
// Tracking: a valid submit pushes { event: 'book_whatsapp_click', page_path, has_note } to dataLayer, never the name,
// email or note. GA4 forwarding needs a GTM Custom Event trigger for book_whatsapp_click (a manual step in the GTM UI).
// The old book_submit event is retired with the mailto form.

const form = document.getElementById('book-form');

const WA = '6591288687';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HASH_WAIT_MS = 4000;

// the prefilled WhatsApp message; the first line is how Ben knows it came from the site
function waUrl(v) {
  const lines = [
    "Hi Ben, I'd like to book a free 30-minute call. (via 3nm.io)",
    'Name: ' + v.name,
    'Email: ' + v.email,
    'The one thing eating my week: ' + (v.note || '—'),
  ];
  return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

if (form) init();

function init() {
  const book = document.getElementById('book');
  const heading = document.getElementById('book-h');
  const status = form.querySelector('.book__status');
  const f = {
    name: document.getElementById('book-name'),
    email: document.getElementById('book-email'),
    note: document.getElementById('book-note'),
  };
  const REQUIRED = ['name', 'email'];

  // ---- errors ---------------------------------------------------------------------------------------
  const errOf = (ctrl) => document.getElementById(ctrl.id + '-err');
  function setErr(ctrl, msg) {
    if (!ctrl) return;
    const p = errOf(ctrl);
    if (msg) ctrl.setAttribute('aria-invalid', 'true');
    else ctrl.removeAttribute('aria-invalid');
    if (p) p.textContent = msg || '';
  }

  // the "N fields need a look." line follows the fixes: it counts down as errors clear and empties at 0,
  // so it never reports problems over a form that has none left
  const needs = (n) => n + ' ' + (n === 1 ? 'field needs' : 'fields need') + ' a look.';
  let flagged = false;
  function recount() {
    if (!flagged || !status) return;
    let n = 0;
    for (const key of REQUIRED) if (f[key] && f[key].getAttribute('aria-invalid') === 'true') n++;
    status.textContent = n ? needs(n) : '';
    if (!n) flagged = false;
  }

  for (const key of REQUIRED) {
    const ctrl = f[key];
    if (!ctrl) continue;
    const clear = () => { if (ctrl.getAttribute('aria-invalid') === 'true') { setErr(ctrl, ''); recount(); } };
    ctrl.addEventListener('input', clear);
    ctrl.addEventListener('change', clear);
  }

  // ---- submit ---------------------------------------------------------------------------------------
  const val = (ctrl) => (ctrl ? ctrl.value.trim() : '');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = { name: val(f.name), email: val(f.email), note: val(f.note) };
    const checks = [
      [f.name, v.name ? '' : 'Add your name.'],
      [f.email, EMAIL_RE.test(v.email) ? '' : 'Check the email address.'],
    ];
    let first = null;
    let n = 0;
    for (const [ctrl, msg] of checks) {
      setErr(ctrl, msg);
      if (msg) { n++; if (!first) first = ctrl; }
    }
    if (n) {
      flagged = true;
      if (status) status.textContent = needs(n);
      if (first) first.focus();
      return;
    }
    flagged = false;

    const url = waUrl(v);
    // inside the submit handler, so it counts as the user's gesture and is not popup-blocked
    window.open(url, '_blank', 'noopener');

    if (status) {
      status.textContent = 'WhatsApp should open with your message ready. Just press send.';
      const alt = el('span', 'book__status-alt', 'Nothing opened? ');
      const a = el('a', 'mono-link', 'wa.me/' + WA);
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      alt.appendChild(a);
      status.appendChild(alt);
    }

    (window.dataLayer = window.dataLayer || []).push({
      event: 'book_whatsapp_click', page_path: location.pathname, has_note: v.note ? 1 : 0,
    });
    // the fields keep their values, so a reader who closes WhatsApp can send it again
  });

  // ---- every "Book a call" lands here ---------------------------------------------------------------
  const navH = () => document.getElementById('nav')?.offsetHeight || 64;
  // Lenis already subtracts #book's scroll-margin-top (= --nav-h in site.css), so only the remainder is offset;
  // a plain -navH would land the section one nav-height too low
  const marginOffset = () => (parseFloat(getComputedStyle(book).scrollMarginTop) || 0) - navH();

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest ? e.target.closest('a[href="#book"]') : null;
    if (!a || !book) return;
    e.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.classList.contains('rm');
    const lenis = window.__lens?.lenis;
    if (!reduced && lenis) lenis.scrollTo(book, { offset: marginOffset(), duration: 1.1 });
    else book.scrollIntoView({ block: 'start' });
    if (heading) heading.focus({ preventScroll: true });
  });

  // ---- arriving on ./#book from another page (FIX-PLAN-R7 P3.6) ----------------------------------------
  // An inline script at the end of index.html's body has already put #book at the top, so main.js booted there and
  // skipped the load intro. The stage, the fonts and the layout settle after that and can leave the landing short, so
  // land again once LENS is ready (or after HASH_WAIT_MS, whichever is first). The heading takes focus as soon as the
  // page has loaded, so a keyboard or screen-reader user starts in the form; a reader who scrolls, types or clicks
  // before the re-land is left where they are.
  if (location.hash === '#book' && book) {
    let moved = false;
    const stop = () => { moved = true; };
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    for (const t of evs) window.addEventListener(t, stop, { passive: true, once: true });
    // the browser's own fragment step blurs whatever has focus as the page finishes loading, so the heading takes
    // focus once that has run (load, then a frame), and again after the re-land below
    const focusFree = () => {
      const el = document.activeElement;
      if (heading && (!el || el === document.body || el === heading)) heading.focus({ preventScroll: true });
    };
    const afterLoad = () => requestAnimationFrame(() => { if (!moved) focusFree(); });
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([Promise.race([window.__lens?.ready, wait(HASH_WAIT_MS)]), fonts]).then(() => {
      for (const t of evs) window.removeEventListener(t, stop);
      if (moved || location.hash !== '#book') return;
      const lenis = window.__lens?.lenis;
      if (lenis) lenis.scrollTo(book, { offset: marginOffset(), immediate: true, force: true });
      else book.scrollIntoView({ block: 'start' });
      focusFree();
    });
  }
}
