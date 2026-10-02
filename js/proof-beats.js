// proof-beats.js — the shared proof-section contract (FIX-PLAN-R6 §0.3). PAGE owns this file;
// guides.js (STAGE) and the guide glyphs (FACES) import it read-only. Pure module: no DOM, no side
// effects. Names and values are frozen by the contract, so do not rename them.

// The reading line (fraction of the viewport height from the top) and how long, in seconds, the
// stats must hold above it before the count starts.
export const LINE = 0.8;
export const DWELL = 0.3;

// The two stat counts in #proof .stats. `d` and `delay` are seconds from data-t0.
export const COUNT = Object.freeze([
  // who/stats.md ledger: agent steps, last 3 months, 109,000+ (109,403 measured, 2026-06-26 -> 09-25)
  Object.freeze({ to: 109000, d: 1.1, delay: 0, suffix: '+' }),
  // who/stats.md: projects live since Mar 2026: 30, recounted by Ben 2026-10-01
  Object.freeze({ to: 30, d: 0.8, delay: 1.6, suffix: '' }),
]);
// Seconds from data-t0 after which the count is over and the DOM holds the final text.
export const COUNT_END = 3.4;

// The lit comparison column: per-cell stagger, seconds.
export const LIGHT = Object.freeze({ stagger: 0.09 });

// ---- brand ease: cubic-bezier(0.23, 1, 0.32, 1) (--rc-ease-out) -------------------------------
// Same Newton + bisection solver as main.js `bezier`, copied so this module stays import-free.
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

export const ease = bezier(0.23, 1, 0.32, 1);

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// The integer shown for stat i at s seconds after data-t0.
export function countAt(i, s) {
  const c = COUNT[i];
  return Math.round(c.to * ease(clamp((s - c.delay) / c.d, 0, 1)));
}

// '1,234' while counting; '109,000+' / '30' once the value reaches its target.
export function fmt(i, v) {
  const c = COUNT[i];
  return v >= c.to ? c.to.toLocaleString('en-US') + c.suffix : v.toLocaleString('en-US');
}
