// LENS face 6 — 06 ADMIN PANEL: Lim's dashboard. FIX-PLAN-R4 F6 over REWORK-02-CLIENT §2 (binding).
// One app window in the family (F0): four KPI tiles, revenue by day (area), jobs by week (bars), the
// "Needs your decision" table (3 rows, each an agent + a person bringing Lim one call) and the agent strip
// ("30 agents working"). The numbers equal the copy facts (contract 0.5.4): S$184,200 ▲ 12 %, 1,146 jobs,
// 4 min, 186 hours, 3 decisions, 30 agents working. The ▲ is brand green, never the accent.
//
// THE DECISION SQUARE (row 1) is the ONLY use of P.accent on any face (the accent token at night).
// Live (REWORK-01-DIRECTOR §6.2, wall 06 events: 5.9 decide · 12.5 propose), idx = floor(n / 2):
//   decide  → row 1's pending square (empty, 3 px ink2, scale .95) fills with P.accent over settle(since),
//             scale .95 → 1 (never from 0), and a ✓ in P.onAccent completes inside it (k.checkP).
//   propose → the decided row slides off to the right (0–.35 s, its square fading out in 0–.2 s), then the
//             queue moves up one row (.2–.6 s) and the next ITEMS entry lands pending in row 1 while a new
//             entry fades into row 3: only one accent-filled square is ever on screen.
// Day, reduced and still: tl 6.2 → 'decide', n 0 → the Hilton Orchard price, filled, with its ✓.
// Static chrome, tiles, charts and the agent strip paint once through k.cached. Colour only from k.P.
import { hash } from './kit.js';

// ---- the decisions that reach Lim, in queue order: one sentence, an agent + a person -------------------
const ITEMS = [
  { s: 'Approve the new Hilton Orchard price.', agent: 'pricing', human: 'Marcus' },
  { s: 'Sign off September payroll.', agent: 'payroll', human: 'Priya' },
  { s: 'New supplier: Cameron Farms.', agent: 'buyer', human: 'Marcus' },
  { s: 'Set October prices for the hawker association.', agent: 'pricing', human: 'Marcus' },
  { s: 'Hire a second driver for Tuesdays and Fridays.', agent: 'dispatch', human: 'Priya' },
  { s: 'Refund Swee Lee Kitchen for a late order.', agent: 'accounts', human: 'Priya' },
];
const item = (i) => ITEMS[((i % ITEMS.length) + ITEMS.length) % ITEMS.length];

// ---- revenue by day, September 2026 (1 Sep = Tuesday): sums to exactly 184,200 ------------------------
const REV_TOTAL = 184200;
const REV = (() => {
  const raw = [];
  for (let d = 1; d <= 30; d++) {
    const wd = new Date(2026, 8, d).getDay();
    const base = wd === 6 ? 5200 : wd === 0 ? 3900 : 6600;
    raw.push(base * (1 + 0.06 * (hash('rev' + d) - 0.5)));
  }
  const sum = raw.reduce((s, v) => s + v, 0);
  const out = raw.map((v) => Math.round(v * REV_TOTAL / sum));
  out[29] += REV_TOTAL - out.reduce((s, v) => s + v, 0);
  return out;
})();
const JOBS = [{ label: 'W36', v: 268 }, { label: 'W37', v: 279 }, { label: 'W38', v: 290 }, { label: 'W39', v: 309 }];

// ---- layout (logical 2048 × 1280) ---------------------------------------------------------------------
const WIN = { x: 96, y: 80, w: 1856, h: 782 };                 // bottom 862
const TILE = { y: 152, w: 434, h: 164, xs: [120, 578, 1036, 1494] };
const TILES = [
  { label: 'REVENUE MTD', value: 'S$184,200', up: true, sub: '12 % vs August' },
  { label: 'JOBS DONE', value: '1,146', sub: 'this month' },
  { label: 'AVG RESPONSE', value: '4 min' },
  { label: 'HOURS RETURNED', value: '186', sub: 'this week' },
];
const AREA = { x: 120, y: 336, w: 920, h: 296 };
const BARS = { x: 1064, y: 336, w: 864, h: 296 };
const TABLE = { x: 120, x1: 1300, head: 684, row0: 700, rowH: 50, sqX: 148, textX: 184, textRight: 1180, pairRight: 1284 };
const SQ = 36;                                                    // the decision square, 36 × 36, r 6
const STRIP = { x: 1324, y: 652, w: 604, h: 200, pitch: 54, rows: [732, 780, 828], s: 36 };
// Chart box top inside its panel: 80 (not 60) so the top tick label clears the panel title's descenders.
const CHART_TOP = 80;
const kfmt = (v) => (v === 0 ? '0' : v / 1000 + 'k');

function panel(K, b, title, a) {
  K.rect(b.x, b.y, b.w, b.h, { fill: K.P.winBar, stroke: K.P.winLine, w: 1, r: 16, alpha: a });
  K.sans(title, b.x + 24, b.y + 42, { size: 32, weight: 600, color: K.P.ink2, alpha: a });
}

function paintStatic(K, p) {
  const P = K.P;
  const win = K.window(WIN.x, WIN.y, WIN.w, WIN.h, { title: 'Admin · Tanjong Fresh', chips: [{ text: 'Week 40', tone: 'plain' }], p });
  const a = win.a;
  if (a <= 0) return a;

  // ---- KPI tiles: flat winBar + 1 px winLine, no rail, no gradient ------------------------------------
  for (let i = 0; i < TILES.length; i++) {
    const t = TILES[i], x = TILE.xs[i], y = TILE.y, ta = a * K.stag(p, i, 0.2);
    if (ta <= 0) continue;
    K.rect(x, y, TILE.w, TILE.h, { fill: P.winBar, stroke: P.winLine, w: 1, r: 16, alpha: ta });
    K.mono(t.label, x + 24, y + 46, { size: 32, color: P.ink3, alpha: ta });
    K.sans(t.value, x + 24, y + 110, { size: 64, weight: 600, color: P.ink1, alpha: ta });
    if (t.sub) {
      let sx = x + 24;
      if (t.up) { K.glyph('up', sx + 12, y + 141, { size: 30, color: P.green, alpha: ta }); sx += 36; }
      K.mono(t.sub, sx, y + 152, { size: 32, color: P.ink2, alpha: ta });
    }
  }

  // ---- revenue by day (area) and jobs by week (bars): one axis, from zero, ch1 ----------------------------
  const ca = a * K.stag(p, 4, 0.3);
  if (ca > 0) {
    panel(K, AREA, 'Revenue by day · September · S$', ca);
    K.chart.area(AREA.x + 16, AREA.y + CHART_TOP, AREA.w - 32, AREA.h - CHART_TOP - 12, REV, {
      max: 8000, ticks: [0, 4000, 8000], fmt: kfmt, p, alpha: ca,
      xLabels: [{ i: 0, text: '1' }, { i: 7, text: '8' }, { i: 14, text: '15' }, { i: 21, text: '22' }, { i: 28, text: '29' }],
    });
  }
  const ba = a * K.stag(p, 5, 0.3);
  if (ba > 0) {
    panel(K, BARS, 'Jobs by week', ba);
    K.chart.bar(BARS.x + 16, BARS.y + CHART_TOP, BARS.w - 32, BARS.h - CHART_TOP - 12, JOBS, {
      max: 400, ticks: [0, 200, 400], fmt: (v) => String(v), labelLast: true, p, alpha: ba,
    });
  }

  // ---- Needs your decision: heading + count + row hairlines (the rows themselves are live) --------------
  const da = a * K.stag(p, 6, 0.3);
  K.sans('Needs your decision', TABLE.x, TABLE.head, { size: 36, weight: 600, color: P.ink1, alpha: da });
  K.mono('3', TABLE.x1, TABLE.head, { size: 32, color: P.ink3, align: 'right', alpha: da });
  for (let r = 0; r <= 3; r++) {
    const y = TABLE.row0 + r * TABLE.rowH;
    K.hair(TABLE.x, y, TABLE.x1, y, { color: P.chGrid, w: 1, alpha: da });
  }

  // ---- the agent strip: 30 agents working ----------------------------------------------------------------
  const sa = a * K.stag(p, 7, 0.3);
  if (sa > 0) {
    K.rect(STRIP.x, STRIP.y, STRIP.w, STRIP.h, { fill: P.winBar, stroke: P.winLine, w: 1, r: 16, alpha: sa });
    K.mono('30 agents working', STRIP.x + 24, 690, { size: 32, color: P.ink2, alpha: sa });
    const x0 = STRIP.x + STRIP.w / 2 - STRIP.pitch * 4.5;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) {
      K.avatar('agent', 'agent', x0 + c * STRIP.pitch, STRIP.rows[r], STRIP.s, { alpha: sa * K.stag(p, r * 10 + c, 0.45, 0.012, 0.12) });
    }
  }
  return a;
}

// One table row: the decision square, the sentence, the pair (agent s 36 + human s 44) ending x 1284.
// Square grammar: pending (fill 0) = empty 3 px ink2 square at scale .95; decided (fill → 1) = P.accent fill,
// scale .95 → 1, the ✓ in P.onAccent. Only row 1 of the queue is ever passed fill > 0.
function drawRow(k, it, cy, o) {
  const P = k.P, a = o.alpha;
  if (a <= 0) return;
  const dx = o.dx || 0;
  const sa = a * (o.sqA == null ? 1 : o.sqA);
  if (sa > 0) {
    const f = o.fill || 0, s = SQ * (0.95 + 0.05 * f), x = TABLE.sqX + dx;
    if (f > 0) k.rect(x - s / 2, cy - s / 2, s, s, { fill: P.accent, r: 6, alpha: sa * f });
    if (f < 1) k.rect(x - s / 2, cy - s / 2, s, s, { stroke: P.ink2, w: 3, r: 6, alpha: sa * 0.95 * (1 - f) });
    if (o.chk > 0) k.glyph('check', x, cy + 1, { size: 36, w: 4.5, color: P.onAccent, p: o.chk, alpha: sa });
  }
  k.clip(TABLE.textX - 4 + dx, cy - 25, TABLE.textRight - TABLE.textX + 4, 50, () => {
    k.body(it.s, TABLE.textX + dx, cy + 12, { size: 34, color: P.ink1, maxW: 2000, alpha: a });
  });
  const hx = TABLE.pairRight - 22 + dx, ax = hx - 22 - 8 - 18;
  k.avatar('agent', it.agent, ax, cy, 36, { alpha: a });
  k.avatar('human', it.human, hx, cy, 44, { alpha: a });
}

export default {
  id: 'admin', index: 6, title: 'Admin panel',
  live: true,
  busy(beat, reduced) {
    return !reduced && !!beat && (beat.since < 1.2 || beat.tl < 0.45);
  },
  draw(ctx, W, H, { progress: p, kit: k, beat, reduced }) {
    if (p <= 0) return;
    let wa = 1;
    k.cached('f6' + (k.lod ? '-lod' : ''), p, (K) => { wa = paintStatic(K, p); });
    if (wa <= 0) return;

    const bt = beat || { n: 0, since: 99, kind: 'decide' };
    const still = !!reduced || bt.since >= 99;
    const idx = Math.floor(bt.n / 2);
    const ra = wa * k.ease(k.seg(p, 0.35, 0.75));             // the rows build after the table head
    if (ra <= 0) return;
    const sqB = k.ease(k.seg(p, 0.6, 0.8));                     // the squares land last
    const chkB = k.seg(p, 0.75, 0.9);
    const cyOf = (r) => TABLE.row0 + TABLE.rowH * r + TABLE.rowH / 2;

    if (bt.kind === 'decide') {
      const u = still ? 1 : k.settle(bt.since);
      drawRow(k, item(idx), cyOf(0), { alpha: ra, fill: u * sqB, chk: chkB * k.checkP(bt.since, still), sqA: sqB });
      drawRow(k, item(idx + 1), cyOf(1), { alpha: ra, sqA: sqB });
      drawRow(k, item(idx + 2), cyOf(2), { alpha: ra, sqA: sqB });
      return;
    }
    // propose: the decided row leaves, the queue moves up, the next entry lands pending in row 1.
    const off = still ? 1 : k.settle(bt.since, 0.35);
    const on = still ? 1 : k.settle(bt.since - 0.2, 0.4);
    const lift = TABLE.rowH * (1 - on);
    k.clip(TABLE.x, TABLE.row0 + 1, TABLE.x1 - TABLE.x, TABLE.rowH * 3 - 1, () => {
      if (off < 1) {
        const fade = 1 - k.seg(bt.since, 0.05, 0.3);
        drawRow(k, item(idx - 1), cyOf(0), { alpha: ra * fade, dx: 190 * off, fill: sqB, chk: 1, sqA: sqB * (1 - k.seg(bt.since, 0, 0.2)) });
      }
      drawRow(k, item(idx), cyOf(0) + lift, { alpha: ra, sqA: sqB });
      drawRow(k, item(idx + 1), cyOf(1) + lift, { alpha: ra, sqA: sqB });
      drawRow(k, item(idx + 2), cyOf(2) + lift, { alpha: ra * on, sqA: sqB });
    });
  },
};
