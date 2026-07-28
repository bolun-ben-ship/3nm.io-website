/* ============================================================================
 * zig.ai — extracted inline animation source (verbatim from live DOM 2026-07-28)
 * These are the site's custom GSAP/Lenis/Splide scripts, in document order.
 * This is the AUTHORITATIVE timing source — exact durations, eases, triggers.
 * ==========================================================================*/

/* ---- script_11 : Lenis smooth-scroll + GSAP ticker bind -------------------*/
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);


/* ---- script_12 : HERO Lottie — custom segmented 8s loop -------------------*/
window.Webflow = window.Webflow || [];
window.Webflow.push(function () {
  function init() {
    const lottieModule = Webflow.require('lottie');
    const animations = lottieModule.lottie.getRegisteredAnimations();
    if (!animations.length) { setTimeout(init, 200); return; }

    const allLotties = document.querySelectorAll('.hero_lottie');
    const visibleEl = Array.from(allLotties).find(el => getComputedStyle(el).display !== 'none');
    const anim = animations.find(a => a.wrapper === visibleEl) || animations[0];
    if (!anim) { setTimeout(init, 200); return; }

    anim.stop();
    const proxy = { frame: 0 };
    const t = anim.totalFrames;
    const totalDuration = 8;
    function segmentDuration(from, to) { return ((to - from) / t) * totalDuration; }

    function playLoop() {
      proxy.frame = 0;
      anim.goToAndStop(0, true);
      gsap.timeline()
        .to(proxy, { frame: t * 0.25, duration: segmentDuration(0, t * 0.25), ease: 'none',
          onUpdate: () => anim.goToAndStop(proxy.frame, true) })
        .to(proxy, { frame: t * 0.65, duration: segmentDuration(t * 0.25, t * 0.65), delay: 1, ease: 'none',
          onUpdate: () => anim.goToAndStop(proxy.frame, true) })
        .to(proxy, { frame: t, duration: segmentDuration(t * 0.65, t), delay: 1, ease: 'none',
          onUpdate: () => anim.goToAndStop(proxy.frame, true), onComplete: playLoop });
    }
    playLoop();
  }
  init();
});


/* ---- script_13 : heading word-reveal + block appear ----------------------*/
gsap.registerPlugin(ScrollTrigger, SplitText);

document.querySelectorAll('.animate-text_opacity').forEach((el) => {
  const split = new SplitText(el, { type: 'words' });
  gsap.set(split.words, { opacity: 0.2 });
  gsap.to(split.words, {
    opacity: 1, ease: 'none', stagger: 0.5,
    scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 40%', scrub: true },
  });
});

document.querySelectorAll('.animate-block_appear').forEach((el) => {
  gsap.from(el, {
    opacity: 0, y: 40, duration: 1.2, ease: 'power4.out',
    scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' },
  });
});


/* ---- script_15 : WIN CIRCLES (Venn) — clip-path mask reveal + SVG line draw */
(function () {
  if (window.innerWidth < 480) return;
  const fullMode = () => window.innerWidth >= 992;
  const wrap = document.querySelector('.win-circles-wrapp');
  const illus = document.querySelector('.win-circle.illustration');
  const leftEl = document.querySelector('.win-circle.is--left');
  const rightEl = document.querySelector('.win-circle.is--right');
  const tooltips = document.querySelectorAll('.win-tooltips');
  let maskState = 'hidden', linesState = 'hidden', elements = [];
  const MASK_THRESHOLD = 0.7;
  const TIP_THRESHOLD = 0.5;

  function getOpacity(el) {
    const match = (el.getAttribute('style') || '').match(/opacity:\s*([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }
  function applyMask() {
    const iRect = illus.getBoundingClientRect();
    const lRect = leftEl.getBoundingClientRect();
    const rRect = rightEl.getBoundingClientRect();
    const lCx = lRect.left - iRect.left + lRect.width / 2;
    const lCy = lRect.top - iRect.top + lRect.height / 2;
    const lR = lRect.width / 2;
    const rCx = rRect.left - iRect.left + rRect.width / 2;
    const rCy = rRect.top - iRect.top + rRect.height / 2;
    const rR = rRect.width / 2;
    illus.style.clipPath = `circle(${lR}px at ${lCx}px ${lCy}px)`;
    const mask = `radial-gradient(circle ${rR}px at ${rCx}px ${rCy}px, black 99%, transparent 100%)`;
    illus.style.maskImage = mask;
    illus.style.webkitMaskImage = mask;
  }
  function removeMask() { illus.style.clipPath = ''; illus.style.maskImage = ''; illus.style.webkitMaskImage = ''; }

  function buildAnnotations(visible) {
    const svg = document.querySelector('.win-svg-overlay');
    const wrapRect = wrap.getBoundingClientRect();
    gsap.killTweensOf(svg);
    elements.forEach(({ path, dot }) => { gsap.killTweensOf(path); gsap.killTweensOf(dot); });
    svg.innerHTML = ''; svg.style.opacity = '1'; elements = [];
    [
      { el: leftEl, side: 'left', color: 'var(--_zig---colors--green-500)' },
      { el: rightEl, side: 'right', color: '#87bbd9' },
    ].forEach(({ el, side, color }) => {
      const cr = el.getBoundingClientRect();
      const cx = cr.left - wrapRect.left + cr.width / 2;
      const cy = cr.top - wrapRect.top + cr.height / 2;
      const r = cr.width / 2;
      el.querySelectorAll('.win-tooltip').forEach((tooltip, i) => {
        const tr = tooltip.getBoundingClientRect();
        const x0 = side === 'left' ? tr.left - wrapRect.left : tr.right - wrapRect.left;
        const y1 = tr.bottom - wrapRect.top;
        let mx, my, d;
        if (i === 1) {
          mx = side === 'left' ? cx - r : cx + r; my = y1;
          d = `M ${x0} ${y1} L ${mx} ${my}`;
        } else {
          const ANGLE = (30 * Math.PI) / 180;
          const x1raw = side === 'left' ? tr.right - wrapRect.left : tr.left - wrapRect.left;
          const minOffset = 32;
          const x1 = side === 'left' ? Math.min(x1raw, cx - minOffset) : Math.max(x1raw, cx + minOffset);
          const dx = (side === 'left' ? 1 : -1) * Math.cos(ANGLE);
          const dy = (cy > y1 ? 1 : -1) * Math.sin(ANGLE);
          const ax = x1 - cx, ay = y1 - cy;
          const b = 2 * (ax * dx + ay * dy);
          const c = ax * ax + ay * ay - r * r;
          const disc = b * b - 4 * c;
          const t = disc >= 0 ? [(-b - Math.sqrt(disc)) / 2, (-b + Math.sqrt(disc)) / 2].filter((t) => t > 0).sort((a, b) => a - b)[0] : 60;
          mx = x1 + t * dx; my = y1 + t * dy;
          d = `M ${x0} ${y1} L ${x1} ${y1} L ${mx} ${my}`;
        }
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '1');
        path.setAttribute('fill', 'none');
        const len = path.getTotalLength();
        path.setAttribute('stroke-dasharray', len);
        path.setAttribute('stroke-dashoffset', visible ? '0' : len);
        svg.appendChild(path);
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', mx); dot.setAttribute('cy', my); dot.setAttribute('r', '3');
        dot.setAttribute('fill', color);
        dot.style.opacity = visible ? 1 : 0;
        svg.appendChild(dot);
        elements.push({ path, dot, len, delay: i * 0.15 });
      });
    });
  }
  function drawAnnotations() {
    if (!fullMode()) return;
    buildAnnotations(false);
    elements.forEach(({ path, dot, delay }) => {
      gsap.to(path, { strokeDashoffset: 0, duration: 0.5, delay, ease: 'power2.out' });
      gsap.to(dot, { opacity: 1, duration: 0.2, delay: delay + 0.45 });
    });
  }
  function redrawInstant() { if (!fullMode()) return; buildAnnotations(true); }
  function hideLines() {
    const svg = document.querySelector('.win-svg-overlay');
    if (!svg) return;
    elements.forEach(({ path, dot, len }) => {
      gsap.killTweensOf(path); gsap.killTweensOf(dot);
      gsap.to(path, { strokeDashoffset: len, duration: 0.3, delay: 0.15, ease: 'power2.in' });
      gsap.to(dot, { opacity: 0, duration: 0.15, delay: 0.1 });
    });
    gsap.to(svg, { opacity: 0, duration: 0.3, delay: 0.4 });
  }
  function clearLines() {
    const svg = document.querySelector('.win-svg-overlay');
    if (!svg) return;
    gsap.killTweensOf(svg);
    elements.forEach(({ path, dot }) => { gsap.killTweensOf(path); gsap.killTweensOf(dot); });
    svg.innerHTML = ''; svg.style.opacity = '0'; elements = [];
  }
  new MutationObserver(() => {
    const opacity = getOpacity(illus);
    if (opacity >= MASK_THRESHOLD && maskState === 'hidden') { maskState = 'shown'; requestAnimationFrame(applyMask); }
    else if (opacity < MASK_THRESHOLD && maskState === 'shown') { maskState = 'hidden'; removeMask(); }
  }).observe(illus, { attributes: true, attributeFilter: ['style'] });
  new MutationObserver(() => {
    const opacity = getOpacity(tooltips[0]);
    if (opacity >= TIP_THRESHOLD && linesState === 'hidden') { linesState = 'shown'; if (fullMode()) drawAnnotations(); }
    else if (opacity < TIP_THRESHOLD && linesState === 'shown') { linesState = 'hidden'; if (fullMode()) hideLines(); }
  }).observe(tooltips[0], { attributes: true, attributeFilter: ['style'] });
  let resizeTimer;
  window.addEventListener('resize', () => {
    const svg = document.querySelector('.win-svg-overlay');
    if (svg) { gsap.killTweensOf(svg); gsap.set(svg, { opacity: 0 }); }
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (maskState === 'shown') applyMask();
      const linesVisible = fullMode() && getOpacity(tooltips[0]) >= TIP_THRESHOLD;
      if (linesVisible) { linesState = 'shown'; drawAnnotations(); }
      else { linesState = 'hidden'; clearLines(); }
    }, 150);
  });
})();


/* ---- script_16 : body background-color scroll transitions ----------------*/
(function () {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const stepsSection = document.querySelector('.steps-section');
  ScrollTrigger.matchMedia({
    '(min-width: 992px)': function () {
      ScrollTrigger.create({ trigger: '.wins-animation-track', start: 'top center',
        onEnter: () => (body.style.backgroundColor = 'var(--_zig---colors--black)'),
        onLeaveBack: () => (body.style.backgroundColor = 'var(--_zig---colors--gray-50)') });
      ScrollTrigger.create({ trigger: '.steps-animation-track', start: 'top center',
        onEnter: () => (body.style.backgroundColor = 'var(--_zig---colors--green-500)'),
        onLeaveBack: () => (body.style.backgroundColor = 'var(--_zig---colors--black)') });
      ScrollTrigger.create({ trigger: '.steps-section', start: 'bottom 50%',
        onEnter: () => (stepsSection.style.backgroundColor = 'var(--_zig---colors--green-500)'),
        onLeaveBack: () => (stepsSection.style.backgroundColor = 'transparent') });
      ScrollTrigger.create({ trigger: '.steps-section', start: 'bottom 20%',
        onEnter: () => (body.style.backgroundColor = 'var(--_zig---colors--gray-50)'),
        onLeaveBack: () => (body.style.backgroundColor = 'var(--_zig---colors--green-500)') });
      return () => { body.style.backgroundColor = ''; if (stepsSection) stepsSection.style.backgroundColor = ''; };
    },
  });
  window.addEventListener('load', () => { ScrollTrigger.refresh(); });
})();


/* ---- script_17 : STEPS wheel — scrubbed rotation carousel ----------------*/
(function () {
  gsap.registerPlugin(ScrollTrigger);
  const wrap = document.querySelector('.steps-animation-wrapp');
  const wheel = document.querySelector('.sales-figure-wheel');
  const cards = [...document.querySelectorAll('.sales-cards_track .sales-card')];
  if (!wrap || !wheel || !cards.length) return;
  if (window.innerWidth <= 767) return;

  const lineStart = -35, lineStep = 30;
  const angles = cards.map((_, i) => lineStart + (cards.length - 1 - i) * lineStep);
  gsap.set(cards, { clearProps: 'all' });
  gsap.set(wheel, { clearProps: 'all' });

  requestAnimationFrame(() => {
    const wR = wheel.getBoundingClientRect();
    const wcx = wR.left + wR.width / 2;
    const wcy = wR.top + wR.height / 2;
    const meta = cards.map((card) => {
      const r = card.getBoundingClientRect();
      return { naturalCx: r.left + r.width / 2, deltaY: r.top + r.height / 2 - wcy };
    });
    const cta = cards[cards.length - 1];
    const ctaR = cta.getBoundingClientRect();
    const track = document.querySelector('.sales-cards_track');
    const targetCx = track.getBoundingClientRect().left + ctaR.width / 2;
    const cotTarget = (targetCx - wcx) / meta[cards.length - 1].deltaY;
    const ctaFinalAngle = (Math.atan2(1, cotTarget) * 180) / Math.PI;
    const totalRotation = Math.min(180, ctaFinalAngle - lineStart);

    function tick(rotation) {
      cards.forEach((card, i) => {
        const rad = ((angles[i] + rotation) * Math.PI) / 180;
        const sinA = Math.sin(rad);
        let rx;
        if (sinA <= 0.05) { rx = wcx + Math.sign(Math.cos(rad)) * window.innerWidth * 2; }
        else { rx = wcx + meta[i].deltaY * (Math.cos(rad) / sinA); }
        gsap.set(card, { x: rx - meta[i].naturalCx });
      });
    }
    tick(0);
    gsap.to(wheel, {
      rotation: totalRotation, ease: 'none',
      scrollTrigger: { trigger: wrap, start: '50% top-=200', end: 'bottom bottom-=400', scrub: true,
        onUpdate: (self) => tick(self.progress * totalRotation) },
    });
  });
})();


/* ---- script_18 : testimonial Splide slider -------------------------------*/
document.addEventListener('DOMContentLoaded', () => {
  const customersSlider = document.querySelector('.testim_slider');
  if (!customersSlider) return;
  new Splide(customersSlider, {
    perPage: 1, perMove: 1, type: 'loop', arrows: true, pagination: true,
    rewindSpeed: 400, updateOnMove: true,
  }).mount();
});
