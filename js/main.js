// LENS — main.js. Owner: E-timeline.
// Boot: Lenis, scroll -> pos, the cut position, ONE ticker that drives the stage, DOM reveals,
// progress rail, nav flip, analytics events, reduced motion, and the debug hooks tools/shoot.mjs uses:
// window.__lens = { pos, ready, stage, guides, lenis, scrollToPos(p), setClock(t) }; query ?pos=<p>, ?clock=<s>
// (setClock / ?clock freeze the scene clock that drives the walls, the people and the beat; null = live).
// __lens.guides (FIX-PLAN-R6 S2.1): the guides' api (js/guides.js via the stage: seek, freeze), null without guides.
//
// DOM HOOKS (matched to the existing index.html / css/site.css; every hook is optional and null-guarded)
//   html classes set here : rv (arms reveals), stage-on (after the stage's first frame), gl / no-gl + no-webgl,
//                           rm + reduced (reduced motion or ?static=1), no-guides with no-gl (the stage sets it
//                           itself when guides.js is absent, fails or ?noguides=1)
//   canvas#stage           the WebGL canvas
//   section[data-key][data-hold]   the ten runways, sorted by data-key
//   #night                 wraps #intro..#close + footer; its top edge is the day/night cut
//   #nav[data-theme]       flipped 'light' <-> 'dark' when the seam passes the nav's bottom edge; with it
//                          (FIX-PLAN-R3 S10 M14) html[data-theme] and meta[name=theme-color] (that theme's --rc-e0,
//                          read once at boot from #hero (light) and #night (dark); no literals)
//   #nav[data-cta]         'on' | 'off' (FIX-PLAN-R2 m13, R3 S12): 'off' while #close or #book is at least 50 %
//                          visible, so the page shows one CTA; set by an IntersectionObserver, also under reduced
//                          motion; the CSS is site.css. Without IntersectionObserver, #close and #book it stays 'on'.
//   #compare               (FIX-PLAN-R6 S1) the first proof section, the first thing after the runway: the pinned
//                          layer copy and the rail give way to it (tailK), and the stage's veil rises over its first
//                          half viewport (stage.setVeil); falls back to #book for tailK, and no veil without it
//   #book                  the booking form (PAGE, js/book.js): no data-key / data-hold, so it is not a runway and
//                          pos stays clamped at 9 over it; its a[href="#book"] clicks pass through untouched here
//   #rail.is-on            shown for pos 0.9 .. 7.5 (FIX-PLAN-R3 S10 M11: off through the pull-out and the close);
//                          .rail__item[data-state] + aria-current="step" on the live one
//   .hero__copy            (FIX-PLAN-R3 S11 m6) opacity 1 -> 0 as the #night top moves from .75 to .50 of the
//                          viewport height; opacity only, skipped under reduced motion
//   .reveal                gets .is-in once, when its natural position crosses 80 % of the viewport. Inside a
//                          .copy block the block reveals as a group (FIX-PLAN-R2 m6a): the first due .reveal adds
//                          .is-in to every .reveal of that .copy; the CSS --i stagger keeps the order
//   .system__row[data-row] data-state ahead | live | done: 'ahead' until the re-light; while it runs
//                          (listLive >= 0, thread.head < 1) rows below listLive 'done', listLive 'live',
//                          the rest 'ahead'; from RELIGHT_B (listLive 5, head 1) every row 'done'
//   [data-cta]             (optional) cta_click location; mailto: links are tracked too
//   h1 rise                CSS-owned (.h1-line animation in site.css), nothing to do here
import { stateAt } from './timeline.js';

const html = document.documentElement;
const qs = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.get('static') === '1';
const dl = (window.dataLayer = window.dataLayer || []);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

if (reduced) html.classList.add('rm', 'reduced');

// ---- brand ease: cubic-bezier(0.23, 1, 0.32, 1) (--rc-ease-out) -------------------------------
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t) => ((ax * t + bx) * t + cx) * t;
  const Y = (t) => ((ay * t + by) * t + cy) * t;
  const dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = X(t) - x;
      if (Math.abs(e) < 1e-6) return Y(t);
      const d = dX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const e = X(t) - x;
      if (Math.abs(e) < 1e-6) break;
      if (e > 0) hi = t; else lo = t;
      t = (lo + hi) / 2;
    }
    return Y(t);
  };
}
const brandEase = bezier(0.23, 1, 0.32, 1);

// ---- elements ------------------------------------------------------------------------------
const canvas = $('#stage');
const nav = $('#nav') || $('[data-nav]');
const railEl = $('#rail') || $('[data-rail]');
const railItems = railEl ? $$('.rail__item', railEl) : [];
const night = $('#night');
const sysRows = $$('.system__row');
const sectionEls = $$('section[data-key][data-hold]').sort((a, b) => Number(a.dataset.key) - Number(b.dataset.key));
const revealEls = reduced ? [] : $$('.reveal');
const closeEl = $('#close');
const bookEl = $('#book');
const compareEl = $('#compare');
const heroEl = $('#hero');
const heroCopy = $('.hero__copy');
const metaTheme = $('meta[name="theme-color"]');

// ---- viewport heights (FIX-PLAN-R4 S5, contract 0.5.5) ---------------------------------------
// vpS: the small viewport height (a phone's toolbar shown), the height the page maps and the camera fits to.
// vpL: the large viewport height (toolbar hidden), the canvas height (site.css sizes #stage to lvh).
// Read from PAGE's .vp-probe at boot and whenever innerWidth changes; innerHeight when a probe is missing or 0. On
// desktop and headless vpS = vpL = innerHeight. __lens.debug.vp(s, l) pins both (probes only).
const probeS = $('.vp-probe__s');
const probeL = $('.vp-probe__l');
let vpS = window.innerHeight || 1;
let vpL = vpS;
let vpW = window.innerWidth;
let vpPin = null;       // { s, l } while the debug override holds
function readVp() {
  vpW = window.innerWidth;
  if (vpPin) { vpS = vpPin.s; vpL = vpPin.l; return; }
  const ih = window.innerHeight || 1;
  const s = probeS ? probeS.offsetHeight : 0;
  const l = probeL ? probeL.offsetHeight : 0;
  vpS = s > 0 ? s : ih;
  vpL = l > 0 ? l : ih;
  if (vpL < vpS) vpL = vpS;
}
// the page's mapping height
const vh = () => vpS;
readVp();

// ---- shared state --------------------------------------------------------------------------
let secs = [];          // measured runways
let pending = [];       // reveals not yet shown: { el, y, grp } (grp: the .reveal elements of its .copy, or null)
let navBottom = 0;
let bookTop = Infinity;  // #book's document top: the veil lifts again over its approach (FIX-PLAN-R6 S1.2)
// FIX-PLAN-R6 S1.1: #compare's document top (#book's without it), the first thing after the runway: the pinned layer copy
// and the rail give way to it (page manager R5 did this at #book; the role is the same, one element earlier)
let tailTop = Infinity, tailK = 0;
let maxScroll = 0;
let measureDirty = true;
let lenis = null;
let stage = null;
let posSmooth = 0;
let vel = 0;            // posSmooth's velocity, pos units / s (the SmoothDamp state, FIX-PLAN-R5 S7.7)
let snap = true;        // follow the scroll exactly until the page is ready (scroll restoration, ?pos=)
let frameNo = 0;
const waiters = [];
let lastT = -1;
let lastScrollY = -1;

// ---- measuring ------------------------------------------------------------------------------
function measure() {
  const sy = window.scrollY;
  secs = sectionEls.map((el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + sy;
    const h = el.offsetHeight;
    const [a, b] = el.dataset.hold.split(',').map(Number);
    return { el, key: Number(el.dataset.key), top, h, s: top + a * h, e: top + b * h };
  });
  navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
  bookTop = bookEl ? bookEl.getBoundingClientRect().top + sy : Infinity;
  tailTop = compareEl ? compareEl.getBoundingClientRect().top + sy : bookTop;
  maxScroll = Math.max(0, Math.max(html.scrollHeight, document.body.scrollHeight) - window.innerHeight);   // the real scroll range
  // Reveals sit in sticky boxes, so their rect depends on the scroll. Use the position they would have
  // at rest: section top + (element - sticky box) offset, which does not change while the box sticks.
  // m6a: every reveal inside one .copy shares one group array, built here, so the tick allocates nothing.
  const groups = new Map();
  pending = revealEls.filter((el) => !el.classList.contains('is-in')).map((el) => {
    const box = el.closest('.sec__sticky');
    const sec = el.closest('section');
    const copy = el.closest('.copy');
    const er = el.getBoundingClientRect();
    let y;
    if (box && sec) y = sec.getBoundingClientRect().top + sy + (er.top - box.getBoundingClientRect().top);
    else y = er.top + sy;
    let grp = null;
    if (copy) {
      grp = groups.get(copy);
      if (!grp) { grp = revealEls.filter((r) => copy.contains(r)); groups.set(copy, grp); }
    }
    return { el, y, grp };
  });
  measureDirty = true;
}

// pos from the reference line (document Y): holds are integers, travel between holds is linear.
function posFromY(y) {
  const n = secs.length;
  if (!n) return 0;
  if (y <= secs[0].e) return 0;
  for (let k = 1; k < n; k++) {
    if (y < secs[k].s) {
      const a = secs[k - 1].e, b = secs[k].s;
      return b > a ? k - 1 + (y - a) / (b - a) : k;
    }
    if (y <= secs[k].e) return k;
  }
  return n - 1;
}
const refY = () => window.scrollY + vh() / 2;

// ---- the stage's speed limit (FIX-PLAN-R5 S7.7, REWORK-03 item 7) ------------------------------------------------------
// posSmooth follows the scroll's pos with a critically damped SmoothDamp (time constant SMOOTH_T) under a velocity cap,
// so a fast flick glides through every layer's crossfade, quick but continuous: no jump cut, no whip. The cap is
// VMAX_TOUR (layers / s) for any frame that touches [TOUR_A, TOUR_B] (the tour p 1.6-7.4 plus a guard band), even when
// the target lies outside it, and VMAX_OUT elsewhere. (Values superseded 2026-10-02 — see the SHOWRUNNER note below the history.)
// Deviation from the plan (3.0 outside the tour): at 60 fps 3.0 moves .05 pos per frame and fails its own no-jump gate
// (.035 per frame); 2.0 moves .033. STEP_MAX also caps one frame's move just under that gate, so a dropped or late
// frame (dt above ~29 ms in the tour) slows the glide for that frame instead of skipping ahead.
// DIRECTOR R7 (client: fast scroll "looks very jarring"): the 1.2 cap now covers the entry (1 -> 2, the lens closes on
// wall 01) and the pull-out (7 -> 8, the deck turns into view) too, TOUR_A 1.56 -> 1.0 and TOUR_B 7.44 -> 8.04. At 2.0
// those two moves, the biggest the camera makes after the cut, ran 1.7x faster than every layer change, so a flick
// through the pull-out whipped the deck round in about .3 s. Now every layer change plays at the same calm pace.
// SHOWRUNNER 2026-10-02 (client: "if I want to scroll down fast, I just need the animations to play really smoothly
// really fast"): the tour cap goes 1.2 -> 3.0 layers / s and the per-frame step .0345 -> .06, so a fast scroll plays
// every crossfade quickly instead of crawling behind the reader for seconds. The cast's own actions run on the scene
// clock, not on pos, so they keep their normal pace whatever the scroll speed.
const SMOOTH_T = 0.16, VMAX_TOUR = 3.0, VMAX_OUT = 4.0, TOUR_A = 1.0, TOUR_B = 8.04, STEP_MAX = 0.06;
const damp = { next: 0, vel: 0 };
function dampStep(x, target, v, dt, vmax) {
  const omega = 2 / SMOOTH_T, k = omega * dt;
  const ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k);
  const maxC = vmax * SMOOTH_T;
  const change = clamp(x - target, -maxC, maxC);
  const to = x - change;
  const tmp = (v + omega * change) * dt;
  let nv = (v - omega * tmp) * ex;
  let next = to + (change + tmp) * ex;
  const step = Math.min(vmax * dt, STEP_MAX);
  if (next > x + step) next = x + step;
  else if (next < x - step) next = x - step;
  nv = clamp(nv, -vmax, vmax);
  if ((target - x > 0) === (next > target)) { next = target; nv = 0; }   // no overshoot past the target
  damp.next = next; damp.vel = nv;
  return damp;
}
function follow(x, target, dt) {
  if (dt <= 0) return x;
  let r = dampStep(x, target, vel, dt, VMAX_OUT);
  if (Math.min(x, r.next) <= TOUR_B && Math.max(x, r.next) >= TOUR_A) r = dampStep(x, target, vel, dt, VMAX_TOUR);
  vel = r.vel;
  return r.next;
}

// ---- the skip (SHOWRUNNER 2026-10-02) ---------------------------------------------------------------------------------
// Client: tapping the top bar (iOS scroll-to-top) or scrolling back up fast replayed every layer one by one on the way
// up. Any move BACKWARD by more than JUMP_GAP layers no longer plays the tour in reverse: a ground-coloured veil covers
// the stage (JV_OUT s), the stage jumps straight to wherever the scroll is (and keeps jumping while the scroll is still
// travelling), then the veil lifts (JV_IN s) on the destination: the hero, if that is where the reader went.
// Forward moves never skip; they play fast (VMAX_TOUR above).
const JUMP_GAP = 1.5, JV_OUT = 0.14, JV_IN = 0.34, JV_SETTLE = 0.1;
// SHOWRUNNER 2026-10-02, calm (client: a fast scroll down "still messes up"): racing through the tour flashed each
// layer's copy on and off and popped every crew in and out. While the stage runs fast (speed over CALM_V layers / s, or
// more than CALM_LAG behind the scroll) calm eases to 0: crews step off the walls and layer copy stays hidden, so only
// the walls glide past. calm eases back to 1 once the stage settles (CALM_IN s), and the crews and copy return.
const CALM_V = 1.6, CALM_LAG = 0.8, CALM_OUT = 0.12, CALM_IN = 0.45, CALM_WAIT = 0.4;
let calm = 1, calmWait = 0;   // calm only starts back once the stage has been settled CALM_WAIT s (phone flicks come in bursts)
const jumpVeil = document.getElementById('jumpveil');
let jv = 0, jumping = false, jumpStill = 0, lastJumpTarget = 0;
function jumpFollow(x, target, dt) {
  if (!jumping && target - x < -JUMP_GAP) { jumping = true; jumpStill = 0; }
  let next = x;
  if (jumping) {
    jv = Math.min(1, jv + dt / JV_OUT);
    if (jv >= 1) {
      next = target; vel = 0;
      jumpStill = Math.abs(target - lastJumpTarget) < 1e-3 ? jumpStill + dt : 0;
      if (jumpStill >= JV_SETTLE) jumping = false;
    }
  } else {
    if (jv > 0) jv = Math.max(0, jv - dt / JV_IN);
    next = follow(x, target, dt);
  }
  lastJumpTarget = target;
  if (jumpVeil) {
    jumpVeil.style.opacity = jv > 0 ? String(jv * jv * (3 - 2 * jv)) : '0';
    if (jumping) jumpVeil.dataset.theme = target < 0.5 ? 'light' : 'dark';
  }
  return next;
}

// ---- DOM writers (only on change) ----------------------------------------------------------
let navTheme = '';
let railOn = null;
// S10 M14: each theme's ground (--rc-e0), read once at boot; '' = not read (the meta is left alone)
const themeE0 = { light: '', dark: '' };
function readThemeE0() {
  const read = (el) => (el ? getComputedStyle(el).getPropertyValue('--rc-e0').trim() : '');
  themeE0.light = read(heroEl);
  themeE0.dark = read(night);
}
// S11 m6: the hero copy leaves as the seam climbs from .75 to .50 of the viewport height
let heroOp = -1;
function writeHero(cutY) {
  if (reduced || !heroCopy || !night) return;
  // like writeCopy, only over the stage: the no-GL page scrolls the copy away in flow (and a failed stage restores it)
  // (1 - smoothstep)^2: a smooth start, most of the fade early, so at cut .5 the copy is at .5 % (smoothstep alone
  // left a readable 7 % ghost of the H1 and the CTA there)
  // stage manager R3: over .75 -> .50 (was -> .45), so at cut .5 the copy is gone (hidden), not a 1 % ghost under the nav
  const t = stage ? clamp((0.75 - cutY / vh()) / 0.25, 0, 1) : 0;
  const k = 1 - t * t * (3 - 2 * t);
  const o = Math.round(k * k * 100) / 100;
  if (o === heroOp) return;
  heroOp = o;
  heroCopy.style.opacity = o === 1 ? '' : String(o);
  heroCopy.style.visibility = o === 0 ? 'hidden' : '';   // as writeCopy: no invisible, focusable CTA
}
// Copy exit (director, integration): once the camera leaves hold k copy k fades out over pos k+0.08 .. k+0.30; it
// comes back on scroll-back. Opacity only, scroll-linked, skipped under reduced motion.
// FIX-PLAN-R5 S7.8, the arrival gate: under a flick the stage lags the scroll by up to ~4 s (the S7.7 speed limit), so
// copy k (keys 2-8) also waits for the stage: it is multiplied by smoothstep(k - .42, k - .18, posSmooth) and never shows
// over another layer's wall.
// Page manager R5: Close (key 9) is gated too. Ungated, a flick 7 -> 9 put "This is the whole thing." at full opacity
// over wall 05 at pos 7.25 (r9-copygate CLOSE). Its exit term is 0 (pos never passes 9).
// Page manager R5: layers 01-06 and Together are pinned in the viewport under the stage (site.css), so a jump to #book
// (a CTA, or a flick past the close) would glide their copy through the form's column while the stage catches up. They
// also give way to #compare, the first thing after the runway (FIX-PLAN-R6 S1.1; #book without it): x (1 - tailK),
// tailK = smoothstep of its top rising from the fold to .6 of the height.
// Stage manager R5: the gate is smoothstep(k - .42, k - .18) (was k - .55 .. k - .25). The arriving wall now dissolves in
// over f .48-.74 of its transit (timeline.js LEAVE_A) and is held (presence >= .5) from k - .39; the copy clears .05 at
// k - .39 too, so it no longer shows over the dark beat between two walls (r9-copygate 390 4->5 flick: .20 s).
const ARR_A = 0.42, ARR_W = 0.24;
const copyEls = sectionEls
  .filter((el) => Number(el.dataset.key) >= 1 && Number(el.dataset.key) <= 9)
  .map((el) => ({ el: el.querySelector('.copy'), key: Number(el.dataset.key), op: -1 }))
  .filter((c) => c.el);
function writeCopy(p, tailK) {
  if (reduced || !stage) return;
  for (const c of copyEls) {
    const t = clamp((p - c.key - 0.08) / 0.22, 0, 1);
    let g = 1;
    if (c.key >= 2) { const u = clamp((p - c.key + ARR_A) / ARR_W, 0, 1); g = u * u * (3 - 2 * u); }
    if (c.key >= 2 && c.key <= 8) g *= 1 - tailK;
    if (c.key >= 1 && c.key <= 8) g *= calm * calm * (3 - 2 * calm);
    const o = Math.round((1 - t * t * (3 - 2 * t)) * g * 100) / 100;
    if (o === c.op) continue;
    c.op = o;
    c.el.style.opacity = o === 1 ? '' : String(o);
    c.el.style.visibility = o === 0 ? 'hidden' : '';
  }
}
const railStates = [];
const sysStates = [];
function writeDom(state, cutY) {
  if (nav) {
    const t = cutY <= navBottom ? 'dark' : 'light';
    if (t !== navTheme) {
      navTheme = t;
      nav.dataset.theme = t;
      html.dataset.theme = t;
      if (metaTheme && themeE0[t]) metaTheme.setAttribute('content', themeE0[t]);
    }
  }
  if (railEl) {
    const on = posSmooth >= 0.9 && posSmooth < 7.5 && tailK === 0;   // not over #compare and what follows (FIX-PLAN-R6 S1.1)
    if (on !== railOn) { railOn = on; railEl.classList.toggle('is-on', on); }
    for (let i = 0; i < railItems.length; i++) {
      const s = state.rail[i];
      if (railStates[i] !== s) {
        railStates[i] = s;
        railItems[i].dataset.state = s;
        if (s === 'live') railItems[i].setAttribute('aria-current', 'step');
        else railItems[i].removeAttribute('aria-current');
      }
    }
  }
  const live = state.listLive;
  const relight = live >= 0 && state.thread.head < 1;
  for (let i = 0; i < sysRows.length; i++) {
    const idx = Number(sysRows[i].dataset.row);
    const r = Number.isFinite(idx) ? idx : i;
    let s;
    if (live < 0) s = 'ahead';
    else if (relight) s = r < live ? 'done' : r === live ? 'live' : 'ahead';
    else s = r <= live ? 'done' : 'ahead'; // p >= RELIGHT_B: listLive 5, head 1 -> every row done
    if (sysStates[i] !== s) { sysStates[i] = s; sysRows[i].dataset.state = s; }
  }
}

// ---- nav CTA (FIX-PLAN-R2 m13, R3 S12): one CTA in frame at the close and the booking form ------------------------
// 'on' by default; 'off' while #close OR #book is at least half visible. Each target's latest ratio is kept, since one
// callback may carry only the entry that changed. Scroll-independent, so it works under reduced motion.
function watchClose() {
  if (!nav) return;
  nav.dataset.cta = 'on';
  const targets = [closeEl, bookEl].filter(Boolean);
  if (!targets.length || typeof window.IntersectionObserver !== 'function') return;
  const half = new Map(targets.map((el) => [el, false]));
  const io = new window.IntersectionObserver((entries) => {
    for (const e of entries) half.set(e.target, e.isIntersecting && e.intersectionRatio >= 0.5);
    let any = false;
    for (const v of half.values()) if (v) any = true;
    const s = any ? 'off' : 'on';
    if (nav.dataset.cta !== s) nav.dataset.cta = s;
  }, { threshold: [0, 0.5, 1] });
  for (const el of targets) io.observe(el);
}

// ---- events ------------------------------------------------------------------------------------
let pinReleased = false, togetherSeen = false;
const layersSeen = new Set();
function events(state) {
  if (!pinReleased && posSmooth >= 0.98) { pinReleased = true; dl.push({ event: 'hero_pin_release' }); }
  if (state.active >= 0 && !layersSeen.has(state.active)) {
    layersSeen.add(state.active);
    dl.push({ event: 'layer_view', layer: state.active + 1 });
  }
  if (!togetherSeen && posSmooth >= 8) { togetherSeen = true; dl.push({ event: 'together_view' }); }
}

document.addEventListener('click', (e) => {
  const el = e.target && e.target.closest ? e.target.closest('[data-cta], a[href^="mailto:"]') : null;
  if (!el) return;
  const sec = el.closest('section, footer, header');
  dl.push({ event: 'cta_click', location: el.dataset.cta || (sec && (sec.id || sec.tagName.toLowerCase())) || 'page' });
});

// in-page anchors to a runway: land on the centre of its hold band. Any other target (e.g. #book, which js/book.js
// handles) returns before preventDefault, so the browser or its own handler takes it.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const target = id ? document.getElementById(id) : null;
  const sec = target ? secs.find((s) => s.el === target) : null;
  if (!sec) return;
  e.preventDefault();
  const y = clamp((sec.s + sec.e) / 2 - vh() / 2, 0, maxScroll);
  if (lenis) lenis.scrollTo(y, { duration: 1.1, easing: brandEase });
  else window.scrollTo(0, y);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
});

// ---- the one tick -----------------------------------------------------------------------------------
function tick(time) {
  const dt = lastT < 0 ? 1 / 60 : clamp(time - lastT, 0, 0.1);
  lastT = time;

  if (lenis) lenis.raf(time * 1000);

  const sy = window.scrollY;
  const target = posFromY(sy + vh() / 2);
  if (reduced) { posSmooth = Math.round(target); vel = 0; }
  else if (snap) { posSmooth = target; vel = 0; }
  else posSmooth = jumpFollow(posSmooth, target, dt);   // FIX-PLAN-R5 S7.7 + the skip below
  if (reduced || snap) calm = 1;
  else {
    const racing = Math.abs(vel) > CALM_V || Math.abs(target - posSmooth) > CALM_LAG;
    calmWait = racing ? 0 : calmWait + dt;
    if (racing) calm = Math.max(0, calm - dt / CALM_OUT);
    else if (calmWait >= CALM_WAIT || calm >= 1) calm = Math.min(1, calm + dt / CALM_IN);
  }

  // the seam in canvas px (the canvas top is the viewport top), clamped to the canvas height vpL (S5.4)
  const cvH = vpL;
  const cutY = night ? clamp(night.getBoundingClientRect().top, 0, cvH) : cvH;
  const state = stateAt(posSmooth, window.innerWidth / vh());
  state.calm = calm;
  const bu = clamp((sy + vh() - tailTop) / (0.4 * vh()), 0, 1);
  tailK = bu * bu * (3 - 2 * bu);
  // FIX-PLAN-R6 S1.2, the veil: it rises as #compare's top climbs from .9 to .4 of the height and lifts again as #book's
  // climbs from .9 to .5, so #book keeps its designed backdrop. Scroll-linked opacity, so it runs under reduced motion too.
  // Without #compare there is nothing to veil for (tailTop is #book's then): V = 0.
  let V = 0;
  if (compareEl) {
    const va = clamp((0.9 * vh() - (tailTop - sy)) / (0.5 * vh()), 0, 1);
    // SHOWRUNNER 2026-10-02 (client: on mobile "before the final section with the booking appears, the 6 layers with
    // agents already appears"): on a portrait screen the deck no longer returns behind #book; the veil stays down.
    const vb = window.innerWidth < vh() ? 0 : clamp((0.9 * vh() - (bookTop - sy)) / (0.4 * vh()), 0, 1);
    V = va * va * (3 - 2 * va) * (1 - vb * vb * (3 - 2 * vb));
    // a sub-pixel scroll at either end of the band leaves V ~1e-6 (under a quarter of one 8-bit level): snap it to an
    // exact 0, so #book's approach and the pos-9 hold never draw the veil
    if (V < 1e-3) V = 0;
  }

  if (pending.length && (sy !== lastScrollY || measureDirty)) {
    const line = sy + vh() * 0.8;
    let fired = false;
    for (let i = 0; i < pending.length; i++) {
      const p = pending[i];
      if (line < p.y || p.el.classList.contains('is-in')) continue;
      if (p.grp) for (let j = 0; j < p.grp.length; j++) p.grp[j].classList.add('is-in');
      else p.el.classList.add('is-in');
      fired = true;
    }
    // m6a: a group reveal also drops its not-yet-due members
    if (fired) pending = pending.filter((p) => !p.el.classList.contains('is-in'));
  }
  lastScrollY = sy;
  measureDirty = false;

  if (stage) {
    try {
      stage.setState(state, cutY);
      if (stage.setVeil) stage.setVeil(V);
      stage.frame(time, dt);
    } catch (err) {
      stage = null;
      html.classList.remove('stage-on', 'gl');
      html.classList.add('no-gl', 'no-webgl', 'no-guides');
      lens.stage = null;
      lens.guides = null;
      console.error('LENS: stage frame failed, falling back to the static page', err);
    }
  }

  writeDom(state, cutY);
  writeCopy(posSmooth, tailK);
  writeHero(cutY);
  events(state);

  frameNo++;
  for (let i = waiters.length - 1; i >= 0; i--) {
    if (frameNo >= waiters[i].target) { waiters[i].res(); waiters.splice(i, 1); }
  }
}

const afterFrames = (n) => new Promise((res) => {
  const w = { target: frameNo + n, res };
  waiters.push(w);
  setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); res(); } }, 2500);
});

// ---- debug hooks (tools/shoot.mjs depends on these) -----------------------------------------------------
let resolveReady;
const ready = new Promise((r) => { resolveReady = r; });
const lens = {
  pos: () => posSmooth,
  ready,
  stage: null,
  guides: null,
  lenis: null,
  scrollToPos(p) {
    if (!secs.length) measure();
    const k = clamp(Math.floor(p), 0, secs.length - 1);
    let y;
    if (p >= secs.length - 1 || Number.isInteger(p)) {
      const s = secs[clamp(Math.round(p), 0, secs.length - 1)];
      y = (s.s + s.e) / 2;
    } else {
      const f = p - k;
      y = secs[k].e + f * (secs[k + 1].s - secs[k].e);
    }
    const scroll = clamp(y - vh() / 2, 0, maxScroll);
    if (lenis) lenis.scrollTo(scroll, { immediate: true, force: true });
    else window.scrollTo(0, scroll);
    posSmooth = p;
    vel = 0;
    return afterFrames(2);
  },
  setClock(t) {
    if (lens.stage && lens.stage.debug) lens.stage.debug.clock = (t === null || t === undefined) ? null : Number(t);
    return afterFrames(2);
  },
};
// FIX-PLAN-R4 S5: __lens.debug.vp(s, l) pins vpS / vpL (css px), sizes the canvas box to l px and fits the stage to s,
// so a headless probe can play a phone's toolbar; vp(null) clears it. Debug only.
lens.debug = {
  vp(s, l) {
    if (s === null || s === undefined) {
      vpPin = null;
      if (canvas) canvas.style.height = '';
    } else {
      const S = Math.max(1, Number(s) || 0);
      const Lh = Math.max(S, Number(l) || S);
      vpPin = { s: S, l: Lh };
      if (canvas) canvas.style.height = Lh + 'px';
    }
    readVp();
    measure();
    if (stage) {
      if (stage.setFit) stage.setFit(vpS);
      if (stage.resize) stage.resize();
    }
    return afterFrames(2);
  },
  get vpS() { return vpS; },
  get vpL() { return vpL; },
};
window.__lens = lens;

// ---- boot ------------------------------------------------------------------------------------------------
function boot() {
  measure();
  readThemeE0();
  watchClose();
  if (!reduced && revealEls.length) html.classList.add('rv');

  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false });
    lens.lenis = lenis;
  }
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    if (lenis) lenis.on('scroll', window.ScrollTrigger.update);
    window.ScrollTrigger.addEventListener('refresh', measure);
  }

  // remeasure: resize (debounced), fonts, load, body size changes.
  // FIX-PLAN-R4 S5.2: a height-only change inside [vpS - 2, vpL + 2] is a phone toolbar showing or hiding: the sections
  // are svh, so measure() runs, but the canvas (lvh) and the fit (svh) do not change, so the stage is not resized. A
  // width change re-reads the probe and refits.
  let rt = 0;
  const remeasure = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const ih = window.innerHeight;
      const toolbar = window.innerWidth === vpW && ih >= vpS - 2 && ih <= vpL + 2;
      if (!toolbar) readVp();
      measure();
      if (toolbar || !stage) return;
      if (stage.setFit) stage.setFit(vpS);
      if (stage.resize) stage.resize();
    }, 100);
  };
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', measure);
  if (window.ResizeObserver) new ResizeObserver(remeasure).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  if (matchMedia('(pointer: fine)').matches && !reduced) {
    window.addEventListener('pointermove', (e) => {
      if (!stage || !stage.setPointer || e.pointerType === 'touch') return;
      stage.setPointer(clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1), clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1));
    }, { passive: true });
  }

  // DN 7: pos is exactly 0 on load and reaches 1 when #night's top hits the viewport top.
  const initialPos = posFromY(refY());
  const introPos = qs.has('pos') ? Number(qs.get('pos')) || 0 : initialPos;
  posSmooth = initialPos;

  if (window.gsap) {
    window.gsap.ticker.lagSmoothing(0);
    window.gsap.ticker.add(tick);
  } else {
    const raf = (ms) => { tick(ms / 1000); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  const guard = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  // Probe WebGL on a throwaway canvas before loading three.js, so a browser without it takes the static
  // path quietly (three.js logs 'Error creating WebGL context' as a console error otherwise). ?nogl=1 forces
  // the no-GL page for the poster checks.
  const hasGL = (() => {
    if (qs.get('nogl') === '1') return false;
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return false;
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return true;
    } catch (e) { return false; }
  })();

  (async () => {
    try {
      if (!hasGL) throw null;
      const mod = await import('./stage.js');
      const st = await mod.createStage(canvas, { reduced, skipIntro: reduced || introPos > 0.5, fitH: vpS });
      stage = st;
      lens.stage = st;
      lens.guides = st.guides || null;
      if (st.setFit) st.setFit(vpS);
      await guard(Promise.resolve(st.canvasReady), 12000);
      if (stage) {
        html.classList.add('stage-on', 'gl');
        if (!reduced && introPos <= 0.5 && st.intro) st.intro();
      }
      await guard(Promise.all([fontsReady, Promise.resolve(st.texturesReady)]), 12000);
    } catch (err) {
      stage = null;
      lens.stage = null;
      lens.guides = null;
      html.classList.add('no-gl', 'no-webgl', 'no-guides');   // no stage, so no guide passes either
      // err is null when the probe above found no WebGL: that is an expected path, not a fault
      if (err) console.warn('LENS: stage unavailable, DOM-only mode', err);
      await guard(fontsReady, 4000);
    }
    measure();
    snap = false;
    resolveReady(true);
    if (qs.has('pos')) lens.scrollToPos(Number(qs.get('pos')) || 0);
    if (qs.has('clock') && qs.get('clock') !== '' && Number.isFinite(Number(qs.get('clock')))) lens.setClock(Number(qs.get('clock')));
  })();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

