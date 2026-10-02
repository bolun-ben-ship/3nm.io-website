// LENS — the per-wall event clock, faces side. REWORK-01-DIRECTOR §6.2 (binding), pure, no THREE.
// The stage passes `opts.beat = cast.beat(i, t)`; wrapFace() falls back to beatAt() when it does not
// (the harness, a stage without a cast, the day canvases). Both must agree, so the numbers below are
// copied verbatim from the director's tables. cast.js may import them from here instead of redefining.
//
// beat → { tl, n, since, kind, spk, span }
//   tl     scene time in [0, SCENE_T[i])            (reduced: STILL[i])
//   n      events so far, monotonic across loops    (reduced: 0)
//   since  seconds since the last event, wrapping    (reduced: 99)
//   kind   kind of the last event: 'hand'|'pin'|'pass'|'row'|'decide'|'propose'
//   spk    wall 03: Marcus-group speaker node 0..3 (0 = Marcus, 1 = S1, 2 = S2, 3 = S3); else -1
//   span   wall 01: { kind: 'write', p: 0..1 } inside a write span, else null

export const SCENE_T = [14, 12, 12, 14, 6, 14];
export const SCENE_OFF = [3.6, 3.1, 6.7, 1.9, 0.8, 9.4];
export const STILL = [5.9, 3.3, 6.1, 4.6, 0.8, 6.2];

// (te, kind): te is the touch, the landing in a hand, or the landing at a neighbour.
export const EVENTS = [
  [[6.3, 'hand'], [13.3, 'hand']],
  [[5.1, 'pin'], [10.3, 'pin']],
  [[3.6, 'pin'], [6.5, 'hand']],
  [[2.2, 'pass'], [5.0, 'pass'], [7.8, 'pass'], [10.6, 'pass'], [12.8, 'pass']],
  [[2.6, 'row'], [5.0, 'row']],
  [[5.9, 'decide'], [12.5, 'propose']],
];

// Wall 03, Marcus's group: M 0–3, S1 3–6, M 6–9, S2 9–12 (3 s slots) → speaker node index.
const SPK_SLOTS = [0, 1, 0, 2];
// Wall 01: Lim writes over these scene-time spans.
const WRITE = [[0.3, 2.8], [7.3, 9.8]];

// FIX-PLAN-R2 §0.3.1 / F6: a forward-only clock shift per wall. STAGE grows SHIFT[5] as the camera arrives at
// wall 06 so the decision lands on arrival. It only ever grows, so `n` stays monotonic. The harness never sets it
// (0 = the old clock exactly). Reduced motion ignores it: beatAt reads STILL, and cast.js reads STILL too.
export const SHIFT = new Float64Array(SCENE_T.length);
export function setShift(i, s) {
  if (i >= 0 && i < SHIFT.length && Number.isFinite(s) && s > SHIFT[i]) SHIFT[i] = s;
}

export function sceneTime(i, t) {
  const T = SCENE_T[i];
  return ((t + SCENE_OFF[i] + SHIFT[i]) % T + T) % T;
}

// One reusable result per wall: callers read it synchronously and never keep it.
const OUT = SCENE_T.map(() => ({ tl: 0, n: 0, since: 99, kind: '', spk: -1, span: null }));
const SPAN = SCENE_T.map(() => ({ kind: 'write', p: 0 }));

export function beatAt(i, t, reduced) {
  const o = OUT[i];
  if (!o) return null;
  const T = SCENE_T[i];
  const E = EVENTS[i];
  const tl = reduced ? STILL[i] : sceneTime(i, t || 0);
  let last = -1;
  for (let j = 0; j < E.length; j++) if (E[j][0] <= tl) last = j;
  o.tl = tl;
  if (last >= 0) { o.kind = E[last][1]; o.since = tl - E[last][0]; }
  else { o.kind = E[E.length - 1][1]; o.since = tl + T - E[E.length - 1][0]; }
  if (reduced) { o.n = 0; o.since = 99; }
  else o.n = Math.floor(((t || 0) + SCENE_OFF[i] + SHIFT[i]) / T) * E.length + (last + 1);
  o.spk = i === 2 ? SPK_SLOTS[Math.min(3, Math.floor(tl / 3))] : -1;
  o.span = null;
  if (i === 0) {
    for (let j = 0; j < WRITE.length; j++) {
      const a = WRITE[j][0], b = WRITE[j][1];
      if (tl >= a && tl < b) { SPAN[0].p = (tl - a) / (b - a); o.span = SPAN[0]; break; }
    }
  }
  return o;
}
