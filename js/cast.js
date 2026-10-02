// LENS — js/cast.js (stage team, cast owner). FIX-PLAN-R4 S1/S2/S4.5 (binding) over REWORK-02-CLIENT §1: two species
// built as designer toys at 1 : 5. Six humans lead, thirty small robot agents crew. Every person and agent on the floor,
// their cards, walks, turns, leans, limbs, screen faces and hand-offs; the six wall scenes, the corridor traffic and the
// per-wall event clock (re-exported from faces/beat.js, the single source).
//
// Rules this file keeps:
// - update() is a pure function of (state, t, opts). No integrator state; dt is unused. Same t, same frame.
// - No colour literal lives here. Every colour arrives through THEMES (stage.js) and is converted once.
// - 10 cast InstancedMesh draw calls plus the decal, at fixed capacity. Materials are born in their final form, so a
//   theme switch writes cheap properties only and stage.programs() never changes. FIX-PLAN-R4 adds one program (the
//   human head: skin, hair cap, bun and eyes in one merged mesh); the agent screen keeps its one program.
// - Figures never alpha-blend and never stipple: a figure is whole (aFade 1, scale 1) or gone (zero matrices).
//   FIX-PLAN-R4 §0.2.3: nothing scales about its feet any more (that was a zoom). Decals alone keep alpha.
// - Zero allocation in update() and applyTheme().
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WALL, TABLE, paneZ } from './timeline.js';
import { SCENE_T, SCENE_OFF, STILL, EVENTS, SHIFT, setShift, sceneTime, beatAt } from './faces/beat.js';

export { SCENE_T, SCENE_OFF, STILL, EVENTS, sceneTime };
export function beat(i, t, reduced) { return beatAt(i, t, reduced); }

// ---------------------------------------------------------------------------------------------------------
// constants (FIX-PLAN-R4 S1)
// ---------------------------------------------------------------------------------------------------------
const PI = Math.PI, TAU = Math.PI * 2, DEG = Math.PI / 180;
const NW = 6;
// S1.6: 6 humans, 30 agents (26 on the walls, 4 on the rail), 4 limbs each; cards and one decal per figure
// FIX-PLAN-R5 S4: + acc, one instanced mesh of agent cosmetics (7 single items + 2 gloves + 2 boots)
const CAP = { hb: 6, hh: 6, hl: 24, ab: 30, ah: 30, face: 30, al: 120, card: 32, decal: 40, acc: 11 };

// S1.1 the human torso: a soft pill, wider at the hips ([r, y], feet at y 0), 32 segments, z scale .85
const HUMAN_PROFILE = [[0, 0.14], [0.140, 0.15], [0.165, 0.24], [0.162, 0.33], [0.150, 0.42], [0.138, 0.50],
  [0.118, 0.56], [0.080, 0.600], [0.050, 0.615], [0, 0.62]];
// Limb geometry: one unit capsule per species (radius 1, cylinder CAPS, pivot at its top), scaled per limb: the
// radius goes to x/z and the length to y. The cylinder length is the midpoint of the two limbs' own ratios, so both
// caps stay within ±15 % of round at scale 1.
const CAPS_H = 2.6, CAPS_A = 1.7;
// S1.1 / S1.2 per-species tables. Every reader of a head, hip, shoulder, arm or limb number goes through SPEC.
//   top: head top; hipY/legX/legR: legs; shY/armX/armR/armL: arms (pivot at the capsule top, tip = the hand);
//   headY: head centre; bodyS: torso scale; cadence: leg cycles per second while walking; bob: walk bob amplitude;
//   roll: the walk waddle; cardUp: a carried card's centre above the hand; cardFwd: the sheet's plane ahead of the hand
//   at α 0; cardE0 / cardE1: the sheet's inner edge beyond the fingertip at α 0 / 90 (< 0: the fingers overlap it; see
//   CARD_SWING); decal: contact size;
//   midY: the height the near cull tests; carry/write/slide/point: arm pitches; slideS: arm length factor on a slide.
const SPEC = {
  H: { top: 0.96, hipY: 0.18, legX: 0.070, legR: 0.050, legRoll: 1 * DEG, shY: 0.53, armX: 0.165, armR: 0.040,
    armL: 0.21, armRoll: 8 * DEG, caps: CAPS_H, headY: 0.785, bodyS: [1, 1, 0.85], lean: 5 * DEG,
    walkLeg: 26 * DEG, walkArm: 18 * DEG, cadence: 2, bob: 0.02, roll: 4 * DEG, cardUp: 0.02, cardFwd: 0.03, cardE0: -0.02, cardE1: 0.02,
    decal: 1, midY: 0.55, carry: 48 * DEG, pin: 145 * DEG, write: 105 * DEG, slide: 60 * DEG, slideS: 1, point: 120 * DEG },
  A: { top: 0.67, hipY: 0.12, legX: 0.065, legR: 0.040, legRoll: 1 * DEG, shY: 0.31, armX: 0.145, armR: 0.032,
    armL: 0.134, armRoll: 18 * DEG, caps: CAPS_A, headY: 0.52, bodyS: [1, 1, 1], lean: 4 * DEG,
    walkLeg: 30 * DEG, walkArm: 24 * DEG, cadence: 1.5, bob: 0.03, roll: 0, cardUp: -0.035, cardFwd: 0.045, cardE0: -0.015, cardE1: 0.02,
    decal: 0.72, midY: 0.40, carry: 70 * DEG, pin: 145 * DEG, write: 100 * DEG, slide: 120 * DEG, slideS: 1.5, point: 120 * DEG },
};
const HUMAN_HEAD_R = 0.175;
const CARD_W2 = 0.08;                           // half the card's width at scale 1 (BoxGeometry .16)
const CARD_S_TOUR = 1.15;                       // the card scale at spacing <= 2.4 (the tour, hero and deck)
const CARD_E_REACH = 0.02;
const CARD_E_SIDE = 0.065;                      // a hand-off: the sheet's plane outside the meeting hands' axis
const CARD_PIN_FWD = 0.08;                      // a pin: the sheet's plane ahead of the pinning hand
const CARD_OUT_LEAD = 0.35, CARD_OUT_LAG = 0.35;   // the sheet slides out this long before the arm rises, in after it falls                      // the sheet's inner edge beyond the fingertips in a reach or pin
// the agent's screen: a plane on the head's front, head-local (S1.2). DEVIATION: .28 x .21 -> .26 x .20. At .28 the
// plane ran past the head's .06 bevel and stood proud of it at 3/4 (turntable crop): a pasted-on card. At .26 the
// rounded rim frames it on every side; G9 sizes still clear the gates (r7-cast-crops).
const FACE_W = 0.26, FACE_H = 0.20, FACE_DY = 0.005, FACE_DZ = 0.141;
// FIX-PLAN-R5 S4 agent cosmetics: 9 of 30 agents wear one item each (a pair counts as one). One merged geometry, every
// vertex tagged aType 0-8; the vertex shader collapses the shapes whose type is not the instance's aSel, so all eleven
// instances are ONE draw call on ONE program (the agent body's step fade and rim, born final). Colours come from
// THEMES acc0-acc5 (the band of the headphones takes the item's second colour, aAlt). Anchors:
//   head: head-local (follows head yaw, pitch and roll); body: the figure root (feet at 0); arm: the arm's tip frame
//   (+y back up the arm); leg: the foot, turned with the body. No head item comes below the screen's top edge
//   (FACE_DY + FACE_H / 2 = .105 head-local) in front of the head; they sit on the head top (y .15) or the side faces.
// Sizes: the plan's numbers were set for a .28 cube head. The built head is .34 x .30 x .28 (legs r .040, arms r .032),
// so the items that must clear it are sized to the built head (DEVIATION, reported): headphone band r .19 (plan .16),
// beanie dome .178 x .155 (plan r .15), boots .095 x .062 x .125 (plan .07 x .05 x .09, narrower than the .08 leg), gloves
// r .042 (plan .034, the arm itself is r .032). Top hat, cap, scarf, tie and bow tie are at the plan's size.
const ACC_T = { hat: 0, cap: 1, beanie: 2, phones: 3, scarf: 4, tie: 5, bow: 6, glove: 7, boot: 8 };
const ACC_CONTRAST_MIN = 1.6;                  // see applyTheme: the chest-item legibility guard (WCAG contrast ratio)
const lumOf = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;   // linear working-space colour
const contrastOf = (a, b) => { const x = lumOf(a) + 0.05, y = lumOf(b) + 0.05; return x > y ? x / y : y / x; };
const ACC_ANCHOR = ['head', 'head', 'head', 'head', 'body', 'body', 'body', 'arm', 'leg'];
// [colour key, second colour key] per type (THEMES acc0 charcoal, acc1 brick, acc2 ochre, acc3 slate, acc4 g-700, acc5 g-200)
const ACC_COL = [['acc0', 'acc0'], ['acc3', 'acc3'], ['acc1', 'acc1'], ['acc0', 'acc5'], ['acc2', 'acc2'], ['acc4', 'acc4'],
  ['acc1', 'acc1'], ['acc2', 'acc2'], ['acc0', 'acc0']];
// who wears what (wall-local figure names). Swaps are logged here.
// SWAP (S5 overlap): W01 courier-a <-> reader. The slanted cap's brim stands .06 proud of the head, and courier-a
// reaches up to Lim's hand .44 away: at the hand-off the brim met Lim's head. The courier wears the beanie (nothing
// proud of the head in front), the reader, who stands and reads, wears the cap.
// SWAP (hidden at the hold): W02 A -> D. From the long lens A stands straight behind B and its head is mostly covered;
// D reads at the front left, facing the lens.
// SWAP (hidden at the hold): W03 S2 -> S1. S2 faces S3 and Marcus, side-on to the lens, so the tie on its chest never
// showed; S1 faces the lens from the back row's right end, unblocked (the director, behind S2, never shows its chest).
// SWAP (hidden at the hold): W03 O1 -> O2. On the portrait lens O1's hands stand behind Marcus at every clock; O2, at
// the back row's left end, shows both.
// SWAP (hidden at the hold): W04 F4 -> F2. F4 works glass-side of the table and the table top covers its neck; F2
// stands camera-side, whole.
const ACC_WEAR = [
  ['W01.courier-a', 'beanie'], ['W01.reader', 'cap'],
  ['W02.D', 'phones'], ['W02.C', 'bow'],
  ['W03.S1', 'tie'], ['W03.O2', 'glove'],
  ['W04.F2', 'scarf'],
  ['W05.runner', 'boot'],
  ['W06.reporter', 'hat'],
];
// S1.5 hand-offs: an agent reaches UP to the human (125°); its nub arm telescopes to meet the hand (DEVIATION, see
// reachSolve). Human reach pitch is clamped to [20°, 100°].
const ARM = { reachMin: 20 * DEG, reachMaxH: 100 * DEG, handUp: 125 * DEG, agentLevel: 95 * DEG, stretchMax: 2.4 };
const ARM_BLEND = 0.25;
const IDLE_LEG = 3 * DEG, IDLE_ROLL = 0.8 * DEG;
// a shorter stride at the tour's tight spacing: x 2/3 while spacing <= 2.0, x 1 from 2.4 up (FIX-PLAN-R3 m4)
const WALK_TIGHT_K = 16 / 24, WALK_LEG_S0 = 2.0, WALK_LEG_S1 = 2.4;
const HEAD_TILT = 6 * DEG;                      // the listening tilt toward an addressee
const TORSO_SHARE = 0.4;                        // humans turn the torso with a look at a person
const AGENT_HEAD_K = 0.6;                       // an agent turns its head 60 % of a look; its eyes do the rest
const EYE_LOOK = 10 * DEG;                      // S1.4: eyes shift when the target is this far off the head's forward
const BREATH_A = 0.012, BREATH_P = 4;           // S1.5 human idle: torso y scale 1 ± .012 over 4 s
const HEADBOB_A = 0.006, HEADBOB_P = 2;         // S1.5 agent idle: head y ± .006 over 2 s
const HAPPY_D = 0.9, BLINK_D = 0.14;            // S1.4
// an idle glance (look frame) every 4-7 s for .6 s, per agent, pure in t: the crew looks about while it works
// (an addition to S1.4's list, below a real look in priority)
const GLANCE_D = 0.6;

// S1.5: a pinned card on the glass (all above WALL.Y0). FIX-PLAN-R5 S5: .74 -> .83 (it spans .71-.95 at the card's 1.15
// scale): the pinning hand's arc as the arm comes down passes .04 in front of the glass below y .66, and swept
// through the lower half of the sheet it had just pinned.
const GLASS_Y = 0.83;
const GLASS_Z = WALL.T / 2 + 0.015;             // 0.03: card back sits just in front of the face plane
const HANDOFF_D = 0.6;
const WALK_ACC = 0.3;                           // trapezoid accelerate / decelerate
const WALK_TURN = 0.3;                          // face the path over 0.3 s at the start of a walk
const PATH_TURN_MIN = 0.4;                      // a 'path' turn runs at least until walk start + 0.4 s
const DIR_CHORD = 0.15;                         // path direction = chord over ±0.15 u (smooth at corners)
const FILLET = 0.28;                            // corner fillet radius on walk polylines
const HEAD_CLAMP = 50 * DEG;
const LOOK_BLEND = 0.4;
const DECAL_W = 0.46, DECAL_D = 0.34, DECAL_Y = 0.003;
const NEAR_H = 0.22, NEAR_3D = 0.35;            // cull a figure only this close to the lens
const CARD_TH = 0.5;                            // card step threshold
const PILE_DY = 0.0175;                         // FIX-PLAN-R5 S5: one pile level (was .0105), x the card scale
const TOUR_TH0 = 0.30, TOUR_THK = 0.40;          // FIX-PLAN-R5 S7.5: tour step thresholds .30 (leftmost) .. .70 (rightmost)
// FIX-PLAN-R2 S1 / R3 S1.3: the push-through cull. While the lens flies (landscape), a figure in front of the lens
// within max(FIG_CULL_R, K·P[5]) + a per-figure jitter is gone, whole. FIX-PLAN-R4 S3.3: K stays 1.10 (the human is
// still .96 tall, so a figure at the radius is the size it was). S4.5: off on the portrait glide.
const FIG_CULL_R = 1.5, FIG_CULL_J = 0.4, FIG_CULL_K = 1.10;
const GLASS_CARD_PAD = 0.6;   // glass cards leave 0.6 u before the figures
const CARD_TEX_W = 64, CARD_TEX_H = 84, CARD_EDGE_PX = 3;   // the paper card's hairline texture
// FIX-PLAN-R3 S2.2: the hero holds wall 01 mid hand-off (Lim -> courier-a, 6.0–6.6). Held while pos < HERO_POS
// (reduced: pos < HERO_POS_R); released forward-only through SHIFT[0].
const HERO_TL = 6.30, HERO_POS = 0.35, HERO_POS_R = 0.5;
const WALKER_TOP = SPEC.H.top;                  // a walker's head top, for the portrait pull-out near cull

// corridor traffic (REWORK-01-DIRECTOR §4.4)
// FIX-PLAN-R4 (r6-legs at K0): lane B 2.05 -> 2.15, lane F 2.45 -> 2.50. The R4 heads (.34 wide) on lane B sat on the
// walls' right legs (x 1.709) at the deck; .35 apart still clears agent-agent .32.
// FIX-PLAN-R5 S5: lane F 2.50 -> 2.62. Passing walkers swing their free arms toward each other (an agent's arm reaches
// .218 off its centre), and .35 apart they met; .47 clears two arms and the .005 proxy pads.
const LANE_B_X = 2.15, LANE_F_X = 2.62;
const LANE_START = 2.2, LANE_STOP = 0.55, LANE_END = 1.2;
const LB_WALK0 = 1.83, LB_DWELL = 1.2, LB_WALK = 2.44, LB_WALKN = 1.94, LB_CYCLE = 23.2;
const LF_CYCLE = 16.0;

// FIX-PLAN-R3 S6 keep-out: no home mark or walk point within ±0.25 u in x of a wall leg (wall-local x ±1.715) for
// z −0.3..+2.0. (FIX-PLAN-R5 S7.3: the push-through and its lanes are gone; the marks keep their R4 places.)
const AISLE_X = -2.00;
const E1 = [AISLE_X, 1.90], XM = [AISLE_X, -0.60];
const LIM1_Z = 0.70;
// S5: ROW_B 1.18 -> 1.12, and wall 04's pair stands at z 1.55 (was 1.47), so a sheet on the table's near edge is clear
// of their hanging arms, and their arms are clear of the table (edge z 1.30)
const ROW_A = 0.72, ROW_B = 1.12;               // table spots: glass side, camera side
const W4_NU = [-0.24, 1.55], W4_F2 = [0.24, 1.55];   // S5: .48 apart (was .40 at z 1.47)
const PILE_L = [-1.12, 0.95], PILE_R = [1.18, 1.08];
const GLASS_TILT = 25 * DEG;
// FIX-PLAN-R4 S2 marks (wall-local x, z). DEVIATION (hand-off distance, reported): the plan's hand-off marks .55-.65
// apart cannot meet: a .21 human arm and a .13 agent arm reach .42 together even flat out, and the logic check wants
// the hands within .011. Every hand-off pair now stands .39-.45 apart, both on ONE side of the wall's push lane (the
// lane rule holds), and the agent telescopes its nub arm up to meet the human's hand (ARM.handUp, stretch <= 1.8).
// The agents stand glass-side of their human where they can, so their screens face the hold camera.
// DEVIATION (r6-legs with the R4 heads, and the hand-off distance): wall 01's pair moves right of its -.77 lane. Left of
// it (x <= -1.07) the big heads sat on wall 01's left leg in every K0 / K2 frame (4-7 px). Lim now faces the glass and
// his courier at once: it stands glass-side of him, facing him and the lens.
const LIM1 = [-0.40, LIM1_Z];
// S5: the courier mark .505 from Lim (was .437; at the hand-off the courier's hat and Lim's head met), .28 off the
// glass (was .29), clear of the sheet pinned there and of Lim's writing hand
const R1 = [-0.12, 0.28];                       // wall 01 courier mark
// wall 02
// S5: Priya's home and B stand off A (.47 / .49, were .41 / .42): the relay's sheet and arms had no room between them
const W2_P0 = [-0.06, 0.67], W2_PM = [-0.30, 0.25], W2_A = [0.40, 0.45], W2_B = [0.60, 0.90];
// wall 03
// the huddle sits .15 right of the first cut (r6-legs: wall 03's left leg ran behind S1's and the director's heads)
// STAGE-MANAGER R4: the K4 lens looks from the right at 39°, and the huddle stood left of Marcus at his depth, so every
// agent that faced him showed the lens its side or back (0 screens at 390, 1 at 1440) and S2 / S3 / director stood
// behind him (67-83 % hidden). Marcus now stands camera-side; the crew stands glass-side of him, spread across the
// frame, each facing him and so the lens (13-46°). He reaches the glass round the right of the crew (W3_MW).
// S5: the relay stands wider (S3–S2 .48, S2–Marcus .47, were .41 / .41), Marcus pins further right (x 1.32, clear of
// S1), and the back row is re-spaced .47–.50 (it stood .37–.38 apart: two agents' arms side by side need .45)
const W3_M0 = [0.60, 1.12], W3_MW = [1.34, 0.93], W3_MP = [1.32, 0.25], W3_S2 = [0.13, 1.06], W3_S3M = [-0.28, 0.82];
const W3_S1 = [0.82, 0.20], W3_O1 = [0.35, 0.22], W3_DIR = [-0.12, 0.22], W3_O2 = [-0.62, 0.25];
const W3_SW = [-1.03, 0.97];                     // S3's way in from E1 and back out
// wall 05
// Sam walks straight to the glass and back; the agent stands .44 from both marks and .38 off her line
// S5: the agent .46 off Sam's line (was .38): Sam's swinging arm met its head as she walked past
const W5_PH = [0.00, 0.70], W5_PM = [0.00, 0.25], W5_AG = [-0.46, 0.47];
// wall 06
// S5: the director and the proposer stand off Lim's home (.47 / .51, were .41 / .41)
const W6_LH = [0.00, 0.70], W6_LP = [-0.45, 0.25], W6_DIR = [0.24, 0.30], W6_PR = [-0.40, 0.38];
// A pin lands under the hand that carries the card: a figure facing the glass has its right hand at world +x.
// FIX-PLAN-R5 S5: the pinning hand holds the sheet by its outer edge (CARD_SWING), so the pinned card's centre sits
// CARD_IN inside the hand. Sides: wall 02 pins with the LEFT hand now, wall 05 with the RIGHT (the cards' side0).
const HAND_X = SPEC.H.armX + SPEC.H.armL * Math.sin(SPEC.H.armRoll);   // .194
const CARD_IN = CARD_W2 * CARD_S_TOUR + SPEC.H.cardE0;                  // .072
const PX2 = W2_PM[0] - HAND_X + CARD_IN, PX3 = W3_MP[0] + HAND_X - CARD_IN;
const PX5 = W5_PM[0] + HAND_X - CARD_IN, PX6 = W6_LP[0] - HAND_X + CARD_IN, PX1 = LIM1[0] - HAND_X + CARD_IN;

// ---------------------------------------------------------------------------------------------------------
// helpers (pure, allocation-free)
// ---------------------------------------------------------------------------------------------------------
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smoothstep = (a, b, x) => { if (b <= a) return x >= b ? 1 : 0; const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease3 = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);   // easeInOutCubic
const wrapPi = (a) => a - TAU * Math.floor((a + PI) / TAU);
const modPiDelta = (d) => d - PI * Math.round(d / PI);                              // shortest arc mod π (cards)
// FIX-PLAN-R5 S5 the carry. The R2-R4 card turned 80 % toward the camera about its own centre, and at a 3/4 body turn
// it swept through its carrier's arm and chest. Now a hand grips the sheet by its outer edge and the sheet stands in
// front of the chest, never back through the wrist. In the body frame of the carrying hand the sheet's width axis runs
// at α from across the chest (α 0: it faces the way the body faces) to straight ahead of the hand (α 90°: it faces
// sideways, on the hand's side). Both faces carry the document now (S6), so α only turns the sheet toward the camera
// side where that is free: α = CARD_SWING · max(0, ∓sin θ) · (1 + cos θ) / 2, continuous in the body yaw θ (no pop).
// In a hand-off the sheet turns to face along the pair and stands just outside the two meeting hands (they pinch its
// inner face), so nothing of it is between the bodies and, with the pair side-on to the lens, it faces the camera;
// at a pin it faces the glass, out beyond the pinning fingers.
const CARD_SWING = 30 * DEG;
const hash1 = (k) => { const s = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const fmod = (a, m) => { const r = a % m; return r < 0 ? r + m : r; };
// window weight: ramps in over [a, a+rin], holds, ramps out over [b, b+rout]
const win = (a, b, rin, rout, x) => smoothstep(a, a + rin, x) * (1 - smoothstep(b, b + rout, x));
// the same window evaluated one loop either side, so a window may straddle the loop seam
const winT = (a, b, rin, rout, u, T) => Math.max(win(a, b, rin, rout, u), win(a, b, rin, rout, u - T), win(a, b, rin, rout, u + T));
const inWin = (a, b, u, T) => (u >= a && u < b) || (u - T >= a && u - T < b) || (u + T >= a && u + T < b);

// ---------------------------------------------------------------------------------------------------------
// the six scene scripts (FIX-PLAN-R4 S2). Wall-local (x, z), times in the figure's own scene time.
// A figure's times live in [base, base + T): the base is a moment it is at rest in a known state.
// turns: [t0, t1, to]  to = 'wall' | 'path' | a figure name | [x, z] | an angle (radians)
// walks: [t0, t1, [[x, z], ...]]   fades: [f0, [t0, t1, to], ...]   pitch: [a, b, deg, ramp?]   (+ = look up)
// look: [a, b, to, prio]   point: [a, b, side]   handoffs: [t0, giver, receiver]   pins: [t0, t1, fig, x]
// passes: [t0, t1, from, to]. pair: the human–agent pair of the wall; alternates allowed ('a|b').
// card segs: [t, mode, opts]. A card's arm side starts +1 (right) and flips at every hand-off.
// Kinds: 'H' human, 'A' agent. Humans are named people (people palette); agents are named by job.
// ---------------------------------------------------------------------------------------------------------
const courier = (name, shift) => ({
  name, kind: 'A', base: 0, shift, p0: E1, face0: 'path', fades: [0, [0, 0.4, 1], [9.8, 10.2, 0]],
  // in across the lane (walking), round Lim's left to the glass-side mark; out along the glass to the aisle
  // S5: out along z .30 (was .22), clear of the pinned sheet, and briskly (7.0-9.8, was -10.75): courier-b walks in
  // as courier-a walks out, and at the old pace they passed .42 apart at x -1.0
  walks: [[0, 2.3, [E1, [-1.20, 1.30], [-0.75, 0.33], R1]], [7.0, 9.8, [R1, [-1.20, 0.30], [AISLE_X, 0.30], XM]]],
  turns: [[2.3, 2.8, 'Lim'], [6.8, 7.1, 'path']],
});
// a crew member reading a card, head down (pitch −8), who looks up to the lead at times
const reading = [[-1, 30, -8, 0.4]];

const SCRIPTS = [
  // ---- 01 Context (T 14): Lim writes, takes the note off the glass and hands it to a courier; 4 agents ----------
  {
    pair: ['Lim', 'courier-a|courier-b'],
    figs: [
      { name: 'Lim', kind: 'H', base: 0.35, p0: LIM1, face0: 'wall',
        turns: [[2.8, 3.2, 'courier-a'], [7.0, 7.3, 'wall'], [9.8, 10.2, 'courier-b'], [14.0, 14.3, 'wall']],
        write: [[0.3, 2.8], [7.3, 9.8]],
        pitch: [[0.3, 2.8, 4], [7.3, 9.8, 4]] },
      // S2: the old W01.Priya is the scribe agent: her turns and nods, facing Lim at the hand-offs, else the room
      // it follows Lim with its head and eyes (a body turn to him would put its screen away from the K2 lens)
      { name: 'scribe', kind: 'A', base: 0.5, p0: [0.30, 0.55], face0: 30 * DEG,
        look: [[3.0, 6.8, 'Lim', 2], [10.0, 13.8, 'Lim', 2]],
        nods: [4.2, 11.2],
        pitch: [[0.8, 2.8, 4], [7.6, 9.6, 4]] },
      // S2: new, reading a card (head 8° down), looks up to Lim over 5.8-6.6 for the hand-off
      { name: 'reader', kind: 'A', base: 0, p0: [0.95, 0.95], face0: 20 * DEG,
        look: [[5.8, 8.0, 'Lim', 2]],
        pitch: [[-1, 5.6, -8, 0.4], [8.6, 20, -8, 0.4]] },
      courier('courier-a', 0),
      courier('courier-b', 7),
    ],
    cards: [
      // side0 -1: Lim takes the sheet off the glass to his left hand, clear of the courier on his right
      { name: 'c1a', base: 0, side0: -1, segs: [[0, 'hidden'], [0.3, 'glass', { x: PX1, fin: [0.3, 0.6] }],
        [2.4, 'unpin', { f: 'Lim', x: PX1, d: 0.4 }], [2.8, 'hand', { f: 'Lim' }],
        [6.0, 'handoff', { f: 'Lim', g: 'courier-a' }], [6.6, 'hand', { f: 'courier-a' }], [10.2, 'hidden']] },
      { name: 'c1b', base: 5.0, side0: -1, segs: [[5.0, 'hidden'], [7.3, 'glass', { x: PX1, fin: [7.3, 7.6] }],
        [9.4, 'unpin', { f: 'Lim', x: PX1, d: 0.4 }], [9.8, 'hand', { f: 'Lim' }],
        [13.0, 'handoff', { f: 'Lim', g: 'courier-b' }], [13.6, 'hand', { f: 'courier-b' }], [17.2, 'hidden']] },
      { name: 'c1r', base: 0, segs: [[0, 'hand', { f: 'reader' }]] },
    ],
    handoffs: [[6.0, 'Lim', 'courier-a'], [13.0, 'Lim', 'courier-b']],
    pins: [],
  },
  // ---- 02 Operational data (T 12): B passes the work to A, A hands it to Priya, Priya pins it; 4 agents ----------
  {
    pair: ['Priya', 'A'],
    figs: [
      { name: 'Priya', kind: 'H', base: 0, p0: W2_P0, face0: 'A',
        walks: [[4.0, 4.6, [W2_P0, W2_PM]], [5.3, 6.0, [W2_PM, W2_P0]], [9.2, 9.8, [W2_P0, W2_PM]], [10.5, 11.2, [W2_PM, W2_P0]]],
        turns: [[3.6, 4.0, 'path'], [4.6, 4.9, 'wall'], [5.0, 5.3, 'path'], [6.0, 6.35, 'A'],
          [8.8, 9.2, 'path'], [9.8, 10.1, 'wall'], [10.2, 10.5, 'path'], [11.2, 11.55, 'A']] },
      // crew agents face their lead's home mark, not the walking lead: when she goes to the glass they follow her with
      // the head and the eyes, and their screens stay toward the hold camera
      { name: 'A', kind: 'A', base: 0, p0: W2_A, face0: W2_P0,
        // S5: it turns to Priya as its hand-off arm comes down (2.15, was 2.0): turning with the arm out swept the sheet
        turns: [[1.0, 1.4, 'B'], [2.15, 2.45, W2_P0], [6.2, 6.6, 'B'], [7.35, 7.65, W2_P0]],
        look: [[4.0, 5.6, 'Priya', 2], [9.2, 10.8, 'Priya', 2]] },
      // STAGE-MANAGER R4 (occlusion probe _dev/r7-sm-occl.mjs): B stood straight behind Priya from the K3 lens (99 %
      // hidden) and C behind A (69-76 %). B now stands camera-side right of A, screen to the lens, and turns to A only
      // for its hand-offs; C reads at the left glass. Every W02 figure is now < 60 % hidden at 1440 and 390.
      { name: 'B', kind: 'A', base: 0, p0: W2_B, face0: -20 * DEG,
        turns: [[0.9, 1.3, 'A'], [2.1, 2.5, -20 * DEG], [6.1, 6.5, 'A'], [7.3, 7.7, -20 * DEG]] },
      { name: 'C', kind: 'A', base: 0, p0: [-1.00, 0.35], face0: -25 * DEG,
        look: [[3.4, 5.2, 'Priya', 2], [8.6, 10.4, 'Priya', 2]] },
      { name: 'D', kind: 'A', base: 0, p0: [-0.60, 0.80], face0: -15 * DEG,
        turns: [[4.4, 4.9, 'Priya'], [6.0, 6.6, -15 * DEG]],
        pitch: [[-1, 4.2, -8, 0.4], [6.8, 20, -8, 0.4]] },
    ],
    cards: [
      // S5 side0 -1: B holds in its left hand, A in its right, Priya in her LEFT: each turn after a hand-off swings the
      // sheet away from the figure it came from (with the right hand, Priya's turn to the glass swept it into A)
      { name: 'k1', base: 0.4, side0: -1, segs: [[0.4, 'hidden'], [0.6, 'hand', { f: 'B', fin: [0.6, 0.9] }],
        [1.4, 'handoff', { f: 'B', g: 'A' }], [2.0, 'hand', { f: 'A' }],
        [3.0, 'handoff', { f: 'A', g: 'Priya' }], [3.6, 'hand', { f: 'Priya' }],
        [4.6, 'pin', { f: 'Priya', x: PX2, d: 0.5 }], [5.1, 'glass', { x: PX2, fout: [5.6, 6.0] }], [6.0, 'hidden']] },
      { name: 'k2', base: 5.6, side0: -1, segs: [[5.6, 'hidden'], [5.8, 'hand', { f: 'B', fin: [5.8, 6.1] }],
        [6.6, 'handoff', { f: 'B', g: 'A' }], [7.2, 'hand', { f: 'A' }],
        [8.2, 'handoff', { f: 'A', g: 'Priya' }], [8.8, 'hand', { f: 'Priya' }],
        [9.8, 'pin', { f: 'Priya', x: PX2, d: 0.5 }], [10.3, 'glass', { x: PX2, fout: [10.8, 11.2] }], [11.2, 'hidden']] },
      { name: 'c2d', base: 0, segs: [[0, 'hand', { f: 'D' }]] },
    ],
    handoffs: [[1.4, 'B', 'A'], [3.0, 'A', 'Priya'], [6.6, 'B', 'A'], [8.2, 'A', 'Priya']],
    pins: [[4.6, 5.1, 'Priya', PX2], [9.8, 10.3, 'Priya', PX2]],
  },
  // ---- 03 AI agents (T 12): Marcus's stand-up; S3 brings the job in, S2 relays it to Marcus, he pins; 6 agents ---
  {
    pair: ['Marcus', 'S2'],
    figs: [
      { name: 'Marcus', kind: 'H', base: 0.5, p0: W3_M0, face0: 'S2',
        // the walk round the crew is 1.36 u: 1.0 s each way keeps the step under .05 u per 0.02 s
        walks: [[2.0, 3.0, [W3_M0, W3_MW, W3_MP]], [3.8, 4.8, [W3_MP, W3_MW, W3_M0]]],
        turns: [[1.6, 2.0, 'path'], [3.0, 3.3, 'wall'], [3.4, 3.8, 'path'], [4.8, 5.2, 'S2']] },
      { name: 'S1', kind: 'A', base: 0, p0: W3_S1, face0: W3_M0, look: [[2.3, 4.5, 'Marcus', 2]] },
      { name: 'S2', kind: 'A', base: 0, p0: W3_S2, face0: W3_M0,
        // S5: the S3 -> S2 relay runs .5 s earlier (4.8, was 5.3), so S2's arm is down before it turns to Marcus; S2
        // faces S3 before S3 arrives (3.9, was 4.75)
        turns: [[3.9, 4.35, 'S3'], [5.6, 6.0, W3_M0]], look: [[2.3, 4.5, 'Marcus', 2]] },
      { name: 'S3', kind: 'A', base: 1.0, p0: E1, face0: 'path', fades: [0, [2.0, 2.4, 1], [12.3, 12.7, 0]],
        walks: [[2.0, 4.4, [E1, W3_SW, W3_S3M]], [8.3, 12.3, [W3_S3M, W3_SW, E1]]],
        turns: [[4.4, 4.7, 'S2'], [5.6, 6.0, 'Marcus'], [8.0, 8.3, 'path']] },
      // S2: new, faces the huddle's lead
      { name: 'director', kind: 'A', base: 0, p0: W3_DIR, face0: W3_M0, look: [[2.3, 4.5, 'Marcus', 2]] },
      // O1 works the board between the director and S1: it points (arm 120°, head up 12°) at 2.8–3.6 and never pins.
      // O2 watches the stand-up from the back row.
      { name: 'O1', kind: 'A', base: 0, p0: W3_O1, face0: 'wall',
        point: [[2.8, 3.6, 1]], pitch: [[2.8, 3.6, 12]],
        turns: [[4.4, 5.1, W3_M0], [6.8, 7.5, 'wall']] },
      { name: 'O2', kind: 'A', base: 0, p0: W3_O2, face0: W3_M0,
        look: [[2.4, 4.4, 'Marcus', 2], [6.0, 7.0, 'Marcus', 2]] },
    ],
    // X: S3 brings the job in, relays it to S2, S2 to Marcus. Y: the same sheet, next loop, pinned by Marcus at 3.6.
    // The two trade at tl 1.9 in Marcus's hand, on the same frame (the sheets are identical).
    cards: [
      { name: 'c3a', base: 2.0, segs: [[2.0, 'hand', { f: 'S3', fin: [2.0, 2.4] }],
        [4.8, 'handoff', { f: 'S3', g: 'S2' }], [5.4, 'hand', { f: 'S2' }],
        [6.2, 'handoff', { f: 'S2', g: 'Marcus' }], [6.8, 'hand', { f: 'Marcus' }], [13.9, 'hidden']] },
      { name: 'c3b', base: 4.4, segs: [[4.4, 'hidden'], [13.9, 'hand', { f: 'Marcus' }],
        [15.1, 'pin', { f: 'Marcus', x: PX3, d: 0.5 }], [15.6, 'glass', { x: PX3, fout: [16.0, 16.4] }], [16.4, 'hidden']] },
    ],
    handoffs: [[4.8, 'S3', 'S2'], [6.2, 'S2', 'Marcus']],
    pins: [[3.1, 3.6, 'Marcus', PX3]],
    speak: [
      { group: ['Marcus', 'S1', 'S2', 'S3', 'director'], slots: [[0, 3, 'Marcus'], [3, 6, 'S1'], [6, 9, 'Marcus'], [9, 12, 'S2']] },
    ],
  },
  // ---- 04 The workspace (T 14): the job sheet goes round the table; Nurul (F1) and 4 agents ------------------------
  {
    pair: ['Nurul', 'F2'],
    figs: [
      // S2: both of the pair left of the .55 lane, .40 apart, on the camera side of the table
      { name: 'Nurul', kind: 'H', base: 0, p0: W4_NU, face0: 'F2',
        turns: [[4.9, 5.3, 'wall'], [6.1, 6.5, 'F2']],
        look: [[4.8, 5.4, [W4_NU[0], ROW_B], 3]] },
      { name: 'F2', kind: 'A', base: 0, p0: W4_F2, face0: 'Nurul',
        turns: [[8.6, 9.0, 'wall'], [10.8, 11.2, 'Nurul']],
        look: [[9.7, 10.6, [1.05, ROW_A], 3]] },
      // S2: F3 is an agent now
      { name: 'F3', kind: 'A', base: 0, p0: [-0.55, 0.34], face0: 15 * DEG,
        look: [[1.2, 2.2, 'F5', 3], [4.0, 5.0, 'Nurul', 3]] },
      { name: 'F4', kind: 'A', base: 0, p0: [1.05, 0.36], face0: -20 * DEG,
        look: [[9.6, 10.6, 'F2', 3], [11.9, 12.8, PILE_R, 3]] },
      // glass-side of the table's left end, off wall 04's left leg (r6-legs); it faces the pile and the lens
      { name: 'F5', kind: 'A', base: 0, p0: [-1.25, 0.35], face0: 20 * DEG,
        look: [[1.2, 2.2, 'F3', 3]] },
    ],
    // piles: left PILE_L, right PILE_R; level k at the table top + k sheets. Cards are identical, so the loop closes
    // on the same SET of card positions (slots trade roles at the seam, the frame is identical).
    cards: [
      // S5: the left pile rises once the job sheet has slid clear of it (1.9-2.2, was 1.4-1.7), and the new bottom
      // sheet steps in after the rise (2.2-2.3), never inside the sheet it replaces
      { name: 'L-a', base: 0, segs: [[0, 'pile', { p: PILE_L, lv: [0, 1], at: [1.9, 2.2] }]] },
      { name: 'L-b', base: 0, segs: [[0, 'pile', { p: PILE_L, lv: [1, 2], at: [1.9, 2.2] }]] },
      // S5 side0 -1: Nurul lifts and holds with her LEFT hand, F2 takes it in its right: both turns then swing the sheet
      // away from the other
      { name: 'job', base: 0, side0: -1, segs: [[0, 'pile', { p: PILE_L, lv: [2, 2], at: [0, 0] }],
        [1.4, 'table', { a: [PILE_L[0], PILE_L[1], 2], b: [-0.55, ROW_A, 0], d: 0.8, fa: 'F5', ta: 'F3' }],
        [4.2, 'table', { a: [-0.55, ROW_A, 0], b: [W4_NU[0], ROW_B, 0], d: 0.8, fa: 'F3', ta: 'Nurul' }],
        [5.5, 'lift', { f: 'Nurul', a: [W4_NU[0], ROW_B, 0], d: 0.5 }],
        [6.0, 'hand', { f: 'Nurul' }],
        [7.2, 'handoff', { f: 'Nurul', g: 'F2' }],
        [7.8, 'hand', { f: 'F2' }],
        [9.2, 'lay', { f: 'F2', b: [W4_F2[0], ROW_B, 0], d: 0.6 }],
        [9.8, 'table', { a: [W4_F2[0], ROW_B, 0], b: [1.05, ROW_A, 0], d: 0.8, fa: 'F2', ta: 'F4' }],
        [12.0, 'table', { a: [1.05, ROW_A, 0], b: [PILE_R[0], PILE_R[1], 3], d: 0.8, fa: 'F4', ta: 'pile' }],
        [12.8, 'pile', { p: PILE_R, lv: [3, 2], at: [13.2, 13.8] }]] },
      { name: 'L-new', base: 0, segs: [[0, 'hidden'], [2.2, 'pile', { p: PILE_L, lv: [0, 0], at: [0, 0], fin: [2.2, 2.3] }]] },
      { name: 'R-bot', base: 0, segs: [[0, 'pile', { p: PILE_R, lv: [0, 0], at: [0, 0], fout: [12.8, 13.2] }], [13.2, 'hidden']] },
      { name: 'R-mid', base: 0, segs: [[0, 'pile', { p: PILE_R, lv: [1, 0], at: [13.2, 13.8] }]] },
      { name: 'R-top', base: 0, segs: [[0, 'pile', { p: PILE_R, lv: [2, 1], at: [13.2, 13.8] }]] },
    ],
    handoffs: [[7.2, 'Nurul', 'F2']],
    pins: [],
    passes: [[1.4, 2.2, 'F5', 'F3'], [4.2, 5.0, 'F3', 'Nurul'], [9.8, 10.6, 'F2', 'F4'], [12.0, 12.8, 'F4', null]],
  },
  // ---- 05 Ledger (T 6): the agent drafts, hands to Sam, Sam checks and pins; 4 agents ------------------------
  {
    pair: ['agent', 'Sam'],
    figs: [
      // FIX-PLAN-R5 S1: wall 05's human is Sam (new staff; Priya plays wall 02 only). The agent watches Sam the whole
      // loop (it faces them as they go to the glass and back)
      { name: 'agent', kind: 'A', base: 0, p0: W5_AG, face0: 'Sam' },
      // base .4: Sam's last turn (back to the agent) runs over the loop seam
      { name: 'Sam', kind: 'H', base: 0.4, p0: W5_PH, face0: 'agent',
        walks: [[1.5, 2.1, [W5_PH, W5_PM]], [5.1, 5.8, [W5_PM, W5_PH]]],
        turns: [[1.2, 1.5, 'path'], [2.1, 2.3, 'wall'], [2.8, 3.2, 'agent'], [4.3, 4.7, 'wall'], [4.9, 5.1, 'path'], [5.8, 6.2, 'agent']] },
      { name: 'logger', kind: 'A', base: 0, p0: [0.55, 0.80], face0: -30 * DEG,
        look: [[2.0, 3.0, 'Sam', 2], [4.4, 5.4, 'Sam', 2]] },
      // S5: .46 from the logger (was .38 at (0.90, 0.95)): their heads touched
      { name: 'checker', kind: 'A', base: 0, p0: [0.95, 1.00], face0: -10 * DEG, pitch: reading },
      // STAGE-MANAGER R4: the runner faced the glass (its back to the K6 lens); it now faces the room and watches Sam
      { name: 'runner', kind: 'A', base: 0, p0: [1.35, 0.60], face0: -35 * DEG,
        look: [[1.6, 2.8, 'Sam', 2], [4.2, 5.2, 'Sam', 2]] },
    ],
    cards: [
      // S5 side0 -1: the agent's left, Sam's RIGHT: walking to the glass Sam carries it on the side away from the agent
      { name: 'k1', base: 5.2, side0: -1, segs: [[5.2, 'hand', { f: 'agent', fin: [5.2, 5.5] }],
        [6.6, 'handoff', { f: 'agent', g: 'Sam' }], [7.2, 'hand', { f: 'Sam' }],
        [8.2, 'pin', { f: 'Sam', x: PX5, d: 0.4 }], [8.6, 'glass', { x: PX5, fout: [9.0, 9.4] }], [9.4, 'hidden']] },
      { name: 'k2', base: 2.6, side0: -1, segs: [[2.6, 'hidden'], [2.9, 'hand', { f: 'agent', fin: [2.9, 3.2] }],
        [3.7, 'handoff', { f: 'agent', g: 'Sam' }], [4.3, 'hand', { f: 'Sam' }],
        [4.6, 'pin', { f: 'Sam', x: PX5, d: 0.4 }], [5.0, 'glass', { x: PX5, fout: [5.4, 5.8] }], [5.8, 'hidden']] },
      { name: 'c5c', base: 0, segs: [[0, 'hand', { f: 'checker' }]] },
    ],
    handoffs: [[0.6, 'agent', 'Sam'], [3.7, 'agent', 'Sam']],
    pins: [[2.2, 2.6, 'Sam', PX5], [4.6, 5.0, 'Sam', PX5]],
  },
  // ---- 06 Admin panel (T 14): Lim and the director decide; the proposer brings the next one; 4 agents -------------
  // FIX-PLAN-R3 S3.1, kept: Lim pins 5.4–5.9, his hand stays on the note while the square fills and he signs (write
  // 5.9–7.1, the pin's own arm and angle, fully up by 5.9), and he looks to the director 5.8–7.6. FIX-PLAN-R4 S1.5:
  // he walks to the glass for it (4.4–5.0) and back (7.5–8.1), and again for the proposer's sheet at 12.0–12.5.
  {
    pair: ['Lim', 'director'],
    figs: [
      { name: 'Lim', kind: 'H', base: 0, p0: W6_LH, face0: 'director',
        walks: [[4.4, 5.0, [W6_LH, W6_LP]], [7.5, 8.1, [W6_LP, W6_LH]], [11.3, 11.9, [W6_LH, W6_LP]], [12.8, 13.4, [W6_LP, W6_LH]]],
        turns: [[4.0, 4.4, 'path'], [5.0, 5.3, 'wall'], [7.1, 7.5, 'path'], [8.1, 8.5, 'director'], [9.7, 10.2, 'proposer'],
          [11.0, 11.3, 'path'], [11.9, 12.1, 'wall'], [12.4, 12.8, 'path'], [13.4, 13.8, 'director']],
        write: [[5.9, 7.1, { side: -1, lead: 0.3, sway: 0.012, deg: 'pin' }]],
        pitch: [[5.9, 7.1, 4]],
        look: [[5.8, 7.4, 'director', 3]] },
      { name: 'director', kind: 'A', base: 0, p0: W6_DIR, face0: W6_LH,
        look: [[5.2, 7.6, 'Lim', 3], [8.9, 11.2, 'proposer', 2]] },
      { name: 'proposer', kind: 'A', base: 2.0, p0: XM, face0: 'path', fades: [0, [6.5, 6.9, 1], [14.9, 15.3, 0]],
        // S5: in and out wider of the reporter (.52 / .57), and out leftward first, clear of Lim, who walks to the glass
        // behind it at 11.3
        walks: [[6.5, 8.7, [E1, [-1.10, 1.20], [-0.85, 0.55], W6_PR]], [11.0, 14.9, [W6_PR, [-0.80, 0.60], [-1.20, 1.00], [AISLE_X, 1.20], XM]]],
        turns: [[8.7, 9.1, 'Lim'], [10.9, 11.1, 'path']] },
      { name: 'accounts', kind: 'A', base: 0, p0: [1.35, 0.90], face0: -30 * DEG, pitch: reading },
      { name: 'reporter', kind: 'A', base: 0, p0: [-0.50, 1.10], face0: 25 * DEG,
        look: [[5.6, 7.2, 'Lim', 2]] },
    ],
    cards: [
      { name: 'c6d', base: 0, segs: [[0, 'hidden'], [2.2, 'hand', { f: 'director', fin: [2.2, 2.5] }],
        [3.2, 'handoff', { f: 'director', g: 'Lim' }], [3.8, 'hand', { f: 'Lim' }],
        [5.4, 'pin', { f: 'Lim', x: PX6, d: 0.5 }], [5.9, 'glass', { x: PX6, fout: [7.1, 7.5] }], [7.5, 'hidden']] },
      { name: 'c6m', base: 2.0, segs: [[2.0, 'hidden'], [6.5, 'hand', { f: 'proposer' }],
        [10.4, 'handoff', { f: 'proposer', g: 'Lim' }], [11.0, 'hand', { f: 'Lim' }],
        [12.0, 'pin', { f: 'Lim', x: PX6, d: 0.5 }], [12.5, 'glass', { x: PX6, fout: [12.9, 13.3] }], [13.3, 'hidden']] },
      { name: 'c6a', base: 0, segs: [[0, 'hand', { f: 'accounts' }]] },
    ],
    handoffs: [[3.2, 'director', 'Lim'], [10.4, 'proposer', 'Lim']],
    pins: [[5.4, 5.9, 'Lim', PX6], [12.0, 12.5, 'Lim', PX6]],
  },
];

// staging facts for the logic check (dev only reads them; pure data)
export const PAIRS = SCRIPTS.map((S) => S.pair.map((s) => s.split('|')));
export const HANDOFFS = SCRIPTS.map((S) => (S.handoffs || []).map((h) => ({ t0: h[0], giver: h[1], receiver: h[2] })));
export const KINDS = SCRIPTS.map((S) => Object.fromEntries(S.figs.map((f) => [f.name, f.kind])));
export const PINS = SCRIPTS.map((S) => (S.pins || []).map((p) => ({ t0: p[0], t1: p[1], fig: p[2], x: p[3] })));

// corridor: agents only, each carrying a card. Lane B 3 walkers at phase k/3, lane F 1 (FIX-PLAN-R4 S2).
const TRAFFIC = [
  ...[0, 1, 2].map((k) => ({ name: 'tB' + k, lane: 'B', kind: 'A', phase: k / 3, card: true })),
  { name: 'tF0', lane: 'F', kind: 'A', phase: 0, card: true },
];

// ---------------------------------------------------------------------------------------------------------
// build-time compilation of the scripts into flat, allocation-free runtime records
// ---------------------------------------------------------------------------------------------------------
const MODE = { hidden: 0, hand: 1, handoff: 2, unpin: 3, pin: 4, glass: 5, table: 6, pile: 7, lift: 8, lay: 9 };
const MODE_NAMES = ['hidden', 'hand', 'handoff', 'unpin', 'pin', 'glass', 'table', 'pile', 'lift', 'lay'];

// walk polyline with filleted corners, cumulative arc length, trapezoid profile
function compileWalk(t0, t1, pts) {
  const P = [];
  P.push(pts[0]);
  for (let k = 1; k < pts.length - 1; k++) {
    const a = pts[k - 1], c = pts[k], b = pts[k + 1];
    const l0 = Math.hypot(c[0] - a[0], c[1] - a[1]), l1 = Math.hypot(b[0] - c[0], b[1] - c[1]);
    const r = Math.min(FILLET, 0.45 * l0, 0.45 * l1);
    const A = [c[0] - (c[0] - a[0]) / l0 * r, c[1] - (c[1] - a[1]) / l0 * r];
    const B = [c[0] + (b[0] - c[0]) / l1 * r, c[1] + (b[1] - c[1]) / l1 * r];
    for (let j = 0; j <= 8; j++) {
      const s = j / 8, m = 1 - s;
      P.push([m * m * A[0] + 2 * m * s * c[0] + s * s * B[0], m * m * A[1] + 2 * m * s * c[1] + s * s * B[1]]);
    }
  }
  P.push(pts[pts.length - 1]);
  const n = P.length;
  const px = new Float64Array(n), pz = new Float64Array(n), cs = new Float64Array(n);
  for (let k = 0; k < n; k++) { px[k] = P[k][0]; pz[k] = P[k][1]; if (k) cs[k] = cs[k - 1] + Math.hypot(px[k] - px[k - 1], pz[k] - pz[k - 1]); }
  const D = t1 - t0, L = cs[n - 1];
  const a = Math.min(WALK_ACC, D / 2);
  const w = { t0, t1, D, a, L, vmax: L / (D - a), px, pz, cs, n, ex: px[n - 1], ez: pz[n - 1], dir0: 0, dirEnd: 0 };
  w.dir0 = pathDirS(w, 0);
  w.dirEnd = pathDirS(w, L);
  return w;
}
function walkS(w, tau) {   // arc length at time tau since the walk started
  const { D, a, vmax, L } = w;
  if (tau <= 0) return 0;
  if (tau >= D) return L;
  if (tau < a) return 0.5 * vmax / a * tau * tau;
  if (tau < D - a) return vmax * (tau - a / 2);
  const r = D - tau;
  return L - 0.5 * vmax / a * r * r;
}
function walkSpeedK(w, tau) { if (tau <= 0 || tau >= w.D) return 0; return Math.min(1, tau / w.a, (w.D - tau) / w.a); }
const SP = { x: 0, z: 0 };
function pathPoint(w, s) {   // → SP
  if (s <= 0) { SP.x = w.px[0]; SP.z = w.pz[0]; return SP; }
  if (s >= w.L) { SP.x = w.ex; SP.z = w.ez; return SP; }
  let k = 1;
  while (k < w.n - 1 && w.cs[k] < s) k++;
  const s0 = w.cs[k - 1], s1 = w.cs[k], f = s1 > s0 ? (s - s0) / (s1 - s0) : 0;
  SP.x = w.px[k - 1] + (w.px[k] - w.px[k - 1]) * f;
  SP.z = w.pz[k - 1] + (w.pz[k] - w.pz[k - 1]) * f;
  return SP;
}
function pathDirS(w, s) {
  const s0 = clamp(s - DIR_CHORD, 0, w.L), s1 = clamp(s + DIR_CHORD, 0, w.L);
  pathPoint(w, s0); const x0 = SP.x, z0 = SP.z;
  pathPoint(w, s1);
  return Math.atan2(SP.x - x0, SP.z - z0);
}

function compileScripts() {
  const figs = [], cards = [];
  let hN = 0, aN = 0;
  const addFig = (spec, wall, byName) => {
    const f = {
      n: figs.length, name: spec.name, id: (wall >= 0 ? 'W0' + (wall + 1) : 'L') + '.' + spec.name,
      wall, kind: spec.kind, human: spec.kind === 'H', sp: SPEC[spec.kind],
      base: spec.base || 0, shift: spec.shift || 0, T: wall >= 0 ? SCENE_T[wall] : 1,
      p0x: spec.p0 ? spec.p0[0] : 0, p0z: spec.p0 ? spec.p0[1] : 0,
      walks: [], layers: [], looks: [], pitches: [], nods: (spec.nods || []).slice(), leans: [], writes: [], rolls: [], arms: [],
      happy: [], f0: 1, ramps: [], face0: null, slot: -1, trafficSpec: null,
    };
    if (!SPEC[spec.kind]) throw new Error('cast: unknown kind on ' + f.id);
    f.slot = f.human ? hN++ : aN++;
    figs.push(f);
    if (byName) byName[spec.name] = f;
    return f;
  };
  // an arm window, in the figure's own time (card and scene times + its shift). deg: a number (radians) or a key of
  // the figure's SPEC ('carry' | 'pin' | 'write' | 'slide' | 'point'); str: the arm length factor (agent slides).
  const addArm = (f, a, b, deg, side, reach) => {
    const d = typeof deg === 'string' ? f.sp[deg] : deg;
    const str = deg === 'slide' ? f.sp.slideS : 1;
    // out: the sheet's pose while this arm is up: 1 = a hand-off's reach (it turns to face along the pair, just outside
    // the meeting hands), 2 = a pin or unpin at the glass (flat to the glass, out beyond the fingers), 0 = the carry
    f.arms.push({ a: a + f.shift, b: b + f.shift, rin: ARM_BLEND, rout: ARM_BLEND, deg: d, str, side, reach: reach || null,
      out: reach ? 1 : deg === 'pin' ? 2 : 0 });
  };

  for (let wall = 0; wall < NW; wall++) {
    const S = SCRIPTS[wall], byName = {};
    const T = SCENE_T[wall];
    for (const spec of S.figs) addFig(spec, wall, byName);
    const target = (to, f, fromT) => {
      if (to === 'wall') return { k: 0, a: PI };
      if (typeof to === 'number') return { k: 0, a: to };
      if (Array.isArray(to)) return { k: 2, x: to[0], z: to[1] };
      if (to === 'path') {
        let w = null;
        for (const cw of f.walks) if (cw.t0 >= fromT - 1e-6) { w = cw; break; }
        if (!w) throw new Error('cast: path turn without a following walk on ' + f.id);
        return { k: 3, w };
      }
      const o = byName[to];
      if (!o) throw new Error('cast: unknown figure ' + to);
      return { k: 1, f: o };
    };
    for (const spec of S.figs) {
      const f = byName[spec.name];
      for (const w of spec.walks || []) f.walks.push(compileWalk(w[0], w[1], w[2]));
      f.walks.sort((a, b) => a.t0 - b.t0);
      if (spec.fades) { f.f0 = spec.fades[0]; for (let k = 1; k < spec.fades.length; k++) f.ramps.push(spec.fades[k]); }
      f.face0 = spec.face0 === 'path' ? { k: 0, a: f.walks[0].dir0 } : target(spec.face0, f, 0);
      // facing layers: turns, then a walk's own path layer unless a 'path' turn already leads into it
      const pathLed = new Set();
      for (const tr of spec.turns || []) {
        const tg = target(tr[2], f, tr[0]);
        let tEnd = tr[1];
        if (tg.k === 3) { pathLed.add(tg.w); tEnd = Math.max(tr[1], tg.w.t0 + PATH_TURN_MIN); }
        f.layers.push({ t0: tr[0], tEnd, spec: tg });
      }
      for (const w of f.walks) {
        if (!pathLed.has(w)) f.layers.push({ t0: w.t0, tEnd: w.t0 + WALK_TURN, spec: { k: 3, w } });
        f.looks.push({ a: w.t0, b: w.t1 - 0.3, rin: 0.3, rout: 0.3, spec: { k: 4 }, prio: 3 });   // walking: straight ahead
      }
      f.layers.sort((a, b) => a.t0 - b.t0);
      for (const lk of spec.look || []) f.looks.push({ a: lk[0], b: lk[1], rin: LOOK_BLEND, rout: LOOK_BLEND, spec: target(lk[2], f, 0), prio: lk[3] || 3 });
      // write: [a, b, { side, lead, sway, deg }?]. side: the writing arm (default right); lead: the arm is up this
      // long before a (so a pin arm hands over to it without a dip); sway: the body's x sway (default .03); deg: a
      // SPEC arm key (default 'write').
      for (const w of spec.write || []) {
        const wo = w[2] || {};
        const lead = wo.lead || 0;
        f.writes.push([w[0], w[1], wo.sway === undefined ? 0.03 : wo.sway]);
        const d = f.sp[wo.deg || 'write'];
        f.arms.push({ a: w[0] - lead, b: w[1], rin: 0.3, rout: 0.3, deg: d, str: 1, side: wo.side || 1, reach: null, out: wo.deg === 'pin' ? 2 : 0 });
      }
      for (const p of spec.point || []) f.arms.push({ a: p[0], b: p[1], rin: 0.3, rout: 0.3, deg: f.sp.point, str: 1, side: p[2] || 1, reach: null, out: 0 });
      f._explicitPitch = spec.pitch || [];
    }
    // hand-offs: both look at each other and lean in (times in scene time; each figure evaluates in its own
    // shifted time, and every window is evaluated one loop either side, so a seam never cuts one). An agent shows
    // the happy glyph from the landing for HAPPY_D.
    for (const h of S.handoffs || []) {
      const g = byName[h[1]], r = byName[h[2]], t0 = h[0];
      for (const [me, other] of [[g, r], [r, g]]) {
        const tt = t0 + me.shift;
        me.looks.push({ a: tt - 0.5, b: tt + HANDOFF_D, rin: LOOK_BLEND, rout: LOOK_BLEND, spec: { k: 1, f: other }, prio: 3 });
        me.leans.push({ a: tt - 0.4, b: tt + HANDOFF_D, rin: 0.4, rout: 0.2, spec: { k: 1, f: other } });
        if (!me.human) me.happy.push([tt + HANDOFF_D, tt + HANDOFF_D + HAPPY_D]);
      }
    }
    for (const p of S.pins || []) {
      const f = byName[p[2]];
      if (!f.human) throw new Error('cast: agents never pin (' + f.id + ')');
      f.looks.push({ a: p[0] - 0.3, b: p[1] + 0.2, rin: 0.3, rout: 0.4, spec: { k: 2, x: p[3], z: 0 }, prio: 3 });
      f.pitches.push({ a: p[0] - 0.3, b: p[1] + 0.3, rin: 0.3, rout: 0.3, deg: 10 });
    }
    for (const ps of S.passes || []) {
      const g = byName[ps[2]];
      const spec = ps[3] ? { k: 1, f: byName[ps[3]] } : { k: 2, x: PILE_R[0], z: PILE_R[1] };
      g.leans.push({ a: ps[0] - 0.4, b: ps[1], rin: 0.4, rout: 0.2, spec });
      if (!g.human) g.happy.push([ps[1], ps[1] + HAPPY_D]);
      const r = ps[3] ? byName[ps[3]] : null;
      if (r && !r.human) r.happy.push([ps[1], ps[1] + HAPPY_D]);
    }
    for (const sp of S.speak || []) {
      for (const sl of sp.slots) {
        const spk = byName[sl[2]];
        spk.rolls.push({ a: sl[0], b: sl[1] });
        for (const nm of sp.group) {
          if (nm === sl[2]) continue;
          byName[nm].looks.push({ a: sl[0], b: sl[1] + LOOK_BLEND, rin: LOOK_BLEND, rout: LOOK_BLEND, spec: { k: 1, f: spk }, prio: 2 });
        }
      }
    }
    for (const spec of S.figs) {
      const f = byName[spec.name];
      for (const p of f._explicitPitch) { const r = p[3] || 0.3; f.pitches.push({ a: p[0], b: p[1], rin: r, rout: r, deg: p[2] }); }
      delete f._explicitPitch;
      f.looks.sort((a, b) => (a.prio - b.prio) || (a.a - b.a));
    }
    // cards (and the arm windows they drive: carry, reach, pin/unpin, slide)
    for (const cs of S.cards) {
      const c = { n: cards.length, name: cs.name, id: 'W0' + (wall + 1) + '.' + cs.name, wall, base: cs.base || 0, T, segs: [], f0: 1, ramps: [], traffic: null };
      for (const s of cs.segs) {
        const o = s[2] || {};
        const seg = { t: s[0], m: MODE[s[1]], x: o.x || 0, d: o.d || 0, f: o.f ? byName[o.f] : null, g: o.g ? byName[o.g] : null,
          px: o.p ? o.p[0] : 0, pz: o.p ? o.p[1] : 0,
          lv0: o.lv ? o.lv[0] : 0, lv1: o.lv ? o.lv[1] : 0, at0: o.at ? o.at[0] : 0, at1: o.at ? o.at[1] : 0,
          a: o.a || null, b: o.b || null, fa: o.fa || '', ta: o.ta || '', side: 1 };
        seg.faF = o.fa && byName[o.fa] ? byName[o.fa] : null;   // S5: the figure whose hand slides a table card
        if (s[1] === 'handoff') seg.d = HANDOFF_D;
        if ((s[1] === 'pin' || s[1] === 'unpin') && seg.f && !seg.f.human) throw new Error('cast: agents never pin (' + c.id + ')');
        c.segs.push(seg);
        if (o.fin) c.ramps.push([o.fin[0], o.fin[1], 1]);
        if (o.fout) c.ramps.push([o.fout[0], o.fout[1], 0]);
      }
      c.segs.sort((a, b) => a.t - b.t);
      c.ramps.sort((a, b) => a[0] - b[0]);
      c.f0 = c.ramps.length && c.ramps[0][2] === 1 ? 0 : 1;   // a card that fades in starts invisible
      let side = cs.side0 || 1;
      for (let k = 0; k < c.segs.length; k++) {
        const sg = c.segs[k], nx = c.segs[k + 1], prev = c.segs[k - 1];
        sg.side = side;
        const tNext = nx ? nx.t : c.base + T;
        if (sg.m === MODE.hand) {
          addArm(sg.f, sg.t - (prev && prev.m === MODE.handoff ? 0 : ARM_BLEND), tNext, 'carry', side, null);
        } else if (sg.m === MODE.handoff) {
          addArm(sg.f, sg.t - ARM_BLEND, sg.t + sg.d, 0, side, sg.g);
          addArm(sg.g, sg.t - ARM_BLEND, sg.t + sg.d, 0, -side, sg.f);
          side = -side;
        } else if (sg.m === MODE.pin) {
          addArm(sg.f, sg.t - 0.2, sg.t + sg.d, 'pin', side, null);
        } else if (sg.m === MODE.unpin) {
          addArm(sg.f, sg.t - ARM_BLEND, sg.t + sg.d - ARM_BLEND, 'pin', side, null);
        } else if (sg.m === MODE.table) {
          const fa = byName[sg.fa];
          if (fa && sg.fa !== sg.ta) addArm(fa, sg.t - 0.15, sg.t + sg.d, 'slide', side, null);
        } else if (sg.m === MODE.lift || sg.m === MODE.lay) {
          addArm(sg.f, sg.t - 0.2, sg.t + sg.d, 'slide', side, null);
        }
      }
      cards.push(c);
    }
    for (const spec of S.figs) byName[spec.name].arms.sort((a, b) => a.a - b.a);
  }
  // traffic
  for (const ts of TRAFFIC) {
    const f = addFig(ts, -1, null);
    f.trafficSpec = ts;
    if (ts.card) cards.push({ n: cards.length, name: 'card-' + ts.name, id: 'L.card-' + ts.name, wall: -1, base: 0, T: 1, segs: [], f0: 1, ramps: [], traffic: f });
  }
  return { figs, cards, humans: hN, agents: aN };
}

// ---------------------------------------------------------------------------------------------------------
// shader injection: per-instance step fade (whole or gone, never a stipple) + the per-instance rim light
// ---------------------------------------------------------------------------------------------------------
const FADE_VERT_HEAD = '#include <common>\nattribute float aFade;\nvarying float vFade;';
const FADE_VERT_BODY = '#include <begin_vertex>\nvFade = aFade;';
const FADE_FRAG_HEAD = '#include <common>\nvarying float vFade;';
const FADE_DISCARD = 'if (vFade < 0.5) discard;\n#include <clipping_planes_fragment>';
// FIX-PLAN-R2 S11: the rim is per instance (aRim), so only the pair the copy addresses carries it. Every mesh on a
// rimmed material (HB, HH, HL, AB, AH, AL) has the attribute; the vertex text is fixed, so the program key holds.
const RIM_VERT_HEAD = FADE_VERT_HEAD + '\nattribute float aRim;\nvarying float vRim;';
const RIM_VERT_BODY = FADE_VERT_BODY + '\nvRim = aRim;';
const RIM_FRAG_UNI = '\nvarying float vRim;\nuniform vec3 uRimColor;\nuniform float uRimI;';
const RIM_FRAG_OUT = `
          float castRim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.5);
          outgoingLight += uRimColor * uRimI * vRim * castRim;
          #include <opaque_fragment>`;

// tint: the material reads a per-instance clothing colour (aTint, linear), multiplied into the diffuse. It is an
// attribute, not three's instanceColor: instanceColor would also switch the shared shadow-depth program (+1 program).
function injectFade(material, key, rimUniforms, tint) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', (rimUniforms ? RIM_VERT_HEAD : FADE_VERT_HEAD) + (tint ? '\nattribute vec3 aTint;\nvarying vec3 vTint;' : ''))
      .replace('#include <begin_vertex>', (rimUniforms ? RIM_VERT_BODY : FADE_VERT_BODY) + (tint ? '\nvTint = aTint;' : ''));
    let fs = shader.fragmentShader
      .replace('#include <common>', FADE_FRAG_HEAD + (tint ? '\nvarying vec3 vTint;' : ''))
      .replace('#include <clipping_planes_fragment>', FADE_DISCARD);
    if (tint) fs = fs.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= vTint;');
    if (rimUniforms) {
      Object.assign(shader.uniforms, rimUniforms);
      fs = fs
        .replace('varying float vFade;', 'varying float vFade;' + RIM_FRAG_UNI)
        .replace('#include <opaque_fragment>', RIM_FRAG_OUT);
    }
    shader.fragmentShader = fs;
  };
  material.customProgramCacheKey = () => key;
  return material;
}
// S1.3 the human head: one merged mesh (skin sphere, hair cap, bun, eyes) tagged by aPart (0 skin, 1 hair, 2 bun,
// 3 eyes). Per instance: aSkin, aHair (vec3, linear) and aBun (0/1). aBun 0 collapses the bun onto the head centre.
function injectHead(material, key, rimUniforms, headUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, rimUniforms, headUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', RIM_VERT_HEAD + '\nattribute float aPart;\nattribute vec3 aSkin;\nattribute vec3 aHair;\nattribute float aBun;\nvarying float vPart;\nvarying vec3 vSkin;\nvarying vec3 vHair;')
      .replace('#include <begin_vertex>', RIM_VERT_BODY + '\nvPart = aPart;\nvSkin = aSkin;\nvHair = aHair;\nif (aPart > 1.5 && aPart < 2.5 && aBun < 0.5) transformed = vec3(0.0);');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', FADE_FRAG_HEAD + RIM_FRAG_UNI + '\nuniform vec3 uEye;\nvarying float vPart;\nvarying vec3 vSkin;\nvarying vec3 vHair;')
      .replace('#include <clipping_planes_fragment>', FADE_DISCARD)
      .replace('#include <color_fragment>', '#include <color_fragment>\nif (vPart > 2.5) diffuseColor.rgb = uEye; else diffuseColor.rgb *= (vPart < 0.5 ? vSkin : vHair);')
      .replace('#include <opaque_fragment>', RIM_FRAG_OUT);
  };
  material.customProgramCacheKey = () => key;
  return material;
}
// S1.4 the agent screen: atlas frame per instance (aFrame), glyph mixed over the screen colour, the glyph glows.
// FIX-PLAN-R6 S3.2: the atlas column count is a uniform (uFaceCols: the floor 8, the guides 16), so one shader text
// serves both atlases and the program count holds.
function injectFace(material, key, faceUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, faceUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', FADE_VERT_HEAD + '\nattribute float aFrame;\nvarying float vFrame;')
      .replace('#include <begin_vertex>', FADE_VERT_BODY + '\nvFrame = aFrame;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', FADE_FRAG_HEAD + '\nvarying float vFrame;\nuniform vec3 uScreen;\nuniform vec3 uGlyph;\nuniform vec3 uLive;\nuniform float uGlow;\nuniform float uFaceCols;')
      .replace('#include <clipping_planes_fragment>', FADE_DISCARD)
      .replace('#include <map_fragment>', `
          float castFrame = floor(vFrame + 0.5);
          float castGlyph = texture2D(map, vec2((vMapUv.x + castFrame) / uFaceCols, vMapUv.y)).r;
          vec3 castInk = abs(castFrame - 2.0) < 0.5 ? uLive : uGlyph;
          diffuseColor.rgb = mix(uScreen, castInk, castGlyph);`)
      .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance = castInk * castGlyph * uGlow;');
  };
  material.customProgramCacheKey = () => key;
  return material;
}
function injectDecalFade(material, key) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', FADE_VERT_HEAD)
      .replace('#include <begin_vertex>', FADE_VERT_BODY);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vFade;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vFade;');
  };
  material.customProgramCacheKey = () => key;
  return material;
}

// FIX-PLAN-R5 S4: the cosmetics. The agent body's step fade and per-instance rim, plus: per vertex aType / aAlt, per
// instance aSel (the item this instance shows; every other shape collapses to a point, the aBun pattern) and its two
// colours aColor / aColor2 (linear), multiplied into the diffuse. One program, fixed text, born final.
function injectAcc(material, key, rimUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, rimUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', RIM_VERT_HEAD + '\nattribute float aType;\nattribute float aAlt;\nattribute float aSel;\nattribute vec3 aColor;\nattribute vec3 aColor2;\nvarying vec3 vAcc;')
      .replace('#include <begin_vertex>', RIM_VERT_BODY + '\nvAcc = aAlt > 0.5 ? aColor2 : aColor;\nif (abs(aType - aSel) > 0.5) transformed = vec3(0.0);');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', FADE_FRAG_HEAD + RIM_FRAG_UNI + '\nvarying vec3 vAcc;')
      .replace('#include <clipping_planes_fragment>', FADE_DISCARD)
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= vAcc;')
      .replace('#include <opaque_fragment>', RIM_FRAG_OUT);
  };
  material.customProgramCacheKey = () => key;
  return material;
}
// FIX-PLAN-R5 S6: the card. The step fade, plus a per-instance document cell (aCell) in the FACES card atlas: the map UV
// becomes cellOrigin + uv · cellSize once uCardAtlas.w = 1 (before the atlas lands, the R2 hairline card shows whole).
// uCardAtlas = (cellW / W, cellH / H, cols, on). The paper colour still multiplies. BoxGeometry's back face (−z) already
// runs u from +x to −x, i.e. left to right seen from behind, so the back reads un-mirrored with no flip; uCardFlip
// (default 0) flips u on the back face (object normal z < 0) if a geometry ever needs it. Same program before and after.
function injectCard(material, key, cardUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, cardUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', FADE_VERT_HEAD + '\nattribute float aCell;\nuniform vec4 uCardAtlas;\nuniform float uCardFlip;')
      .replace('#include <begin_vertex>', FADE_VERT_BODY)
      .replace('#include <uv_vertex>', `#include <uv_vertex>
          #ifdef USE_MAP
          if (uCardAtlas.w > 0.5) {
            vec2 castUv = vMapUv;
            if (uCardFlip > 0.5 && normal.z < 0.0) castUv.x = 1.0 - castUv.x;
            float castCell = floor(aCell + 0.5);
            float castCol = mod(castCell, uCardAtlas.z), castRow = floor(castCell / uCardAtlas.z);
            vMapUv = vec2(castCol * uCardAtlas.x, 1.0 - (castRow + 1.0) * uCardAtlas.y) + castUv * uCardAtlas.xy;
          }
          #endif`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', FADE_FRAG_HEAD)
      .replace('#include <clipping_planes_fragment>', FADE_DISCARD);
  };
  material.customProgramCacheKey = () => key;
  return material;
}
// FIX-PLAN-R5 S6: which document each card carries. Fixed where the card matches its wall; else hash(name) % 10.
// Wall 04's cards are all the job sheet: the piles trade slots at the loop seam, so every sheet must look the same.
const CARD_DOC_NAMES = ['note', 'invoice', 'kanban', 'sheet', 'receipt', 'decision', 'chart', 'photo', 'checklist', 'memo'];
const CARD_DOC_FIXED = { 'W01.c1a': 'note', 'W01.c1b': 'note', 'W02.k1': 'invoice', 'W02.k2': 'invoice', 'W03.c3a': 'kanban',
  'W03.c3b': 'kanban', 'W05.k1': 'receipt', 'W05.k2': 'receipt', 'W06.c6d': 'decision', 'W06.c6m': 'decision' };
const strHash = (str) => { let h = 2166136261; for (let k = 0; k < str.length; k++) { h ^= str.charCodeAt(k); h = Math.imul(h, 16777619) >>> 0; } return h; };
function cardDoc(c) {
  if (CARD_DOC_FIXED[c.id]) return CARD_DOC_FIXED[c.id];
  if (c.wall === 3) return 'sheet';
  return CARD_DOC_NAMES[strHash(c.name) % CARD_DOC_NAMES.length];
}

// soft radial alpha (white RGB) for the day contact shadow
function decalTexture() {
  const w = 64, h = 64;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const ny = ((y + 0.5) / h) * 2 - 1;
    for (let x = 0; x < w; x++) {
      const nx = ((x + 0.5) / w) * 2 - 1;
      const r = Math.hypot(nx, ny);
      const a = Math.pow(1 - smoothstep(0.3, 1, r), 1.3);   // flat core: the ring outside the body footprint reads
      const i = (y * w + x) * 4;
      d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// FIX-PLAN-R2 S3: the paper card's map. White fill (it multiplies the paper colour) inside a 3 px hairline in
// THEMES.day.cardEdge (--rc-g-700). Built once; one texture serves both themes. The CSS colour is derived from the
// THEMES value, so no colour literal lives here.
function cardTexture(THEMES) {
  const d = THEMES.day || {};
  const edge = new THREE.Color(d.cardEdge !== undefined ? d.cardEdge : d.agentColor);
  const paper = new THREE.Color(1, 1, 1);
  const c = document.createElement('canvas');
  c.width = CARD_TEX_W; c.height = CARD_TEX_H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#' + edge.getHexString();
  ctx.fillRect(0, 0, CARD_TEX_W, CARD_TEX_H);
  ctx.fillStyle = '#' + paper.getHexString();
  ctx.fillRect(CARD_EDGE_PX, CARD_EDGE_PX, CARD_TEX_W - 2 * CARD_EDGE_PX, CARD_TEX_H - 2 * CARD_EDGE_PX);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// S1.4 the face atlas: 1024x128, 8 slots of 128, glyphs white on black (a coverage mask, not a colour).
//   0 open eyes (two rounded bars 18x34 at x 64±22, y 60) + a 3 px mouth arc; 1 blink (two 22x5 lines);
//   2 happy (two ^ chevrons, 5 px); 3 / 4 look: the open eyes shifted 14 px to the figure's right / left.
//   Slots 5-7 are spare on the floor (FIX-PLAN-R4 deferred: a 'working' frame).
// FIX-PLAN-R6 S3.2: faceAtlas(cols) is 128·cols wide (the floor 8 = 1024, the guides 16 = 2048); slots 0-4 are painted
// identically at either width, the rest stay black (the guides paint 5-8 from faces/guide-glyphs.js). Returns the
// texture; its canvas is tex.image.
export const FACE_FRAMES = { open: 0, blink: 1, happy: 2, lookR: 3, lookL: 4 };
function faceAtlas(cols = 8) {
  const c = document.createElement('canvas');
  const W = 128 * cols;
  c.width = W; c.height = 128;
  const g = c.getContext('2d');
  const ON = 'rgb(255, 255, 255)', OFF = 'rgb(0, 0, 0)';
  g.fillStyle = OFF;
  g.fillRect(0, 0, W, 128);
  g.fillStyle = ON; g.strokeStyle = ON; g.lineCap = 'round'; g.lineJoin = 'round';
  const pill = (cx, cy, w, h) => {   // a rounded bar, fully rounded on its short side
    const r = Math.min(w, h) / 2, x = cx - w / 2, y = cy - h / 2;
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -PI / 2, 0);
    g.lineTo(x + w, y + h - r); g.arc(x + w - r, y + h - r, r, 0, PI / 2);
    g.lineTo(x + r, y + h); g.arc(x + r, y + h - r, r, PI / 2, PI);
    g.lineTo(x, y + r); g.arc(x + r, y + r, r, PI, PI * 1.5);
    g.closePath(); g.fill();
  };
  const mouth = (cx, r, w) => { g.lineWidth = w; g.beginPath(); g.arc(cx, 82, r, 0.22 * PI, 0.78 * PI); g.stroke(); };
  const open = (ox, dx) => { pill(ox + 42 + dx, 60, 18, 34); pill(ox + 86 + dx, 60, 18, 34); mouth(ox + 64 + dx, 10, 3); };
  open(0, 0);
  pill(128 + 42, 62, 22, 5); pill(128 + 86, 62, 22, 5); mouth(128 + 64, 10, 3);
  g.lineWidth = 5;
  for (const cx of [256 + 42, 256 + 86]) { g.beginPath(); g.moveTo(cx - 11, 68); g.lineTo(cx, 55); g.lineTo(cx + 11, 68); g.stroke(); }
  mouth(256 + 64, 13, 3);
  // PlaneGeometry u runs from the figure's right (-x) to its left (+x), so the figure's right is -u
  open(384, -14);
  open(512, 14);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// S1.1 the human head, head-local (centre at the origin): skin sphere, hair cap (tilted back 22°, the forehead
// shows), the bun (collapsed per instance) and two small eyes, merged into one geometry with aPart.
function humanHeadGeometry() {
  const tag = (geo, part) => {
    const n = geo.getAttribute('position').count;
    geo.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(n).fill(part), 1));
    return geo;
  };
  const head = tag(new THREE.SphereGeometry(HUMAN_HEAD_R, 32, 20), 0);
  const cap = tag(new THREE.SphereGeometry(0.183, 32, 12, 0, TAU, 0, 0.46 * PI).rotateX(-22 * DEG), 1);
  const bun = tag(new THREE.SphereGeometry(0.065, 16, 12).translate(0, 0.10, -0.15), 2);
  const eyeL = tag(new THREE.SphereGeometry(0.020, 10, 8).translate(0.058, 0.015, 0.168), 3);
  const eyeR = tag(new THREE.SphereGeometry(0.020, 10, 8).translate(-0.058, 0.015, 0.168), 3);
  const geo = mergeGeometries([head, cap, bun, eyeL, eyeR], false);
  if (!geo) throw new Error('cast: head merge failed');
  return geo;
}

// FIX-PLAN-R5 S4: the nine cosmetics, merged, each vertex tagged aType (0-8) and aAlt (0 = the item's colour, 1 = its
// second colour). Local frames per ACC_ANCHOR (see the constants). Returns { geo, box, parts }: box[type] is the item's
// local AABB [minX, minY, minZ, maxX, maxY, maxZ]; parts[type] the AABB of each piece (brim, crown; ring, tail; band,
// cups ...), which the overlap proxies read (tighter than one box round a ring or an arc).
function accGeometry() {
  const parts = [], pieces = [[], [], [], [], [], [], [], [], []];
  // ring: a ring or an arc (the scarf, the headphone band) is boxed per 30° sector about its centre in the plane of the
  // two axes given (one box round a ring is mostly air)
  const add = (geo, type, alt, xf, ring) => {
    let g = geo.index ? geo.toNonIndexed() : geo;
    if (xf) xf(g);
    g.computeBoundingBox();
    const bb = g.boundingBox;
    if (!ring) pieces[type].push([bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z]);
    else {
      const ps = g.getAttribute('position'), c = [(bb.min.x + bb.max.x) / 2, (bb.min.y + bb.max.y) / 2, (bb.min.z + bb.max.z) / 2];
      const secs = new Map();
      for (let v = 0; v < ps.count; v++) {
        const p = [ps.getX(v), ps.getY(v), ps.getZ(v)];
        const k = Math.floor((Math.atan2(p[ring[1]] - c[ring[1]], p[ring[0]] - c[ring[0]]) + PI) / (PI / 6)) % 12;
        const b = secs.get(k) || [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
        for (let a = 0; a < 3; a++) { if (p[a] < b[a]) b[a] = p[a]; if (p[a] > b[a + 3]) b[a + 3] = p[a]; }
        secs.set(k, b);
      }
      for (const b of secs.values()) pieces[type].push(b);
    }
    const n = g.getAttribute('position').count;
    g.setAttribute('aType', new THREE.BufferAttribute(new Float32Array(n).fill(type), 1));
    g.setAttribute('aAlt', new THREE.BufferAttribute(new Float32Array(n).fill(alt), 1));
    for (const k of Object.keys(g.attributes)) if (['position', 'normal', 'uv', 'aType', 'aAlt'].indexOf(k) < 0) g.deleteAttribute(k);
    parts.push(g);
  };
  const HT = 0.15;                                            // the head's top face, head-local
  // a rotation about a pivot, applied in place (build time only)
  const about = (g, px, py, pz, rx, ry, rz) => {
    g.translate(-px, -py, -pz);
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    if (rz) g.rotateZ(rz);
    g.translate(px, py, pz);
  };
  // 0 top hat: brim r .11, crown r .07 h .10, a jaunty 8° roll to the figure's left
  {
    const tilt = (g) => { about(g, 0, HT, 0, 0, 0, 8 * DEG); g.translate(0.012, 0, 0); };
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.014, 28).translate(0, HT + 0.007, 0), 0, 0, tilt);
    add(new THREE.CylinderGeometry(0.066, 0.07, 0.10, 24).translate(0, HT + 0.014 + 0.05, 0), 0, 0, tilt);
    add(new THREE.CircleGeometry(0.066, 24).rotateX(-PI / 2).translate(0, HT + 0.114, 0), 0, 0, tilt);
  }
  // 1 slanted cap: crown .26 x .08 (a half ellipsoid), a button, a brim .12 forward; rolled 12°, turned 25°
  {
    const slant = (g) => about(g, 0, HT, 0, 0, 25 * DEG, 12 * DEG);
    add(new THREE.SphereGeometry(1, 24, 10, 0, TAU, 0, PI / 2).scale(0.13, 0.08, 0.135).translate(0, HT - 0.004, 0), 1, 0, slant);
    add(new THREE.SphereGeometry(0.016, 10, 8).translate(0, HT + 0.074, 0), 1, 0, slant);
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.012, 24, 1, false, -PI / 2, PI).scale(1, 1, 1.09).translate(0, 0, 0.08), 1, 0,
      (g) => { about(g, 0, 0, 0.08, 6 * DEG, 0, 0); g.translate(0, HT + 0.004, 0); slant(g); });
  }
  // 2 beanie: a dome .178 x .09 x .155 on a .035 cuff, and a pompom
  {
    add(new THREE.SphereGeometry(1, 24, 10, 0, TAU, 0, PI / 2).scale(0.172, 0.09, 0.15).translate(0, HT + 0.02, 0), 2, 0);
    add(new THREE.CylinderGeometry(1, 1, 0.035, 28).scale(0.178, 1, 0.156).translate(0, HT + 0.0045, 0), 2, 0);
    add(new THREE.SphereGeometry(0.034, 12, 10).translate(0, HT + 0.02 + 0.09 + 0.022, 0), 2, 0);
  }
  // 3 headphones: a band r .19 over the top (second colour), cups r .05 on the side faces
  {
    add(new THREE.TorusGeometry(0.19, 0.017, 8, 28, PI).translate(0, HT + 0.012 - 0.19, 0), 3, 1, null, [0, 1]);
    for (const sx of [-1, 1]) {
      add(new THREE.CylinderGeometry(0.05, 0.05, 0.036, 22).rotateZ(PI / 2).translate(sx * (0.17 + 0.018), HT + 0.012 - 0.19, 0), 3, 0);
    }
  }
  // 4 scarf: a ring between head and body (r .13 at the front, round the .26 x .20 body), and a .10 tail on the chest
  {
    add(new THREE.TorusGeometry(0.14, 0.032, 10, 30).rotateX(PI / 2).scale(1, 1, 0.84).translate(0, 0.368, 0), 4, 0, null, [0, 2]);
    add(new THREE.BoxGeometry(0.052, 0.10, 0.02).translate(0, -0.05, 0), 4, 0,
      (g) => { g.rotateZ(9 * DEG); g.rotateX(-10 * DEG); g.translate(0.055, 0.358, 0.118); });
  }
  // 5 tie: a knot and a .04 x .14 blade with a point, on the body front (leaning back 9° to follow the chest's curve)
  {
    const lean = (g) => { g.rotateX(-9 * DEG); g.translate(0, 0.35, 0.086); };
    const blade = new THREE.Shape();
    blade.moveTo(-0.014, 0); blade.lineTo(0.014, 0); blade.lineTo(0.021, -0.095); blade.lineTo(0, -0.125); blade.lineTo(-0.021, -0.095);
    blade.closePath();
    add(new THREE.ExtrudeGeometry(blade, { depth: 0.01, bevelEnabled: false }).translate(0, -0.018, 0), 5, 0, lean);
    add(new THREE.BoxGeometry(0.034, 0.026, 0.016).translate(0, -0.006, 0.004), 5, 0, lean);
  }
  // 6 bow tie: two wings .09 wide x .044 tall, and a knot, at the collar
  {
    for (const sx of [-1, 1]) {
      add(new THREE.ConeGeometry(0.024, 0.042, 4).rotateY(PI / 4).rotateZ(sx * PI / 2).scale(1, 1, 0.45).translate(sx * 0.023, 0, 0), 6, 0,
        (g) => g.translate(0, 0.338, 0.092));
    }
    add(new THREE.SphereGeometry(0.014, 10, 8).scale(1, 1, 0.8).translate(0, 0.338, 0.098), 6, 0);
  }
  // 7 glove (one per arm tip): a mitten r .042 round the tip, with a thumb
  {
    add(new THREE.SphereGeometry(0.042, 14, 10).scale(1, 1.12, 1).translate(0, 0.02, 0), 7, 0);
    add(new THREE.SphereGeometry(0.019, 10, 8).translate(0, 0.03, 0.036), 7, 0);
  }
  // 8 boot (one per foot): .095 x .062 x .125, toe forward, sole just under the floor
  add(new RoundedBoxGeometry(0.095, 0.062, 0.125, 2, 0.022).translate(0, 0.026, 0.018), 8, 0);

  const geo = mergeGeometries(parts, false);
  if (!geo) throw new Error('cast: accessory merge failed');
  const pos = geo.getAttribute('position'), ty = geo.getAttribute('aType');
  const box = [];
  for (let k = 0; k < 9; k++) box.push([Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]);
  for (let v = 0; v < pos.count; v++) {
    const b = box[Math.round(ty.getX(v))], x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
    if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (z < b[2]) b[2] = z;
    if (x > b[3]) b[3] = x; if (y > b[4]) b[4] = y; if (z > b[5]) b[5] = z;
  }
  return { geo, box, parts: pieces };
}

const COLOR_KEYS = ['humanColor', 'humanEmissive', 'rim', 'agentColor', 'agentHeadColor', 'agentHeadEmissive',
  'agentFaceColor', 'agentFaceEmissive', 'cardColor', 'cardEmissive', 'cardEdge', 'decalColor',
  'humanEye', 'humanTint', 'agentScreen', 'agentGlyph', 'agentLive', 'acc0', 'acc1', 'acc2', 'acc3', 'acc4', 'acc5'];
const NUM_KEYS = ['humanEmissiveI', 'humanRimI', 'agentHeadEmissiveI', 'agentFaceEmissiveI', 'agentRimI', 'cardEmissiveI',
  'decalOpacity', 'humanTintK', 'agentGlowI'];
// a missing FIX-PLAN-R4 key falls back to an existing THEMES key (never to a literal)
const COLOR_FALLBACK = { humanEye: 'decalColor', humanTint: 'humanColor', agentScreen: 'agentFaceColor', agentGlyph: 'agentFaceEmissive', agentLive: 'agentGlyph',
  // FIX-PLAN-R5 S4: until stage.js carries acc0-acc5, each cosmetic colour borrows an existing THEMES key
  acc0: 'humanEye', acc1: 'agentFaceColor', acc2: 'cardColor', acc3: 'agentFaceColor', acc4: 'cardEdge', acc5: 'agentScreen' };
const NUM_FALLBACK = { humanTintK: 1, agentGlowI: 'agentFaceEmissiveI' };
function prepTheme(src) {
  const out = {};
  const pick = (k) => {
    if (src[k] !== undefined) return src[k];
    const fb = COLOR_FALLBACK[k];
    if (fb) return pick(fb);
    return src.agentColor;   // any other missing key falls back to the agent body
  };
  for (const k of COLOR_KEYS) out[k] = new THREE.Color(pick(k));
  for (const k of NUM_KEYS) {
    let v = src[k];
    if (typeof v !== 'number') { const fb = NUM_FALLBACK[k]; v = typeof fb === 'number' ? fb : (typeof src[fb] === 'number' ? src[fb] : 0); }
    out[k] = v;
  }
  out.humanTintMul = out.humanTint.clone().multiplyScalar(out.humanTintK);
  return out;
}
// S1.3 the people palette: converted once at build. A missing person or part falls back to humanColor.
function prepPeople(THEMES) {
  const src = (THEMES.day && THEMES.day.people) || (THEMES.night && THEMES.night.people) || {};
  const base = (THEMES.day && THEMES.day.humanColor) || (THEMES.night && THEMES.night.humanColor);
  const col = (v) => new THREE.Color(v !== undefined ? v : base);
  const out = {};
  // FIX-PLAN-R5 S1: Sam (wall 05). Until stage.js carries PEOPLE.Sam, Sam falls back to humanColor like any missing part.
  for (const nm of ['Lim', 'Priya', 'Marcus', 'Nurul', 'Sam']) {
    const p = src[nm] || {};
    out[nm] = { skin: col(p.skin), hair: col(p.hair), top: col(p.top), trousers: col(p.trousers), bun: p.bun ? 1 : 0 };
  }
  out._default = { skin: col(), hair: col(), top: col(), trousers: col(), bun: 0 };
  return out;
}

// ---------------------------------------------------------------------------------------------------------
// FIX-PLAN-R6 S3: the parts the floor cast and the guide figures share, so both build one rig from one source: the
// geometry, the materials (same inject*, same customProgramCacheKey, same parameters: the program keys match while
// every material keeps its own uniforms), the card atlas (one upload), and the pose writer (makeRig).
// ---------------------------------------------------------------------------------------------------------
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

// fresh geometry for one cast (aFade and the other per-instance attributes are per geometry, so never shared)
function castGeometries() {
  // the plan's 10-point profile, run through a centripetal spline (48 points) so the clay reads soft, not faceted
  const bodyCurve = new THREE.SplineCurve(HUMAN_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
  const humanBodyGeo = new THREE.LatheGeometry(bodyCurve.getPoints(48).map((v) => new THREE.Vector2(Math.max(0, v.x), v.y)), 32);
  const agentBodyGeo = new RoundedBoxGeometry(0.26, 0.24, 0.20, 4, 0.07).translate(0, 0.24, 0);
  const humanHeadGeo = humanHeadGeometry();
  const agentHeadGeo = new RoundedBoxGeometry(0.34, 0.30, 0.28, 4, 0.06);
  const faceGeo = new THREE.PlaneGeometry(FACE_W, FACE_H);
  // unit capsules, pivot at the top (y 0), running down to -(2 + caps)
  const humanLimbGeo = new THREE.CapsuleGeometry(1, CAPS_H, 6, 12).translate(0, -(1 + CAPS_H / 2), 0);
  const agentLimbGeo = new THREE.CapsuleGeometry(1, CAPS_A, 6, 10).translate(0, -(1 + CAPS_A / 2), 0);
  const cardGeo = new THREE.BoxGeometry(0.16, 0.21, 0.008);
  // FIX-PLAN-R2 S3: the card's shadow caster, never a visible rim. FIX-PLAN-R5 S5: it sits wholly inside the card's
  // .008 (it stood .002 proud of the back), so the card's proxy is the card itself and a pile stacks on .008 sheets.
  const edgeGeo = new THREE.BoxGeometry(0.156, 0.206, 0.004).translate(0, 0, -0.0015);
  const decalGeo = new THREE.PlaneGeometry(DECAL_W, DECAL_D);
  decalGeo.rotateX(-PI / 2);
  return { humanBodyGeo, agentBodyGeo, humanHeadGeo, agentHeadGeo, faceGeo, humanLimbGeo, agentLimbGeo, cardGeo, edgeGeo, decalGeo,
    ACCG: accGeometry() };
}

// the cast materials, born final. T: a prepTheme() table (the initial colours; applyTheme / the guides rewrite them);
// U: the uniform objects { humanUni, agentUni, headUni, faceUni, cardUni }; faceCols: the face atlas's columns.
function castMaterials(T, THEMES, U, faceCols) {
  // S1.3: body and limbs carry their clothing per instance (aTint); the material colour is the theme tint
  const humanMat = injectFade(new THREE.MeshStandardMaterial({
    color: T.humanTintMul, roughness: 0.85, metalness: 0, emissive: T.humanEmissive, emissiveIntensity: T.humanEmissiveI,
  }), 'lens-cast-human', U.humanUni, true);
  const humanHeadMat = injectHead(new THREE.MeshStandardMaterial({
    color: T.humanTintMul, roughness: 0.85, metalness: 0, emissive: T.humanEmissive, emissiveIntensity: T.humanEmissiveI,
  }), 'lens-cast-human-head', U.humanUni, U.headUni);
  const agentBodyMat = injectFade(new THREE.MeshPhysicalMaterial({
    color: T.agentColor, roughness: 0.6, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.3,
  }), 'lens-cast-agent-body', U.agentUni);
  const agentHeadMat = injectFade(new THREE.MeshPhysicalMaterial({
    color: T.agentHeadColor, roughness: 0.6, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.3,
    emissive: T.agentHeadEmissive, emissiveIntensity: T.agentHeadEmissiveI,
  }), 'lens-cast-agent-head', U.agentUni);
  // S1.4: the agent's screen (the one agent-face program; its shader text changed, its key did not)
  const agentFaceMat = injectFace(new THREE.MeshStandardMaterial({
    map: faceAtlas(faceCols), color: new THREE.Color(1, 1, 1), roughness: 0.45, metalness: 0,
  }), 'lens-cast-agent-face', U.faceUni);
  // FIX-PLAN-R5 S6: the R2 hairline card is the initial map; the FACES document atlas replaces it once it loads
  const cardMat = injectCard(new THREE.MeshStandardMaterial({
    map: cardTexture(THEMES), color: T.cardColor, roughness: 0.7, metalness: 0, emissive: T.cardEmissive, emissiveIntensity: T.cardEmissiveI,
  }), 'lens-cast-card', U.cardUni);
  // FIX-PLAN-R5 S4: the cosmetics, clothing under the same light as the people's clothes (the theme tint, the night
  // emissive), with the agent rim
  const accMat = injectAcc(new THREE.MeshStandardMaterial({
    color: T.humanTintMul, roughness: 0.8, metalness: 0, emissive: T.humanEmissive, emissiveIntensity: T.humanEmissiveI,
  }), 'lens-cast-acc', U.agentUni);
  const decalMat = injectDecalFade(new THREE.MeshBasicMaterial({
    map: decalTexture(), transparent: true, depthWrite: false, color: T.decalColor, opacity: T.decalOpacity,
  }), 'lens-cast-decal');
  // one depth material for every shadow-casting cast mesh: the same step, so a gone figure casts nothing
  const depthMat = injectFade(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), 'lens-cast-depth', null);
  return { humanMat, humanHeadMat, agentBodyMat, agentHeadMat, agentFaceMat, cardMat, accMat, decalMat, depthMat };
}

// S6: the FACES document atlas, built and uploaded once per page (a module-level cache: the floor and the guides share
// the one texture). Never a static import: without js/faces/cards.js (or if it throws) the promise resolves null or
// rejects, and each caller keeps its R2 hairline card.
let cardAtlasP = null;
function cardAtlas() {
  if (!cardAtlasP) {
    cardAtlasP = import('./faces/cards.js').then((M) => {
      if (!M || typeof M.drawCardAtlas !== 'function' || !M.CARD_ATLAS) return null;
      const cv = M.drawCardAtlas(document.createElement('canvas'));
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.needsUpdate = true;
      return { tex, A: M.CARD_ATLAS, docs: Array.isArray(M.CARD_DOCS) && M.CARD_DOCS.length ? M.CARD_DOCS : null };
    });
  }
  return cardAtlasP;
}

// FIX-PLAN-R6 S3.4: the pose writer, lifted out of buildCast so the floor and the guides share one rig. R holds one
// cast's mesh set { HB, HH, HL, AB, AH, AL, AF, CD, CE (may be null), DC, ACC } (each { m, fade, rim, ... } from mk),
// its per-figure arrays (limbA, armS, armR, hx..hz, kx..kz, kyaw, reachW, flatW, accLimb, accHead, accBody) and its
// card scale R.cardS (read on every write). The text of writeFigure / writeCard is the floor's own, so the floor's
// output is bit-identical (proof: _dev/r10-cast-parity.mjs). The scratch is per rig.
function makeRig(R) {
  const { HB, HH, HL, AB, AH, AL, AF, CD, CE, DC, ACC } = R;
  const { limbA, armS, armR, hx, hy, hz, kx, ky, kz, kyaw, reachW, flatW, accLimb, accHead, accBody } = R;
  const mF = new THREE.Matrix4(), mL = new THREE.Matrix4(), mH = new THREE.Matrix4(), m4 = new THREE.Matrix4();
  const vP = new THREE.Vector3(), vS = new THREE.Vector3(), vH = new THREE.Vector3(), vT = new THREE.Vector3(), vU = new THREE.Vector3();
  const q = new THREE.Quaternion(), qh = new THREE.Quaternion(), ql = new THREE.Quaternion();
  const mA = new THREE.Matrix4(), vA = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1), QI = new THREE.Quaternion();
  const eu = new THREE.Euler(0, 0, 0, 'YXZ'), euh = new THREE.Euler(0, 0, 0, 'YXZ'), eul = new THREE.Euler(0, 0, 0, 'XYZ');

  // One figure: body, head, screen, four limbs and the contact decal, all under one root matrix at scale 1. The
  // hands and carried-card centres are written whether or not the figure is shown.
  // th: the body yaw about +y; th 0 faces +z, th π/2 faces +x (atan2(dx, dz) of the facing direction).
  function writeFigure(f, x, y0, z, th, lean, roll, hYaw, hPitch, hRoll, vis, fRaw, bob, rimW, breath, headBob) {
    const human = f.human, n = f.n, i = f.slot, sp = f.sp;
    const body = human ? HB : AB, head = human ? HH : AH, limbs = human ? HL : AL;
    const caps2 = 2 + sp.caps;
    body.rim[i] = rimW; head.rim[i] = rimW;
    for (let k = 0; k < 4; k++) limbs.rim[i * 4 + k] = rimW;
    eu.set(lean, th, roll, 'YXZ');
    q.setFromEuler(eu);
    vP.set(x, y0, z); vS.set(1, 1, 1);
    mF.compose(vP, q, vS);
    // limbs first: the hands are needed even for a hidden figure (a card may still be in flight to it)
    for (let k = 0; k < 4; k++) {
      const leg = k < 2, pitch = limbA[n * 4 + k];
      const lr = leg ? (k === 0 ? sp.legRoll : -sp.legRoll) : (k === 2 ? armR[n * 2] : -armR[n * 2 + 1]);
      eul.set(-pitch, 0, lr, 'XYZ');
      ql.setFromEuler(eul);
      if (leg) {
        vH.set(k === 0 ? sp.legX : -sp.legX, sp.hipY, 0);
        const len = (sp.hipY + bob) / (Math.cos(pitch) * Math.cos(lr));   // the foot stays on the floor
        vS.set(sp.legR, len / caps2, sp.legR);
      } else {
        vH.set(k === 2 ? sp.armX : -sp.armX, sp.shY, 0);
        vS.set(sp.armR, sp.armL * armS[n * 2 + (k === 3 ? 1 : 0)] / caps2, sp.armR);
      }
      mL.compose(vH, ql, vS);
      m4.multiplyMatrices(mF, mL);
      if (vis) limbs.m.setMatrixAt(i * 4 + k, m4); else limbs.m.setMatrixAt(i * 4 + k, ZERO);
      limbs.fade[i * 4 + k] = vis ? 1 : 0;
      // S4: a glove on this arm's tip frame, a boot on this leg's foot (turned with the body)
      const as = accLimb[n * 4 + k];
      if (as >= 0) {
        ACC.fade[as] = vis ? 1 : 0; ACC.rim[as] = rimW;
        if (!vis) ACC.m.setMatrixAt(as, ZERO);
        else {
          if (leg) { vA.set(0, -vS.y * caps2, 0).applyQuaternion(ql).add(vH); mA.compose(vA, QI, ONE); }
          else { vA.set(0, -sp.armL * armS[n * 2 + (k === 3 ? 1 : 0)], 0).applyQuaternion(ql).add(vH); mA.compose(vA, ql, ONE); }
          m4.multiplyMatrices(mF, mA);
          ACC.m.setMatrixAt(as, m4);
        }
      }
      if (!leg) {
        const j = n * 2 + (k === 3 ? 1 : 0);
        vT.set(0, -sp.armL * armS[j], 0).applyQuaternion(ql).add(vH);
        vU.copy(vT).applyMatrix4(mF);
        hx[j] = vU.x; hy[j] = vU.y; hz[j] = vU.z;
        // S5 the carried card's pose off this hand (see CARD_SWING), body frame, sx = the hand's outward side.
        //   carry: u = (−sx cos α, 0, sin α) (across the chest at α 0, ahead at α 90°), the plane ahead by cardFwd · cos α;
        //          yaw θ + sx α;
        //   reach (weight rw, a hand-off): the sheet turns to face along the pair (yaw θ + sx 90°), centred on the hand,
        //          its plane CARD_E_SIDE outside the hand, so the two meeting hands pinch its inner face;
        //   flat (weight fw, a pin): it faces the glass (yaw θ), across in front of the face as at α 0, but CARD_PIN_FWD
        //          ahead of the hand, clear of the pinner's face as the arm comes up.
        const left = k === 2, sx = left ? 1 : -1;
        const rw = reachW[j], fw = Math.min(flatW[j], 1 - rw), w2 = CARD_W2 * R.cardS;
        const alpha = CARD_SWING * Math.max(0, -sx * Math.sin(th)) * (1 + Math.cos(th)) / 2;
        const ca = Math.cos(alpha), sa = Math.sin(alpha);
        const ext = w2 + sp.cardE0 * ca + sp.cardE1 * sa, bo = sp.cardFwd * ca;
        const wc = 1 - rw - fw;
        vT.set(sx * ((sa * bo - ca * ext) * wc + CARD_E_SIDE * rw - (w2 + sp.cardE0) * fw), sp.cardUp,
          (sa * ext + ca * bo) * wc + CARD_PIN_FWD * fw).applyQuaternion(q);
        kx[j] = vU.x + vT.x; ky[j] = vU.y + vT.y; kz[j] = vU.z + vT.z;
        kyaw[j] = th + sx * (alpha * wc + (PI / 2) * rw);
      }
    }
    body.fade[i] = vis ? 1 : 0; head.fade[i] = vis ? 1 : 0; DC.fade[n] = vis ? fRaw : 0;
    if (!human) AF.fade[i] = vis ? 1 : 0;
    const ah = accHead[n], ab = accBody[n];
    if (ah >= 0) { ACC.fade[ah] = vis ? 1 : 0; ACC.rim[ah] = rimW; }
    if (ab >= 0) { ACC.fade[ab] = vis ? 1 : 0; ACC.rim[ab] = rimW; }
    if (!vis) {
      body.m.setMatrixAt(i, ZERO); head.m.setMatrixAt(i, ZERO); DC.m.setMatrixAt(n, ZERO);
      if (!human) AF.m.setMatrixAt(i, ZERO);
      if (ah >= 0) ACC.m.setMatrixAt(ah, ZERO);
      if (ab >= 0) ACC.m.setMatrixAt(ab, ZERO);
      return;
    }
    mL.makeScale(sp.bodyS[0], sp.bodyS[1] * breath, sp.bodyS[2]);
    m4.multiplyMatrices(mF, mL);
    body.m.setMatrixAt(i, m4);
    if (ab >= 0) ACC.m.setMatrixAt(ab, mF);
    euh.set(-hPitch, hYaw, hRoll, 'YXZ');
    qh.setFromEuler(euh);
    vH.set(0, sp.headY + headBob, 0); vS.set(1, 1, 1);
    mL.compose(vH, qh, vS);
    mH.multiplyMatrices(mF, mL);
    head.m.setMatrixAt(i, mH);
    if (ah >= 0) ACC.m.setMatrixAt(ah, mH);
    if (!human) {
      mL.makeTranslation(0, FACE_DY, FACE_DZ);
      m4.multiplyMatrices(mH, mL);
      AF.m.setMatrixAt(i, m4);
    }
    // contact decal on the ground, turned with the figure
    eu.set(0, th, 0, 'YXZ'); q.setFromEuler(eu);
    vP.set(x, DECAL_Y, z); vS.set(sp.decal, sp.decal, sp.decal);
    m4.compose(vP, q, vS);
    DC.m.setMatrixAt(n, m4);
  }
  function writeCard(n, x, y, z, yaw, pitch, roll, vis, cardS) {
    CD.fade[n] = vis ? 1 : 0; if (CE) CE.fade[n] = vis ? 1 : 0;
    if (!vis) { CD.m.setMatrixAt(n, ZERO); if (CE) CE.m.setMatrixAt(n, ZERO); return; }
    eu.set(pitch, yaw, roll, 'YXZ');
    q.setFromEuler(eu);
    vP.set(x, y, z); vS.set(cardS, cardS, cardS);
    m4.compose(vP, q, vS);
    CD.m.setMatrixAt(n, m4);
    if (CE) CE.m.setMatrixAt(n, m4);
  }
  return { writeFigure, writeCard };
}

// ---------------------------------------------------------------------------------------------------------
// buildCast. buildCast(scene, { THEMES }); an extra msaa key from an older stage is ignored.
// ---------------------------------------------------------------------------------------------------------
export function buildCast(scene, { THEMES }) {
  const TH = { day: prepTheme(THEMES.day), night: prepTheme(THEMES.night) };
  const PEOPLE = prepPeople(THEMES);
  const C = compileScripts();
  const FIGS = C.figs, CARDS = C.cards;
  const NF = FIGS.length, NC = CARDS.length;
  // S11: the pair each wall's copy addresses ('a|b' alternates both qualify); traffic never
  const inPair = new Uint8Array(NF);
  for (let n = 0; n < NF; n++) {
    const f = FIGS[n];
    if (f.wall >= 0) for (const alts of PAIRS[f.wall]) if (alts.indexOf(f.name) >= 0) inPair[n] = 1;
  }
  // S2.3: at the hero (pos < .5) the rim sits on the held hand-off pair only, never courier-b
  const heroRim = new Uint8Array(NF);
  for (let n = 0; n < NF; n++) if (FIGS[n].id === 'W01.Lim' || FIGS[n].id === 'W01.courier-a') heroRim[n] = 1;
  // S1.6: capacity (4 limbs per figure, one screen per agent, one decal per figure)
  if (C.humans > CAP.hb || C.humans > CAP.hh || C.humans * 4 > CAP.hl || C.agents > CAP.ab || C.agents > CAP.ah
    || C.agents > CAP.face || C.agents * 4 > CAP.al || NC > CAP.card || NF > CAP.decal) throw new Error('cast: over capacity');

  const root = new THREE.Group();
  root.name = 'lens-cast';
  scene.add(root);

  // ---- materials (final form from birth; FIX-PLAN-R6: built by castMaterials, shared with the guides) ---------
  const D0 = TH.day;
  const humanUni = { uRimColor: { value: new THREE.Color().copy(D0.rim) }, uRimI: { value: D0.humanRimI } };
  const agentUni = { uRimColor: { value: new THREE.Color().copy(D0.rim) }, uRimI: { value: D0.agentRimI } };
  const headUni = { uEye: { value: new THREE.Color().copy(D0.humanEye) } };
  const faceUni = { uScreen: { value: new THREE.Color().copy(D0.agentScreen) }, uGlyph: { value: new THREE.Color().copy(D0.agentGlyph) },
    uLive: { value: new THREE.Color().copy(D0.agentLive) }, uGlow: { value: D0.agentGlowI }, uFaceCols: { value: 8 } };
  const cardUni = { uCardAtlas: { value: new THREE.Vector4(1, 1, 1, 0) }, uCardFlip: { value: 0 } };
  const { humanMat, humanHeadMat, agentBodyMat, agentHeadMat, agentFaceMat, cardMat, accMat, decalMat, depthMat } =
    castMaterials(D0, THEMES, { humanUni, agentUni, headUni, faceUni, cardUni }, 8);

  // ---- geometry (one per mesh: aFade is a geometry attribute) --------------------------------------------
  const { humanBodyGeo, agentBodyGeo, humanHeadGeo, agentHeadGeo, faceGeo, humanLimbGeo, agentLimbGeo, cardGeo, edgeGeo, decalGeo,
    ACCG } = castGeometries();
  const accGeo = ACCG.geo, ACC_PIECES = ACCG.parts;
  const aSel = new Float32Array(CAP.acc), aColA = new Float32Array(CAP.acc * 3), aColB = new Float32Array(CAP.acc * 3);
  accGeo.setAttribute('aSel', new THREE.InstancedBufferAttribute(aSel, 1));
  const accColAttr = new THREE.InstancedBufferAttribute(aColA, 3), accCol2Attr = new THREE.InstancedBufferAttribute(aColB, 3);
  accGeo.setAttribute('aColor', accColAttr);
  accGeo.setAttribute('aColor2', accCol2Attr);
  // S6: the document cell per card (both the card and its shadow caster: the caster's back face is the one seen from behind)
  const aCell = new Float32Array(CAP.card);
  cardGeo.setAttribute('aCell', new THREE.InstancedBufferAttribute(aCell, 1));
  edgeGeo.setAttribute('aCell', new THREE.InstancedBufferAttribute(aCell, 1));

  const meshes = [];
  const mk = (name, geo, mat, cap, shadow, rimmed) => {
    const fade = new Float32Array(cap);
    const attr = new THREE.InstancedBufferAttribute(fade, 1);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aFade', attr);
    // S11: per-instance rim weight on every mesh whose material carries the rim
    let rim = null, rimAttr = null;
    if (rimmed) {
      rim = new Float32Array(cap);
      rimAttr = new THREE.InstancedBufferAttribute(rim, 1);
      rimAttr.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('aRim', rimAttr);
    }
    const m = new THREE.InstancedMesh(geo, mat, cap);
    m.name = 'cast-' + name;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    m.castShadow = shadow;
    m.receiveShadow = false;
    if (shadow) m.customDepthMaterial = depthMat;
    for (let k = 0; k < cap; k++) m.setMatrixAt(k, ZERO);
    root.add(m);
    meshes.push(m);
    return { m, fade, attr, rim, rimAttr, arr: m.instanceMatrix.array };
  };
  // the head's per-instance people attributes (static)
  const aSkin = new Float32Array(CAP.hh * 3), aHair = new Float32Array(CAP.hh * 3), aBun = new Float32Array(CAP.hh);
  humanHeadGeo.setAttribute('aSkin', new THREE.InstancedBufferAttribute(aSkin, 3));
  humanHeadGeo.setAttribute('aHair', new THREE.InstancedBufferAttribute(aHair, 3));
  humanHeadGeo.setAttribute('aBun', new THREE.InstancedBufferAttribute(aBun, 1));
  const tintHB = new Float32Array(CAP.hb * 3).fill(1), tintHL = new Float32Array(CAP.hl * 3).fill(1);
  humanBodyGeo.setAttribute('aTint', new THREE.InstancedBufferAttribute(tintHB, 3));
  humanLimbGeo.setAttribute('aTint', new THREE.InstancedBufferAttribute(tintHL, 3));
  const aFrame = new Float32Array(CAP.face);
  const frameAttr = new THREE.InstancedBufferAttribute(aFrame, 1);
  frameAttr.setUsage(THREE.DynamicDrawUsage);
  faceGeo.setAttribute('aFrame', frameAttr);

  const HB = mk('humanBody', humanBodyGeo, humanMat, CAP.hb, true, true);
  const HH = mk('humanHead', humanHeadGeo, humanHeadMat, CAP.hh, true, true);
  const HL = mk('humanLimbs', humanLimbGeo, humanMat, CAP.hl, true, true);
  const AB = mk('agentBody', agentBodyGeo, agentBodyMat, CAP.ab, true, true);
  const AH = mk('agentHead', agentHeadGeo, agentHeadMat, CAP.ah, true, true);
  const AL = mk('agentLimbs', agentLimbGeo, agentBodyMat, CAP.al, true, true);
  const AF = mk('agentFace', faceGeo, agentFaceMat, CAP.face, false);
  const CD = mk('cards', cardGeo, cardMat, CAP.card, false);
  // the card's shadow caster, on the card material (no human rim, no human emissive on a card)
  const CE = mk('cardEdges', edgeGeo, cardMat, CAP.card, true);
  const DC = mk('decals', decalGeo, decalMat, CAP.decal, false);
  DC.m.renderOrder = -4;
  // S4: one draw call for all eleven cosmetic instances; no shadow (the shared depth program would draw all nine shapes)
  const ACC = mk('accessories', accGeo, accMat, CAP.acc, false, true);
  const RIMMED = [HB, HH, HL, AB, AH, AL, ACC];

  // S1.3: clothing and people colours, per instance, once (both Lim instances share Lim's row, and so on)
  {
    const put = (arr, k, c) => { arr[k * 3] = c.r; arr[k * 3 + 1] = c.g; arr[k * 3 + 2] = c.b; };
    for (const f of FIGS) {
      if (!f.human) continue;
      const p = PEOPLE[f.name] || PEOPLE._default, i = f.slot;
      put(tintHB, i, p.top);
      put(tintHL, i * 4, p.trousers); put(tintHL, i * 4 + 1, p.trousers);
      put(tintHL, i * 4 + 2, p.top); put(tintHL, i * 4 + 3, p.top);
      aSkin[i * 3] = p.skin.r; aSkin[i * 3 + 1] = p.skin.g; aSkin[i * 3 + 2] = p.skin.b;
      aHair[i * 3] = p.hair.r; aHair[i * 3 + 1] = p.hair.g; aHair[i * 3 + 2] = p.hair.b;
      aBun[i] = p.bun;
    }
  }

  // S4: who wears which cosmetic. accHead / accBody: the instance slot on figure n (-1 none); accLimb[n*4 + k]: the slot on
  // limb k (legL, legR, armL, armR). accOwner / accType per slot; unused slots stay zero-scaled.
  const accHead = new Int8Array(NF).fill(-1), accBody = new Int8Array(NF).fill(-1), accLimb = new Int8Array(NF * 4).fill(-1);
  const accOwner = new Int16Array(CAP.acc).fill(-1), accType = new Int8Array(CAP.acc).fill(-1);
  {
    let slot = 0;
    for (const [id, item] of ACC_WEAR) {
      const f = FIGS.find((g) => g.id === id), ty = ACC_T[item];
      if (!f || f.human || ty === undefined) continue;
      const an = ACC_ANCHOR[ty];
      const limbs = an === 'arm' ? [2, 3] : an === 'leg' ? [0, 1] : [-1];
      for (const k of limbs) {
        if (slot >= CAP.acc) break;
        accOwner[slot] = f.n; accType[slot] = ty; aSel[slot] = ty;
        if (an === 'head') accHead[f.n] = slot; else if (an === 'body') accBody[f.n] = slot; else accLimb[f.n * 4 + k] = slot;
        slot++;
      }
    }
  }
  // S6: the document on each card, as an index into CARD_DOC_NAMES (re-keyed to the atlas's own CARD_DOCS on load)
  const cardDocName = CARDS.map(cardDoc);
  for (let n = 0; n < NC; n++) aCell[n] = CARD_DOC_NAMES.indexOf(cardDocName[n]);

  // ---- scratch (reused; update() allocates nothing; the pose writer's own scratch lives in its rig) ----------
  const P = { x: 0, z: 0, spd: 0, tau: 0 };
  const P2 = { x: 0, z: 0, spd: 0, tau: 0 };
  const LP = { x: 0, z: 0, th: 0, s: 0, L: 1, spd: 0, tau: 0, vis: 1 };
  const HD = { yaw: 0, roll: 0, body: 0, eye: 0, eyeW: 0 };
  const RS = { p: 0, s: 1, r: 0 };

  // per-frame results (read by cards, inspect)
  const tlw = new Float64Array(NW), wallZ = new Float64Array(NW), wallW = new Float64Array(NW);
  const fx = new Float64Array(NF), fy = new Float64Array(NF), fz = new Float64Array(NF), fth = new Float64Array(NF);
  const fFade = new Float64Array(NF), fVis = new Uint8Array(NF), fLean = new Float64Array(NF), fFrame = new Uint8Array(NF);
  const limbA = new Float64Array(NF * 4);                                  // legL, legR, armL, armR pitch (rad)
  const armS = new Float64Array(NF * 2), armR = new Float64Array(NF * 2); // arm length factor and roll [L, R]
  const hx = new Float64Array(NF * 2), hy = new Float64Array(NF * 2), hz = new Float64Array(NF * 2);   // hands [L, R]
  const kx = new Float64Array(NF * 2), ky = new Float64Array(NF * 2), kz = new Float64Array(NF * 2);   // carried card centres
  // S5: carried card yaw; the hand-off reach weight and the pin weight per hand (see writeFigure)
  const kyaw = new Float64Array(NF * 2), reachW = new Float64Array(NF * 2), flatW = new Float64Array(NF * 2);
  const reachF = new Int16Array(NF * 2).fill(-1);   // S5: the partner this hand is reaching to (a hand-off), -1 none
  const thN = new Float64Array(NF);
  for (let n = 0; n < NF; n++) thN[n] = 0.35 + 0.30 * hash1(n);        // staggered step thresholds (outside the tour)
  // FIX-PLAN-R5 S7.5: in the tour a figure steps on its wall's raw presence at th_f = .30 + .40 · rank / (n − 1), rank
  // by the wall-local home-mark x, left to right, among that wall's crew. The arriving crew (presence rising over
  // e .48–.68) appears left to right over e ≈ .55–.61, the leaving crew goes right to left over e ≈ .39–.45, and no
  // figure changes while its wall is above .70. Precomputed once; traffic keeps thN.
  const thTour = new Float64Array(NF);
  for (let i = 0; i < NW; i++) {
    // the home mark: p0, or for a figure that walks in from the aisle (it fades in) the end of its walk in (a courier
    // ranks at its mark by the glass, not at the aisle)
    const homeX = (f) => (f.ramps.length && f.walks.length ? f.walks[0].ex : f.p0x);
    const crew = FIGS.filter((f) => f.wall === i).sort((a, b) => (homeX(a) - homeX(b)) || (a.n - b.n));
    const m = crew.length;
    crew.forEach((f, r) => { thTour[f.n] = TOUR_TH0 + TOUR_THK * (m > 1 ? r / (m - 1) : 0); });
  }
  for (let n = 0; n < NF; n++) if (FIGS[n].wall < 0) thTour[n] = thN[n];
  const cx = new Float64Array(NC), cy = new Float64Array(NC), cz = new Float64Array(NC), cFade = new Float64Array(NC);
  const cMode = new Int8Array(NC), cSide = new Int8Array(NC);
  // S5: the hands that grip each card this frame (figure n and arm limb index 2 = left, 3 = right; -1 none): the overlap
  // test exempts the gripping hand's last .05 from its card (and the two gripping hands of a hand-off from each other)
  const gripF0 = new Int16Array(NC).fill(-1), gripK0 = new Int8Array(NC), gripF1 = new Int16Array(NC).fill(-1), gripK1 = new Int8Array(NC);
  const cFrom = new Array(NC).fill(''), cTo = new Array(NC).fill('');
  // FIX-PLAN-R6 S3.4: the shared pose writer over this cast's meshes and arrays (cardS: the card scale this frame)
  const rig = { HB, HH, HL, AB, AH, AL, AF, CD, CE, DC, ACC, limbA, armS, armR, hx, hy, hz, kx, ky, kz, kyaw, reachW, flatW,
    accLimb, accHead, accBody, cardS: CARD_S_TOUR };
  const { writeFigure, writeCard } = makeRig(rig);
  let lastReduced = false;
  let motion = true;
  let camP = null;
  let pushOn = false, camFX = 0, camFZ = -1, cullR = FIG_CULL_R;   // push-through flag, lens forward in xz, base radius
  let lastS = 2, lastGlide = 0, lastTour = 0;
  let heroHeld = false;   // S2.2: wall 01 pinned at HERO_TL last frame (non-reduced)

  // ---- per-figure script evaluation (pure) ---------------------------------------------------------------
  const uOf = (f, tl) => f.base + fmod(tl + f.shift - f.base, f.T);

  function posU(f, u, out) {
    out.x = f.p0x; out.z = f.p0z; out.spd = 0; out.tau = 0;
    const W = f.walks;
    for (let k = 0; k < W.length; k++) {
      const w = W[k];
      if (u < w.t0) break;
      if (u < w.t1) {
        const tau = u - w.t0;
        pathPoint(w, walkS(w, tau));
        out.x = SP.x; out.z = SP.z; out.spd = walkSpeedK(w, tau); out.tau = tau;
        break;
      }
      out.x = w.ex; out.z = w.ez;
    }
    if (motion) {
      for (let k = 0; k < f.writes.length; k++) {
        const a = f.writes[k][0], b = f.writes[k][1];
        const ww = winT(a, b - 0.3, 0.3, 0.3, u, f.T);
        if (ww > 0) out.x += f.writes[k][2] * Math.sin(TAU * (u - a) / 1.1) * ww;
      }
    }
    return out;
  }
  const posTl = (f, tl, out) => posU(f, uOf(f, tl), out);

  function specAngle(sp, f, tl, u, x, z) {
    switch (sp.k) {
      case 0: return sp.a;
      case 1: posTl(sp.f, tl, P2); return Math.atan2(P2.x - x, P2.z - z);
      case 2: return Math.atan2(sp.x - x, sp.z - z);
      case 3: { const w = sp.w; return pathDirS(w, walkS(w, clamp(u - w.t0, 0, w.D))); }
      default: return 0;
    }
  }
  // A turn picks its direction once, at its start: while it blends, a moving target (a walk path, a walking partner)
  // is unwrapped from its value at the turn's start, so it can never flip across the back mid-turn.
  function yawU(f, tl, u, x, z) {
    let th = specAngle(f.face0, f, tl, u, x, z);
    const L = f.layers;
    for (let k = 0; k < L.length; k++) {
      const l = L[k];
      if (u < l.t0) break;
      const w = smoothstep(l.t0, l.tEnd, u);
      if (w <= 0) continue;
      const tg = specAngle(l.spec, f, tl, u, x, z);
      if (w >= 1 || l.spec.k === 0 || l.spec.k === 2) { th += wrapPi(tg - th) * w; continue; }
      const tg0 = specAngle(l.spec, f, tl - (u - l.t0), l.t0, x, z);
      th += (wrapPi(tg0 - th) + wrapPi(tg - tg0)) * w;
    }
    return wrapPi(th);
  }
  // head yaw (relative to the scripted body yaw), the listening tilt, a human's torso share, and (S1.4) the eyes'
  // target: the strongest person look's bearing relative to the body → HD. Agents turn the head 60 % of a look.
  function headU(f, tl, u, x, z, th, idle) {
    let v = idle, r = 0, b = 0, eye = 0, eyeW = 0;
    const L = f.looks;
    const hk = f.human ? 1 : AGENT_HEAD_K;
    for (let k = 0; k < L.length; k++) {
      const l = L[k];
      const w = winT(l.a, l.b, l.rin, l.rout, u, f.T);
      if (w <= 0) continue;
      if (l.spec.k === 4) { v -= v * w; r -= r * w; b -= b * w; eyeW -= eyeW * w; continue; }
      const rel = wrapPi(specAngle(l.spec, f, tl, u, x, z) - th);
      const tgt = clamp(rel, -HEAD_CLAMP, HEAD_CLAMP) * hk;
      v += (tgt - v) * w;
      const person = l.spec.k === 1;
      r += ((person ? -HEAD_TILT * clamp(rel / (10 * DEG), -1, 1) : 0) - r) * w;
      b += ((person && f.human ? TORSO_SHARE * tgt : 0) - b) * w;
      if (person && w >= eyeW) { eye = rel; eyeW = w; }
    }
    HD.yaw = clamp(v, -HEAD_CLAMP, HEAD_CLAMP); HD.roll = r; HD.body = b; HD.eye = eye; HD.eyeW = eyeW;
    return HD;
  }
  function pitchU(f, u) {
    let v = 0;
    const L = f.pitches;
    for (let k = 0; k < L.length; k++) {
      const l = L[k];
      const w = winT(l.a, l.b, l.rin, l.rout, u, f.T);
      if (w > 0) v += (l.deg - v) * w;
    }
    for (let k = 0; k < f.nods.length; k++) {
      const x = fmod(u - f.nods[k], f.T) / 0.6;
      if (x < 1) v += -6 * Math.sin(PI * x);
    }
    return v * DEG;
  }
  function fadeU(f, u) {
    let v = f.f0;
    const R = f.ramps;
    for (let k = 0; k < R.length; k++) {
      const r = R[k];
      if (u < r[0]) break;
      v += (r[2] - v) * smoothstep(r[0], r[1], u);
    }
    return v;
  }
  // S1.5 hand-off reach, per species → RS { p: arm pitch, s: arm length factor, r: arm roll }. Both figures face each
  // other, D apart; a forward lean λ carries a shoulder forward by shY·sin λ and a hanging arm back by λ, so the world
  // arm angle is pitch − λ. The partner's lean rides the same window, so it is λ · (its SPEC lean / mine).
  //  - human + agent: the agent reaches UP at ARM.handUp; the two hands meet where the human's arm (fixed length) and
  //    the agent's arm (length u along that angle) close the gap between the shoulders. u is the smaller root of
  //    |Sh − (Sa + u·dir)| = Lh. DEVIATION (reported): u exceeds the .13 nub at these distances, so the agent's arm
  //    telescopes (s = u / armL, <= ARM.stretchMax), and rolls out so its hand lines up with the human's (lateral).
  //  - same species: the hands meet at the midpoint; an agent pair telescopes level (ARM.agentLevel) if it must.
  function reachSolve(f, partner, tl, x, z, lean) {
    const A = f.sp, B = partner.sp;
    posTl(partner, tl, P2);
    const D = Math.hypot(P2.x - x, P2.z - z);
    const lp = A.lean > 0 ? lean * B.lean / A.lean : 0;
    RS.s = 1; RS.r = A.armRoll;
    if (f.human === partner.human) {
      const X = D / 2 - A.shY * Math.sin(lean);
      const L0 = A.armL * Math.cos(A.armRoll);
      if (f.human || X <= L0) {
        RS.p = clamp(Math.asin(clamp(X / L0, 0, 1)) + lean, ARM.reachMin, f.human ? ARM.reachMaxH : ARM.handUp);
      } else {
        const aa = ARM.agentLevel, u = X / Math.sin(aa);
        RS.s = clamp(u / L0, 1, ARM.stretchMax);
        RS.p = aa + lean;
      }
      return RS;
    }
    const H = f.human ? A : B, G = f.human ? B : A;
    const lh = f.human ? lean : lp, la = f.human ? lp : lean;
    const X = D - H.shY * Math.sin(lh) - G.shY * Math.sin(la);        // shoulder to shoulder, along the facing line
    const Y = H.shY * Math.cos(lh) - G.shY * Math.cos(la);            // the human's shoulder over the agent's
    const Lh = H.armL * Math.cos(H.armRoll);
    const aa = ARM.handUp - la, sa = Math.sin(aa), ca = Math.cos(aa);
    const bq = X * sa - Y * ca, cq = X * X + Y * Y - Lh * Lh, disc = bq * bq - cq;
    const u = Math.max(disc >= 0 ? bq - Math.sqrt(disc) : bq, 0.01);
    if (f.human) {
      const ah = Math.atan2(X - u * sa, Y + u * ca);
      RS.p = clamp(ah + lh, ARM.reachMin, ARM.reachMaxH);
      return RS;
    }
    const lat = H.armX + H.armL * Math.sin(H.armRoll) - G.armX;       // the agent's hand lines up with the human's
    const Lf = Math.hypot(u, lat);
    RS.p = ARM.handUp;
    RS.r = Math.atan2(lat, u);
    RS.s = clamp(Lf / G.armL, 1, ARM.stretchMax);
    return RS;
  }
  // arm pitches, length factors and rolls for figure n (rest = the walking swing), written into limbA / armS / armR
  function armsU(f, n, tl, u, x, z, lean, swing) {
    const sp = f.sp;
    let vL = -swing, vR = swing, sL = 1, sR = 1, rL = sp.armRoll, rR = sp.armRoll;
    let oL1 = 0, oR1 = 0, oL2 = 0, oR2 = 0;
    reachF[n * 2] = -1; reachF[n * 2 + 1] = -1;
    const A = f.arms;
    for (let k = 0; k < A.length; k++) {
      const a = A[k];
      if (a.out) {
        // the sheet's out pose runs a little longer than the arm is up: it is out before the partner's hand arrives,
        // and back in only once the partner's arm has gone
        const wo = winT(a.a - CARD_OUT_LEAD, a.b + CARD_OUT_LAG, 0.3, 0.3, u, f.T);
        if (a.out === 1) { if (a.side > 0) oR1 = Math.max(oR1, wo); else oL1 = Math.max(oL1, wo); }
        else if (a.side > 0) oR2 = Math.max(oR2, wo); else oL2 = Math.max(oL2, wo);
      }
      const w = winT(a.a, a.b, a.rin, a.rout, u, f.T);
      if (w <= 0) continue;
      let tgt = a.deg, ts = a.str, tr = sp.armRoll;
      if (a.reach) { reachSolve(f, a.reach, tl, x, z, lean); tgt = RS.p; ts = RS.s; tr = RS.r; reachF[n * 2 + (a.side > 0 ? 1 : 0)] = a.reach.n; }
      if (a.side > 0) { vR += (tgt - vR) * w; sR += (ts - sR) * w; rR += (tr - rR) * w; }
      else { vL += (tgt - vL) * w; sL += (ts - sL) * w; rL += (tr - rL) * w; }
    }
    reachW[n * 2] = oL1; reachW[n * 2 + 1] = oR1; flatW[n * 2] = oL2; flatW[n * 2 + 1] = oR2;
    limbA[n * 4 + 2] = vL; limbA[n * 4 + 3] = vR;
    armS[n * 2] = sL; armS[n * 2 + 1] = sR; armR[n * 2] = rL; armR[n * 2 + 1] = rR;
  }

  // ---- corridor lanes (traffic time is t itself; positions ride the spacing) -----------------------------
  function trapS(L, D, tau) {   // distance along a straight trapezoid walk
    const a = Math.min(WALK_ACC, D / 2), v = L / (D - a);
    if (tau <= 0) return 0;
    if (tau >= D) return L;
    if (tau < a) return 0.5 * v / a * tau * tau;
    if (tau < D - a) return v * (tau - a / 2);
    const r = D - tau;
    return L - 0.5 * v / a * r * r;
  }
  function trapK(D, tau) { const a = Math.min(WALK_ACC, D / 2); if (tau <= 0 || tau >= D) return 0; return Math.min(1, tau / a, (D - tau) / a); }
  function laneB(tc, S, out) {
    const z0 = paneZ(0, S) + LANE_START, zE = paneZ(5, S) - LANE_END;
    out.L = z0 - zE; out.x = LANE_B_X; out.th = PI; out.spd = 0; out.tau = 0; out.vis = 1;
    let t = tc, zPrev = z0;
    for (let i = 0; i < 6; i++) {
      const zs = paneZ(i, S) + LANE_STOP, D = i === 0 ? LB_WALK0 : LB_WALK;
      if (t < D) { const s = trapS(zPrev - zs, D, t); out.z = zPrev - s; out.spd = trapK(D, t); out.tau = t; out.s = z0 - out.z; return out; }
      t -= D;
      if (t < LB_DWELL) {
        out.z = zs; out.s = z0 - zs;
        const w = smoothstep(0, 0.3, t) * (1 - smoothstep(0.9, 1.2, t));
        out.th = PI + (PI / 2) * w;   // π → 3π/2 (= −π/2, facing the wall end) and back
        return out;
      }
      t -= LB_DWELL;
      zPrev = zs;
    }
    if (t < LB_WALKN) { const s = trapS(zPrev - zE, LB_WALKN, t); out.z = zPrev - s; out.spd = trapK(LB_WALKN, t); out.tau = t; out.s = z0 - out.z; return out; }
    out.z = zE; out.s = out.L; out.vis = 0;   // the 0.03 s hidden tail
    return out;
  }
  function laneF(tc, S, out) {
    const z0 = paneZ(0, S) + LANE_START, zE = paneZ(5, S) - LANE_END;
    out.L = z0 - zE; out.x = LANE_F_X; out.th = 0; out.vis = 1;
    const s = trapS(out.L, LF_CYCLE, tc);
    out.z = zE + s; out.s = s; out.spd = trapK(LF_CYCLE, tc); out.tau = tc;
    return out;
  }

  // A step, not a ramp. Cull only when the lens is inside the figure's footprint or at its middle.
  const nearW = (x, y, z) => {
    if (!camP) return 1;
    const dx = camP.x - x, dz = camP.z - z, dy = camP.y - y;
    return (dx * dx + dz * dz < NEAR_H * NEAR_H || dx * dx + dy * dy + dz * dz < NEAR_3D * NEAR_3D) ? 0 : 1;
  };
  // FIX-PLAN-R2 S1: during the landscape push-through, a figure in front of the lens and within max(1.5, K·P[5])
  // + 0.4·hash u of it is gone, whole. The wall's named pair takes no jitter, so the pair goes (or stays) together.
  const nearFig = (n, x, z) => {
    if (!pushOn) return 1;
    const dx = x - camP.x, dz = z - camP.z;
    if (camFX * dx + camFZ * dz <= 0) return 1;
    const r = cullR + (inPair[n] === 1 ? 0 : FIG_CULL_J * hash1(n + 31));
    return dx * dx + dz * dz < r * r ? 0 : 1;
  };
  // Director R4: a card on the glass goes with its pane in the push-through.
  const nearCard = (x, z) => {
    if (!pushOn) return 1;
    const dx = x - camP.x, dz = z - camP.z;
    if (camFX * dx + camFZ * dz <= 0) return 1;
    const r = cullR + GLASS_CARD_PAD;
    return dx * dx + dz * dz < r * r ? 0 : 1;
  };
  // S1.4 the screen frame for agent f (pure in t): happy > blink > look > glance > open. Reduced motion: open, always.
  function faceFrame(f, u, t, hYaw) {
    if (!motion) return FACE_FRAMES.open;
    for (let k = 0; k < f.happy.length; k++) if (inWin(f.happy[k][0], f.happy[k][1], u, f.T)) return FACE_FRAMES.happy;
    const n = f.n, per = 3 + 3 * hash1(n + 11), ph = hash1(n + 17) * per;
    if (fmod(t + ph, per) < BLINK_D) return FACE_FRAMES.blink;
    if (HD.eyeW > 0.5) {
      const off = wrapPi(HD.eye - hYaw);
      if (off > EYE_LOOK) return FACE_FRAMES.lookL;
      if (off < -EYE_LOOK) return FACE_FRAMES.lookR;
    }
    const gp = 4 + 3 * hash1(n + 23), gq = t + hash1(n + 29) * gp;
    if (fmod(gq, gp) < GLANCE_D) return (Math.floor(gq / gp) + n) % 2 === 0 ? FACE_FRAMES.lookL : FACE_FRAMES.lookR;
    return FACE_FRAMES.open;
  }

  // ---- update: a pure function of (state, t, opts) -------------------------------------------------------
  function update(state, t, dt, opts) {
    const o = opts || {};
    const reduced = !!o.reduced;
    lastReduced = reduced;
    motion = !reduced;
    t = Number.isFinite(t) ? t : 0;
    const S = state && Number.isFinite(state.spacing) ? state.spacing : 2;
    lastS = S;
    camP = o.camera && o.camera.position ? o.camera.position : null;
    const castS = state && state.cast;
    const push = castS && Number.isFinite(castS.push) ? clamp(castS.push, 0, 1) : 0;
    const pos = state && Number.isFinite(state.pos) ? state.pos : -1;
    // FIX-PLAN-R5 S7.3: cast.glide = 1 for the whole tour (1.6 <= pos <= 7.4) on both aspects; a timeline without it
    // is read by pos. In the tour the crews read presence (S7.5 below); the push weight is 0, so the push cull only
    // runs if a timeline still sends push > .5.
    const glide = castS && Number.isFinite(castS.glide) && castS.glide > 0.5 ? 1 : 0;
    const tour = glide === 1 || (pos >= 1.6 && pos <= 7.4) ? 1 : 0;
    lastGlide = glide; lastTour = tour;
    pushOn = false;
    if (camP && push > 0.5 && o.camera.matrixWorld) {
      const e = o.camera.matrixWorld.elements, ax = -e[8], az = -e[10], l = Math.sqrt(ax * ax + az * az);
      if (l > 1e-6) { camFX = ax / l; camFZ = az / l; pushOn = true; }
      const p5 = o.camera.projectionMatrix ? o.camera.projectionMatrix.elements[5] : 0;
      cullR = Math.max(FIG_CULL_R, FIG_CULL_K * (Number.isFinite(p5) ? p5 : 0));
    }
    // S11: the rim goes on one pair only (timeline's cast.rim; absent = nobody)
    const rimS = castS && castS.rim;
    const rimWall = rimS && Number.isFinite(rimS.wall) ? rimS.wall : -1;
    const rimWt = rimS && Number.isFinite(rimS.w) ? clamp(rimS.w, 0, 1) : 0;
    const tau = (o.introT == null ? 1 : o.introT) * 1.6;
    const pres = o.presence;
    const traffic = castS && Number.isFinite(castS.traffic) ? castS.traffic : 1;
    // S8.2: on portrait the pull-out keeps corridor walkers out of a 3D radius round the lens (0 = off)
    const nearTR = castS && Number.isFinite(castS.trafficNearR) ? Math.max(0, castS.trafficNearR) : 0;
    const heroRimOn = pos >= 0 && pos < 0.5;
    const walkK = WALK_TIGHT_K + (1 - WALK_TIGHT_K) * clamp((S - WALK_LEG_S0) / (WALK_LEG_S1 - WALK_LEG_S0), 0, 1);
    const cardS = 1 + (CARD_S_TOUR - 1) * (1 - smoothstep(2.4, 4.0, S));   // 1.15 at the deck
    rig.cardS = cardS;
    // S5: a pile level is .0175 (x the card scale): an .008 sheet with a .01 gap (two .005 proxy pads) under the next
    const tableY = TABLE.top + 0.0065 * cardS, pileDY = PILE_DY * cardS;

    // scene weight (§4.5): presence × intro. S2.2: the hero hold at wall 01, released forward-only through SHIFT[0].
    const heroNow = !reduced && pos >= 0 && pos < HERO_POS;
    if (heroHeld && !heroNow && !reduced) {
      const T0 = SCENE_T[0];
      const add = ((HERO_TL - sceneTime(0, t)) % T0 + T0) % T0;
      setShift(0, SHIFT[0] + add);
    }
    heroHeld = heroNow;
    for (let i = 0; i < NW; i++) {
      tlw[i] = reduced ? STILL[i] : sceneTime(i, t);
      wallZ[i] = paneZ(i, S);
      if (i === 0) {
        if (reduced) tlw[0] = pos >= 0 && pos < HERO_POS_R ? HERO_TL : STILL[0];
        else if (heroNow) tlw[0] = HERO_TL;
      }
      const pr = pres ? clamp(pres[i], 0, 1) : 1;
      const intro = smoothstep(0.04 * i, 0.12 + 0.04 * i, tau);
      // S7.5: in the tour the wall weight is the raw presence (each figure steps at its own th_f, a glass or table
      // card at .5); outside it (hero, cut, Together, close) the R4 rule stands.
      wallW[i] = (tour ? pr : smoothstep(0.38, 0.62, pr)) * intro;
    }
    const trafficW = traffic * smoothstep(1.0, 1.6, tau);
    const tt = reduced ? 0 : t;

    // ---- figures ----
    for (let n = 0; n < NF; n++) {
      const f = FIGS[n], sp = f.sp;
      const ph = TAU * tt / (5 + 2 * hash1(n)) + hash1(n + 7) * TAU;
      const idle = motion ? Math.sin(ph) : 0;
      let x, z, th, own, spd, wtau, lean = 0, roll, hYaw, hPitch, hRoll = 0, wallFade, u = 0;
      HD.eyeW = 0;
      if (f.wall >= 0) {
        const i = f.wall, tl = tlw[i];
        u = uOf(f, tl);
        posU(f, u, P);
        x = P.x; z = P.z; spd = P.spd; wtau = P.tau;
        th = yawU(f, tl, u, x, z);
        headU(f, tl, u, x, z, th, idle * 1.5 * DEG);
        th = wrapPi(th + HD.body);
        hYaw = HD.yaw - HD.body; hRoll = HD.roll;
        own = fadeU(f, u);
        // lean toward a partner, as a body-space vector so a sideways partner reads
        let lx = 0, lz = 0, lw = 0;
        for (let k = 0; k < f.leans.length; k++) {
          const l = f.leans[k];
          const w = winT(l.a, l.b, l.rin, l.rout, u, f.T);
          if (w <= 0) continue;
          const rel = specAngle(l.spec, f, tl, u, x, z) - th;
          lx += sp.lean * w * Math.cos(rel); lz += sp.lean * w * Math.sin(rel);
          if (w > lw) lw = w;
        }
        lean = lx;
        // the idle sway stops while leaning into a hand-off (it would carry the hand sideways off its partner's)
        roll = -lz + idle * IDLE_ROLL * (1 - lw);
        if (motion) {
          for (let k = 0; k < f.rolls.length; k++) {
            const r = f.rolls[k];
            const w = winT(r.a, r.b - 0.3, 0.3, 0.3, u, f.T);
            if (w > 0) roll += 1.5 * DEG * Math.sin(TAU * (u - r.a) / 1.2) * w;
          }
        }
        hYaw = clamp(hYaw, -HEAD_CLAMP, HEAD_CLAMP);
        hPitch = pitchU(f, u);
        const sw = sp.walkArm * spd * Math.sin(TAU * sp.cadence * wtau);
        armsU(f, n, tl, u, x, z, lean, sw);
        z += wallZ[i];
        wallFade = wallW[i];
      } else {
        const ts = f.trafficSpec;
        if (ts.lane === 'B') laneB(fmod(tt / LB_CYCLE + ts.phase, 1) * LB_CYCLE, S, LP);
        else laneF(fmod(tt / LF_CYCLE + ts.phase, 1) * LF_CYCLE, S, LP);
        x = LP.x; z = LP.z; th = LP.th; spd = LP.spd; wtau = LP.tau;
        own = LP.vis * smoothstep(0, 0.8, LP.s) * smoothstep(0, 0.8, LP.L - LP.s);
        // reduced motion freezes the lane at t = 0: a walker caught mid-ramp would stay half-there for good
        if (reduced) own = own >= 0.5 ? 1 : 0;
        // S8.2: a walker inside the portrait pull-out's near radius is gone, whole (its card follows it)
        if (nearTR > 0 && camP) {
          const dx = camP.x - x, dy = camP.y - clamp(camP.y, 0, WALKER_TOP), dz = camP.z - z;   // nearest point, feet to head
          if (dx * dx + dy * dy + dz * dz < nearTR * nearTR) own = 0;
        }
        roll = idle * IDLE_ROLL;
        hYaw = idle * 1.5 * DEG;
        hPitch = 0;
        const sw = sp.walkArm * spd * Math.sin(TAU * sp.cadence * wtau);
        // S5: the walker carries in its LEFT hand (lane B: toward the walls; lane F: away from lane B), so the sheet
        // across its chest never meets the other lane
        limbA[n * 4 + 2] = ts.card ? sp.carry : -sw;
        limbA[n * 4 + 3] = sw;
        armS[n * 2] = 1; armS[n * 2 + 1] = 1; armR[n * 2] = sp.armRoll; armR[n * 2 + 1] = sp.armRoll;
        reachW[n * 2] = 0; reachW[n * 2 + 1] = 0; flatW[n * 2] = 0; flatW[n * 2 + 1] = 0; reachF[n * 2] = -1; reachF[n * 2 + 1] = -1;
        wallFade = trafficW;
      }
      // S1.5 legs: humans stride at 2 Hz with a ±4° waddle, agents shuffle-hop (3 steps a second, a hop per step);
      // standing, the unweighted leg eases forward
      const stride = Math.sin(TAU * sp.cadence * wtau);
      const legW = sp.walkLeg * walkK * spd * stride;
      limbA[n * 4] = legW + (1 - spd) * IDLE_LEG * Math.max(0, idle);
      limbA[n * 4 + 1] = -legW + (1 - spd) * IDLE_LEG * Math.max(0, -idle);
      let bob = 0;
      if (motion && spd > 0) {
        if (f.human) { bob = sp.bob * spd * (0.5 + 0.5 * Math.cos(TAU * 2 * sp.cadence * wtau)); roll += sp.roll * spd * stride; }
        else bob = sp.bob * spd * Math.abs(Math.sin(PI * 2 * sp.cadence * wtau));
      }
      // S1.5 idle: humans breathe (torso y 1 ± .012 over 4 s), agents bob their heads (± .006 over 2 s)
      const breath = f.human && motion ? 1 + BREATH_A * Math.sin(TAU * (tt / BREATH_P + hash1(n))) : 1;
      const headBob = !f.human && motion ? HEADBOB_A * Math.sin(TAU * (tt / HEADBOB_P + hash1(n + 5))) : 0;
      const fRaw = wallFade * own * nearW(x, sp.midY, z) * nearFig(n, x, z);
      const vis = fRaw >= (tour ? thTour[n] : thN[n]);
      fx[n] = x; fz[n] = z; fth[n] = th; fy[n] = bob; fLean[n] = lean;
      fFade[n] = vis ? fRaw : 0; fVis[n] = vis ? 1 : 0;
      const rimW = f.wall >= 0 && f.wall === rimWall && (heroRimOn && rimWall === 0 ? heroRim[n] : inPair[n]) === 1 ? rimWt : 0;
      writeFigure(f, x, bob, z, th, lean, roll, hYaw, hPitch, hRoll, vis, fRaw, bob, rimW, breath, headBob);
      if (!f.human) {
        const fr = f.wall >= 0 ? faceFrame(f, u, tt, hYaw) : (motion ? faceFrame(f, 0, tt, hYaw) : FACE_FRAMES.open);
        fFrame[n] = fr;
        aFrame[f.slot] = fr;
      }
    }

    // ---- cards ----
    for (let n = 0; n < NC; n++) {
      const c = CARDS[n];
      if (c.traffic) {
        const fn = c.traffic.n, j = fn * 2;
        cx[n] = kx[j]; cy[n] = ky[j]; cz[n] = kz[j]; cMode[n] = MODE.hand; cSide[n] = -1;
        cFade[n] = fFade[fn];
        cFrom[n] = cTo[n] = c.traffic.name;
        gripF0[n] = fn; gripK0[n] = 2; gripF1[n] = -1;
        writeCard(n, kx[j], ky[j], kz[j], kyaw[j], 0, 0, fVis[fn] === 1, cardS);
        continue;
      }
      const i = c.wall, tl = tlw[i], u = c.base + fmod(tl - c.base, c.T), Z = wallZ[i];
      let sg = c.segs[0];
      for (let k = 1; k < c.segs.length; k++) { if (c.segs[k].t <= u) sg = c.segs[k]; else break; }
      let own = c.f0;
      for (let k = 0; k < c.ramps.length; k++) { const r = c.ramps[k]; if (u < r[0]) break; own += (r[2] - own) * smoothstep(r[0], r[1], u); }
      let x = 0, y = 0, z = 0, yaw = 0, pitch = 0, roll = 0, base = 0, bvis = false, from = '', to = '';
      const m = sg.m, side = sg.side, jOf = (fn, s) => fn * 2 + (s > 0 ? 1 : 0);
      const armK = side > 0 ? 3 : 2;
      gripF0[n] = -1; gripF1[n] = -1;
      if (m === MODE.hand || m === MODE.pin || m === MODE.unpin || m === MODE.lift || m === MODE.lay) { gripF0[n] = sg.f.n; gripK0[n] = armK; }
      else if (m === MODE.handoff) { gripF0[n] = sg.f.n; gripK0[n] = armK; gripF1[n] = sg.g.n; gripK1[n] = 5 - armK; }
      else if (m === MODE.table && sg.faF && sg.fa !== sg.ta) { gripF0[n] = sg.faF.n; gripK0[n] = armK; }
      if (m === MODE.hand) {
        const fn = sg.f.n, j = jOf(fn, side);
        x = kx[j]; y = ky[j]; z = kz[j]; yaw = kyaw[j]; base = fFade[fn]; bvis = fVis[fn] === 1; from = to = sg.f.name;
      } else if (m === MODE.handoff) {
        const v = clamp((u - sg.t) / sg.d, 0, 1), e = ease3(v);
        const a = sg.f.n, b = sg.g.n, ja = jOf(a, side), jb = jOf(b, -side);
        x = kx[ja] + (kx[jb] - kx[ja]) * e; y = ky[ja] + (ky[jb] - ky[ja]) * e + 0.06 * Math.sin(PI * v); z = kz[ja] + (kz[jb] - kz[ja]) * e;
        yaw = kyaw[ja];
        yaw += modPiDelta(kyaw[jb] - yaw) * e;
        roll = 6 * DEG * Math.sin(TAU * v);
        base = fFade[a] + (fFade[b] - fFade[a]) * e;
        bvis = (e < 0.5 ? fVis[a] : fVis[b]) === 1;
        from = sg.f.name; to = sg.g.name;
      } else if (m === MODE.unpin || m === MODE.pin) {
        const v = clamp((u - sg.t) / sg.d, 0, 1), e = ease3(v);
        const fn = sg.f.n, j = jOf(fn, side);
        const gx = sg.x, gy = GLASS_Y, gz = Z + GLASS_Z;
        const wF = wallW[i] * nearW(gx, gy, gz) * nearCard(gx, gz);
        const k = m === MODE.pin ? e : 1 - e;   // 0 = hand, 1 = glass
        x = kx[j] + (gx - kx[j]) * k; y = ky[j] + (gy - ky[j]) * k + 0.04 * Math.sin(PI * v); z = kz[j] + (gz - kz[j]) * k;
        yaw = kyaw[j];
        yaw += modPiDelta(-yaw) * k;
        base = fFade[fn] + (wF - fFade[fn]) * k;
        bvis = k < 0.5 ? fVis[fn] === 1 : wF >= CARD_TH;
        if (m === MODE.pin) { from = sg.f.name; to = 'glass'; } else { from = 'glass'; to = sg.f.name; }
      } else if (m === MODE.lift || m === MODE.lay) {
        const v = clamp((u - sg.t) / sg.d, 0, 1), e = ease3(v);
        const fn = sg.f.n, j = jOf(fn, side);
        const P3 = m === MODE.lay ? sg.b : sg.a;
        const gx = P3[0], gz = Z + P3[1], gy = tableY + pileDY * P3[2];
        const wF = wallW[i] * nearW(gx, gy, gz);
        const k = m === MODE.lay ? e : 1 - e;   // 0 = hand, 1 = table
        x = kx[j] + (gx - kx[j]) * k; y = ky[j] + (gy - ky[j]) * k + 0.03 * Math.sin(PI * v); z = kz[j] + (gz - kz[j]) * k;
        yaw = kyaw[j] + modPiDelta(-kyaw[j]) * k;   // S5: at most a quarter turn to lie flat (it spun half a turn)
        pitch = -PI / 2 * k;
        base = fFade[fn] + (wF - fFade[fn]) * k;
        bvis = k < 0.5 ? fVis[fn] === 1 : wF >= CARD_TH;
        from = to = sg.f.name;
      } else if (m === MODE.glass) {
        x = sg.x; y = GLASS_Y; z = Z + GLASS_Z;
        base = wallW[i] * nearW(x, y, z) * nearCard(x, z); bvis = base >= CARD_TH;
      } else if (m === MODE.table) {
        const v = clamp((u - sg.t) / sg.d, 0, 1), e = ease3(v);
        const A = sg.a, B = sg.b;
        x = A[0] + (B[0] - A[0]) * e; z = Z + A[1] + (B[1] - A[1]) * e;
        // S5: a sheet climbs to its pile height before it slides over the pile, and leaves a pile at that height
        // (it drops once it is clear), so it never passes through the sheets it lands on or leaves
        const le = B[2] > A[2] ? ease3(clamp(v / 0.5, 0, 1)) : ease3(clamp((v - 0.5) / 0.5, 0, 1));
        y = tableY + pileDY * (A[2] + (B[2] - A[2]) * le);
        pitch = -PI / 2;
        base = wallW[i] * nearW(x, y, z); bvis = base >= CARD_TH;
        if (v < 1) { from = sg.fa; to = sg.ta; } else { from = to = sg.ta; }
      } else if (m === MODE.pile) {
        const lv = sg.lv0 + (sg.lv1 - sg.lv0) * smoothstep(sg.at0, sg.at1, u);
        x = sg.px; z = Z + sg.pz; y = tableY + pileDY * lv;
        pitch = -PI / 2;
        base = wallW[i] * nearW(x, y, z); bvis = base >= CARD_TH;
      }
      const f = base * own;
      const vis = m !== MODE.hidden && bvis && own >= CARD_TH;
      cx[n] = x; cy[n] = y; cz[n] = z; cFade[n] = vis ? f : 0; cMode[n] = m; cSide[n] = side; cFrom[n] = from; cTo[n] = to;
      writeCard(n, x, y, z, yaw, pitch, roll, vis, cardS);
    }

    for (let k = 0; k < meshes.length; k++) {
      meshes[k].instanceMatrix.needsUpdate = true;
      meshes[k].geometry.getAttribute('aFade').needsUpdate = true;
    }
    for (let k = 0; k < RIMMED.length; k++) RIMMED[k].rimAttr.needsUpdate = true;
    frameAttr.needsUpdate = true;
  }

  // ---- theme: cheap writes only ----------------------------------------------------------------------------
  function applyTheme(name) {
    const T = TH[name] || TH.day;
    humanMat.color.copy(T.humanTintMul);
    humanMat.emissive.copy(T.humanEmissive);
    humanMat.emissiveIntensity = T.humanEmissiveI;
    humanHeadMat.color.copy(T.humanTintMul);
    humanHeadMat.emissive.copy(T.humanEmissive);
    humanHeadMat.emissiveIntensity = T.humanEmissiveI;
    headUni.uEye.value.copy(T.humanEye);
    humanUni.uRimColor.value.copy(T.rim);
    humanUni.uRimI.value = T.humanRimI;
    agentBodyMat.color.copy(T.agentColor);
    agentHeadMat.color.copy(T.agentHeadColor);
    agentHeadMat.emissive.copy(T.agentHeadEmissive);
    agentHeadMat.emissiveIntensity = T.agentHeadEmissiveI;
    agentUni.uRimColor.value.copy(T.rim);
    agentUni.uRimI.value = T.agentRimI;
    faceUni.uScreen.value.copy(T.agentScreen);
    faceUni.uGlyph.value.copy(T.agentGlyph);
    faceUni.uLive.value.copy(T.agentLive);
    faceUni.uGlow.value = T.agentGlowI;
    cardMat.color.copy(T.cardColor);
    cardMat.emissive.copy(T.cardEmissive);
    cardMat.emissiveIntensity = T.cardEmissiveI;
    decalMat.color.copy(T.decalColor);
    decalMat.opacity = T.decalOpacity;
    DC.m.visible = T.decalOpacity > 0;
    // S4: the cosmetics take the clothing light and their THEMES colours (attribute writes, no program change)
    accMat.color.copy(T.humanTintMul);
    accMat.emissive.copy(T.humanEmissive);
    accMat.emissiveIntensity = T.humanEmissiveI;
    for (let k = 0; k < CAP.acc; k++) {
      const ty = accType[k];
      if (ty < 0) continue;
      let a = T[ACC_COL[ty][0]], b = T[ACC_COL[ty][1]];
      // legibility guard, chest items only: one whose colour sits on the agent body's own tone (contrast ratio under
      // ACC_CONTRAST_MIN, e.g. the g-700 tie on the g-800 night body, 1.3 : 1) takes acc5 (g-200), so it still reads
      if (ACC_ANCHOR[ty] === 'body' && contrastOf(a, T.agentColor) < ACC_CONTRAST_MIN) { a = T.acc5; if (ACC_COL[ty][1] === ACC_COL[ty][0]) b = a; }
      aColA[k * 3] = a.r; aColA[k * 3 + 1] = a.g; aColA[k * 3 + 2] = a.b;
      aColB[k * 3] = b.r; aColB[k * 3 + 1] = b.g; aColB[k * 3 + 2] = b.b;
    }
    accColAttr.needsUpdate = true; accCol2Attr.needsUpdate = true;
  }
  applyTheme('day');

  // ---- debug ---------------------------------------------------------------------------------------------------
  const r4 = (v) => Math.round(v * 1e4) / 1e4;
  const d1 = (v) => Math.round(v / DEG * 10) / 10;
  function inspect() {
    return {
      spacing: lastS,
      reduced: lastReduced,
      glide: lastGlide,
      tour: lastTour,
      tl: Array.from(tlw, r4),
      figures: FIGS.map((f) => ({
        id: f.id, wall: f.wall, kind: f.kind, species: f.human ? 'human' : 'agent', seat: false,
        x: r4(fx[f.n]), y: r4(fy[f.n]), z: r4(fz[f.n]), yaw: r4(fth[f.n]), fade: r4(fFade[f.n]), lean: d1(fLean[f.n]),
        frame: f.human ? -1 : fFrame[f.n], top: f.sp.top,
        legL: d1(limbA[f.n * 4]), legR: d1(limbA[f.n * 4 + 1]), armL: d1(limbA[f.n * 4 + 2]), armR: d1(limbA[f.n * 4 + 3]),
        stretch: [r4(armS[f.n * 2]), r4(armS[f.n * 2 + 1])],
        hands: { L: [r4(hx[f.n * 2]), r4(hy[f.n * 2]), r4(hz[f.n * 2])], R: [r4(hx[f.n * 2 + 1]), r4(hy[f.n * 2 + 1]), r4(hz[f.n * 2 + 1])] },
      })),
      cards: CARDS.map((c) => ({
        id: c.id, wall: c.wall, x: r4(cx[c.n]), y: r4(cy[c.n]), z: r4(cz[c.n]), fade: r4(cFade[c.n]),
        mode: MODE_NAMES[cMode[c.n]], from: cFrom[c.n], to: cTo[c.n], side: cSide[c.n],
      })),
    };
  }
  // DEV ONLY (_dev/cast-turntable.html): pose chosen figures by id at (x, z, yaw) with a screen frame and arm pitches
  // (degrees), everything else hidden. Not called by the stage; allocates (debug path).
  function debugPose(list) {
    for (const mm of meshes) { for (let k = 0; k < mm.count; k++) mm.setMatrixAt(k, ZERO); }
    for (const D of [HB, HH, HL, AB, AH, AL, AF, CD, CE, DC, ACC]) D.fade.fill(0);
    for (const p of list) {
      const f = FIGS.find((g) => g.id === p.id);
      if (!f) continue;
      const n = f.n, sp = f.sp;
      limbA[n * 4] = (p.legL || 0) * DEG; limbA[n * 4 + 1] = (p.legR || 0) * DEG;
      limbA[n * 4 + 2] = (p.armL || 0) * DEG; limbA[n * 4 + 3] = (p.armR || 0) * DEG;
      armS[n * 2] = p.stretchL || 1; armS[n * 2 + 1] = p.stretchR || 1;
      armR[n * 2] = p.rollL != null ? p.rollL * DEG : sp.armRoll; armR[n * 2 + 1] = p.rollR != null ? p.rollR * DEG : sp.armRoll;
      writeFigure(f, p.x || 0, 0, p.z || 0, p.yaw || 0, 0, 0, (p.headYaw || 0) * DEG, (p.headPitch || 0) * DEG, 0, true, 1, 0, 0, 1, 0);
      if (!f.human) { aFrame[f.slot] = p.frame || 0; fFrame[n] = p.frame || 0; }
    }
    for (const mm of meshes) { mm.instanceMatrix.needsUpdate = true; mm.geometry.getAttribute('aFade').needsUpdate = true; }
    frameAttr.needsUpdate = true;
  }

  // S6: bind the FACES document atlas once it loads. Never a static import: without js/faces/cards.js (or if it throws)
  // the R2 hairline card stays. The map is already set, so swapping it keeps the program.
  // FIX-PLAN-R6: the texture comes from the module-level cardAtlas() cache, shared with the guides (one upload).
  let atlasOn = false;
  cardAtlas().then((CA) => {
    if (!CA) return;
    const A = CA.A, tex = CA.tex;
    const docs = CA.docs || CARD_DOC_NAMES;
    for (let n = 0; n < NC; n++) { const k = docs.indexOf(cardDocName[n]); aCell[n] = k >= 0 ? k : strHash(CARDS[n].name) % docs.length; }
    cardGeo.getAttribute('aCell').needsUpdate = true;
    edgeGeo.getAttribute('aCell').needsUpdate = true;
    const old = cardMat.map;
    cardMat.map = tex;
    if (old && old !== tex) old.dispose();
    cardUni.uCardAtlas.value.set(A.cellW / A.W, A.cellH / A.H, A.cols, 1);
    atlasOn = true;
  }).catch(() => { atlasOn = false; });

  // ---- S5 overlap proxies (DEV: read from the live instance matrices; allocates, update() does not) --------------
  // Every proxy is inflated by PROXY_PAD. Parts: human torso capsule r .165 whose axis runs y .14–.455 (so its surface
  // spans y ~0–.62 and matches the lathe profile's hips and neck), human head sphere HUMAN_HEAD_R, agent body box (its
  // geometry bounds), agent head box .28³, limbs as capsules (SPEC radius, the limb's own length; the tip end is `b`),
  // cosmetics as the local AABB of each of their pieces (owner's parts), cards as oriented boxes .16 x .21 x .008 (x the
// card scale).
  const PROXY_PAD = 0.005;
  function proxies() {
    const M = new THREE.Matrix4(), V = new THREE.Vector3(), V2 = new THREE.Vector3();
    const at = (D, k) => M.fromArray(D.m.instanceMatrix.array, k * 16);
    const pt = (x, y, z) => { V.set(x, y, z).applyMatrix4(M); return [V.x, V.y, V.z]; };
    const obb = (part, D, k, b) => {
      at(D, k);
      const cx = (b[0] + b[3]) / 2, cy = (b[1] + b[4]) / 2, cz = (b[2] + b[5]) / 2;
      const c = pt(cx, cy, cz);
      const e = M.elements, ax = [], h = [];
      for (let a = 0; a < 3; a++) {
        V2.set(e[a * 4], e[a * 4 + 1], e[a * 4 + 2]);
        const s = V2.length();
        V2.multiplyScalar(1 / (s || 1));
        ax.push([V2.x, V2.y, V2.z]);
        h.push((b[a + 3] - b[a]) / 2 * s + PROXY_PAD);
      }
      return { part, kind: 'obb', c, ax, h };
    };
    const capsule = (part, D, k, y0, y1, r) => {
      at(D, k);
      return { part, kind: 'cap', a: pt(0, y0, 0), b: pt(0, y1, 0), r: r + PROXY_PAD };
    };
    const figs = [];
    for (const f of FIGS) {
      if (!fVis[f.n]) continue;
      const i = f.slot, sp = f.sp, parts = [];
      if (f.human) {
        parts.push(capsule('torso', HB, i, 0.14, 0.455, 0.165));
        at(HH, i);
        parts.push({ part: 'head', kind: 'sph', c: pt(0, 0, 0), r: HUMAN_HEAD_R + PROXY_PAD });
      } else {
        parts.push(obb('body', AB, i, [-0.13, 0.12, -0.10, 0.13, 0.36, 0.10]));
        parts.push(obb('head', AH, i, [-0.14, -0.14, -0.14, 0.14, 0.14, 0.14]));
      }
      const L = f.human ? HL : AL, caps2 = 2 + sp.caps;
      for (let k = 0; k < 4; k++) {
        at(L, i * 4 + k);
        const top = pt(0, 0, 0), bot = pt(0, -caps2, 0);
        const r = k < 2 ? sp.legR : sp.armR;
        const dx = bot[0] - top[0], dy = bot[1] - top[1], dz = bot[2] - top[2], len = Math.hypot(dx, dy, dz) || 1;
        const s = Math.min(r, len / 2) / len;
        parts.push({ part: ['legL', 'legR', 'armL', 'armR'][k], kind: 'cap', limb: k, reach: k < 2 ? -1 : reachF[f.n * 2 + k - 2],
          a: [top[0] + dx * s, top[1] + dy * s, top[2] + dz * s], b: [bot[0] - dx * s, bot[1] - dy * s, bot[2] - dz * s], r: r + PROXY_PAD });
      }
      for (let sl = 0; sl < CAP.acc; sl++) {
        if (accOwner[sl] !== f.n) continue;
        for (const pc of ACC_PIECES[accType[sl]]) parts.push(obb('acc:' + Object.keys(ACC_T)[accType[sl]], ACC, sl, pc));
      }
      figs.push({ n: f.n, id: f.id, wall: f.wall, kind: f.kind, parts });
    }
    const cards = [];
    for (const c of CARDS) {
      const n = c.n;
      if (!(cFade[n] > 0)) continue;
      const grips = [];
      if (gripF0[n] >= 0) grips.push({ fig: gripF0[n], limb: gripK0[n] });
      if (gripF1[n] >= 0) grips.push({ fig: gripF1[n], limb: gripK1[n] });
      cards.push({ n, id: c.id, wall: c.wall, mode: MODE_NAMES[cMode[n]], doc: cardDocName[n], grips,
        box: obb('card', CD, n, [-0.08, -0.105, -0.004, 0.08, 0.105, 0.004]) });
    }
    return { pad: PROXY_PAD, figs, cards };
  }

  return {
    root,
    update,
    applyTheme,
    beat: (i, t) => beat(i, t, lastReduced),
    programsStable: true,
    counts: () => ({ humans: C.humans, agents: C.agents, cards: NC }),
    inspect,
    debugPose,
    meshes,
    // S5 / S6 dev hooks: the overlap proxies, and whether the document atlas is bound
    debug: { proxies, atlas: () => atlasOn, cardDocs: () => CARDS.map((c) => ({ id: c.id, doc: cardDocName[c.n] })) },
  };
}

// ---------------------------------------------------------------------------------------------------------
// FIX-PLAN-R6 S3: the guide figures. Seven named figures copied from the floor (the reader recognises them), drawn in
// small DOM slots by guides.js through scissor/viewport passes. They live in the SAME scene on layer 1 ONLY, far from
// the floor (rooms at x = 1000 + 40k), lit by the same lights, so every guide material hits an existing program.
// ---------------------------------------------------------------------------------------------------------
export const GUIDE_FIGS = [
  { id: 'bow', kind: 'agent', src: 'W02.C', acc: 'bow' },
  { id: 'cap', kind: 'agent', src: 'W01.reader', acc: 'cap' },
  { id: 'hat', kind: 'agent', src: 'W06.reporter', acc: 'hat' },
  { id: 'Lim', kind: 'human', person: 'Lim' },
  { id: 'phones', kind: 'agent', src: 'W02.D', acc: 'phones' },
  { id: 'scarf', kind: 'agent', src: 'W04.F2', acc: 'scarf' },
  { id: 'beanie', kind: 'agent', src: 'W01.courier-a', acc: 'beanie' },
];
// cells index faces/cards.js CARD_DOCS: 3 sheet, 10 key, 11 file
export const GUIDE_CARDS = [
  { id: 'cap', holder: 'cap', cell: 3 },
  { id: 'hat', holder: 'Lim', cell: 10 },
  { id: 'scarf', holder: 'scarf', cell: 10 },
  { id: 'beanie', holder: 'beanie', cell: 11 },
];
const GUIDE_CAP = { hb: 1, hh: 1, hl: 4, ab: 6, ah: 6, al: 24, face: 6, card: 4, decal: 7, acc: 6 };
const GUIDE_FACE_COLS = 16;
const CARD_S_GUIDE = 1.5;                        // the floor tour's is 1.15: the carried sheet reads at slot scale
const GUIDE_DECAL_OPACITY = 0.55;                // the contact core (guide only; the floor's night decals are 0)
const GUIDE_TEXT_MS = 16;                        // setFaceText uploads at most once a frame (50 ms left the face a count behind the stat)
const GUIDE_BLINK_MIN = 3.2, GUIDE_BLINK_SPAN = 1.2, GUIDE_BLINK_N = 32;
// 'show': the sheet stands beside the raised hand, its inner edge SHOW_IN outside the fingertip and its foot SHOW_UP
// below it (the hand holds its lower inner corner), its plane SHOW_FWD in front of the hand, facing the lens
const SHOW_IN = 0.01, SHOW_UP = 0.03, SHOW_FWD = 0.02;
const LAY_Y = 0.0065;                            // 'lay': the sheet's centre above the floor, x the card scale
const mulberry32 = (a) => () => {
  a = (a + 1831565813) | 0;   // mulberry32 (Tommy Ettinger), its standard increment
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const numOr = (v, d) => (Number.isFinite(v) ? v : d);

/**
 * buildGuides(scene, { THEMES, rimI = 0.65, renderer = null }) → G. Synchronous; the guide glyphs (faces/guide-glyphs.js, face slots 5-8)
 * and the card atlas (faces/cards.js, shared with the floor) bind when their dynamic imports land.
 *
 * Conventions: world units and radians. Yaw is writeFigure's `th`, a turn about +y: th 0 faces +z and th π/2 faces +x
 * (the facing direction is (sin th, 0, cos th), i.e. th = atan2(dx, dz)). The guide cameras look from +z, so
 * G.YAW.lens (0) faces the lens and G.YAW.plusX (π/2) walks screen-right. Arm pitches are the floor's: 0 hangs down,
 * π/2 points straight ahead, above π/2 the arm is raised.
 *
 * G.pose(id, p): p = { x, z, yaw, lean = 0, walkPhase = 0 (the leg cycle's phase, radians: the stride is sin(walkPhase),
 *   so one cycle is 2π and a step is π), walkK = 0 (0 idle .. 1 full stride: legs, arm swing, bob and the human waddle
 *   per SPEC.A / SPEC.H), headYaw = 0, headPitch = 0 (+ looks up; both relative to the body, clamped to ±50°),
 *   armL = null, armR = null (pitch; null = the rest / walk swing), armLRoll = 0, armRRoll = 0 (added to the rig's rest
 *   roll, + = outward), frame = 0 (agents: the screen frame, G.FRAMES), rim = 1, vis = 1 (< .5 = hidden), t = null
 *   (the guide idle clock, s: when finite, breath (human) / head bob (agent) and blinks (frame 1 for BLINK_D while
 *   frame is 0, 3.2-4.4 s apart), seeded per id with mulberry32(hash(id)); null = no idle) }.
 * G.card(id, c): c = { mode: 'hidden' | 'hand' | 'show' | 'lay', holder (a GUIDE_FIGS id; default the GUIDE_CARDS
 *   holder), side: 'L' | 'R' (default 'R'), cell (default the GUIDE_CARDS cell), x, z, yaw ('lay' only) }. Scale 1.5.
 *   'hand': carried as the floor carries (set the arm to G.ARM.carryA / carryH); 'show': faces the lens beside the
 *   raised hand (set the arm to G.ARM.show); 'lay': flat on the floor, sheet up, at (x, z). A card follows its holder's
 *   LAST pose: call pose() before card() each frame.
 * G.setFaceText(str, fit = str): repaints face slot 8 (G.FRAMES.count) with str drawn at the size fit would get; uploads at
 *   most once per 16 ms (a frame), the latest string lands. Pass the count's final string as fit so the digits keep one
 *   size through the whole count ("0" ... "108,912" ... "109,000+" all at the px of "109,000+").
 *   With `renderer`, once the atlas is on the GPU a repaint uploads only slot 8 (128 x 128, texSubImage2D + mipmaps), not
 *   the whole 2048 x 128 atlas, so a live count can repaint every frame and stay level with the page's stat.
 * G.FRAMES: the agent screen slots: open 0, blink 1, happy 2, lookR 3, lookL 4 (the floor faces), bang 5 ('!'), tick 6,
 *   thumb 7, count 8 (the live text), ask 9 ('?', painted by guide-glyphs.js paintGuideGlyphs at bind).
 * G.hideAll(): every guide instance hidden.
 */
export function buildGuides(scene, { THEMES, rimI = 0.65, renderer = null } = {}) {
  const TN = prepTheme(THEMES.night);
  const PEOPLE = prepPeople(THEMES);

  // ---- the figures -------------------------------------------------------------------------------------------
  const FIGS = [], byId = {};
  let hN = 0, aN = 0;
  for (const d of GUIDE_FIGS) {
    const human = d.kind === 'human';
    const f = { n: FIGS.length, id: d.id, human, sp: SPEC[human ? 'H' : 'A'], slot: human ? hN++ : aN++, def: d,
      ph0: 0, ph1: 0, blinkO: 0, blinkP: 1, blinkT: new Float64Array(GUIDE_BLINK_N) };
    // the idle seed: breath / head-bob phases, a blink offset and 32 blink intervals of 3.2-4.4 s (the schedule repeats
    // with period blinkP, so the blink is pure in t)
    const rnd = mulberry32(strHash(d.id));
    f.ph0 = rnd(); f.ph1 = rnd();
    let acc = 0;
    for (let k = 0; k < GUIDE_BLINK_N; k++) { f.blinkT[k] = acc; acc += GUIDE_BLINK_MIN + GUIDE_BLINK_SPAN * rnd(); }
    f.blinkP = acc; f.blinkO = rnd() * acc;
    FIGS.push(f); byId[d.id] = f;
  }
  const NF = FIGS.length;
  if (hN > GUIDE_CAP.hb || hN * 4 > GUIDE_CAP.hl || aN > GUIDE_CAP.ab || aN > GUIDE_CAP.face || aN * 4 > GUIDE_CAP.al
    || NF > GUIDE_CAP.decal || GUIDE_CARDS.length > GUIDE_CAP.card) throw new Error('guides: over capacity');

  const root = new THREE.Group();
  root.name = 'guides';
  root.layers.set(1);
  scene.add(root);

  // ---- materials: the floor's own factory, the guides' own uniforms, the NIGHT theme from birth -------------------
  const humanUni = { uRimColor: { value: new THREE.Color().copy(TN.rim) }, uRimI: { value: rimI } };
  const agentUni = { uRimColor: { value: new THREE.Color().copy(TN.rim) }, uRimI: { value: rimI } };
  const headUni = { uEye: { value: new THREE.Color().copy(TN.humanEye) } };
  const faceUni = { uScreen: { value: new THREE.Color().copy(TN.agentScreen) }, uGlyph: { value: new THREE.Color().copy(TN.agentGlyph) },
    uLive: { value: new THREE.Color().copy(TN.agentLive) }, uGlow: { value: TN.agentGlowI }, uFaceCols: { value: GUIDE_FACE_COLS } };
  const cardUni = { uCardAtlas: { value: new THREE.Vector4(1, 1, 1, 0) }, uCardFlip: { value: 0 } };
  const MAT = castMaterials(TN, THEMES, { humanUni, agentUni, headUni, faceUni, cardUni }, GUIDE_FACE_COLS);
  // the night values (applyTheme('night')'s writes), except the decal: guide-only opacity, always drawn
  for (const m of [MAT.humanMat, MAT.humanHeadMat, MAT.accMat]) {
    m.color.copy(TN.humanTintMul); m.emissive.copy(TN.humanEmissive); m.emissiveIntensity = TN.humanEmissiveI;
  }
  MAT.agentBodyMat.color.copy(TN.agentColor);
  MAT.agentHeadMat.color.copy(TN.agentHeadColor);
  MAT.agentHeadMat.emissive.copy(TN.agentHeadEmissive);
  MAT.agentHeadMat.emissiveIntensity = TN.agentHeadEmissiveI;
  MAT.cardMat.color.copy(TN.cardColor);
  MAT.cardMat.emissive.copy(TN.cardEmissive);
  MAT.cardMat.emissiveIntensity = TN.cardEmissiveI;
  MAT.decalMat.color.copy(TN.decalColor);
  MAT.decalMat.opacity = GUIDE_DECAL_OPACITY;

  // ---- geometry and meshes (the floor's attribute set, the guides' caps) --------------------------------------
  const GEO = castGeometries();
  const accGeo = GEO.ACCG.geo;
  const aSel = new Float32Array(GUIDE_CAP.acc), aColA = new Float32Array(GUIDE_CAP.acc * 3), aColB = new Float32Array(GUIDE_CAP.acc * 3);
  accGeo.setAttribute('aSel', new THREE.InstancedBufferAttribute(aSel, 1));
  accGeo.setAttribute('aColor', new THREE.InstancedBufferAttribute(aColA, 3));
  accGeo.setAttribute('aColor2', new THREE.InstancedBufferAttribute(aColB, 3));
  const aCell = new Float32Array(GUIDE_CAP.card);
  const cellAttr = new THREE.InstancedBufferAttribute(aCell, 1);
  GEO.cardGeo.setAttribute('aCell', cellAttr);
  const aSkin = new Float32Array(GUIDE_CAP.hh * 3), aHair = new Float32Array(GUIDE_CAP.hh * 3), aBun = new Float32Array(GUIDE_CAP.hh);
  GEO.humanHeadGeo.setAttribute('aSkin', new THREE.InstancedBufferAttribute(aSkin, 3));
  GEO.humanHeadGeo.setAttribute('aHair', new THREE.InstancedBufferAttribute(aHair, 3));
  GEO.humanHeadGeo.setAttribute('aBun', new THREE.InstancedBufferAttribute(aBun, 1));
  const tintHB = new Float32Array(GUIDE_CAP.hb * 3).fill(1), tintHL = new Float32Array(GUIDE_CAP.hl * 3).fill(1);
  GEO.humanBodyGeo.setAttribute('aTint', new THREE.InstancedBufferAttribute(tintHB, 3));
  GEO.humanLimbGeo.setAttribute('aTint', new THREE.InstancedBufferAttribute(tintHL, 3));
  const aFrame = new Float32Array(GUIDE_CAP.face);
  const frameAttr = new THREE.InstancedBufferAttribute(aFrame, 1);
  frameAttr.setUsage(THREE.DynamicDrawUsage);
  GEO.faceGeo.setAttribute('aFrame', frameAttr);

  const meshes = [];
  const mk = (name, geo, mat, cap, shadow, rimmed) => {
    const fade = new Float32Array(cap);
    const attr = new THREE.InstancedBufferAttribute(fade, 1);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aFade', attr);
    let rim = null, rimAttr = null;
    if (rimmed) {
      rim = new Float32Array(cap);
      rimAttr = new THREE.InstancedBufferAttribute(rim, 1);
      rimAttr.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('aRim', rimAttr);
    }
    const m = new THREE.InstancedMesh(geo, mat, cap);
    m.name = 'guide-' + name;
    m.layers.set(1);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    m.castShadow = shadow;
    m.receiveShadow = false;
    if (shadow) m.customDepthMaterial = MAT.depthMat;
    for (let k = 0; k < cap; k++) m.setMatrixAt(k, ZERO);
    root.add(m);
    meshes.push(m);
    return { m, fade, attr, rim, rimAttr, arr: m.instanceMatrix.array };
  };
  const HB = mk('humanBody', GEO.humanBodyGeo, MAT.humanMat, GUIDE_CAP.hb, true, true);
  const HH = mk('humanHead', GEO.humanHeadGeo, MAT.humanHeadMat, GUIDE_CAP.hh, true, true);
  const HL = mk('humanLimbs', GEO.humanLimbGeo, MAT.humanMat, GUIDE_CAP.hl, true, true);
  const AB = mk('agentBody', GEO.agentBodyGeo, MAT.agentBodyMat, GUIDE_CAP.ab, true, true);
  const AH = mk('agentHead', GEO.agentHeadGeo, MAT.agentHeadMat, GUIDE_CAP.ah, true, true);
  const AL = mk('agentLimbs', GEO.agentLimbGeo, MAT.agentBodyMat, GUIDE_CAP.al, true, true);
  const AF = mk('agentFace', GEO.faceGeo, MAT.agentFaceMat, GUIDE_CAP.face, false);
  const CD = mk('cards', GEO.cardGeo, MAT.cardMat, GUIDE_CAP.card, false);
  const DC = mk('decals', GEO.decalGeo, MAT.decalMat, GUIDE_CAP.decal, false);
  DC.m.renderOrder = -4;
  const ACC = mk('accessories', accGeo, MAT.accMat, GUIDE_CAP.acc, false, true);
  const RIMMED = [HB, HH, HL, AB, AH, AL, ACC];
  GEO.edgeGeo.dispose();   // the floor's shadow caster; a guide card never needs one (it is inside the sheet)

  // ---- the look: Lim's people colours, each agent's cosmetic and its night colours (applyTheme's guard) -------------
  const accLimb = new Int8Array(NF * 4).fill(-1), accHead = new Int8Array(NF).fill(-1), accBody = new Int8Array(NF).fill(-1);
  {
    const put = (arr, k, c) => { arr[k * 3] = c.r; arr[k * 3 + 1] = c.g; arr[k * 3 + 2] = c.b; };
    let slot = 0;
    for (const f of FIGS) {
      if (f.human) {
        const p = PEOPLE[f.def.person] || PEOPLE._default, i = f.slot;
        put(tintHB, i, p.top);
        put(tintHL, i * 4, p.trousers); put(tintHL, i * 4 + 1, p.trousers);
        put(tintHL, i * 4 + 2, p.top); put(tintHL, i * 4 + 3, p.top);
        put(aSkin, i, p.skin); put(aHair, i, p.hair); aBun[i] = p.bun;
        continue;
      }
      // the source floor figure's cosmetic (ACC_WEAR), unless the roster names one
      const worn = ACC_WEAR.find((w) => w[0] === f.def.src);
      const item = f.def.acc || (worn ? worn[1] : null), ty = ACC_T[item];
      if (ty === undefined) continue;
      const an = ACC_ANCHOR[ty];
      let a = TN[ACC_COL[ty][0]], b = TN[ACC_COL[ty][1]];
      if (an === 'body' && contrastOf(a, TN.agentColor) < ACC_CONTRAST_MIN) { a = TN.acc5; if (ACC_COL[ty][1] === ACC_COL[ty][0]) b = a; }
      for (const k of an === 'arm' ? [2, 3] : an === 'leg' ? [0, 1] : [-1]) {
        if (slot >= GUIDE_CAP.acc) break;
        aSel[slot] = ty; put(aColA, slot, a); put(aColB, slot, b);
        if (an === 'head') accHead[f.n] = slot; else if (an === 'body') accBody[f.n] = slot; else accLimb[f.n * 4 + k] = slot;
        slot++;
      }
    }
  }
  const CARD_IX = {};
  GUIDE_CARDS.forEach((c, k) => { CARD_IX[c.id] = k; aCell[k] = c.cell; });

  // ---- the rig: the floor's pose writer over the guides' meshes and arrays ---------------------------------------
  const limbA = new Float64Array(NF * 4), armS = new Float64Array(NF * 2).fill(1), armR = new Float64Array(NF * 2);
  const hx = new Float64Array(NF * 2), hy = new Float64Array(NF * 2), hz = new Float64Array(NF * 2);
  const kx = new Float64Array(NF * 2), ky = new Float64Array(NF * 2), kz = new Float64Array(NF * 2), kyaw = new Float64Array(NF * 2);
  const reachW = new Float64Array(NF * 2), flatW = new Float64Array(NF * 2);   // always 0: a guide carries, never reaches
  const gTh = new Float64Array(NF), gVis = new Uint8Array(NF);
  const rig = { HB, HH, HL, AB, AH, AL, AF, CD, CE: null, DC, ACC, limbA, armS, armR, hx, hy, hz, kx, ky, kz, kyaw, reachW, flatW,
    accLimb, accHead, accBody, cardS: CARD_S_GUIDE };
  const { writeFigure, writeCard } = makeRig(rig);

  function dirty() {
    for (let k = 0; k < meshes.length; k++) {
      meshes[k].instanceMatrix.needsUpdate = true;
      meshes[k].geometry.getAttribute('aFade').needsUpdate = true;
    }
    for (let k = 0; k < RIMMED.length; k++) RIMMED[k].rimAttr.needsUpdate = true;
    frameAttr.needsUpdate = true;
  }
  const blinkAt = (f, t) => {
    const u = fmod(t + f.blinkO, f.blinkP), B = f.blinkT;
    for (let k = 0; k < B.length; k++) { if (u < B[k]) return false; if (u < B[k] + BLINK_D) return true; }
    return false;
  };

  function pose(id, p) {
    const f = byId[id];
    if (!f) return;
    const o = p || {}, n = f.n, sp = f.sp;
    const x = numOr(o.x, 0), z = numOr(o.z, 0), th = numOr(o.yaw, 0), lean = numOr(o.lean, 0);
    const ph = numOr(o.walkPhase, 0), wk = clamp(numOr(o.walkK, 0), 0, 1);
    const t = Number.isFinite(o.t) ? o.t : null;
    // the floor's walk (update(): legs, arm swing, bob, the human waddle), with the stride's phase given directly
    const stride = Math.sin(ph);
    const sw = sp.walkArm * wk * stride, legW = sp.walkLeg * wk * stride;
    limbA[n * 4] = legW; limbA[n * 4 + 1] = -legW;
    limbA[n * 4 + 2] = Number.isFinite(o.armL) ? o.armL : -sw;
    limbA[n * 4 + 3] = Number.isFinite(o.armR) ? o.armR : sw;
    armS[n * 2] = 1; armS[n * 2 + 1] = 1;
    armR[n * 2] = sp.armRoll + numOr(o.armLRoll, 0); armR[n * 2 + 1] = sp.armRoll + numOr(o.armRRoll, 0);
    let bob = 0, roll = 0;
    if (wk > 0) {
      if (f.human) { bob = sp.bob * wk * (0.5 + 0.5 * Math.cos(2 * ph)); roll = sp.roll * wk * stride; }
      else bob = sp.bob * wk * Math.abs(Math.sin(ph));
    }
    const breath = f.human && t !== null ? 1 + BREATH_A * Math.sin(TAU * (t / BREATH_P + f.ph0)) : 1;
    const headBob = !f.human && t !== null ? HEADBOB_A * Math.sin(TAU * (t / HEADBOB_P + f.ph1)) : 0;
    const vw = clamp(numOr(o.vis, 1), 0, 1), vis = vw >= 0.5;
    const hYaw = clamp(numOr(o.headYaw, 0), -HEAD_CLAMP, HEAD_CLAMP), hPitch = clamp(numOr(o.headPitch, 0), -HEAD_CLAMP, HEAD_CLAMP);
    writeFigure(f, x, bob, z, th, lean, roll, hYaw, hPitch, 0, vis, vw, bob, numOr(o.rim, 1), breath, headBob);
    gTh[n] = th; gVis[n] = vis ? 1 : 0;
    if (!f.human) {
      let fr = Math.round(numOr(o.frame, 0));
      if (fr === 0 && t !== null && blinkAt(f, t)) fr = FACE_FRAMES.blink;
      aFrame[f.slot] = fr;
    }
    dirty();
  }

  function card(id, c) {
    const k = CARD_IX[id];
    if (k === undefined) return;
    const d = GUIDE_CARDS[k], o = c || {}, S = CARD_S_GUIDE;
    const cell = Number.isFinite(o.cell) ? o.cell : d.cell;
    if (aCell[k] !== cell) { aCell[k] = cell; cellAttr.needsUpdate = true; }
    const mode = o.mode || 'hidden';
    if (mode === 'lay') {
      writeCard(k, numOr(o.x, 0), LAY_Y * S, numOr(o.z, 0), numOr(o.yaw, 0), -PI / 2, 0, true, S);
    } else if (mode === 'hand' || mode === 'show') {
      const h = byId[o.holder || d.holder];
      if (!h) writeCard(k, 0, 0, 0, 0, 0, 0, false, S);
      else {
        const j = h.n * 2 + (o.side === 'L' ? 0 : 1);
        if (mode === 'hand') writeCard(k, kx[j], ky[j], kz[j], kyaw[j], 0, 0, gVis[h.n] === 1, S);
        else {
          // body frame: the hand's outward side is +x for the left hand, -x for the right (writeFigure's sx)
          const sx = o.side === 'L' ? 1 : -1, th = gTh[h.n], ox = sx * (CARD_W2 * S + SHOW_IN);
          const cs = Math.cos(th), sn = Math.sin(th);
          writeCard(k, hx[j] + ox * cs + SHOW_FWD * sn, hy[j] + 0.105 * S - SHOW_UP, hz[j] - ox * sn + SHOW_FWD * cs,
            0, 0, 0, gVis[h.n] === 1, S);
        }
      }
    } else writeCard(k, 0, 0, 0, 0, 0, 0, false, S);
    dirty();
  }

  // ---- the face atlas's guide slots (5 bang, 6 tick, 7 thumb, 8 the count) and the live count --------------------
  const faceTex = MAT.agentFaceMat.map, faceCtx = faceTex.image.getContext('2d');
  let GG = null, pendText = null, pendFit = null, shownKey = null, lastUp = -Infinity, textTimer = 0;
  function flushText() {
    textTimer = 0;
    if (!GG || pendText === null) return;
    const s = pendText, f = pendFit;
    pendText = null; pendFit = null;
    const key = s + '\u0000' + f;
    if (key === shownKey) return;
    faceCtx.clearRect(128 * 8, 0, 128, 128);
    GG.paintCount(faceCtx, s, f);
    shownKey = key;
    if (!uploadCountSlot()) faceTex.needsUpdate = true;
    lastUp = performance.now();
  }
  // slot 8 alone: the atlas is already on the GPU at its current version (no whole upload pending), so copy the slot to
  // a 128 x 128 scratch and texSubImage2D it with the atlas's own unpack settings, then rebuild the mipmaps. The slot
  // spans the atlas's full height, so FLIP_Y flips it in place (yoffset 0). False (the caller sets needsUpdate) when
  // there is no renderer or the atlas has not landed yet.
  let subC = null, subX = null;
  function uploadCountSlot() {
    if (!renderer) return false;
    const tp = renderer.properties.get(faceTex);
    if (!tp || !tp.__webglTexture || tp.__version !== faceTex.version) return false;
    if (!subC) { subC = document.createElement('canvas'); subC.width = subC.height = 128; subX = subC.getContext('2d'); }
    subX.clearRect(0, 0, 128, 128);
    subX.drawImage(faceTex.image, 128 * 8, 0, 128, 128, 0, 0, 128, 128);
    const gl = renderer.getContext();
    renderer.state.bindTexture(gl.TEXTURE_2D, tp.__webglTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, faceTex.flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, faceTex.premultiplyAlpha);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, faceTex.unpackAlignment);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 128 * 8, 0, gl.RGBA, gl.UNSIGNED_BYTE, subC);
    if (faceTex.generateMipmaps) gl.generateMipmap(gl.TEXTURE_2D);
    return true;
  }
  function setFaceText(str, fit = str) {
    pendText = String(str);
    pendFit = String(fit ?? str);
    if (!GG) return;                              // lands when the glyph module does
    const wait = GUIDE_TEXT_MS - (performance.now() - lastUp);
    if (wait <= 0) { if (textTimer) { clearTimeout(textTimer); textTimer = 0; } flushText(); }
    else if (!textTimer) textTimer = setTimeout(flushText, wait);
  }
  import('./faces/guide-glyphs.js').then((M) => {
    if (!M || typeof M.paintGuideGlyphs !== 'function' || typeof M.paintCount !== 'function') return;
    M.paintGuideGlyphs(faceCtx);
    faceTex.needsUpdate = true;
    GG = M;
    if (pendText !== null) flushText();
  }).catch(() => { GG = null; });

  // ---- the card atlas (the floor's texture, one upload); the hairline card until it lands -------------------------
  cardAtlas().then((CA) => {
    if (!CA) return;
    const old = MAT.cardMat.map;
    MAT.cardMat.map = CA.tex;
    if (old && old !== CA.tex) old.dispose();
    cardUni.uCardAtlas.value.set(CA.A.cellW / CA.A.W, CA.A.cellH / CA.A.H, CA.A.cols, 1);
  }).catch(() => {});

  function hideAll() {
    for (const D of [HB, HH, HL, AB, AH, AL, AF, CD, DC, ACC]) {
      for (let k = 0; k < D.m.count; k++) D.m.setMatrixAt(k, ZERO);
      D.fade.fill(0);
    }
    gVis.fill(0);
    dirty();
  }

  return {
    root,
    meshes,
    FRAMES: { open: 0, blink: 1, happy: 2, lookR: 3, lookL: 4, bang: 5, tick: 6, thumb: 7, count: 8, ask: 9 },
    YAW: { lens: 0, plusX: PI / 2 },
    ARM: { down: 0, carryA: SPEC.A.carry, carryH: SPEC.H.carry, show: 125 * DEG, handoffH: 60 * DEG },
    WALK: { cadenceA: SPEC.A.cadence, cadenceH: SPEC.H.cadence, acc: WALK_ACC },
    pose,
    card,
    setFaceText,
    hideAll,
  };
}
