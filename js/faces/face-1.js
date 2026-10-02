// LENS face 1 — 01 CONTEXT: Apple Notes on glass. FIX-PLAN-R4 F1 over REWORK-02-CLIENT §2 (binding).
// A two-pane notes app in the app family (F0): the folder list on the left (Why we exist selected), the open
// note on the right — grey date line, big bold title, body, a checklist, a short bulleted list — typed the
// way a person writes. Brand green replaces Notes yellow: the checkbox fills, the selection tint, the folder.
//
// Live (beat, wall 01: EVENTS hand 6.3 / 13.3, write spans tl 0.3–2.8 and 7.3–9.8, SCENE_T 14, STILL 5.9):
//   span 1  a 3 px caret types '• Lunch orders close at 10.' one character at a time as the third bullet;
//   span 2  the caret sits at the end of that line and blinks (.5 s on / .5 s off): Lim re-reading;
//   hand 6.3   the open checkbox fills and ticks over .4 s;
//   hand 13.3  the footer gains the courier agent after the librarian (.95 → 1 with alpha over .4 s);
//   wrap    tl 0–0.3: the typed line, the tick and the courier fade out, then the loop starts clean.
// Day, reduced and still (tl 5.9): the line typed, no caret, box 3 open, no courier.
// All static chrome paints once through k.cached; only the live bits redraw. Colour only from k.P.
import { STILL } from './beat.js';

// ---- layout (logical 2048 × 1280) ---------------------------------------------------------------------
const WIN = { x: 96, y: 80, w: 1856, h: 782 };                 // bottom 862
const SIDE = { x: 96, x1: 640, rowX: 112, rowW: 512, textX: 136, clipW: 470 };
const ROW0 = 264, ROW_H = 108;
const PANE = { x: 720, cx: 1300, maxW: 1150 };
const BODY = 38, BODY_LH = 52;
const CHECK = { x: 740, textX: 776, ys: [446, 504, 562] };
const BUL = { ys: [636, 690], live: 744 };
const FOOT = { y: 810, x: 742 };

const NOTES = [
  { t: 'Why we exist', d: '12 Sep', pv: 'My father ran…' },
  { t: 'Strategy 2026', d: '09 Sep', pv: 'Hotels first' },
  { t: 'Who owns what', d: '02 Sep', pv: 'Lim, Priya…' },
  { t: 'Brand & tone', d: '28 Aug', pv: 'Plain words' },
  { t: 'Pricing rules', d: '21 Aug', pv: 'Hawker rate' },
];
const CHECKS = [
  ['Fresh produce to every kitchen in Singapore by 6 a.m.', true],
  ['Win the hotel groups; keep the hawkers.', true],
  ['Price rules signed off by Marcus.', false],
];
const BULLETS = ['• Lim runs finance, Priya ops, Marcus sales.', '• Plain words. No jargon.'];
const TYPED = '• Lunch orders close at 10.';
const FACTS = '212 pages · written by 3 people · read by 30 agents';

const WRITE_A = [0.3, 2.8], WRITE_B = [7.3, 9.8];
const HAND_A = 6.3, HAND_B = 13.3, WRAP = 0.3;

// Footer marks: Lim (s 44), librarian (s 40), then the courier's slot (s 40), then the facts line.
const F_LIM = FOOT.x, F_LIB = F_LIM + 22 + 10 + 20, F_COU = F_LIB + 20 + 8 + 20, F_TEXT = F_COU + 20 + 24;

// The static wall: window, folder list, the note (all but the live third bullet), footer.
function paintStatic(K, p) {
  const P = K.P;
  const win = K.window(WIN.x, WIN.y, WIN.w, WIN.h, { title: 'Notes', p });
  const a = win.a;
  if (a <= 0) return a;
  const cy = win.y, ch = win.h;                              // content rect under the title bar

  // ---- sidebar: flat winBar, bottom-left corner r 22 (the other corners clipped square) -----------------
  K.clip(SIDE.x, cy, SIDE.x1 - SIDE.x, ch, () => {
    K.rect(SIDE.x, cy - 40, SIDE.x1 - SIDE.x + 40, ch + 40, { fill: P.winBar, r: 22, alpha: a });
  });
  K.hair(SIDE.x1, cy, SIDE.x1, cy + ch, { color: P.winLine, w: 1.5, alpha: a });

  const sa = a * K.stag(p, 0, 0.2);
  K.rect(120, 152, 496, 52, { stroke: P.winLine, w: 1.5, r: 26, alpha: sa });
  K.body('Search', 150, 189, { size: 32, color: P.ink3, alpha: sa, maxW: 400 });
  // folder glyph (28 px, outlined, brand green) + the account label
  K.path([[121, 242], [121, 221], [131, 221], [135, 225], [148, 225], [148, 242], [121, 242]],
    { color: P.green, w: 2.5, alpha: sa, join: 'round' });
  K.mono('TANJONG FRESH', 164, 244, { size: 32, color: P.ink3, alpha: sa });

  for (let i = 0; i < NOTES.length; i++) {
    const n = NOTES[i], top = ROW0 + i * ROW_H, ra = a * K.stag(p, i + 1, 0.22);
    if (ra <= 0) continue;
    if (i === 0) K.rect(SIDE.rowX, top + 4, SIDE.rowW, 100, { fill: P.sel, r: 14, alpha: ra });
    K.sans(n.t, SIDE.textX, top + 44, { size: 34, weight: 600, color: P.ink1, alpha: ra });
    K.clip(SIDE.textX, top + 52, SIDE.clipW, 48, () => {
      const dw = K.mono(n.d, SIDE.textX, top + 86, { size: 32, color: P.ink2, alpha: ra });
      K.mono(n.pv, SIDE.textX + dw + 20, top + 86, { size: 32, color: P.ink3, alpha: ra });
    });
    // hairline between rows, never against the selection
    if (i >= 1 && i < NOTES.length - 1) K.hair(SIDE.textX, top + ROW_H, SIDE.x1 - 24, top + ROW_H, { color: P.chGrid, w: 1, alpha: ra });
  }

  // ---- the note ---------------------------------------------------------------------------------------
  const na = (i) => a * K.stag(p, i, 0.3, 0.04);
  K.body('12 September 2026 at 09:14', PANE.cx, 186, { size: 32, color: P.ink3, align: 'center', maxW: 1800, alpha: na(0) });
  K.sans('Why we exist', PANE.x, 262, { size: 72, weight: 600, color: P.ink1, alpha: na(1) });
  K.body('My father ran this from a notebook. I want it to run without me.', PANE.x, 320,
    { size: BODY, lh: BODY_LH / BODY, color: P.ink1, maxW: PANE.maxW, alpha: na(2) });
  for (let i = 0; i < CHECKS.length; i++) {
    const y = CHECK.ys[i], ca = na(3 + i);
    K.checkbox(CHECK.x, y - 13, CHECKS[i][1], { alpha: ca });
    K.body(CHECKS[i][0], CHECK.textX, y, { size: BODY, color: P.ink1, maxW: 1400, alpha: ca });
  }
  for (let i = 0; i < BULLETS.length; i++) {
    K.body(BULLETS[i], PANE.x, BUL.ys[i], { size: BODY, color: P.ink1, maxW: 1400, alpha: na(6 + i) });
  }

  // ---- footer: who wrote it, who reads it -----------------------------------------------------------
  const fa = na(9);
  K.hair(PANE.x, 772, 1880, 772, { color: P.chGrid, w: 1, alpha: fa });
  K.avatar('human', 'Lim', F_LIM, FOOT.y, 44, { alpha: fa });
  K.avatar('agent', 'librarian', F_LIB, FOOT.y, 40, { alpha: fa });
  K.mono(FACTS, F_TEXT, FOOT.y + 11, { size: 32, color: P.ink3, alpha: fa });
  return a;
}

export default {
  id: 'context', index: 1, title: 'Context',
  live: true,
  busy(beat, reduced) {
    return !reduced && !!beat && (beat.span != null || beat.since < 1.2 || beat.tl < 0.45);
  },
  draw(ctx, W, H, { progress: p, kit: k, reduced, beat }) {
    if (p <= 0) return;
    const P = k.P;
    let wa = 1;
    k.cached('f1' + (k.lod ? '-lod' : ''), p, (K) => { wa = paintStatic(K, p); });
    if (wa <= 0) return;

    const still = !!reduced || !beat;
    const tl = still ? STILL[0] : beat.tl;
    const live = wa * k.ease(k.seg(p, 0.7, 1));                // the live bits arrive with the note's end
    if (live <= 0) return;
    const wrapFade = tl < WRAP ? 1 - k.seg(tl, 0, WRAP) : 1;  // the previous loop's end state leaving

    // ---- the third bullet, typed by Lim ---------------------------------------------------------------
    let chars = TYPED.length, caret = false;
    if (!still && tl >= WRITE_A[0] && tl < WRITE_A[1]) {
      chars = Math.floor(k.seg(tl, WRITE_A[0], WRITE_A[1]) * TYPED.length);
      caret = true;
    } else if (!still && tl >= WRITE_B[0] && tl < WRITE_B[1]) {
      caret = Math.floor((tl - WRITE_B[0]) / 0.5) % 2 === 0;
    }
    const typed = TYPED.slice(0, chars);
    const ta = live * wrapFade;
    if (typed) k.body(typed, PANE.x, BUL.live, { size: BODY, color: P.ink1, maxW: 1400, alpha: ta });
    if (caret) {
      const cx = PANE.x + (typed ? k.measure(typed, 'body', BODY, 400) : 0) + 4;
      k.rect(cx, BUL.live - 36, 3, 46, { fill: P.ink1, r: 0, alpha: ta });
    }

    // ---- box 3 ticks on the hand at 6.3 (held to the loop end, fading at the wrap) ----------------------
    if (!still) {
      let tick = 0, tickA = 1;
      if (tl >= HAND_A) tick = k.settle(tl - HAND_A);
      else if (tl < WRAP) { tick = 1; tickA = wrapFade; }
      if (tick > 0) k.checkbox(CHECK.x, CHECK.ys[2] - 13, true, { p: tick, alpha: live * tickA });

      // ---- the courier joins the readers on the hand at 13.3 ------------------------------------------
      // (kit: fresh 0..1 = scale .95 → 1 with alpha over its own ease; at the wrap it simply fades)
      if (tl >= HAND_B) k.avatar('agent', 'courier', F_COU, FOOT.y, 40, { alpha: live, fresh: k.seg(tl - HAND_B, 0, 0.4) });
      else if (tl < WRAP) k.avatar('agent', 'courier', F_COU, FOOT.y, 40, { alpha: live * wrapFade });
    }
  },
};
