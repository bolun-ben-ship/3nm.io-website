/* ============================================================================
   stage.js — the scroll-tracked diagram (built to the diagram-design skill).

   The story has 12 steps (the hero, then 11 passages). On desktop the passages
   stand still in one place and fade (Ben, 2026-10-10: "dont do a btm to up
   scroll"); empty beats give the scroll its length, and the beat crossing mid-
   screen picks the step. On phones the passages stay in flow and the one in focus
   is full strength. Every SVG element whose data-show range holds the step gets
   .is-on and CSS fades it, so the diagram always matches the words in view.

   Layers, by INTERACTION.md's classification:
     narrative  — step changes (520ms, staggered), the spreadsheet going stale,
                  the slipped job dropping, the count to 80 jobs a day and the three ticks
     ambient    — figure A: coins, the sheet and the step-6 traffic (movers); figure B: one token travels
                  the live connectors. All stop 5s after the reader
                  stops (WCAG 2.2.2), offscreen, when hidden, or under reduced motion
     hover      — a dotted phrase in the text lights the part of the diagram it names
   Reduced motion: every step lands on its finished state at once.
   No JS (or this file fails): the SVG shows its hero frame (.s0) and stays.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.querySelector('.story');
  var stage = document.getElementById('stage');
  var svg = stage && stage.querySelector('.stage__svg');
  if (!root || !svg) return;

  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqMobile = window.matchMedia('(max-width: 899px)');
  var mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || svg).querySelectorAll(sel)); }

  /* ---- what is on in each step ------------------------------------------ */
  function parse(list) {
    return list.split(',').map(function (part) {
      var ab = part.split('-').map(Number);
      return [ab[0], ab.length > 1 ? ab[1] : ab[0]];
    });
  }
  function holds(n, ranges) {
    for (var i = 0; i < ranges.length; i++) if (n >= ranges[i][0] && n <= ranges[i][1]) return true;
    return false;
  }
  var items = $$('[data-show]').map(function (el) {
    return {
      el: el,
      show: parse(el.getAttribute('data-show')),
      dim: el.hasAttribute('data-dim') ? parse(el.getAttribute('data-dim')) : null
    };
  });

  /* ---- labels hold ~10-11px on screen whatever the stage size ------------ */
  function sizeLabels() {
    $$('.tag').forEach(function (g) {
      var t = g.querySelector('text'), bg = g.querySelector('rect');
      var fs = parseFloat(getComputedStyle(t).fontSize) || 10;
      var x = +g.getAttribute('data-x'), y = +g.getAttribute('data-y');
      var h = Math.round(fs * 1.6), w = Math.ceil(t.getComputedTextLength() + 12);
      if (g.hasAttribute('data-cx')) x = +g.getAttribute('data-cx') - w / 2;
      bg.setAttribute('x', x);
      bg.setAttribute('y', y);
      bg.setAttribute('height', h);
      bg.setAttribute('width', w);
      t.setAttribute('x', x + 6);
      t.setAttribute('y', (y + h / 2 + fs * 0.36).toFixed(2));
    });
    $$('.lbl').forEach(function (g) {
      var t = g.querySelector('text'), m = g.querySelector('rect');
      var fs = parseFloat(getComputedStyle(t).fontSize) || 10;
      var cx = +g.getAttribute('data-cx'), ys = +g.getAttribute('data-ys');
      var tw = t.getComputedTextLength(), h = Math.round(fs * 1.5);
      if (g.getAttribute('data-side') === 'left') {
        // beside a vertical stroke: 8px clear of it, vertically centred
        m.setAttribute('x', (cx - 8 - tw - 8).toFixed(2));
        m.setAttribute('y', (ys - h / 2).toFixed(2));
        m.setAttribute('width', (tw + 8).toFixed(2));
        t.setAttribute('text-anchor', 'end');
        t.setAttribute('x', cx - 12);
        t.setAttribute('y', (ys + fs * 0.36).toFixed(2));
      } else {
        // above a horizontal stroke, with a 6px gap (diagram-design connector rule 2)
        m.setAttribute('x', (cx - tw / 2 - 4).toFixed(2));
        m.setAttribute('y', (ys - 6 - h).toFixed(2));
        m.setAttribute('width', (tw + 8).toFixed(2));
        t.setAttribute('x', cx);
        t.setAttribute('y', (ys - 6 - h / 2 + fs * 0.36).toFixed(2));
      }
      m.setAttribute('height', h);
    });
  }
  function setScale() {
    var w = svg.getBoundingClientRect().width;
    if (!w) return;
    var sc = w / 640;
    svg.style.setProperty('--s', sc.toFixed(3));
    svg.classList.toggle('is-small', sc < 0.8);
    sizeLabels();
  }

  /* ---- the proof: count to 80 jobs a day, then the office, drivers and customers tick onto one record ---- */
  var countN = svg.querySelector('#countN');
  var seqTimers = [], countRaf = 0;
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function setCount(v) { if (countN) countN.textContent = Math.round(v).toLocaleString('en-US'); }
  function countUp(to, ms) {
    cancelAnimationFrame(countRaf);
    var t0 = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - t0) / ms);
      setCount(to * easeOut(p));
      if (p < 1) countRaf = requestAnimationFrame(tick);
    })(t0);
  }
  function runSeq(n, prev, instant) {
    seqTimers.forEach(clearTimeout);
    seqTimers = [];
    cancelAnimationFrame(countRaf);
    if (n === 9 && prev < 9 && !instant && !mqRM.matches) {
      stage.setAttribute('data-seq', '');
      setCount(0);
      countUp(80, 900);
      seqTimers.push(setTimeout(function () { stage.setAttribute('data-seq', 'flag'); }, 600));    // the three show
      seqTimers.push(setTimeout(function () { stage.setAttribute('data-seq', 'fixed'); }, 1300));  // and tick
    } else if (n >= 9) {
      stage.setAttribute('data-seq', 'fixed');
      setCount(80);
    } else {
      stage.setAttribute('data-seq', '');
    }
  }

  /* ---- step changes -------------------------------------------------------- */
  var cur = -1;
  function setStep(n, instant) {
    if (n === cur) return;
    var prev = cur;
    cur = n;
    var still = instant || mqRM.matches;
    if (still) stage.classList.add('no-tx');
    stage.classList.toggle('is-jumped', !!instant);   // CSS: no shake or walk-out replay after an instant landing
    stage.setAttribute('data-step', n);
    root.classList.toggle('is-past-hero', n > 0);
    for (var k = 0; k < psgs.length; k++) psgs[k].classList.toggle('is-active', +psgs[k].getAttribute('data-step') === n);
    for (var i = 0; i < items.length; i++) {
      var it = items[i], on = holds(n, it.show);
      it.el.classList.toggle('is-on', on);
      it.el.classList.toggle('is-dim', on && !!it.dim && holds(n, it.dim));
    }
    runSeq(n, prev, instant);
    if (still && !mqRM.matches) {
      void svg.getBoundingClientRect();                // commit the frame without transitions
      requestAnimationFrame(function () { stage.classList.remove('no-tx'); });
    }
    wake();
  }

  /* ---- scroll → step ------------------------------------------------------- */
  function byNum(attr) { return function (a, b) { return +a.getAttribute(attr) - +b.getAttribute(attr); }; }
  var hero = root.querySelector('.step--hero');
  var psgs = Array.prototype.slice.call(root.querySelectorAll('.psg')).sort(byNum('data-step'));
  var beats = Array.prototype.slice.call(root.querySelectorAll('.beat')).sort(byNum('data-beat'));
  var N = 1 + psgs.length;
  var tops = [], focusLine = 0.5;
  var mqWide = window.matchMedia('(min-width: 900px)');
  var copy = root.querySelector('.story__copy');
  var deck = false;

  // Still passages only where every one of them fits the still box (Monday is the tallest);
  // otherwise the text stays in flow. Measured, not guessed from a breakpoint.
  function setMode() {
    var want = false;
    if (mqWide.matches && copy) {
      root.classList.add('is-deck');
      root.classList.remove('is-flow');
      var room = copy.getBoundingClientRect().height;
      want = psgs.every(function (p) {
        var inner = p.querySelector('.step__in') || p;
        return inner.scrollHeight <= room - 8;
      });
    }
    deck = want;
    root.classList.toggle('is-deck', deck);
    root.classList.toggle('is-flow', !deck);
    focusLine = deck ? 0.5 : (mqMobile.matches ? 0.7 : 0.65);
    document.documentElement.style.setProperty('--focus-line', focusLine);
  }
  var stageBox = root.querySelector('.story__stage');
  function inner(p) { return p.querySelector('.step__in') || p; }
  function measure() {
    var sy = window.scrollY;
    var heroTop = hero.getBoundingClientRect().top + sy;
    if (deck) {
      // still passages: the beats carry the scroll
      tops = [heroTop].concat(beats.map(function (b) { return b.getBoundingClientRect().top + sy; }));
    } else if (mqMobile.matches) {
      // phones: the line is the bottom of the sticky stage, and a passage takes focus the moment the one
      // before it has slid under the stage, so the text below the stage is always the passage in focus
      focusLine = Math.min(0.9, (stageBox.offsetHeight + 8) / window.innerHeight);
      document.documentElement.style.setProperty('--focus-line', focusLine.toFixed(3));
      tops = [heroTop, hero.getBoundingClientRect().bottom + sy].concat(psgs.slice(0, -1).map(function (p) {
        return inner(p).getBoundingClientRect().bottom + sy;
      }));
    } else {
      // short desktop screens, text in flow beside the stage: the passage's first line
      tops = [heroTop].concat(psgs.map(function (p) { return inner(p).getBoundingClientRect().top + sy; }));
    }
    tops.push(root.getBoundingClientRect().bottom + sy - window.innerHeight * (deck ? 0.5 : 0.3));
  }
  function position() {
    var y = window.scrollY + window.innerHeight * focusLine;
    if (y <= tops[0]) return 0;
    for (var i = 0; i < N; i++) {
      if (y < tops[i + 1]) return i + (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]);
    }
    return N - 0.0001;
  }
  function sync(instant) {
    if (!tops.length) measure();
    setStep(Math.min(N - 1, Math.floor(position())), instant);
  }

  if (copy) copy.addEventListener('focusin', function (e) {
    var p = deck && e.target.closest ? e.target.closest('.psg') : null;
    if (p && !p.classList.contains('is-active')) goToStep(+p.getAttribute('data-step'), true);
  });
  // land on a step in either mode (used when the layout mode changes)
  function landOn(n) {
    if (deck) { goToStep(n, true); return; }
    var p = psgs[n - 1];
    if (p) p.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  // in still mode a link to a passage goes to its beat (the passage itself never moves)
  function goToStep(n, instant) {
    measure();
    var y = n <= 0 ? 0 : tops[n] - window.innerHeight * focusLine + 48;
    window.scrollTo({ top: Math.max(0, y), behavior: instant || mqRM.matches ? 'instant' : 'smooth' });
  }
  document.addEventListener('click', function (e) {
    if (!deck || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    var id = a ? a.getAttribute('href').slice(1) : '';
    var target = id ? document.getElementById(id) : null;
    if (!target || !target.classList.contains('psg')) return;
    e.preventDefault();
    goToStep(+target.getAttribute('data-step'));
    try { history.replaceState(null, '', '#' + id); } catch (err) { /* sandboxed preview */ }
  });

  var ST = window.ScrollTrigger;
  if (window.gsap && ST) {
    window.gsap.registerPlugin(ST);
    ST.create({
      trigger: root, start: 'top bottom', end: 'bottom top',
      onUpdate: function () { sync(false); wake(); },
      onRefresh: function () { measure(); sync(cur < 0); }
    });
    window.addEventListener('load', function () { ST.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setScale(); ST.refresh(); });
  } else {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setScale);
    // GSAP missing: an observer on the focus line still drives the steps
    var io = null;
    var watch = function () {
      if (io) io.disconnect();
      measure();
      var top = (focusLine * 100 - 0.5).toFixed(1), bot = ((1 - focusLine) * 100 - 0.5).toFixed(1);
      io = new IntersectionObserver(function (es) {
        // the observer only says "look again"; position decides, same as the scroll check below
        if (es.some(function (e) { return e.isIntersecting; })) sync(cur < 0);
      }, { rootMargin: '-' + top + '% 0px -' + bot + '% 0px' });
      [hero].concat(psgs, beats).forEach(function (el) { io.observe(el); });
    };
    watch();
    mqMobile.addEventListener('change', watch);
    // a jump can land the focus line in the gap between two passages, where the observer sees nothing:
    // also re-check by position, once per frame at most (this path only runs if GSAP failed to load)
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; sync(false); wake(); });
    }, { passive: true });
  }

  /* ---- ambient: one token on the live connectors -------------------------- */
  var toks = { figB: svg.querySelector('#figB .ftok') };   // figure A's motion is the movers (below)
  var flowPaths = $$('[data-flow]').map(function (p) { return { el: p, len: 0, fig: p.closest('.fig').id }; });
  var IDLE_MS = 5000, LEG_MS = 1400;
  var raf = 0, visible = false, lastActive = performance.now(), leg = 0, legStart = 0;
  function figNow() { return cur >= 8 ? 'figB' : 'figA'; }
  function livePaths() {
    var fig = figNow();
    return flowPaths.filter(function (f) { return f.fig === fig && f.el.classList.contains('is-on'); });
  }
  /* ---- movers (Ben, 2026-10-10): a coin on each money line, the sheet arcing from the owner into the
     spreadsheet (cracking as it lands from step 3), work flying between the ops manager and the owner. Each runs
     the first of its tracks (data-paths) that is showing, on its own clock; all follow the token's rules (stop 5s
     after the reader stops, offscreen, in a hidden tab, never under reduced motion). In figure A they replace the
     single travelling token. */
  var movers = $$('.mv').map(function (m) {
    return {
      el: m,
      tracks: (m.getAttribute('data-paths') || '').split(/\s+/).map(function (id) { return id && svg.querySelector('#' + id); }).filter(Boolean),
      dur: +m.getAttribute('data-dur') || 2000, phase: +m.getAttribute('data-phase') || 0, jitter: +m.getAttribute('data-jitter') || 0,
      l: m.querySelector('.sh-l'), r: m.querySelector('.sh-r'), crack: m.querySelector('.sh-crack'), lens: []
    };
  });
  function hideMovers() { if (movers) for (var i = 0; i < movers.length; i++) movers[i].el.style.opacity = 0; }
  function tickMovers(now) {
    // all reads first (track state, lengths, points), then all writes: one layout per frame, not one per mover
    var at = [];
    for (var i = 0; i < movers.length; i++) {
      var m = movers[i], t = -1;
      if (cur < 8) for (var k = 0; k < m.tracks.length; k++) if (m.tracks[k].classList.contains('is-on')) { t = k; break; }
      if (t < 0) { at.push(null); continue; }
      if (!m.lens[t]) m.lens[t] = m.tracks[t].getTotalLength();
      var p = (now / m.dur + m.phase) % 1;
      at.push({ p: p, pt: m.tracks[t].getPointAtLength(p * m.lens[t]) });
    }
    for (i = 0; i < movers.length; i++) {
      m = movers[i];
      if (!at[i]) { m.el.style.opacity = 0; continue; }
      p = at[i].p;
      var x = at[i].pt.x, y = at[i].pt.y;
      if (m.jitter) { x += (Math.random() - 0.5) * 2 * m.jitter; y += (Math.random() - 0.5) * m.jitter; }
      m.el.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
      var op = Math.max(0, Math.min(1, p / 0.12, (1 - p) / 0.12));
      if (m.l) {                                                     // the sheet: translucent; cracks from step 3
        var cracks = cur >= 3, c = cracks ? Math.max(0, (p - 0.78) / 0.22) : 0;
        m.l.setAttribute('transform', c ? 'translate(' + (-5 * c).toFixed(2) + ' ' + (7 * c).toFixed(2) + ') rotate(' + (-22 * c).toFixed(1) + ')' : '');
        m.r.setAttribute('transform', c ? 'translate(' + (5 * c).toFixed(2) + ' ' + (7 * c).toFixed(2) + ') rotate(' + (22 * c).toFixed(1) + ')' : '');
        m.crack.style.opacity = cracks && p > 0.72 ? (Math.min(1, (p - 0.72) / 0.06) * (1 - c)).toFixed(3) : 0;
        op = Math.min(op, cracks ? 1 - Math.max(0, (p - 0.88) / 0.12) : 1) * 0.75;
      }
      m.el.style.opacity = op.toFixed(3);
    }
  }
  function frame(now) {
    if (now - lastActive > IDLE_MS) {                                // idle: the token leaves, nothing keeps moving
      raf = 0;
      stage.classList.remove('is-moving');                           // the app's agent pauses with it
      if (toks.figB) toks.figB.style.opacity = 0;
      hideMovers();
      return;
    }
    raf = requestAnimationFrame(frame);
    tickMovers(now);
    if (figNow() === 'figA') {                                       // figure A: the movers carry the motion
      if (toks.figB) toks.figB.style.opacity = 0;
      return;
    }
    var tok = toks.figB;
    if (!tok) return;
    var live = livePaths();
    if (!live.length) { tok.style.opacity = 0; return; }
    var p = (now - legStart) / LEG_MS;
    if (p >= 1) { leg = (leg + 1) % live.length; legStart = now; p = 0; }
    var f = live[leg % live.length];
    if (!f.len) f.len = f.el.getTotalLength();
    var pt = f.el.getPointAtLength(p * f.len);
    tok.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + ')');
    tok.style.opacity = Math.max(0, Math.min(1, p / 0.15, (1 - p) / 0.15)).toFixed(3);
  }
  function setLoop() {
    if (!toks) return;   // ScrollTrigger's first refresh can land before the tokens exist
    var run = visible && !document.hidden && !mqRM.matches && performance.now() - lastActive <= IDLE_MS;
    stage.classList.toggle('is-moving', run);   // CSS runs the custom app's agent loop only while this is set
    if (run && !raf) { legStart = performance.now(); raf = requestAnimationFrame(frame); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!run) hideMovers();
    if (mqRM.matches && toks.figB) toks.figB.style.opacity = 0;
  }
  function wake() { lastActive = performance.now(); setLoop(); }
  // a cost trigger, not a reveal trigger: fire a viewport early (INTERACTION.md 3.1 rule 6)
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; setLoop(); }, { rootMargin: '100% 0px' }).observe(stage);
  document.addEventListener('visibilitychange', setLoop);
  stage.addEventListener('pointermove', wake, { passive: true });

  /* ---- hover: a phrase lights the part it names ---------------------------- */
  if (mqHover.matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.ref[data-ref]'), function (r) {
      var key = r.getAttribute('data-ref');
      var targets = $$('[data-key="' + key + '"]');
      r.addEventListener('pointerenter', function () { targets.forEach(function (t) { t.classList.add('is-ping'); }); });
      r.addEventListener('pointerleave', function () { targets.forEach(function (t) { t.classList.remove('is-ping'); }); });
    });
  }

  /* ---- go -------------------------------------------------------------------- */
  if (mqRM.matches) stage.classList.add('no-tx');
  mqRM.addEventListener('change', function () {
    stage.classList.toggle('no-tx', mqRM.matches);
    if (mqRM.matches && cur >= 0) runSeq(cur, cur, true);   // clears the timers and the count, lands on the end
    setLoop();
  });
  setScale();
  if ('ResizeObserver' in window) new ResizeObserver(setScale).observe(svg);
  mqMobile.addEventListener('change', setScale);   // the layout itself is re-placed by remode() after the resize settles
  // Resizing across a layout (still / flow / phone) keeps the reader on the same step, not the same pixel.
  // The step is captured when the resize starts, before any listener re-reads it from a half-changed layout.
  var resizeT = 0, keepStep = null, keepInStory = true;
  // what changes where the passages sit: the mode, phone or not, orientation, and (still mode only, where the
  // beats are sized from the viewport) the height in 40px buckets. A phone's URL bar changes none of these.
  function layoutKey() {
    var orient = window.innerWidth > window.innerHeight ? 'l' : 'p';
    return (deck ? 'd' + Math.round(window.innerHeight / 40) : 'f') + (mqMobile.matches ? 'm' : 'w') + orient;
  }
  var lastKey = '';
  function remode() {
    var keep = keepStep !== null ? keepStep : cur;
    var inStory = keepInStory;
    keepStep = null;
    keepInStory = true;
    setMode();
    var key = layoutKey();
    if (key === lastKey) return;
    lastKey = key;
    if (window.ScrollTrigger) window.ScrollTrigger.refresh(); else { measure(); sync(true); }
    // only a reader who was in the story is put back on their step; one reading further down stays where they are
    if (keep > 0 && inStory) {
      landOn(keep);
      setTimeout(function () { measure(); landOn(keep); }, 320);   // again once the new layout has settled
    }
  }
  window.addEventListener('resize', function () {
    if (keepStep === null) {
      keepStep = cur;
      var sr = root.getBoundingClientRect();
      keepInStory = sr.bottom > 0 && sr.top < window.innerHeight;
    }
    clearTimeout(resizeT);
    resizeT = setTimeout(remode, 150);
  }, { passive: true });
  setMode();
  lastKey = layoutKey();
  stage.classList.add('is-live');
  measure();
  sync(true);
  // Arriving on any #anchor: ScrollTrigger refreshes on load and cancels the browser's own jump, so land
  // again once that has run. A passage in still mode goes to its beat; everything else to its own top.
  // A reader who scrolls, taps or types first is left where they are.
  if (location.hash.length > 1) {
    var arrive = document.getElementById(location.hash.slice(1));
    var moved = false;
    var stop = function () { moved = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) { window.addEventListener(t, stop, { passive: true, once: true }); });
    if (arrive) {
      var arriveNow = function () {
        if (moved) return;
        if (deck && arrive.classList.contains('psg')) goToStep(+arrive.getAttribute('data-step'), true);
        else arrive.scrollIntoView({ block: 'start', behavior: 'instant' });
      };
      // land once things settle, and once more after the font and ScrollTrigger refreshes (idempotent)
      window.addEventListener('load', function () { setTimeout(arriveNow, 120); setTimeout(arriveNow, 700); }, { once: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(arriveNow, 60); });
    }
  }

  window.__stage = { setStep: setStep, step: function () { return cur; }, tops: function () { return tops; }, N: N };
})();
