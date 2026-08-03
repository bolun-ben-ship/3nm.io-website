/* ============================================================================
 * 3nm-v2 — motion layer
 * Mirrors references/zig ai analysis/zig-gsap-source.js, recolored to the brand.
 * Stack: GSAP + ScrollTrigger + SplitText + Lenis + Splide.
 * CRITICAL (ANIMATION-SPEC §0): stat circles (§5) + step wheel (§8) are SCROLL-SCRUBBED
 * (progress tied to scroll distance, not seconds). Everything else is play-once / interactive.
 * ==========================================================================*/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

gsap.registerPlugin(ScrollTrigger, SplitText);
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero wheel fan angles (deg, relative to base 180°). Declared here so top-level init calls can read them.
// +angle = higher on screen. Card 0 (Meeting) sits at TOP, matching zig's fan.
const REVEAL_DROP = 46;                    // deg below FAN_FULL → cards start off the bottom edge and rise in

/* ---- interactive bits always run (accessible without motion) ------------- */
initFaq();
initTestimonials();
initNav();

if (REDUCE) {
  initHeroStatic();          // show the fanned poster instead of the loop
}

if (!REDUCE) {
  initLenis();
  initReveals();
  initWordReveal();
  initBlockAppear();
  initMarquees();
  initHeroLoop();
  initBento();
  initStats();
  initWinMorph();
  initStepWheel();
  initTimeline();
  initBodyBg();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---- Lenis smooth-scroll (script_11) ------------------------------------- */
function initLenis() {
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---- Nav hide/show + scrolled state (IX2 a-2/a-3, §0) -------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (y > last && y > 240) nav.classList.add('is-hidden');       // scroll down → hide
    else nav.classList.remove('is-hidden');                        // scroll up → show
    last = y;
  }, { passive: true });

  const tg = document.getElementById('navToggle');
  const mm = document.getElementById('mobileMenu');
  if (tg && mm) tg.addEventListener('click', () => {
    const open = mm.hasAttribute('hidden');
    if (open) mm.removeAttribute('hidden'); else mm.setAttribute('hidden', '');
    tg.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

/* ---- generic reveals (fade-up on enter) ---------------------------------- */
function initReveals() {
  const els = gsap.utils.toArray('.reveal');
  els.forEach((el) => {
    const d = parseInt(el.dataset.r || '0', 10) * 90;
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => setTimeout(() => el.classList.add('in'), d),
    });
  });
}

/* ---- heading word-reveal (.animate-text_opacity, SCRUBBED — script_13) --- */
function initWordReveal() {
  document.querySelectorAll('.animate-text_opacity').forEach((el) => {
    const split = new SplitText(el, { type: 'words' });
    gsap.set(split.words, { opacity: 0.2 });
    gsap.to(split.words, {
      opacity: 1, ease: 'none', stagger: 0.5,
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true },
    });
  });
}

/* ---- block appear (play-once, staggered — script_13) --------------------- */
function initBlockAppear() {
  gsap.utils.toArray('.animate-block_appear').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 40, duration: 1.2, ease: 'power4.out', delay: (i % 4) * 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });
}

/* ---- marquees (logos, linear infinite — IX2 a) --------------------------- */
/* Pause-on-hover: hovering the strip freezes the scroll so a logo can be read
   and colorized (native color on hover is CSS in Statement.astro). */
function initMarquees() {
  document.querySelectorAll('[data-marquee]').forEach((marquee) => {
    const track = marquee.querySelector('.marquee-track');
    if (!track) return;
    const tween = gsap.to(track, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
    marquee.addEventListener('mouseenter', () => tween.pause());
    marquee.addEventListener('mouseleave', () => tween.resume());
  });
}

/* ---- HERO — off-screen wheel + radial-arm cards (§1) ----------------------
 * Rebuilds zig's licensed .lottie choreography (verified frame-by-frame):
 * a wheel whose center sits off the RIGHT edge carries the cards on radial arms.
 * 4 scenes + two 1s holds, seamless loop (script_12's segmented playback):
 *   segA 2.0s reveal (fan in) · HOLD 1s · segB 3.2s merge→morph→2nd card · HOLD 1s · segC 2.8s rotate-out+loop.
 * ------------------------------------------------------------------------- */
function buildHero() {
  const stage = document.querySelector('[data-hero]');
  if (!stage) return null;
  const arms = stage.querySelector('.hero-arms');
  const cardEls = gsap.utils.toArray('.hx-card', stage);
  if (!cardEls.length) return null;

  // one radial-arm <line> per card
  cardEls.forEach(() => {
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('opacity', '0'); arms.appendChild(ln);
  });
  const lines = [...arms.querySelectorAll('line')];

  // live per-card state (ang in deg relative to base 180° = pointing left toward hub)
  const cards = cardEls.map((el, i) => ({ el, line: lines[i], role: el.dataset.role, ang: 0, r: 0, op: 0, sc: 1 }));
  const geom = {};
  function measure() {
    const w = stage.clientWidth, h = stage.clientHeight;
    geom.w = w; geom.h = h;
    geom.hubX = w * 1.3; geom.hubY = h * 0.5; geom.R = w * 1.04;
    geom.padX = w * 0.06;   // shift the whole scene right so card shadows clear the left clip edge
    // Pixel-based fan: derive each card angle from a FIXED vertical gap (card height + 16px),
    // so the 4 cards never overlap however narrow the illustration column gets.
    const ch = (cardEls[0] && cardEls[0].offsetHeight) || 100;
    const step = ch + 16;
    geom.fan = [1.5, 0.5, -0.5, -1.5].map((m) =>
      (Math.asin(gsap.utils.clamp(-0.72, 0.72, (m * step) / geom.R)) * 180) / Math.PI);
    // angle for the two summary cards, ±half a (card + 26px) apart → fixed vertical gap
    geom.pairAng = (Math.asin(gsap.utils.clamp(-0.7, 0.7, (0.5 * (ch + 26)) / geom.R)) * 180) / Math.PI;
  }
  function place() {
    const hubY = geom.hubY, hubX = geom.hubX + geom.padX;
    cards.forEach((c) => {
      const a = (180 + c.ang) * Math.PI / 180;
      const x = hubX + c.r * Math.cos(a), y = hubY + c.r * Math.sin(a);
      c.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${c.sc})`;
      c.el.style.opacity = c.op;
      if (c.op > 0.02) {
        c.line.setAttribute('x1', hubX); c.line.setAttribute('y1', hubY);
        c.line.setAttribute('x2', x); c.line.setAttribute('y2', y);
        c.line.setAttribute('opacity', c.op * 0.85);
      } else c.line.setAttribute('opacity', '0');
    });
  }
  measure();
  return { stage, cards, geom, measure, place, task: cards.slice(0, 4), we: cards[4], you: cards[5] };
}

function initHeroStatic() {
  const stage = document.querySelector('[data-hero]');
  if (!stage) return;
  if (innerWidth <= 767) { stage.classList.add('is-static'); return; }   // stacked poster on mobile
  const H = buildHero();
  if (!H) return;
  H.task.forEach((c, i) => { c.ang = H.geom.fan[i]; c.r = H.geom.R; c.op = 1; });
  H.we.op = 0; H.you.op = 0;
  H.place();
}

function initHeroLoop() {
  const stage = document.querySelector('[data-hero]');
  if (stage && innerWidth <= 767) { stage.classList.add('is-static'); return; }   // no wheel on mobile
  const H = buildHero();
  if (!H) return;
  const { task, we, you, geom } = H;

  const reset = () => {
    task.forEach((c, i) => { c.ang = geom.fan[i] - REVEAL_DROP; c.r = geom.R; c.op = 0; c.sc = 1; }); // start below the frame
    we.ang = 0; we.r = geom.R; we.op = 0; we.sc = 0.9;   // parked at the merge spot, ready to morph up
    you.ang = 0; you.r = geom.R; you.op = 0; you.sc = 1; // emerges from the same spot on the split
    H.place();
  };

  // Timings frame-matched to zig's Lottie (24fps) with script_12's two 1s holds inserted
  // at f48 (25%) and f125 (65%). Frame f → segment seconds noted per line.
  function loop() {
    reset();
    const tl = gsap.timeline({ onComplete: loop, onUpdate: H.place });

    // ── segA 0–2.2s (f0–48) — wheel rotates up: cards rise IN FROM THE BOTTOM, one by one ──
    task.forEach((c, i) => {
      const at = i * 0.24;
      tl.to(c, { ang: geom.fan[i], duration: 1.6, ease: 'power3.out' }, at);   // arc up into the fan
      tl.to(c, { op: 1, duration: 0.4, ease: 'power1.out' }, at + 0.05);       // become visible while still low
    });
    // ── HOLD 1s (read the 4 cards) → t=3.0 ──
    // ── segB 3.0–6.2s (f48–125) — merge to ONE card → morph → split into two ──
    // merge: all 4 cards converge to the SAME point → 100% overlap, reads as a single card (f48–79)
    task.forEach((c) => tl.to(c, { ang: 0, r: geom.R, duration: 1.3, ease: 'power2.inOut' }, 3.0));
    // morph IN PLACE: the merged card crossfades + scales into "We did" at the same spot — no gap, no pop (f82–100)
    tl.to(task, { sc: 0.9, op: 0, duration: 0.55, ease: 'power1.inOut' }, 4.5);        // the one card shrinks + dissolves
    tl.to(we,   { sc: 1,   op: 1, duration: 0.55, ease: 'power1.inOut' }, 4.5);        // "We did" grows in on top of it → morph
    // split into TWO: "We did" rises, "You did" separates out of the same card and drops below (f100–125)
    tl.to(we, { ang: geom.pairAng, duration: 0.6, ease: 'power2.out' }, 5.3);
    tl.fromTo(you, { ang: 0, r: geom.R, op: 0 }, { ang: -geom.pairAng, r: geom.R, op: 1, duration: 0.6, ease: 'power2.out' }, 5.3);
    // ── HOLD 1s (read the comparison) → t=7.2 ──
    // ── segC 7.2–10.0s (f132–191) — BIG clockwise sweep: both cards rotate COMPLETELY out of frame ──
    tl.to([we, you], { ang: '+=88', duration: 2.3, ease: 'power2.in' }, 7.2);          // wheel +124°-equivalent: both cards exit past the top edge
    tl.to([we, you], { op: 0, duration: 0.45, ease: 'power1.in' }, 9.1);               // fade ONLY after both are fully out of frame
    tl.to({}, { duration: 0.45 }, 9.55);                                               // empty beat — frame clear BEFORE scene 1 restarts
    // onComplete → loop() → reset() hides all, segA fans the 4 cards back in fresh (no overlap)
  }

  loop();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { H.measure(); H.place(); }, 150); });
}

/* ---- BENTO — card scale-in on enter + badge orbit (§4, IX2 a-7/a-24) ----- */
function initBento() {
  gsap.utils.toArray('.reveal-card').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: (i % 2) * 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
  document.querySelectorAll('[data-orbit]').forEach((badge) => {
    gsap.to(badge, { rotation: 360, transformOrigin: '50% 50%', duration: 14, ease: 'none', repeat: -1 });
  });
}

/* ---- STATS — SCRUBBED, circles scale 0.2→1 one-by-one (§5, IX2 a-16/a-20) - */
function initStats() {
  const section = document.querySelector('[data-stats]');
  const circles = gsap.utils.toArray('[data-stat-circle]');
  if (!section || !circles.length) return;
  const n = circles.length;
  ScrollTrigger.create({
    trigger: section, start: 'top 75%', end: 'bottom 70%', scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      circles.forEach((c, i) => {
        const k = gsap.utils.clamp(0, 1, p * n - i);   // sequential fill
        gsap.set(c, { scale: 0.2 + 0.8 * k });
      });
    },
  });
}

/* ---- GAP CIRCLE — grows to fill, wipes paper→dark (§6, IX2 a-23) ---------- */
/* ---- WIN MORPH — green circle grows to fill, then morphs into the Venn (§6+7 merged) ----
 * Pinned scroll-scrub: grow → fill → cross-morph to the two Venn circles → draw lines + tooltips.
 * Disabled ≤767 (CSS falls back to a static stacked Venn). */
function initWinMorph() {
  const sec = document.querySelector('[data-winmorph]');
  if (!sec || innerWidth <= 767) return;
  const scroller = sec.querySelector('.wm-scroll');
  const grow = sec.querySelector('[data-wm-grow]');
  const cap = sec.querySelector('[data-wm-caption]');
  const venn = sec.querySelector('[data-wm-venn]');
  const circles = gsap.utils.toArray('[data-venn-circle]', sec);
  const circleL = circles[0], circleR = circles[1];              // DOM order: is--left, is--right
  const mark = sec.querySelector('.win-mark');
  const labels = gsap.utils.toArray('.win-label', sec);
  const paths = gsap.utils.toArray('.win-svg-overlay path', sec);
  const groups = gsap.utils.toArray('.win-tooltips', sec);
  const full = () => innerWidth >= 992;
  const clamp = gsap.utils.clamp, mr = gsap.utils.mapRange;

  // initial: everything hidden, both circles stacked at centre (cx 380), left starts small
  gsap.set(venn, { autoAlpha: 0 });
  gsap.set(cap, { autoAlpha: 0 });
  gsap.set(circleL, { attr: { cx: 380, r: 60 }, opacity: 0 });
  gsap.set(circleR, { attr: { cx: 380, r: 180 }, opacity: 0 });
  gsap.set(mark, { autoAlpha: 0, transformOrigin: '50% 50%' });
  gsap.set(labels, { autoAlpha: 0 });

  ScrollTrigger.create({
    trigger: scroller, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const seg = (a, b) => clamp(0, 1, mr(a, b, 0, 1, p));

      // phase 1 — green circle grows to fill the screen (0 → 0.38)
      const g = seg(0, 0.38);
      const growAlpha = p < 0.44 ? 1 : clamp(0, 1, mr(0.52, 0.44, 0, 1, p)); // fade as venn takes over
      gsap.set(grow, { scale: 0.02 + g * 0.9, autoAlpha: growAlpha });
      // caption — in while filling, out before the morph
      gsap.set(cap, { autoAlpha: Math.min(seg(0.03, 0.12), 1 - seg(0.30, 0.40)) });

      // venn container appears as the green fill clears (0.40 → 0.48)
      gsap.set(venn, { autoAlpha: seg(0.40, 0.48) });

      // beat 1 — a single circle grows in at centre (0.42 → 0.52)
      const grow1 = seg(0.42, 0.52);
      gsap.set(circleL, { attr: { r: 60 + 120 * grow1 }, opacity: 0.9 * grow1 });

      // beat 2 — it splits into left + right (0.52 → 0.63)
      const split = seg(0.52, 0.63);
      gsap.set(circleL, { attr: { cx: 380 - 80 * split } });
      gsap.set(circleR, { attr: { cx: 380 + 80 * split }, opacity: 0.9 * split });

      // beat 3 — the logo appears in the middle (0.63 → 0.70)
      const logo = seg(0.63, 0.70);
      gsap.set(mark, { autoAlpha: logo, scale: 0.6 + 0.4 * logo });

      // beat 4 — the words fade in together (0.70 → 0.77)
      gsap.set(labels, { autoAlpha: seg(0.70, 0.77) });

      // beat 5 — annotation lines draw inward to the circumference, then tooltips (0.77 → 0.92)
      const r = seg(0.77, 0.92);
      if (full()) paths.forEach((pa) => (pa.style.strokeDashoffset = String(1 - r)));
      else paths.forEach((pa) => (pa.style.strokeDashoffset = '0'));
      groups.forEach((gr) => gr.classList.toggle('is-in', p > 0.86));
    },
  });
}

/* ---- STEP WHEEL — SCRUBBED horizontal sweep, cards through center (§8) ---- */
/* Reproduces the observable effect of script_17's rotating wheel via a pinned scrub. */
function initStepWheel() {
  const wrapp = document.querySelector('[data-steps-wrapp]');
  const track = document.querySelector('[data-steps-cards]');
  const cards = gsap.utils.toArray('.sales-card');
  if (!wrapp || !track || innerWidth <= 767) return;

  gsap.to(track, {
    x: () => -(track.scrollWidth - innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: wrapp, start: 'top top', end: 'bottom bottom', scrub: true,
      invalidateOnRefresh: true,
      onUpdate: () => {
        const mid = innerWidth / 2;
        let best = null, bestD = Infinity;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestD) { bestD = d; best = c; }
        });
        cards.forEach((c) => c.classList.toggle('is-center', c === best));
      },
    },
  });
}

/* ---- TIMELINE — .built-card scale 0.95→1, staggered (§9, IX2 a-22) ------- */
function initTimeline() {
  gsap.utils.toArray('.built-card').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, scale: 1, duration: 0.5, ease: 'power2.inOut', delay: (i % 4) * 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ---- TESTIMONIALS — Splide loop (§10, script_18) ------------------------- */
function initTestimonials() {
  const el = document.querySelector('[data-testim-slider]');
  if (!el) return;
  new Splide(el, {
    perPage: 1, perMove: 1, type: 'loop', arrows: true, pagination: true,
    rewindSpeed: 400, updateOnMove: true, speed: 500,
    autoplay: !REDUCE, interval: 5200, pauseOnHover: true,
  }).mount();
}

/* ---- FAQ accordion — click expand/collapse (§11, interactive) ------------ */
function initFaq() {
  const items = gsap.utils.toArray('.faq-item');
  items.forEach((item) => {
    const btn = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');
      items.forEach((o) => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.height = '0px';
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        panel.style.height = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ---- Body background recolor across flood/dark sections (§4 motion, ≥992) - */
function initBodyBg() {
  const body = document.body;
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#FAFAF7';
  const dark = getComputedStyle(document.documentElement).getPropertyValue('--dark').trim() || '#15171a';
  const green = getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#15803D';

  ScrollTrigger.matchMedia({
    '(min-width: 992px)': function () {
      const set = (c) => (body.style.backgroundColor = c);
      ScrollTrigger.create({ trigger: '[data-wins]', start: 'top center', end: 'bottom center',
        onEnter: () => set(dark), onEnterBack: () => set(dark), onLeaveBack: () => set(paper) });
      ScrollTrigger.create({ trigger: '[data-steps]', start: 'top center',
        onEnter: () => set(green), onLeaveBack: () => set(dark) });
      ScrollTrigger.create({ trigger: '[data-steps]', start: 'bottom 55%',
        onEnter: () => set(paper), onLeaveBack: () => set(green) });
      return () => set('');
    },
  });
}
