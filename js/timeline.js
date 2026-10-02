// LENS — timeline.js. Owner: E-timeline ("look", REWORK-01).
// Pure: scroll position -> scene state. No DOM, no THREE. Deterministic; a new object per call.
// Numbers: REWORK-01-DIRECTOR §1.1 (WALL, TABLE), §1.2 (State: cast.traffic, no packets, no yaw), §3.1
// (KEYS must equal tools/fit-keys-collab.json), DIRECTOR-NOTES B.5 (pane opacity), B.13 (face brightness),
// SM-6/11 (thread base, face blend).

// The glass work-wall (wall-local: origin on the floor under the wall centre, +z = the people's side).
export const WALL = { W: 3.4, H: 2.1, Y0: 0.55, Y1: 2.65, YC: 1.60, T: 0.03, EDGE: 0.018, LEG: 0.018,
                      FACE_W: 3.28, FACE_H: 2.05 };
// The long shared table in front of wall 04 (TABLE.wall = 3). w is 2.7, not 3.0: see REWORK-01-DIRECTOR §1.1.
export const TABLE = { wall: 3, x: 0, z: 0.95, w: 2.7, d: 0.70, top: 0.42, t: 0.05, leg: 0.04 };
// FIX-PLAN-R5 S3: the thread lies on the floor, one hairline above the rail channel (RAIL_H .01), and runs the whole
// floor: from THREAD_PF in front of wall 01 to THREAD_PB past wall 06 (objects.js fades both ends into the fog).
export const THREAD_Y = 0.014;
export const PANE_Y = WALL.YC;         // compat alias only; new code reads WALL.YC
export const paneZ = (i, S) => -i * S;
export const THREAD_PF = 5.0;
export const THREAD_PB = 8.0;
// Fraction along the thread (front -> back) at which wall i sits. Thread runs z +PF .. -(5S+PB).
export const paneFrac = (i, S) => (THREAD_PF + i * S) / (5 * S + THREAD_PF + THREAD_PB);

// ---- helpers --------------------------------------------------------------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (f) => f * f * f * (f * (f * 6 - 15) + 10); // smootherstep
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const bump = (x, c, w) => 1 - smoothstep(0, w, Math.abs(x - c));
const DEG = Math.PI / 180;

// ---- keys (index = pos): REWORK-01-DIRECTOR §3.1, fit-checked by tools/fit-collab.mjs ---------------
// fog = [near offset, day far, night far] (stage.js pass()). FIX-PLAN-R2 S6: the hero and the cut get a short day
// far, so walls 05-06 sit back into the white; the holds and the overview keys keep theirs.
// FIX-PLAN-R3 S2.5: day far 18 -> 30, swept 11-36 with _dev/r6-hero-contrast.mjs at 1440x900 pos 0 on the final K0
// (mean hairline contrast of walls 04-06 / wall 01's, gate 45-55 %): 16 32 %, 18 35 %, 20 40 %, 22 43 %, 24 44 %,
// 26 46 %, 28 48 %, 30 49 %, 32 51 %, 36 54 %. The plan's 11-16 assumed the old hero camera (d 17.2); the new K0
// (focusT .20, h 1.85, d 12.1) stands 5 u closer, so walls 04-06 already sit deep in the fog relative to wall 01 and
// 11-16 over-recede them (32 % and below: blank, not haze). 30 is mid-band. Shared with K1 (the cut's day half).
const FOG_HOLD = [1.5, 30, 22];
const FOG_WIDE = [-4, 40, 26];
const FOG_DAY = [-4, 30, 26];
// FIX-PLAN-R5 S7.1 (REWORK-03 item 7, "no swoop"): ONE tour key for all six holds. Between two holds the camera is a
// pure translation along -z by one wall spacing: the same height, azimuth, elevation, lens and screen placement at every
// hold, so the held wall stays in the same screen rect and the next wall is revealed in place (S7.4 crossfade), with
// nothing that grows from small, slides or turns. The per-wall camera ideas (FIX-PLAN-R2 S5), the push-through along
// the thread (R1 S7, R3 S1.1/S1.6, R4 S4.2/S4.3) and DN 4 are retired (FIX-PLAN-R5 §0.2.5).
// Why the numbers (§0.2.1-2): for the next wall to be at >= 95 % of its hold width before it takes over, the hold
// distance must be >= ~10 spacings. The crews need spacing >= 2.0 (wall 04's pair stands 1.62 in front of its glass),
// so d >= ~19-20 u, and holding the round-4 wall size at that distance takes a long lens: fov 12 (landscape), 11
// (portrait): d = radius / (h tan(fov / 2)) = 19.0 u at desk h 1.00, 18.9 at 390. In a straight dolly the held wall
// drifts by about S e sin(az) / (view width), so the angle is constant and shallow: az 10 / el 3 landscape, az 6 / el 3
// portrait (azM / elM; stateAt picks by aspect). fx is 0: the lens frames the wall, not a pair.
// desk / mob: fit-swept with tools/fit-collab.mjs (desk h .95-1.02 x cy .52-.58, mob s 1.05-1.15 x cy .38-.44) for the
// one shared key at 1440, 1280, 1920, 390, 375 and 768; the result and its margins are in BUILD-REPORT for round 5.
const TOUR = {
  focusY: 1.15, radius: 2.0, fx: 0, spacing: 2.0,
  az: 10, el: 3, fov: 12,          // landscape
  azM: 6, elM: 3, fovM: 11,        // portrait
  desk: [0.32, 0.55, 1.00], mob: [0.50, 0.40, 1.15], fog: FOG_HOLD,
};
const tourKey = (i) => ({ ...TOUR, focusT: i / 5, desk: TOUR.desk.slice(), mob: TOUR.mob.slice(), fog: TOUR.fog.slice() });

export const KEYS = [
  // K0 hero: the working floor, day, and one hand-off as its subject (FIX-PLAN-R3 S2.1). focusT .4 -> .20: the focus
  // sits just behind wall 01, so walls 01-02 and their crews fill the lower right and walls 05-06 run off top right.
  // desk [.76,.50,1.30] -> [.78,.56,1.85], swept cx .70-.80, cy .50-.62, h 1.45-2.10 (tools/fit-collab.mjs): the
  // plan's h cap 1.60 gives Lim and courier-a 12.5 % of the height, under the 13 % gate (1.66 is the first to clear
  // it, 13.0 %, and the hand-off still did not read at a 320 px thumbnail). At cx .78 the H1 gutter does not bind
  // (150 / 133 / 322 px at 1440 / 1280 / 1920, floor 70); what binds is the right edge: past 1.85 walls 02-04 and
  // their crews crop there. 1.85 (rendered): Lim 14.6 %, courier-a 15.0 %, walls 05-06 exit top right. mob [.62,.675,1.53] -> [.65,.72,2.34]: the smallest scale that puts the pair
  // at >= 76 css px at 390x844 (78 / 82 px); the deck top is 51 / 37 px under the proof lines at 390 / 375, wall 01
  // 37 / 35 px in from the left. stage.js reads KEYS[0] directly.
  // Stage manager R3: el 16 -> 12. At 16 the wall-02 hand-off pair (staff, B) stood with their heads behind the bottom
  // edge of wall 01's "212 pages" note at 1440 and 390 (torsos and a card, no heads). A lower lens drops the rear
  // crew's heads below that edge; fit unchanged in kind (pair 15.2 / 15.5 %, H1 gutter 142 / 126 / 402 px, 390 pair
  // 82 / 86 px).
  { focusT: 0.20, focusY: 1.2, radius: 6.4, az: 26, el: 12, azM: 26, elM: 12, fov: 32, fovM: 44, spacing: 2.0,
    desk: [0.78, 0.56, 1.85], mob: [0.65, 0.72, 2.34], fog: FOG_DAY.slice() },
  // K1 the cut: night arrives. desk cx .37 -> .33 (FIX-PLAN-R1 S12 m2). mob [.56,.36,1.45] -> [.62,.36,1.30]
  // (FIX-PLAN-R3 S5.4): wall 01 47 / 45 css px in from the left at 390x844 / 375x812 (it was cut by the edge).
  { focusT: 0.5, focusY: 1.2, radius: 6.4, az: 18, el: 9, azM: 18, elM: 9, fov: 32, fovM: 44, spacing: 2.0,
    desk: [0.33, 0.55, 1.20], mob: [0.62, 0.36, 1.30], fog: FOG_DAY.slice() },
  // K2..K7 the six walls, one at a time, all on the one TOUR key (FIX-PLAN-R5 S7.1): camera numbers identical for all
  // six holds; only focusT steps by one spacing.
  tourKey(0), tourKey(1), tourKey(2), tourKey(3), tourKey(4), tourKey(5),
  // K8 together: the climax (FIX-PLAN-R1 S10). Lower and closer, so the six crews read as one floor at work.
  // Fit (tools/fit-collab.mjs, 1440x900): desk cx .30 -> .335 (stage manager R2): the P5 rail pill (css x 17-78) sat
  // on wall 01's title ("ny we exist"); all six walls now start right of the pill (x 97 px), deck x <= .59. mob (FIX-PLAN-R2 m16) [.55,.28,1.00] ->
  // [.70,.275,1.46]: the deck fills the slot between the rail pill (css y 138) and the Together card (475) at 390x844,
  // 37 % of the height; the plan's [.55,.33,1.20] gave 27 %. The deck is wider than the phone at this height: wall 01
  // keeps 16 px on the left and the far ends of walls 05-06 crop at the right.
  { focusT: 0.40, focusY: 1.0, radius: 6.4, az: 30, el: 12, azM: 30, elM: 12, fov: 30, fovM: 44, spacing: 2.4,
    // FIX-PLAN-R4 S3: mob s 1.46 -> 1.45; the walkers are agents now (deeper boxes), the deck ended 1 px into the
    // Together card's 8 px clearance at 390x844.
    desk: [0.335, 0.56, 1.17], mob: [0.70, 0.275, 1.45], fog: FOG_WIDE.slice() },
  // K9 close: the build-2 K8 overview; on a phone the deck sits in css y 140-480, above the close card
  { focusT: 0.5, focusY: 1.2, radius: 6.4, az: 40, el: 22, azM: 40, elM: 22, fov: 30, fovM: 44, spacing: 2.4,
    desk: [0.359, 0.474, 0.94], mob: [0.55, 0.30, 1.05], fog: FOG_WIDE.slice() },   // mob [.52,.37,1.00] fit: deck css y 168-456 at 390
];

// The thread re-lights front -> back over RELIGHT_A..RELIGHT_B. The brief said 8.4, but pos 8 is the
// TOGETHER hold (pos is constant while it lasts), so a re-light ending at 8.4 leaves panes 5 and 6 unlit
// (list rows 5 and 6 'ahead') for the whole "Six layers. One team." frame. Every other 7.5..8 ramp
// (wall presence, face brightness) already ends at 8, so the thread ends there too.
// To restore the brief's numbers: RELIGHT_B = 8.4 and FLARE_W = 0.075.
const RELIGHT_A = 7.5, RELIGHT_B = 8.0, FLARE_W = 0.12;

// Face dimming at the hero (FIX-PLAN-R1 S9, FIX-PLAN-R2 S6): a depth hierarchy, wall 01 reads and each wall behind
// it steps back further, until the cut.
// FIX-PLAN-R3 S7.3 (M7): walls 04-06 were .05/.03/.02 (blank rear walls). Their day canvases are now drawn LOD by
// stage.js (FIX-PLAN-R3 contract 0.3.1: paper notes, pins and pair marks, no words), so they come back to .45/.40/.35
// and read as notes in haze with nothing legible; the step back is carried by FOG_DAY and the alpha ramp.
const FACE_A0 = [0.85, 0.80, 0.50, 0.45, 0.40, 0.35];

// The cut (FIX-PLAN-R2 S7): on landscape the deck's screen x leaves the hero copy early, over p S7_A .. S7_A + S7_L,
// so no figure meets the intro copy as it rises. Continuous at p 0 and 1 (the ramp is flat at both ends).
const S7_A = 0.10, S7_L = 0.45;

const SCALARS = ['focusT', 'focusY', 'radius', 'az', 'el', 'azM', 'elM', 'spacing'];
const lerpArr = (A, B, e) => A.map((v, i) => lerp(v, B[i], e));

// FIX-PLAN-R5 S7.4 entry: the lens is interpolated in log tan(fov / 2), so the frame's scale changes geometrically
// (an identity when the two keys share a lens, as every tour pair does).
const lerpFov = (a, b, e) => (a === b ? a
  : 2 * Math.atan(Math.exp(lerp(Math.log(Math.tan(a * DEG / 2)), Math.log(Math.tan(b * DEG / 2)), e))) / DEG);

// FIX-PLAN-R5 S7.4 the layer crossfade (replaces the round-4 pane rule, its deck blend and the rear-face dim). Walls by
// index 0-5 (the plan's "wall 00-05"). In transit k -> k+1 (2 <= k < 7), with f = p - k, the leaving wall k-2
// dissolves over f .26-.50 and the arriving wall k-1 over f .48-.74 (stage manager R5; the plan had e .32-.52 / .48-.68), in place: the camera only dollies, so each is at (or within 5 % of) its hold size and screen rect while it is up. Every other wall
// is 0, so at a hold no rear wall, rear face or rear crew shows through the glass. A wall is "held" while o >= .5.
// STAGE MANAGER R5 (client: "if you scroll it fast it looks very jarring"): the windows are on the raw transit fraction
// f = p - k, not on e. The plan's e .32-.52 / .48-.68 sat on the steepest stretch of the smootherstep (de/df 1.875), so
// each wall dissolved over only f .40-.50 / .50-.60: 83 ms per wall at the 1.2 layers / s cap, a blink. On f the leaving
// wall dissolves over .26-.50 and the arriving one over .48-.74: 200 / 217 ms each at the cap, 2.4-2.6x softer, with a
// short dark beat between (both < .1 over f .45-.53). LEAVE_B stays at .50: the leaving wall has grown 1.058x by then
// (e .5) and the bar gate caps any wall above presence .02 at 1.06x (a later end, .54, gave 1.062x at .02-.04).
// Held frames get narrower in e (leaving held to f .38 = e .28, arriving from f .61 = e .70; the plan's were .42 / .58),
// so the width and drift gates only get easier. The crews never overlap: the leaving crew has stepped out (presence
// < .30) by f .41 and the arriving one steps in (> .30) from f .57. Copy k+1's arrival gate (main.js, k + .45 .. k + .75)
// brackets the arriving wall's .48-.74.
// SHOWRUNNER R5 ship check: the windows above left an empty dark frame over f .45-.53 (pos 2.5 shot = black), which
// reads as a blink at normal scroll. The two dissolves now overlap into one crossfade, so some wall is always up.
// SHOWRUNNER 2026-10-02 (client: a fast scroll down "still messes up"; critic gate): leave .32-.57 / arrive .38-.66.
// The two dissolves overlap so the frame never drops below ~.58 of a wall (the R5 windows left a black beat at f .5),
// while the leaving wall is under presence .5 by f ~.45 and gone by .57, so the held wall stays within the +-5 % width /
// 3 % drift gates. r9-glide ruling (c): the leaving wall may reach 1.07x while it dissolves (1.069x at presence ~.03).
const LEAVE_A = 0.32, LEAVE_B = 0.57, ARRIVE_A = 0.38, ARRIVE_B = 0.66;
// entry (1 -> 2): walls 1-5 go before the lens changes (wall 0 stays at 1); exit (7 -> 8): walls 0-4 return on
// wBack (stage.js adds a projected-size gate on top, so a wall comes back only once it is no bigger than the hold).
const ENTRY_A = 1.10, ENTRY_B = 1.45;
// DIRECTOR R7 (client: "I should not swoop in, make it smoother"): the pull-out's walls 00-04 and the corridor walkers
// come back over BACK_A..BACK_B (was 7.2-7.6). On the tour's long lens every returning wall stands between the lens and
// wall 06 at nearly the hold's size, so a return at 7.2-7.6 stacked four translucent app windows over the Admin panel,
// crews on top of crews (1440 / 390 pos 7.35-7.55), and the walkers stepped in 1.5-2x a crew figure's size while the lens
// was still long (1440 7.6, bottom centre). From 7.45 the view has turned enough that the walls fan out as they arrive,
// and by 7.85 the lens is near K8's, so the walkers step in at deck scale. The re-light (7.5-8.0) still flares each
// wall after it is up.
const BACK_A = 7.45, BACK_B = 7.85;
const NEAR_C = 5.5 * Math.tan(22 * DEG);   // the pull-out's walker near cull, lens-scaled (stateAt trafficNearR)
function paneOpacity(i, p) {
  if (p < 2) return i === 0 ? 1 : 1 - smoothstep(ENTRY_A, ENTRY_B, p);
  if (p >= 7) return i === 5 ? 1 : smoothstep(BACK_A, BACK_B, p);
  const k = Math.floor(p), f = p - k;   // stage manager R5: raw f, not e (see LEAVE_A)
  if (i === k - 2) return 1 - smoothstep(LEAVE_A, LEAVE_B, f);
  if (i === k - 1) return smoothstep(ARRIVE_A, ARRIVE_B, f);
  return 0;
}

// keys: KEYS unless given. tools/fit-collab.mjs passes its JSON keys, so its frames run this exact function (no
// hand-kept mirror to drift); main.js never passes it.
export function stateAt(pos, aspect, keys = KEYS) {
  const p = clamp(Number.isFinite(pos) ? pos : 0, 0, 9);
  const k = Math.min(Math.floor(p), 8);
  const e = ss(p - k);
  const A = keys[k], B = keys[k + 1];

  const c = {};
  for (const f of SCALARS) c[f] = lerp(A[f], B[f], e);
  c.fov = lerpFov(A.fov, B.fov, e);
  c.fovM = lerpFov(A.fovM, B.fovM, e);
  const desk = lerpArr(A.desk, B.desk, e);
  if (k === 0) desk[0] = lerp(A.desk[0], B.desk[0], ss(clamp((p - S7_A) / S7_L, 0, 1)));
  const mob = lerpArr(A.mob, B.mob, e);
  const fog = lerpArr(A.fog, B.fog, e);
  const spacing = c.spacing;
  const baseFx = lerp(A.fx || 0, B.fx || 0, e);   // hold focus x (FIX-PLAN-R2 S5)

  // FIX-PLAN-R5 S7.3: no push-through. In the tour (2 <= p < 7) every key scalar is equal except focusT, so the camera is
  // the plain key lerp: focus.z = -spacing (k - 2 + e), a pure translation along -z at constant height, azimuth,
  // elevation, lens and screen placement. The angle is the aspect's own (S7.2): az / el on landscape, azM / elM on
  // portrait (equal on K0, K1, K8 and K9).
  const land = aspect >= 1;
  // FIX-PLAN-R5 S7.4 entry / exit: where the lens changes (1 -> 2, 7 -> 8), the camera distance
  // d = radius / (h tan(fov / 2)) is interpolated log-linearly for the aspect in use and the radius solved from it, so
  // the held wall's projected width moves one way only (the plain radius lerp dollied out while the lens closed: at 390
  // wall 0 shrank 2.4 px over pos 1.0-1.3 before it grew).
  let radius = c.radius;
  const fA = land ? A.fov : A.fovM, fB = land ? B.fov : B.fovM;
  if (fA !== fB) {
    const hA = (land ? A.desk : A.mob)[2], hB = (land ? B.desk : B.mob)[2], hN = (land ? desk : mob)[2];
    const dA = A.radius / (hA * Math.tan(fA * DEG / 2)), dB = B.radius / (hB * Math.tan(fB * DEG / 2));
    radius = Math.exp(lerp(Math.log(dA), Math.log(dB), e)) * hN * Math.tan((land ? c.fov : c.fovM) * DEG / 2);
  }
  const camera = {
    focus: [baseFx, c.focusY, -5 * spacing * c.focusT],
    radius, az: land ? c.az : c.azM, el: land ? c.el : c.elM, fov: c.fov, fovM: c.fovM,
    screen: land ? desk : mob,
    fog,
  };

  // thread (SM-6): head is the lit fraction front -> back, base the unlit level while it re-runs
  let head, base, intensity;
  if (p < 7.25) { head = 1; base = 1; }
  else if (p < RELIGHT_A) { head = 0; base = lerp(1, 0.2, smoothstep(7.25, RELIGHT_A, p)); }
  else if (p < RELIGHT_B) { head = smoothstep(RELIGHT_A, RELIGHT_B, p); base = 0.2; }
  else { head = 1; base = 1; }
  if (p <= 1) intensity = lerp(0.55, 1, p);
  else if (p < 1.6) intensity = lerp(1, 0.8, smoothstep(1, 1.6, p));
  else if (p < RELIGHT_A) intensity = 0.8;
  else if (p < RELIGHT_B) intensity = lerp(0.8, 1, smoothstep(RELIGHT_A, RELIGHT_B, p));
  else intensity = 1;
  // FIX-PLAN-R3 S4.2 (M2): capped while the cut's ghost faces are up, so no laser runs across the lit notes
  if (p < 1.6) intensity = Math.min(intensity, lerp(0.35, 1, smoothstep(1.3, 1.6, p)));
  // FIX-PLAN-R5 S7.6: the thread lies on the floor now (S3), so there is no push dim and no portrait glide dim.

  // FIX-PLAN-R5 S3: no near fade. The line runs on the floor under the held wall's crew, so nothing between the lens and
  // the held wall is hidden: near is 0 always (objects.js uNear).
  const near = 0;
  // hold clear: at a layer hold the face is the subject, so the line dims a little (objects.js thrK = 1 - .45 clear,
  // FIX-PLAN-R5 S3). The old near weight's tour window is kept here.
  // STAGE MANAGER R5: the dim holds for the whole tour (it was released between holds, 1 - smoothstep(.14, .34, hd)).
  // Released, the line jumped .55 -> 1.0 exactly while the two walls cross-dissolved, so every transit's dark beat was a
  // bright green diagonal slash from the bottom corner to the old wall's feet (390 3.37-3.56, 1440 5.46-5.55): a flash,
  // the "swoosh" the client flagged. Held steady, the line is the one constant in the frame from wall to wall; it comes
  // back to full over the pull-out (7.3-7.8), with the re-light.
  const tourW = smoothstep(1.25, 1.85, p) * (1 - smoothstep(7.3, 7.8, p));
  const clear = tourW;

  const relight = p >= RELIGHT_A && p < RELIGHT_B;
  const wFace = smoothstep(1, 1.6, p);
  const wAll = smoothstep(7.2, 7.6, p);    // FIX-PLAN-R3 S8.1: was 7.5-8; RELIGHT stays 7.5-8.0, the only timed reveal

  const panes = [];
  let active = -1, listLive = -1;
  for (let i = 0; i < 6; i++) {
    const d = p - (i + 2);
    const o = paneOpacity(i, p);   // FIX-PLAN-R5 S7.4

    const layerF = 0.45 + 0.55 * (1 - smoothstep(0.15, 0.6, Math.abs(d)));
    let face = p <= 1 ? 0.7 : lerp(0.7, layerF, wFace);
    face = lerp(face, 1, wAll);

    const frac = paneFrac(i, spacing);
    const flare = relight ? bump(head, frac, FLARE_W) * smoothstep(0, 0.1, head) : 0; // eased in so pane 0 starts at 0
    if (relight && frac <= head) listLive = i;

    if (Math.abs(d) < 0.15) active = i;
    // FIX-PLAN-R5 S7.4: no rear-face dim: a rear wall is at 0 at every hold
    const faceA = lerp(FACE_A0[i], 1, smoothstep(0.6, 1.6, p));
    panes.push({ opacity: o, yaw: 0, face, faceA, flare });   // walls are architecture: no yaw drift
  }
  if (p >= RELIGHT_B) listLive = 5;
  else if (!relight) listLive = -1;

  // progress rail
  const rail = [];
  if (p < 1.6) for (let i = 0; i < 6; i++) rail.push('ahead');
  else if (p >= 8) for (let i = 0; i < 6; i++) rail.push('done');
  else {
    const cur = clamp(Math.round(p - 2), 0, 5);
    for (let i = 0; i < 6; i++) rail.push(i < cur ? 'done' : i === cur ? 'live' : 'ahead');
  }

  // rim (FIX-PLAN-R2 S11): the fresnel rim sits on one object only, the pair the copy addresses at a layer hold.
  // cast.js rims the named pair of rim.wall with weight w; -1 / 0 at the hero, the cut, Together and the close.
  let rimWall = -1, rimW = 0;
  // FIX-PLAN-R3 S2.3: at the hero the rim is on wall 01's hand-off pair (Lim, courier-a), fading out by .45
  if (p < 0.5) { rimWall = 0; rimW = 1 - smoothstep(0.20, 0.45, p); }
  if (p >= 1.55 && p <= 7.45) {
    const r = Math.round(p);
    rimWall = r - 2;
    rimW = 1 - smoothstep(0.15, 0.45, Math.abs(p - r));
  }

  // corridor traffic (FIX-PLAN-R3 S5.3, S8.2): off through the tour; on portrait it steps out at the very start of the
  // cut (the night half has no room for walkers), and it returns over 7.2-7.6 as the camera pulls back (was 7.5-7.9).
  const off = aspect >= 1 ? smoothstep(1.2, 1.6, p) : smoothstep(0.02, 0.10, p);
  const traffic = 1 - off * (1 - smoothstep(BACK_A + 0.05, BACK_B + 0.05, p));   // director R7: was 7.2-7.6
  // on portrait, walkers within this 3D distance of the lens stay out while it pulls back (cast.js reads it)
  // Stage manager R3: 2.0 -> 5.5. At 390 pos 7.8 the lens is at (5.06, 3.14, 3.21) and the two cube-head walkers over
  // the Together card are 4.8 and 5.0 u from it (nearest point, feet to head), so 2.0 never took them.
  // Stage manager R5: the radius scales with the lens, R = NEAR_C / tan(fov / 2), on both aspects. Round 5's tour lens
  // is long (fov 11-12), so through the pull-out (the lens opens 11 -> 44 / 12 -> 30) a walker 6-12 u off stepped in at
  // 1.5-2x a crew figure's size, bottom centre on a phone (390 pos 7.42-7.62) and bottom left on desktop (1440 7.40-7.60).
  // NEAR_C 2.22 keeps the old 5.5 at the K8 phone lens (fovM 44) and gives 8.3 at the desktop one (fov 30), where the
  // nearest deck walker is further off, so the finished Together deck is unchanged (checked in pixels, pos 8 / 8.5).
  const fovNow = (land ? c.fov : c.fovM) * DEG / 2;
  const trafficNearR = p >= 7.2 && p < 8.6 ? Math.min(NEAR_C / Math.tan(fovNow), 30) : 0;

  return {
    pos: p,   // the clamped scroll position (stage.js S2 reads it)
    camera,
    spacing,
    panes,
    active,
    buildTrigger: active,
    thread: { head, intensity, base, near, clear },
    // corridor walkers (cast.js lanes B/F): on at the deck and overview keys, off for the whole tour; trafficNearR = the
    // portrait near cull radius through the pull-out (S8.2). FIX-PLAN-R5 S7.3: push is 0 always (no push-through), and
    // glide = 1 over the whole tour (p 1.6-7.4) on both aspects: the camera only dollies, cast.js reads presence.
    cast: { traffic, trafficNearR, push: 0, glide: p >= 1.6 && p <= 7.4 ? 1 : 0, rim: { wall: rimWall, w: rimW } },
    flash: 0, // DN 5: the stage computes it from camera distance
    vignette: lerp(0.12, 0.38, clamp(p, 0, 1)),
    night: clamp(p, 0, 1),
    rail,
    listLive,
  };
}
