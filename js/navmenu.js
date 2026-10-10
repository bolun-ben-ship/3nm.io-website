/* navmenu.js — the phone "Menu" in the nav (2026-10-10, with How it works added to the site nav).
   The menu is a native <details>, so it opens and closes with no JS at all. This only adds what <details>
   lacks: Escape closes it (focus back on "Menu"); a tap outside it, a tap on one of its links, focus moving
   out of it, or the page scrolling more than 40px closes it (so the sheet never sits over content the reader
   has moved on to, and never changes colour under the film's light/dark nav).
   Used by every page: the homepage styles it in home/page.css, the rest in css/site.css. */
(function () {
  'use strict';
  var menu = document.querySelector('.nav__menu');
  if (!menu) return;
  var summary = menu.querySelector('summary');
  function close(refocus) {
    if (!menu.open) return;
    menu.open = false;
    if (refocus && summary) summary.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.open) close(menu.contains(document.activeElement));
  });
  document.addEventListener('pointerdown', function (e) {
    if (menu.open && !menu.contains(e.target)) close(false);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.nav__sheet a')) close(false);
  });
  menu.addEventListener('focusout', function (e) {
    if (menu.open && e.relatedTarget && !menu.contains(e.relatedTarget)) close(false);
  });
  var openedAt = 0;
  menu.addEventListener('toggle', function () { if (menu.open) openedAt = window.scrollY; });
  window.addEventListener('scroll', function () {
    if (menu.open && Math.abs(window.scrollY - openedAt) > 40) close(false);
  }, { passive: true });
  // the film's bar switches light/dark as it scrolls; an open sheet closes rather than change colour under the reader
  var bar = menu.closest('.nav');
  if (bar && 'MutationObserver' in window) {
    new MutationObserver(function () { close(false); }).observe(bar, { attributes: true, attributeFilter: ['data-theme'] });
  }
})();
