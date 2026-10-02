// LENS — the face kit. CONTRACT §6.1, amended by DIRECTOR-NOTES 11 (glass tint) and 14 (32 px floor,
// etched look). Every face draws in ONE logical space, 2048 × 1280, whatever the backing canvas is:
// wrapFace() sets the transform, clears, lays the glass tint, then calls the face. Faces never call
// clear() themselves and never read the raw W/H the stage passes; use LW/LH or the GRID below.
//
// Colour comes only from PALETTE (token source per value). No other colour literal in any face file.
//
// REWORK 02 (binding, 2026-09-30; FIX-PLAN-R4 §0.2, F0) REVERSES REWORK 01's "shared work on glass, not
// software" rule. The walls are now APP WINDOWS ON GLASS: Notes, spreadsheets and finance, a kanban, a file
// browser, a ledger table, a dashboard. The collaboration now reads from THE CAST (the stubby humans and the
// cube-headed agents standing in front of each wall), and on the walls from the co-sign avatars: circle =
// human, rounded square with a screen face = agent (avatar(), mark(), pair(), avatarStack() all draw it).
// The app family: window() (rounded chrome, three muted dots, flat fills, hairlines, one soft shadow),
// chip(), avatar(), grid(), checkbox(), stateSq(), chart.bar / chart.area / chart.donut. NO accent rail
// (coloured border-top/left stripe) and NO gradient on any window, tile or card. Ramp hues (live / data /
// wiki / skills) are markers of 20 px or less only, never inside these primitives.
//
// CHART RULES (brand/design-system/charts/README.md, binding; FIX-PLAN-R4 F0.3): one axis; bars and areas
// start at zero; a single series is ch1, named by its title, no legend; categorical ch1 / ch2 / ch3 in fixed
// order, never a 7th hue, never a ramp hue; direct labels = a coloured square + the text in INK, never in the
// series colour; gridlines chGrid, axis chAxis, tick labels mono 32 ink3; data ends rounded 4 px, anchored to
// the baseline, 2 px between adjacent fills, lines 2 px. Chart rule 7 (table view + hover tooltip) does NOT
// apply: these are paintings on a 3D wall with no DOM and no hover; the canvas is aria-hidden and the page
// copy carries the facts.
//
// The paper card grammar (card / pair / pin / tape / tab / sentence / wallTitle / scribble / arrow /
// avatarStack) is kept: face-2's sticky note is a paper k.card, and older faces must keep rendering.
// Faces get `beat` (REWORK-01-DIRECTOR §6.2) in their opts; see beat.js. A face may export busy(beat,
// reduced) (FIX-PLAN-R4 contract 0.5.3) and put its static layer in k.cached() (F8: 2D paint p90 <= 2 ms).

import { beatAt } from './beat.js';

export const LW = 2048;
export const LH = 1280;

// The layout grid every face shares (CONTRACT §6.1, REWORK-01-DIRECTOR §6.1).
export const GRID = {
  x0: 96, x1: 1952,            // content margins
  headBase: 118,               // legacy header text baseline (opt-in header only)
  headLine: 150,               // legacy header hairline
  top: 190, bottom: 1150,      // legacy content band
  footLine: 1180,              // footer hairline
  footBase: 1222,              // footer text baseline
};

// The canvas rule (DIRECTOR §6.1). Key content — title, every card and its credit line, every number,
// the Admin decision square — lives in y KEY_TOP..KEY_BOT. The floor band below sits behind the
// people at a hold (heads from ≈ HEADS down): only arrow tails, loose partial cards that repeat
// nothing, and the faint footer line may go there.
export const BAND = { KEY_TOP: 64, KEY_BOT: 896, HEADS: 1036, FLOOR_BOT: 1216 };

export const PALETTE = {
  night: {
    ink1: 'rgba(255,255,255,0.94)',   // brand.json grounds.dark.ink[0] #FFFFFF @ .94 (m6)
    ink2: 'rgba(255,255,255,0.72)',   // brand.json grounds.dark.ink[1] rgba(255,255,255,.72) (m6)
    ink3: 'rgba(255,255,255,0.60)',   // brand.json grounds.dark.ink[2] rgba(255,255,255,.60), the dark ink-3 floor (m6)
    line: 'rgba(255,255,255,0.14)',   // --rc-line (dark) = --ms-glass-line rgba(255,255,255,.14)
    line2: 'rgba(241,251,247,0.28)',  // --rc-line-2 (dark, ms-glass-line-2 .28)
    glass: 'rgba(255,255,255,0.04)',  // --rc-e0 (light) @ .04: a neutral lift, the glass carries no brand colour (brand.json fresnel; FIX-PLAN-R2 F2)
    green: '#4FA98B',                 // --rc-g-400
    greenHi: '#BFE0D2',               // --rc-g-200
    accent: '#14B37D',                // --rc-accent (dark). ADMIN DECISION SQUARE ONLY (face 6).
    onAccent: '#04241A',              // --rc-accent-ink (dark): 6.1:1 on the night --rc-accent above (FIX-PLAN-R2 F3)
    live: '#4FE0D0',                  // --rc-accent-2 = --ms-ramp-2, the live-state core (marker only)
    data: '#4FE0D0',                  // --rc-idx-data = --ms-ramp-2 (marker only, <= 20 px)
    wiki: '#5B8CFF',                  // --rc-idx-wiki = --ms-ramp-3 (marker only, <= 20 px)
    skills: '#A47BFF',                // --rc-idx-skills = --ms-ramp-4 (marker only, <= 20 px)
    human: '#BFE0D2',                 // --rc-g-200 — the human ring on glass (humans only; NOT the accent)
    // Brand swatches for face 1 (BRAND & TONE): --rc-g-800, --rc-g-400, --rc-g-100, --rc-e0 light (white).
    swatches: ['#0B4535', '#4FA98B', '#E3F1EA', '#FFFFFF'],
    // FIX-PLAN-R1 0.2 / F1 — paper notes on glass
    note: '#D8D2C6',                  // representational: paper (brand.json surfaces_3d.representational_exception; FIX-PLAN-R1 0.2)
    noteInk1: 'rgba(6,37,28,0.88)',   // --rc-g-950 #06251C @ .88 — ink on paper
    noteInk2: 'rgba(6,37,28,0.66)',   // --rc-g-950 @ .66
    noteInk3: 'rgba(6,37,28,0.52)',   // --rc-g-950 @ .52
    noteHuman: '#0E5A45',             // --rc-g-700 — the human ring on paper
    noteAgent: '#12735A',             // --rc-g-600 — the agent square on paper
    paper: 'rgba(241,251,247,0.055)', // LEGACY (pre-R1 translucent card): --rc-ink-inverse #F1FBF7 @ .055
    shade: 'rgba(0,0,0,0.55)',        // pure black @ .55 — the paper's soft offset shadow on the glass (FIX-PLAN-R1 F1)
    tape: 'rgba(241,251,247,0.13)',   // --rc-ink-inverse @ .13 — a strip of tape
    pin: '#BFE0D2',                   // --rc-g-200 — pin head
    hand: 'rgba(241,251,247,0.62)',   // --rc-ink-inverse @ .62 — handwriting strokes on glass (scribbles, arrows)
    // FIX-PLAN-R4 F0.1 — the app family on glass (night = dark-mode windows)
    win: 'rgba(11,21,17,0.92)',       // --rc-e1 (dark) #0B1511 @ .92 — the window surface
    winBar: '#0F1C17',                // --rc-e2 (dark) — the title bar, spreadsheet letter strip / row gutter
    winLine: 'rgba(241,251,247,0.28)',// --rc-line-2 (dark) — window outline, bar hairline, plain chip stroke
    winShade: 'rgba(0,0,0,0.42)',     // pure black @ .42 — the window's soft shadow
    sel: 'rgba(79,169,139,0.18)',     // --rc-g-400 #4FA98B @ .18 — selection tint (sel chip, selected cell)
    ch1: '#17916B',                   // --ch-1 (brand/design-system/charts/charts.css) green
    ch2: '#3D6FE3',                   // --ch-2 (charts.css) blue
    ch3: '#C9439E',                   // --ch-3 (charts.css) magenta
    chGrid: 'rgba(255,255,255,0.08)', // --rc-line-hair (dark) — chart gridlines, table rules
    chAxis: 'rgba(255,255,255,0.14)', // --rc-line (dark) — chart baseline
    screen: '#060D0B',                // --rc-e0 (dark) — the agent's screen face
    screenEye: '#BFE0D2',             // --rc-g-200 — the agent's eyes on its screen
    onGreen: '#FFFFFF',               // --rc-e0 (light) white — a check on a green fill (checkbox, stateSq)
  },
  day: {
    ink1: 'rgba(6,37,28,0.78)',       // --rc-g-950 #06251C @ .78 (faint etched day face)
    ink2: 'rgba(6,37,28,0.52)',       // --rc-g-950 @ .52
    ink3: 'rgba(6,37,28,0.34)',       // --rc-ink-4 (light) rgba(6,37,28,.34)
    line: 'rgba(14,90,69,0.15)',      // --rc-line (light) rgba(14,90,69,.15)
    line2: 'rgba(14,90,69,0.28)',     // --rc-line-2 / --rc-accent-line (light)
    glass: 'rgba(255,255,255,0.18)',  // --rc-e0 (light) #FFFFFF @ .18 (DN 11)
    green: '#12735A',                 // --rc-g-600
    greenHi: '#0E5A45',               // --rc-g-700
    accent: '#0E5A45',                // --rc-accent (light)
    onAccent: '#FFFFFF',              // --rc-e0 (light) white: the check inside the face-6 decision square
    live: '#12735A',                  // --rc-g-600
    data: '#12735A',                  // --rc-g-600 (day keeps the ramp out)
    wiki: '#12735A',                  // --rc-g-600 (m7: day markers stay green)
    skills: '#12735A',                // --rc-g-600 (m7: day markers stay green)
    human: '#0E5A45',                 // --rc-g-700
    // Brand swatches for face 1 (BRAND & TONE): --rc-g-800, --rc-g-400, --rc-g-100, --rc-e0 light (white).
    swatches: ['#0B4535', '#4FA98B', '#E3F1EA', '#FFFFFF'],
    // FIX-PLAN-R1 0.2 / F1 — paper notes on glass
    note: '#F6F3EC',                  // representational: paper (brand.json surfaces_3d.representational_exception; FIX-PLAN-R1 0.2)
    noteInk1: 'rgba(6,37,28,0.88)',   // --rc-g-950 #06251C @ .88 — ink on paper
    noteInk2: 'rgba(6,37,28,0.66)',   // --rc-g-950 @ .66
    noteInk3: 'rgba(6,37,28,0.52)',   // --rc-g-950 @ .52
    noteHuman: '#0E5A45',             // --rc-g-700 — the human ring on paper
    noteAgent: '#12735A',             // --rc-g-600 — the agent square on paper
    paper: 'rgba(255,255,255,0.34)',  // LEGACY (pre-R1 translucent card): --rc-e0 light #FFFFFF @ .34
    shade: 'rgba(6,37,28,0.14)',      // --rc-g-950 #06251C @ .14 — the paper's soft offset shadow
    tape: 'rgba(255,255,255,0.55)',   // --rc-e0 light @ .55
    pin: '#12735A',                   // --rc-g-600 — pin head
    hand: 'rgba(6,37,28,0.50)',       // --rc-g-950 @ .50 — handwriting strokes
    // FIX-PLAN-R4 F0.1 — the app family on glass (day = light windows)
    win: 'rgba(255,255,255,0.94)',    // --rc-e1 (light) #FFFFFF @ .94 — the window surface
    winBar: '#F1F8F4',                // --rc-g-050 — the title bar, spreadsheet letter strip / row gutter
    winLine: 'rgba(14,90,69,0.15)',   // --rc-line (light) — window outline, bar hairline, plain chip stroke
    winShade: 'rgba(6,37,28,0.12)',   // --rc-g-950 #06251C @ .12 — the window's soft shadow
    sel: '#E3F1EA',                   // --rc-g-100 — selection tint (sel chip, selected cell)
    ch1: '#17916B',                   // --ch-1 (brand/design-system/charts/charts.css) green
    ch2: '#3D6FE3',                   // --ch-2 (charts.css) blue
    ch3: '#C9439E',                   // --ch-3 (charts.css) magenta
    chGrid: 'rgba(14,90,69,0.07)',    // --rc-line-hair (light, L2.5) — chart gridlines, table rules
    chAxis: 'rgba(14,90,69,0.15)',    // --rc-line (light) — chart baseline
    screen: '#BFE0D2',                // --rc-g-200 — the agent's (lit) screen face by day
    screenEye: '#0E5A45',             // --rc-g-700 — the agent's eyes on its screen
    onGreen: '#FFFFFF',               // --rc-e0 (light) white — a check on a green fill (checkbox, stateSq)
  },
  // FIX-PLAN-R5 F6 — the card document atlas (js/faces/cards.js). Theme-invariant: one atlas serves both
  // themes, because the card's paper colour multiplies it. The plan's 'g-500' does not exist in brand v1.1
  // (eight-step green scale, no ninth step), so the one marker is the nearest step, g-600. Never the accent.
  card: {
    paper: '#FFFFFF',                 // --rc-e0 (light) white: the cell fill; the card's paper colour multiplies it
    edge: '#0E5A45',                  // --rc-g-700: the card hairline (was cast.js cardTexture's THEMES.day.cardEdge)
    ink1: 'rgba(6,37,28,0.70)',       // --rc-g-950 #06251C @ .70
    ink2: 'rgba(6,37,28,0.45)',       // --rc-g-950 @ .45
    ink3: 'rgba(6,37,28,0.20)',       // --rc-g-950 @ .20
    mark: '#12735A',                  // --rc-g-600: the one brand-green marker (plan said g-500; v1.1 has none)
  },
};

const FONT = {
  mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  sans: '"Instrument Sans", "Helvetica Neue", Arial, sans-serif',
  body: 'Geist, "Helvetica Neue", Arial, sans-serif',
};
export const MIN_TEXT = 32;   // DN 14 — nothing on a face is smaller

// ---- pure helpers -----------------------------------------------------------------------------
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (p, a, b) => clamp01((p - a) / (b - a));
export const ease = (t) => { t = clamp01(t); const u = 1 - t; return 1 - u * u * u; };
export const easeInOut = (t) => { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
// Staggered, eased local progress: item i of a list that builds from `at`, 50 ms apart on a 1.4 s build.
export const stag = (p, i, at = 0.12, step = 0.036, dur = 0.22) => ease(seg(p, at + i * step, at + i * step + dur));
// 0..1 cosine wave for live motion. Deterministic in time.
export const wave = (time, period = 2.4, phase = 0) => 0.5 - 0.5 * Math.cos(2 * Math.PI * (time / period + phase));
// Deterministic PRNG (mulberry32). Seed from a constant; call it at module load, never per frame.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stateless 0..1 hash of an integer or string seed (for hand-set rotations and scribble shapes).
export function hash(seed) {
  let h = 2166136261 >>> 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
// A hand-set tilt in degrees, ±max (REWORK §4: ±1.5°), deterministic per seed.
export const handRot = (seed, max = 1.2) => (hash(seed) * 2 - 1) * max;
// A card's default tilt: never level, never past ±1.5° (FIX-PLAN-R1 F1) — |deg| in 0.8..1.5.
export const cardTilt = (seed) => { const h = hash(seed) * 2 - 1; return (h < 0 ? -1 : 1) * (0.8 + 0.7 * Math.abs(h)); };
// A ✓'s stroke-on (FIX-PLAN-R1 F1, M10): complete within .25 s of its beat, and complete when still.
export const checkP = (since, still) => (still || since > 0.25 ? 1 : ease(since / 0.25));
// Initials for a human mark (FIX-PLAN-R1 F1; R4 contract 0.5.1 adds Nurul): Lim LT, Priya PN, Marcus MK,
// Nurul NR, anyone else first two letters.
const INITIALS = { lim: 'LT', priya: 'PN', marcus: 'MK', nurul: 'NR' };
export function initials(name) {
  const s = String(name || '').trim();
  return INITIALS[s.toLowerCase()] || s.slice(0, 2).toUpperCase();
}
// Live arrival (REWORK-01-DIRECTOR §6.2): 0 → 1 over `dur` s of beat.since, ease-out.
export const settle = (since, dur = 0.4) => ease(since / dur);

const NF = new Map();
function fmt(v, decimals) {
  let f = NF.get(decimals);
  if (!f) { f = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); NF.set(decimals, f); }
  return f.format(v);
}
// count(1204, p) → "1,204" counted up on an ease-out. opts: { decimals, prefix, suffix }
export function count(value, p = 1, opts) {
  const d = (opts && opts.decimals) || 0;
  const v = value * ease(p);
  return ((opts && opts.prefix) || '') + fmt(d ? v : Math.round(v), d) + ((opts && opts.suffix) || '');
}

// Catmull-Rom densify, cached per points array (signatures, sparklines).
const SMOOTH = new WeakMap();
function smoothPts(pts) {
  let out = SMOOTH.get(pts);
  if (out) return out;
  out = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < 10; s++) {
      const t = s / 10, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[n - 1]);
  SMOOTH.set(pts, out);
  return out;
}

// ---- handwriting geometry (cached per style|seed|w|h) ---------------------------------------------
// Joined loops = a prolate cycloid, one cycle per "letter": x = a·t − b·sin t, y = −A·(1 + cos t) from the
// baseline. b > a makes a loop at the top (l, e, h); b < a makes a hump (n, m, u). Per-letter A and b come
// from hash(seed), so a scribble is the same stroke every frame. Slant shears x by −y·SLANT.
const SCRIB = new Map();
const SLANT = 0.22;
function cursiveWord(x0, cyc, h, seed, wi, pts) {
  const a = (h * 0.52) / (2 * Math.PI);
  let x = x0;
  for (let k = 0; k < cyc; k++) {
    const r1 = hash(`${seed}|${wi}|${k}`), r2 = hash(`${seed}|${wi}|${k}|b`);
    const tall = r1 > 0.8;                              // ascender
    const A = h * (tall ? 0.95 : 0.42 + 0.14 * r2);
    const b = a * (r2 > 0.45 ? 1.35 + 0.4 * r1 : 0.55);  // loop or hump
    for (let s = 0; s <= 12; s++) {
      if (k && !s) continue;
      const t = Math.PI + (2 * Math.PI * s) / 12;
      const px = x + a * (t - Math.PI) - b * Math.sin(t);
      const py = -A * (1 + Math.cos(t));
      pts.push([px - py * SLANT, py]);
    }
    x += a * 2 * Math.PI;
  }
  return x;
}
function scribbleGeom(style, seed, w, h, dbl) {
  const polys = [];
  if (style === 'underline') {
    for (let d = 0; d < (dbl ? 2 : 1); d++) {
      const pts = [], ph = hash(`${seed}|u${d}`) * 6.28;
      const x0 = d ? w * 0.08 : 0, x1 = d ? w * 0.86 : w;
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        pts.push([lerp(x0, x1, t), d * 12 + Math.sin(ph + t * 3.1) * 2.6 + (t - 0.5) * (hash(`${seed}|s${d}`) - 0.5) * 10]);
      }
      polys.push(pts);
    }
    return polys;
  }
  if (style === 'circle') {
    const pts = [], cx = w / 2, cy = h / 2, rx = w / 2 + 18, ry = h / 2 + 14;
    const a0 = -1.9 + hash(seed) * 0.4;
    for (let i = 0; i <= 64; i++) {
      const t = i / 64, ang = a0 + t * (2 * Math.PI + 0.55);
      const grow = 1 + 0.05 * t + 0.02 * Math.sin(t * 9 + hash(seed + 'w') * 6);
      pts.push([cx + Math.cos(ang) * rx * grow, cy + Math.sin(ang) * ry * grow]);
    }
    polys.push(pts);
    return polys;
  }
  if (style === 'signature') {
    const pts = [];
    const end = cursiveWord(0, 5, h, seed, 0, pts);
    // trailing flourish: dips under the word and sweeps out to the right edge
    const last = pts[pts.length - 1];
    const fl = [[last[0], last[1]], [end + h * 0.4, h * 0.25], [end * 0.55, h * 0.42], [end * 0.35, h * 0.2], [Math.max(end + h, w), -h * 0.15]];
    for (let i = 1; i < fl.length; i++) for (let s = 1; s <= 8; s++) {
      const t = s / 8;
      pts.push([lerp(fl[i - 1][0], fl[i][0], t), lerp(fl[i - 1][1], fl[i][1], t) + Math.sin(t * Math.PI) * h * 0.12 * (i % 2 ? 1 : -1)]);
    }
    polys.push(pts);
    return polys;
  }
  if (style === 'trend') {
    // FIX-PLAN-R2 F1: one hand-drawn line rising left to right across the box w × h (top-left origin, so
    // the right end is highest). 7 points, each y jittered ±6 px by hash(seed|t<i>), the 5 interior
    // points also ±3 px in x; Catmull-Rom densified so it strokes on as one line. No axes, labels, dots.
    const pts = [];
    for (let i = 0; i < 7; i++) {
      const t = i / 6, r = hash(`${seed}|t${i}`);
      const jx = i && i < 6 ? (hash(`${seed}|t${i}|x`) * 2 - 1) * 3 : 0;
      pts.push([t * w + jx, h * (1 - t) + (r * 2 - 1) * 6]);
    }
    polys.push(smoothPts(pts));
    return polys;
  }
  // 'line': words of 2–6 letters until the width is used; each word its own stroke
  let x = 0, wi = 0;
  const gap = h * 0.7, cw = h * 0.52;
  while (x < w - cw * 2) {
    const cyc = Math.min(2 + Math.floor(hash(`${seed}|n${wi}`) * 5), Math.floor((w - x) / cw));
    if (cyc < 2) break;
    const pts = [];
    const drift = (hash(`${seed}|d${wi}`) - 0.5) * h * 0.08;
    x = cursiveWord(x, cyc, h, seed, wi, pts) + gap;
    for (const q of pts) q[1] += drift;
    polys.push(pts);
    wi++;
  }
  return polys;
}

// ---- the pair (FIX-PLAN-R1 F1): who made a note, circle = human, square = agent ------------------
// Named so the phone arithmetic can be read off one place (FIX-PLAN-R1 0.3, M12). Logical px on the
// 2048 face. ring = circle radius (stroke centred on it), square = agent side.
export const PAIR = {
  ring: 24, ringW: 3.5, square: 40, sqR: 6, names: 40, initials: 32, row: 48, gap: 12, nameGap: 18,
  small: { ring: 18, ringW: 3, square: 30, sqR: 5, names: 32, initials: 0, row: 36 },
};
// Paper shadow (FIX-PLAN-R1 F1), logical px: scaled by the transform at draw time.
const SHADOW = { blur: 16, dx: 5, dy: 9 };

// ---- the kit ----------------------------------------------------------------------------------
export function kit(ctx, W = LW, H = LH, theme = 'night') {
  const P = PALETTE[theme] || PALETTE.night;
  const hasLS = 'letterSpacing' in ctx;
  const wrapCache = new Map();

  // card() sets onPaper around ALL its content: default colours then resolve to paper inks. An explicit
  // o.color always wins. cardDepth guards nested cards (they are not counted as wall items).
  let onPaper = false;
  let cardDepth = 0;
  // LOD (FIX-PLAN-R3 §0.3.1): set per draw by wrapFace from opts.lod. When on, every glyph of text is
  // skipped (text() still measures and returns its width, so layouts do not move), glyph() and every
  // scribble but 'underline' are no-ops, and wallTitle() draws one hand-stroke bar instead of letters.
  // Paper, shadow, tilt, pins, tape, tab paper, the pair marks, rect() fills and arrows still draw.
  let lod = false;
  const INK = { ink1: 'noteInk1', ink2: 'noteInk2', ink3: 'noteInk3', hand: 'noteInk2', human: 'noteHuman', green: 'noteAgent', line: 'noteInk3', line2: 'noteInk3' };
  const ink = (key) => (onPaper ? P[INK[key]] : P[key]);
  // Per-draw item stats for the F8 checks; wrapFace resets them and copies them onto the face.
  const stats = { items: 0, arrows: 0, maxY: 0, base: 1 };

  const setLS = (px) => { if (hasLS) ctx.letterSpacing = px ? px.toFixed(2) + 'px' : '0px'; };
  const scaleNow = () => { const m = ctx.getTransform(); return Math.hypot(m.a, m.b) || 1; };
  function paperShadow() {
    const s = scaleNow();
    ctx.shadowColor = P.shade; ctx.shadowBlur = SHADOW.blur * s;
    ctx.shadowOffsetX = SHADOW.dx * s; ctx.shadowOffsetY = SHADOW.dy * s;
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    const q = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + q, y); ctx.arcTo(x + w, y, x + w, y + h, q); ctx.arcTo(x + w, y + h, x, y + h, q);
    ctx.arcTo(x, y + h, x, y, q); ctx.arcTo(x, y, x + w, y, q); ctx.closePath();
  }

  // THE AGENT GLYPH (FIX-PLAN-R4 F0.2, REWORK-02 §1): the cast's cube head with its screen face, drawn at
  // chip size. Replaces R3's face-slit glyph everywhere (avatar('agent'), mark('agent'), pair(), avatarStack()).
  //   body   rounded square, side s, radius min(10, .22·s), in bodyCol (P.green on glass, noteAgent on paper)
  //   screen inset .14·s, radius .10·s, P.screen (near-black at night, --rc-g-200 by day)
  //   eyes   two bars .11·s × .24·s, fully rounded, centred at x ± .15·s, y − .02·s, P.screenEye
  // outline (state 'ahead'): the body is stroked at lw, inset lw/2, and the screen still draws. Centred on
  // (x, y). The caller owns save/restore and globalAlpha.
  function agentFace(x, y, s, bodyCol, outline, lw) {
    const r = Math.min(10, 0.22 * s);
    if (outline) {
      ctx.strokeStyle = bodyCol; ctx.lineWidth = lw;
      rr(x - s / 2 + lw / 2, y - s / 2 + lw / 2, s - lw, s - lw, Math.max(1, r - lw / 2)); ctx.stroke();
    } else {
      ctx.fillStyle = bodyCol;
      rr(x - s / 2, y - s / 2, s, s, r); ctx.fill();
    }
    const ins = 0.14 * s, sw = s - 2 * ins;
    ctx.fillStyle = P.screen;
    rr(x - sw / 2, y - sw / 2, sw, sw, 0.1 * s); ctx.fill();
    const ew = 0.11 * s, eh = 0.24 * s, ey = y - 0.02 * s - eh / 2;
    ctx.fillStyle = P.screenEye;
    rr(x - 0.15 * s - ew / 2, ey, ew, eh, ew / 2); ctx.fill();
    rr(x + 0.15 * s - ew / 2, ey, ew, eh, ew / 2); ctx.fill();
  }

  // Rounded rect with per-corner radii [tl, tr, br, bl] (title bars, bars in a chart).
  function rrc(x, y, w, h, rs) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, rs); return; }
    const m = Math.min(w / 2, h / 2);
    const [tl, tr, br, bl] = rs.map((v) => Math.min(v, m));
    ctx.moveTo(x + tl, y); ctx.lineTo(x + w - tr, y); ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br); ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h); ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl); ctx.arcTo(x, y, x + tl, y, tl); ctx.closePath();
  }

  // Stroke several polylines as ONE hand stroke revealed to p (scribbles, arrow + head).
  function strokePolys(polys, color, w, p, alpha) {
    let L = 0;
    for (const pl of polys) for (let i = 1; i < pl.length; i++) L += Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1]);
    let left = L * clamp01(p);
    if (left <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const pl of polys) {
      if (left <= 0) break;
      ctx.moveTo(pl[0][0], pl[0][1]);
      for (let i = 1; i < pl.length; i++) {
        const dx = pl[i][0] - pl[i - 1][0], dy = pl[i][1] - pl[i - 1][1], d = Math.hypot(dx, dy);
        if (d >= left) { const f = d ? left / d : 0; ctx.lineTo(pl[i - 1][0] + dx * f, pl[i - 1][1] + dy * f); left = 0; break; }
        ctx.lineTo(pl[i][0], pl[i][1]);
        left -= d;
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // A pill / check path helper: the ✓ inside a filled green mark, stroked in onGreen, drawn on to p.
  function checkIn(x, y, s, lw, p, alpha) {
    const pts = [[x - 0.26 * s, y + 0.02 * s], [x - 0.08 * s, y + 0.2 * s], [x + 0.27 * s, y - 0.18 * s]];
    const L = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) + Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = P.onGreen; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
    strokeOn(L, clamp01(p));
    ctx.restore();
  }

  // Record a window/panel's lowest point for the F8 budget, in canvas-logical space (the transform is read,
  // so a window drawn inside rot() or a translate still counts correctly). ext = shadow reach below.
  function recordBottom(x, y, w, h, ext) {
    if (cardDepth !== 0) return;
    const m = ctx.getTransform(), k0 = stats.base || 1;
    for (let i = 0; i < 4; i++) {
      const qx = x + (i & 1 ? w : 0), qy = y + (i & 2 ? h : 0);
      const yy = (m.b * qx + m.d * qy + m.f) / k0 + ext;
      if (yy > stats.maxY) stats.maxY = yy;
    }
  }

  // Offscreen layers for K.cached(): key → { off, items, arrows, maxY }. At most LAYER_MAX per kit instance
  // (one kit per canvas and theme), oldest evicted first.
  const layers = new Map();
  const LAYER_MAX = 4;
  function newLayer(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    if (typeof document !== 'undefined') { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    return null;
  }

  // Stroke the current path with a stroke-on reveal of length p·L (L = full path length).
  function strokeOn(L, p) {
    if (p < 1) { ctx.setLineDash([Math.max(0.001, L * p), L + 1]); ctx.lineDashOffset = 0; }
    ctx.stroke();
    if (p < 1) ctx.setLineDash([]);
  }

  // ---- F4 (FIX-PLAN-R2): big mono numbers without a hole at the comma ------------------------------
  // Geist Mono gives ',' a full digit cell, so "1,204" at 88+ reads "1 , 204". For a 'mono' run at
  // size ≥ 40 that matches /\d,\d/, each comma gets an advance of 0.40 × da (da = the advance of '0' at
  // the same font, size and tracking) and its glyph is drawn at cellStart − 0.30 × da, which centres the
  // ink in the narrowed cell. Digits and every other char keep their normal advance. text() draws it,
  // and text()'s returned width, segW('mono') and measure('mono') all return the same width, so layouts
  // that measure stay in step. Reads the font and letter-spacing already set on ctx; cached per
  // weight|size|tracking|str. Returns null when the rule does not apply.
  const kernCache = new Map();
  const KERN_RE = /\d,\d/;
  function commaKern(str, size, weight, lsPx) {
    if (size < 40 || str.indexOf(',') < 0 || !KERN_RE.test(str)) return null;
    const key = `${weight}|${size}|${lsPx.toFixed(2)}|${str}`;
    let kn = kernCache.get(key);
    if (kn) return kn;
    if (kernCache.size > 200) kernCache.clear();
    const da = ctx.measureText('0').width;
    const parts = [];
    let w = 0;
    const pieces = str.split(',');
    for (let i = 0; i < pieces.length; i++) {
      if (i) { parts.push([',', -0.3 * da, 0.4 * da]); w += 0.4 * da; }
      if (pieces[i]) { const pw = ctx.measureText(pieces[i]).width; parts.push([pieces[i], 0, pw]); w += pw; }
    }
    kn = { parts, w };
    kernCache.set(key, kn);
    return kn;
  }

  function text(kind, str, x, y, size, weight, color, alpha, align, trackEm) {
    if (alpha <= 0 || !str) return 0;
    ctx.font = `${weight} ${size}px ${FONT[kind]}`;
    setLS(trackEm * size);
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const kn = kind === 'mono' ? commaKern(str, size, weight, hasLS ? trackEm * size : 0) : null;
    let w;
    if (lod) {
      // LOD: the same width, nothing on the canvas.
      w = kn ? kn.w : ctx.measureText(str).width;
    } else if (kn) {
      w = kn.w;
      let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      ctx.textAlign = 'left';
      for (const q of kn.parts) { ctx.fillText(q[0], cx + q[1], y); cx += q[2]; }
    } else {
      ctx.textAlign = align;
      ctx.fillText(str, x, y);
      w = ctx.measureText(str).width;
    }
    ctx.globalAlpha = 1;
    setLS(0);
    return w;
  }

  // ---- the sentence: Instrument Sans (500, or o.weight), digit runs optionally in Geist Mono 500 ------
  // A digit run: digits, with an inner ',', '.' or ':' only BETWEEN digits (1,204 · 2.5 · 9:30). A trailing
  // comma or full stop ('day 7,' · 'at 4.') stays sans, so it never sets mono-wide after the number.
  const NUM = /\d+(?:[,.:]\d+)*/g;
  // Width of one run as sentence() draws it: sans at `weight` (default 500) with −0.02 em, mono always
  // 500 with no tracking (and the F4 comma kerning when it applies).
  function segW(kind, str, size, weight) {
    const wt = kind === 'sans' ? (weight || 500) : 500;
    ctx.font = `${wt} ${size}px ${FONT[kind]}`;
    setLS(kind === 'sans' ? -0.02 * size : 0);
    const kn = kind === 'mono' ? commaKern(str, size, wt, 0) : null;
    const w = kn ? kn.w : ctx.measureText(str).width;
    setLS(0);
    return w;
  }
  function segs(word, monoNums, size, weight) {
    const out = [];
    if (!monoNums) { out.push(['sans', word, segW('sans', word, size, weight)]); return out; }
    let i = 0, m;
    NUM.lastIndex = 0;
    while ((m = NUM.exec(word))) {
      if (m.index > i) { const t = word.slice(i, m.index); out.push(['sans', t, segW('sans', t, size, weight)]); }
      out.push(['mono', m[0], segW('mono', m[0], size)]);
      i = m.index + m[0].length;
    }
    if (i < word.length) { const t = word.slice(i); out.push(['sans', t, segW('sans', t, size, weight)]); }
    return out;
  }
  // → { lines: [{ words: [{ sg: [[kind, str, w]], w }], w }], space }, cached per string/size/width/weight.
  function wrapSentence(str, maxW, size, monoNums, weight) {
    weight = weight || 500;
    const key = `S|${size}|${weight}|${maxW}|${monoNums ? 1 : 0}|${str}`;
    let L = wrapCache.get(key);
    if (L) return L;
    if (wrapCache.size > 600) wrapCache.clear();
    const space = segW('sans', ' ', size, weight);
    const lines = [];
    let line = [], lw = 0;
    for (const word of String(str).split(/\s+/)) {
      if (!word) continue;
      const sg = segs(word, monoNums, size, weight);
      let ww = 0;
      for (const q of sg) ww += q[2];
      if (line.length && lw + space + ww > maxW) { lines.push({ words: line, w: lw }); line = []; lw = 0; }
      lw += (line.length ? space : 0) + ww;
      line.push({ sg, w: ww });
    }
    if (line.length) lines.push({ words: line, w: lw });
    L = { lines, space };
    wrapCache.set(key, L);
    return L;
  }

  // ---- the pair: layout (pure) and draw ------------------------------------------------------------
  const pairDims = (o) => (o && o.size === 'small' ? PAIR.small : PAIR);
  function pairNames(credits, o) {
    if (o && o.names != null) return String(o.names);
    let s = '';
    for (const c of credits) if (c && c.name) s += (s ? ' + ' : '') + c.name;
    return s;
  }
  // Mark centres in the caller's coords (dx/dy included) + the names' x + total width.
  function pairLayout(credits, x, y, o) {
    const D = pairDims(o);
    const marks = [];
    let cx = x;
    for (let i = 0; i < credits.length; i++) {
      const c = credits[i] || {};
      const side = c.kind === 'human' ? D.ring * 2 : D.square;
      if (i) cx += PAIR.gap;
      marks.push([cx + side / 2 + (c.dx || 0), y + (c.dy || 0)]);
      cx += side;
    }
    const nm = pairNames(credits, o);
    const namesX = cx + (nm ? PAIR.nameGap : 0);
    const w = namesX - x + (nm ? K.measure(nm, 'mono', D.names, 500) : 0);
    return { D, marks, nm, namesX, w, h: D.row };
  }

  // ---- card helpers ----------------------------------------------------------------------------------
  const sentSize = (o) => Math.max(52, o.sentenceSize || 56);
  // o.sentenceMaxW caps the wrap width so a note can choose its line break (face 6: '186 hours back / this week.')
  const sentMaxW = (inner, o) => Math.min(inner - (o.marker || o.check != null ? 60 : 0), o.sentenceMaxW || Infinity);
  const linesSize = (o) => Math.max(MIN_TEXT, o.linesSize || 32);
  // The card's pair size: o.pairSize, else full size when it fits the paper, else 'small' (never overflow).
  const pairSizeFor = (w, o) => {
    if (o.pairSize || !o.credit || !o.credit.length) return o.pairSize;
    return K.pairW(o.credit) > w - (o.pad || 30) * 2 ? 'small' : undefined;
  };

  const K = {
    P, theme, W: LW, H: LH, GRID, BAND, MIN_TEXT, PAIR,
    seg, ease, easeInOut, stag, wave, lerp, clamp01, count, rng, hash, handRot, cardTilt, settle, checkP, initials,
    get onPaper() { return onPaper; },
    // LOD (FIX-PLAN-R3 §0.3.1): read-only here; wrapFace sets it on every draw from opts.lod.
    get lod() { return lod; },
    _setLod(v) { lod = !!v; },
    _stats: stats,

    // Glass tint across the whole face. Nothing else: the wall is glass, not a monitor (REWORK §2, §4).
    clear() {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = P.glass;
      rr(0, 0, LW, LH, 28); ctx.fill();
      ctx.restore();
    },

    // LEGACY, opt-in only (build 1): the etched bezel — inset hairline + four corner ticks. REWORK §4
    // kills it; kept so an old face still renders. No rewritten face calls it.
    bezel() {
      ctx.save();
      ctx.lineWidth = 2; ctx.strokeStyle = P.line;
      rr(16, 16, LW - 32, LH - 32, 20); ctx.stroke();
      ctx.strokeStyle = P.line2; ctx.lineWidth = 3; ctx.lineCap = 'butt';
      const m = 40, t = 36;
      ctx.beginPath();
      ctx.moveTo(m, m + t); ctx.lineTo(m, m); ctx.lineTo(m + t, m);
      ctx.moveTo(LW - m - t, m); ctx.lineTo(LW - m, m); ctx.lineTo(LW - m, m + t);
      ctx.moveTo(LW - m, LH - m - t); ctx.lineTo(LW - m, LH - m); ctx.lineTo(LW - m - t, LH - m);
      ctx.moveTo(m + t, LH - m); ctx.lineTo(m, LH - m); ctx.lineTo(m, LH - m - t);
      ctx.stroke();
      ctx.restore();
    },

    // Geist Mono — every fact, label, number. Returns drawn width.
    mono(str, x, y, o) {
      o = o || {};
      const size = Math.max(MIN_TEXT, o.size || 32);
      const s = o.upper ? String(str).toUpperCase() : String(str);
      return text('mono', s, x, y, size, o.weight || 500, o.color || ink('ink2'), o.alpha == null ? 1 : o.alpha, o.align || 'left', o.track == null ? 0.02 : o.track);
    },

    // Instrument Sans — display. Tracking −0.02em. Shrinks to fit maxW (never below the floor).
    sans(str, x, y, o) {
      o = o || {};
      let size = Math.max(MIN_TEXT, o.size || 64);
      const weight = o.weight || 600;
      if (o.maxW) {
        ctx.font = `${weight} ${size}px ${FONT.sans}`;
        setLS(-0.02 * size);
        const w = ctx.measureText(String(str)).width;
        setLS(0);
        if (w > o.maxW) size = Math.max(MIN_TEXT, Math.floor(size * o.maxW / w));
      }
      return text('sans', String(str), x, y, size, weight, o.color || ink('ink1'), o.alpha == null ? 1 : o.alpha, o.align || 'left', o.track == null ? -0.02 : o.track);
    },

    // Geist — body copy, wraps at maxW, returns the baseline y of the next line.
    body(str, x, y, o) {
      o = o || {};
      const size = Math.max(MIN_TEXT, o.size || 34);
      const lh = size * (o.lh || 1.45);
      const maxW = o.maxW || 900;
      const weight = o.weight || 400;
      const key = `${weight}|${size}|${maxW}|${str}`;
      let lines = wrapCache.get(key);
      if (!lines) {
        ctx.font = `${weight} ${size}px ${FONT.body}`;
        setLS(0);
        lines = [];
        let line = '';
        for (const word of String(str).split(/\s+/)) {
          const test = line ? line + ' ' + word : word;
          if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = word; } else line = test;
        }
        if (line) lines.push(line);
        wrapCache.set(key, lines);
      }
      const a = o.alpha == null ? 1 : o.alpha;
      for (let i = 0; i < lines.length; i++) text('body', lines[i], x, y + i * lh, size, weight, o.color || ink('ink2'), a, o.align || 'left', 0);
      return y + lines.length * lh;
    },

    // THE NOTE SENTENCE (FIX-PLAN-R1 F1): Instrument Sans 500 at 56, lh 1.22, wraps at maxW.
    // (x, y) = first baseline. monoNums sets every digit run inline in Geist Mono 500 at the same size.
    // o.weight (500) sets the sans weight only (FIX-PLAN-R2 F1); the wrap measures at that weight.
    // Returns the baseline y of the next line (= y + lines × size × lh).
    sentence(str, x, y, o) {
      o = o || {};
      const size = Math.max(MIN_TEXT, o.size || 56);
      const lh = size * (o.lh || 1.22);
      const wt = o.weight || 500;
      const L = wrapSentence(str, o.maxW || 900, size, !!o.monoNums, wt);
      const a = o.alpha == null ? 1 : o.alpha;
      if (a > 0) {
        const col = o.color || ink('ink1');
        for (let i = 0; i < L.lines.length; i++) {
          const ln = L.lines[i];
          let cx = o.align === 'center' ? x - ln.w / 2 : o.align === 'right' ? x - ln.w : x;
          for (let j = 0; j < ln.words.length; j++) {
            if (j) cx += L.space;
            for (const q of ln.words[j].sg) {
              text(q[0], q[1], cx, y + i * lh, size, q[0] === 'sans' ? wt : 500, col, a, 'left', q[0] === 'sans' ? -0.02 : 0);
              cx += q[2];
            }
          }
        }
      }
      return y + L.lines.length * lh;
    },
    // Block height of a sentence: lines × size × 1.22. weight = the sans weight (500), as sentence().
    sentenceH(str, maxW, size, monoNums, weight) {
      const s = Math.max(MIN_TEXT, size || 56);
      return wrapSentence(str, maxW || 900, s, !!monoNums, weight).lines.length * s * 1.22;
    },

    // Width of str as K.mono / K.sans draw it by default (mono +0.02 em, sans −0.02 em), including the F4
    // comma kerning for mono at ≥ 40.
    measure(str, kind = 'mono', size = 32, weight = 500) {
      const s = String(str);
      ctx.font = `${weight} ${size}px ${FONT[kind] || FONT.mono}`;
      const ls = kind === 'sans' ? -0.02 * size : kind === 'mono' ? 0.02 * size : 0;
      setLS(ls);
      const kn = kind === 'mono' ? commaKern(s, size, weight, hasLS ? ls : 0) : null;
      const w = kn ? kn.w : ctx.measureText(s).width;
      setLS(0);
      return w;
    },

    // Hairline from (x1,y1) toward (x2,y2), stroked on to p.
    hair(x1, y1, x2, y2, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      ctx.strokeStyle = o.color || ink('line2');
      ctx.lineWidth = o.w || 2;
      ctx.lineCap = o.cap || 'butt';
      if (o.dash) ctx.setLineDash(o.dash);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p); ctx.stroke();
      ctx.restore();
    },

    // Polyline [[x,y],…] stroked on to p. smooth:true runs a Catmull-Rom through the points (signatures).
    path(points, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      if (p <= 0 || !points || points.length < 2) return;
      const pts = o.smooth ? smoothPts(points) : points;
      let L = 0;
      for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const target = L * p;
      ctx.save();
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      ctx.strokeStyle = o.color || ink('line2');
      ctx.lineWidth = o.w || 2;
      ctx.lineJoin = o.join || 'round';
      ctx.lineCap = o.cap || 'round';
      if (o.dash) ctx.setLineDash(o.dash);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
        const d = Math.hypot(dx, dy);
        if (acc + d >= target) { const f = d ? (target - acc) / d : 0; ctx.lineTo(pts[i - 1][0] + dx * f, pts[i - 1][1] + dy * f); break; }
        ctx.lineTo(pts[i][0], pts[i][1]);
        acc += d;
      }
      ctx.stroke();
      ctx.restore();
    },

    // Point at fraction f along a polyline (for dots travelling on wires). Returns [x, y].
    along(points, f) {
      let L = 0;
      for (let i = 1; i < points.length; i++) L += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
      let target = L * clamp01(f);
      for (let i = 1; i < points.length; i++) {
        const dx = points[i][0] - points[i - 1][0], dy = points[i][1] - points[i - 1][1];
        const d = Math.hypot(dx, dy);
        if (target <= d) { const t = d ? target / d : 0; return [points[i - 1][0] + dx * t, points[i - 1][1] + dy * t]; }
        target -= d;
      }
      return points[points.length - 1];
    },

    // Rounded rect. Outline by default (etched); stroke draws on clockwise from top-left to p.
    // A fill is a tint, not a card: keep fills rare and faint (DN 14, ≤ 12 % filled area).
    rect(x, y, w, h, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      if (p <= 0) return;
      const r = o.r == null ? 10 : o.r;
      const a = o.alpha == null ? 1 : o.alpha;
      ctx.save();
      if (o.fill) {
        ctx.globalAlpha = a * (o.fillAlpha == null ? 1 : o.fillAlpha) * p;
        ctx.fillStyle = o.fill;
        rr(x, y, w, h, r); ctx.fill();
      }
      const stroke = o.stroke || (o.fill ? null : ink('line2'));
      if (stroke) {
        const lw = o.w || 2;
        ctx.globalAlpha = a;
        ctx.strokeStyle = stroke; ctx.lineWidth = lw;
        if (o.dash) ctx.setLineDash(o.dash);
        rr(x + lw / 2, y + lw / 2, w - lw, h - lw, Math.max(0, r - lw / 2));
        const L = 2 * (w + h) - 8 * r + 2 * Math.PI * r;
        if (o.dash) ctx.stroke(); else strokeOn(L, p);
      }
      ctx.restore();
    },

    // Circle outline (or faint fill), stroke drawn on from 12 o'clock.
    circle(x, y, r, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      if (o.fill) {
        ctx.fillStyle = o.fill;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      if (o.stroke || !o.fill) {
        ctx.strokeStyle = o.stroke || ink('line2'); ctx.lineWidth = o.w || 2; ctx.lineCap = 'butt';
        if (o.dash) ctx.setLineDash(o.dash);
        ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
      }
      ctx.restore();
    },

    // Square state marker, centred on (x, y). Brand: 11 px @1x, r 2, border 1.5 → ×2.2 on a face.
    // done = filled · live = outline + inner core · ahead = empty outline.
    node(x, y, state = 'ahead', o) {
      o = o || {};
      const s = o.size || 24;
      const a = o.alpha == null ? 1 : o.alpha;
      if (a <= 0) return;
      const r = Math.max(2, s / 6), bw = Math.max(2, Math.round(s / 8));
      const col = o.color || (state === 'ahead' ? ink('ink3') : ink('green'));
      ctx.save();
      ctx.globalAlpha = a;
      if (state === 'done') {
        ctx.fillStyle = col;
        rr(x - s / 2, y - s / 2, s, s, r); ctx.fill();
      } else {
        ctx.strokeStyle = col; ctx.lineWidth = bw;
        rr(x - s / 2 + bw / 2, y - s / 2 + bw / 2, s - bw, s - bw, Math.max(1, r - bw / 2)); ctx.stroke();
        if (state === 'live') {
          const c = s * 0.42;
          ctx.globalAlpha = a * (o.coreAlpha == null ? 1 : o.coreAlpha);
          ctx.fillStyle = o.core || P.live;
          if (o.glow && theme === 'night' && !onPaper) { ctx.shadowColor = o.core || P.live; ctx.shadowBlur = s * 0.9; }
          rr(x - c / 2, y - c / 2, c, c, Math.max(1, r * 0.5)); ctx.fill();
        }
      }
      ctx.restore();
    },

    // LEGACY avatar (pre-R4): avatar(x, y, initialsStr, o { r 44, p, alpha, ring, human, color }) — a ring
    // with initials + the human ring. Reached through avatar() when its first argument is a number.
    _avatarOld(x, y, initialsStr, o) {
      o = o || {};
      const r = o.r || 44;
      const a = o.alpha == null ? 1 : o.alpha;
      const p = o.p == null ? 1 : clamp01(o.p);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = ink('ink2'); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      if (o.human !== false) {
        ctx.strokeStyle = o.ring || ink('human'); ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(x, y, r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
      }
      ctx.restore();
      const size = Math.max(MIN_TEXT, Math.round(r * 0.74));
      text('mono', initialsStr, x, y + size * 0.36, size, 500, o.color || ink('ink1'), a, 'center', 0.04);
    },

    // Agent: always a square. state 'live' = working (cyan core), 'ahead' = idle, 'done' = finished.
    agent(x, y, o) {
      o = o || {};
      const s = o.size || 28;
      K.node(x, y, o.state || 'live', { size: s, color: o.color, core: o.core, alpha: o.alpha, coreAlpha: o.coreAlpha, glow: o.glow });
      if (o.label) text('mono', String(o.label).toUpperCase(), x, y + s / 2 + 44, Math.max(MIN_TEXT, o.labelSize || 32), 500, o.labelColor || ink('ink2'), o.alpha == null ? 1 : o.alpha, 'center', 0.06);
    },

    // Glyphs, centred on (x, y). check / dot / warn / up / down / key / arrow. Success always ships ✓.
    // check: size ≥ 36, stroke ≥ 4 (FIX-PLAN-R1 F1, M10).
    glyph(kind, x, y, o) {
      if (lod) return;
      o = o || {};
      const a = o.alpha == null ? 1 : o.alpha;
      if (a <= 0) return;
      const col = o.color || ink('ink1');
      if (kind === 'check') {
        const s = Math.max(36, o.size || 40);
        const lw = Math.max(4, o.w || s / 9);
        K.path([[x - 0.36 * s, y + 0.02 * s], [x - 0.1 * s, y + 0.28 * s], [x + 0.38 * s, y - 0.3 * s]], { color: col, w: lw, p: o.p == null ? 1 : o.p, alpha: a });
        return;
      }
      const s = o.size || 32;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = col; ctx.fillStyle = col;
      ctx.lineWidth = o.w || Math.max(3, s / 10); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      if (kind === 'dot') {
        ctx.arc(x, y, s * 0.16, 0, Math.PI * 2); ctx.fill();
      } else if (kind === 'warn') {
        ctx.moveTo(x, y - 0.36 * s); ctx.lineTo(x, y + 0.1 * s); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y + 0.33 * s, s * 0.065, 0, Math.PI * 2); ctx.fill();
      } else if (kind === 'up' || kind === 'down') {
        const d = kind === 'up' ? 1 : -1;
        ctx.moveTo(x, y - 0.28 * s * d); ctx.lineTo(x + 0.3 * s, y + 0.22 * s * d); ctx.lineTo(x - 0.3 * s, y + 0.22 * s * d);
        ctx.closePath(); ctx.fill();
      } else if (kind === 'key') {
        ctx.arc(x - 0.2 * s, y, 0.18 * s, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 0.02 * s, y); ctx.lineTo(x + 0.44 * s, y);
        ctx.moveTo(x + 0.26 * s, y); ctx.lineTo(x + 0.26 * s, y + 0.16 * s);
        ctx.moveTo(x + 0.4 * s, y); ctx.lineTo(x + 0.4 * s, y + 0.2 * s);
        ctx.stroke();
      } else if (kind === 'arrow') {
        ctx.moveTo(x - 0.38 * s, y); ctx.lineTo(x + 0.36 * s, y);
        ctx.moveTo(x + 0.12 * s, y - 0.22 * s); ctx.lineTo(x + 0.38 * s, y); ctx.lineTo(x + 0.12 * s, y + 0.22 * s);
        ctx.stroke();
      }
      ctx.restore();
    },

    // LEGACY chip (pre-R4): chip(str, x, y, o) — an uppercase mono label in a line2 hairline pill. Reached
    // through chip() when its first argument is a string. Returns its width.
    _chipOld(str, x, y, o) {
      o = o || {};
      const size = Math.max(MIN_TEXT, o.size || 32);
      const padX = o.padX == null ? 20 : o.padX;
      const h = o.h || Math.round(size * 1.75);
      const s = o.upper === false ? String(str) : String(str).toUpperCase();
      const w = K.measure(s, 'mono', size, 500) + padX * 2 + (o.marker ? size * 0.9 : 0);
      const left = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      const a = o.alpha == null ? 1 : o.alpha;
      K.rect(left, y - h / 2, w, h, { r: o.r == null ? h / 2 : o.r, stroke: o.stroke || ink('line2'), alpha: a, p: o.p });
      let tx = left + padX;
      if (o.marker) { K.node(tx + size * 0.3, y, o.marker, { size: Math.round(size * 0.55), color: o.markerColor, alpha: a }); tx += size * 0.9; }
      text('mono', s, tx, y + size * 0.36, size, 500, o.color || ink('ink2'), a, 'left', 0.04);
      return w;
    },

    // A bar that grows up from a baseline (charts). Filled — keep total bar area small.
    bar(x, yBase, w, h, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      if (p <= 0) return;
      const hh = h * p;
      ctx.save();
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      ctx.fillStyle = o.color || ink('green');
      rr(x, yBase - hh, w, hh, Math.min(o.r == null ? 3 : o.r, hh / 2)); ctx.fill();
      ctx.restore();
    },

    // LEGACY, opt-in only (build 1): header strip with a meta line. REWORK §4 kills header meta strips;
    // rewritten faces use wallTitle() instead.
    header(indexStr, title, meta, p = 1) {
      const g = GRID;
      const a = ease(seg(p, 0.02, 0.2));
      const rise = (1 - a) * 10;
      K.hair(g.x0, g.headLine, g.x1, g.headLine, { color: P.line2, w: 2, p: ease(seg(p, 0, 0.32)) });
      if (a <= 0) return;
      const y = g.headBase + rise;
      K.node(g.x0 + 11, y - 11, 'live', { size: 22, alpha: a, color: P.green, core: P.greenHi });
      let x = g.x0 + 44;
      x += text('mono', indexStr, x, y, 32, 500, P.ink3, a, 'left', 0.04) + 18;
      K.hair(x, y - 11, x + 30, y - 11, { color: P.ink3, w: 2, alpha: a });
      x += 48;
      text('mono', String(title).toUpperCase(), x, y, 32, 500, P.ink1, a, 'left', 0.1);
      if (meta) text('mono', String(meta), g.x1, y, 32, 400, P.ink3, a, 'right', 0.06);   // case as given
    },

    // LEGACY footer strip, y 1180–1230: hairline + mono status left, optional right.
    footer(left, right, p = 1) {
      const g = GRID;
      K.hair(g.x0, g.footLine, g.x1, g.footLine, { color: P.line, w: 2, p: ease(seg(p, 0.55, 0.9)) });
      const a = ease(seg(p, 0.7, 1));
      if (a <= 0) return;
      if (left) text('mono', String(left).toUpperCase(), g.x0, g.footBase, 32, 400, P.ink3, a, 'left', 0.06);
      if (right) text('mono', String(right).toUpperCase(), g.x1, g.footBase, 32, 400, P.ink3, a, 'right', 0.06);
    },

    // ================================================================================================
    // Shared work on glass (REWORK 01, re-ruled by FIX-PLAN-R1 F1). Deterministic in its arguments.
    // ================================================================================================

    // Draw fn() rotated `deg` about (cx, cy). Hand-set tilts: keep |deg| ≤ 1.5 (REWORK §4).
    rot(cx, cy, deg, fn) {
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(deg * Math.PI / 180); ctx.translate(-cx, -cy);
      try { fn(); } finally { ctx.restore(); }
    },

    // Who made it: circle = human, square = agent, centred on (x, y), size s (diameter / side).
    // Human: an open ring (P.human on glass, noteHuman on paper). o.fill: a faint fill of the same hue.
    // Agent: THE AGENT GLYPH (FIX-PLAN-R4 F0.2: the cube head with a screen face), never K.node (K.node is
    // state only). On paper: noteAgent body. On glass: green body. The screen is P.screen with P.screenEye
    // eyes either way. o.color overrides the body. o.state 'ahead' = the outline body (stroke max(2.5, s/12)),
    // screen still drawn. Any other state = filled.
    mark(kind, x, y, o) {
      o = o || {};
      const s = o.size || 24;
      const a = o.alpha == null ? 1 : o.alpha;
      if (a <= 0) return;
      if (kind === 'human') {
        const col = o.color || ink('human');
        ctx.save();
        ctx.globalAlpha = a;
        if (o.fill) { ctx.globalAlpha = a * 0.22; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = a; }
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(2.5, s / 8);
        ctx.beginPath(); ctx.arc(x, y, s / 2 - ctx.lineWidth / 2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else {
        const col = o.color || (onPaper ? P.noteAgent : P.green);
        ctx.save();
        ctx.globalAlpha = a;
        agentFace(x, y, s, col, o.state === 'ahead', Math.max(2.5, s / 12));
        ctx.restore();
      }
    },

    // THE PAIR (FIX-PLAN-R1 F1) — the default credit. Left → right, one mark per entry, gap 12:
    //   human = ring r 24 (noteHuman on paper, P.human on glass) with mono initials ≥ 32 inside;
    //   agent = THE AGENT GLYPH (FIX-PLAN-R4 F0.2): the screen-faced cube, side 40 (small: 30), noteAgent
    //           body on paper, P.green on glass, P.screen screen, P.screenEye eyes.
    // Then gap 18 and the non-empty names joined by ' + ' in Geist Mono 500 40 (noteInk2 / ink2).
    // One line, no verbs, no hairline. (x, y) = left edge, vertical centre of the mark row.
    //   credits [{ kind, name, alpha?, scale?, dx?, dy?, state? }] — state 'ahead' = the outline body
    //           (stroke ringW), screen still drawn
    //   o { alpha, p (stagger), size:'small' (ring 18 / square 30 / names 32, no initials), names, onGlass }
    // Returns { w, h, marks: [[x, y], …] } (mark centres in the caller's coords, credit order).
    pair(credits, x, y, o) {
      o = o || {};
      if (!credits || !credits.length) return { w: 0, h: 0, marks: [] };
      const Lay = pairLayout(credits, x, y, o);
      const D = Lay.D;
      const a = o.alpha == null ? 1 : o.alpha;
      if (a <= 0) return { w: Lay.w, h: Lay.h, marks: Lay.marks };
      const glass = !!o.onGlass || !onPaper;
      const hum = glass ? P.human : P.noteHuman;
      const ag = glass ? P.green : P.noteAgent;
      const in1 = glass ? P.ink1 : P.noteInk1;
      const in2 = glass ? P.ink2 : P.noteInk2;
      for (let i = 0; i < credits.length; i++) {
        const c = credits[i] || {};
        const ai = a * (c.alpha == null ? 1 : c.alpha) * (o.p == null ? 1 : stag(o.p, i, 0, 0.18, 0.5));
        if (ai <= 0) continue;
        const sc = c.scale == null ? 1 : c.scale;
        const mx = Lay.marks[i][0], my = Lay.marks[i][1];
        ctx.save();
        ctx.globalAlpha = ai;
        if (c.kind === 'human') {
          ctx.strokeStyle = hum; ctx.lineWidth = D.ringW * sc;
          ctx.beginPath(); ctx.arc(mx, my, D.ring * sc, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
          if (D.initials && sc > 0.7) text('mono', initials(c.name), mx, my + D.initials * 0.36, D.initials, 500, in1, ai, 'center', -0.06);
        } else {
          const s = D.square * sc;
          agentFace(mx, my, s, ag, c.state === 'ahead', D.ringW * sc);
          ctx.restore();
        }
      }
      if (Lay.nm) text('mono', Lay.nm, Lay.namesX, y + D.names * 0.36, D.names, 500, in2, a, 'left', 0.02);
      return { w: Lay.w, h: Lay.h, marks: Lay.marks };
    },
    pairW(credits, o) { return credits && credits.length ? pairLayout(credits, 0, 0, o).w : 0; },

    // LEGACY credit rows (do not use: FIX-PLAN-R1 deletes verb credits). Kept so an old face still
    // renders; draws in the old grammar with paper-aware inks.
    creditW(credits, style = 'row') {
      const sz = 32, ms = 22;
      const one = (c) => ms + 14 + K.measure(style === 'names' || !c.verb ? c.name : `${c.verb} · ${c.name}`, 'mono', sz, 500);
      if (style === 'stack') return Math.max(...credits.map(one));
      const gap = style === 'names' ? 30 : K.measure('  →  ', 'mono', sz, 500);
      return credits.reduce((s, c, i) => s + one(c) + (i ? gap : 0), 0);
    },
    credit(credits, x, y, o) {
      o = o || {};
      if (!credits || !credits.length) return { w: 0, h: 0 };
      const a = o.alpha == null ? 1 : o.alpha;
      const sz = 32, ms = 22, lh = o.lh || 46;
      let style = o.style || 'auto';
      if (style === 'auto') style = (!o.maxW || K.creditW(credits, 'row') <= o.maxW) ? 'row' : 'stack';
      const col = o.color || ink('ink2');
      const nameCol = o.nameColor || ink('ink1');
      const put = (c, cx, cy, i) => {
        const ai = a * (o.p == null ? 1 : stag(o.p, i, 0, 0.18, 0.5));
        K.mark(c.kind, cx + ms / 2, cy - 11, { size: ms, state: c.state, alpha: ai, fill: c.fill });
        let tx = cx + ms + 14;
        if (style !== 'names' && c.verb) tx += text('mono', `${c.verb} · `, tx, cy, sz, 400, col, ai, 'left', 0.02);
        tx += text('mono', c.name, tx, cy, sz, 500, nameCol, ai, 'left', 0.02);
        return tx - cx;
      };
      if (style === 'stack') {
        let w = 0;
        credits.forEach((c, i) => { w = Math.max(w, put(c, x, y + i * lh, i)); });
        return { w, h: (credits.length - 1) * lh + sz };
      }
      let cx = x;
      credits.forEach((c, i) => {
        if (i) {
          if (style === 'names') cx += 30;
          else cx += text('mono', '  →  ', cx, y, sz, 400, ink('ink3'), a, 'left', 0.02);
        }
        cx += put(c, cx, y, i);
      });
      return { w: cx - x, h: sz };
    },

    // A pin head (on the glass, holding a card). o.alpha.
    pin(x, y, o) {
      o = o || {};
      const a = o.alpha == null ? 1 : o.alpha;
      if (a <= 0) return;
      const r = o.r || 9;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = P.shade; ctx.beginPath(); ctx.arc(x + 2, y + 4, r + 1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = o.color || P.pin; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * 0.55; ctx.fillStyle = P.ink1;
      ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.32, r * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    },

    // A strip of tape centred on (x, y), w × h, tilted deg. Slightly ragged ends.
    tape(x, y, w, deg, o) {
      o = o || {};
      const a = o.alpha == null ? 1 : o.alpha;
      if (a <= 0) return;
      const h = o.h || 34;
      const seed = o.seed == null ? `${x}|${y}` : o.seed;
      K.rot(x, y, deg, () => {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = P.tape;
        ctx.beginPath();
        const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2;
        ctx.moveTo(x0, y0); ctx.lineTo(x1, y0);
        for (let i = 1; i <= 4; i++) ctx.lineTo(x1 + (i % 2 ? -4 : 0) * (0.5 + hash(seed + 'r' + i)), y0 + h * i / 4);
        ctx.lineTo(x0, y1);
        for (let i = 3; i >= 0; i--) ctx.lineTo(x0 + (i % 2 ? 4 : 0) * (0.5 + hash(seed + 'l' + i)), y0 + h * i / 4);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });
    },

    // A paper tab on the top edge of a sheet at (x, yTop): paper fill, NO stroke, plain words in
    // Instrument Sans 500 38, noteInk1 (FIX-PLAN-R1 F1). o { alpha, shadow (true), color }. Returns width.
    tab(label, x, yTop, o) {
      o = o || {};
      const a = o.alpha == null ? 1 : o.alpha;
      const s = String(label);
      const w = K.measure(s, 'sans', 38, 500) + 44;
      const h = 58;
      if (a <= 0) return w;
      ctx.save();
      ctx.globalAlpha = a;
      if (o.shadow !== false) paperShadow();
      ctx.beginPath();
      ctx.moveTo(x, yTop + 1); ctx.lineTo(x + 10, yTop - h + 8); ctx.quadraticCurveTo(x + 12, yTop - h, x + 22, yTop - h);
      ctx.lineTo(x + w - 22, yTop - h); ctx.quadraticCurveTo(x + w - 12, yTop - h, x + w - 10, yTop - h + 8); ctx.lineTo(x + w, yTop + 1);
      ctx.closePath();
      ctx.fillStyle = P.note; ctx.fill();
      ctx.restore();
      text('sans', s, x + 22, yTop - 16, 38, 500, o.color || P.noteInk1, a, 'left', -0.02);
      return w;
    },

    // THE CARD — a paper note on the glass (FIX-PLAN-R1 F1): opaque paper, a soft offset shadow, no
    // outline; tilted by hand, pinned or taped. (x, y) = top-left before tilt; tilt is about the centre.
    //   seed · rot (default cardTilt(seed), |0.8..1.5|°) · p appear 0..1 (fades + drops 14 px) · alpha
    //   pad (30) · pin true|'tape'|false · tab 'plain words' · paper:false = ink straight on the glass
    //   sentence      one sentence, Instrument Sans 500 sentenceSize (56, ≥ 52), lh 1.22
    //   sentenceWeight the sentence's sans weight (500); 600 = a hand-lettered headline note (face 6
    //                 '186 hours back', FIX-PLAN-R2 F1). cardHeight wraps at the same weight.
    //   monoNums      digit runs inside the sentence in Geist Mono 500, same size, inline
    //   sentenceMaxW  optional cap on the sentence's wrap width (choose the break; no widowed last word)
    //   big / bigSize a large value in Geist Mono 500 (88) · bigUnit sans 500 44, ink2, same baseline, gap 16
    //                 (a comma between digits is kerned tight, FIX-PLAN-R2 F4; the gap follows the kerned width)
    //   lines [str]   mono lines, linesSize 32 (40 allowed)
    //   credit        [{ kind, name, alpha?, scale?, dx?, dy?, state? }] → pair() at the bottom; pairSize 'small'
    //                 (unset: full size if pairW fits w − 2·pad, else 'small' — size the note to pairW)
    //   marker        'wiki'|'skills'|'data' — a 20 px corner square (the only use of ramp hues)
    //   check 0..1    a ✓ top-right (size 40, stroke 4.5, noteAgent on paper)
    //   extra         true = not a wall item (under-sheets, notes dropping on or sliding off)
    //   draw(K, w, h, al)  custom content in card-local coords, K.cursor = next free baseline
    //   LEGACY (kept so old faces render): kicker, title/titleSize/mono, body, extraH, dim, creditP;
    //   live / stroke / creditStyle are ignored (no outline, credits are always the pair).
    // Returns geo { x, y, w, h, cx, cy, rot, at(u, v), toCanvas(lx, ly), pairMarks: [[lx, ly], …] }.
    cardHeight(w, o) {
      o = o || {};
      const pad = o.pad || 30;
      const inner = w - pad * 2;
      let hh = pad;
      if (o.kicker) hh += 40;
      if (o.title) hh += Math.round((o.titleSize || 44) * 1.2);
      if (o.big != null && o.big !== '') hh += Math.round((o.bigSize || 88) * 1.08);
      if (o.sentence) {
        if (o.kicker || o.title || (o.big != null && o.big !== '')) hh += 14;
        hh += K.sentenceH(o.sentence, sentMaxW(inner, o), sentSize(o), o.monoNums, o.sentenceWeight);
      }
      if (o.body) {
        const size = o.bodySize || 34, lh = size * 1.4;
        const words = String(o.body).split(/\s+/);
        ctx.font = `400 ${size}px ${FONT.body}`; setLS(0);
        let n = 0, line = '';
        for (const wd of words) { const t2 = line ? line + ' ' + wd : wd; if (line && ctx.measureText(t2).width > inner) { n++; line = wd; } else line = t2; }
        if (line) n++;
        hh += 10 + n * lh - size * 0.15;
      }
      if (o.lines && o.lines.length) hh += 10 + o.lines.length * Math.round(linesSize(o) * 1.44);
      if (o.extraH) hh += o.extraH;
      if (o.credit && o.credit.length) hh += 28 + pairDims({ size: pairSizeFor(w, o) }).row;
      return Math.round(hh + pad);
    },
    card(x, y, w, h, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      const a0 = (o.alpha == null ? 1 : o.alpha) * (o.dim == null ? 1 : 1 - o.dim);
      const a = a0 * ease(p);
      const seed = o.seed == null ? (o.sentence || o.title || `${x}|${y}`) : o.seed;
      const deg = o.rot == null ? cardTilt(seed) : o.rot;
      if (h == null) h = K.cardHeight(w, o);
      const pad = o.pad || 30;
      const cx = x + w / 2, cy = y + h / 2;
      const th = deg * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
      // the rise-in (fade + up 14 px) never carries a wall note below KEY_BOT mid-build (R4 §4.2): a note that
      // settles near the band rises only by the room it has, so the key band holds at every p, not just p 1.
      let drop = (1 - ease(p)) * 14;
      if (!o.extra && cardDepth === 0) {
        const bottom = cy + Math.abs(w / 2 * sn) + h / 2 * cs + (o.paper !== false ? SHADOW.dy + SHADOW.blur : 0);
        drop = Math.min(drop, Math.max(0, BAND.KEY_BOT - bottom));
      }
      const hasCredit = !!(o.credit && o.credit.length);
      const pSize = pairSizeFor(w, o);
      const pDims = pairDims({ size: pSize });
      const pairY = h - pad - pDims.row / 2;
      const geo = {
        x, y, w, h, cx, cy, rot: deg,
        at(u, v) { const lx = (u - 0.5) * w, ly = (v - 0.5) * h; return [cx + lx * cs - ly * sn, cy + lx * sn + ly * cs]; },
        toCanvas(lx, ly) { const ux = lx - w / 2, uy = ly - h / 2; return [cx + ux * cs - uy * sn, cy + ux * sn + uy * cs]; },
        pairMarks: hasCredit ? pairLayout(o.credit, pad, pairY, { size: pSize }).marks : [],
      };
      if (a <= 0) return geo;
      const paper = o.paper !== false;
      ctx.save();
      ctx.translate(cx, cy + drop); ctx.rotate(th); ctx.translate(-w / 2, -h / 2);
      if (!o.extra && cardDepth === 0) {
        // F8 stats: count the item; its lowest canvas-space point (rotated corners, + the paper shadow)
        stats.items++;
        const m = ctx.getTransform(), k0 = stats.base || 1, ext = paper ? SHADOW.dy + SHADOW.blur : 0;
        for (let i = 0; i < 4; i++) {
          const qx = i & 1 ? w : 0, qy = i & 2 ? h : 0;
          const yy = (m.b * qx + m.d * qy + m.f) / k0 + ext;
          if (yy > stats.maxY) stats.maxY = yy;
        }
      }
      const prevPaper = onPaper;
      cardDepth++;
      try {
        // the tab goes down first so the sheet covers its shadow; then the opaque paper, once
        if (o.tab) K.tab(o.tab, 26, 1, { alpha: a });
        if (paper) {
          ctx.save();
          ctx.globalAlpha = a;
          paperShadow();
          ctx.fillStyle = P.note;
          rr(0, 0, w, h, 4); ctx.fill();
          ctx.restore();
        }
        onPaper = paper;
        // content
        let cyl = pad;
        const inner = w - pad * 2;
        const hasBig = o.big != null && o.big !== '';
        if (o.kicker) { cyl += 30; text('mono', String(o.kicker).toUpperCase(), pad, cyl, 32, 500, ink('ink3'), a, 'left', 0.08); cyl += 10; }
        if (o.title) {
          const ts = o.titleSize || 44;
          cyl += Math.round(ts * 0.92);
          if (o.mono) text('mono', o.title, pad, cyl, Math.max(MIN_TEXT, ts), 500, ink('ink1'), a, 'left', 0.02);
          else K.sans(o.title, pad, cyl, { size: ts, maxW: inner - (o.marker ? 40 : 0) - (o.check != null ? 56 : 0), alpha: a });
          cyl += Math.round(ts * 0.28);
        }
        if (hasBig) {
          const bs = o.bigSize || 88;
          cyl += Math.round(bs * 0.9);
          const bw = text('mono', String(o.big), pad - 2, cyl, Math.max(MIN_TEXT, bs), 500, o.bigColor || ink('ink1'), a, 'left', 0);
          if (o.bigUnit) text('sans', String(o.bigUnit), pad - 2 + bw + 16, cyl, 44, 500, ink('ink2'), a, 'left', -0.02);
          cyl += Math.round(bs * 0.18);
        }
        if (o.sentence) {
          if (o.kicker || o.title || hasBig) cyl += 14;
          const ss = sentSize(o);
          cyl = K.sentence(o.sentence, pad, cyl + ss * 0.92, { size: ss, maxW: sentMaxW(inner, o), alpha: a, monoNums: o.monoNums, color: o.sentenceColor, weight: o.sentenceWeight }) - ss * 0.92;
        }
        if (o.body) {
          const size = o.bodySize || 34;
          const next = K.body(o.body, pad, cyl + 10 + size * 0.95, { size, lh: 1.4, maxW: inner, alpha: a, color: o.bodyColor });
          cyl = next - size * 1.4 + size * 0.3;   // last baseline + descent
        }
        if (o.lines && o.lines.length) {
          const ls = linesSize(o), llh = Math.round(ls * 1.44);
          cyl += 10;
          for (let i = 0; i < o.lines.length; i++) text('mono', o.lines[i], pad, cyl + Math.round(ls * 1.125) + i * llh, ls, 400, ink('ink2'), a, 'left', 0.02);
          cyl += o.lines.length * llh;
        }
        if (o.draw) { K.cursor = cyl; o.draw(K, w, h, a); }
        if (hasCredit) K.pair(o.credit, pad, pairY, { size: pSize, alpha: a, p: o.creditP });
        if (o.marker) {
          const col = P[o.marker] || ink('green');
          ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; rr(w - pad - 20, pad - 2, 20, 20, 3); ctx.fill(); ctx.restore();
        }
        if (o.check != null && o.check > 0) K.glyph('check', w - pad - 20 - (o.marker ? 44 : 0), pad + 18, { size: 40, w: 4.5, color: ink('green'), p: o.check, alpha: a });
        if (o.pin !== false) {
          if (o.pin === 'tape') K.tape(w / 2, 2, Math.min(150, w * 0.42), handRot(seed + 't', 4), { alpha: a * 0.95, seed });
          // pushed in near the top edge (y 10, r 8) so the head and its shadow clear the sentence's ascenders
          else K.pin(w / 2 + (hash(seed + 'p') - 0.5) * w * 0.3, 10, { alpha: a, r: 8 });
        }
      } finally {
        onPaper = prevPaper;
        cardDepth--;
        ctx.restore();
      }
      return geo;
    },

    // A hand-drawn arrow from `a` to `b` ([x, y]), stroked on to p; the head draws in the last 15 %.
    //   curve  signed bend as a fraction of length (default 0.16; negative bends the other way)
    //   seed   wobble seed · w stroke (3.5) · color (P.hand) · head true|false · headLen (26) · alpha
    arrow(a, b, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      if (p <= 0) return;
      const al = o.alpha == null ? 1 : o.alpha;
      if (al > 0 && cardDepth === 0) stats.arrows++;
      const seed = o.seed == null ? `${a[0]}|${a[1]}|${b[0]}|${b[1]}` : o.seed;
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L, ny = dx / L;
      const bend = (o.curve == null ? 0.16 : o.curve) * L;
      const c = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend];
      const N = Math.max(12, Math.min(48, Math.round(L / 18)));
      const ph = hash(seed) * 6.283, amp = Math.min(6, L * 0.008);
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, u = 1 - t;
        const wob = Math.sin(t * Math.PI) * amp * Math.sin(ph + t * 7.3);
        pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0] + nx * wob, u * u * a[1] + 2 * u * t * c[1] + t * t * b[1] + ny * wob]);
      }
      const col = o.color || ink('hand'), w = o.w || 3.5;
      const body = seg(p, 0, o.head === false ? 1 : 0.85);
      strokePolys([pts], col, w, body, al);
      if (o.head === false) return;
      const hp = seg(p, 0.85, 1);
      if (hp <= 0) return;
      const e = pts[N], f = pts[N - 2];
      const ang = Math.atan2(e[1] - f[1], e[0] - f[0]);
      const hl = o.headLen || 26;
      const l1 = hl * (0.9 + 0.2 * hash(seed + 'a')), l2 = hl * (0.9 + 0.2 * hash(seed + 'b'));
      const h1 = [[e[0] + Math.cos(ang + Math.PI - 0.5) * l1, e[1] + Math.sin(ang + Math.PI - 0.5) * l1], e];
      const h2 = [e, [e[0] + Math.cos(ang + Math.PI + 0.46) * l2, e[1] + Math.sin(ang + Math.PI + 0.46) * l2]];
      strokePolys([h1, h2], col, w, hp, al);
    },

    // Handwriting, suggested — never a script font (REWORK §4). A deterministic looping stroke.
    //   style 'line' (default): words of joined loops across width w, x-height h (26), slant .22
    //   style 'signature': one big looping word + a trailing flourish (h 44)
    //   style 'underline': a hand-drawn underline (slight wave, optional double: o.double)
    //   style 'circle': a hand-drawn loop AROUND the box (x, y, w, o.h) — overshoots its start
    //   style 'trend': one sketched line rising left → right across the box (x, y, w, o.h 130): 7 seeded
    //                  points (±6 px), smoothed, no axes / labels / dots (FIX-PLAN-R2 F1, face 6)
    // (x, y) = baseline start (line/signature/underline) or box top-left (circle, trend). p = stroke-on.
    // LOD: every style except 'underline' is a no-op.
    scribble(x, y, w, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      if (p <= 0) return;
      const style = o.style || 'line';
      if (lod && style !== 'underline') return;
      const seed = o.seed == null ? 1 : o.seed;
      const h = o.h || (style === 'signature' ? 44 : style === 'circle' ? 80 : style === 'trend' ? 130 : 26);
      const key = `${style}|${seed}|${Math.round(w)}|${h}|${o.double ? 1 : 0}`;
      let polys = SCRIB.get(key);
      if (!polys) { polys = scribbleGeom(style, seed, w, h, !!o.double); SCRIB.set(key, polys); }
      ctx.save();
      ctx.translate(x, y);
      strokePolys(polys, o.color || ink('hand'), o.w || (style === 'signature' ? 3.5 : 3), p, o.alpha);
      ctx.restore();
    },

    // People and agents on one job, left → right: [ 'human' | 'agent' | { kind, state, fill } ].
    // (x, y) = centre of the first mark. o.size (30), o.gap (10), o.p stagger, o.fresh = index of a
    // just-arrived member with o.freshT 0..1: it scales 0.95 → 1 while it fades in (INTERACTION: never
    // scale from 0). Returns the total width.
    avatarStack(x, y, kinds, o) {
      o = o || {};
      const s = o.size || 30, gap = o.gap == null ? 10 : o.gap;
      const a = o.alpha == null ? 1 : o.alpha;
      kinds.forEach((k0, i) => {
        const it = typeof k0 === 'string' ? { kind: k0 } : k0;
        let ai = a * (o.p == null ? 1 : stag(o.p, i, 0, 0.12, 0.4));
        let si = s;
        if (o.fresh === i && o.freshT != null) { const f = ease(o.freshT); si = s * (0.95 + 0.05 * f); ai *= f; }
        K.mark(it.kind, x + i * (s + gap), y, { size: si, state: it.state, alpha: ai, fill: it.fill });
      });
      return kinds.length * s + (kinds.length - 1) * gap;
    },

    // A slack string between two points: parabola sag, stroke-on.
    string(a, b, o) {
      o = o || {};
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const sag = o.sag == null ? L * 0.08 : o.sag;
      const pts = [];
      for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t) + sag * 4 * t * (1 - t)]); }
      K.path(pts, { color: o.color || ink('line2'), w: o.w || 2, p: o.p, alpha: o.alpha });
    },

    // The ONE large title on each wall: Instrument Sans 600 at 104 (FIX-PLAN-R1 F1), a hair off level,
    // with a hand-drawn underline stroked on. Returns the title width.
    // LOD (FIX-PLAN-R3 §0.3.1): no letters and no thin underline; ONE hand-stroke bar ('underline'
    // scribble) the title's full width, 14 px, noteInk2 on paper / ink3 on glass, on the glyphs' mid-line
    // (baseline − .36·size), same tilt, stroked on over seg(p, 0, .6). Still returns w.
    wallTitle(str, x, y, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      const size = o.size || 104;
      const a = (o.alpha == null ? 1 : o.alpha) * ease(seg(p, 0, 0.5));
      const w = K.measure(str, 'sans', size, 600);
      if (lod) {
        const barCol = onPaper ? P.noteInk2 : P.ink3;
        K.rot(x, y, o.rot == null ? -0.6 : o.rot, () => {
          K.scribble(x, y - Math.round(size * 0.36), w, { style: 'underline', seed: str, p: seg(p, 0, 0.6), w: 14, color: barCol, alpha: o.alpha });
        });
        return w;
      }
      K.rot(x, y, o.rot == null ? -0.6 : o.rot, () => {
        K.sans(str, x, y + (1 - a) * 10, { size, alpha: a, weight: 600, color: o.color });
        if (o.underline !== false) K.scribble(x - 4, y + Math.round(size * 0.26), Math.min(w * 0.72, w - 10), { style: 'underline', seed: str, p: seg(p, 0.3, 1), w: 4, color: o.lineColor || ink('green') });
      });
      return w;
    },

    // LEGACY (do not use: FIX-PLAN-R1 deletes k.note() footers). The faint mono footer line.
    note(left, right, p = 1) {
      const a = ease(seg(p, 0.6, 1));
      if (a <= 0) return;
      if (left) text('mono', String(left).toUpperCase(), GRID.x0, GRID.footBase, 32, 400, P.ink3, a, 'left', 0.06);
      if (right) text('mono', String(right).toUpperCase(), GRID.x1, GRID.footBase, 32, 400, P.ink3, a, 'right', 0.06);
    },

    // ================================================================================================
    // The app family on glass (FIX-PLAN-R4 F0.2). Every primitive draws only from P, honours p (build)
    // and alpha, keeps text >= MIN_TEXT, and has no accent rail and no gradient.
    // ================================================================================================

    // A WINDOW. (x, y) = top-left, w × h including the 56 px title bar. Returns the content rect below
    // the bar { x, y: y + 56, w, h: h − 56, a } where a = the window's current alpha (multiply content by it).
    //   o { title, titleAlign 'center'|'left' (left = x + 104 after the dots, x + 28 without), dots (true),
    //       meta (mono 32 ink3, right-aligned, right pad 28), metaMark (a P key: an 18 px square 12 px left
    //       of the meta — a ramp hue is allowed here, it is a <= 20 px marker), chips [{ text, tone }] (right-
    //       aligned in the bar, gap 12, right pad 20; used instead of meta), p (1), alpha (1), shadow (true) }
    // Build = alpha only: alpha · ease(seg(p, 0, .5)), no positional offset, so p never moves maxY.
    // Budget (F8): records maxY = y + h + 34 with the shadow (dy 10 + blur 24), y + h without.
    window(x, y, w, h, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      const a = (o.alpha == null ? 1 : o.alpha) * ease(seg(p, 0, 0.5));
      const shadow = o.shadow !== false;
      const BAR = 56;
      recordBottom(x, y, w, h, shadow ? 34 : 0);
      const content = { x, y: y + BAR, w, h: h - BAR, a };
      if (a <= 0) return content;
      ctx.save();
      ctx.globalAlpha = a;
      if (shadow) {
        const s = scaleNow();
        ctx.shadowColor = P.winShade; ctx.shadowBlur = 24 * s; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 10 * s;
      }
      ctx.fillStyle = P.win;
      rr(x, y, w, h, 22); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = P.winBar;
      rrc(x, y, w, BAR, [22, 22, 0, 0]); ctx.fill();
      ctx.fillStyle = P.winLine;
      ctx.fillRect(x, y + BAR - 0.5, w, 1);
      ctx.strokeStyle = P.winLine; ctx.lineWidth = 1.5;
      rr(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 21.25); ctx.stroke();
      const dots = o.dots !== false;
      if (dots) {
        ctx.globalAlpha = a * 0.5; ctx.fillStyle = P.ink3;
        ctx.beginPath();
        for (const dx of [28, 52, 76]) { ctx.moveTo(x + dx + 7, y + BAR / 2); ctx.arc(x + dx, y + BAR / 2, 7, 0, Math.PI * 2); }
        ctx.fill();
      }
      ctx.restore();
      const by = y + BAR / 2 + 11.5;   // baseline that centres a 32 px cap height in the bar
      if (o.title) {
        const left = o.titleAlign === 'left';
        text('sans', String(o.title), left ? x + (dots ? 104 : 28) : x + w / 2, by, 32, 600, P.ink2, a, left ? 'left' : 'center', -0.01);
      }
      if (o.chips && o.chips.length) {
        let cx = x + w - 20;
        for (let i = o.chips.length - 1; i >= 0; i--) {
          const c = o.chips[i];
          cx -= K.chip(cx, y + BAR / 2, c.text, { tone: c.tone, align: 'right', alpha: a, avatar: c.avatar }) + 12;
        }
      } else if (o.meta) {
        const mw = text('mono', String(o.meta), x + w - 28, by, 32, 400, P.ink3, a, 'right', 0.02);
        if (o.metaMark && P[o.metaMark]) {
          ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = P[o.metaMark];
          rr(x + w - 28 - mw - 12 - 18, y + BAR / 2 - 9, 18, 18, 3); ctx.fill();
          ctx.restore();
        }
      }
      return content;
    },

    // A CHIP: pill 48 tall, radius 24, Geist Mono 500 32 as given (no forced uppercase), padX 18. (x, y) =
    // anchor edge per align, vertical centre. Returns its width.
    //   o { tone 'plain' (1.5 px winLine stroke, ink2) | 'sel' (sel fill, no stroke, ink1), align 'left'|
    //       'right'|'center', alpha, p (fade), avatar { kind, name } (a 30 px avatar inside on the left, gap
    //       10, left pad 9 so it sits in the pill like a thumb), color (text) }
    // Back-compat: chip(str, x, y, o) (a string first) is the LEGACY chip, unchanged.
    chip(x, y, str, o) {
      if (typeof x === 'string') return K._chipOld(x, y, str, o);
      o = o || {};
      const s = String(str);
      const H = 48, padX = 18, av = o.avatar, AV = 30;
      const tw = K.measure(s, 'mono', 32, 500);
      const w = (av ? 9 + AV + 10 : padX) + tw + padX;
      const left = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      const a = (o.alpha == null ? 1 : o.alpha) * (o.p == null ? 1 : ease(o.p));
      if (a <= 0) return w;
      const sel = o.tone === 'sel';
      ctx.save();
      ctx.globalAlpha = a;
      if (sel) { ctx.fillStyle = P.sel; rr(left, y - H / 2, w, H, 24); ctx.fill(); }
      else { ctx.strokeStyle = P.winLine; ctx.lineWidth = 1.5; rr(left + 0.75, y - H / 2 + 0.75, w - 1.5, H - 1.5, 23.25); ctx.stroke(); }
      ctx.restore();
      let tx = left + padX;
      if (av) { K.avatar(av.kind, av.name, left + 9 + AV / 2, y, AV, { alpha: a }); tx = left + 9 + AV + 10; }
      text('mono', s, tx, y + 11.5, 32, 500, o.color || (sel ? ink('ink1') : ink('ink2')), a, 'left', 0.02);
      return w;
    },

    // AN AVATAR, centred on (x, y), size s (48). Returns s.
    //   'human': a circle of diameter s, a 3 px ring in P.human (noteHuman on paper), a faint fill of the
    //            same hue at .14, and initials(name) in mono 32 500 ink1 when s >= 44 (ring only below).
    //   'agent': THE CAST'S FACE AT CHIP SIZE (agentFace above): green body (noteAgent on paper), screen,
    //            two eye bars. o.state 'ahead' = outlined body, screen still drawn.
    //   o { alpha, p (fade), state, fresh 0..1 (scale .95 → 1 with alpha: INTERACTION, never from 0) }
    // Back-compat: avatar(x, y, initialsStr, o) (a number first) is the LEGACY avatar, unchanged.
    avatar(kind, name, x, y, s, o) {
      if (typeof kind === 'number') return K._avatarOld(kind, name, x, y);
      o = o || {};
      s = s || 48;
      let a = (o.alpha == null ? 1 : o.alpha) * (o.p == null ? 1 : ease(o.p));
      let ss = s;
      if (o.fresh != null) { const f = ease(o.fresh); ss = s * (0.95 + 0.05 * f); a *= f; }
      if (a <= 0) return s;
      ctx.save();
      ctx.globalAlpha = a;
      if (kind === 'human') {
        const col = ink('human');
        ctx.globalAlpha = a * 0.14; ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y, ss / 2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(x, y, ss / 2 - 1.25, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        // FACES R4 review: two mono 32 caps at -.04 em touched the 3 px ring on a 44 chip ("MK", "NR"); a 2.5 px
        // ring and -.08 em tracking leave ~3 px either side without going under MIN_TEXT.
        if (s >= 44) text('mono', initials(name), x, y + 11.5, 32, 500, ink('ink1'), a, 'center', -0.08);
        return s;
      }
      agentFace(x, y, ss, onPaper ? P.noteAgent : P.green, o.state === 'ahead', Math.max(2, ss / 12));
      ctx.restore();
      return s;
    },

    // A SPREADSHEET GRID at (x, y). Returns { x, y, w, h, cell(r, c) → { x, y, w, h } } (r −1 = the
    // header row, 0.. = data rows).
    //   cols [{ w, head, align 'left'|'right', font 'mono'|'body' }] · rows string[][] (data rows)
    //   o { letters (true: a 44 strip of A, B, C… on winBar), nums (true: a 64 gutter on winBar, header 1,
    //       data 2..n+1), rowH 48, headH 48, pad 14, sel { r, c } (2 px green outline inset 1 + the letter and
    //       number cells tinted sel), skip(r, c) → true leaves that cell empty for the caller, alpha,
    //       p (chrome ease(seg(p, 0, .2)); data row i ease(seg(p, .1 + .04i, .3 + .04i))) }
    // Head text mono 32 500 ink1; cells mono 32 400 ink2 (font 'body' = Geist 400 32); align 'right' is
    // right-aligned at the cell's pad. Geist Mono digits are tabular by construction. 1 px chGrid rules
    // on every row and column edge.
    grid(x, y, cols, rows, o) {
      o = o || {};
      const LET = o.letters === false ? 0 : 44, NUMW = o.nums === false ? 0 : 64;
      const rowH = o.rowH || 48, headH = o.headH || 48, pad = o.pad == null ? 14 : o.pad;
      const p = o.p == null ? 1 : clamp01(o.p);
      const A = o.alpha == null ? 1 : o.alpha;
      const cx = [];
      let acc = x + NUMW;
      for (const c of cols) { cx.push(acc); acc += c.w; }
      const w = acc - x, h = LET + headH + rows.length * rowH;
      const headY = y + LET, dataY = headY + headH;
      const cell = (r, c) => ({ x: cx[c], y: r < 0 ? headY : dataY + r * rowH, w: cols[c].w, h: r < 0 ? headH : rowH });
      const G = { x, y, w, h, cell };
      const ac = A * ease(seg(p, 0, 0.2));
      if (ac <= 0) return G;
      const sel = o.sel;
      ctx.save();
      ctx.globalAlpha = ac;
      ctx.fillStyle = P.winBar;
      if (LET) ctx.fillRect(x, y, w, LET);
      if (NUMW) ctx.fillRect(x, y + LET, NUMW, h - LET);
      if (sel) {
        ctx.fillStyle = P.sel;
        if (LET) ctx.fillRect(cx[sel.c], y, cols[sel.c].w, LET);
        if (NUMW) ctx.fillRect(x, dataY + sel.r * rowH, NUMW, rowH);
      }
      ctx.strokeStyle = P.chGrid; ctx.lineWidth = 1;
      ctx.beginPath();
      const hl = (yy) => { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); };
      hl(y + 0.5); if (LET) hl(y + LET + 0.5); hl(dataY + 0.5);
      for (let r = 1; r <= rows.length; r++) hl(dataY + r * rowH - 0.5);
      const vl = (xx) => { ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); };
      vl(x + 0.5); if (NUMW) vl(x + NUMW + 0.5);
      for (let c = 1; c < cols.length; c++) vl(cx[c] + 0.5);
      vl(x + w - 0.5);
      ctx.stroke();
      ctx.restore();
      const mid = (top, hh) => top + hh / 2 + 11.2;
      for (let c = 0; c < cols.length; c++) {
        if (LET) text('mono', String.fromCharCode(65 + (c % 26)), cx[c] + cols[c].w / 2, mid(y, LET), 32, 400, P.ink3, ac, 'center', 0);
        const hd = cols[c].head;
        if (hd != null && hd !== '') {
          const right = cols[c].align === 'right';
          text('mono', String(hd), right ? cx[c] + cols[c].w - pad : cx[c] + pad, mid(headY, headH), 32, 500, ink('ink1'), ac, right ? 'right' : 'left', 0.02);
        }
      }
      if (NUMW) text('mono', '1', x + NUMW / 2, mid(headY, headH), 32, 400, P.ink3, ac, 'center', 0);
      for (let r = 0; r < rows.length; r++) {
        const ar = A * ease(seg(p, 0.1 + 0.04 * r, 0.3 + 0.04 * r));
        if (ar <= 0) continue;
        const top = dataY + r * rowH, by = mid(top, rowH);
        if (NUMW) text('mono', String(r + 2), x + NUMW / 2, by, 32, 400, P.ink3, ar, 'center', 0);
        const row = rows[r] || [];
        for (let c = 0; c < cols.length; c++) {
          if (o.skip && o.skip(r, c)) continue;
          const v = row[c];
          if (v == null || v === '') continue;
          const right = cols[c].align === 'right', body = cols[c].font === 'body';
          text(body ? 'body' : 'mono', String(v), right ? cx[c] + cols[c].w - pad : cx[c] + pad, by, 32, 400, ink('ink2'), ar, right ? 'right' : 'left', body ? 0 : 0.02);
        }
      }
      if (sel && sel.r >= 0 && sel.r < rows.length) {
        const cc = cell(sel.r, sel.c);
        ctx.save();
        ctx.globalAlpha = A * ease(seg(p, 0.1 + 0.04 * sel.r, 0.3 + 0.04 * sel.r));
        ctx.strokeStyle = P.green; ctx.lineWidth = 2;
        ctx.strokeRect(cc.x + 1, cc.y + 1, cc.w - 2, cc.h - 2);
        ctx.restore();
      }
      return G;
    },

    // A CHECKBOX, centred, r 18. Not done: a 2.5 px ink3 ring. Done: filled green with a ✓ stroked in onGreen
    // (stroke 4, drawn directly: glyph('check') has a 36 px floor). o { p (fill alpha and check stroke-on), alpha }.
    checkbox(x, y, done, o) {
      o = o || {};
      const a = o.alpha == null ? 1 : o.alpha;
      if (a <= 0) return;
      const p = o.p == null ? 1 : clamp01(o.p);
      ctx.save();
      if (!done) {
        ctx.globalAlpha = a; ctx.strokeStyle = ink('ink3'); ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(x, y, 18 - 1.25, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        return;
      }
      const fa = a * ease(p);
      if (fa > 0) {
        ctx.globalAlpha = fa; ctx.fillStyle = ink('green');
        ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      if (p > 0) checkIn(x, y, 36, 4, p, a);
    },

    // THE BRAND SQUARE STATE MARKER, centred, side o.size (28), corner radius 3. Never a ramp hue.
    //   'done'  filled green (o.check: a ✓ in onGreen inside) · 'live' 3 px green outline + a centred core
    //   .38 × side in greenHi · 'ahead' 3 px ink3 outline, empty. o { alpha, p (fade; ✓ stroke-on), check }
    stateSq(x, y, state, o) {
      o = o || {};
      const s = o.size || 28;
      const p = o.p == null ? 1 : clamp01(o.p);
      const a = (o.alpha == null ? 1 : o.alpha) * ease(p);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      if (state === 'done') {
        ctx.fillStyle = ink('green');
        rr(x - s / 2, y - s / 2, s, s, 3); ctx.fill();
        ctx.restore();
        if (o.check) checkIn(x, y, s, Math.max(2.5, s / 8), p, a);
        return;
      }
      const lw = 3;
      ctx.strokeStyle = state === 'live' ? ink('green') : ink('ink3'); ctx.lineWidth = lw;
      rr(x - s / 2 + lw / 2, y - s / 2 + lw / 2, s - lw, s - lw, Math.max(1, 3 - lw / 2)); ctx.stroke();
      if (state === 'live') {
        const c = 0.38 * s;
        ctx.fillStyle = P.greenHi;
        rr(x - c / 2, y - c / 2, c, c, 1.5); ctx.fill();
      }
      ctx.restore();
    },

    // CHARTS (brand charts rules; see the header). Box (x, y, w, h): a 76 px left gutter for the tick labels
    // (mono 32 ink3, right-aligned, 12 px off the plot) and a 48 px bottom band for the x labels. The plot
    // is (x + 76, y) → (x + w, y + h − 48); y is the top tick. 1 px chGrid gridlines at the ticks, 1.5 px
    // chAxis baseline. Chrome fades in over ease(seg(p, 0, .2)).
    chart: null,

    // K.cached(key, p, fn) — the static layer (FIX-PLAN-R4 F8: 2D paint p90 <= 2.0 ms per redraw).
    // p < 1 (a build): fn(K) paints directly. p >= 1: fn(K2) paints ONCE into an offscreen canvas the size of
    // ctx.canvas, with its own kit K2 (same theme, same LOD, the same logical transform), cached per
    // key|theme|lod|canvas w×h|transform, and is then blitted with an identity transform on every draw. The
    // layer is transparent: wrapFace's glass tint stays underneath. Put chrome, grids, charts and other static
    // content in it; paint only the moving bits live. The layer's F8 stats (items, arrows, maxY) are re-added
    // on every blit. Nothing is cached while webfonts are still loading (a fallback font would stick).
    cached(key, p, fn) {
      if (p < 1 || (typeof document !== 'undefined' && document.fonts && document.fonts.status !== 'loaded')) { fn(K); return; }
      const cv = ctx.canvas;
      const m = ctx.getTransform();
      const ck = `${key}|${theme}|${lod ? 1 : 0}|${cv.width}x${cv.height}|${m.a.toFixed(4)},${m.b.toFixed(4)},${m.c.toFixed(4)},${m.d.toFixed(4)},${m.e.toFixed(1)},${m.f.toFixed(1)}`;
      let Lr = layers.get(ck);
      if (!Lr) {
        const off = newLayer(cv.width, cv.height);
        if (!off) { fn(K); return; }
        const oc = off.getContext('2d');
        const K2 = kit(oc, LW, LH, theme);
        K2._setLod(lod);
        const s2 = K2._stats;
        s2.items = 0; s2.arrows = 0; s2.maxY = 0; s2.base = stats.base;
        oc.setTransform(m);
        fn(K2);
        Lr = { off, items: s2.items, arrows: s2.arrows, maxY: s2.maxY };
        if (layers.size >= LAYER_MAX) layers.delete(layers.keys().next().value);
        layers.set(ck, Lr);
      }
      stats.items += Lr.items; stats.arrows += Lr.arrows;
      if (Lr.maxY > stats.maxY) stats.maxY = Lr.maxY;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(Lr.off, 0, 0);
      ctx.restore();
    },

    // Run fn with a clip rect (for rows sliding under a mask). fn gets no args.
    clip(x, y, w, h, fn) {
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      try { fn(); } finally { ctx.restore(); }
    },
  };
  // ---- K.chart = { bar, area, donut } ------------------------------------------------------------------
  const GUT = 76, BAND_X = 48;
  function chartFrame(x, y, w, h, max, ticks, fmtT, ac) {
    const px = x + GUT, pw = w - GUT, ph = h - BAND_X, base = y + ph;
    const Y = (v) => base - (v / max) * ph;
    if (ac > 0) {
      ctx.save();
      ctx.globalAlpha = ac;
      ctx.strokeStyle = P.chGrid; ctx.lineWidth = 1;
      ctx.beginPath();
      for (const t of ticks) { if (t === 0) continue; const yy = Math.round(Y(t)) + 0.5; ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); }
      ctx.stroke();
      ctx.strokeStyle = P.chAxis; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, base + 0.75); ctx.lineTo(px + pw, base + 0.75); ctx.stroke();
      ctx.restore();
      for (const t of ticks) text('mono', fmtT(t), px - 12, Y(t) + 11.2, 32, 400, ink('ink3'), ac, 'right', 0);
    }
    return { px, pw, ph, base, Y };
  }
  const niceMax = (vals) => { const m = Math.max(1e-9, ...vals); const e = Math.pow(10, Math.floor(Math.log10(m))); const f = m / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; };
  K.chart = {
    // bar(x, y, w, h, data [{ label, v }], o { max, ticks, fmt(v), labelLast (true), p, alpha }): one series
    // in ch1, width = slot × .62, top corners r 4 (square on the baseline); bar i grows from the baseline
    // over ease(seg(p, .2 + .06i, .6 + .06i)); x labels mono 32 ink3 centred; the last bar's fmt(v) in mono
    // 32 ink1 above it. Returns { px, pw, base, Y, slot, bars: [{ x, y, w, h }] }.
    bar(x, y, w, h, data, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      const A = o.alpha == null ? 1 : o.alpha;
      const max = o.max || niceMax(data.map((d) => d.v));
      const ticks = o.ticks || [0, max / 2, max];
      const f = o.fmt || ((v) => String(v));
      const ac = A * ease(seg(p, 0, 0.2));
      const F = chartFrame(x, y, w, h, max, ticks, f, ac);
      const n = data.length, slot = F.pw / Math.max(1, n), bw = Math.min(slot * 0.62, slot - 2);
      const bars = [];
      ctx.save();
      ctx.fillStyle = P.ch1;
      for (let i = 0; i < n; i++) {
        const g = ease(seg(p, 0.2 + 0.06 * i, 0.6 + 0.06 * i));
        const full = Math.max(0, (data[i].v / max) * F.ph);
        const hh = full * g;
        const bx = F.px + slot * i + (slot - bw) / 2;
        bars.push({ x: bx, y: F.base - full, w: bw, h: full });
        if (hh > 0 && A > 0) {
          ctx.globalAlpha = A;
          const r = Math.min(4, hh / 2, bw / 2);
          rrc(bx, F.base - hh, bw, hh, [r, r, 0, 0]); ctx.fill();
        }
      }
      ctx.restore();
      if (ac > 0) for (let i = 0; i < n; i++) text('mono', String(data[i].label), F.px + slot * (i + 0.5), F.base + 36, 32, 400, ink('ink3'), ac, 'center', 0);
      if (o.labelLast !== false && n) {
        const i = n - 1, g = ease(seg(p, 0.2 + 0.06 * i, 0.6 + 0.06 * i));
        if (g > 0) text('mono', f(data[i].v), F.px + slot * (i + 0.5), bars[i].y - 14, 32, 500, ink('ink1'), A * g, 'center', 0);
      }
      return { px: F.px, pw: F.pw, base: F.base, Y: F.Y, slot, bars };
    },

    // area(x, y, w, h, data number[], o { max, ticks, fmt(v), xLabels [{ i, text }], p, alpha }): one series,
    // ch1 fill at .22 down to the zero baseline + a 2 px ch1 line (round joins, straight segments: no spline
    // overshoot), revealed left → right by a clip over ease(p). x labels: the first is left-aligned at its
    // point, the last right-aligned, the rest centred (so none leaves the box). Returns { px, pw, base, Y, X }.
    area(x, y, w, h, data, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      const A = o.alpha == null ? 1 : o.alpha;
      const max = o.max || niceMax(data);
      const ticks = o.ticks || [0, max / 2, max];
      const f = o.fmt || ((v) => String(v));
      const ac = A * ease(seg(p, 0, 0.2));
      const F = chartFrame(x, y, w, h, max, ticks, f, ac);
      const n = data.length;
      const X = (i) => F.px + (n > 1 ? (i / (n - 1)) * F.pw : F.pw / 2);
      const rev = ease(seg(p, 0.15, 0.85));
      if (rev > 0 && A > 0 && n > 1) {
        ctx.save();
        ctx.beginPath(); ctx.rect(F.px - 2, y - 40, F.pw * rev + 4, h + 40); ctx.clip();
        ctx.beginPath();
        ctx.moveTo(X(0), F.base);
        for (let i = 0; i < n; i++) ctx.lineTo(X(i), F.Y(data[i]));
        ctx.lineTo(X(n - 1), F.base); ctx.closePath();
        ctx.globalAlpha = A * 0.22; ctx.fillStyle = P.ch1; ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < n; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, X(i), F.Y(data[i]));
        ctx.globalAlpha = A; ctx.strokeStyle = P.ch1; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
      if (ac > 0 && o.xLabels) {
        for (const L of o.xLabels) {
          const al = L.i <= 0 ? 'left' : L.i >= n - 1 ? 'right' : 'center';
          text('mono', String(L.text), X(L.i), F.base + 36, 32, 400, ink('ink3'), ac, al, 0);
        }
      }
      return { px: F.px, pw: F.pw, base: F.base, Y: F.Y, X };
    },

    // donut(cx, cy, r, data [{ label, v, key 'ch1'|'ch2'|'ch3' }], o { labels { x, y, gap 42 }, p, alpha }):
    // ring thickness .36·r, slices in data order from −90° clockwise, 2 px gaps (angle 2 / r), swept with
    // ease(seg(p, .1, .8)). Direct labels (the legend): row i centred on y + i·gap: a 20 px square in the
    // series colour, gap 12, then `${label} ${v} %` in mono 32 ink1 — never in the series colour.
    donut(cx, cy, r, data, o) {
      o = o || {};
      const p = o.p == null ? 1 : clamp01(o.p);
      const A = o.alpha == null ? 1 : o.alpha;
      const tot = data.reduce((s0, d) => s0 + d.v, 0) || 1;
      const sweep = Math.PI * 2 * ease(seg(p, 0.1, 0.8));
      const th = 0.36 * r, rm = r - th / 2, gap = 2 / r;
      const start = -Math.PI / 2;
      if (A > 0 && sweep > 0) {
        ctx.save();
        ctx.globalAlpha = A; ctx.lineWidth = th; ctx.lineCap = 'butt';
        let a0 = start;
        for (const d of data) {
          const span = (Math.PI * 2 * d.v) / tot;
          const s0 = a0 + gap / 2, s1 = Math.min(a0 + span - gap / 2, start + sweep);
          if (s1 > s0) { ctx.strokeStyle = P[d.key] || P.ch1; ctx.beginPath(); ctx.arc(cx, cy, rm, s0, s1); ctx.stroke(); }
          a0 += span;
        }
        ctx.restore();
      }
      if (o.labels) {
        const L = o.labels, g = L.gap || 42;
        for (let i = 0; i < data.length; i++) {
          const al = A * ease(seg(p, 0.45 + 0.08 * i, 0.75 + 0.08 * i));
          if (al <= 0) continue;
          const ly = L.y + i * g;
          ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = P[data[i].key] || P.ch1;
          rr(L.x, ly - 10, 20, 20, 3); ctx.fill(); ctx.restore();
          text('mono', `${data[i].label} ${data[i].v} %`, L.x + 32, ly + 11.2, 32, 500, ink('ink1'), al, 'left', 0);
        }
      }
    },
  };
  return K;
}

// ---- the wrapper every face goes through --------------------------------------------------------
// Sets the 2048 × 1280 logical transform, clears, lays the glass tint, normalises inputs, and hands
// the face a cached kit instance (whatever `kit` the caller passed is ignored). Day never animates:
// it gets time 0 and the reduced beat (STILL pose, n 0, since 99).
// Face opts: { progress, time, theme, kit, reduced, beat, lod }. lod (FIX-PLAN-R3 §0.3.1) is re-read on
// EVERY draw (a missing o.lod = false) and set on the kit, so one reused options object cannot leak it.
// After every draw the wrapped face carries .stats = { items, arrows, maxY } (FIX-PLAN-R1 F8):
// non-extra top-level cards, visible arrows, and the lowest logical y of any counted card or window
// (windows include their 34 px shadow reach; K.cached layers re-add their stats on every blit).
// wrapped.busy(beat, reduced) exists only when the face exports busy() (FIX-PLAN-R4 contract 0.5.3).
const KITS = new WeakMap();
export function wrapFace(face) {
  const wrapped = {
    id: face.id, index: face.index, title: face.title, live: !!face.live,
    stats: { items: 0, arrows: 0, maxY: 0 },
    // FIX-PLAN-R4 contract 0.5.3: forwarded only when the face exports busy(beat, reduced). Reduced is never
    // busy (a still wall); no beat = busy (redraw rather than freeze). Absent = stage.js keeps 20 fps live.
    busy: typeof face.busy === 'function' ? (beat, reduced) => (reduced ? false : (beat ? !!face.busy(beat, false) : true)) : undefined,
    draw(ctx, W, H, o) {
      o = o || {};
      const theme = o.theme === 'day' ? 'day' : 'night';
      let c = KITS.get(ctx);
      if (!c || c.theme !== theme) {
        c = { theme, opts: { progress: 1, time: 0, theme, kit: kit(ctx, LW, LH, theme) } };
        KITS.set(ctx, c);
      }
      c.opts.progress = clamp01(o.progress == null ? 1 : o.progress);
      c.opts.time = theme === 'day' ? 0 : (o.time || 0);
      c.opts.reduced = theme === 'day' || !!o.reduced;
      c.opts.lod = !!o.lod;
      c.opts.kit._setLod(c.opts.lod);
      // The floor's event clock (REWORK-01-DIRECTOR §6.2). The stage passes cast.beat(i, t); anything
      // that does not (harness, day canvases, a stage without a cast) gets the same numbers from beatAt.
      c.opts.beat = (theme !== 'day' && o.beat) || beatAt((face.index || 1) - 1, c.opts.time, c.opts.reduced);
      const st = c.opts.kit._stats;
      st.items = 0; st.arrows = 0; st.maxY = 0; st.base = (H || LH) / LH;
      ctx.save();
      ctx.setTransform((W || LW) / LW, 0, 0, (H || LH) / LH, 0, 0);
      ctx.clearRect(0, 0, LW, LH);
      c.opts.kit.clear();
      try { face.draw(ctx, LW, LH, c.opts); } finally {
        ctx.restore();
        wrapped.stats.items = st.items; wrapped.stats.arrows = st.arrows; wrapped.stats.maxY = Math.round(st.maxY);
      }
    },
  };
  return wrapped;
}
