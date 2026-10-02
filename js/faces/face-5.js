// LENS face 5 — 05 LEDGER: an app table on glass. FIX-PLAN-R4 F5 over REWORK-02-CLIENT §2 (binding).
// "Who did what", restyled into the app family (F0): one window with filter chips, a four-column log —
// Time · Who · What · Status — newest first, people (circle) and agents (square with a screen) in one
// running list. Rows 1–7 are the logged history; rows 8–9 are pinned open work (payroll drafting, the
// buyer waiting on a quote). Footer: the only numbers on the wall, 3,480 entries this month · 0 unlogged.
// Cast (contract 0.5.1): Lim, Priya, Marcus, Nurul; agents by job. Tanjong Fresh. Colour only from k.P.
//
// Live (wall 05: EVENTS row 2.6 / 5.0, SCENE_T 6, STILL 0.8): entry j = n − slot.
//   j odd  (tl 2.6) an agent DRAFTS something   — DRAFTS[m], m = (j − 1) / 2   (logger · the Hilton delivery note…)
//   j even (tl 5.0) its owner CHECKS the same thing — DRAFTS[m], m = j / 2 − 1  (Priya, Marcus, Lim or Nurul)
//   j ≤ 0  the fixed HISTORY the table opens on (reduced / day: n 0, a settled 7-row log).
// On each event the new row arrives at the top (alpha 0 → 1, dropping 20 px into place, a sel flash that
// clears by 1.2 s), rows 1–6 slide down one row over .4 s ease-out, and row 7 fades as it slides under the
// table body's clip. The pinned rows never move. Times 'HH:MM', strictly increasing with j (newest first).
// Static chrome, header, rules, pinned rows and footer paint once through k.cached; only rows 1–7 redraw.
// On the stage's day canvas this wall draws with lod = true: window, chips, rules, avatars and state squares
// still compose the table.

// ---- layout (logical 2048 × 1280) ---------------------------------------------------------------------
const WIN = { x: 96, y: 80, w: 1856, h: 782 };                 // bottom 862 (+34 shadow = 896)
const COL = { time: 120, who: 290, what: 810, status: 1710, end: 1910 };
const WHAT_W = 870;                                            // the What column (900) less a 30 px gutter
const HEAD = { top: 152, bot: 208 };
const ROW_H = 62, ROW0 = 208, BODY_ROWS = 7, PIN_ROWS = 2;     // 9 rows of 62: 208 → 766
const BODY_BOT = ROW0 + BODY_ROWS * ROW_H;                     // 642: the body clip; pinned rows below
const FOOT = { rule: 786, base: 832 };
const DROP = 20;                                               // the arriving row drops this far into place
const AV = 44;

// ---- who did what -------------------------------------------------------------------------------------
const ag = (name, what) => ({ kind: 'agent', name, what });
const hu = (name, what) => ({ kind: 'human', name, what });

// Live pairs: the agent drafts at tl 2.6, a person checks the same thing at 5.0. Rotates per loop.
// FACES R4 review: the checker is the person who owns that work (Priya ops, Marcus sales, Lim finance, Nurul
// dispatch; contract 0.5.1 roles). With Priya on every check, the log at a real hold (the page clock is tens of
// seconds in, so every visible history row is a live pair) read "Priya ×3 + agents" and the rest of the team,
// Nurul's row included, had scrolled away. Now any 7-row window names three people. Priya still checks 2 of 6.
const DRAFTS = [
  { by: 'logger', verb: 'drafted', obj: 'the Hilton delivery note', who: 'Priya', check: 'checked' },
  { by: 'quote-writer', verb: 'drew', obj: 'quote Q-118 for Swee Lee', who: 'Marcus', check: 'checked' },
  { by: 'accounts', verb: 'drafted', obj: 'reminder RM-31', who: 'Lim', check: 'approved' },
  { by: 'buyer', verb: 'drafted', obj: 'order PO-1187', who: 'Priya', check: 'checked' },
  { by: 'pricing', verb: 'drew', obj: 'price list PL-15', who: 'Marcus', check: 'approved' },
  { by: 'dispatch', verb: 'drew', obj: 'Thursday’s van routes', who: 'Nurul', check: 'checked' },
];
// The history the table opens on, newest first (j = 0, −1, … −7).
const HISTORY = [
  ag('accounts', 'matched the W38 payments'),
  hu('Nurul', 're-routed van 3'),
  ag('dispatch', 'drew Tuesday’s van routes'),
  hu('Lim', 'approved price list PL-14'),
  ag('librarian', 'filed SOP-3 under Pricing'),
  hu('Marcus', 'sent quote Q-117 to Swee Lee'),
  ag('reporter', 'filed the W39 report'),
  ag('filer', 'filed INV-2290 for Hawker Assn'),
];
// Pinned open work at the bottom of the table.
const PINNED = [
  { e: ag('payroll', 'drafted September payroll'), state: 'live', status: 'drafting', t: '08:41' },
  { e: ag('buyer', 'asked Cameron Farms for a quote'), state: 'ahead', status: 'waiting', t: '08:32' },
];

const mod = (a, m) => ((a % m) + m) % m;
const LIVE = new Map();
function entryAt(j) {
  if (j <= 0) return HISTORY[mod(-j, HISTORY.length)];
  let e = LIVE.get(j);
  if (e) return e;
  const odd = j % 2 === 1;
  const d = DRAFTS[mod(odd ? (j - 1) / 2 : j / 2 - 1, DRAFTS.length)];
  e = odd ? ag(d.by, `${d.verb} ${d.obj}`) : hu(d.who, `${d.check} ${d.obj}`);
  if (LIVE.size > 256) LIVE.clear();
  LIVE.set(j, e);
  return e;
}
// Clock time of entry j: 09:14 at j = 0, 3–4 minutes apart, strictly increasing, wraps the day.
const TIMES = new Map();
function timeAt(j, hash) {
  let s = TIMES.get(j);
  if (s) return s;
  const m = mod(554 + 3 * j + (j ? Math.floor(hash(`t${j}`) * 2) : 0), 1440);
  s = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  if (TIMES.size > 512) TIMES.clear();
  TIMES.set(j, s);
  return s;
}

// The What column: Geist 36, shrinking to 34 and then 32 only if the sentence does not fit (measured).
const FIT = new Map();
function whatSize(K, str) {
  let s = FIT.get(str);
  if (s) return s;
  s = 32;
  for (const z of [36, 34]) if (K.measure(str, 'body', z, 400) <= WHAT_W) { s = z; break; }
  FIT.set(str, s);
  return s;
}

// LOD (the stage's day canvas skips every glyph of text): a greeked bar where the text would sit, so the
// table still reads as a table. Width = the text's measured width; centred on its x-height.
function greek(K, str, kind, size, x, base, align, a) {
  if (!K.lod || a <= 0) return;
  const w = K.measure(str, kind, size, kind === 'body' ? 400 : 500);
  const h = Math.round(size * 0.34), left = align === 'right' ? x - w : x;
  K.rect(left, base - size * 0.36 - h / 2, w, h, { fill: K.P.ink3, r: h / 2, alpha: a * 0.45 });
}

// One row, top y. a = alpha. state/status for the Status column.
function drawRow(K, e, t, y, a, state, status) {
  const P = K.P, mid = y + ROW_H / 2, base = mid + 11.5;
  K.mono(t, COL.time, base, { size: 32, color: P.ink2, alpha: a });
  K.avatar(e.kind, e.name, COL.who + AV / 2, mid, AV, { alpha: a });
  K.mono(e.name, COL.who + AV + 16, base, { size: 32, color: P.ink1, alpha: a });
  const z = whatSize(K, e.what);
  K.body(e.what, COL.what, mid + z * 0.36, { size: z, color: P.ink1, alpha: a, maxW: 2000 });
  K.stateSq(COL.status + 14, mid, state, { alpha: a });
  K.mono(status, COL.status + 40, base, { size: 32, color: P.ink2, alpha: a });
  if (K.lod) {
    greek(K, t, 'mono', 32, COL.time, base, 'left', a);
    greek(K, e.name, 'mono', 32, COL.who + AV + 16, base, 'left', a);
    greek(K, e.what, 'body', z, COL.what, mid + z * 0.36, 'left', a * 1.6);
    greek(K, status, 'mono', 32, COL.status + 40, base, 'left', a);
  }
}

function paintStatic(K, p) {
  const P = K.P;
  const win = K.window(WIN.x, WIN.y, WIN.w, WIN.h, {
    title: 'Ledger', p,
    chips: [{ text: 'Today', tone: 'sel' }, { text: 'All people', tone: 'plain' }, { text: 'All agents', tone: 'plain' }],
  });
  const a = win.a;
  if (a <= 0) return a;

  // ---- header row -----------------------------------------------------------------------------------
  const ha = a * K.stag(p, 0, 0.16);
  const hb = HEAD.top + (HEAD.bot - HEAD.top) / 2 + 11.5;
  K.mono('Time', COL.time, hb, { size: 32, color: P.ink3, alpha: ha });
  K.mono('Who', COL.who, hb, { size: 32, color: P.ink3, alpha: ha });
  K.mono('What', COL.what, hb, { size: 32, color: P.ink3, alpha: ha });
  K.mono('Status', COL.status, hb, { size: 32, color: P.ink3, alpha: ha });
  for (const [h, x] of [['Time', COL.time], ['Who', COL.who], ['What', COL.what], ['Status', COL.status]]) greek(K, h, 'mono', 32, x, hb, 'left', ha * 0.7);
  K.hair(WIN.x, HEAD.bot + 0.5, WIN.x + WIN.w, HEAD.bot + 0.5, { color: P.chAxis, w: 1, alpha: ha });

  // ---- row rules: body rows in chGrid, the pinned block set off by the axis line --------------------------
  for (let r = 1; r <= BODY_ROWS + PIN_ROWS; r++) {
    const y = ROW0 + r * ROW_H - 0.5;
    const ra = a * K.stag(p, r, 0.2, 0.03);
    K.hair(COL.time, y, COL.end, y, { color: r === BODY_ROWS ? P.chAxis : P.chGrid, w: 1, alpha: ra });
  }

  // ---- pinned open work ------------------------------------------------------------------------------
  for (let i = 0; i < PINNED.length; i++) {
    const q = PINNED[i];
    drawRow(K, q.e, q.t, BODY_BOT + i * ROW_H, a * K.stag(p, BODY_ROWS + i, 0.22, 0.04), q.state, q.status);
  }

  // ---- footer ---------------------------------------------------------------------------------------
  const fa = a * K.stag(p, 0, 0.6);
  K.hair(WIN.x, FOOT.rule + 0.5, WIN.x + WIN.w, FOOT.rule + 0.5, { color: P.chGrid, w: 1, alpha: fa });
  K.mono('3,480 entries this month · 0 unlogged', COL.time, FOOT.base, { size: 32, color: P.ink2, alpha: fa });
  K.mono('every line can be undone', COL.end, FOOT.base, { size: 32, color: P.ink3, alpha: fa, align: 'right' });
  greek(K, '3,480 entries this month · 0 unlogged', 'mono', 32, COL.time, FOOT.base, 'left', fa);
  greek(K, 'every line can be undone', 'mono', 32, COL.end, FOOT.base, 'right', fa);
  return a;
}

export default {
  id: 'ledger', index: 5, title: 'Ledger', live: true,

  busy(beat, reduced) {
    return !reduced && !!beat && (beat.since < 1.2 || beat.tl < 0.45);
  },

  draw(ctx, W, H, { progress: p, kit: k, beat, reduced }) {
    if (p <= 0) return;
    const P = k.P;
    let wa = 1;
    k.cached('f5' + (k.lod ? '-lod' : ''), p, (K) => { wa = paintStatic(K, p); });
    if (wa <= 0) return;

    const n = beat ? beat.n : 0;
    const since = beat ? beat.since : 99;
    const still = !!reduced || !beat || since >= 99;
    const u = still ? 1 : k.settle(since);                     // 0 → 1 over .4 s after the event, ease-out
    const flash = still ? 0 : 1 - k.seg(since, 0.4, 1.2);      // the new row's sel tint, gone by 1.2 s

    k.clip(WIN.x, ROW0, WIN.w, BODY_BOT - ROW0, () => {
      if (flash > 0 && n > 0) {
        const fy = ROW0 - (1 - u) * DROP;
        k.rect(WIN.x + 1, fy + 1, WIN.w - 2, ROW_H - 2, { fill: P.sel, r: 0, alpha: wa * flash * u });
      }
      for (let s = 0; s <= BODY_ROWS; s++) {
        if (s === BODY_ROWS && u >= 1) break;
        const j = n - s;
        const pos = s === 0 ? 0 : s - 1 + u;
        const y = ROW0 + pos * ROW_H - (s === 0 ? (1 - u) * DROP : 0);
        let a = wa * k.stag(p, Math.min(s, BODY_ROWS - 1), 0.22, 0.04);
        if (s === 0) a *= u;
        if (s === BODY_ROWS) a *= 1 - u;
        if (a <= 0.004) continue;
        drawRow(k, entryAt(j), timeAt(j, k.hash), y, a, 'done', 'done');
      }
    });
  },
};
