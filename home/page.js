/* ============================================================================
   page.js — reveals, the section rail, the nav hairline, the step rail.
   Reveals fire once at top 80% and never re-run on scroll-back (INTERACTION.md 3.1).
   ========================================================================= */
(function () {
  'use strict';
  var d = document.documentElement;
  clearTimeout(window.__fbFail);
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- hero: one type move, once, after the fonts (capped so LCP is not held) */
  var ready = function () { requestAnimationFrame(function () { d.classList.add('is-ready'); }); };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 350); })]).then(ready);
  } else ready();

  /* ---- reveals ------------------------------------------------------------ */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function show(el) { el.classList.add('is-in'); }
  if (!('IntersectionObserver' in window) || RM.matches) {
    reveals.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // in view at top 80%, or already scrolled past (a reload mid-page)
        if (en.isIntersecting || en.boundingClientRect.top < 0) { show(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -20% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    // the top-80% trigger leaves the bottom fifth of a parked screen unrevealed (an anchor jump,
    // a short viewport): anything on screen at rest for 450ms shows anyway
    var timers = new Map();
    var rest = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting && !el.classList.contains('is-in')) {
          timers.set(el, setTimeout(function () { show(el); rest.unobserve(el); }, 450));
        } else if (!en.isIntersecting && timers.has(el)) {
          clearTimeout(timers.get(el)); timers.delete(el);
        }
      });
    });
    reveals.forEach(function (el) { rest.observe(el); });
  }

  /* ---- nav hairline once the page has moved -------------------------------- */
  var nav = document.getElementById('nav');
  var sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(function (es) { nav.classList.toggle('is-scrolled', !es[0].isIntersecting); }).observe(sentinel);

  /* ---- the section rail: done / live / ahead, square markers --------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-rail-link]'));
  var secs = Array.prototype.slice.call(document.querySelectorAll('[data-rail]'));
  var cur = -1;
  function setRail(i) {
    if (i === cur) return;
    cur = i;
    links.forEach(function (a, k) {
      a.classList.toggle('is-done', k < i);
      a.classList.toggle('is-live', k === i);
      if (k === i) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  // The live section is the last one whose top has passed 55% of the viewport. Decided from positions, because
  // IntersectionObserver ignores rootMargin inside a cross-origin frame (the Artifact preview is one); the
  // observer below only says when to look again.
  var railQueued = false;
  function pickRail() {
    railQueued = false;
    var line = window.innerHeight * 0.55, idx = 0;
    var still = !!document.querySelector('.story.is-deck');
    for (var i = 0; i < secs.length; i++) {
      var el = secs[i];
      // still mode stacks the passages in one place, so the beats stand in for them; in flow the beats are hidden
      if (still ? el.classList.contains('psg') : el.classList.contains('beat')) continue;
      if (el.getBoundingClientRect().top <= line) idx = +el.getAttribute('data-rail');
    }
    setRail(idx);
  }
  function queueRail() { if (!railQueued) { railQueued = true; requestAnimationFrame(pickRail); } }
  if ('IntersectionObserver' in window) {
    var steps01 = [];
    for (var t = 0; t <= 1.0001; t += 0.05) steps01.push(+t.toFixed(2));
    var rio = new IntersectionObserver(queueRail, { threshold: steps01 });
    secs.forEach(function (s) { rio.observe(s); });
  }
  window.addEventListener('resize', queueRail, { passive: true });
  pickRail();

  /* ---- reading progress across the whole page (progress may scrub) ---------- */
  var readbar = document.getElementById('readbar');
  var readbarStarted = false;
  function initReadbar() {
    // GSAP loads after this file; start once it is actually there (same guard as the step rail)
    if (readbarStarted || !readbar || !window.gsap || !window.ScrollTrigger) return;
    readbarStarted = true;
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) { readbar.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; }
    });
  }
  initReadbar();
  document.addEventListener('DOMContentLoaded', initReadbar);
  window.addEventListener('load', initReadbar);

  /* ---- How it works as a wheel (Ben, 2026-10-10) ----------------------------
     The section holds one screen (.how-pin, CSS sticky, so the page keeps its real length) while the four steps
     turn: the step in focus sits at the top, flat; the next wait below, tilted back and faded; a passed one tips over
     the top and goes. Each keeps its square, and the line runs square to square. After step 4 reaches the top and
     holds, the frame fades and step 4's square grows into the done mark (a FLIP from the square's box), the tick
     draws, and the guarantee comes up under it. Scroll sets a target; each frame eases toward it (0.16 a frame),
     so the wheel turns smoothly without taking over the scroll. Only transform and opacity change.
     Off with reduced motion or a screen under 560px tall: the section is the plain list. */
  function initWheel() {
    var sec = document.getElementById('how');
    var steps = document.getElementById('steps');
    var pin = sec && sec.querySelector('.how-pin');
    if (!sec || !steps || !pin) return;
    var head = sec.querySelector('.sec__head');
    var guar = sec.querySelector('.guarantee');
    var mark = sec.querySelector('.how-done__mark');
    var tickEl = sec.querySelector('.how-done__tick');
    var list = steps.querySelector('.steps__list');
    var items = Array.prototype.slice.call(steps.querySelectorAll('.st'));
    var nodes = items.map(function (it) { return it.querySelector('.st__node'); });
    var n = items.length;
    var END = n - 1 + 1.5;          // three turns, then 0.2 hold, 0.8 morph, 0.5 hold on the done state
    if (!n || !head || !guar || !mark || !tickEl) return;
    var segs = [];
    for (var k = 0; k < n - 1; k++) {
      var sg = document.createElement('i');
      sg.className = 'whl-seg';
      sg.setAttribute('aria-hidden', 'true');
      sg.appendChild(document.createElement('span'));
      segs.push(sg);
    }
    var on = false, rowH = 0, nodeOff = 0, nodeH = 12, p = 0, target = 0, raf = 0, markRest = null, stack = [];

    function want() { return !RM.matches && window.innerHeight >= 560; }
    function navH() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64; }
    function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function easeOut(x) { return 1 - Math.pow(1 - x, 3); }

    function enable() {
      on = true;
      sec.classList.add('is-wheel');
      steps.classList.add('is-js');
      Array.prototype.forEach.call(sec.querySelectorAll('.reveal'), function (r) { r.classList.add('is-in'); });
      segs.forEach(function (sg) { list.appendChild(sg); });
      measure();
    }
    function disable() {
      on = false;
      cancelAnimationFrame(raf);   // a frame already queued would paint the wheel's last state onto the plain list
      raf = 0;
      sec.classList.remove('is-wheel');
      sec.style.removeProperty('--how-h');
      segs.forEach(function (sg) { if (sg.parentNode) sg.parentNode.removeChild(sg); });
      items.forEach(function (it) {
        it.style.transform = ''; it.style.opacity = '';
        for (var c = 0; c < it.children.length; c++) it.children[c].style.transform = '';
      });
      nodes.forEach(function (nd) { if (nd) nd.style.visibility = ''; });
      [head, guar, mark].forEach(function (e) { e.style.opacity = ''; e.style.transform = ''; });
      tickEl.style.strokeDashoffset = '';
    }
    // the tallest step sets the spacing; the section is one held screen plus END turns of 55% of a screen each
    function measure() {
      // each step sits where it would in a plain stacked list (its own height plus a gap), so steps never overlap
      // whatever their wrap; rowH (the tallest plus the gap) only sizes the line segments
      var gap = window.innerWidth < 900 ? 36 : 44, acc = 0;
      rowH = 0;
      stack = items.map(function (it) { var at = acc; acc += it.offsetHeight + gap; rowH = Math.max(rowH, it.offsetHeight + gap); return at; });
      if (nodes[0]) { nodeOff = items[0].offsetTop + nodes[0].offsetTop; nodeH = nodes[0].offsetHeight; }
      var len = Math.round(pin.offsetHeight * (1 + END * 0.6)) + 'px', changed = sec.style.getPropertyValue('--how-h') !== len;
      sec.style.setProperty('--how-h', len);
      markRest = null;
      return changed;
    }
    function progress() {
      var run = sec.offsetHeight - pin.offsetHeight;
      if (run <= 0) return 0;
      return clamp01((navH() - sec.getBoundingClientRect().top) / run) * END;
    }
    function render(p) {
      var w = Math.min(p, n - 1);                       // 0: step 1 on top … 3: step 4 on top
      var t = clamp01((p - (n - 1) - 0.2) / 0.8);         // the morph
      var fade = 1 - clamp01(t / 0.2);                    // the frame goes first, before the square crosses its words
      var f = Math.round(w), ys = [], ops = [];
      var w0 = Math.floor(w), sw = stack[w0] + (w0 < n - 1 ? (stack[w0 + 1] - stack[w0]) * (w - w0) : 0);
      for (var i = 0; i < n; i++) {
        var d = i - w, y = stack[i] - sw, rx, sc, op;
        if (d >= 0) {                                     // waiting: each one further back
          rx = -Math.min(d, 2) * 14;
          sc = 1 - Math.min(d, 2) * 0.05;
          // the next step stays readable (0.8: body text about 4.7:1 on white); the one after is a ghost
          op = d <= 1 ? 1 - d * 0.2 : Math.max(0, 0.8 - (d - 1) * 0.64);
        } else {                                          // passed: tips over the top
          y *= 0.55;
          rx = Math.min(-d, 1) * 50;
          sc = 1 + d * 0.06;
          op = Math.max(0, 1 + d * 1.6);
        }
        op *= fade;
        ys.push(y); ops.push(op);
        var it = items[i];
        it.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
        it.style.opacity = op.toFixed(3);
        var tf = 'rotateX(' + rx.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        for (var c = 0; c < it.children.length; c++) {
          if (!it.children[c].classList.contains('st__node')) it.children[c].style.transform = tf;
        }
        it.classList.toggle('is-done', i < f || (i === f && t > 0));
        it.classList.toggle('is-live', i === f && t === 0);
      }
      // the line, from the foot of one square to the head of the next; it fills as the wheel passes it
      for (var k = 0; k < segs.length; k++) {
        var top = ys[k] + nodeOff + nodeH + 4, len = Math.max(0, ys[k + 1] - ys[k] - nodeH - 8);
        segs[k].style.top = '0px';
        segs[k].style.height = rowH + 'px';
        segs[k].style.transformOrigin = '50% 0';
        segs[k].style.transform = 'translateY(' + top.toFixed(1) + 'px) scaleY(' + (len / rowH).toFixed(4) + ')';
        segs[k].style.opacity = Math.min(ops[k], ops[k + 1]).toFixed(3);
        segs[k].firstChild.style.transform = 'scaleY(' + clamp01(w - k).toFixed(3) + ')';
      }
      head.style.opacity = fade.toFixed(3);
      var last = nodes[n - 1];
      if (t > 0 && last) {
        var pr = pin.getBoundingClientRect();
        if (!markRest) {
          mark.style.transform = 'none';
          var mr = mark.getBoundingClientRect();
          markRest = { dx: mr.left + mr.width / 2 - pr.left, dy: mr.top + mr.height / 2 - pr.top, w: mr.width };
        }
        markRest.cx = pr.left + markRest.dx;
        markRest.cy = pr.top + markRest.dy;
        var nr = last.getBoundingClientRect();
        markRest.from = nr.width ? { cx: nr.left + nr.width / 2, cy: nr.top + nr.height / 2, w: nr.width } : null;
        // in order: the frame fades (t 0 to 0.2) with the square still on step 4's dot, then the square travels
        // (0.2 to 0.7), the tick draws (0.65 to 0.9), the guarantee comes up (0.7 to 1). The square never crosses
        // words that are still on screen.
        var from = markRest.from || markRest, e = easeOut(clamp01((t - 0.2) / 0.5)), s0 = from.w / markRest.w;
        mark.style.transform = 'translate(' + ((from.cx - markRest.cx) * (1 - e)).toFixed(1) + 'px,' +
          ((from.cy - markRest.cy) * (1 - e)).toFixed(1) + 'px) scale(' + (s0 + (1 - s0) * e).toFixed(4) + ')';
        mark.style.opacity = '1';
        last.style.visibility = 'hidden';
        tickEl.style.strokeDashoffset = (1 - easeOut(clamp01((t - 0.65) / 0.25))).toFixed(3);
        var g = clamp01((t - 0.7) / 0.3);
        guar.style.opacity = g.toFixed(3);
        guar.style.transform = 'translate(-50%,' + (12 * (1 - g)).toFixed(1) + 'px)';
      } else {
        mark.style.opacity = '0';
        if (last) last.style.visibility = '';
        tickEl.style.strokeDashoffset = '1';
        guar.style.opacity = '0';
        guar.style.transform = '';
        if (markRest) markRest.from = null;
      }
    }
    function loop() {
      raf = 0;
      if (!on) return;
      var dp = target - p;
      p = Math.abs(dp) < 0.0015 ? target : p + dp * 0.16;
      render(p);
      if (p !== target) raf = requestAnimationFrame(loop);
    }
    function onScroll() {
      if (!on) return;
      target = progress();
      if (!raf) raf = requestAnimationFrame(loop);
    }
    var lastW = window.innerWidth;
    function settle(decide) {
      var flipped = false;
      if (decide || window.innerWidth !== lastW) {
        lastW = window.innerWidth;
        var w = want();
        if (w && !on) { enable(); flipped = true; } else if (!w && on) { disable(); flipped = true; }
      }
      var grew = false;
      if (on) { grew = measure(); target = p = progress(); render(p); }
      if ((flipped || grew) && window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
    if (want()) { enable(); target = p = progress(); render(p); }
    window.addEventListener('scroll', onScroll, { passive: true });
    // A resize re-sizes the story above (its beats follow the screen height) and this section, so a reader further
    // down would be left somewhere else. Below the story and outside this section, the reader's place (the section
    // in view and where it sits on screen) is noted whenever scrolling has been still for 220ms, so it always
    // describes the layout from before a resize. A resize that lands while the reader is at rest puts that section
    // back where it was; one that lands mid-scroll (a phone's toolbar, a smooth jump to an anchor) is left alone,
    // and any wheel, touch, key or pointer input cancels a pending restore. (In the story, stage.js keeps the reader
    // on their step; in this section the wheel keeps its own position.)
    var rt = 0, rt2 = 0, anchor = null, rest = null, restT = 0, lastScrollAt = 0, lastInputAt = 0, restoredAt = -1;
    function noteAnchor() {
      var story = document.querySelector('.story');
      if (story && story.getBoundingClientRect().bottom > 0) return null;
      // probe the reading column just under the nav; on a phone a held diagram covers that, so probe just below it.
      // In "Who builds it" the passage (.bp) is the anchor, so the reader keeps their place and their beat.
      var x = window.innerWidth < 900 ? window.innerWidth / 2 : window.innerWidth * 0.25, y = navH() + 12;
      var hit = document.elementFromPoint(x, y);
      var held = hit && hit.closest ? hit.closest('.ben2__fig') : null;
      if (held) hit = document.elementFromPoint(x, held.getBoundingClientRect().bottom + 12);
      var el = hit && hit.closest ? hit.closest('.bp, section[id], footer') : null;
      if (!el || el === sec) return null;
      return { el: el, top: el.getBoundingClientRect().top };
    }
    function restoreAnchor(a) {
      if (!a) return;
      var d = a.el.getBoundingClientRect().top - a.top;
      if (Math.abs(d) > 1) window.scrollTo({ top: window.scrollY + d, behavior: 'instant' });
      restoredAt = window.scrollY;
    }
    function cancelRestore() { anchor = null; clearTimeout(rt2); rt2 = 0; }
    window.addEventListener('scroll', function () {
      lastScrollAt = performance.now();
      clearTimeout(restT);
      restT = setTimeout(function () { rest = noteAnchor(); }, 220);
    }, { passive: true });
    // input means the reader is doing something (a click that starts a jump, a flick, a key): never restore within
    // a second of it, so a jump in flight on a slow device is not mistaken for a reader at rest
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) {
      window.addEventListener(t, function () { lastInputAt = performance.now(); cancelRestore(); }, { passive: true });
    });
    window.addEventListener('load', function () { setTimeout(function () { rest = noteAnchor(); }, 300); });
    window.addEventListener('resize', function () {
      if (!rt) {
        clearTimeout(rt2); rt2 = 0;
        var now = performance.now();
        anchor = now - lastScrollAt > 220 && now - lastInputAt > 1000 ? rest : null;   // busy: leave the reader alone
      }
      clearTimeout(rt);
      rt = setTimeout(function () {
        rt = 0;
        var a = anchor;
        settle(false);
        restoreAnchor(a);
        // once more after stage.js's own re-layout (150 + 320ms), only if nothing has moved the page since
        if (a) rt2 = setTimeout(function () { rt2 = 0; if (anchor === a && window.scrollY === restoredAt) restoreAnchor(a); anchor = null; }, 420);
        else anchor = null;
      }, 160);
    }, { passive: true });
    RM.addEventListener('change', function () { settle(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (on) settle(false); });
  }
  initWheel();

  /* ---- Who builds it: the panel shows the beat of the passage in view (Ben, 2026-10-10) ----------------
     Desktop: the last passage whose text has crossed 55% of the screen. Phone: the last one whose text has
     reached the foot of the held diagram, so the words under the diagram are always the beat on show. */
  (function () {
    var sec = document.getElementById('ben'), panel = document.getElementById('benFig');
    var svg = panel && panel.querySelector('svg'), fig = sec && sec.querySelector('.ben2__fig');
    if (!sec || !svg || !fig) return;
    var ps = Array.prototype.slice.call(sec.querySelectorAll('.bp'));
    var bts = Array.prototype.slice.call(sec.querySelectorAll('.bpbeat'));
    var copy = sec.querySelector('.ben2__copy');
    var mqPhone = window.matchMedia('(max-width: 899px)');
    var mqWide = window.matchMedia('(min-width: 900px)');
    var queued = false, cur = 0, deck = false;
    sec.classList.add('is-js');

    /* Deck mode (Ben 2026-10-11): the passages stand still and crossfade, as the story's .psg do, and the
       .bpbeat spacers carry the scroll. Same guard as the story: only where EVERY passage fits the still
       box, measured rather than guessed from a breakpoint - the fit card (beat 5) is the tallest. */
    function setMode() {
      var want = false;
      if (mqWide.matches && copy && bts.length) {
        sec.classList.add('is-deck');
        var room = copy.getBoundingClientRect().height;
        want = ps.every(function (p) {
          var i = p.querySelector('.bp__in') || p;
          return i.scrollHeight <= room - 8;
        });
      }
      deck = want;
      sec.classList.toggle('is-deck', deck);
    }

    function pick() {
      queued = false;
      var beat, i;
      if (deck) {
        // the beats carry the scroll, so they say which passage is on
        beat = +bts[0].getAttribute('data-beat');
        for (i = 0; i < bts.length; i++) {
          if (bts[i].getBoundingClientRect().top <= window.innerHeight * 0.5) beat = +bts[i].getAttribute('data-beat');
        }
      } else {
        // phone: 40% of the way down the text area under the diagram, so the panel changes as the new words arrive
        var fb = fig.getBoundingClientRect().bottom;
        var line = mqPhone.matches ? fb + 0.4 * (window.innerHeight - fb) : window.innerHeight * 0.55;
        beat = +ps[0].getAttribute('data-beat');
        for (i = 0; i < ps.length; i++) {
          var inner = ps[i].querySelector('.bp__in') || ps[i];
          if (inner.getBoundingClientRect().top <= line) beat = +ps[i].getAttribute('data-beat');
        }
      }
      if (beat === cur) return;
      cur = beat;
      panel.setAttribute('data-beat', beat);
      ps.forEach(function (p) { p.classList.toggle('is-active', +p.getAttribute('data-beat') === beat); });
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(pick); } }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', function () { setMode(); cur = -1; queue(); }, { passive: true });
    setMode();
    cur = -1;
    pick();
    // labels hold their size as the panel shrinks: the same --s rule as the story's diagram
    function scale() {
      var w = svg.getBoundingClientRect().width;
      if (!w) return;
      svg.style.setProperty('--s', (w / 640).toFixed(3));
      svg.classList.toggle('is-small', w / 640 < 0.8);
    }
    scale();
    if ('ResizeObserver' in window) new ResizeObserver(scale).observe(svg);
  })();

  /* ---- How it works: the rail fill tracks scroll (progress may scrub) ------
     GSAP loads after this file, so the hero never waits on it. This file runs
     while readyState is already 'interactive', so readyState cannot say whether
     GSAP has run: try now, at DOMContentLoaded (all deferred scripts done) and at
     load, and start once GSAP is actually there. */
  var stepsStarted = false;
  function tryInitSteps() {
    if (stepsStarted || !window.gsap || !window.ScrollTrigger) return;
    stepsStarted = true;
    initSteps();
  }
  tryInitSteps();
  document.addEventListener('DOMContentLoaded', tryInitSteps);
  window.addEventListener('load', tryInitSteps);
  // the brand curve as a GSAP ease function (cubic-bezier solver)
  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (p) {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      var t = p;
      for (var i = 0; i < 8; i++) {
        var e = sx(t) - p, d = dx(t);
        if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return sy(Math.min(1, Math.max(0, t)));
    };
  }
  function initSteps() {
  var steps = document.getElementById('steps');
  var fill = document.getElementById('stepsFill');
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (!(steps && fill)) return;
  var ease = bezier(0.23, 1, 0.32, 1);   // --rc-ease-out
  {
    gsap.registerPlugin(ST);
    var items = Array.prototype.slice.call(steps.querySelectorAll('.st'));
    var vertical = window.matchMedia('(max-width: 899px)');
    steps.classList.add('is-js');
    var track = steps.querySelector('.steps__track');
    // the track runs from the first node to the last, so k/(n-1) of the fill lands on node k
    var sizeTrack = function () {
      var box = steps.getBoundingClientRect();
      var a = items[0].querySelector('.st__node').getBoundingClientRect();
      var b = items[items.length - 1].querySelector('.st__node').getBoundingClientRect();
      track.style.left = track.style.width = track.style.top = track.style.height = '';
      if (vertical.matches) {
        track.style.top = (a.top + a.height / 2 - box.top) + 'px';
        track.style.height = (b.top - a.top) + 'px';
        track.style.bottom = 'auto';
      } else {
        track.style.left = (a.left + a.width / 2 - box.left) + 'px';
        track.style.width = (b.left - a.left) + 'px';
        track.style.right = 'auto';
        track.style.bottom = '';
      }
    };
    var paint = function (p, instant) {
      if (steps.closest('.is-wheel')) return;   // the wheel (below) sets the squares itself
      var v = vertical.matches;
      var to = { scaleX: v ? 1 : p, scaleY: v ? p : 1, overwrite: true };
      if (instant || RM.matches) gsap.set(fill, to);
      else gsap.to(fill, Object.assign(to, { duration: 0.5, ease: ease }));
      var n = items.length, done = p > 0.995;
      items.forEach(function (it, k) {
        var reached = p >= k / (n - 1) - 0.02;
        var next = k < n - 1 && p >= (k + 1) / (n - 1) - 0.02;
        it.classList.toggle('is-done', reached && (next || done));
        it.classList.toggle('is-live', reached && !next && !done);
      });
    };
    var trig = ST.create({
      trigger: steps, start: 'top 78%', end: 'bottom 58%',
      onUpdate: function (self) { paint(RM.matches ? (self.progress > 0 ? 1 : 0) : self.progress); },
      onRefresh: function (self) { sizeTrack(); paint(RM.matches ? (self.progress > 0 ? 1 : 0) : self.progress, true); }
    });
    sizeTrack();
    paint(trig.progress, true);
    vertical.addEventListener('change', function () { sizeTrack(); paint(trig.progress, true); });
  }
  }
})();
