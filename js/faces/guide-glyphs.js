// LENS guide glyphs (FIX-PLAN-R6 F1, R7 F1-F2). Paints the guide agents' screen frames into a 2048x128 mask atlas,
// 16 slots of 128 px, glyph centre (64, 64) per slot, white on black like cast.js faceAtlas.
//   Slot map: 0-4 floor faces (never touched here), 5 bang "!", 6 tick, 7 thumbs-up, 8 the live count, 9 ask "?", 10-15 spare.
//   Squeeze: the screen plane is 0.26 x 0.20, so a slot stretches 1.3:1 on screen; every glyph is drawn pre-squeezed
//   by 0.77 in x about the slot centre so it reads true. Coordinates below are slot-local, before the squeeze.
// Dependency-free: no imports, no THREE. The stage's font wait loads Geist Mono 500 before paintCount runs.

export const GUIDE_FRAMES = { bang: 5, tick: 6, thumb: 7, count: 8, ask: 9 };
export const GUIDE_COLS = 16;

const SLOT = 128, SQUEEZE = 0.77, COUNT_MAX_W = 110, COUNT_PX_MAX = 64, COUNT_PX_MIN = 22;
const ON = 'rgb(255, 255, 255)', OFF = 'rgb(0, 0, 0)';   // coverage-mask values (the shader samples .r), not colours
const countFont = (px) => `500 ${px}px "Geist Mono", ui-monospace, monospace`;
const atlasOk = (g) => !!(g && g.canvas && g.canvas.width >= GUIDE_COLS * SLOT);

// a rounded bar, fully rounded on its short side (the faceAtlas pill), filled
function pill(g, cx, cy, w, h) {
  const r = Math.min(w, h) / 2, x = cx - w / 2, y = cy - h / 2;
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  g.lineTo(x + w, y + h - r); g.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  g.lineTo(x + r, y + h); g.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  g.lineTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  g.closePath(); g.fill();
}

// a rounded rect with corner radius r, filled (g.roundRect where the browser has it, arcs otherwise)
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  if (typeof g.roundRect === 'function') g.roundRect(x, y, w, h, r);
  else {
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    g.lineTo(x + w, y + h - r); g.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    g.lineTo(x + r, y + h); g.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    g.lineTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    g.closePath();
  }
  g.fill();
}

// clip to slot k, clear it OFF, set the squeezed slot-local frame, run draw(), restore
function inSlot(g, k, draw) {
  const ox = SLOT * k;
  g.save();
  g.beginPath(); g.rect(ox, 0, SLOT, SLOT); g.clip();
  g.fillStyle = OFF; g.fillRect(ox, 0, SLOT, SLOT);
  g.translate(ox + SLOT / 2, 0); g.scale(SQUEEZE, 1); g.translate(-SLOT / 2, 0);
  g.fillStyle = ON; g.strokeStyle = ON; g.lineCap = 'round'; g.lineJoin = 'round';
  draw();
  g.restore();
}

export function paintGuideGlyphs(g) {
  if (!atlasOk(g)) return;
  inSlot(g, GUIDE_FRAMES.bang, () => {
    pill(g, 64, 51, 16, 50);                              // bar x 56-72, y 26-76
    g.beginPath(); g.arc(64, 96, 9, 0, Math.PI * 2); g.fill();
  });
  inSlot(g, GUIDE_FRAMES.tick, () => {
    g.lineWidth = 11;
    g.beginPath(); g.moveTo(36, 66); g.lineTo(56, 86); g.lineTo(94, 42); g.stroke();
  });
  inSlot(g, GUIDE_FRAMES.thumb, () => {
    roundRect(g, 50, 58, 40, 34, 8);                      // fist
    g.fillRect(36, 58, 12, 34);                           // cuff
    g.translate(71, 57); g.rotate(-12 * Math.PI / 180);   // thumb: base (71, 57), top lands at about (63.9, 23.7)
    pill(g, 0, -11, 14, 46);   // the visible 14 x 34 bar, rooted 12 px into the fist so the base cap leaves no notch
  });
  inSlot(g, GUIDE_FRAMES.ask, () => {
    g.lineWidth = 11;                                     // one stroke: the hook over the top, then the stem
    g.beginPath(); g.arc(64, 46, 20, -160 * Math.PI / 180, 60 * Math.PI / 180, false);
    g.lineTo(64, 76); g.stroke();                         // from the arc end, about (74, 63.3), down to the stem foot
    g.beginPath(); g.arc(64, 96, 9, 0, Math.PI * 2); g.fill();   // the dot, the same as bang's
  });
}

// the font px paintCount would choose for text: 64 down to 22 until the squeezed advance fits 110 px. Faces manager R7:
// 116 left the widest counts ('109,000+', '\u221260%') about 6 atlas px off the bezel; 110 leaves about 9 (a screen's
// margin, not a sticker's). '109,000+' lands at 29 px (floor 28).
export function countFontPx(g, text) {
  if (!g) return 0;
  const s = String(text);
  g.save();
  let px = COUNT_PX_MAX;
  for (; px > COUNT_PX_MIN; px--) {
    g.font = countFont(px);
    if (g.measureText(s).width * SQUEEZE <= COUNT_MAX_W) break;
  }
  g.restore();
  return px;
}

// paintCount draws text at the px fit would get (fit defaults to text), so a count keeps one digit size from 0 to its
// final string ("0" ... "109,000+" all at the "109,000+" px). Returns that px.
// U+2212: no mapping. Measured 2026-10-02 in headless Chromium, Geist Mono 500 64 px: '\u2212' advance 38.399 = Geist '0'
// 38.399, vs the ui-monospace fallback 38.406, with its own ink box (Geist's Google Fonts latin subset lists U+2212).
export function paintCount(g, text, fit = text) {
  if (!atlasOk(g)) return 0;
  const s = String(text);
  const px = countFontPx(g, String(fit ?? text));
  inSlot(g, GUIDE_FRAMES.count, () => {
    g.font = countFont(px);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const capH = g.measureText('0').actualBoundingBoxAscent || 0.72 * px;
    // centred on fit's ink, not its advance ('\u2212' and '%' sit off-centre in their cells): one offset for every string
    // of the count, so same-length strings never shift as the digits change
    const m = g.measureText(String(fit ?? text));
    const dx = Number.isFinite(m.actualBoundingBoxLeft) && Number.isFinite(m.actualBoundingBoxRight)
      ? (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2 : 0;
    g.fillText(s, Math.round(64 + dx), Math.round(64 + capH / 2));   // digit cap centred on the slot
  });
  return px;
}
