// FIX-PLAN-R5 F6 — the card document atlas (client brief item 6: the cards people carry and pin hold real work).
// One 512 x 512 canvas, 4 x 3 cells of 128 x 168 (0 px gutters), cells 0..11 = CARD_DOCS (12 docs, no spare;
// FIX-PLAN-R6 F2 added key and file in cells 10 and 11).
// Each cell is a small window in the app family of kit.js: a 4 px g-700 edge band, a paper-white fill (the card's
// paper colour multiplies it, so one atlas serves night and day), a 4 px title bar with three 2 px dots, and
// glyph-free content in PALETTE.card neutrals, plus at most one g-600 marker (sheet, decision). Never the accent.
// No text, no glyphs: MIN_TEXT does not apply. Integer coordinates throughout; arcs only for the photo's
// hill and sun. Minimum feature 3 px (the title-bar dots are the plan's 2 px), so a 34 x 45 px card still reads.
// Colour comes only from PALETTE.card (kit.js); this file carries no colour literal.
import { PALETTE } from './kit.js';

export const CARD_DOCS = ['note', 'invoice', 'kanban', 'sheet', 'receipt', 'decision', 'chart', 'photo', 'checklist', 'memo', 'key', 'file']; // 12
export const CARD_ATLAS = { cols: 4, rows: 3, cellW: 128, cellH: 168, W: 512, H: 512 }; // cell i at (i%4, floor(i/4))

// Texture UV of cell i, for a THREE.CanvasTexture with the default flipY = true: canvas row 0 is the TOP of the
// canvas, which flipY maps to v = 1, so a cell's bottom edge sits at v0 = 1 - (row + 1) * cellH / H and the cell
// spans [u0, u0 + du] x [v0, v0 + dv]. If a binding sets flipY = false, use v0' = row * cellH / H instead.
export function cardCellUV(i) {
  const { cols, cellW, cellH, W, H } = CARD_ATLAS;
  const col = i % cols, row = Math.floor(i / cols);
  return { u0: (col * cellW) / W, v0: 1 - ((row + 1) * cellH) / H, du: cellW / W, dv: cellH / H };
}

// content box, cell-local: x 12..116, y 16..156 (104 x 140)
const CX = 12, CY = 16;

// Each drawer gets (g, C, bar, ox, oy) where bar(x, y, w, h, colour) fills a rect in content-box coords; arcs and
// paths use absolute ox + CX + x, oy + CY + y.
const DRAW = {
  note(g, C, bar) {
    [104, 96, 100, 88, 56, 40].forEach((w, k) => bar(0, 8 + 20 * k, w, 3, C.ink2));
  },
  invoice(g, C, bar) {
    bar(0, 4, 56, 10, C.ink1);
    for (let k = 0; k < 4; k++) {
      const y = 30 + 18 * k;
      bar(0, y, 60, 3, C.ink2);
      bar(80, y, 24, 3, C.ink2);
    }
    bar(0, 104, 104, 3, C.ink3);
    bar(56, 116, 48, 8, C.ink1);
  },
  kanban(g, C, bar) {
    [3, 2, 3].forEach((n, c) => {
      const x = 37 * c;
      bar(x, 4, 30, 4, C.ink2);
      for (let k = 0; k < n; k++) {
        const y = 14 + 28 * k;
        bar(x, y, 30, 22, C.ink3);
        bar(x + 4, y + 6, 18, 3, C.ink2);
      }
    });
  },
  sheet(g, C, bar) {
    bar(1, 6, 102, 128, C.ink3);                  // the grid area; 3 px lines remain between interiors
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 6; c++) {
        if (r === 0 || c === 0) continue;         // header strip + row gutter keep the ink3 fill
        const x = 1 + 17 * c, y = 6 + 16 * r;
        bar(x + 3, y + 3, 14, 13, c === 3 && r === 4 ? C.mark : C.paper);   // the one marker: col 3, row 4
      }
    }
  },
  receipt(g, C, bar) {
    bar(40, 2, 24, 6, C.ink1);
    for (let k = 0; k < 7; k++) {
      const y = 14 + 12 * k;
      bar(22, y, 30, 3, C.ink2);
      bar(70, y, 12, 3, C.ink2);
    }
    for (let x = 22; x < 82; x += 10) bar(x, 98, Math.min(6, 82 - x), 3, C.ink3);   // dashed rule, 6 on / 4 off
    bar(22, 110, 20, 6, C.ink1);
    bar(64, 110, 18, 6, C.ink1);
  },
  decision(g, C, bar) {
    [104, 92, 64].forEach((w, k) => bar(0, 8 + 20 * k, w, 3, C.ink2));
    bar(0, 84, 24, 24, C.mark);                   // g-600, never the accent
    bar(34, 93, 56, 6, C.ink1);
  },
  chart(g, C, bar) {
    [40, 64, 52, 88, 104].forEach((h, k) => bar(22 * k, 130 - h, 14, h, C.ink2));
    bar(0, 130, 104, 3, C.ink1);
  },
  photo(g, C, bar, ox, oy) {
    const x0 = ox + CX, y0 = oy + CY;
    bar(0, 4, 104, 80, C.ink3);
    g.save();
    g.beginPath();
    g.rect(x0, y0 + 4, 104, 80);
    g.clip();
    g.beginPath();
    g.moveTo(x0, y0 + 84);
    g.quadraticCurveTo(x0 + 60, y0 + 20, x0 + 104, y0 + 84);
    g.closePath();
    g.fillStyle = C.ink2;
    g.fill();
    g.restore();
    g.beginPath();
    g.arc(x0 + 78, y0 + 22, 9, 0, Math.PI * 2);
    g.fillStyle = C.paper;
    g.fill();
    bar(0, 98, 80, 3, C.ink2);
    bar(0, 112, 52, 3, C.ink2);
  },
  checklist(g, C, bar) {
    [64, 72, 56, 68].forEach((w, k) => {
      const y = 10 + 30 * k, done = k === 0 || k === 2;
      bar(0, y, 14, 14, C.ink2);
      bar(3, y + 3, 8, 8, C.paper);
      if (done) bar(3, y + 3, 8, 8, C.ink1);      // checked: interior filled, no glyph
      bar(24, y + 5, w, 3, done ? C.ink3 : C.ink2);
    });
  },
  memo(g, C, bar) {
    bar(0, 4, 72, 8, C.ink1);
    [104, 100, 104, 96, 60].forEach((w, k) => bar(0, 28 + 18 * k, w, 3, C.ink2));
  },
  key(g, C, bar, ox, oy) {
    const x0 = ox + CX, y0 = oy + CY;
    g.beginPath();
    g.arc(x0 + 52, y0 + 44, 16, 0, Math.PI * 2);  // bow ring, stroke 6: outer r 19, so its bottom is y 63
    g.lineWidth = 6;
    g.strokeStyle = C.ink1;
    g.stroke();
    bar(49, 63, 6, 55, C.ink1);                   // blade, x 49..55, y 63..118
    bar(55, 98, 14, 6, C.ink1);                   // two teeth on the right
    bar(55, 110, 14, 6, C.ink1);
  },
  file(g, C, bar, ox, oy) {
    const x0 = ox + CX, y0 = oy + CY;
    bar(20, 8, 48, 3, C.ink2);                    // outline x 20..84, y 8..104, stroke 3, 16 px folded corner
    bar(20, 8, 3, 96, C.ink2);
    bar(20, 101, 64, 3, C.ink2);
    bar(81, 24, 3, 80, C.ink2);
    g.lineWidth = 3;
    g.lineCap = 'square';
    g.lineJoin = 'miter';
    g.strokeStyle = C.ink2;
    g.beginPath();
    g.moveTo(x0 + 68, y0 + 9);                    // the fold diagonal
    g.lineTo(x0 + 83, y0 + 24);
    g.stroke();
    bar(66, 8, 3, 17, C.ink2);                    // the folded flap, an inner corner L
    bar(66, 22, 18, 3, C.ink2);
    bar(32, 40, 40, 4, C.ink3);                   // three text bars
    bar(32, 56, 40, 4, C.ink3);
    bar(32, 72, 28, 4, C.ink3);
    bar(51, 110, 3, 12, C.ink2);                  // export chevron: stem + arms
    g.beginPath();
    g.moveTo(x0 + 45, y0 + 114);
    g.lineTo(x0 + 52.5, y0 + 121.5);
    g.lineTo(x0 + 60, y0 + 114);
    g.stroke();
    g.lineCap = 'butt';
    g.lineJoin = 'miter';
  },
};

export function drawCardAtlas(canvas) {
  const cv = canvas || document.createElement('canvas');
  const { cols, rows, cellW, cellH, W, H } = CARD_ATLAS;
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d');
  const C = PALETTE.card;
  g.clearRect(0, 0, W, H);
  g.fillStyle = C.edge;
  g.fillRect(0, 0, W, H);                         // every cell's 4 px edge band + the unused strip y 504..512
  for (let i = 0; i < cols * rows; i++) {
    const ox = (i % cols) * cellW, oy = Math.floor(i / cols) * cellH;
    g.fillStyle = C.edge; g.fillRect(ox, oy, cellW, cellH);
    g.fillStyle = C.paper; g.fillRect(ox + 4, oy + 4, cellW - 8, cellH - 8);
    g.fillStyle = C.ink3; g.fillRect(ox + 4, oy + 4, cellW - 8, 4);          // title bar
    g.fillStyle = C.ink1;
    for (const x of [8, 12, 16]) g.fillRect(ox + x, oy + 5, 2, 2);          // three 2 px dots
    const draw = DRAW[CARD_DOCS[i]];
    if (!draw) continue;                          // every cell 0..11 has a drawer; guard kept for safety
    const bar = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(ox + CX + x, oy + CY + y, w, h); };
    draw(g, C, bar, ox, oy);
  }
  return cv;
}
