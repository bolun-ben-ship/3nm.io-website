/* js/page.js: the subpages' reveal layer (case-studies.html, faq.html). No imports, no Lenis, no GSAP.

   html.rm   reduced motion (prefers-reduced-motion or ?static=1): every .reveal shown outright.
   html.rv   set only when .reveal elements exist and motion is allowed; site.css hides .reveal under
             html.js.rv:not(.rm) until .is-in lands.
   .is-in    added once per element by an IntersectionObserver (rootMargin '0px 0px -20% 0px',
             the brand's "top 80%" trigger). Never removed: reveal once, no re-animate on scroll-back.
   Backstop  3 s after start, every .reveal whose top sits above the fold line gets .is-in, so nothing
             above the fold is ever left hidden (an observer that never fires, a tab opened in the
             background). Without an IntersectionObserver nothing is hidden at all. */

const root = document.documentElement;
const params = new URLSearchParams(location.search);
const reduced = params.has('static') ||
  (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

function start() {
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (reduced) {
    root.classList.add('rm');
    return;
  }
  if (!items.length || !('IntersectionObserver' in window)) return;

  const show = (el) => el.classList.add('is-in');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      show(e.target);
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0 });

  // Anything already above the fold line at start is shown in the same frame the hiding class lands.
  const fold = innerHeight * 0.8;
  for (const el of items) {
    if (el.getBoundingClientRect().top < fold) show(el);
    else io.observe(el);
  }
  root.classList.add('rv');

  // A hash arrival (case-studies#family-office) lands mid-page: show what the reader lands on.
  addEventListener('hashchange', () => sweep(), { passive: true });

  function sweep() {
    const line = innerHeight;
    for (const el of items) {
      if (el.classList.contains('is-in')) continue;
      if (el.getBoundingClientRect().top < line) { show(el); io.unobserve(el); }
    }
  }
  setTimeout(sweep, 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
