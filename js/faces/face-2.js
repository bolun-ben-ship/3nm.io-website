// LENS face 2 — 02 OPERATIONAL DATA: a desk of spreadsheets and finance. FIX-PLAN-R4 F2 (binding), after
// REWORK-02-CLIENT §2 ("a little notes, but more excel files, invoice tables, graphs and charts").
//
// Five overlapping app windows on the glass, offset and shadowed like a real desktop, never over a number or a
// title. Draw order (back to front): the order sheet, the donut, Priya's sticky note, the revenue chart, the
// invoice (it sits over the chart's empty lower edge). Every sheet total is qty × price; the invoice lines are
// sheet rows 1–4: S$765.00 + GST 9 % S$68.85 = S$833.85. The one ramp hue on this wall is the 20 px data marker
// in the sheet's title bar ('1,204 records · 4 connectors', contract 0.5.4). Charts: one axis, bars from zero,
// the single series is ch1 and named by its title; the donut is ch1 / ch2 / ch3 in fixed order with ink labels.
//
// Live (beat, wall 02: EVENTS pin 5.1 / 10.3, SCENE_T 12, STILL 3.3):
//   before 5.1  row 8's Total is empty, with the selection on it
//   pin 5.1     'S$64.00' is typed into it over .5 s (edit mode: left-aligned with a caret), then commits right
//   pin 10.3    the invoice status cross-fades 'Draft' -> 'Sent' with a filled state square and a check (.4 s)
//   wrap        tl 0–0.4: row 8's total fades out and the chip returns to 'Draft'
// Still / day / reduced (tl 3.3): the pre-state. The static desk is painted once into k.cached(); only the typed
// cell and the status chip redraw live. No colour literal in this file: every colour is k.P.
import { EVENTS, STILL } from './beat.js';

const WALL = 1;
const T_TYPE = EVENTS[WALL][0][0];     // 5.1
const T_SENT = EVENTS[WALL][1][0];     // 10.3
const TYPE_DUR = 0.5;
const WRAP = 0.4;

const H = (name) => ({ kind: 'human', name });
const A = (name) => ({ kind: 'agent', name });

// ---- 1. the order sheet -----------------------------------------------------------------------------------
const SHEET = { x: 96, y: 96, w: 1004, h: 560, inset: 12 };
// widths sum 916 + the 64 row-number gutter = 980 = the content width inside the 12 px inset
const COLS = [
  { w: 178, head: 'SKU', align: 'left', font: 'mono' },
  { w: 318, head: 'Item', align: 'left', font: 'body' },
  { w: 96, head: 'Qty', align: 'right', font: 'mono' },
  { w: 130, head: 'Price', align: 'right', font: 'mono' },
  { w: 194, head: 'Total', align: 'right', font: 'mono' },
];
const ROWS = [
  ['TF-1042', 'Bok choy 5 kg', '40', '6.20', 'S$248.00'],
  ['TF-1107', 'Cherry tomatoes', '30', '8.50', 'S$255.00'],
  ['TF-1210', 'Eggs, tray of 30', '20', '9.80', 'S$196.00'],
  ['TF-1033', 'Herb mix', '15', '4.40', 'S$66.00'],
  ['TF-1561', 'Kai lan 5 kg', '25', '7.10', 'S$177.50'],
  ['TF-1388', 'Red onions 10 kg', '12', '11.60', 'S$139.20'],
  ['TF-1402', 'Lemons, box', '8', '18.90', 'S$151.20'],
  ['TF-1295', 'Coriander', '20', '3.20', ''],        // row 8's total is typed live: TYPED
];
const SEL = { r: 7, c: 4 };
const TYPED = 'S$64.00';               // 20 × 3.20
const CELL_PAD = 14;
const GRID_GEO = { letters: 44, gutter: 64, head: 48, row: 48 };   // the kit grid's documented strip sizes

// ---- 2. the donut -----------------------------------------------------------------------------------------
const DONUT_WIN = { x: 96, y: 676, w: 600, h: 186 };
const DONUT = [
  { label: 'Hotels', v: 46, key: 'ch1' },
  { label: 'Restaurants', v: 34, key: 'ch2' },
  { label: 'Hawkers', v: 20, key: 'ch3' },
];
const DONUT_R = 54;

// ---- 3. Priya's sticky note (paper: it IS paper) ----------------------------------------------------------
// w 420, not the plan's 330: at 330 the sentence runs to 3 lines and the Priya + accounts pair overruns the paper.
// It still clears the invoice (x 1180). Height is fixed so the tilted note + its shadow end at y <= 896.
const STICKY = { x: 730, y: 684, w: 420, h: 178, rot: -2, pad: 20, size: 36 };
const STICKY_TEXT = 'GST on Hilton is 9 %, not 8. — Priya';
const STICKY_CREDIT = [H('Priya'), A('accounts')];

// ---- 4. the revenue chart ---------------------------------------------------------------------------------
const CHART_WIN = { x: 1140, y: 96, w: 812, h: 340 };
const BARS = [
  { label: 'W34', v: 38.9 }, { label: 'W35', v: 40.3 }, { label: 'W36', v: 41.2 },
  { label: 'W37', v: 42.0 }, { label: 'W38', v: 43.1 }, { label: 'W39', v: 44.6 },
];
const fmtK = (v) => (Math.round(v * 10) % 10 ? v.toFixed(1) : String(Math.round(v)));

// ---- 5. the invoice ---------------------------------------------------------------------------------------
const INV_WIN = { x: 1180, y: 400, w: 772, h: 462 };
const INV_LINES = [
  ['Bok choy 5 kg', '40', '248.00'],
  ['Cherry tomatoes', '30', '255.00'],
  ['Eggs, tray of 30', '20', '196.00'],
  ['Herb mix', '15', '66.00'],
];
// baselines inside the window (content top = y + 56 = 456); the last baseline stays <= 850
const INV = { padX: 28, title: 498, chipY: 486, head: 548, headRule: 562, line0: 598, pitch: 40, rule: 738, sub: 772, gst: 810, total: 848, qtyX: 1640, labelX: 1560 };

// Row 8's Total cell in canvas space: the grid's own cell() when the desk was painted, else the documented geometry.
let CELL = null;
function cellRect() {
  if (CELL) return CELL;
  let x = SHEET.x + SHEET.inset + GRID_GEO.gutter;
  for (let c = 0; c < SEL.c; c++) x += COLS[c].w;
  const y = SHEET.y + 56 + SHEET.inset + GRID_GEO.letters + GRID_GEO.head + SEL.r * GRID_GEO.row;
  return { x, y, w: COLS[SEL.c].w, h: GRID_GEO.row };
}

// The static desk, back to front. K is the kit the cache hands in (the offscreen layer's kit at p >= 1).
function desk(K, p) {
  const P = K.P;
  const seg = K.seg;

  // 1. sheet
  const s = K.window(SHEET.x, SHEET.y, SHEET.w, SHEET.h, {
    title: 'Orders · Week 40', titleAlign: 'left', meta: '1,204 records · 4 connectors', metaMark: 'data',
    p: seg(p, 0, 0.45),
  });
  const g = K.grid(s.x + SHEET.inset, s.y + SHEET.inset, COLS, ROWS, {
    letters: true, nums: true, rowH: 48, headH: 48, pad: CELL_PAD,
    sel: SEL, skip: (r, c) => r === SEL.r && c === SEL.c, alpha: s.a, p: seg(p, 0.08, 0.6),
  });
  if (g && g.cell) CELL = g.cell(SEL.r, SEL.c);

  // 2. donut
  const d = K.window(DONUT_WIN.x, DONUT_WIN.y, DONUT_WIN.w, DONUT_WIN.h, { title: 'Orders by customer type', p: seg(p, 0.14, 0.58) });
  const dcx = d.x + 40 + DONUT_R, dcy = d.y + d.h / 2;
  K.chart.donut(dcx, dcy, DONUT_R, DONUT, { labels: { x: dcx + DONUT_R + 44, y: dcy - 40, gap: 40 }, p: seg(p, 0.24, 0.78), alpha: d.a });

  // 3. Priya's sticky note: sentence at 36 (the card's own sentence floors at 52) and its co-sign drawn here, with
  // the names in Geist (the kit's small mono pair runs 'Priya + accounts' off a 420 px note)
  K.card(STICKY.x, STICKY.y, STICKY.w, STICKY.h, {
    p: seg(p, 0.3, 0.72), seed: 'f2-gst', rot: STICKY.rot, pin: false, pad: STICKY.pad,
    draw(K2, w, h, al) {
      K2.sentence(STICKY_TEXT, STICKY.pad, STICKY.pad + Math.round(STICKY.size * 0.92), { size: STICKY.size, maxW: w - STICKY.pad * 2, monoNums: true, alpha: al });
      const cy = h - STICKY.pad - 22, ca = al * K2.ease(seg(p, 0.45, 0.9));
      if (ca <= 0) return;
      let x = STICKY.pad + 22;
      for (const who of STICKY_CREDIT) { K2.avatar(who.kind, who.name, x, cy, 44, { alpha: ca }); x += 52; }
      K2.body(STICKY_CREDIT.map((c) => c.name).join(' + '), x - 22 + 12, cy + 11, { size: 32, alpha: ca, maxW: 400 });
    },
  });

  // 4. revenue chart: plot box ends at y 392, above the invoice's overlap (400–436)
  const c = K.window(CHART_WIN.x, CHART_WIN.y, CHART_WIN.w, CHART_WIN.h, { title: 'Weekly revenue · S$k', p: seg(p, 0.2, 0.62) });
  K.chart.bar(c.x + 24, c.y + 12, c.w - 48, 228, BARS, { max: 60, ticks: [0, 20, 40, 60], fmt: fmtK, labelLast: true, p: seg(p, 0.32, 0.9), alpha: c.a });

  // 5. invoice (on top of the chart)
  const v = K.window(INV_WIN.x, INV_WIN.y, INV_WIN.w, INV_WIN.h, { title: 'INV-2291', p: seg(p, 0.36, 0.84) });
  const a = v.a;
  if (a > 0) {
    const L = v.x + INV.padX, R = v.x + v.w - INV.padX;
    K.sans('Hilton Orchard · 30 Sep 2026', L, INV.title, { size: 36, weight: 600, color: P.ink1, alpha: a });
    K.mono('Item', L, INV.head, { size: 32, color: P.ink3, alpha: a });
    K.mono('Qty', INV.qtyX, INV.head, { size: 32, color: P.ink3, align: 'right', alpha: a });
    K.mono('Amount', R, INV.head, { size: 32, color: P.ink3, align: 'right', alpha: a });
    K.hair(L, INV.headRule, R, INV.headRule, { color: P.chGrid, w: 2, alpha: a });
    for (let i = 0; i < INV_LINES.length; i++) {
      const [item, qty, amt] = INV_LINES[i];
      const y = INV.line0 + i * INV.pitch;
      K.body(item, L, y, { size: 32, color: P.ink1, alpha: a, maxW: 600 });
      K.mono(qty, INV.qtyX, y, { size: 32, color: P.ink1, align: 'right', alpha: a });
      K.mono(amt, R, y, { size: 32, color: P.ink1, align: 'right', alpha: a });
    }
    K.hair(L, INV.rule, R, INV.rule, { color: P.chGrid, w: 2, alpha: a });
    K.body('Subtotal', INV.labelX, INV.sub, { size: 32, color: P.ink2, alpha: a });
    K.mono('S$765.00', R, INV.sub, { size: 32, color: P.ink1, align: 'right', alpha: a });
    K.body('GST 9 %', INV.labelX, INV.gst, { size: 32, color: P.ink2, alpha: a });
    K.mono('S$68.85', R, INV.gst, { size: 32, color: P.ink1, align: 'right', alpha: a });
    K.sans('Total', INV.labelX, INV.total, { size: 36, weight: 600, color: P.ink1, alpha: a });
    K.sans('S$833.85', R, INV.total, { size: 36, weight: 600, color: P.ink1, align: 'right', alpha: a });
  }
}

// Live state at scene time tl (pure). still = reduced / day / no beat: the STILL pre-state.
function liveState(k, beat, still) {
  const tl = still || !beat ? STILL[WALL] : beat.tl;
  const wrapOn = !still && !!beat && beat.n >= EVENTS[WALL].length && tl < WRAP;
  let chars = 0, committed = false, totalA = 1, sent = 0;
  if (tl >= T_TYPE) {
    const s = tl - T_TYPE;
    committed = s >= TYPE_DUR;
    chars = committed ? TYPED.length : Math.min(TYPED.length, Math.floor((s / TYPE_DUR) * TYPED.length) + 1);
  }
  if (tl >= T_SENT) sent = k.settle(tl - T_SENT, 0.4);
  if (wrapOn) {            // the end of the last loop, fading back to the pre-state
    const w = k.ease(tl / WRAP);
    chars = TYPED.length; committed = true; totalA = 1 - w; sent = 1 - w;
  }
  return { chars, committed, totalA, sent };
}

export default {
  id: 'data', index: 2, title: 'Operational data', live: true,
  busy(beat, reduced) { return !reduced && !!beat && (beat.since < 1.2 || beat.tl < 0.45); },
  draw(ctx, W, Hh, { progress: p, kit: k, reduced, beat, lod }) {
    if (p <= 0) return;
    const P = k.P;
    const still = !!reduced || !beat;
    k.cached(lod ? 'f2-desk-lod' : 'f2-desk', p, (K) => desk(K, p));

    const S = liveState(k, beat, still);

    // row 8's Total: typed in edit mode (left, caret), then committed right-aligned like its neighbours
    const sheetA = k.ease(k.seg(p, 0.08, 0.6));
    if (S.chars > 0 && S.totalA > 0 && sheetA > 0) {
      const c = cellRect();
      const base = c.y + c.h / 2 + 11.2;   // the grid's own cell baseline
      const a = S.totalA * sheetA;
      if (S.committed) {
        k.mono(TYPED, c.x + c.w - CELL_PAD, base, { size: 32, weight: 400, color: P.ink2, align: 'right', alpha: a });   // as its neighbours
      } else {
        const tw = k.mono(TYPED.slice(0, S.chars), c.x + CELL_PAD, base, { size: 32, color: P.ink1, alpha: a });
        k.rect(c.x + CELL_PAD + tw + 3, c.y + 8, 3, c.h - 16, { r: 1, fill: P.green, alpha: a });
      }
    }

    // the invoice status: Draft (plain) -> Sent (sel, with a filled state square and a check)
    const invA = k.ease(k.seg(p, 0.36, 0.84));
    if (invA > 0) {
      const R = INV_WIN.x + INV_WIN.w - INV.padX;
      if (S.sent < 1) k.chip(R, INV.chipY, 'Draft', { tone: 'plain', align: 'right', alpha: invA * (1 - S.sent) });
      if (S.sent > 0) {
        const cw = k.chip(R, INV.chipY, 'Sent', { tone: 'sel', align: 'right', alpha: invA * S.sent });
        k.stateSq(R - cw - 12 - 14, INV.chipY, 'done', { size: 28, check: true, alpha: invA * S.sent });
      }
    }
  },
};
