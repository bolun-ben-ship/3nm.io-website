// LENS — js/objects.js (walls, sole owner). REWORK-01: the panes are glass work-walls standing on the floor.
// Parts, one line each:
//   glass    — a thin RoundedBox pane, 3.4 x 2.1 x 0.03, bottom 0.55, top 2.65, centre y 1.60 (WALL)
//   frame    — a 0.018 hairline on the top and sides of the glass (no bottom: people stand there), two slim legs
//              behind the glass plane on small foot plates: one merged mesh per wall. It casts no shadow (FIX-PLAN-R3
//              S7.1: the day sun drew six frame outlines on the floor in the first frame)
//   glint    — a white specular edge on the sun side (top and left), inside the hairline, on the front face
//   face     — the canvas plane stage.js paints (map swapped per pass), 3.28 x 2.05, aspect 1.6
//   glow     — the additive night glow behind the face
//   pool     — the night light pool on the floor in front of each wall, where the people stand
//   caustic  — the day light patch thrown behind each wall, away from the sun
//   table    — the long shared table in front of wall 04 only (TABLE)
//   rail     — a flush matte floor channel down the row, as long as the thread (day only)
//   thread   — FIX-PLAN-R5 S3: the line of light along the floor (y = THREAD_Y, one hairline over the channel), a core
//              plus a flat additive floor ribbon (the halo); it runs from THREAD_PF in front of wall 01 to THREAD_PB past
//              wall 06, under each wall between its legs, and fades out over THREAD_END_F at both ends
//   well     — the day floor well: a faint soft darkening under the deck, so white clay separates from the floor
//   hero pool — FIX-PLAN-R2 S6: by day pool 0 turns into a faint g-100 pool under wall 01's pair (the staged
//              hand-over), normal-blended (an additive pool is invisible on the white day ground); gone by night.
//              FIX-PLAN-R3 S2.4: tight (HERO_POOL_W x HERO_POOL_D) and centred under Lim and courier-a (HERO_POOL_X/Z)
//   leg decal — FIX-PLAN-R2 m5: a soft contact patch under each foot, plus (FIX-PLAN-R3 S7.1) one faint glass shadow
//              band per wall .35 u behind the glass, all in ONE mesh (one draw call, day only)
// Walls never bob and never turn. The people are cast.js; stage.js wires both.
//
// Every colour arrives through THEMES (stage.js). This file holds no literal colours.
// Materials are created in their final form (transparent from birth, maps never null, clearcoat fixed) so a
// theme switch only ever writes cheap properties: colour.copy, opacity, emissiveIntensity, envMapIntensity,
// depthWrite. stage.programs() never changes between themes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WALL, TABLE, THREAD_Y, THREAD_PF, THREAD_PB, paneZ } from './timeline.js';

const N = 6;                       // walls

// wall (wall-local: origin on the floor under the wall centre, +z = the front, the people's side)
const GLASS_R = 0.008;
const HALF_W = WALL.W / 2;                          // 1.70, the glass edge
const EDGE_D = 0.034;                               // hairline depth (glass 0.03 + a hair)
const LEG_X = HALF_W + 0.009;                       // 1.709 (FIX-PLAN-R1 S4): with WALL.LEG .018 the inner face meets the glass edge
const LEG_Z = -0.02;                                // legs and feet stand behind the glass plane
const FOOT_H = 0.012, FOOT_D = 0.28;
const GLINT_W = 0.006, GLINT_IN = 0.012, GLINT_Z = 0.016;
const FACE_Z = 0.022, GLOW_Z = 0.006, GLOW_K = 1.18;

// floor light, wall-local
const POOL_W = 4.2, POOL_D = 2.6, POOL_DZ = 0.7;    // in front of the wall, under the people
const CAUSTIC_W = 3.3, CAUSTIC_D = 1.3, CAUSTIC_DX = 0.65, CAUSTIC_DZ = -0.75;   // sun from high front-left

// intro: each wall settles from +0.10 while it fades in, 90 ms stagger front to back
const INTRO_S = 1.6, SETTLE_S = 1.1, STAGGER_S = 0.09, SETTLE_DY = 0.10;
const DRAW_START = 0.4375;         // thread draw window inside introT: 0.4375 .. 1 (the last 0.9 s)

// thread / rail. Pads are asymmetric (FIX-PLAN-R1 S4): F = in front of wall 01, B = behind wall 06. The thread's
// pads come from timeline.js, whose paneFrac uses the same numbers, so a pane lights exactly when the head reaches it.
// FIX-PLAN-R5 S3: the halo is a flat ribbon on the floor (HALO_Y, under the core), THREAD_HALO_W wide (was .14, billboarded);
// the rail runs the thread's full length (was .4 / 3.0), so by day the line sits in the channel end to end.
const THREAD_R = 0.006, THREAD_HALO_W = 0.22, HALO_Y = 0.012;
const RAIL_PF = THREAD_PF, RAIL_PB = THREAD_PB;
const RAIL_W = 0.12, RAIL_H = 0.01;
const THREAD_END_F = 3.0;          // end fade length (world units), each end on its own (FIX-PLAN-R5 S3; was .7 / min(.7, PF))
// the day hold dimming: the line keeps 1 - THREAD_CLEAR_K of its intensity at a hold (FIX-PLAN-R5 S3; was .97)
const THREAD_CLEAR_K = 0.45;
// FIX-PLAN-R5 S3, the back cut (tour only). Through the long lens (fov 12) the floor far behind the held wall rises in the
// frame and shows through its glass: the line read as a diagonal stroke across the lower face at every hold (looked at,
// 1440 pos 3). The line now ends BACK_D behind the rearmost wall that is up, fading over BACK_F, weighted by the walls'
// transit (stage manager R5: it slides from the leaving wall to the arriving one, no presence weight) and by the tour window p BACK_P0 .. BACK_P3. Floor up to ~4.9 u behind the glass is seen UNDER the glass
// (bottom .55) at el 3, so the line still visibly passes under the wall between its legs. The deck (p >= 7.7) and the
// hero keep the whole line. Stage manager R5: mid-transit the cut slides one spacing back (objects update), never released.
const BACK_D = 0.5, BACK_F = 1.5, BACK_P0 = 1.3, BACK_P1 = 1.6, BACK_P2 = 7.4, BACK_P3 = 7.7;
const PULSE_PERIOD = 4;
// Near fade (tour only, weight = state.thread.near): the thread between the camera and the held wall is
// hidden, so nothing crosses the face at a hold. s = camZ - z; 0 below F0, 1 above F1.
const NEAR_F0 = 3.9, NEAR_F1 = 5.5;

// Face near the glass (FIX-PLAN-R3 S1.4, replaces the R1 S7 distance ramp). yTop = the face's projected top edge,
// FACE_TOP_IN under the glass top, css px: the highest of FACE_TOP_N points across the width that lie in front of the
// lens and inside the frame's x range (the plan's top-centre is the middle one; with a yawed hold camera a corner rides
// up to ~75 px higher). The top-centre behind the lens counts as yTop -inf (k = 0).
//   push term (the plan): k = smooth(navPx - FACE_NAV_A, navPx + FACE_NAV_B, yTop), weight state.cast.push.
//   guard term (DEVIATION, see BUILD notes): push is 0 for the first ~.4 of each departure (e.g. pos 2.05-2.45 at
//     1440), while the lens climbs toward the glass and the face top already slides under the nav at full alpha
//     (_dev/r6-navtext.mjs). kg = smooth(navPx, navPx + FACE_GUARD, yTop), weight = travel (0 at a hold, 1 within
//     .06 of pos off it, 2 <= pos < 7). FACE_GUARD = the S9 hold clearance (nav + 24), so a hold framed to the fit
//     rule is untouched, and kg is 0 at the nav: no visible face top is ever above it.
//   faceNear = min(lerp(1, k, push), lerp(1, kg, travel)). At holds (push 0, travel 0) faces are untouched.
// FACE_NEAR_MIN 0: nothing of a crossed face is left under the nav. navPx / viewH come from stage.js (opts), else
// NAV_PX / the window.
const FACE_NEAR_MIN = 0, FACE_TOP_IN = 0.03, FACE_NAV_A = 30, FACE_NAV_B = 60, NAV_PX = 64;
const FACE_GUARD = 24, FACE_TOP_N = 5, TRAVEL_E = 0.06;
// day floor well: ground quad (WELL_W x 5S + WELL_DPAD) centred under the deck
const WELL_W = 9, WELL_DPAD = 4, WELL_Y = 0.0015;
// hero pool (FIX-PLAN-R2 S6): pool 0's day term fades out over night .3 .. .8
const HERO_N0 = 0.3, HERO_N1 = 0.8;
// hero pool placement (FIX-PLAN-R3 S2.4), wall-local: centred between Lim (-1.10, .40) and courier-a (-.44, .40)
const HERO_POOL_X = -0.75, HERO_POOL_Z = 0.45, HERO_POOL_W = 2.2, HERO_POOL_D = 1.4;
// leg contact decals (FIX-PLAN-R2 m5): one soft patch per foot, DECAL_W (x) by DECAL_D (z), just above the floor
const DECAL_W = 0.26, DECAL_D = 0.18, DECAL_Y = 0.0025;
// glass shadow (FIX-PLAN-R3 S7.1): GSH_W x GSH_D, centred GSH_Z behind the glass, effective opacity GSH_O by day
const GSH_W = 3.3, GSH_D = 0.45, GSH_Z = -0.35, GSH_O = 0.07;

// theme keys that are colours
const COLOR_KEYS = ['glassColor', 'frameColor', 'frameEmissive', 'edgeColor', 'tableColor', 'railColor', 'threadCore',
  'threadHalo', 'poolColor', 'causticColor', 'glowColor', 'wellColor'];
// FIX-PLAN-R2 keys that THEMES (stage.js) may not carry yet: colour key -> fallback colour key, and its opacity key,
// which falls back to 0, so a theme without them draws exactly what it drew before
const OPT_KEYS = [
  ['heroPoolColor', 'poolColor', 'heroPoolOpacity'],
  ['legDecalColor', 'wellColor', 'legDecalOpacity'],
];

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);
const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };

function prepTheme(src) {
  const out = {};
  for (const k in src) out[k] = src[k];
  for (const k of COLOR_KEYS) out[k] = new THREE.Color(src[k]);
  for (const [k, fb, ok] of OPT_KEYS) {
    const has = src[k] !== undefined && src[k] !== null;
    out[k] = new THREE.Color(has ? src[k] : src[fb]);
    out[ok] = has && Number.isFinite(src[ok]) ? src[ok] : 0;
  }
  return out;
}

// soft alpha texture painted per pixel: superellipse distance, smooth falloff, white RGB
function softTexture(w, h, expo, inner, gamma) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const ny = ((y + 0.5) / h) * 2 - 1;
    for (let x = 0; x < w; x++) {
      const nx = ((x + 0.5) / w) * 2 - 1;
      const r = Math.pow(Math.pow(Math.abs(nx), expo) + Math.pow(Math.abs(ny), expo), 1 / expo);
      const a = Math.pow(1 - smooth(inner, 1, r), gamma);
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

// the decal atlas (FIX-PLAN-R3 S7.1): left half = the foot patch (texPool's profile, full alpha), right half = the
// glass-shadow band (a rounded rect) at alpha glassA. Per-quad alpha rides the UVs, so the decals keep the caustic's
// program: a vertex-colour alpha would add the vertexColors/vertexAlphas defines, a 23rd program.
function decalAtlas(glassA) {
  const w = 128, h = 128;
  const c = document.createElement('canvas');
  c.width = 2 * w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(2 * w, h);
  const d = img.data;
  for (let half = 0; half < 2; half++) {
    const expo = half ? 4 : 2, inner = half ? 0.2 : 0, gamma = half ? 1.2 : 1.7, amp = half ? glassA : 1;
    for (let y = 0; y < h; y++) {
      const ny = ((y + 0.5) / h) * 2 - 1;
      for (let x = 0; x < w; x++) {
        const nx = ((x + 0.5) / w) * 2 - 1;
        const r = Math.pow(Math.pow(Math.abs(nx), expo) + Math.pow(Math.abs(ny), expo), 1 / expo);
        const a = amp * Math.pow(1 - smooth(inner, 1, r), gamma);
        const i = (y * 2 * w + half * w + x) * 4;
        d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = Math.round(a * 255);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// a box placed by its centre
function boxAt(w, h, d, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

function mergeAndFree(parts) {
  const g = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return g;
}

export function buildObjects(scene, { THEMES, maskU, maskW }) {
  const TH = { day: prepTheme(THEMES.day), night: prepTheme(THEMES.night) };
  const root = new THREE.Group();
  root.name = 'lens-objects';
  scene.add(root);
  const env = scene.environment || null;

  // ---- per-frame stored inputs (applyTheme reads these) ---------------------------------------
  const pres = new Float32Array(N).fill(1);
  const brt = new Float32Array(N).fill(1);
  const fade = new Float32Array(N).fill(1);
  const flare = new Float32Array(N);
  const faceA = new Float32Array(N).fill(1);      // state.panes[i].faceA (FIX-PLAN-R1 S9)
  const faceNear = new Float32Array(N).fill(1);   // camera-near dim (FIX-PLAN-R1 S7)
  const poolVis = new Array(N).fill(true);         // wall visible (update); the theme decides the rest
  const poolZ = new Float32Array(N);               // each wall's z (update): applyTheme places pool 0 per theme
  const topV = new THREE.Vector3();                // S1.4 projection scratch (no allocation per frame)
  let thrIntensity = 1;
  let nightK = 0;                                  // state.night, clamped (hero pool)

  // ---- shared geometry and textures -------------------------------------------------------------
  const glassGeo = new RoundedBoxGeometry(WALL.W, WALL.H, WALL.T, 2, GLASS_R);
  glassGeo.translate(0, WALL.YC, 0);

  // frame + legs + feet: one merged geometry shared by every wall
  const E = WALL.EDGE, e2 = E / 2;
  // FIX-PLAN-R1 S4: no bottom hairline (people stand there); the side hairlines run from the glass bottom to the top one
  const structGeo = mergeAndFree([
    boxAt(WALL.W, E, EDGE_D, 0, WALL.Y1 - e2, 0),                          // top hairline
    boxAt(E, WALL.H - E, EDGE_D, -(HALF_W - e2), WALL.Y0 + (WALL.H - E) / 2, 0),   // left hairline
    boxAt(E, WALL.H - E, EDGE_D, HALF_W - e2, WALL.Y0 + (WALL.H - E) / 2, 0),      // right hairline
    boxAt(WALL.LEG, WALL.Y1, WALL.LEG, -LEG_X, WALL.Y1 / 2, LEG_Z),        // left leg, floor to top, behind the glass
    boxAt(WALL.LEG, WALL.Y1, WALL.LEG, LEG_X, WALL.Y1 / 2, LEG_Z),         // right leg
    boxAt(WALL.LEG, FOOT_H, FOOT_D, -LEG_X, FOOT_H / 2, LEG_Z),            // left foot plate
    boxAt(WALL.LEG, FOOT_H, FOOT_D, LEG_X, FOOT_H / 2, LEG_Z),             // right foot plate
  ]);

  // glint: top and left edges, set GLINT_IN inside the hairline's inner edge
  const gx = HALF_W - E - GLINT_IN - GLINT_W / 2;      // 1.667
  const gyT = WALL.Y1 - E - GLINT_IN - GLINT_W / 2;    // 2.617
  const gyB = WALL.Y0 + E + GLINT_IN + GLINT_W / 2;    // 0.583
  const glintTop = new THREE.PlaneGeometry(2 * gx, GLINT_W);
  glintTop.translate(0, gyT, GLINT_Z);
  const glintLeft = new THREE.PlaneGeometry(GLINT_W, gyT - gyB);
  glintLeft.translate(-gx, (gyT + gyB) / 2, GLINT_Z);
  const glintGeo = mergeAndFree([glintTop, glintLeft]);

  const faceGeo = new THREE.PlaneGeometry(WALL.FACE_W, WALL.FACE_H);
  faceGeo.translate(0, WALL.YC, FACE_Z);
  const glowGeo = new THREE.PlaneGeometry(WALL.FACE_W * GLOW_K, WALL.FACE_H * GLOW_K);
  glowGeo.translate(0, WALL.YC, GLOW_Z);
  const groundGeo = new THREE.PlaneGeometry(1, 1); groundGeo.rotateX(-Math.PI / 2);   // unit quad lying on y = 0

  const texGlow = softTexture(128, 128, 2.6, 0.0, 1.5);     // wall-shaped soft glow
  const texPool = softTexture(128, 128, 2, 0.0, 1.7);       // radial light pool
  const texCaustic = softTexture(256, 128, 4, 0.25, 1.0);   // soft rounded-rect light patch
  // leg contact decals: one quad per foot, 2 per wall, then GSH_L glass-shadow quads per wall (FIX-PLAN-R3 S7.1), all
  // in one geometry. Per-wall meshes cost 6 draw calls and pos 0 had room for 5 (budget 70), so update() rewrites the
  // corners in place when the spacing or a wall's visibility changes (never per frame otherwise).
  // Per-quad alpha: foot quads map the atlas's left half (alpha 1), glass quads its right half (alpha GSH_A). The
  // atlas caps alpha at 1 and THEMES day legDecalOpacity (.05) is under GSH_O (.07), so the band is GSH_L coincident
  // quads whose stacked alpha is exactly GSH_O: 1 - (1 - legDecalOpacity * GSH_A)^GSH_L = GSH_O.
  const decO = TH.day.legDecalOpacity;
  const GSH_L = decO > 0 ? Math.max(1, Math.ceil(Math.log(1 - GSH_O) / Math.log(1 - Math.min(decO, 0.999)))) : 1;
  const GSH_A = decO > 0 ? Math.min(1, (1 - Math.pow(1 - GSH_O, 1 / GSH_L)) / decO) : 0;
  const texDecal = decalAtlas(GSH_A);
  const Q_FOOT = 2 * N, Q_ALL = 2 * N + GSH_L * N;  // quads: feet first, then the glass bands
  const decalParts = [];
  for (let k = 0; k < Q_ALL; k++) {
    const q = new THREE.PlaneGeometry(1, 1); q.rotateX(-Math.PI / 2);
    const uv = q.attributes.uv, u0 = k < Q_FOOT ? 0 : 0.5;
    for (let v = 0; v < 4; v++) uv.setX(v, u0 + 0.5 * uv.getX(v));
    decalParts.push(q);
  }
  const decalGeo = mergeAndFree(decalParts);
  const decalPos = decalGeo.attributes.position;
  decalPos.setUsage(THREE.DynamicDrawUsage);
  const decalCorner = new Float32Array(8);         // the unit template quad's 4 corners, (x, z) about its centre
  for (let v = 0; v < 4; v++) { decalCorner[2 * v] = decalPos.getX(v); decalCorner[2 * v + 1] = decalPos.getZ(v); }
  const decalZ = new Float32Array(N).fill(NaN);    // the z each wall's quads were last written at (NaN: collapsed)

  const texFacePlaceholder = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
  texFacePlaceholder.colorSpace = THREE.SRGBColorSpace;
  texFacePlaceholder.needsUpdate = true;

  // ---- walls -------------------------------------------------------------------------------------
  const panes = [];
  const pools = [], caustics = [];
  const base = (i) => 10 * (5 - i);

  for (let i = 0; i < N; i++) {
    const group = new THREE.Group();
    group.name = 'wall-' + (i + 1);

    const glassMat = new THREE.MeshPhysicalMaterial({
      transparent: true, depthWrite: false, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05,
      color: TH.day.glassColor, opacity: TH.day.glassOpacity,
    });
    // material.envMap wins over scene.environmentIntensity, so envMapIntensity works per theme;
    // stage.js sets scene.environment before buildObjects and never nulls it, so the map is never null
    if (env) glassMat.envMap = env;
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.name = 'glass';
    glass.castShadow = false;
    glass.renderOrder = base(i) + 1;
    group.add(glass);

    const frameMat = new THREE.MeshStandardMaterial({
      color: TH.day.frameColor, metalness: 0.18, roughness: 0.28, emissive: TH.day.frameEmissive,
      emissiveIntensity: 0, transparent: true,
    });
    const frame = new THREE.Mesh(structGeo, frameMat);
    frame.name = 'structure';
    frame.castShadow = false;       // FIX-PLAN-R3 S7.1 (M4): no frame outlines on the floor; the decals ground it
    frame.renderOrder = base(i);
    group.add(frame);

    const glowMat = new THREE.MeshBasicMaterial({
      map: texGlow, color: TH.night.glowColor, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.name = 'glow';
    glow.renderOrder = base(i) + 2;
    group.add(glow);

    const faceMat = new THREE.MeshBasicMaterial({
      map: texFacePlaceholder, transparent: true, depthWrite: false, toneMapped: false,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.name = 'face';
    faceMesh.renderOrder = base(i) + 3;
    group.add(faceMesh);

    const edgeMat = new THREE.MeshBasicMaterial({
      color: TH.day.edgeColor, transparent: true, opacity: 0, depthWrite: false, toneMapped: false,
    });
    const edgeMesh = new THREE.Mesh(glintGeo, edgeMat);
    edgeMesh.name = 'glint';
    edgeMesh.renderOrder = base(i) + 4;
    group.add(edgeMesh);

    root.add(group);

    // night light pool, on the floor where the people stand
    const poolMat = new THREE.MeshBasicMaterial({
      map: texPool, color: TH.night.poolColor, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
    });
    const pool = new THREE.Mesh(groundGeo, poolMat);
    pool.name = 'pool-' + (i + 1);
    pool.scale.set(POOL_W, 1, POOL_D);
    pool.position.y = 0.003;
    pool.renderOrder = -5;
    root.add(pool);
    pools.push(pool);

    // day caustic patch
    const causticMat = new THREE.MeshBasicMaterial({
      map: texCaustic, color: TH.day.causticColor, transparent: true, opacity: 0, depthWrite: false,
    });
    const caustic = new THREE.Mesh(groundGeo, causticMat);
    caustic.name = 'caustic-' + (i + 1);
    caustic.scale.set(CAUSTIC_W, 1, CAUSTIC_D);
    caustic.position.y = 0.002;
    caustic.renderOrder = -5;
    root.add(caustic);
    caustics.push(caustic);

    panes.push({ group, faceMesh, glassMat, frameMat, glowMesh: glow, edgeMesh });
  }

  // ---- day floor well (FIX-PLAN-R1 S4): the caustic's material form (map, transparent, normal blending), so it
  // shares that program; colour and opacity from THEMES wellColor / wellOpacity
  const wellMat = new THREE.MeshBasicMaterial({
    map: texPool, color: TH.day.wellColor, transparent: true, opacity: 0, depthWrite: false,
  });
  const well = new THREE.Mesh(groundGeo, wellMat);
  well.name = 'well';
  well.renderOrder = -6;
  well.frustumCulled = false;
  root.add(well);
  let wellFade = 1;

  // ---- leg contact decals (FIX-PLAN-R2 m5): the caustic's material form (map, transparent, normal blending, fog), so
  // they share that program; colour and opacity from THEMES legDecalColor / legDecalOpacity
  const decalMat = new THREE.MeshBasicMaterial({
    map: texDecal, color: TH.day.legDecalColor, transparent: true, opacity: 0, depthWrite: false,
  });
  const decals = new THREE.Mesh(decalGeo, decalMat);
  decals.name = 'leg-decals';
  decals.renderOrder = -4;                         // after the pools and caustics (-5), so the hero pool never washes them out
  decals.frustumCulled = false;
  decals.visible = false;
  root.add(decals);

  // write one quad (index q) centred at (x, z), w by d, or collapse it to one point
  function writeQuad(q, x, z, w, d, vis) {
    const o = q * 4;
    for (let v = 0; v < 4; v++) {
      if (vis) decalPos.setXYZ(o + v, x + w * decalCorner[2 * v], DECAL_Y, z + d * decalCorner[2 * v + 1]);
      else decalPos.setXYZ(o + v, 0, -1, 0);
    }
  }
  // wall i's two foot quads and its glass-shadow band at z (or collapsed when the wall is hidden)
  function writeDecal(i, z, vis) {
    writeQuad(2 * i, -LEG_X, z + LEG_Z, DECAL_W, DECAL_D, vis);
    writeQuad(2 * i + 1, LEG_X, z + LEG_Z, DECAL_W, DECAL_D, vis);
    for (let l = 0; l < GSH_L; l++) writeQuad(Q_FOOT + i * GSH_L + l, 0, z + GSH_Z, GSH_W, GSH_D, vis);
  }
  for (let i = 0; i < N; i++) writeDecal(i, 0, false);   // every quad starts collapsed (decalZ NaN)

  // ---- the shared table (wall 04 only) -------------------------------------------------------------
  const tlx = TABLE.w / 2 - 0.08, tlz = TABLE.d / 2 - 0.08;   // legs 0.08 in from the corners: x 1.27, z 0.27
  const legH = TABLE.top - TABLE.t;                            // 0.37
  const tableGeo = mergeAndFree([
    boxAt(TABLE.w, TABLE.t, TABLE.d, 0, TABLE.top - TABLE.t / 2, 0),
    boxAt(TABLE.leg, legH, TABLE.leg, -tlx, legH / 2, -tlz),
    boxAt(TABLE.leg, legH, TABLE.leg, tlx, legH / 2, -tlz),
    boxAt(TABLE.leg, legH, TABLE.leg, -tlx, legH / 2, tlz),
    boxAt(TABLE.leg, legH, TABLE.leg, tlx, legH / 2, tlz),
  ]);
  const tableMat = new THREE.MeshStandardMaterial({
    color: TH.day.tableColor, roughness: 0.85, metalness: 0, transparent: true,
  });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.name = 'table';
  table.castShadow = true;
  table.receiveShadow = true;
  table.renderOrder = base(TABLE.wall);
  root.add(table);

  // ---- rail: a flush floor channel ------------------------------------------------------------------
  const railGeo = new THREE.BoxGeometry(RAIL_W, RAIL_H, 1);
  // matte inset: at metalness .6 the day env turned a light rail into a saturated mint stripe (SM review);
  // FIX-PLAN-R1 S4: fully matte, so at night it never reads as a lit runway
  // It writes no depth, so the floor light drawn after it (day caustics, shadows) lies across the channel exactly as
  // it lies on the floor. It is drawn only where THEMES railOn is 1 (day): see stage.js THEMES night.
  const railMat = new THREE.MeshStandardMaterial({ color: TH.day.railColor, metalness: 0, roughness: 0.95, depthWrite: false });
  const rail = new THREE.Mesh(railGeo, railMat);
  rail.name = 'rail';
  rail.position.y = RAIL_H / 2;
  rail.castShadow = false;
  rail.receiveShadow = true;
  rail.frustumCulled = false;
  root.add(rail);

  // ---- thread of light -----------------------------------------------------------------------------
  // f = fraction along the thread from the front (0) to the back (1). One shared uniform set drives
  // the core and the halo. brightness = (f <= head ? 1 : base), zero beyond the intro draw.
  // FIX-PLAN-R5 S3 hero guard: uMaskX / uMaskOn / uMaskPR are stage.js's trace-mask uniforms, shared BY REFERENCE, so the
  // thread fades under the hero copy column exactly as the ground traces do. Without them (an older stage) the mask is off.
  const mU = maskU && maskU.uMaskX && maskU.uMaskOn && maskU.uMaskPR ? maskU
    : { uMaskX: { value: 0 }, uMaskOn: { value: 0 }, uMaskPR: { value: 1 } };
  const MASK_W = Number.isFinite(maskW) && maskW > 0 ? maskW : 0;
  const tu = {
    uHead: { value: 1.1 }, uDraw: { value: 1.1 }, uBase: { value: 0.4 },
    uIntensity: { value: 1 }, uPulse: { value: -1 }, uLen: { value: 15 },
    uCamZ: { value: 10 }, uNear: { value: 0 }, uEndF: { value: THREAD_END_F },
    uMaskX: mU.uMaskX, uMaskOn: mU.uMaskOn, uMaskPR: mU.uMaskPR,
    uBackZ: { value: -1e3 }, uBackK: { value: 0 },
  };
  const MASK_GLSL = `
    float lit = 1.0 - smoothstep(uHead - 0.004, uHead + 0.004, vF);
    float drawn = 1.0 - smoothstep(uDraw - 0.004, uDraw + 0.004, vF);
    float band = 1.0 - smoothstep(0.0, 0.03, abs(vF - uPulse));
    float endFade = smoothstep(0.0, uEndF, vF * uLen) * smoothstep(0.0, ${THREAD_END_F.toFixed(2)}, (1.0 - vF) * uLen);
    float nearK = mix(1.0, smoothstep(${NEAR_F0.toFixed(2)}, ${NEAR_F1.toFixed(2)}, uCamZ - vWz), uNear);
    float copyK = mix(1.0, smoothstep(uMaskX - ${MASK_W.toFixed(1)} * uMaskPR, uMaskX, gl_FragCoord.x), uMaskOn);
    float backK = mix(1.0, smoothstep(uBackZ - ${BACK_F.toFixed(2)}, uBackZ, vWz), uBackK);
    float thrMask = mix(uBase, 1.0, lit) * drawn * uIntensity * endFade * nearK * copyK * backK;
  `;
  const UNI_GLSL = 'varying float vF;\nvarying float vWz;\nuniform float uHead;\nuniform float uDraw;\nuniform float uBase;\nuniform float uIntensity;\nuniform float uPulse;\nuniform float uLen;\nuniform float uCamZ;\nuniform float uNear;\nuniform float uEndF;\nuniform float uMaskX;\nuniform float uMaskOn;\nuniform float uMaskPR;\nuniform float uBackZ;\nuniform float uBackK;';
  const WZ_GLSL = '\nvWz = (modelMatrix * vec4(transformed, 1.0)).z;';

  const coreGeo = new THREE.CylinderGeometry(THREAD_R, THREAD_R, 1, 8, 1, true);
  coreGeo.rotateX(Math.PI / 2);   // axis along z, front (+z) first
  const coreMat = new THREE.MeshBasicMaterial({
    color: TH.day.threadCore, transparent: true, opacity: TH.day.threadCoreOpacity, depthWrite: false, toneMapped: false,
  });
  coreMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, tu);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vF;\nvarying float vWz;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvF = 0.5 - position.z;' + WZ_GLSL);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + UNI_GLSL)
      .replace('#include <color_fragment>', `#include <color_fragment>
        ${MASK_GLSL}
        diffuseColor.a *= clamp(thrMask * (1.0 + 0.7 * band), 0.0, 1.0);
        diffuseColor.rgb *= 1.0 + 0.4 * band;`);
  };
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = 'thread-core';
  core.renderOrder = -1;
  core.frustumCulled = false;
  root.add(core);

  const haloGeo = new THREE.PlaneGeometry(1, 1);
  haloGeo.rotateX(-Math.PI / 2);   // lies in xz: width along x, length along z, normal +y: flat on the floor (FIX-PLAN-R5 S3)
  const haloMat = new THREE.MeshBasicMaterial({
    color: TH.night.threadHalo, transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, fog: false,
  });
  haloMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, tu);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vF;\nvarying float vW;\nvarying float vWz;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvF = 0.5 - position.z;\nvW = position.x * 2.0;' + WZ_GLSL);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + UNI_GLSL + '\nvarying float vW;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        ${MASK_GLSL}
        float gauss = exp(-vW * vW * 5.0);
        diffuseColor.a *= gauss * clamp(thrMask * (1.0 + 0.9 * band), 0.0, 1.0);`);
  };
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.name = 'thread-halo';
  halo.scale.x = THREAD_HALO_W;
  halo.renderOrder = -1;
  halo.frustumCulled = false;
  root.add(halo);

  // S1.4: the face's projected top edge (css px) for a wall at z: -Infinity when its top-centre is behind the lens.
  // A straight edge projects to a straight line, so between two samples in front of the lens the edge is the segment
  // joining them; each segment is clipped to the frame's x range and its highest end kept. +Infinity when no part of
  // the edge in front of the lens is inside the x range.
  function faceTop(cam, z, viewW, viewH) {
    const y = WALL.Y1 - FACE_TOP_IN, zf = z + FACE_Z;
    let top = Infinity, havePrev = false, px0 = 0, py0 = 0;
    for (let s = 0; s < FACE_TOP_N; s++) {
      const u = s / (FACE_TOP_N - 1) - 0.5;
      topV.set(u * WALL.FACE_W, y, zf).project(cam);
      if (topV.z > 1) { if (u === 0) return -Infinity; havePrev = false; continue; }
      const px = (topV.x + 1) / 2 * viewW, py = (1 - topV.y) / 2 * viewH;
      if (px >= 0 && px <= viewW && py < top) top = py;
      if (havePrev && !((px0 < 0 && px < 0) || (px0 > viewW && px > viewW)) && px !== px0) {
        // the segment enters the x range: its y where it crosses x = 0 and x = viewW, if it does
        for (let e = 0; e < 2; e++) {
          const t = ((e ? viewW : 0) - px0) / (px - px0);
          if (t > 0 && t < 1) { const ye = py0 + (py - py0) * t; if (ye < top) top = ye; }
        }
      }
      havePrev = true; px0 = px; py0 = py;
    }
    return top;
  }

  // ---- update (no allocation) ------------------------------------------------------------------------------
  function update(state, t, dt, opts) {
    const S = state.spacing;
    const reduced = !!opts.reduced;
    const introT = opts.introT === undefined ? 1 : opts.introT;
    const cam = opts.camera;
    const L = 5 * S + THREAD_PF + THREAD_PB;
    const introOn = introT < 1 && !reduced;
    const tau = introT * INTRO_S;
    nightK = clamp01(state.night || 0);
    const push = cam && state.cast && Number.isFinite(state.cast.push) ? clamp01(state.cast.push) : 0;
    const pos = Number.isFinite(state.pos) ? state.pos : 0;
    const fr = pos - Math.floor(pos);
    const travel = cam && pos > 2 && pos < 7 ? smooth(0, TRAVEL_E, fr) * smooth(0, TRAVEL_E, 1 - fr) : 0;
    const navPx = Number.isFinite(opts.navPx) ? opts.navPx : NAV_PX;
    const viewH = Number.isFinite(opts.viewH) && opts.viewH > 0 ? opts.viewH : window.innerHeight;
    // FIX-PLAN-R4 S5: the canvas width comes from the stage (viewW); camera.aspect is the fit frame's (W / Hs), which no
    // longer equals the canvas aspect once the frustum runs past the fit frame to the large viewport height
    const viewW = Number.isFinite(opts.viewW) && opts.viewW > 0 ? opts.viewW : cam ? viewH * cam.aspect : window.innerWidth;

    for (let i = 0; i < N; i++) {
      pres[i] = opts.presence ? opts.presence[i] : 1;
      brt[i] = opts.bright ? opts.bright[i] : 1;
      const e = introOn ? easeOutQuint(clamp01((tau - i * STAGGER_S) / SETTLE_S)) : 1;
      fade[i] = e;
      flare[i] = state.panes[i].flare || 0;
      const fa = state.panes[i].faceA;
      faceA[i] = fa === undefined ? 1 : fa;
      const z = paneZ(i, S);
      if (push > 0 || travel > 0) {
        const yTop = faceTop(cam, z, viewW, viewH);
        const k = FACE_NEAR_MIN + (1 - FACE_NEAR_MIN) * smooth(navPx - FACE_NAV_A, navPx + FACE_NAV_B, yTop);
        const kg = smooth(navPx, navPx + FACE_GUARD, yTop);
        faceNear[i] = Math.min(1 + (k - 1) * push, 1 + (kg - 1) * travel);
      } else faceNear[i] = 1;
      // FIX-PLAN-R5 S7.4 "hidden means hidden" (audited): below pres * fade .004 (so always below presence .002) every
      // mesh of the wall is off: the group (glass, structure = frame + legs + feet, glint, face, glow), its pool and
      // caustic (poolVis, read by applyTheme), its decal slots (collapsed below) and, for wall 04, the table. Hidden
      // meshes draw nothing, cast no shadow and write no depth; every program was compiled at warm-up.
      const vis = pres[i] * e > 0.004;
      const pane = panes[i];
      pane.group.visible = vis;
      pane.group.position.set(0, SETTLE_DY * (1 - e), z);
      poolVis[i] = vis;          // applyTheme turns pools and caustics on per theme
      poolZ[i] = z;
      pools[i].position.set(0, 0.003, z + POOL_DZ);
      caustics[i].position.set(CAUSTIC_DX, 0.002, z + CAUSTIC_DZ);
      const dz = vis ? z : NaN;
      if (!(dz === decalZ[i] || (dz !== dz && decalZ[i] !== decalZ[i]))) {
        decalZ[i] = dz;
        writeDecal(i, z, vis);
        decalPos.needsUpdate = true;
      }
    }

    const tw = TABLE.wall;
    table.position.set(TABLE.x, SETTLE_DY * (1 - fade[tw]), paneZ(tw, S) + TABLE.z);
    table.visible = pres[tw] * fade[tw] > 0.004;

    // well under the deck
    well.position.set(0, WELL_Y, -2.5 * S);
    well.scale.set(WELL_W, 1, 5 * S + WELL_DPAD);
    wellFade = fade[0];

    // rail + thread: unit geometry scaled in z, each centred between its own front and back ends
    rail.position.z = (RAIL_PF - 5 * S - RAIL_PB) / 2;
    rail.scale.z = 5 * S + RAIL_PF + RAIL_PB;
    const zc = (THREAD_PF - 5 * S - THREAD_PB) / 2;
    core.position.set(0, THREAD_Y, zc);
    core.scale.z = L;
    halo.position.set(0, HALO_Y, zc);    // FIX-PLAN-R5 S3: a floor ribbon, no billboard
    halo.scale.z = L;

    const th = state.thread;
    const draw = introOn ? clamp01((introT - DRAW_START) / (1 - DRAW_START)) : 1.1;
    const drawEased = introOn ? 1 - (1 - draw) * (1 - draw) : 1.1;
    tu.uDraw.value = introOn ? (draw >= 0.999 ? 1.1 : drawEased) : 1.1;
    tu.uHead.value = th.head >= 0.999 ? 1.1 : th.head;
    tu.uBase.value = th.base === undefined ? 0.4 : th.base;
    const clearW = th.clear || 0;                       // hold clear: timeline.js
    // Director R3 dropped the line to 3 % at a hold (it hung in the air behind the held wall). FIX-PLAN-R5 S3: it lies on
    // the floor now, so it stays visible at every hold at 1 - THREAD_CLEAR_K.
    const thrK = 1 - THREAD_CLEAR_K * clearW;
    tu.uIntensity.value = th.intensity * thrK;
    tu.uLen.value = L;
    tu.uEndF.value = THREAD_END_F;                      // the front fade, its own length (FIX-PLAN-R5 S3)
    tu.uPulse.value = reduced ? -1 : ((t / PULSE_PERIOD) % 1);
    tu.uNear.value = th.near || 0;
    tu.uCamZ.value = cam ? cam.position.z : 1e3;
    // the back cut, weighted by the tour window. STAGE MANAGER R5: it no longer reads presence. Released while both walls
    // were near 0 mid-transit, the whole floor line flashed on for the dark beat (f .45-.53), rising from the bottom
    // corner to the top of the frame through the long lens: a green slash at every transit (390 5.47, 1440 3.47). Now
    // the cut slides from behind the leaving wall (k-2) to behind the arriving one (k-1) over f .30-.70, so the line grows
    // one spacing into the next wall's place while the walls cross-dissolve, and never runs full length in the tour.
    // At a hold it is exactly the old cut (the rearmost wall up is the held one).
    let backZ;
    if (pos < 2) backZ = paneZ(0, S);
    else if (pos >= 7) backZ = paneZ(5, S);
    else { const bk = Math.floor(pos); backZ = paneZ(bk - 2, S) + (paneZ(bk - 1, S) - paneZ(bk - 2, S)) * smooth(0.30, 0.70, pos - bk); }
    tu.uBackK.value = smooth(BACK_P0, BACK_P1, pos) * (1 - smooth(BACK_P2, BACK_P3, pos));
    tu.uBackZ.value = backZ - BACK_D;
    thrIntensity = th.intensity * thrK;
  }

  // ---- theme (cheap writes only; called once per pass, twice in a cut frame) --------------------------------
  function applyTheme(name) {
    const T = TH[name] || TH.day;
    const night = name === 'night';
    const flareK = night ? 0.8 : 0;
    let decalPf = 0, decalN = 0;
    for (let i = 0; i < N; i++) {
      const pf = pres[i] * fade[i];
      const pane = panes[i];

      const gm = pane.glassMat;
      gm.color.copy(T.glassColor);
      gm.opacity = T.glassOpacity * pf;
      gm.envMapIntensity = T.glassEnvI;

      const fm = pane.frameMat;
      fm.color.copy(T.frameColor);
      fm.emissive.copy(T.frameEmissive);
      fm.emissiveIntensity = T.frameEmissiveBase + flareK * flare[i];
      fm.opacity = pf;
      fm.depthWrite = pf > 0.98;

      const em = pane.edgeMesh.material;
      em.color.copy(T.edgeColor);
      em.opacity = T.edgeOpacity * pf;

      const fc = pane.faceMesh.material;
      fc.color.setScalar(night ? brt[i] : 1);
      fc.opacity = pf * faceA[i] * faceNear[i];

      // zero-opacity light is not drawn at all (visibility is a cheap write; every program compiled at warm-up)
      const wm = pane.glowMesh.material;
      wm.color.copy(T.glowColor);
      wm.opacity = T.glowOpacity * (night ? brt[i] : 1) * pf;
      pane.glowMesh.visible = wm.opacity > 0.001;

      // FIX-PLAN-R2 S6: pool 0 takes max(poolOpacity, the hero term). The hero term is normal-blended: additive g-100 on
      // the white day ground adds nothing. Blending is GL state, not a define, so the program stays the same.
      // FIX-PLAN-R3 S2.4: the hero term is also placed per pass, tight under the hand-off pair; the night term keeps
      // the wide pool in front of the wall. The same weight (heroO dominant) picks colour, blending and placement.
      const pm = pools[i].material;
      const heroO = i === 0 ? T.heroPoolOpacity * (1 - smooth(HERO_N0, HERO_N1, nightK)) : 0;
      if (heroO > T.poolOpacity) {
        pm.color.copy(T.heroPoolColor);
        pm.opacity = heroO * pf;
        pm.blending = THREE.NormalBlending;
        pools[i].position.set(HERO_POOL_X, 0.003, poolZ[i] + HERO_POOL_Z);
        pools[i].scale.set(HERO_POOL_W, 1, HERO_POOL_D);
      } else {
        pm.color.copy(T.poolColor);
        pm.opacity = T.poolOpacity * pf;
        pm.blending = THREE.AdditiveBlending;
        if (i === 0) {
          pools[i].position.set(0, 0.003, poolZ[i] + POOL_DZ);
          pools[i].scale.set(POOL_W, 1, POOL_D);
        }
      }
      pools[i].visible = poolVis[i] && pm.opacity > 0.001;
      if (poolVis[i]) { decalPf += pf; decalN++; }

      const km = caustics[i].material;
      km.color.copy(T.causticColor);
      km.opacity = T.causticOpacity * pf;
      caustics[i].visible = poolVis[i] && km.opacity > 0.001;
    }

    // one mesh for every foot and glass band: the mean fade of the visible walls (they differ only in the 0.45 s intro stagger)
    decalMat.color.copy(T.legDecalColor);
    decalMat.opacity = decalN ? T.legDecalOpacity * decalPf / decalN : 0;
    decals.visible = decalMat.opacity > 0.001;

    const tw = TABLE.wall;
    const tp = pres[tw] * fade[tw];
    tableMat.color.copy(T.tableColor);
    tableMat.opacity = tp;
    tableMat.depthWrite = tp > 0.98;

    railMat.color.copy(T.railColor);
    rail.visible = T.railOn > 0;

    wellMat.color.copy(T.wellColor);
    wellMat.opacity = T.wellOpacity * wellFade;
    well.visible = wellMat.opacity > 0.001;

    coreMat.color.copy(T.threadCore);
    coreMat.opacity = T.threadCoreOpacity;
    haloMat.color.copy(T.threadHalo);
    haloMat.opacity = T.threadHaloOpacity * thrIntensity;
  }

  applyTheme('day');

  return { panes, table, rail, well, decals, thread: { core, halo }, update, applyTheme };
}
