// #book: book a call with Ben over WhatsApp. Adapted from the live site's lens/js/book.js (same fields, same
// validation, same prefilled wa.me message and dataLayer event); the Lenis landing code is dropped because this
// page uses native scroll.
//
// Tracking: a valid submit pushes { event: 'book_whatsapp_click', page_path, has_note } to dataLayer, never the name,
// email or note. GA4 forwarding needs a GTM Custom Event trigger for book_whatsapp_click (a manual step in the GTM UI).

const form = document.getElementById('book-form');

const WA = '6591288687';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function waUrl(v) {
  const lines = [
    "Hi Ben, I'd like to book a free 30-minute call. (via 3nm.io)",
    'Name: ' + v.name,
    'Email: ' + v.email,
    'The one thing eating my week: ' + (v.note || '-'),
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

  const errOf = (ctrl) => document.getElementById(ctrl.id + '-err');
  function setErr(ctrl, msg) {
    if (!ctrl) return;
    const p = errOf(ctrl);
    if (msg) ctrl.setAttribute('aria-invalid', 'true');
    else ctrl.removeAttribute('aria-invalid');
    if (p) p.textContent = msg || '';
  }

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

  const val = (ctrl) => (ctrl ? ctrl.value.trim() : '');
  let lastSent = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (Date.now() - lastSent < 1500) return;   // a double-click is one booking, not three
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
    lastSent = Date.now();
    // inside the submit handler, so it counts as the user's gesture and is not popup-blocked.
    // A sandboxed frame may return null or throw; the status line below carries a real link either way.
    try { window.open(url, '_blank', 'noopener'); } catch (err) { /* fall through to the link */ }

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
  });

  // every "Book a 30-minute call" lands on the form and moves focus to its heading
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest ? e.target.closest('a[href="#book"]') : null;
    if (!a || !book) return;
    e.preventDefault();
    (window.dataLayer = window.dataLayer || []).push({ event: 'cta_click', cta: a.getAttribute('data-cta') || 'link', page_path: location.pathname });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const r of book.querySelectorAll('.reveal')) r.classList.add('is-in');
    book.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    if (heading) heading.focus({ preventScroll: true });
    try { history.replaceState(null, '', '#book'); } catch (err) { /* sandboxed preview */ }
  });
}
