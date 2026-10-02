// LENS — kit sheet (Faces). Review only: faces-harness.html?kit=1. NOT in index.js, never shipped.
// FIX-PLAN-R4 F7: the visual test of every app-family primitive (F0.2) on one glass wall:
//   A  a spreadsheet window (meta + the data metaMark) with k.grid: a sel cell and a skipped cell the
//      caller fills with a count-up
//   B  a tasks window overlapping A, with title-bar chips: the crew (human avatars Lim / Priya / Marcus /
//      Nurul, agent avatars at 30 / 44 / 60 and 'ahead'), task rows with checkbox not-done / done, chips
//      plain / sel with avatars, stateSq done+check / live / ahead
//   C  chart.area (one series, named by its title)       D  chart.bar (one series, last value labelled)
//   E  chart.donut with direct labels                     +  one paper k.card sticky note, Priya + accounts
// Every window bottom is <= 862 (maxY with the 34 px shadow reach <= 896). The static layer goes through
// k.cached(); only the 'live' task's state square (its core breathes) draws live on top.

const ORDERS = [
  ['KL-05', 'Kale, 5 kg', '12', 'S$8.50', 'S$102.00'],
  ['BK-02', 'Bok choy, 2 kg', '20', 'S$4.20', 'S$84.00'],
  ['TM-10', 'Tomatoes, 10 kg', '6', 'S$18.90', 'S$113.40'],
  ['LM-03', 'Lemons, 3 kg', '15', 'S$6.30', 'S$94.50'],
  ['BS-01', 'Basil, 1 kg', '8', 'S$12.00', ''],
];
const COLS = [
  { w: 130, head: 'SKU' },
  { w: 262, head: 'Item', font: 'body' },
  { w: 90, head: 'Qty', align: 'right' },
  { w: 160, head: 'Price', align: 'right' },
  { w: 184, head: 'Total', align: 'right' },
];
const REV12 = [18.2, 19.6, 19.1, 21.4, 22.8, 22.1, 24.6, 26.3, 25.8, 28.4, 30.9, 33.6];
const WEEKS = [{ label: 'W36', v: 26.3 }, { label: 'W37', v: 25.8 }, { label: 'W38', v: 28.4 }, { label: 'W39', v: 30.9 }, { label: 'W40', v: 33.6 }];
const MIX = [{ label: 'Hotels', v: 48, key: 'ch1' }, { label: 'Cafes', v: 31, key: 'ch2' }, { label: 'Retail', v: 21, key: 'ch3' }];
const TASKS = [
  { done: true, text: 'Reconcile PayNow batch', who: { kind: 'agent', name: 'accounts' }, tone: 'sel', st: 'done' },
  { done: false, text: 'Invoice Hilton Orchard', who: { kind: 'human', name: 'Priya' }, tone: 'plain', st: 'live' },
  { done: false, text: 'Price list, week 41', who: { kind: 'agent', name: 'pricing' }, tone: 'plain', st: 'ahead' },
];

// Layout (logical px). Windows: A 56..1008 × 72..524 · B 80..980 × 492..860 · C 1032..1500 × 72..512 ·
// D 1524..1992 × 72..512 · E 1004..1514 × 536..860 · sticky 1536..1992 from y 552.
const A = { x: 56, y: 72, w: 952, h: 452 };
const B = { x: 80, y: 492, w: 900, h: 368 };
const C = { x: 1032, y: 72, w: 468, h: 440 };
const D = { x: 1524, y: 72, w: 468, h: 440 };
const E = { x: 1004, y: 536, w: 510, h: 324 };
const ROW0 = 604, ROWH = 64;             // B: the crew row centre, then task rows from ROW0 + 76
const TX = { box: B.x + 48, text: B.x + 84, chip: B.x + 500, sq: B.x + B.w - 48 };

export default {
  id: 'kit', index: 1, title: 'Kit sheet', live: true,
  draw(ctx, W, H, { progress: p, kit: k, time }) {
    k.cached('sheet', p, (K) => {
      // A — the spreadsheet (meta + a data marker); the Total of row 5 is left to the caller
      const a = K.window(A.x, A.y, A.w, A.h, { title: 'Orders · week 40.xlsx', titleAlign: 'left', meta: '1,204 records', metaMark: 'data', p: K.seg(p, 0, 0.5) });
      const g = K.grid(a.x + 24, a.y + 20, COLS, ORDERS, { sel: { r: 2, c: 4 }, skip: (r, c) => r === 4 && c === 4, p: K.seg(p, 0.05, 0.7), alpha: a.a });
      const cell = g.cell(4, 4);
      K.mono(K.count(96, K.seg(p, 0.3, 0.8), { decimals: 2, prefix: 'S$' }), cell.x + cell.w - 14, cell.y + cell.h / 2 + 11.2, { weight: 400, align: 'right', alpha: a.a * K.ease(K.seg(p, 0.26, 0.46)) });

      // C — area, one series named by the title
      const c = K.window(C.x, C.y, C.w, C.h, { title: 'Revenue · 12 weeks', p: K.seg(p, 0.1, 0.6) });
      K.chart.area(c.x + 24, c.y + 44, c.w - 56, c.h - 44 - 28, REV12, {
        max: 40, ticks: [0, 20, 40], fmt: (v) => (v ? v + 'k' : '0'), xLabels: [{ i: 0, text: 'W29' }, { i: 11, text: 'W40' }],
        p: K.seg(p, 0.15, 0.9), alpha: c.a,
      });

      // D — bar, one series, the last value labelled
      const d = K.window(D.x, D.y, D.w, D.h, { title: 'Weekly revenue', p: K.seg(p, 0.15, 0.65) });
      K.chart.bar(d.x + 24, d.y + 44, d.w - 56, d.h - 44 - 28, WEEKS, {
        max: 40, ticks: [0, 20, 40], fmt: (v) => (v ? v + 'k' : '0'), p: K.seg(p, 0.2, 0.95), alpha: d.a,
      });

      // B — tasks, overlapping A's lower margin; chips in the title bar
      const b = K.window(B.x, B.y, B.w, B.h, {
        title: 'Tasks · week 40', titleAlign: 'left', p: K.seg(p, 0.2, 0.7),
        chips: [{ text: 'Mine', tone: 'plain' }, { text: 'Ops', tone: 'sel' }],
      });
      const ba = b.a;
      // the crew: 4 people, then an agent at 30 / 44 / 60 and one 'ahead'
      // humans at 56 (initials read cleanly from 56 up; 44..55 is the tight floor), then the agent ladder
      ['Lim', 'Priya', 'Marcus', 'Nurul'].forEach((n, i) => K.avatar('human', n, TX.box + 4 + i * 68, ROW0, 56, { alpha: ba, p: K.stag(p, i, 0.4) }));
      K.avatar('agent', 'reader', TX.box + 300, ROW0, 30, { alpha: ba, p: K.stag(p, 4, 0.4) });
      K.avatar('agent', 'scribe', TX.box + 352, ROW0, 44, { alpha: ba, p: K.stag(p, 5, 0.4) });
      K.avatar('agent', 'filer', TX.box + 422, ROW0, 60, { alpha: ba, p: K.stag(p, 6, 0.4) });
      K.avatar('agent', 'buyer', TX.box + 494, ROW0, 44, { alpha: ba, p: K.stag(p, 7, 0.4), state: 'ahead' });
      K.mono('30 agents', TX.sq + 14, ROW0 + 11.2, { weight: 400, align: 'right', alpha: ba, color: K.P.ink3 });
      K.hair(b.x + 24, ROW0 + 44, b.x + b.w - 24, ROW0 + 44, { color: K.P.chGrid, w: 1, alpha: ba });
      TASKS.forEach((t, i) => {
        const y = ROW0 + 76 + i * ROWH + 8;
        const ai = ba * K.stag(p, i, 0.5, 0.06, 0.3);
        K.checkbox(TX.box, y, t.done, { alpha: ai, p: K.seg(p, 0.7, 0.9) });
        K.body(t.text, TX.text, y + 11.2, { size: 32, color: t.done ? K.P.ink3 : K.P.ink1, alpha: ai, maxW: 400 });
        K.chip(TX.chip, y, t.who.name, { tone: t.tone, avatar: t.who, alpha: ai });
        if (t.st !== 'live') K.stateSq(TX.sq, y, t.st, { alpha: ai, check: t.st === 'done' });
      });

      // E — donut, direct labels
      const e = K.window(E.x, E.y, E.w, E.h, { title: 'Orders by customer', p: K.seg(p, 0.3, 0.8) });
      K.chart.donut(e.x + 28 + 96, e.y + 38 + 96, 96, MIX, { labels: { x: e.x + 248, y: e.y + 80, gap: 56 }, p: K.seg(p, 0.35, 1), alpha: e.a });

      // the sticky note: a paper card, co-signed Priya + accounts
      K.card(1536, 552, 456, null, {
        pad: 20,
        p: K.seg(p, 0.55, 0.85), seed: 'kit-sticky', pin: 'tape', monoNums: true, sentenceSize: 52,
        sentence: 'Hilton Orchard pays on 30 days.',
        credit: [{ kind: 'human', name: 'Priya' }, { kind: 'agent', name: 'accounts' }],
      });
    });

    // live on top of the cached layer: the 'live' task's state square breathes
    const y1 = ROW0 + 76 + 1 * ROWH + 8;
    const ai = k.ease(k.seg(p, 0.2, 0.7)) * k.stag(p, 1, 0.5, 0.06, 0.3);
    k.stateSq(TX.sq, y1, 'live', { alpha: ai * (0.7 + 0.3 * k.wave(time || 0, 1.6)) });
  },
  // the sheet is always animating (the live core), so it is always busy
  busy() { return true; },
};
