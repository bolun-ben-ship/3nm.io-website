// guide-page.js — the guides-only renderer for the subpages (case-studies.html, faq.html). FIX-PLAN-R7 §1 S3.
// STAGE owns this file. Loaded as <script type="module" src="js/guide-page.js">; it self-mounts when canvas#guides and
// at least one .guide[data-guide-fig] exist. No stage, no walls, no floor: one transparent full-viewport canvas, the
// seven guide figures (cast.js buildGuides), one room per slot (x = 1000 + 40·k), drawn through scissor/viewport passes
// into each slot's rect so the page's own three-bloom ground shows through.
//
// Slot contract (§0.3, PAGE writes it):
//   <div class="guide guide--aside|guide--strip" data-guide="<unique id>" data-guide-fig="<fig>[,<fig>]"
//        data-guide-beat="count|ask|greet" data-guide-trigger="<selector>" [data-face-count="<text>"] aria-hidden="true">
//   A fig used twice on a page, an unknown fig or beat, or a missing trigger → html.no-guides and stop.
// Class hooks: html.guides-on (first draw); html.no-guides (no WebGL, ?noguides=1, any failure or contract error).
// html.rm is PAGE's and is not read here: reduced motion is computed locally (matchMedia or ?static=1).
//
// Beats (§S3.8): count (case studies; serialised: the face's live-text slot 8 is shared by every agent), ask (FAQ;
// reacts to a <details> opening), greet (the closing band; Lim hands the key, scarf waves). Every beat runs on
// performance.now() seconds; idle is breath / head bob / blinks only (no periodic nods or glances).
//
// Debug (window.__guidePage): ready (a Promise: the first draw, or a bail), state() → { [id]: { armed, drawn, beat,
// played, t } }, seek(id, t | null) pins one slot's beat time, freeze(t | null) pins the idle clock, programs().
// Every beat start and end dispatches CustomEvent('lens:beat', { detail: { id, beat, at } }) on document.
//
// TECH DEBT: aim(), lens() and the aside / strip branches of placeCam(), keyAt(), the yaw convention (YS / yawOf) and the
// P0 pose reset are COPIED from js/guides.js (createGuides, ~108-109, ~204, ~572-602, ~631). guides.js is not refactored
// this round; when it is, both files should import one shared camera module.
//
// Colour: THEMES (stage.js) is the only source. The one numeric literal is the transparent clear, 0x000000 at alpha 0.
import { LINE, DWELL, ease } from './proof-beats.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const clamp01 = (v) => clamp(v, 0, 1);
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp01((t - a) / (b - a));
const ez = (t, a, b) => ease(prog(t, a, b));
const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const nowS = () => performance.now() / 1000;
const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);

const FIG_IDS = ['bow', 'cap', 'hat', 'phones', 'scarf', 'beanie', 'Lim'];   // cast.js GUIDE_FIGS ids
const BEATS = ['count', 'ask', 'greet'];

// ---- rooms and cameras (copied from guides.js; see the header) ------------------------------------------------------------
const ROOM_X0 = 1000, ROOM_DX = 40;
const NEAR = 0.05, FAR = 30;
const ASIDE = { fov: 20, el: 8, az: -12, fh: 0.95, cy: 0.42 };   // guides.js ASIDE.phones, for every aside
const ASIDE_POOL_FIT = 0.9, ASIDE_MIN_W = 0.5;
const STRIP = { fov: 10, el: 12, az: 0 };
const K_DESK = 164, K_MOB = 108, K_SWITCH = 150;
const STRIP_REF_Y = 0.3, STRIP_FOOT_PX = 9;
const STRIP_X = { Lim: -0.32, scarf: 0.32 };

// ---- light and pools (guides.js §S2.6 values) ----------------------------------------------------------------------------
const HEMI_I = 0.55, KEY_I = 0.90, KEY_OFF = [-3, 4, 5];
const POOL_W = 1.1, POOL_D = 0.8, POOL_OP = 0.32, POOL_Y = 0.004;

// ---- beats ------------------------------------------------------------------------------------------------------------
const TURN_D = 0.3;
const LOOK_BODY = 35, LOOK_HEAD = 15, LOOK_PITCH = 15, LOOK_PITCH_K = 40;
// count
const C_REST = -15, C_TURN = 0.30, C_COUNT_D = 1.1, C_HOLD = 1.40, C_TEXT_END = 2.00, C_TICK_END = 2.90,
  C_BACK = 3.20, C_END = 3.50, C_NOD = 5, C_NOD_D = 0.35;
const C_SKIP = C_TEXT_END - C_TURN;     // no number to count: the tick follows the turn
// ask
const Q_REST_DESK = 20, Q_REST_MOB = -15, Q_FACE_ASK = 0.50, Q_FACE_HAPPY = 1.70, Q_RETRIG = 0.6, Q_SMOOTH = 0.3;
// greet
const G_REST_LIM = 15, G_REST_SCARF = -15, G_FACE_LIM = 50, G_FACE_SCARF = -50, G_END = 2.80,
  G_WAVE_A = 1.80, G_WAVE_B = 2.80, G_WAVE_EDGE = 0.15, G_WAVE = 150, G_WAVE_ROLL = 18, G_WAVE_N = 2, G_WAVE_OUT = 25;

const html = document.documentElement;
const qs = new URLSearchParams(location.search);
let readyRes = null;
const ready = new Promise((res) => { readyRes = res; });
const debug = {
  ready,
  state: () => ({}),
  seek: () => false,
  freeze: () => {},
  programs: () => 0,
};
window.__guidePage = debug;

function bail() {
  html.classList.add('no-guides');
  html.classList.remove('guides-on');
  if (readyRes) { readyRes(false); readyRes = null; }
}

// the slot contract, read and checked before three.js loads; null = a contract error
function readSlots() {
  const els = Array.from(document.querySelectorAll('.guide[data-guide-fig]'));
  const seenFig = new Set(), seenId = new Set(), out = [];
  for (const el of els) {
    const id = (el.dataset.guide || '').trim();
    const figs = (el.dataset.guideFig || '').split(',').map((s) => s.trim()).filter(Boolean);
    const beat = (el.dataset.guideBeat || '').trim();
    const sel = (el.dataset.guideTrigger || '').trim();
    if (!id || seenId.has(id) || !figs.length || BEATS.indexOf(beat) < 0 || !sel) return null;
    seenId.add(id);
    for (const f of figs) { if (FIG_IDS.indexOf(f) < 0 || seenFig.has(f)) return null; seenFig.add(f); }
    if (beat === 'greet') {
      if (figs.length !== 2 || figs.indexOf('Lim') < 0 || figs.indexOf('scarf') < 0) return null;
    } else if (figs.length !== 1 || figs[0] === 'Lim') return null;   // count / ask: one agent (a face to read)
    let trig = null;
    try { trig = document.querySelector(sel); } catch (e) { trig = null; }
    if (!trig) return null;
    const shape = el.classList.contains('guide--strip') ? 'strip' : el.classList.contains('guide--aside') ? 'aside'
      : beat === 'greet' ? 'strip' : 'aside';
    let count = null;
    const fc = el.dataset.faceCount;
    if (beat === 'count' && fc) {
      const m = /^(\D*)(\d+)(\D*)$/.exec(fc.trim());
      if (m) count = { pre: m[1], n: parseInt(m[2], 10), post: m[3], fit: m[1] + m[2] + m[3] };
    }
    out.push({ el, id, figs, beat, trig, shape, count });
  }
  return out;
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch (e) { return false; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot() {
  if (qs.get('noguides') === '1') return bail();
  const canvas = document.getElementById('guides');
  if (!canvas || canvas.tagName !== 'CANVAS') return bail();
  if (!document.querySelector('.guide[data-guide-fig]')) return bail();
  const slotsIn = readSlots();
  if (!slotsIn || !slotsIn.length) return bail();
  if (!hasWebGL()) return bail();
  const reduced = (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) || qs.get('static') === '1';

  const fontsP = (async () => {
    try {
      const fonts = ['500 32px "Geist Mono"', '400 32px "Geist Mono"', '600 64px "Instrument Sans"', '400 32px Geist', '500 32px Geist'];
      await Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))).catch(() => {}), sleep(2500)]);
    } catch (e) { /* no FontFaceSet: the glyphs draw with fallbacks */ }
  })();
  const [THREE, castMod, stageMod] = await Promise.all([import('three'), import('./cast.js'), import('./stage.js'), fontsP]);
  if (!castMod || typeof castMod.buildGuides !== 'function' || !stageMod || !stageMod.THEMES) throw new Error('guide-page: modules');
  if (Array.isArray(castMod.GUIDE_FIGS)) {
    const known = castMod.GUIDE_FIGS.map((d) => d.id);
    for (const s of slotsIn) for (const f of s.figs) if (known.indexOf(f) < 0) throw new Error('guide-page: fig');
  }
  mount(THREE, castMod, stageMod.THEMES, canvas, slotsIn, reduced);
}

function mount(THREE, castMod, THEMES, canvas, slotsIn, reduced) {
  const night = THEMES.night;

  // ---- renderer ---------------------------------------------------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  const sizeV = new THREE.Vector2();
  function resize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  resize();

  // ---- scene and light --------------------------------------------------------------------------------------------------
  const scene = new THREE.Scene();
  scene.fog = null;
  const hemi = new THREE.HemisphereLight(new THREE.Color(night.hemiSky), new THREE.Color(night.hemiGround), HEMI_I);
  hemi.layers.set(1);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(new THREE.Color(night.keyColor), KEY_I);
  key.layers.set(1);
  key.target.layers.set(1);
  scene.add(key);
  scene.add(key.target);
  // copied from guides.js keyAt
  function keyAt(rx) {
    key.position.set(rx + KEY_OFF[0], KEY_OFF[1], KEY_OFF[2]);
    key.target.position.set(rx, 0, 0);
    key.updateMatrixWorld();
    key.target.updateMatrixWorld();
  }

  // ---- figures ----------------------------------------------------------------------------------------------------------
  const G = castMod.buildGuides(scene, { THEMES, rimI: 0.65, renderer });
  if (!G || typeof G.pose !== 'function' || typeof G.card !== 'function' || typeof G.setFaceText !== 'function') throw new Error('guide-page: rig');
  G.hideAll();
  const F = G.FRAMES, ARM = G.ARM;
  const F_ASK = Number.isFinite(F.ask) ? F.ask : 9;
  // copied from guides.js (~108-109): + degrees turn toward +x (screen-right)
  const YS = Math.sin(G.YAW.plusX - G.YAW.lens) >= 0 ? 1 : -1;
  const yawOf = (d) => G.YAW.lens + YS * d * DEG;
  const CARD_IDS = Array.isArray(castMod.GUIDE_CARDS) ? castMod.GUIDE_CARDS.map((c) => c.id) : ['cap', 'hat', 'scarf', 'beanie'];

  // ---- pools: one per posed figure --------------------------------------------------------------------------------------
  // built like objects.js softTexture(128, 128, 2, 0, 1.7) (texPool): a white-RGB alpha mask, the colour comes from THEMES
  const poolTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(128, 128);
    const d = img.data, expo = 2, inner = 0, gamma = 1.7;
    for (let y = 0; y < 128; y++) {
      const ny = ((y + 0.5) / 128) * 2 - 1;
      for (let x = 0; x < 128; x++) {
        const nx = ((x + 0.5) / 128) * 2 - 1;
        const r = Math.pow(Math.pow(Math.abs(nx), expo) + Math.pow(Math.abs(ny), expo), 1 / expo);
        const a = Math.pow(1 - smooth(inner, 1, r), gamma);
        const i = (y * 128 + x) * 4;
        d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  })();
  const poolGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const poolColor = new THREE.Color(night.poolColor);
  const pools = {};

  // ---- slots -----------------------------------------------------------------------------------------------------------
  const slots = slotsIn.map((s, k) => {
    const cam = new THREE.PerspectiveCamera(20, 1, NEAR, FAR);
    cam.layers.set(1);
    const g = {
      ...s, k, rx: ROOM_X0 + ROOM_DX * k, cam,
      armed: false, drawn: false, vis: 0, poolS: 1, kpx: K_DESK,
      r: { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 },
      held: -1, start: -1, played: false, ended: false, pin: null,
      // ask: the look target and its smoothed angles; rel = the release (turn back) start, s
      tgt: null, rel: -1, look: { body: 0, head: 0, pitch: 0, init: false }, lastT: -1,
      // ask: the look weight (0 rest .. 1 looking): at the last pose, at a restart and at the release's start
      wLast: 0, w0: 0, wRel: 1,
    };
    for (const fid of g.figs) {
      const m = new THREE.MeshBasicMaterial({ map: poolTex, color: poolColor, transparent: true, opacity: POOL_OP,
        depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
      const p = new THREE.Mesh(poolGeo, m);
      p.name = 'guide-page-pool-' + fid;
      p.layers.set(1);
      p.renderOrder = -5;
      p.position.set(g.rx, POOL_Y, 0);
      p.scale.set(POOL_W, 1, POOL_D);
      scene.add(p);
      pools[fid] = p;
    }
    return g;
  });
  const byId = {};
  for (const g of slots) byId[g.id] = g;
  const counts = slots.filter((g) => g.beat === 'count');

  // ---- clocks -----------------------------------------------------------------------------------------------------------
  let frozen = null;
  const idleT = (now) => (reduced ? null : frozen !== null ? frozen : now);
  const deskMQ = typeof matchMedia === 'function' ? matchMedia('(min-width: 900px) and (min-aspect-ratio: 1/1)') : null;

  // ---- pose scratch (the guides.js P0 reset, per figure) -----------------------------------------------------------------
  const P = {};
  function P0(x, yawD) {
    P.x = x; P.z = 0; P.yaw = yawOf(yawD); P.lean = 0; P.walkPhase = 0; P.walkK = 0; P.headYaw = 0; P.headPitch = 0;
    P.armL = null; P.armR = null; P.armLRoll = 0; P.armRRoll = 0; P.frame = F.open; P.rim = 1; P.vis = 1; P.t = null;
    return P;
  }
  let poolS = 1;
  const lastPose = {};   // per fig: the last pose's body yaw, head yaw and head pitch, degrees from the lens (probes)
  function put(fid) {
    G.pose(fid, P);
    const lp = lastPose[fid] || (lastPose[fid] = { yaw: 0, head: 0, pitch: 0, frame: 0 });
    lp.yaw = (P.yaw - G.YAW.lens) / DEG * YS; lp.head = P.headYaw / DEG * YS; lp.pitch = P.headPitch / DEG; lp.frame = P.frame;
    const p = pools[fid];
    if (p) { p.position.x = P.x; p.position.z = P.z; p.scale.set(POOL_W * poolS, 1, POOL_D * poolS); }
  }
  function dispatch(id, name, phase) {
    document.dispatchEvent(new CustomEvent('lens:beat', { detail: { id, beat: name, at: performance.now(), phase } }));
  }

  // ---- cameras (copied from guides.js ~572-602) -----------------------------------------------------------------------------
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
      const A = ASIDE;
      lens(cam, A.fov, aspect);
      const fh = Math.max(A.fh, ASIDE_MIN_W / aspect), cy = A.cy - (fh - A.fh) * 0.25;
      g.poolS = Math.min(1, ASIDE_POOL_FIT * fh * aspect / POOL_W);
      // STAGE-MGR R7: the lens sits on the side the figure faces at rest. ASIDE.az (-12) suits a figure that rests toward
      // screen-left (count, mobile asker). The desktop asker rests at +20 and looks right (+50 at full look): with the lens
      // on the left its screen went edge-on and "^ ^" was unreadable, so the azimuth mirrors for a right-facing rest.
      const restR = g.beat === 'ask' && deskMQ && deskMQ.matches ? Q_REST_DESK > 0 : false;
      aim(cam, g.rx, cy, 0, fh / (2 * Math.tan(A.fov * DEG / 2)), A.el, restR ? -A.az : A.az);
    } else {
      g.poolS = 1;
      const k = g.kpx, el = STRIP.el * DEG;
      lens(cam, STRIP.fov, aspect);
      const yc = (h / 2 - STRIP_FOOT_PX) / (k * Math.cos(el));
      const Dstar = h / (2 * k * Math.tan(STRIP.fov * DEG / 2));
      aim(cam, g.rx, yc, 0, Dstar + (STRIP_REF_Y - yc) * Math.sin(el), STRIP.el, STRIP.az);
    }
  }

  // ---- measuring ----------------------------------------------------------------------------------------------------------
  let W = 1, H = 1, sx = 1, sy = 1, cLeft = 0, cTop = 0, vh = window.innerHeight || 1;
  function frameMetrics() {
    renderer.getSize(sizeV);
    W = sizeV.x; H = sizeV.y;
    const cr = canvas.getBoundingClientRect();
    cLeft = cr.left; cTop = cr.top;
    sx = cr.width > 0 ? W / cr.width : 1;
    sy = cr.height > 0 ? H / cr.height : 1;
    vh = window.innerHeight || H;
  }
  function measure(g) {
    const q = g.el.getBoundingClientRect(), r = g.r;
    r.left = (q.left - cLeft) * sx; r.top = (q.top - cTop) * sy; r.width = q.width * sx; r.height = q.height * sy;
    r.right = r.left + r.width; r.bottom = r.top + r.height;
    const x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, r.top), y1 = Math.min(H, r.bottom);
    g.drawn = r.width > 1 && r.height > 1 && x1 > x0 && y1 > y0;
    const v0 = Math.max(0, q.top), v1 = Math.min(vh, q.bottom);
    g.vis = q.height > 0 ? clamp01((v1 - v0) / q.height) : 0;
    g.kpx = q.height >= K_SWITCH ? K_DESK : K_MOB;
    g.cx = q.left + q.width / 2; g.cy = q.top + q.height / 2; g.qw = q.width;
  }
  // the look angles from the slot centre toward an element's centre (css px), degrees
  function lookAt(g, el, out) {
    const q = el.getBoundingClientRect();
    const dx = q.left + q.width / 2 - g.cx, dy = q.top + q.height / 2 - g.cy;
    out.body = Math.abs(dx) > g.qw / 2 ? sign(dx) * LOOK_BODY : 0;
    out.head = sign(dx) * LOOK_HEAD;
    out.pitch = clamp(-dy / vh * LOOK_PITCH_K, -LOOK_PITCH, LOOK_PITCH);
    return out;
  }
  const inView = (el) => { const q = el.getBoundingClientRect(); return q.bottom > 0 && q.top < vh && q.height > 0; };

  // ---- gates and beat starts -------------------------------------------------------------------------------------------------
  function gate(g, now) {
    if (g.played || g.start >= 0) return false;
    let open = false;
    if (g.armed) open = g.trig.getBoundingClientRect().top <= LINE * vh && g.vis >= 0.5;
    if (!open) { g.held = -1; return false; }
    if (g.held < 0) g.held = now;
    return now - g.held >= DWELL;
  }
  function startBeat(g, now) {
    g.start = now; g.played = true; g.ended = false; g.held = -1;
    dispatch(g.id, g.beat, 'start');
    // the end event must not wait for the loop: a reader who scrolls on disarms the slot and stops the rAF
    if (g.beat !== 'ask') setTimeout(sweepEnds, Math.ceil((g.beat === 'count' ? cEnd(g) : G_END) * 1000) + 20);
  }
  function sweepEnds() {
    if (failed) return;
    const now = nowS();
    for (const g of slots) {
      if (g.pin !== null || g.start < 0 || g.ended || g.beat === 'ask') continue;
      if (now - g.start >= (g.beat === 'count' ? cEnd(g) : G_END)) endBeat(g);
    }
  }
  function endBeat(g) {
    if (g.ended) return;
    g.ended = true;
    dispatch(g.id, g.beat, 'end');
  }
  const cEnd = (g) => (g.count ? C_END : C_END - C_SKIP);
  // a count's text window is [C_TURN, C_TEXT_END); one that has started but not passed it holds the face's text slot
  function textBusy(except, now) {
    for (const g of counts) {
      if (g === except || !g.count || g.start < 0 || g.pin !== null) continue;
      if (now - g.start < C_TEXT_END) return true;
    }
    return false;
  }
  function logic(now) {
    if (reduced) return;
    for (const g of slots) {
      if (g.pin !== null) continue;
      if (g.beat === 'count') {
        if (g.start < 0 && !g.played) {
          // a count waits while another count holds the face text; the gate keeps being checked, and it starts once the
          // other's window has closed if (and only if) its own gate still holds
          if (g.count && textBusy(g, now)) {
            const open = g.armed && g.trig.getBoundingClientRect().top <= LINE * vh && g.vis >= 0.5;
            if (!open) g.held = -1; else if (g.held < 0) g.held = now;
          } else if (gate(g, now)) startBeat(g, now);
        }
        if (g.start >= 0 && !g.ended && now - g.start >= cEnd(g)) endBeat(g);
      } else if (g.beat === 'greet') {
        if (gate(g, now)) startBeat(g, now);
        if (g.start >= 0 && !g.ended && now - g.start >= G_END) endBeat(g);
      } else if (g.beat === 'ask') {
        if (g.start >= 0 && !g.ended) {
          const det = g.tgt && g.tgt.det;
          const keep = det && det.open && inView(g.tgt.sum);
          if (!keep && g.rel < 0) { g.rel = now; g.wRel = g.wLast; }
          if (g.rel >= 0 && now - g.rel >= TURN_D) { endBeat(g); g.start = -1; g.rel = -1; g.tgt = null; g.look.init = false; g.w0 = 0; g.wLast = 0; }
        }
      }
    }
  }

  // ask: a <details> opened inside the trigger container (toggle does not bubble: capture)
  const asks = slots.filter((g) => g.beat === 'ask');
  if (asks.length && !reduced) {
    document.addEventListener('toggle', (e) => {
      const det = e.target;
      if (!det || det.tagName !== 'DETAILS' || !det.open) return;
      const sum = det.querySelector('summary') || det;
      const now = nowS();
      for (const g of asks) {
        if (!g.trig.contains(det) || g.pin !== null) continue;
        if (g.armed) { frameMetrics(); measure(g); }
        if (!g.armed || g.vis < 0.5) continue;
        const restart = g.start < 0 || now - g.start >= Q_RETRIG;
        g.tgt = { det, sum };
        g.rel = -1;
        if (restart) {
          // a restart while still looking keeps the head where it is (the look re-aims through the smoothing) and
          // turns on from the current weight, so the figure never dips back toward rest between two questions
          const live = g.start >= 0 && !g.ended;
          if (live) endBeat(g); else g.look.init = false;
          g.w0 = live ? g.wLast : 0;
          startBeat(g, now);
        }
      }
      kick();
    }, true);
  }

  // ---- poses --------------------------------------------------------------------------------------------------------------
  const LK = { body: 0, head: 0, pitch: 0 };
  // the beat time of g: the pin, else the live clock; −1 = not started; Infinity = reduced (the final pose)
  function tOf(g, now) {
    if (reduced) return Infinity;
    if (g.pin !== null) return g.pin;
    return g.start >= 0 ? now - g.start : -1;
  }
  let faceShown = null;
  function faceText(s, fit) {
    const k = s + '\u0000' + fit;
    if (k !== faceShown) { faceShown = k; G.setFaceText(s, fit); }
  }

  function poseCount(g, now) {
    const fid = g.figs[0], it = idleT(now);
    let tb = tOf(g, now);
    let yawD = C_REST, headYaw = 0, pitch = 0, frame = F.open;
    if (tb === Infinity) frame = F.tick;
    else if (tb >= 0) {
      if (!g.count && tb >= C_TURN) tb += C_SKIP;        // nothing to count: the tick follows the turn
      if (tb < C_END) {
        lookAt(g, g.trig, LK);
        const w = ez(tb, 0, C_TURN) - ez(tb, C_BACK, C_END);
        yawD = lerp(C_REST, LK.body, w);
        headYaw = LK.head * w;
        pitch = LK.pitch * w;
        if (tb >= C_TURN && tb < C_TEXT_END && g.count) {
          frame = F.count;
          const c = g.count;
          const n = Math.round(c.n * ease(clamp01((tb - C_TURN) / C_COUNT_D)));
          faceText(tb >= C_HOLD ? c.fit : c.pre + n + c.post, c.fit);
        } else if (tb >= C_TEXT_END && tb < C_TICK_END) {
          frame = F.tick;
          const a = C_TEXT_END;
          pitch -= C_NOD * (ez(tb, a, a + C_NOD_D) - ez(tb, a + C_NOD_D, a + 2 * C_NOD_D));
        } else if (tb >= C_TICK_END) frame = F.happy;
      }
    }
    P0(g.rx, yawD);
    P.headYaw = YS * headYaw * DEG; P.headPitch = pitch * DEG; P.frame = frame; P.t = it;
    put(fid);
  }

  function poseAsk(g, now, dt) {
    const fid = g.figs[0], it = idleT(now);
    const rest = deskMQ && deskMQ.matches ? Q_REST_DESK : Q_REST_MOB;
    const tb = tOf(g, now);
    let yawD = rest, headYaw = 0, pitch = 0, frame = F_ASK;
    if (tb >= 0 && tb !== Infinity) {
      // the target: the open details' summary (a pinned beat with none looks at the container's first summary)
      let sum = g.tgt && g.tgt.sum;
      if (!sum && g.pin !== null) sum = g.trig.querySelector('summary');
      if (sum) {
        lookAt(g, sum, LK);
        const L = g.look;
        if (!L.init || g.pin !== null) { L.body = LK.body; L.head = LK.head; L.pitch = LK.pitch; L.init = true; }
        else if (dt > 0) {
          const k = 1 - Math.exp(-dt / Q_SMOOTH);
          L.body += (LK.body - L.body) * k; L.head += (LK.head - L.head) * k; L.pitch += (LK.pitch - L.pitch) * k;
        }
        let w = g.pin !== null ? ez(tb, 0, TURN_D) : lerp(g.w0, 1, ez(tb, 0, TURN_D));
        if (g.rel >= 0 && g.pin === null) w = g.wRel * (1 - ez(now - g.rel, 0, TURN_D));
        if (g.pin === null) g.wLast = w;
        yawD = lerp(rest, L.body, w);
        headYaw = L.head * w;
        pitch = L.pitch * w;
      }
      frame = tb < Q_FACE_ASK ? F_ASK : tb < Q_FACE_HAPPY ? F.happy : F.open;
    }
    P0(g.rx, yawD);
    P.headYaw = YS * headYaw * DEG; P.headPitch = pitch * DEG; P.frame = frame; P.t = it;
    put(fid);
  }

  function poseGreet(g, now) {
    const it = idleT(now);
    let tb = tOf(g, now);
    if (tb === Infinity || tb >= G_END) tb = -1;          // reduced and after the beat: the rest pose
    const turn = tb >= 0 ? ez(tb, 0, 0.40) - ez(tb, 1.40, 1.80) : 0;
    const up = tb >= 0 ? ez(tb, 0.40, 0.80) - ez(tb, 1.20, 1.60) : 0;
    // Lim: the key card in the left hand, shown to scarf
    P0(g.rx + STRIP_X.Lim, lerp(G_REST_LIM, G_FACE_LIM, turn));
    P.armL = lerp(ARM.carryH, ARM.show, up); P.t = it;
    put('Lim');
    G.card('hat', { mode: up > 0.5 ? 'show' : 'hand', holder: 'Lim', side: 'L' });
    // scarf: happy at the card, then a wave with its outer (screen-right) arm
    let frame = F.open, arm = null, roll = 0;
    if (tb >= 0) {
      if ((tb >= 0.60 && tb < 1.60) || (tb >= 1.85 && tb < 2.75)) frame = F.happy;
      if (tb >= G_WAVE_A && tb < G_WAVE_B) {
        const env = ez(tb, G_WAVE_A, G_WAVE_A + G_WAVE_EDGE) - ez(tb, G_WAVE_B - G_WAVE_EDGE, G_WAVE_B);
        arm = lerp(ARM.down, G_WAVE * DEG, env);
        roll = (G_WAVE_OUT + G_WAVE_ROLL * Math.sin(TAU * G_WAVE_N * prog(tb, G_WAVE_A, G_WAVE_B))) * DEG * env;
      }
    }
    P0(g.rx + STRIP_X.scarf, lerp(G_REST_SCARF, G_FACE_SCARF, turn));
    P.armL = arm; P.armLRoll = roll; P.frame = frame; P.t = it;
    put('scarf');
  }

  function poseSlot(g, now, dt) {
    poolS = g.poolS;
    if (g.beat === 'count') poseCount(g, now);
    else if (g.beat === 'ask') poseAsk(g, now, dt);
    else poseGreet(g, now);
  }
  function hideCards() { for (const id of CARD_IDS) G.card(id, { mode: 'hidden' }); }

  // ---- the passes ---------------------------------------------------------------------------------------------------------
  // copied from guides.js draw(): the slot's viewport, the visible part as the scissor, a depth clear, the room's camera
  function draw(g) {
    const r = g.r;
    const x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, H - r.bottom), y1 = Math.min(H, H - r.top);
    if (x1 <= x0 || y1 <= y0) return;
    keyAt(g.rx);
    renderer.setViewport(r.left, H - r.bottom, r.width, r.height);
    renderer.setScissor(x0, y0, x1 - x0, y1 - y0);
    renderer.clear(false, true, false);
    renderer.render(scene, g.cam);
  }

  let started = false, lastNow = -1, dirty = true, failed = false;
  const perf = { n: 0, sum: 0, max: 0, samples: [] };
  // any throw in a frame: the guides go away for good (html.no-guides), the canvas is cleared, nothing is logged
  function frame() {
    if (failed) return;
    try { frameBody(); } catch (e) {
      failed = true;
      try { renderer.setScissorTest(false); renderer.clear(true, true, true); } catch (e2) { /* context gone */ }
      bail();
    }
  }
  function frameBody() {
    const t0 = performance.now();
    const now = t0 / 1000;
    const dt = lastNow < 0 ? 0 : clamp(now - lastNow, 0, 0.1);
    lastNow = now;
    frameMetrics();
    let any = false;
    for (const g of slots) {
      g.drawn = false;
      if (!g.armed) continue;
      measure(g);
      if (g.drawn) any = true;
    }
    logic(now);
    if (any || dirty) {
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, W, H);
      renderer.clear(true, true, true);
    }
    dirty = any;
    if (any) {
      hideCards();
      for (const g of slots) {
        if (!g.drawn) continue;
        placeCam(g);
        poseSlot(g, now, dt);
        g.lastT = tOf(g, now);
      }
      renderer.setScissorTest(true);
      for (const g of slots) if (g.drawn) draw(g);
      renderer.setScissorTest(false);
    }
    if (!started) {
      started = true;
      html.classList.add('guides-on');
      if (readyRes) { readyRes(true); readyRes = null; }
    }
    const ms = performance.now() - t0;
    perf.n++; perf.sum += ms; if (ms > perf.max) perf.max = ms;
    if (perf.samples.length < 600) perf.samples.push(ms); else perf.samples[perf.n % 600] = ms;
  }

  // ---- the loop: runs only while a slot is armed (and never under reduced motion) ------------------------------------------
  let raf = 0, oneShot = 0;
  const anyArmed = () => slots.some((g) => g.armed);
  const anyPinned = () => slots.some((g) => g.pin !== null);
  function loop() {
    raf = 0;
    if (failed) return;
    if (!anyArmed()) { if (dirty) frame(); return; }
    frame();
    raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (!booted) return;
    if (reduced) { if (!oneShot) oneShot = requestAnimationFrame(() => { oneShot = 0; frame(); }); return; }
    if (!raf && anyArmed()) raf = requestAnimationFrame(loop);
    else if (!raf && (dirty || anyPinned()) && !oneShot) oneShot = requestAnimationFrame(() => { oneShot = 0; frame(); });
  }

  let booted = false;
  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const g = slots.find((x) => x.el === e.target);
        if (g) g.armed = e.isIntersecting;
      }
      kick();
    }, { rootMargin: '100% 0px' });
    for (const g of slots) io.observe(g.el);
  } else {
    for (const g of slots) g.armed = true;
  }

  let rzT = 0;
  window.addEventListener('resize', () => {
    if (rzT) clearTimeout(rzT);
    rzT = setTimeout(() => { rzT = 0; resize(); dirty = true; kick(); }, 100);
    if (reduced) kick();
  }, { passive: true });
  if (reduced) window.addEventListener('scroll', kick, { passive: true });

  // ---- warm-up: every used room once through a 1 px scissor ------------------------------------------------------------------
  function warm() {
    frameMetrics();
    renderer.setScissorTest(true);
    hideCards();
    for (const g of slots) {
      g.r.left = 0; g.r.top = 0; g.r.width = g.shape === 'aside' ? 180 : 420; g.r.height = g.shape === 'aside' ? 220 : 170;
      g.r.right = g.r.width; g.r.bottom = g.r.height; g.kpx = K_DESK; g.qw = g.r.width; g.cx = 0; g.cy = 0;
      placeCam(g);
      const pin = g.pin;
      g.pin = g.beat === 'greet' ? 0.9 : g.beat === 'count' ? 1.0 : 1.0;   // a mid-beat pose: cards out, a face frame
      poseSlot(g, nowS(), 0);
      g.pin = pin;
      keyAt(g.rx);
      renderer.setViewport(0, 0, W, H);
      renderer.setScissor(0, 0, 1, 1);
      renderer.clear(false, true, false);
      renderer.render(scene, g.cam);
    }
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    renderer.clear(true, true, true);
    for (const g of slots) { g.r.width = 0; g.r.height = 0; }
    faceShown = null;
    for (const fid of Object.keys(pools)) { const p = pools[fid]; if (p) p.scale.set(POOL_W, 1, POOL_D); }
    G.hideAll();
    hideCards();
  }
  // the atlases: the glyph atlas bumps the face texture's version (paintGuideGlyphs → needsUpdate) and the card atlas
  // replaces the card material's map; both land from cast.js's own dynamic imports
  const faceMesh = (G.meshes || []).find((m) => m.name === 'guide-agentFace');
  const cardMesh = (G.meshes || []).find((m) => m.name === 'guide-cards');
  const face0 = faceMesh && faceMesh.material.map ? faceMesh.material.map.version : -1;
  const card0 = cardMesh ? cardMesh.material.map : null;
  const atlasesIn = () => (!faceMesh || !faceMesh.material.map || faceMesh.material.map.version > face0)
    && (!cardMesh || cardMesh.material.map !== card0);

  warm();
  (async () => {
    try {
      const t0 = performance.now();
      while (!atlasesIn() && performance.now() - t0 < 1500) await sleep(50);
      warm();
    } catch (e) { /* a failed re-warm only costs an upload mid-scroll */ }
    booted = true;
    frame();
    kick();
  })();

  // ---- debug api ------------------------------------------------------------------------------------------------------------
  debug.state = () => {
    const now = nowS(), out = {};
    for (const g of slots) {
      const tb = tOf(g, now);
      const end = g.beat === 'count' ? cEnd(g) : g.beat === 'greet' ? G_END : Infinity;
      const live = tb >= 0 && tb !== Infinity && tb < end && (g.beat !== 'ask' || g.start >= 0 || g.pin !== null);
      out[g.id] = { armed: g.armed, drawn: g.drawn, beat: live ? g.beat : null, played: g.played, t: live ? tb : null,
        vis: g.vis, figs: g.figs.slice(),
        pose: g.figs.map((f) => (lastPose[f] ? { fig: f, yaw: Math.round(lastPose[f].yaw * 10) / 10,
          head: Math.round(lastPose[f].head * 10) / 10, pitch: Math.round(lastPose[f].pitch * 10) / 10, frame: lastPose[f].frame } : null)) };
    }
    return out;
  };
  debug.seek = (id, t) => {
    const g = byId[id];
    if (!g) return false;
    g.pin = t === null || t === undefined || !Number.isFinite(Number(t)) ? null : Number(t);
    if (g.pin === null) g.look.init = false;
    dirty = true;
    kick();
    return true;
  };
  debug.freeze = (t) => {
    frozen = t === null || t === undefined || !Number.isFinite(Number(t)) ? null : Number(t);
    dirty = true;
    kick();
  };
  debug.programs = () => (renderer.info.programs ? renderer.info.programs.length : 0);
  debug.perf = () => {
    const s = perf.samples.slice().sort((a, b) => a - b);
    const q = (p) => (s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0);
    return { frames: perf.n, mean: perf.n ? perf.sum / perf.n : 0, p50: q(0.5), p99: q(0.99), max: perf.max };
  };
  debug.reduced = reduced;
}

boot().catch(() => bail());
