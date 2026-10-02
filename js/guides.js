// guides.js — the proof sections' guide agents (FIX-PLAN-R6 §S2 passes, §S4 beats). STAGE owns this file.
//
// createGuides({ THREE, renderer, scene, THEMES, TH, castMod, reduced, lights: { hemi, sun, key }, applyTheme })
//   → { root, frame(t, dt, W, H), warm(W, H), api }. Throws when the cast has no buildGuides (stage.js then sets
//   html.no-guides). stage.js calls warm() inside its warm-up (scissor test on) and frame() after its own passes on
//   every frame, the stage-off ground pass included.
//
// Isolation (S2.2): every guide mesh is on layer 1 only; hemi / sun / key also light layer 1, so a guide camera sees
// the floor's light set and hits the floor's programs. Each guide lives in its own room at x = 1000 + 40·k with
// camera far 30, so no room ever sees another. The walls, traces and floor cast are layer 0 and never drawn here.
//
// Slots (§0.3): .guide[data-guide=bow|cap|hat|phones|pair]. One IntersectionObserver (rootMargin '100% 0px') arms a
// slot a viewport ahead; only armed slots read getBoundingClientRect() per frame, and a slot draws while its rect
// meets the canvas. bow / phones render as asides, hat / pair as strips, cap as a strip (w ≥ h) or the mobile track.
//
// Clocks: every beat runs on performance.now() seconds, never the scene clock. Each non-scrub beat plays once, when its
// trigger's top has held at or above LINE·vh for DWELL AND the slot is ≥ 50 % in view (so a CTA fly-through fires
// nothing). cap is the one scrub. Reduced motion: no beat plays; every guide holds its final pose.
//
// api (window.__lens.guides via main.js):
//   seek(id, t | null, beat?) pins one guide's beat time, s (cap: t is uS). beat names the beat where a guide has two:
//     phones 'count' (default; t = the count clock s) | 'story'; pair 1 (default) | 2. Earlier beats read as done.
//   freeze(t | null) pins every guide's idle clock (breath, head bob, blink, glances, nods).
//   state() → { [id]: { armed, drawn, shape, beat, played, t, uS } }.
import { LINE, DWELL, COUNT, COUNT_END, ease, countAt, fmt } from './proof-beats.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const clamp01 = (v) => clamp(v, 0, 1);
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp01((t - a) / (b - a));      // linear progress of t over [a, b]
const ez = (t, a, b) => ease(prog(t, a, b));                // brand-eased progress of t over [a, b]
const ss = (u) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
const fmod = (a, n) => ((a % n) + n) % n;
const nowS = () => performance.now() / 1000;

// ---- rooms, figures, cards ------------------------------------------------------------------------------------------------
const IDS = ['bow', 'cap', 'hat', 'phones', 'pair'];
const ROOM_X0 = 1000, ROOM_DX = 40;                          // room k's centre: x = 1000 + 40·k, z 0
const FIGS = { bow: ['bow'], cap: ['cap'], hat: ['Lim', 'hat'], phones: ['phones'], pair: ['scarf', 'beanie'] };

// ---- cameras (§S2.5) ------------------------------------------------------------------------------------------------------
const NEAR = 0.05, FAR = 30;
const ASIDE = {
  // bow az −6 (DIRECTOR R8; plan −18): at −18 the lens sat on the side the agent turns to (−55°, screen-left, toward
  // the table), so the turn read as a glance at the viewer (37° off the lens). At −6 the body is 49° off the lens (the
  // bow tie still shows) and the head turns a further A_HEAD_REST toward the column: it reads as looking at the table.
  bow: { fov: 22, el: 10, az: -6, fh: 1.05, cy: 0.45 },
  // phones fh .95 (DIRECTOR R8; plan .85): at .85 / cy .42 the frame's bottom sat at y .005, on the feet, and the pool
  // was cut by the slot's bottom edge in a hard line (1440). .95 puts the bottom at −.055, below the pool's front edge.
  phones: { fov: 20, el: 8, az: -12, fh: 0.95, cy: 0.42 },
};
const ASIDE_POOL_FIT = 0.9;  // an aside's pool spans at most this share of the frame's width
const ASIDE_MIN_W = 0.5;     // the least world width an aside frames (only the 110 px mobile phones column needs it)
const STRIP = { fov: 10, el: 12, az: 0 };
const TRACK = { fov: 14, el: 38, az: 0 };
const K_DESK = 164, K_MOB = 108, K_SWITCH = 150;              // px per world unit: slot height ≥ 150 → desktop
const STRIP_REF_Y = 0.3;     // strips are pixel-true (k px / unit) at this height above z 0: the figures' body mass
const STRIP_FOOT_PX = 9;     // the feet stand this far above a strip's bottom edge (the pool shows below them)
const TRACK_Y = 0.3;         // the mobile track maps each seg centre's screen row to the z where this height meets it
// ...but never higher than this row (css px below the track's top): at the Call seg (the first, at the very top) the
// figure's head and cap stand ~34 px above its body row and were cut by the slot's top edge (stage manager R6)
const TRACK_HEAD_PX = 44;

// ---- light and pools (§S2.6) ----------------------------------------------------------------------------------------------
const HEMI_I = 0.55, KEY_I = 0.90, KEY_OFF = [-3, 4, 5];
const POOL_W = 1.1, POOL_D = 0.8, POOL_OP = 0.32, POOL_Y = 0.004;

// ---- motion ---------------------------------------------------------------------------------------------------------------
// The leg cycle advances by distance (no skating): one full cycle (2π) per STRIDE_A world units. At the floor cadence
// (1.5 Hz) that is a .8 u/s stroll; the beats' 1.1-1.7 u/s walks step at 2-3 Hz. PH_RATE_MAX caps a scrub flick at
// 3.5 Hz so the legs never strobe (the body still moves the whole distance).
const STRIDE_A = 0.53;
const PH_RATE_MAX = TAU * 3.5;
const TURN_D = 0.3;          // turns: 0.3 s, brand ease

// A bow (§S4 A)
const A_X0 = -1.25, A_WALK = 1.10, A_TURN1 = 1.40, A_LIGHT = 1.30, A_HAPPY1 = 2.20;
const A_HEAD_REST = -15;     // DIRECTOR R8: the head leads the body toward the column by 15° once turned
const A_YAW = -55, A_PITCH = 6, A_GLANCE_P = 4.5, A_GLANCE_D = 0.5, A_GLANCE_HOLD = 1.5, A_GLANCE_YAW = 25;   // −55 → −30
// B cap (§S4 B timeline)
const CAP_T = 0.30, CAP_VMAX = 0.8, CAP_IDLE_V = 0.02, CAP_YAW_T = 0.25, CAP_LAY_D = 0.45, CAP_LEAN = 18, CAP_LAY_DX = 0.12;
// the mobile track lays the card beside the path at Handover's row (on the agent's right-hand side, toward the list), not
// ahead of it: laid ahead, the flat card projects onto the Monthly agent's cap and reads as balanced on its head
const CAP_LAY_TRACK_X = -0.22;
const CAP_U = [0, 0.20, 0.32, 0.58, 0.76, 0.94, 1];          // the band edges; waypoints [x0 x1 x2 x2 x3 x4 x4]
const TRACK_LINE = 0.62;     // the mobile track's reading line, a share of vh (DIRECTOR R8)
const CAP_REST = 0.6;                                          // the track's at-rest turn back to the lens, s
const CAP_SHOW_A = 0.32, CAP_SHOW_B = 0.58, CAP_LAY_U = 0.76, CAP_END_U = 0.94;
// B hat (§S4 B You / Me)
const H_LIM_YAW = 50, H_GAP = 0.55, H_HANDOFF = 0.60, H_PASS = 0.30, H_TURN1 = 0.90, H_SPEED = 1.3, H_DMIN = 1.2, H_DMAX = 2.4;
const HEAD_TOP_A = 0.67, HEAD_TOP_H = 0.96;               // cast.js SPEC.A.top / SPEC.H.top (api.debug.head only)
const H_THUMB = 1.4, H_HEAD_BACK = 0.6, H_EYE_DY = 0.265;   // Lim's head centre .785 above the agent's .52
// C phones (§S4 C)
const C_REST = -20, C_JOLT = -6, C_BANG = 0.9, C_TICK = 2.5;
// D pair (§S4 D)
const D_EDGE = 0.55, D_IN = 15, D_UP = 0.4, D_HOLD = 0.5, D_DOWN = 0.4, D_LAG = 0.15, D_NOD = 5, D_NOD_D = 0.35, D_NOD_P = 3.2,
  D_NOD_OFF = 1.6, D_B1_END = D_UP + D_HOLD + D_DOWN + D_LAG;
const D_FACE_S = -35, D_FACE_B = -55, D_WAVE = 150, D_WAVE_ROLL = 18, D_WAVE_N = 2, D_B2_END = 1.9;

export function createGuides({ THREE, renderer, scene, THEMES, TH, castMod, reduced, lights, applyTheme }) {
  if (!castMod || typeof castMod.buildGuides !== 'function') throw new Error('guides: the cast has no buildGuides');
  if (!lights || !lights.hemi || !lights.key || typeof applyTheme !== 'function') throw new Error('guides: missing stage hooks');
  const G = castMod.buildGuides(scene, { THEMES, rimI: 0.65, renderer });
  if (!G || typeof G.pose !== 'function' || typeof G.card !== 'function') throw new Error('guides: buildGuides returned no rig');
  const F = G.FRAMES, ARM = G.ARM;
  const YS = Math.sin(G.YAW.plusX - G.YAW.lens) >= 0 ? 1 : -1;       // + degrees turn toward +x (screen-right)
  const yawOf = (d) => G.YAW.lens + YS * d * DEG;                      // degrees from the lens → the rig's yaw
  const { hemi, key } = lights;
  const html = document.documentElement;
  const canvas = renderer.domElement;

  // ---- pools: a clone of the floor's pool-1 material per figure (§S2.6) ------------------------------------------------
  const poolSrc = scene.getObjectByName('pool-1');
  if (!poolSrc || !poolSrc.material || !poolSrc.geometry) throw new Error('guides: no pool-1 to clone');
  const poolRoot = new THREE.Group();
  poolRoot.name = 'guides-pool';
  poolRoot.layers.set(1);
  scene.add(poolRoot);
  const pools = {};
  for (const id of IDS) for (const fid of FIGS[id]) {
    const src = poolSrc.material;
    const m = src.clone();
    if (src.onBeforeCompile) m.onBeforeCompile = src.onBeforeCompile;
    if (src.customProgramCacheKey) m.customProgramCacheKey = src.customProgramCacheKey;
    if (src.userData && src.userData.uniforms) m.userData.uniforms = src.userData.uniforms;
    m.color.copy(TH.night.poolColor);
    m.opacity = POOL_OP;
    const p = new THREE.Mesh(poolSrc.geometry, m);
    p.name = 'guide-pool-' + fid;
    p.layers.set(1);
    p.scale.set(POOL_W, 1, POOL_D);
    p.position.set(roomX(id), POOL_Y, 0);
    p.renderOrder = poolSrc.renderOrder;
    poolRoot.add(p);
    pools[fid] = p;
  }
  function roomX(id) { return ROOM_X0 + ROOM_DX * IDS.indexOf(id); }

  // ---- the guides: slot, triggers, beat bookkeeping ---------------------------------------------------------------------
  const cams = {};
  const V3 = new THREE.Vector3();
  const guides = [];
  const byId = {};
  for (const id of IDS) {
    const el = document.querySelector('.guide[data-guide="' + id + '"]');
    const cam = new THREE.PerspectiveCamera(20, 1, NEAR, FAR);
    cam.layers.set(1);
    cams[id] = cam;
    const g = {
      id, el, cam, rx: roomX(id),
      armed: false, drawn: false, poolS: 1, shape: id === 'bow' || id === 'phones' ? 'aside' : 'strip',
      r: { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }, vis: 0, k: K_DESK,
      trig: el && el.dataset.guideTrigger ? document.querySelector(el.dataset.guideTrigger) : null,
      trig2: el && el.dataset.guideTrigger2 ? document.querySelector(el.dataset.guideTrigger2) : null,
      // beats: start (performance s, −1 = not yet), held (performance s the gate opened, −1 = closed), played
      b: {},
      pin: null, pinBeat: null,
      camKey: '',
    };
    guides.push(g);
    byId[id] = g;
  }
  const beat = (g, name, end) => (g.b[name] || (g.b[name] = { start: -1, held: -1, played: false, fired: false, end }));
  // each beat's length, s (hat: its longest, the walk at D_MAX; state() only)
  beat(byId.bow, 'walk', A_HAPPY1);
  beat(byId.hat, 'handoff', H_TURN1 + H_DMAX + TURN_D + H_THUMB + H_HEAD_BACK);
  beat(byId.phones, 'count', COUNT_END); beat(byId.phones, 'story', C_TICK);
  beat(byId.pair, 'show', D_B1_END); beat(byId.pair, 'wave', D_B2_END);
  // cap: the scrub state
  const cap = {
    init: false, uS: 0, vS: 0, u: 0, x: 0, ph: 0, walkK: 0, yawT: 90, showK: 0,
    card: 'hand', layT: 0, pts: [0, 0, 0, 0, 0], rest: 0, segY: [0, 0, 0, 0, 0],
  };
  const segEls = byId.cap.el && byId.cap.el.dataset.guideTrack
    ? Array.from(document.querySelectorAll(byId.cap.el.dataset.guideTrack)) : [];
  const markEls = byId.hat.el && byId.hat.el.dataset.guideMarks
    ? byId.hat.el.dataset.guideMarks.split(',').map((s) => document.querySelector(s.trim())) : [];
  const statsEl = document.querySelector('#proof .stats');

  // one observer arms a slot a viewport ahead (a cost trigger, INTERACTION rule 6)
  let io = null;
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const g = guides.find((x) => x.el === e.target);
        if (g) g.armed = e.isIntersecting;
      }
    }, { rootMargin: '100% 0px' });
    for (const g of guides) if (g.el) io.observe(g.el);
  } else {
    for (const g of guides) if (g.el) g.armed = true;
  }

  // ---- clocks and pins --------------------------------------------------------------------------------------------------
  let frozen = null;                                    // the pinned idle clock, s
  const idleT = (now) => (reduced ? null : frozen !== null ? frozen : now);
  let lastNow = -1;
  let started = false;

  // pose scratch, reset per figure
  const P = {};
  function P0(x, yawD) {
    P.x = x; P.z = 0; P.yaw = yawOf(yawD); P.lean = 0; P.walkPhase = 0; P.walkK = 0; P.headYaw = 0; P.headPitch = 0;
    P.armL = null; P.armR = null; P.armLRoll = 0; P.armRRoll = 0; P.frame = F.open; P.rim = 1; P.vis = 1; P.t = null;
    return P;
  }
  // the last pose's (x, z, yaw) per figure, read by api.debug.head()
  const figAt = {};
  // pose one figure from P and put its pool under its feet
  // poolS: the current slot's pool scale (placeCam); an aside frames less than the pool's 1.1 world, so its pool shrinks
  // to fit inside the slot rather than end in a hard edge at the slot's sides. poolK: an opacity factor (the bow's walk-in).
  let poolS = 1;
  function put(fid, poolK = 1) {
    G.pose(fid, P);
    const p = pools[fid];
    if (p) {
      p.position.x = P.x; p.position.z = P.z;
      p.scale.set(POOL_W * poolS, 1, POOL_D * poolS);
      p.material.opacity = POOL_OP * poolK;
    }
    const a = figAt[fid] || (figAt[fid] = { x: 0, z: 0, yaw: 0 });
    a.x = P.x; a.z = P.z; a.yaw = P.yaw;
  }
  function dispatch(id, name) {
    document.dispatchEvent(new CustomEvent('lens:beat', { detail: { id, beat: name, at: performance.now() } }));
  }

  // trapezoid walk (the floor's WALK_ACC): distance along L at tau, and the speed factor
  const ACC = Number.isFinite(G.WALK && G.WALK.acc) ? G.WALK.acc : 0.3;
  function trapS(L, D, tau) {
    const a = Math.min(ACC, D / 2), v = L / (D - a);
    if (tau <= 0) return 0;
    if (tau >= D) return L;
    if (tau < a) return 0.5 * v / a * tau * tau;
    if (tau < D - a) return v * (tau - a / 2);
    const r = D - tau;
    return L - 0.5 * v / a * r * r;
  }
  function trapK(D, tau) { const a = Math.min(ACC, D / 2); if (tau <= 0 || tau >= D) return 0; return Math.min(1, tau / a, (D - tau) / a); }

  // ---- slot measuring -------------------------------------------------------------------------------------------------
  let cLeft = 0, cTop = 0;
  function measure(g, W, H, vh) {
    const q = g.el.getBoundingClientRect();
    const r = g.r;
    r.left = q.left - cLeft; r.top = q.top - cTop; r.width = q.width; r.height = q.height;
    r.right = r.left + r.width; r.bottom = r.top + r.height;
    const x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, r.top), y1 = Math.min(H, r.bottom);
    g.drawn = r.width > 0 && r.height > 0 && x1 > x0 && y1 > y0;
    // the fraction of the slot inside the viewport (vertical: the page scrolls on y)
    const v0 = Math.max(0, q.top), v1 = Math.min(vh, q.bottom);
    g.vis = q.height > 0 ? clamp01((v1 - v0) / q.height) : 0;
    g.k = r.height >= K_SWITCH ? K_DESK : K_MOB;
    if (g.id === 'cap') g.shape = r.width >= r.height ? 'strip' : 'track';
  }

  // the eligibility gate (§S4): the trigger's top at or above LINE·vh AND the slot ≥ 50 % in view, held for DWELL
  function gate(g, B, trigEl, now, vh) {
    if (B.played || B.start >= 0) return false;
    let open = false;
    if (trigEl && g.armed && g.el) {
      const top = trigEl.getBoundingClientRect().top;
      open = top <= LINE * vh && g.vis >= 0.5;
    }
    if (!open) { B.held = -1; return false; }
    if (B.held < 0) B.held = now;
    return now - B.held >= DWELL;
  }
  function start(g, name, now) {
    const B = g.b[name];
    B.start = now; B.played = true; B.held = -1;
    dispatch(g.id, name);
  }
  // the beat time of g's beat `name`: the pin, else the live clock; −1 = not yet; Infinity = reduced (the final pose)
  function tOf(g, name, now) {
    if (reduced) return Infinity;
    if (g.pin !== null) {
      const order = Object.keys(g.b);
      const pi = order.indexOf(g.pinBeat), ni = order.indexOf(name);
      if (ni === pi) return g.pin;
      return ni < pi ? Infinity : -1;
    }
    const B = g.b[name];
    return B.start >= 0 ? now - B.start : -1;
  }

  // ---- per-guide logic: gates, then poses ------------------------------------------------------------------------------
  function logic(now, vh) {
    if (reduced) return;
    const bw = byId.bow, ht = byId.hat, ph = byId.phones, pr = byId.pair;
    if (gate(bw, bw.b.walk, bw.trig, now, vh)) start(bw, 'walk', now);
    if (bw.b.walk.start >= 0 && !bw.b.walk.fired && now - bw.b.walk.start >= A_LIGHT) {
      bw.b.walk.fired = true;
      document.dispatchEvent(new CustomEvent('lens:beat', { detail: { id: 'bow', beat: 'light', at: performance.now() } }));
    }
    if (gate(ht, ht.b.handoff, ht.trig, now, vh)) start(ht, 'handoff', now);
    // phones: the count follows the page's data-t0 (no slot gate); the story waits for the count to finish
    // the count's clock is the page's: data-t0 is read every frame, so a re-seeded t0 (__lensProof.seekCount) stays in sync
    const cB = ph.b.count;
    const t0 = statsEl && statsEl.dataset.t0 ? Number(statsEl.dataset.t0) : NaN;
    if (Number.isFinite(t0)) {
      if (cB.start < 0) { cB.played = true; dispatch('phones', 'count'); }
      cB.start = t0 / 1000;
    }
    const countBusy = cB.start >= 0 && now - cB.start < COUNT_END;
    // director R9: on a jump that lands the stats and the story above the line together, proof.js's count (an IO
    // callback + a DWELL timer) can start a frame after this gate, and the story's "!"/tick then covered the count.
    // While the stats sit in proof.js's arming band (0 .. LINE·vh) and the count has not started, the story waits.
    let countDue = false;
    if (cB.start < 0 && statsEl) {
      const sr = statsEl.getBoundingClientRect();
      countDue = sr.bottom > 0 && sr.top <= LINE * vh;
    }
    if (!countBusy && !countDue && gate(ph, ph.b.story, ph.trig2, now, vh)) start(ph, 'story', now);
    // pair: beat 2 waits for beat 1 to finish
    if (gate(pr, pr.b.show, pr.trig, now, vh)) start(pr, 'show', now);
    const b1Done = pr.b.show.start >= 0 && now - pr.b.show.start >= D_B1_END;
    if (b1Done && gate(pr, pr.b.wave, pr.trig2, now, vh)) start(pr, 'wave', now);
  }

  // A — bow
  function poseBow(g, now) {
    const tb = tOf(g, 'walk', now), rx = g.rx, it = idleT(now);
    let x = A_X0, yawD = 90, pitch = 0, headYaw = 0, walkK = 0, phs = 0, frame = F.open;
    if (tb >= 0) {
      const s = trapS(-A_X0, A_WALK, tb);
      x = A_X0 + s;
      walkK = trapK(A_WALK, tb);
      phs = TAU * s / STRIDE_A;
      const e = ez(tb, A_WALK, A_TURN1);
      yawD = lerp(90, A_YAW, e);
      pitch = A_PITCH * e;
      headYaw = A_HEAD_REST * e;
      if (tb >= A_LIGHT && tb < A_HAPPY1) frame = F.happy;
      if (tb >= A_HAPPY1 && it !== null) {
        const gp = fmod(it, A_GLANCE_P);
        const w = ez(gp, 0, A_GLANCE_D) - ez(gp, A_GLANCE_D + A_GLANCE_HOLD, 2 * A_GLANCE_D + A_GLANCE_HOLD);
        headYaw = A_HEAD_REST + A_GLANCE_YAW * w;
      }
    }
    P0(rx + x, yawD);
    P.walkK = walkK; P.walkPhase = phs; P.headPitch = pitch * DEG; P.headYaw = YS * headYaw * DEG; P.frame = frame; P.t = it;
    // the pool comes up as the agent arrives: it enters from beyond the slot's edge, and a pool cut by that edge would
    // draw a hard line there
    put('bow', ss((x - A_X0) / -A_X0));
  }

  // B — cap (the scrub)
  function capWaypoints(g) {
    const r = g.r, pts = cap.pts;
    if (segEls.length < 5) {   // no segs: five even stops across the slot
      for (let i = 0; i < 5; i++) pts[i] = g.shape === 'strip' ? ((i + 0.5) / 5 - 0.5) * r.width / g.k : trackZ(g, Math.max(TRACK_HEAD_PX, (i + 0.5) / 5 * r.height));
      return;
    }
    for (let i = 0; i < 5; i++) {
      const q = segEls[i].getBoundingClientRect();
      cap.segY[i] = q.top + q.height / 2;
      if (g.shape === 'strip') pts[i] = (q.left + q.width / 2 - cLeft - r.left - r.width / 2) / g.k;
      else pts[i] = trackZ(g, Math.max(TRACK_HEAD_PX, q.top + q.height / 2 - cTop - r.top));
    }
  }
  // The mobile track's scrub (DIRECTOR R8). The strip's u (0.8·vh − slot top over 0.5·vh) finished the walk while the
  // rows it walks past were still below the fold: at 390 the whole track is 430 px tall, so the agent reached Build and
  // Handover before those rows scrolled in, and a reader only ever saw it parked at Monthly. On the track the agent
  // follows a reading line instead: each band edge is keyed to a seg centre crossing TRACK_LINE·vh, so the agent is
  // always at the row being read. Knots: seg 0 → u 0, seg 1 → .20, seg 2 → .32, halfway to seg 3 → .58 (the Build
  // dwell), seg 3 → .76, seg 4 → .94, 60 px later → 1.
  function trackU(vh) {
    const c = cap.segY, d = TRACK_LINE * vh - c[0];
    const K = [0, c[1] - c[0], c[2] - c[0], c[2] - c[0] + (c[3] - c[2]) / 2, c[3] - c[0], c[4] - c[0], c[4] - c[0] + 60];
    if (d <= 0) return 0;
    for (let i = 0; i < 6; i++) if (d <= K[i + 1]) return lerp(CAP_U[i], CAP_U[i + 1], prog(d, K[i], K[i + 1]));
    return 1;
  }
  function capAt(u) {   // the waypoint coordinate at scrub u
    const p = cap.pts, W = [p[0], p[1], p[2], p[2], p[3], p[4], p[4]];
    for (let i = 0; i < 6; i++) if (u <= CAP_U[i + 1]) return lerp(W[i], W[i + 1], prog(u, CAP_U[i], CAP_U[i + 1]));
    return W[6];
  }
  function capStep(g, dt, vh) {
    const u = g.shape === 'track' && segEls.length >= 5 ? trackU(vh) : clamp01((0.8 * vh - (g.r.top + cTop)) / (0.5 * vh));
    cap.u = u;
    if (reduced) { cap.uS = 1; cap.vS = 0; cap.card = 'laid'; return; }
    if (g.pin !== null) { cap.uS = clamp01(g.pin); cap.vS = 0; cap.card = cap.uS >= CAP_LAY_U ? 'laid' : 'hand'; return; }
    if (!cap.init) {
      cap.init = true; cap.uS = u; cap.vS = 0; cap.card = u >= CAP_LAY_U ? 'laid' : 'hand';
      cap.x = capAt(u); cap.showK = u >= CAP_SHOW_A && u <= CAP_SHOW_B ? 1 : 0;
      cap.yawT = g.shape === 'track' ? 0 : 90;
      return;
    }
    const prev = cap.uS;
    if (cap.card === 'laying' || cap.card === 'picking') {
      // the lay / pick-up holds the agent at Handover for its 0.45 s
      cap.layT += dt; cap.uS = CAP_LAY_U; cap.vS = 0;
      if (cap.layT >= CAP_LAY_D) cap.card = cap.card === 'laying' ? 'laid' : 'hand';
      return;
    }
    // critically damped smoothing toward u (smoothing time T), speed capped at CAP_VMAX
    if (dt > 0) {
      const w = 2 / CAP_T, xw = w * dt, ex = 1 / (1 + xw + 0.48 * xw * xw + 0.235 * xw * xw * xw);
      const ch = cap.uS - u, tmp = (cap.vS + w * ch) * dt;
      let v = (cap.vS - w * tmp) * ex;
      let n = u + (ch + tmp) * ex;
      if ((u - cap.uS > 0) === (n > u)) { n = u; v = 0; }        // no overshoot
      const dMax = CAP_VMAX * dt;
      if (n - cap.uS > dMax) n = cap.uS + dMax; else if (cap.uS - n > dMax) n = cap.uS - dMax;
      cap.vS = clamp(v, -CAP_VMAX, CAP_VMAX);
      cap.uS = n;
    }
    // crossing Handover: lay the card going forward, pick it up going back
    if (cap.card === 'hand' && prev < CAP_LAY_U && cap.uS >= CAP_LAY_U) { cap.card = 'laying'; cap.layT = 0; cap.uS = CAP_LAY_U; cap.vS = 0; }
    else if (cap.card === 'laid' && prev >= CAP_LAY_U && cap.uS < CAP_LAY_U) { cap.card = 'picking'; cap.layT = 0; cap.uS = CAP_LAY_U; cap.vS = 0; }
  }
  function poseCap(g, now, dt, vh) {
    capWaypoints(g);
    capStep(g, dt, vh);
    const rx = g.rx, it = idleT(now), track = g.shape === 'track';
    const uS = cap.uS, pos = capAt(uS);
    const static_ = reduced || g.pin !== null;
    // travel direction and the leg phase by distance
    const dPos = pos - cap.x;
    if (!static_ && dt > 0) {
      cap.ph += Math.min(TAU * Math.abs(dPos) / STRIDE_A, PH_RATE_MAX * dt);
      const moving = Math.abs(cap.vS) >= CAP_IDLE_V && Math.abs(dPos) > 1e-5;
      cap.walkK += ((moving ? 1 : 0) - cap.walkK) * (1 - Math.exp(-dt / 0.1));
      cap.rest = moving ? 0 : cap.rest + dt;
      // the track walks toward / away from the lens: at rest (CAP_REST s) it turns back to the lens rather than keep
      // its back to the reader; the strips keep the travel direction (a walk paused along the timeline)
      const target = moving ? (track ? (dPos > 0 ? 0 : 180) : (dPos > 0 ? 90 : -90)) : track && cap.rest >= CAP_REST ? 0 : cap.yawT;
      cap.yawT += (target - cap.yawT) * (1 - Math.exp(-dt / (CAP_YAW_T / 3)));
    } else {
      cap.walkK = 0;
      cap.yawT = track ? 0 : 90;
    }
    cap.x = pos;
    // the dwell under Build: turn to the lens and raise the card (0.3 s), reversed on leaving the band
    const inShow = uS >= CAP_SHOW_A && uS <= CAP_SHOW_B && cap.card === 'hand';
    if (static_) cap.showK = inShow ? 1 : 0;
    else cap.showK = clamp01(cap.showK + (inShow ? 1 : -1) * dt / TURN_D);
    const eS = ease(cap.showK);
    const eEnd = ss((uS - CAP_END_U) / (1 - CAP_END_U));
    let yawD = lerp(cap.yawT, 0, Math.max(eS, eEnd));
    let lean = 0, arm = lerp(ARM.carryA, ARM.show, eS), mode = eS > 0.5 ? 'show' : 'hand';
    const layX = cap.pts[3] + CAP_LAY_DX;
    if (cap.card === 'laying' || cap.card === 'picking') {
      const k = clamp01(cap.layT / CAP_LAY_D), kk = cap.card === 'laying' ? k : 1 - k;   // kk: 0 carried .. 1 laid
      lean = CAP_LEAN * Math.sin(Math.PI * k);
      arm = lerp(ARM.carryA, ARM.down, ss(kk * 2));
      mode = kk >= 0.5 ? 'lay' : 'hand';
      yawD = cap.yawT;
    } else if (cap.card === 'laid') { arm = null; mode = 'lay'; }
    const x = track ? 0 : pos, z = track ? pos : 0;
    P0(rx + x, yawD);
    P.z = z; P.lean = lean * DEG; P.walkPhase = cap.ph; P.walkK = cap.walkK; P.armR = arm; P.t = it;
    put('cap');
    if (mode === 'lay') G.card('cap', { mode: 'lay', x: rx + (track ? CAP_LAY_TRACK_X : layX), z: track ? cap.pts[3] : 0, yaw: 0 });
    else G.card('cap', { mode, holder: 'cap', side: 'R' });
  }

  // B — hat (You / Me)
  function hatMarks(g) {
    const r = g.r;
    const a = markEls[0], b = markEls[1];
    if (a && b) {
      const qa = a.getBoundingClientRect(), qb = b.getBoundingClientRect();
      const stacked = qb.top >= qa.bottom - 1 || qa.top >= qb.bottom - 1;
      if (!stacked) return [(qa.left + qa.width / 2 - cLeft - r.left - r.width / 2) / g.k, (qb.left + qb.width / 2 - cLeft - r.left - r.width / 2) / g.k];
    }
    return [(0.25 - 0.5) * r.width / g.k, (0.75 - 0.5) * r.width / g.k];
  }
  function poseHat(g, now) {
    const [xYou, xMe] = hatMarks(g);
    const rx = g.rx, it = idleT(now), tb = tOf(g, 'handoff', now);
    const xA0 = xYou + H_GAP, dist = Math.abs(xMe - xA0), dir = xMe >= xA0 ? 1 : -1;
    const D = clamp(dist / H_SPEED, H_DMIN, H_DMAX);
    const T2 = H_TURN1 + D, T3 = T2 + TURN_D, T4 = T3 + H_THUMB;
    // the agent
    let ax = xA0, ayaw = -90, aArm = null, walkK = 0, phs = 0, frame = F.open, holder = 'Lim';
    // Lim
    let lArm = ARM.carryH;
    if (tb >= 0) {
      aArm = tb < H_PASS ? lerp(ARM.down, ARM.show, ez(tb, 0, H_PASS)) : lerp(ARM.show, ARM.carryA, ez(tb, H_PASS, H_HANDOFF));
      lArm = tb < H_PASS ? lerp(ARM.carryH, ARM.handoffH, ez(tb, 0, H_PASS)) : lerp(ARM.handoffH, ARM.down, ez(tb, H_PASS, H_HANDOFF));
      if (tb >= H_PASS) holder = 'hat';
      const travel = dir > 0 ? 90 : -90;
      ayaw = lerp(-90, travel, ez(tb, H_HANDOFF, H_TURN1));
      if (tb >= H_TURN1) {
        const s = trapS(dist, D, tb - H_TURN1);
        ax = xA0 + dir * s; walkK = trapK(D, tb - H_TURN1); phs = TAU * s / STRIDE_A;
        ayaw = lerp(travel, 0, ez(tb, T2, T3));
      }
      if ((tb >= T3 && tb < T4) || tb === Infinity) frame = F.thumb;   // reduced: the final pose keeps the thumb
    }
    P0(rx + ax, ayaw);
    P.walkK = walkK; P.walkPhase = phs; P.armL = aArm; P.frame = frame; P.t = it;
    put('hat');
    // Lim's head follows the agent throughout the beat, then settles back (breath carries on)
    const limYaw = H_LIM_YAW;
    const toAgent = Math.atan2(ax - xYou, 0.0001) / DEG;                 // +90 when the agent stands at +x
    let follow = tb < 0 ? 1 : 1 - ez(tb, T4, T4 + H_HEAD_BACK);
    if (tb === Infinity) follow = 0;
    const down = Math.atan2(H_EYE_DY, Math.max(0.3, Math.abs(ax - xYou))) / DEG;   // Lim looks down at the agent's screen
    P0(rx + xYou, limYaw);
    P.headYaw = YS * clamp(toAgent - limYaw, -50, 50) * follow * DEG;
    P.headPitch = -down * follow * DEG;
    P.armL = lArm; P.t = it;
    put('Lim');
    G.card('hat', holder === 'Lim' ? { mode: 'hand', holder: 'Lim', side: 'L' } : { mode: 'hand', holder: 'hat', side: 'L' });
  }

  // C — phones
  // fit: each stat's final string, so the face's digits hold one size through its count (FIX-PLAN-R7 S1)
  const FIT0 = fmt(0, COUNT[0].to), FIT1 = fmt(1, COUNT[1].to);
  let faceShown = null;
  function faceText(s, fit) {
    const key = s + '\u0000' + fit;
    if (key !== faceShown) { faceShown = key; G.setFaceText(s, fit); }
  }
  function posePhones(g, now) {
    const rx = g.rx, it = idleT(now);
    let frame = F.open, pitch = 0;
    if (reduced) { frame = F.count; faceText(fmt(0, countAt(0, Infinity)), FIT0); }
    else {
      const s = tOf(g, 'count', now);
      if (s >= 0 && s < COUNT_END) {
        frame = F.count;
        let txt;
        if (s < 1.1) txt = fmt(0, countAt(0, s));
        else if (s < 1.6) txt = fmt(0, countAt(0, Infinity));
        else if (s < 2.4) txt = fmt(1, countAt(1, s));
        else txt = fmt(1, countAt(1, Infinity));
        faceText(txt, s < 1.6 ? FIT0 : FIT1);
      }
      const ts = tOf(g, 'story', now);
      if (ts >= 0 && ts < C_TICK) {
        frame = ts < C_BANG ? F.bang : F.tick;
        pitch = C_JOLT * (ez(ts, 0, 0.15) - ez(ts, 0.15, 0.45));
      }
    }
    P0(rx, C_REST);
    P.frame = frame; P.headPitch = pitch * DEG; P.t = it;
    put('phones');
  }

  // D — pair
  function posePair(g, now) {
    const rx = g.rx, it = idleT(now);
    const Ws = g.r.width / g.k;
    const xs = -Ws / 2 + D_EDGE, xb = Ws / 2 - D_EDGE;
    const t1 = tOf(g, 'show', now), t2 = tOf(g, 'wave', now);
    const fig = (fid, x, restD, cardSide, lag, faceD, nodOff) => {
      let yawD = restD, cardArm = ARM.carryA, mode = 'hand', free = null, freeRoll = 0, frame = F.open, pitch = 0;
      if (t1 >= 0 && t1 !== Infinity) {
        const u = t1 - lag;
        const up = ez(u, 0, D_UP) - ez(u, D_UP + D_HOLD, D_UP + D_HOLD + D_DOWN);
        cardArm = lerp(ARM.carryA, ARM.show, up);
        if (up > 0.5) mode = 'show';
      }
      const waving = t2 >= 0 && t2 < D_B2_END;
      if (waving) {
        yawD = lerp(restD, faceD, ez(t2, 0, 0.4) - ez(t2, 1.4, D_B2_END));
        const env = ez(t2, 0.4, 0.55) - ez(t2, 1.25, 1.4);
        free = lerp(ARM.down, D_WAVE * DEG, env);
        freeRoll = D_WAVE_ROLL * DEG * Math.sin(TAU * D_WAVE_N * prog(t2, 0.4, 1.4)) * env;
        if (t2 >= 0.45 && t2 < 1.35) frame = F.happy;
      } else if (it !== null && (t1 < 0 || t1 >= D_B1_END)) {
        const np = fmod(it + nodOff, D_NOD_P);
        pitch = D_NOD * (ez(np, 0, D_NOD_D) - ez(np, D_NOD_D, 2 * D_NOD_D));
      }
      P0(rx + x, yawD);
      P.headPitch = pitch * DEG; P.frame = frame; P.t = it;
      if (cardSide === 'R') { P.armR = cardArm; P.armL = free; P.armLRoll = freeRoll; }
      else { P.armL = cardArm; P.armR = free; P.armRRoll = freeRoll; }
      put(fid);
      G.card(fid, { mode, holder: fid, side: cardSide });
    };
    // scarf: screen-left, the key in its outer hand (the figure's right); beanie: screen-right, the file in its left
    fig('scarf', xs, D_IN, 'R', 0, D_FACE_S, 0);
    fig('beanie', xb, -D_IN, 'L', D_LAG, D_FACE_B, D_NOD_OFF);
  }

  // ---- cameras ------------------------------------------------------------------------------------------------------------
  function aim(cam, cx, cy, cz, d, elD, azD) {
    const el = elD * DEG, az = azD * DEG;
    cam.position.set(cx + d * Math.cos(el) * Math.sin(az), cy + d * Math.sin(el), cz + d * Math.cos(el) * Math.cos(az));
    cam.up.set(0, 1, 0);
    cam.lookAt(cx, cy, cz);
    cam.updateMatrixWorld(true);
  }
  function lens(cam, fov, aspect) {
    if (cam.fov !== fov || cam.aspect !== aspect || cam.near !== NEAR || cam.far !== FAR) {
      cam.fov = fov; cam.aspect = aspect; cam.near = NEAR; cam.far = FAR;
      cam.updateProjectionMatrix();
    }
  }
  function placeCam(g) {
    const r = g.r, cam = g.cam, w = r.width, h = r.height, aspect = w / h;
    if (g.shape === 'aside') {
      const A = ASIDE[g.id];
      lens(cam, A.fov, aspect);
      // a narrow aside (the mobile phones column, 110 x 220) widens the frame to ASIDE_MIN_W so the head and its
      // headphones clear the slot's sides; the extra height goes below the feet (the centre drops with it)
      const fh = Math.max(A.fh, ASIDE_MIN_W / aspect), cy = A.cy - (fh - A.fh) * 0.25;
      g.poolS = Math.min(1, ASIDE_POOL_FIT * fh * aspect / POOL_W);
      aim(cam, g.rx, cy, 0, fh / (2 * Math.tan(A.fov * DEG / 2)), A.el, A.az);
    } else if (g.shape === 'strip') {
      g.poolS = 1;
      const k = g.k, el = STRIP.el * DEG;
      lens(cam, STRIP.fov, aspect);
      const yc = (h / 2 - STRIP_FOOT_PX) / (k * Math.cos(el));
      const Dstar = h / (2 * k * Math.tan(STRIP.fov * DEG / 2));
      aim(cam, g.rx, yc, 0, Dstar + (STRIP_REF_Y - yc) * Math.sin(el), STRIP.el, STRIP.az);
    } else {
      g.poolS = 1;
      lens(cam, TRACK.fov, aspect);
      aim(cam, g.rx, TRACK_Y, 0, h / (2 * K_MOB * Math.tan(TRACK.fov * DEG / 2)), TRACK.el, TRACK.az);
    }
  }
  // the track: the z where the ray through the column centre at screen row py (px from the slot top) meets y = TRACK_Y
  function trackZ(g, py) {
    const cam = g.cam, h = g.r.height;
    V3.set(0, 1 - 2 * py / h, 0.5).unproject(cam);
    const oy = cam.position.y, oz = cam.position.z;
    const dy = V3.y - oy, dz = V3.z - oz;
    if (Math.abs(dy) < 1e-6) return 0;
    return oz + dz * (TRACK_Y - oy) / dy;
  }

  // ---- the passes -----------------------------------------------------------------------------------------------------------
  const saved = { hemiI: 0, keyI: 0, kp: new THREE.Vector3(), kt: new THREE.Vector3(), exp: 1, fn: 0, ff: 0 };
  function lightsOn() {
    saved.hemiI = hemi.intensity; saved.keyI = key.intensity;
    saved.kp.copy(key.position); saved.kt.copy(key.target.position);
    saved.exp = renderer.toneMappingExposure;
    saved.fn = scene.fog ? scene.fog.near : 0; saved.ff = scene.fog ? scene.fog.far : 0;
    applyTheme('night');
    renderer.toneMappingExposure = 1;
    if (scene.fog) { scene.fog.near = 900; scene.fog.far = 1000; }
    hemi.intensity = HEMI_I;
    key.intensity = KEY_I;
  }
  function keyAt(rx) {
    key.position.set(rx + KEY_OFF[0], KEY_OFF[1], KEY_OFF[2]);
    key.target.position.set(rx, 0, 0);
    key.updateMatrixWorld();
    key.target.updateMatrixWorld();
  }
  function lightsOff() {
    hemi.intensity = saved.hemiI; key.intensity = saved.keyI;
    key.position.copy(saved.kp); key.target.position.copy(saved.kt);
    key.updateMatrixWorld(); key.target.updateMatrixWorld();
    renderer.toneMappingExposure = saved.exp;
    if (scene.fog) { scene.fog.near = saved.fn; scene.fog.far = saved.ff; }
  }
  function draw(g, W, H) {
    const r = g.r;
    const x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, H - r.bottom), y1 = Math.min(H, H - r.top);
    if (x1 <= x0 || y1 <= y0) return;
    keyAt(g.rx);
    renderer.setViewport(r.left, H - r.bottom, r.width, r.height);
    renderer.setScissor(x0, y0, x1 - x0, y1 - y0);
    renderer.clear(false, true, false);
    renderer.render(scene, g.cam);
  }

  function frame(t, dt, W, H) {
    if (!started) { started = true; html.classList.add('guides-on'); }
    const now = nowS();
    const fdt = lastNow < 0 ? 0 : clamp(now - lastNow, 0, 0.1);
    lastNow = now;
    const vh = window.innerHeight || H;
    let any = false;
    let cr = null;
    for (const g of guides) {
      g.drawn = false;
      if (!g.armed || !g.el) continue;
      if (!cr) { cr = canvas.getBoundingClientRect(); cLeft = cr.left; cTop = cr.top; }
      measure(g, W, H, vh);
      if (g.drawn) any = true;
    }
    logic(now, vh);
    // the cap scrub integrates every armed frame (drawn or not), so it never jumps when the strip comes back into view
    if (byId.cap.armed && byId.cap.el && !byId.cap.drawn && byId.cap.r.height > 0) {
      placeCam(byId.cap); capWaypoints(byId.cap); capStep(byId.cap, fdt, vh); cap.x = capAt(cap.uS);
    }
    if (!any) return;
    for (const g of guides) {
      if (!g.drawn) continue;
      placeCam(g);
      poolS = g.poolS;
      if (g.id === 'bow') poseBow(g, now);
      else if (g.id === 'cap') poseCap(g, now, fdt, vh);
      else if (g.id === 'hat') poseHat(g, now);
      else if (g.id === 'phones') posePhones(g, now);
      else posePair(g, now);
    }
    renderer.setScissorTest(true);
    lightsOn();
    for (const g of guides) if (g.drawn) draw(g, W, H);
    lightsOff();
    renderer.setScissorTest(false);
  }

  // every room renders once through a 1 px scissor with the guide lights, so nothing compiles mid-scroll (§S2.7)
  function warm(W, H) {
    const now = nowS();
    for (const g of guides) {
      g.r.left = 0; g.r.top = 0; g.r.width = g.shape === 'aside' ? 240 : 1000; g.r.height = g.shape === 'aside' ? 300 : 170;
      g.r.right = g.r.width; g.r.bottom = g.r.height; g.k = K_DESK;
      placeCam(g);
    }
    // the final (reduced) poses show every part: cards in hand, laid and raised, every face frame's program is one
    const wasPin = guides.map((g) => [g.pin, g.pinBeat]);
    for (const g of guides) { g.pin = 1e6; g.pinBeat = Object.keys(g.b)[Object.keys(g.b).length - 1] || null; }
    cap.pts = [-2, -1, 0, 1, 2];
    byId.cap.pin = 1;
    poseBow(byId.bow, now); poseCap(byId.cap, now, 0, H); poseHat(byId.hat, now); posePhones(byId.phones, now); posePair(byId.pair, now);
    guides.forEach((g, i) => { g.pin = wasPin[i][0]; g.pinBeat = wasPin[i][1]; });
    cap.init = false;
    renderer.setScissorTest(true);
    lightsOn();
    for (const g of guides) {
      keyAt(g.rx);
      renderer.setViewport(0, 0, W, H);
      renderer.setScissor(0, 0, 1, 1);
      renderer.clear(false, true, false);
      renderer.render(scene, g.cam);
    }
    lightsOff();
    G.card('cap', { mode: 'hand', holder: 'cap', side: 'R' });
  }

  // ---- api ------------------------------------------------------------------------------------------------------------------
  const api = {
    seek(id, t, which) {
      const g = byId[id];
      if (!g) return false;
      if (t === null || t === undefined || !Number.isFinite(Number(t))) { g.pin = null; g.pinBeat = null; if (id === 'cap') cap.init = false; return true; }
      const names = Object.keys(g.b);
      let name = names[0] || null;
      if (id === 'phones' && which === 'story') name = 'story';
      if (id === 'pair' && (which === 2 || which === '2' || which === 'wave')) name = 'wave';
      g.pin = Number(t); g.pinBeat = name;
      return true;
    },
    freeze(t) { frozen = t === null || t === undefined || !Number.isFinite(Number(t)) ? null : Number(t); },
    // probes only: the viewport css px of a head point of figure fid as its slot's camera last drew it. part 'top': the
    // head top's centre; 'chin': the head's front face below the screen (agents), the lower face (Lim); a number: the
    // point at that world height on the head's front face (agents: the screen plane).
    debug: {
      head(fid, part) {
        const id = IDS.find((k) => FIGS[k].indexOf(fid) >= 0), g = id && byId[id], a = figAt[fid];
        if (!g || !a || !g.r.width) return null;
        const human = fid === 'Lim';
        const top = human ? HEAD_TOP_H : HEAD_TOP_A;
        let x = a.x, y = top - 0.015, z = a.z;
        if (part === 'chin' || typeof part === 'number') {
          const fz = human ? 0.16 : 0.141;
          x += Math.sin(a.yaw) * fz; z += Math.cos(a.yaw) * fz;
          y = typeof part === 'number' ? part : human ? 0.72 : 0.40;
        }
        V3.set(x, y, z).project(g.cam);
        return { x: cLeft + g.r.left + (V3.x * 0.5 + 0.5) * g.r.width, y: cTop + g.r.top + (0.5 - V3.y * 0.5) * g.r.height,
          k: g.k, shape: g.shape };
      },
    },
    state() {
      const now = nowS(), out = {};
      for (const g of guides) {
        let cur = null, ct = null;
        for (const name of Object.keys(g.b)) {
          const tb = tOf(g, name, now);
          if (tb >= 0 && tb < g.b[name].end) { cur = name; ct = tb; }
        }
        const played = {};
        for (const name of Object.keys(g.b)) played[name] = g.b[name].played;
        out[g.id] = { armed: g.armed, drawn: g.drawn, shape: g.shape, beat: cur, played, t: ct,
          uS: g.id === 'cap' ? cap.uS : null, card: g.id === 'cap' ? cap.card : null, vis: g.vis,
          yaw: figAt[FIGS[g.id][FIGS[g.id].length - 1]] ? Math.round(figAt[FIGS[g.id][FIGS[g.id].length - 1]].yaw / DEG) : null };
      }
      return out;
    },
  };

  return { root: G.root, frame, warm, api };
}
