// LENS face 3 — 03 AI AGENTS: a kanban board. FIX-PLAN-R4 F3 (binding), after REWORK-02-CLIENT §2 ("a kanban
// for task/project management ... this is where the 1:5 team shows as work").
//
// One window, 'Operations board'. Header 'Week 40 · Operations', '6 people · 30 agents', filter chips. Four
// columns (Backlog · In progress · Review · Done) with a WIP count each, three card slots per column. A card is
// a title (<= 2 lines), a tag chip, a due date and its assignees: mostly agents (rounded square with a screen),
// and a human on every Review card (Marcus, Priya). Done cards carry the filled state square with a check.
// No ramp hue and no accent on this wall. Colours come only from k.P.
//
// Live (beat, wall 03: EVENTS pin 3.6 / hand 6.5, SCENE_T 12, STILL 6.1):
//   pin 3.6    'Hilton weekly order' slides In progress slot 2 -> Review slot 3 (.6 s ease-out, lifted); September
//              payroll reflows up; WIP In progress 3/4 -> 2/4, Review 2/3 -> 3/3; Marcus lands on the moved card
//              over .6–1.0 s (avatar fresh .95 -> 1 with alpha)
//   hand 6.5   the top Review card (Hawker price list) slides to Done slot 1 (.6 s); Review reflows up; Done's cards
//              shift down a slot and INV-2291 sent fades out as it leaves the panel; Done WIP 3 -> 4, Review
//              3/3 -> 2/3; the arriving card's square goes live -> done and its check strokes on at landing
//   wrap       tl 0–0.4: the end board cross-fades back to the base board
// Still / day / reduced (tl 6.1): after the pin, before the hand. Rest boards are painted once into k.cached();
// only a moving board redraws its cards live.
import { EVENTS, STILL } from './beat.js';

const WALL = 2;
const T_PIN = EVENTS[WALL][0][0];      // 3.6
const T_HAND = EVENTS[WALL][1][0];     // 6.5
const SLIDE = 0.6;
const LAND = [0.6, 1.0];               // Marcus lands on the moved card, seconds after the pin
const WRAP = 0.4;

const WIN = { x: 96, y: 80, w: 1856, h: 782 };
const COL = { x0: 120, pitch: 458, w: 434, top: 232, bot: 848, r: 16, nameY: 272 };
const CARD = { w: 402, h: 170, dx: 16, pad: 20, r: 14 };
const SLOT_Y = [292, 478, 664, 850];   // slot 4 is below the panel: a card leaving the column slides into it
const COL_NAMES = ['Backlog', 'In progress', 'Review', 'Done'];
const TITLE_W = 250;                   // every card wraps the same way, with one avatar or two
const AV = 44, AV_GAP = 8;
const colX = (c) => COL.x0 + c * COL.pitch;

const A = (name) => ({ kind: 'agent', name });
const H = (name) => ({ kind: 'human', name });

// Due dates carry no weekday on the card: with the weekday, 'Accounts' + 'Tue 30 Sep' + the done square is
// ~443 px against the card's 362 px inner width.
const CARDS = {
  quote: { title: 'Quote Swee Lee Kitchen', tag: 'Sales', due: '3 Oct', who: [A('quote-writer')] },
  restock: { title: 'Restock cold room', tag: 'Ops', due: '6 Oct', who: [A('buyer')] },
  chase: { title: 'Chase INV-2280', tag: 'Accounts', due: '7 Oct', who: [A('accounts')] },
  vans: { title: 'Tuesday van routes', tag: 'Dispatch', due: '2 Oct', who: [A('dispatch')] },
  hilton: { title: 'Hilton weekly order', tag: 'Sales', due: '1 Oct', who: [A('quote-writer')], lands: H('Marcus') },
  payroll: { title: 'September payroll', tag: 'Accounts', due: '3 Oct', who: [A('payroll')] },
  hawker: { title: 'Hawker price list', tag: 'Pricing', due: '1 Oct', who: [A('pricing'), H('Marcus')] },
  cameron: { title: 'New supplier: Cameron', tag: 'Buying', due: '2 Oct', who: [A('buyer'), H('Priya')] },
  coldlog: { title: 'Cold-room log', tag: 'Ops', due: '30 Sep', who: [A('logger')] },
  rota: { title: 'Driver rota', tag: 'Dispatch', due: '29 Sep', who: [A('dispatch'), H('Nurul')] },
  inv: { title: 'INV-2291 sent', tag: 'Accounts', due: '30 Sep', who: [A('accounts')] },
};

// The three rest boards. Backlog and 'Tuesday van routes' never move: they live in the chrome layer.
const STATIC_IDS = ['quote', 'restock', 'chase', 'vans'];
const BOARD = {
  S0: { cols: [['quote', 'restock', 'chase'], ['vans', 'hilton', 'payroll'], ['hawker', 'cameron'], ['coldlog', 'rota', 'inv']], wip: ['3', '3/4', '2/3', '3'] },
  S1: { cols: [['quote', 'restock', 'chase'], ['vans', 'payroll'], ['hawker', 'cameron', 'hilton'], ['coldlog', 'rota', 'inv']], wip: ['3', '2/4', '3/3', '3'] },
  S2: { cols: [['quote', 'restock', 'chase'], ['vans', 'payroll'], ['cameron', 'hilton'], ['hawker', 'coldlog', 'rota']], wip: ['3', '2/4', '2/3', '4'] },
};
const PLACE = {};
for (const key of Object.keys(BOARD)) {
  const m = {};
  BOARD[key].cols.forEach((ids, c) => ids.forEach((id, s) => { m[id] = { c, s }; }));
  PLACE[key] = m;
}

// Per-card extras on a board: Marcus on the Hilton card once it is in Review (land 0..1); the state square on
// Done cards (sq 'live'|'done', sqA alpha, check 0..1).
function extrasFor(id, key) {
  const pl = PLACE[key][id];
  return {
    land: id === 'hilton' && pl && pl.c === 2 ? 1 : 0,
    sq: pl && pl.c === 3 ? 'done' : null, sqA: 1, check: 1,
  };
}

// ---- drawing ----------------------------------------------------------------------------------------------
// frameA (default a): the card's fill and outline alpha, apart from its contents (the wrap cross-fades contents
// inside one opaque frame).
function drawCard(K, id, x, y, a, ex, frameA) {
  const P = K.P, c = CARDS[id];
  const fa = frameA == null ? a : frameA;
  if (fa > 0.004) K.rect(x, y, CARD.w, CARD.h, { r: CARD.r, fill: P.win, stroke: P.winLine, w: 1.5, alpha: fa });
  if (a <= 0.004) return;
  K.body(c.title, x + CARD.pad, y + 46, { size: 34, weight: 500, lh: 42 / 34, maxW: TITLE_W, color: P.ink1, alpha: a });
  // assignees, right to left: the agent at the corner, a human to its left
  let ax = x + CARD.w - CARD.pad - AV / 2;
  const ay = y + CARD.pad + AV / 2;
  for (const who of c.who) {
    K.avatar(who.kind, who.name, ax, ay, AV, { alpha: a });
    ax -= AV + AV_GAP;
  }
  if (c.lands && ex && ex.land > 0) K.avatar(c.lands.kind, c.lands.name, ax, ay, AV, { alpha: a, fresh: ex.land });
  K.chip(x + CARD.pad, y + 138, c.tag, { tone: 'plain', alpha: a });
  const dx = x + CARD.w - CARD.pad;
  const dw = K.mono(c.due, dx, y + 150, { size: 32, color: P.ink3, align: 'right', alpha: a });
  if (ex && ex.sq && ex.sqA > 0) {
    const sx = dx - dw - 12 - 14, sy = y + 139;
    if (ex.sq === 'done' && ex.check < 1) {   // landing: live cross-fades to done while the check strokes on
      K.stateSq(sx, sy, 'live', { size: 28, alpha: a * ex.sqA * (1 - ex.check) });
      if (ex.check > 0) K.stateSq(sx, sy, 'done', { size: 28, check: true, p: ex.check, alpha: a * ex.sqA });
    } else K.stateSq(sx, sy, ex.sq, { size: 28, check: ex.sq === 'done', alpha: a * ex.sqA });
  }
}

// A card picked up off the board: a soft lifted shadow under it (amt 0..1).
function lift(ctx, P, x, y, amt) {
  if (amt <= 0.01) return;
  const m = ctx.getTransform(), s = Math.hypot(m.a, m.b) || 1;
  ctx.save();
  ctx.globalAlpha = amt;
  ctx.shadowColor = P.winShade; ctx.shadowBlur = 30 * s * amt; ctx.shadowOffsetY = 16 * s * amt;
  ctx.fillStyle = P.win;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, CARD.w, CARD.h, CARD.r); else ctx.rect(x, y, CARD.w, CARD.h);
  ctx.fill();
  ctx.restore();
}

// Window, header, filter chips, the four panels and their names, plus whatever never moves.
function chrome(K, p) {
  const P = K.P, seg = K.seg, ease = K.ease;
  const w = K.window(WIN.x, WIN.y, WIN.w, WIN.h, { title: 'Operations board', p: seg(p, 0, 0.4) });
  const hA = w.a * ease(seg(p, 0.1, 0.5));
  if (hA > 0) {
    const tw = K.sans('Week 40 · Operations', 120, 196, { size: 48, weight: 600, color: P.ink1, alpha: hA });
    K.mono('6 people · 30 agents', 120 + tw + 36, 196, { size: 32, color: P.ink3, alpha: hA });
    const chips = [['Dispatch', 'plain'], ['Ops', 'plain'], ['Sales', 'plain'], ['All', 'sel']];
    let cx = 1928;
    for (const [t, tone] of chips) cx -= K.chip(cx, 180, t, { tone, align: 'right', alpha: hA }) + 12;
  }
  for (let c = 0; c < 4; c++) {
    const a = w.a * ease(seg(p, 0.16 + c * 0.05, 0.5 + c * 0.05));
    if (a <= 0) continue;
    const x = colX(c);
    K.rect(x, COL.top, COL.w, COL.bot - COL.top, { r: COL.r, fill: P.winBar, alpha: a });
    K.sans(COL_NAMES[c], x + 20, COL.nameY, { size: 36, weight: 600, color: P.ink1, alpha: a });
  }
  K.mono(BOARD.S0.wip[0], colX(0) + COL.w - 20, COL.nameY, { size: 32, color: P.ink3, align: 'right', alpha: w.a * ease(seg(p, 0.16, 0.5)) });
  for (const id of STATIC_IDS) {
    const pl = PLACE.S0[id];
    drawCard(K, id, colX(pl.c) + CARD.dx, SLOT_Y[pl.s], w.a * cardIn(K, p, pl), null);
  }
}
const cardIn = (K, p, pl) => K.ease(K.seg(p, 0.3 + pl.c * 0.07 + pl.s * 0.05, 0.62 + pl.c * 0.07 + pl.s * 0.05));

// A whole rest board: chrome + every moving card + the three changing WIP counts.
function restBoard(K, p, key) {
  chrome(K, p);
  const w = K.ease(K.seg(p, 0, 0.4));
  for (const id of Object.keys(PLACE[key])) {
    if (STATIC_IDS.includes(id)) continue;
    const pl = PLACE[key][id];
    drawCard(K, id, colX(pl.c) + CARD.dx, SLOT_Y[pl.s], w * cardIn(K, p, pl), extrasFor(id, key));
  }
  for (let c = 1; c < 4; c++) wipText(K, c, BOARD[key].wip[c], w * K.ease(K.seg(p, 0.16 + c * 0.05, 0.5 + c * 0.05)));
}
function wipText(K, c, str, a) {
  if (a > 0) K.mono(str, colX(c) + COL.w - 20, COL.nameY, { size: 32, color: K.P.ink3, align: 'right', alpha: a });
}

// A board in motion from rest board `from` to `to` at eased progress e (0..1). Cards that stay in their column
// reflow (clipped to the panels); a card that changes column flies on top, lifted; a card pushed past slot 3
// fades out under the panel's edge. `fx(id)` returns the extras to draw a card with.
function moving(ctx, k, from, to, e, fx) {
  const A0 = PLACE[from], B0 = PLACE[to];
  const ids = new Set([...Object.keys(A0), ...Object.keys(B0)]);
  let flyer = null;
  k.clip(COL.x0, COL.top, 3 * COL.pitch + COL.w, COL.bot - COL.top, () => {
    for (const id of ids) {
      if (STATIC_IDS.includes(id)) continue;
      const a = A0[id], b = B0[id];
      if (a && b && a.c !== b.c) { flyer = { id, a, b }; continue; }
      if (a && b) {
        const y = SLOT_Y[a.s] + (SLOT_Y[b.s] - SLOT_Y[a.s]) * e;
        drawCard(k, id, colX(a.c) + CARD.dx, y, 1, fx(id));
      } else if (a) {       // leaving: pushed down one slot out of the panel
        const y = SLOT_Y[a.s] + (SLOT_Y[a.s + 1] - SLOT_Y[a.s]) * e;
        drawCard(k, id, colX(a.c) + CARD.dx, y, 1 - e, fx(id));
      }
    }
  });
  for (let c = 1; c < 4; c++) {
    const wa = BOARD[from].wip[c], wb = BOARD[to].wip[c];
    if (wa === wb) wipText(k, c, wa, 1);
    else { wipText(k, c, wa, 1 - Math.min(1, 2 * e)); wipText(k, c, wb, Math.max(0, 2 * e - 1)); }   // dip, never two digits stacked
  }
  if (flyer) {
    const { id, a, b } = flyer;
    const x = colX(a.c) + (colX(b.c) - colX(a.c)) * e + CARD.dx;
    const y = SLOT_Y[a.s] + (SLOT_Y[b.s] - SLOT_Y[a.s]) * e;
    const up = Math.sin(Math.PI * Math.min(1, e));
    lift(ctx, k.P, x, y, up);
    k.rot(x + CARD.w / 2, y + CARD.h / 2, 1.6 * up, () => drawCard(k, id, x, y, 1, fx(id)));
  }
}

// The wrap: rest board S2 cross-fades to S0, slot by slot. A slot filled on both boards keeps one opaque card
// frame and dips its contents (old out, then new in); a slot filled on one board only fades whole; an unchanged card draws once.
function wrapFade(k, w) {
  // Contents that swap in place dip through empty (out over the first half, in over the second) so two lines of
  // text never sit on top of each other mid-fade.
  const wOut = 1 - Math.min(1, 2 * w), wIn = Math.max(0, 2 * w - 1);
  const slots = new Map();
  for (const [key, side] of [['S2', 'a'], ['S0', 'b']]) {
    for (const [id, pl] of Object.entries(PLACE[key])) {
      if (STATIC_IDS.includes(id)) continue;
      const sk = pl.c * 10 + pl.s;
      if (!slots.has(sk)) slots.set(sk, { c: pl.c, s: pl.s });
      slots.get(sk)[side] = id;
    }
  }
  for (const sl of slots.values()) {
    const x = colX(sl.c) + CARD.dx, y = SLOT_Y[sl.s];
    const exA = sl.a && extrasFor(sl.a, 'S2'), exB = sl.b && extrasFor(sl.b, 'S0');
    if (sl.a && sl.b) {
      if (sl.a === sl.b && exA.land === exB.land && exA.sq === exB.sq) { drawCard(k, sl.a, x, y, 1, exA); continue; }
      drawCard(k, sl.a, x, y, wOut, exA, 1);
      drawCard(k, sl.b, x, y, wIn, exB, 0);
    } else if (sl.a) drawCard(k, sl.a, x, y, 1 - w, exA);
    else drawCard(k, sl.b, x, y, w, exB);
  }
  for (let c = 1; c < 4; c++) {
    const wa = BOARD.S2.wip[c], wb = BOARD.S0.wip[c];
    if (wa === wb) wipText(k, c, wa, 1);
    else { wipText(k, c, wa, wOut); wipText(k, c, wb, wIn); }
  }
}

// What the board is doing at scene time tl (pure).
function phase(k, beat, still) {
  const tl = still || !beat ? STILL[WALL] : beat.tl;
  if (!still && beat && beat.n >= EVENTS[WALL].length && tl < WRAP) return { kind: 'wrap', w: k.ease(tl / WRAP) };
  if (tl < T_PIN) return { kind: 'rest', key: 'S0' };
  if (tl < T_PIN + SLIDE) return { kind: 'move', from: 'S0', to: 'S1', e: k.ease((tl - T_PIN) / SLIDE), land: 0 };
  const land = k.ease((tl - T_PIN - LAND[0]) / (LAND[1] - LAND[0]));
  if (tl < T_PIN + LAND[1]) return { kind: 'land', land };
  if (tl < T_HAND) return { kind: 'rest', key: 'S1' };
  if (tl < T_HAND + SLIDE) return { kind: 'move', from: 'S1', to: 'S2', e: k.ease((tl - T_HAND) / SLIDE), land: 1 };
  const cp = k.checkP(tl - T_HAND - SLIDE, false);
  if (cp < 1) return { kind: 'check', cp };
  return { kind: 'rest', key: 'S2' };
}

export default {
  id: 'agents', index: 3, title: 'AI agents', live: true,
  busy(beat, reduced) { return !reduced && !!beat && (beat.since < 1.2 || beat.tl < 0.45); },
  draw(ctx, W, H, { progress: p, kit: k, reduced, beat, lod }) {
    if (p <= 0) return;
    const still = !!reduced || !beat;
    const L = lod ? '-lod' : '';
    const ph = phase(k, beat, still);

    if (ph.kind === 'rest' || p < 1) {
      // a rest board, painted once; during the build the board comes up in the nearest rest state
      const key = ph.kind === 'rest' ? ph.key : ph.kind === 'move' ? ph.to : ph.kind === 'land' ? 'S1' : ph.kind === 'check' ? 'S2' : 'S0';
      k.cached(`f3-${key}${L}`, p, (K) => restBoard(K, p, key));
      return;
    }
    k.cached(`f3-chrome${L}`, 1, (K) => chrome(K, 1));
    if (ph.kind === 'wrap') { wrapFade(k, ph.w); return; }
    if (ph.kind === 'move') {
      const hand = ph.from === 'S1';
      moving(ctx, k, ph.from, ph.to, ph.e, (id) => {
        if (id === 'hawker' && hand) return { land: 0, sq: 'live', sqA: ph.e, check: 0 };
        const ex = extrasFor(id, ph.from);
        if (id === 'hilton') ex.land = ph.land;
        return ex;
      });
      return;
    }
    // 'land' (Marcus arriving on S1) and 'check' (the Done square's check stroking on, S2)
    const key = ph.kind === 'land' ? 'S1' : 'S2';
    for (const id of Object.keys(PLACE[key])) {
      if (STATIC_IDS.includes(id)) continue;
      const pl = PLACE[key][id];
      const ex = extrasFor(id, key);
      if (id === 'hilton' && ph.kind === 'land') ex.land = ph.land;
      if (id === 'hawker' && ph.kind === 'check') ex.check = ph.cp;
      drawCard(k, id, colX(pl.c) + CARD.dx, SLOT_Y[pl.s], 1, ex);
    }
    for (let c = 1; c < 4; c++) wipText(k, c, BOARD[key].wip[c], 1);
  },
};
