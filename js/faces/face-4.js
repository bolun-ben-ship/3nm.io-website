// LENS face 4 — 04 THE WORKSPACE: a file browser on glass. FIX-PLAN-R4 F4 over REWORK-02-CLIENT §2 (binding).
// One app window in the family (F0): a Finder-like folder tree on the left (Clients open, Hilton Orchard
// selected), a path bar, and a 4 × 2 grid of the client's files, each with the owners who work on it
// (circle = person, square with a screen = agent). Tanjong Fresh; the person on this wall is Nurul (dispatch).
// The one count on the wall is 142 (contract 0.5.4). Colour comes only from k.P.
//
// Live (wall 04: EVENTS pass 2.2 / 5.0 / 7.8 / 10.6 / 12.8, SCENE_T 14, STILL 4.6): the floor passes the
// weekly order round, in the order of contract 0.5.2 (F5 agent, F3 agent, F1 Nurul, F2 agent, F4 agent).
// Each pass appends the passer to the status bar's "Order-W40.xlsx · edited by" row (fresh: .95 → 1 with
// alpha over k.settle(since)) and brightens the Order-W40 tile's selection for .6 s; on the fifth a ✓ and
// 'saved' complete (k.checkP). At the wrap (tl 0) the finished row fades over .4 s and the next loop starts
// empty. Reduced motion, day and still draw tl 4.6: one member (an agent), no check.
// Static chrome, tree, path bar, tiles and the status bar's fixed text paint once through k.cached; only the
// tile flash and the edited-by row redraw. On the stage's day canvas this wall draws with lod = true: the
// window, sidebar fills, disclosure triangles, folder / file icons, tiles and avatars still compose the app.

import { EVENTS, SCENE_T, STILL } from './beat.js';

const WALL = 3;
const T = SCENE_T[WALL];
const PASS = EVENTS[WALL].map((e) => e[0]);                    // 2.2, 5.0, 7.8, 10.6, 12.8
const ORDER = ['agent', 'agent', 'human', 'agent', 'agent'];   // F5, F3, F1 (Nurul), F2, F4 (contract 0.5.2)
const NAMES = [null, null, 'Nurul', null, null];
const FADE = 0.4;                 // the finished row clears over .4 s after the wrap
const FLASH = 0.6;                // the Order-W40 tile brightens for .6 s on each pass

// ---- layout (logical 2048 × 1280) ---------------------------------------------------------------------
const WIN = { x: 96, y: 80, w: 1856, h: 782 };                 // bottom 862 (+34 shadow = 896)
const SIDE = { x0: 96, x1: 560, top: 136, bot: 784 };   // bot = the status rule: no sliver of window between them
const TREE = { y0: 160, rowH: 56, triX: 126, folderX: 144, textGap: 16, indent: 40 };
const PATH = { x: 600, base: 191, rule: 220, x1: 1928 };
const TILE = { x0: 600, y0: 244, w: 300, h: 250, dx: 336, dy: 270 };
const STATUS = { rule: 784, base: 830, x: 120, right: 1928, av: 44, gap: 8 };   // av 44: the kit draws a human's initials only at s ≥ 44
const AV_Y = STATUS.base - 11.5;  // the avatars' centre = the mono 32 x-height centre on the status baseline

// The tree: [label, level, open (true = ▾, false = ▸, null = none), selected]
const TREE_ROWS = [
  ['Clients', 0, true, false],
  ['Hilton Orchard', 1, null, true],
  ['Swee Lee Kitchen', 1, null, false],
  ['Hawker Assn', 1, null, false],
  ['Jobs', 0, false, false],
  ['Routes', 0, false, false],
  ['Pricing', 0, false, false],
  ['Ledger', 0, false, false],
];

// The files in Clients / Hilton Orchard and who works on each (agents by job, people by name).
const ag = (name) => ({ kind: 'agent', name });
const hu = (name) => ({ kind: 'human', name });
const FILES = [
  { name: 'Order-W40.xlsx', icon: 'xlsx', owners: [ag('quote-writer'), hu('Marcus')] },
  { name: 'INV-2291.pdf', icon: 'doc', owners: [ag('accounts'), hu('Priya')] },
  { name: 'Price-list.pdf', icon: 'doc', owners: [ag('pricing'), hu('Marcus')] },
  { name: 'Route-Tue.pdf', icon: 'doc', owners: [ag('dispatch'), hu('Nurul')] },
  { name: 'Contract.pdf', icon: 'doc', owners: [hu('Lim')] },
  { name: 'Notes.md', icon: 'doc', owners: [ag('librarian')] },
  { name: 'Cold-room.log', icon: 'doc', owners: [ag('logger')] },
  { name: 'Photos', icon: 'folder', owners: [hu('Nurul')] },
];
const EDITED = 'Order-W40.xlsx · edited by';
const KEPT = '142 folders · every change kept';

// ---- bespoke icons (plain k.path / k.rect / k.hair; every one survives LOD) ---------------------------
// A folder: an outlined tabbed rect, w × h, top-left (x, y).
function folder(K, x, y, w, h, color, a, lw) {
  const tab = Math.round(h * 0.2), tw = Math.round(w * 0.38);
  K.path([[x, y + h], [x, y], [x + tw, y], [x + tw + tab, y + tab], [x + w, y + tab], [x + w, y + h], [x, y + h]],
    { color, w: lw || 2.5, alpha: a, join: 'round' });
}
// A disclosure triangle centred on (x, y): open points down, closed points right. Filled small path.
function triangle(K, x, y, open, color, a) {
  const s = 9;
  const pts = open
    ? [[x - s, y - s * 0.55], [x + s, y - s * 0.55], [x, y + s * 0.75], [x - s, y - s * 0.55]]
    : [[x - s * 0.55, y - s], [x + s * 0.75, y], [x - s * 0.55, y + s], [x - s * 0.55, y - s]];
  K.path(pts, { color, w: 4, alpha: a, join: 'round' });
}
// A document sheet 84 × 104 with a folded top-right corner, top-left (x, y), stroked ink2.
function sheet(K, x, y, xlsx, a) {
  const P = K.P, w = 84, h = 104, f = 22;
  if (xlsx) {
    // the header band in green, then a 3 × 4 grid of cells in chGrid (drawn first, under the outline)
    K.rect(x + 12, y + 30, w - 24, 14, { fill: P.green, r: 2, alpha: a });
    const gx = x + 12, gy = y + 44, gw = w - 24, gh = 48;
    for (let c = 1; c < 3; c++) K.hair(gx + (gw * c) / 3, y + 30, gx + (gw * c) / 3, gy + gh, { color: P.chAxis, w: 1.5, alpha: a });
    for (let r = 1; r <= 4; r++) K.hair(gx, gy + (gh * r) / 4, gx + gw, gy + (gh * r) / 4, { color: P.chAxis, w: 1.5, alpha: a });
  } else {
    // three text lines, faint
    for (let r = 0; r < 3; r++) K.hair(x + 14, y + 46 + r * 16, x + w - 14 - (r === 2 ? 20 : 0), y + 46 + r * 16, { color: P.chAxis, w: 3, alpha: a, cap: 'round' });
  }
  K.path([[x, y], [x + w - f, y], [x + w, y + f], [x + w, y + h], [x, y + h], [x, y]], { color: P.ink2, w: 2.5, alpha: a, join: 'round' });
  K.path([[x + w - f, y], [x + w - f, y + f], [x + w, y + f]], { color: P.ink2, w: 2.5, alpha: a, join: 'round' });
}

const tileXY = (i) => [TILE.x0 + (i % 4) * TILE.dx, TILE.y0 + Math.floor(i / 4) * TILE.dy];

// LOD (the stage's day canvas skips every glyph of text): a greeked bar where the text would sit, so the tree,
// names and status bar still read as an app. Width = the text's measured width; centred on its x-height.
function greek(K, str, kind, size, x, base, align, a, weight) {
  if (!K.lod || a <= 0) return;
  const w = K.measure(str, kind, size, weight || (kind === 'body' ? 400 : kind === 'sans' ? 600 : 500));
  const h = Math.round(size * 0.34), left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  K.rect(left, base - size * 0.36 - h / 2, w, h, { fill: K.P.ink3, r: h / 2, alpha: a * 0.45 });
}

// The static wall. Returns the window alpha.
function paintStatic(K, p) {
  const P = K.P;
  const win = K.window(WIN.x, WIN.y, WIN.w, WIN.h, { title: 'Workspace · Tanjong Fresh', p });
  const a = win.a;
  if (a <= 0) return a;

  // ---- sidebar: flat winBar, square corners (it stops above the status bar) ---------------------------
  K.rect(SIDE.x0, SIDE.top, SIDE.x1 - SIDE.x0, SIDE.bot - SIDE.top, { fill: P.winBar, r: 0, alpha: a });
  K.hair(SIDE.x1, SIDE.top, SIDE.x1, STATUS.rule, { color: P.winLine, w: 1.5, alpha: a });
  for (let i = 0; i < TREE_ROWS.length; i++) {
    const [label, lvl, open, selected] = TREE_ROWS[i];
    const ra = a * K.stag(p, i, 0.14, 0.03);
    if (ra <= 0) continue;
    const top = TREE.y0 + i * TREE.rowH, cy = top + TREE.rowH / 2;
    const dx = lvl * TREE.indent;
    if (selected) K.rect(108, top + 4, SIDE.x1 - 12 - 108, TREE.rowH - 8, { fill: P.sel, r: 12, alpha: ra });
    if (open != null) triangle(K, TREE.triX + dx, cy, open, P.ink3, ra);
    folder(K, TREE.folderX + dx, cy - 13, 34, 26, selected ? P.green : P.ink3, ra);
    K.body(label, TREE.folderX + dx + 34 + TREE.textGap, cy + 12, { size: 34, color: selected ? P.ink1 : P.ink2, alpha: ra, maxW: 400, weight: selected ? 500 : 400 });
    greek(K, label, 'body', 34, TREE.folderX + dx + 34 + TREE.textGap, cy + 12, 'left', ra, selected ? 500 : 400);
  }

  // ---- path bar ------------------------------------------------------------------------------------
  const pa = a * K.stag(p, 0, 0.2);
  const pw = K.sans('Clients / ', PATH.x, PATH.base, { size: 36, weight: 600, color: P.ink2, alpha: pa });
  K.sans('Hilton Orchard', PATH.x + pw, PATH.base, { size: 36, weight: 600, color: P.ink1, alpha: pa });
  greek(K, 'Clients / Hilton Orchard', 'sans', 36, PATH.x, PATH.base, 'left', pa);
  // view toggle at the right of the path bar: grid (selected) | list — plain rects, no text
  const vx = PATH.x1 - 128, vy = 156;
  K.rect(vx, vy, 128, 44, { stroke: P.winLine, w: 1.5, r: 12, alpha: pa });
  K.rect(vx + 3, vy + 3, 61, 38, { fill: P.sel, r: 10, alpha: pa });
  for (let q = 0; q < 4; q++) K.rect(vx + 20 + (q % 2) * 14, vy + 10 + Math.floor(q / 2) * 14, 10, 10, { fill: P.ink2, r: 2, alpha: pa });
  for (let q = 0; q < 3; q++) K.hair(vx + 82, vy + 13 + q * 9, vx + 110, vy + 13 + q * 9, { color: P.ink3, w: 3, alpha: pa, cap: 'round' });
  K.hair(PATH.x, PATH.rule + 0.5, PATH.x1, PATH.rule + 0.5, { color: P.chGrid, w: 1, alpha: pa });

  // ---- the files -----------------------------------------------------------------------------------
  for (let i = 0; i < FILES.length; i++) {
    const f = FILES[i];
    const [x, y] = tileXY(i);
    const ta = a * K.stag(p, i, 0.3, 0.05);
    if (ta <= 0) continue;
    K.rect(x, y, TILE.w, TILE.h, { fill: i === 0 ? P.sel : P.winBar, r: 16, alpha: ta });
    const cx = x + TILE.w / 2;
    if (f.icon === 'folder') folder(K, cx - 52, y + 34, 104, 84, P.ink2, ta, 3);
    else sheet(K, cx - 42, y + 24, f.icon === 'xlsx', ta);
    K.mono(f.name, cx, y + 170, { size: 32, color: P.ink1, alpha: ta, align: 'center' });
    greek(K, f.name, 'mono', 32, cx, y + 170, 'center', ta);
    const n = f.owners.length, s = 44, g = 8, w = n * s + (n - 1) * g;
    for (let j = 0; j < n; j++) K.avatar(f.owners[j].kind, f.owners[j].name, cx - w / 2 + s / 2 + j * (s + g), y + 216, s, { alpha: ta });
  }

  // ---- status bar: the fixed text (the edited-by marks are live) ----------------------------------------
  const sa = a * K.stag(p, 0, 0.6);
  K.hair(WIN.x, STATUS.rule + 0.5, WIN.x + WIN.w, STATUS.rule + 0.5, { color: P.chGrid, w: 1, alpha: sa });
  K.mono(EDITED, STATUS.x, STATUS.base, { size: 32, color: P.ink2, alpha: sa });
  K.mono(KEPT, STATUS.right, STATUS.base, { size: 32, color: P.ink3, alpha: sa, align: 'right' });
  greek(K, EDITED, 'mono', 32, STATUS.x, STATUS.base, 'left', sa);
  greek(K, KEPT, 'mono', 32, STATUS.right, STATUS.base, 'right', sa);
  return a;
}

// Where the passes stand at scene time tl. `still`: reduced / day, everything settled.
function liveState(beat, still) {
  const tl = still || !beat ? STILL[WALL] : beat.tl;
  let kk = 0;
  for (let i = 0; i < PASS.length; i++) if (PASS[i] <= tl) kk++;
  // loops completed so far: n counts every pass, this loop's kk included
  const L = still || !beat ? 0 : Math.max(0, Math.floor((beat.n - kk) / PASS.length));
  const since = kk > 0 ? tl - PASS[kk - 1] : tl + T - PASS[PASS.length - 1];
  return { tl, kk, L, since, still: still || !beat };
}

export default {
  id: 'workspace',
  index: 4,
  title: 'The workspace',
  live: true,

  busy(beat, reduced) {
    return !reduced && !!beat && (beat.since < 1.2 || beat.tl < 0.45);
  },

  draw(ctx, W, H, { progress: p, kit: k, reduced, beat }) {
    if (p <= 0) return;
    const P = k.P;
    let wa = 1;
    k.cached('f4' + (k.lod ? '-lod' : ''), p, (K) => { wa = paintStatic(K, p); });
    if (wa <= 0) return;

    const S = liveState(beat, !!reduced);
    const live = wa * k.ease(k.seg(p, 0.6, 1));
    if (live <= 0) return;

    // the previous loop's finished row, fading out just after the wrap (never in the still pose)
    const fadePrev = !S.still && S.L > 0 && S.kk === 0 && S.tl < FADE ? 1 - k.ease(S.tl / FADE) : 0;
    const n = S.kk > 0 ? S.kk : fadePrev > 0 ? PASS.length : 0;
    const rowA = live * (S.kk > 0 ? 1 : fadePrev);

    // ---- the Order-W40 tile brightens on each pass ----------------------------------------------------
    if (!S.still && S.kk > 0 && S.since < FLASH) {
      const [x, y] = tileXY(0);
      k.rect(x, y, TILE.w, TILE.h, { fill: P.sel, r: 16, alpha: live * 0.5 * (1 - k.ease(S.since / FLASH)) });
    }

    // ---- the edited-by row ----------------------------------------------------------------------------
    if (n <= 0 || rowA <= 0) return;
    const x0 = STATUS.x + k.measure(EDITED, 'mono', 32, 500) + 16;
    const s = STATUS.av, g = STATUS.gap;
    const fresh = S.still || S.kk === 0 ? 1 : k.settle(S.since);
    for (let j = 0; j < n; j++) {
      const isNew = !S.still && S.kk > 0 && j === n - 1;
      k.avatar(ORDER[j], NAMES[j], x0 + s / 2 + j * (s + g), AV_Y, s, { alpha: rowA, fresh: isNew ? fresh : undefined });
    }
    if (n >= PASS.length) {
      const cp = S.kk > 0 ? k.checkP(S.since, S.still) : 1;
      const cx = x0 + n * (s + g) - g + 16 + 18;
      k.glyph('check', cx, AV_Y, { size: 36, w: 4.5, p: cp, color: P.green, alpha: rowA });
      k.mono('saved', cx + 18 + 14, STATUS.base, { size: 32, color: P.ink2, alpha: rowA * cp });
    }
  },
};
