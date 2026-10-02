// proof.js — the proof sections' two small behaviours (FIX-PLAN-R6 §3 P4).
//   1. The #proof stats count up once, after they have held above the reading line for DWELL.
//      data-t0 on #proof .stats (performance.now() ms) is the shared clock guides.js reads.
//   2. The comparison table's RightClick:AI column lights (.is-lit on .cmp) on the bow guide's
//      'light' beat, with a timed fallback when no beat arrives.
// The final text ('109,000+' / '30') is in the markup and is what the DOM holds before arming, after
// the count and whenever this script does nothing (no JS, reduced motion, missing elements).
// Debug: window.__lensProof = { seekCount(t | null), lit(on) }.
import { LINE, DWELL, COUNT, COUNT_END, fmt, countAt } from './proof-beats.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  || new URLSearchParams(location.search).get('static') === '1';

const LIT_FALLBACK_MS = 4000;

const stats = document.querySelector('#proof .stats');
const cmp = document.querySelector('#compare .cmp') || document.querySelector('.cmp');

// ---- count-up --------------------------------------------------------------------------------
const nums = [];   // b.num elements
const idx = [];    // their COUNT index
const nodes = [];  // their single text node (written in place, no node churn per frame)
const shown = [];  // the string each one currently shows

if (stats) {
  const list = stats.querySelectorAll('b.num[data-count]');
  for (let k = 0; k < list.length; k++) {
    const b = list[k];
    const i = Number(b.dataset.count);
    if (!(i >= 0 && i < COUNT.length) || i !== Math.floor(i)) continue;
    if (!(b.childNodes.length === 1 && b.firstChild.nodeType === 3)) b.textContent = fmt(i, COUNT[i].to);
    nums.push(b);
    idx.push(i);
    nodes.push(b.firstChild);
    shown.push(b.firstChild.data);
  }
}

// 'idle' → 'armed' (dwell timer running) → 'running' (rAF) → 'done'.
// 'spent' = a debug seek consumed the natural play before it ran.
let state = 'idle';
let pinned = false;
let timer = 0;
let raf = 0;
let t0 = 0;
let io = null;

function put(k, str) {
  if (str === shown[k]) return;
  shown[k] = str;
  nodes[k].data = str;
}
function writeAt(s) {
  for (let k = 0; k < nums.length; k++) put(k, fmt(idx[k], countAt(idx[k], s)));
}
function writeFinal() {
  for (let k = 0; k < nums.length; k++) put(k, fmt(idx[k], COUNT[idx[k]].to));
}
function writeZero() {
  for (let k = 0; k < nums.length; k++) put(k, fmt(idx[k], 0));
}

function tick(now) {
  raf = 0;
  if (pinned) return;
  const s = (now - t0) / 1000;
  if (s >= COUNT_END) {
    writeFinal();
    state = 'done';
    return;
  }
  for (let k = 0; k < nums.length; k++) put(k, fmt(idx[k], countAt(idx[k], s)));
  raf = requestAnimationFrame(tick);
}

function start() {
  timer = 0;
  if (state !== 'armed') return;
  state = 'running';
  t0 = performance.now();
  stats.dataset.t0 = String(t0);
  if (io) { io.disconnect(); io = null; }
  if (!pinned) raf = requestAnimationFrame(tick);
}

function onIntersect(entries) {
  const e = entries[entries.length - 1];
  if (e.isIntersecting) {
    if (state !== 'idle') return;
    state = 'armed';
    // The stats' .reveal is still near opacity 0 here, so the reader sees the count begin at 0
    // rather than the final value dropping to 0.
    if (!pinned) writeZero();
    timer = setTimeout(start, DWELL * 1000);
  } else if (state === 'armed') {
    clearTimeout(timer);
    timer = 0;
    state = 'idle';
    if (!pinned) writeFinal();
  }
}

if (!reduced && stats && nums.length && typeof IntersectionObserver === 'function') {
  io = new IntersectionObserver(onIntersect, {
    threshold: 0,
    rootMargin: `0px 0px -${Math.round((1 - LINE) * 100)}% 0px`,
  });
  io.observe(stats);
}

// ---- lit column ------------------------------------------------------------------------------
function light() {
  if (cmp) cmp.classList.add('is-lit');
}

if (cmp) {
  document.addEventListener('lens:beat', (e) => {
    if (e.detail && e.detail.id === 'bow' && e.detail.beat === 'light') light();
  });

  if (reduced) {
    light();
  } else {
    let fallback = 0;
    const arm = () => {
      if (fallback) return;
      fallback = setTimeout(() => {
        if (!cmp.classList.contains('is-lit')) light();
      }, LIT_FALLBACK_MS);
    };
    if (cmp.classList.contains('is-in')) {
      arm();
    } else if (typeof MutationObserver === 'function') {
      const mo = new MutationObserver(() => {
        if (!cmp.classList.contains('is-in')) return;
        mo.disconnect();
        arm();
      });
      mo.observe(cmp, { attributes: true, attributeFilter: ['class'] });
    }
  }
}

// ---- debug API -------------------------------------------------------------------------------
window.__lensProof = {
  // Pin the count at t seconds after data-t0 (null unpins). Keeps a frozen frame's face and stat
  // in sync: guides.js reads the same data-t0.
  seekCount(t) {
    if (!stats || !nums.length) return;
    if (t === null || t === undefined) {
      if (!pinned) return;
      pinned = false;
      if (state === 'running') {
        if (!raf) raf = requestAnimationFrame(tick);
      } else {
        state = state === 'done' ? 'done' : 'spent';
        writeFinal();
      }
      return;
    }
    const s = Number(t);
    if (!Number.isFinite(s)) return;
    pinned = true;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (state === 'idle' || state === 'armed') {
      if (timer) { clearTimeout(timer); timer = 0; }
      if (io) { io.disconnect(); io = null; }
      state = 'spent';
    }
    t0 = performance.now() - s * 1000;
    stats.dataset.t0 = String(t0);
    writeAt(s);
  },
  lit(on) {
    if (!cmp) return;
    if (on === undefined) cmp.classList.toggle('is-lit');
    else cmp.classList.toggle('is-lit', !!on);
  },
};
