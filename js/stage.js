// LENS — js/stage.js (E-stage-core, sole owner; REWORK-01 executor "look")
// The renderer and the world around the objects and the cast: themes, background and grain shaders, fog,
// lights, procedural environment, ground traces and shadow catcher, the day/night dual render (the cut),
// camera fit, face-texture plumbing (with the floor's event clock, `beat`), the scene clock and the frame loop.
//
// Colour discipline: every literal colour in the 3D code lives in THEMES below, one token source per value.
// Nothing in frame() allocates. Theme switches write cheap properties only (no material.needsUpdate), and
// stage.programs() never changes between themes.
// REWORK-01: walls (objects.js) and people (cast.js) are built from the same THEMES. cast.js is imported
// dynamically and every call into it is guarded, so a missing or broken cast never takes the page down.
import * as THREE from 'three';
import { buildObjects } from './objects.js';
import { WALL, paneZ, paneFrac, KEYS, stateAt } from './timeline.js';

// ---------------------------------------------------------------------------------------------------
// THEMES — the only place brand colours live in the 3D code (SM-1). Both themes carry every key.
// Values: REWORK-01-DIRECTOR §5 (binding); build-1 keys it does not list are unchanged.
// hsl() uses commas: three r169 does not parse the space-separated form.
// ---------------------------------------------------------------------------------------------------
// FIX-PLAN-R4 S1.3: the people palette, shared by both themes (cast.js reads THEMES.<theme>.people). Skin and hair are
// subjects with a colour of their own and the clothing is everyday cloth, so none of them is a brand green.
// FIX-PLAN-R5 S1: the skin tones set for the client's mix (4 of 6 slots Asian, 1 tanned/brown, 1 white), and Sam added.
const PEOPLE = {
  Lim: {
    skin: '#E2BD9A',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); light East Asian (FIX-PLAN-R5 S1)
    hair: '#2B2420',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception)
    top: '#D9CFC0',             // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); linen
    trousers: '#4A4A52',        // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); charcoal
    bun: 0,
  },
  Priya: {
    skin: '#7E5238',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); deeper South Asian (FIX-PLAN-R5 S1)
    hair: '#1E1A18',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception)
    top: '#B98E7A',             // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); clay rose
    trousers: '#3F4A5A',        // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); slate
    bun: 1,
  },
  Marcus: {
    skin: '#EECBB5',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); white, pink undertone (FIX-PLAN-R5 S1)
    hair: '#9A968E',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); grey
    top: '#8FA3AE',             // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); dusty blue
    trousers: '#6B5B4B',        // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); brown
    bun: 0,
  },
  Nurul: {
    skin: '#B07B53',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); warm Southeast Asian, Malay (FIX-PLAN-R5 S1)
    hair: '#5A3B28',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception)
    top: '#C9B79C',             // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); oat
    trousers: '#4A4A52',        // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); charcoal
    bun: 0,
  },
  // FIX-PLAN-R5 S1: Sam, the new staff member on wall 05 (cast.js). Priya's place, but not her look: short hair, sage.
  Sam: {
    skin: '#A46E4B',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); tanned / brown
    hair: '#2A221E',            // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception)
    top: '#9BA38A',             // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); sage linen
    trousers: '#4A4A52',        // representational: skin | hair | clothing (brand.json surfaces_3d.representational_exception); charcoal
    bun: 0,
  },
};

export const THEMES = {
  day: {
    bg: '#FFFFFF',                     // --rc-e0 (light)
    bloomCool: 'hsl(152, 66%, 44%)',   // --rc-bloom-cool (L2.5b)
    bloomWarm: 'hsl(140, 58%, 42%)',   // --rc-bloom-warm (L2.5b)
    bloomAlpha: 0.20,                  // --rc-bloom-alpha (L2.5b)
    fog: '#FFFFFF',                    // --rc-e0 (light); = bg, so a fully fogged object equals the ground
    hemiSky: '#FFFFFF',                // --rc-e0 (light)
    hemiGround: '#E3F1EA',             // --rc-g-100
    hemiI: 1.1,                        // DN theme table
    sunColor: '#FFFFFF',               // --rc-e0 (light)
    sunI: 2.2,
    keyColor: '#FFFFFF',               // --rc-e0 (light): FIX-PLAN-R1 S4, the day key is an upper-right rim on the figures
    keyI: 0.45,
    keyPos: [5, 7, -6],                // relative to CENTER (FIX-PLAN-R1 S4)
    grainAmp: 0.018,                   // REWORK-01 §6.1: finer film, one hash per device pixel
    vignette: 0.12,
    vignetteColor: '#06251C',          // --rc-g-950
    traceColor: '#4FA98B',             // --rc-g-400
    traceAlpha: 0.55,
    shadowColor: '#06251C',            // --rc-g-950
    shadowOpacity: 0.26,               // FIX-PLAN-R3 S2.6 m1: brand .22-.28, soft (was .36, FIX-PLAN-R2 S6)
    // walls (objects.js)
    glassColor: '#FFFFFF',             // --rc-e0 (light): FIX-PLAN-R1 S4, glass carries no green in either theme
    glassOpacity: 0.34,                // thin wall, less "window"
    envI: 1.2,                         // scene environment (figures, table); swept per FIX-PLAN-R1 S4
    glassEnvI: 0.20,                   // glass envMapIntensity, split from envI (FIX-PLAN-R1 S4)
    edgeColor: '#FFFFFF',              // --rc-e0 (light): the specular glass edge
    edgeOpacity: 0.85,
    frameColor: '#BFE0D2',             // --rc-g-200: FIX-PLAN-R1 S4, thin pale edges, not bezels
    railColor: '#BFE0D2',              // --rc-g-200: the floor channel, a pale inset by day
    railOn: 1,                         // the channel is drawn by day
    frameEmissive: '#4FA98B',          // --rc-g-400
    frameEmissiveBase: 0,
    tableColor: '#FFFFFF',             // --rc-e0 (light): white clay
    threadCore: '#4FA98B',             // --rc-g-400
    threadCoreOpacity: 0.7,
    threadHalo: '#4FA98B',             // --rc-g-400
    threadHaloOpacity: 0.15,
    poolColor: '#12735A',              // --rc-g-600
    poolOpacity: 0,
    causticColor: '#E3F1EA',           // --rc-g-100
    causticOpacity: 0.35,              // wider walls, so a softer patch
    glowColor: '#12735A',              // --rc-g-600
    glowOpacity: 0,
    wellColor: '#06251C',              // --rc-g-950: the day floor well under the deck (FIX-PLAN-R1 S4)
    wellOpacity: 0.06,
    // people (cast.js)
    humanColor: '#FFFFFF',             // --rc-e0 (light): white clay
    humanEmissive: '#BFE0D2',          // --rc-g-200
    humanEmissiveI: 0,
    humanRimI: 0,
    // FIX-PLAN-R4 S1.3: the representational people, their eyes, and the theme multiplier on their colours
    people: PEOPLE,
    humanEye: '#06251C',               // --rc-g-950
    humanTint: '#FFFFFF',              // --rc-e0 (light): day multiplier on the people colours
    humanTintK: 1,
    agentScreen: '#BFE0D2',            // --rc-g-200: the agent's screen background
    agentGlyph: '#0E5A45',             // --rc-g-700: the screen's eyes
    agentLive: '#0E5A45',              // --rc-g-700: the momentary happy glyph (a marker)
    agentGlowI: 0,
    // FIX-PLAN-R4 S1.3: the humans now carry their own colours, so the species read by shape; the day agent is g-050
    // body with a g-100 head (the head stays one step greener than the body).
    agentColor: '#F1F8F4',             // --rc-g-050: pale mint clay
    agentHeadColor: '#E3F1EA',         // --rc-g-100
    agentHeadEmissive: '#BFE0D2',      // --rc-g-200
    agentHeadEmissiveI: 0,
    agentRimI: 0,
    agentFaceColor: '#4FA98B',         // --rc-g-400: the agent's front face, a step darker than the head (FIX-PLAN-R1 S1)
    agentFaceEmissive: '#BFE0D2',      // --rc-g-200
    agentFaceEmissiveI: 0,
    // FIX-PLAN-R2 S3: the day card is paper (= PALETTE note day) with a g-700 hairline (cast.js card texture)
    cardColor: '#F6F3EC',              // representational: paper (brand.json surfaces_3d.representational_exception; FIX-PLAN-R1 0.2)
    cardEdge: '#0E5A45',               // --rc-g-700
    cardEmissive: '#F1F8F4',           // --rc-g-050 (intensity 0 by day)
    cardEmissiveI: 0,
    // FIX-PLAN-R2 S6: the day floor pool under wall 01's pair (objects.js pool 0)
    heroPoolColor: '#E3F1EA',          // --rc-g-100
    heroPoolOpacity: 0.55,
    // FIX-PLAN-R2 S12 m5: the wall-leg contact decals (objects.js)
    legDecalColor: '#06251C',          // --rc-g-950
    legDecalOpacity: 0.05,
    decalColor: '#06251C',             // --rc-g-950: day contact shadows
    decalOpacity: 0.32,                // FIX-PLAN-R1 S4
    rim: '#4FA98B',                    // --rc-g-400
    seam: '#4FA98B',                   // --rc-g-400
    seamAlpha: 0.4,
    // FIX-PLAN-R5 S4: the agents' accessories (cast.js). Everyday cloth, same in both themes (the night tint is the light's)
    acc0: '#3C3A36',                   // representational: clothing (brand.json surfaces_3d.representational_exception); charcoal felt
    acc1: '#9C5A4C',                   // representational: clothing (brand.json surfaces_3d.representational_exception); brick
    acc2: '#C2A064',                   // representational: clothing (brand.json surfaces_3d.representational_exception); ochre
    acc3: '#5C6F8A',                   // representational: clothing (brand.json surfaces_3d.representational_exception); slate
    acc4: '#0E5A45',                   // --rc-g-700; representational: clothing (brand.json surfaces_3d.representational_exception); tie
    acc5: '#BFE0D2',                   // --rc-g-200; representational: clothing (brand.json surfaces_3d.representational_exception); headphone band
  },
  night: {
    bg: '#060D0B',                     // --rc-e0 (dark)
    bloomCool: 'hsl(152, 74%, 32%)',   // --rc-bloom-cool (L2.5a)
    bloomWarm: 'hsl(140, 60%, 28%)',   // --rc-bloom-warm (L2.5a)
    bloomAlpha: 0.28,                  // --rc-bloom-alpha (L2.5a) is 0.48; REWORK-01 §6.1 cuts the 3D field to 0.28: night-soup fix
    fog: '#060D0B',                    // --rc-e0 (dark); must equal bg, never a green mix
    hemiSky: '#0F1C17',                // --rc-e2 (dark)
    hemiGround: '#030705',             // --rc-e-deep (dark)
    hemiI: 0.25,
    sunColor: '#FFFFFF',               // --rc-e0 (light); intensity 0 at night, the sun stays in the scene
    sunI: 0,
    keyColor: '#BFE0D2',               // --rc-g-200
    keyI: 0.35,
    keyPos: [-4, 8, 6],                // relative to CENTER: the build-2 key (FIX-PLAN-R1 S4)
    grainAmp: 0.022,                   // REWORK-01 §6.1: finer film, one hash per device pixel
    vignette: 0.42,                    // holds the dark edges once the bloom is cut
    vignetteColor: '#000000',          // pure black, darkening only
    traceColor: '#0B4535',             // --rc-g-800
    traceAlpha: 0.18,                  // keeps the night floor near-black
    shadowColor: '#06251C',            // --rc-g-950 (opacity 0 at night)
    shadowOpacity: 0,
    // walls (objects.js)
    // FIX-PLAN-R2 S4: night glass reads as lit glass, not a black monitor. A neutral lift, swept with the faces veil.
    glassColor: '#FFFFFF',             // --rc-e0 (light): neutral lift, glass carries no brand colour (brand.json fresnel)
    glassOpacity: 0.03,                // FIX-PLAN-R2 S4: swept .00-.08 against the faces veil (was .24 black); _dev/r4-t2-glassL.mjs
    envI: 0.35,
    glassEnvI: 0.32,                   // glass envMapIntensity, split from envI (FIX-PLAN-R2 S4, was .20)
    edgeColor: '#FFFFFF',              // --rc-e0 (light): the specular glass edge (FIX-PLAN-R1 S4)
    edgeOpacity: 0.35,                 // FIX-PLAN-R2 S4 (was .22)
    frameColor: '#0B4535',             // --rc-g-800
    railColor: '#06251C',              // --rc-g-950 (not drawn at night, railOn 0)
    // FIX-PLAN-R1 S4: a lit channel on the unlit night ground reads as a stripe from every angle: at g-950 it sat
    // 25/255 over the ground at pos 7 (a runway), at bg colour with no env it cut a black groove at pos 2.65. At
    // night the thread is the line down the row, so the channel is not drawn and the floor is flush.
    railOn: 0,
    frameEmissive: '#4FA98B',          // --rc-g-400
    frameEmissiveBase: 0,              // FIX-PLAN-R2 S4/S11: no standing frame glow; the relight flare still adds flareK*flare
    tableColor: '#0B4535',             // --rc-g-800
    threadCore: '#BFE0D2',             // --rc-g-200
    threadCoreOpacity: 1,
    threadHalo: '#4FA98B',             // --rc-g-400
    threadHaloOpacity: 1,
    poolColor: '#12735A',              // --rc-g-600
    poolOpacity: 0.32,                 // the pools now sit under the people
    causticColor: '#E3F1EA',           // --rc-g-100 (opacity 0 at night)
    causticOpacity: 0,
    glowColor: '#12735A',              // --rc-g-600
    glowOpacity: 0.10,
    wellColor: '#06251C',              // --rc-g-950 (opacity 0 at night)
    wellOpacity: 0,
    // people (cast.js)
    humanColor: '#F1F8F4',             // --rc-g-050: warm off-white
    humanEmissive: '#BFE0D2',          // --rc-g-200: soft self-light so humans read on the dark ground
    humanEmissiveI: 0.04,              // FIX-PLAN-R2 S8 (was .10)
    humanRimI: 0.60,
    people: PEOPLE,
    humanEye: '#06251C',               // --rc-g-950
    humanTint: '#F1F8F4',              // --rc-g-050: night multiplier on the people colours (x humanTintK)
    humanTintK: 0.82,
    agentScreen: '#060D0B',            // --rc-e0 (dark): the agent's screen background
    agentGlyph: '#BFE0D2',             // --rc-g-200: the screen's eyes, emissive
    agentLive: '#4FE0D0',              // --rc-accent-2 (L2.5 dark): the momentary happy glyph only (a marker, <= .9 s)
    agentGlowI: 1.2,
    agentColor: '#0B4535',             // --rc-g-800: deep green body
    agentHeadColor: '#0B4535',         // --rc-g-800: same as the body; the emissive does the work at night
    agentHeadEmissive: '#BFE0D2',      // --rc-g-200: the one light an agent carries
    agentHeadEmissiveI: 0.45,          // FIX-PLAN-R2 S8: agents lit at night (was .15; the front face still carries the most)
    agentRimI: 0.50,
    agentFaceColor: '#0B4535',         // --rc-g-800 (FIX-PLAN-R1 S1)
    agentFaceEmissive: '#BFE0D2',      // --rc-g-200: the one light an agent carries, on its front face
    agentFaceEmissiveI: 0.9,
    cardColor: '#D8D2C6',              // representational: paper (brand.json surfaces_3d.representational_exception; FIX-PLAN-R1 0.2)
    cardEmissive: '#D8D2C6',           // representational: paper (brand.json surfaces_3d.representational_exception; FIX-PLAN-R1 0.2)
    cardEmissiveI: 0.40,               // FIX-PLAN-R2 S11/m2: a paper fill light (was .25)
    cardEdge: '#0B4535',               // --rc-g-800
    heroPoolColor: '#E3F1EA',          // --rc-g-100 (opacity 0 at night)
    heroPoolOpacity: 0,
    legDecalColor: '#06251C',          // --rc-g-950 (opacity 0 at night)
    legDecalOpacity: 0,
    decalColor: '#06251C',             // --rc-g-950 (opacity 0 at night)
    decalOpacity: 0,
    rim: '#4FA98B',                    // --rc-g-400
    seam: '#4FA98B',                   // --rc-g-400
    seamAlpha: 0.4,
    // FIX-PLAN-R5 S4: the agents' accessories (cast.js), as by day
    acc0: '#3C3A36',                   // representational: clothing (brand.json surfaces_3d.representational_exception); charcoal felt
    acc1: '#9C5A4C',                   // representational: clothing (brand.json surfaces_3d.representational_exception); brick
    acc2: '#C2A064',                   // representational: clothing (brand.json surfaces_3d.representational_exception); ochre
    acc3: '#5C6F8A',                   // representational: clothing (brand.json surfaces_3d.representational_exception); slate
    acc4: '#0E5A45',                   // --rc-g-700; representational: clothing (brand.json surfaces_3d.representational_exception); tie
    acc5: '#BFE0D2',                   // --rc-g-200; representational: clothing (brand.json surfaces_3d.representational_exception); headphone band
  },
};

// keys whose value is a colour string (precomputed to THREE.Color once)
const COLOR_KEYS = ['bg', 'bloomCool', 'bloomWarm', 'fog', 'hemiSky', 'hemiGround', 'sunColor', 'keyColor',
  'vignetteColor', 'traceColor', 'shadowColor', 'glassColor', 'edgeColor', 'frameColor', 'railColor', 'frameEmissive',
  'tableColor', 'threadCore', 'threadHalo', 'poolColor', 'causticColor', 'glowColor',
  'humanColor', 'humanEmissive', 'agentColor', 'agentHeadColor', 'agentHeadEmissive', 'agentFaceColor', 'agentFaceEmissive',
  'cardColor', 'cardEmissive', 'decalColor', 'wellColor',
  'rim', 'seam', 'acc0', 'acc1', 'acc2', 'acc3', 'acc4', 'acc5'];

// ---------------------------------------------------------------------------------------------------
// constants
// ---------------------------------------------------------------------------------------------------
const N = 6;                       // panes
const DEG = Math.PI / 180;
const NIGHT_W = 2048, NIGHT_H = 1280;   // night face canvas
const DAY_W = 1024, DAY_H = 640;        // day face canvas and the night ghost
const BUILD_S = 1.4;               // face build time
const GHOST_G = 0.85;              // whole-face ghost strength before the build: FIX-PLAN-R3 S4.1, faces lit on a first visit at the cut (was .40)
const PLANE_MAX_PR = 1.75;
const PARALLAX_AZ = 1.2, PARALLAX_EL = 0.8;
const CENTER = [0, 0, -5];         // sun / shadow / trace centre: the pos-0 deck centre
// K0 screen placement: the desk value, and the portrait value resize() swaps into defaultState (preallocated, never
// rebuilt). FIX-PLAN-R2 S6/S9: read straight from timeline.js KEYS[0] so the mirror can never drift again.
const K0_DESK = KEYS[0].desk.slice();
const K0_MOB = KEYS[0].mob.slice();
const K0_FOG = KEYS[0].fog.slice();
// Portrait cut framing (FIX-PLAN-R2 S10). R1 placed the focus between fixed offsets from the seam, from a measured
// "the deck spans focus -.10 .. +.26". That span is per key: the K1 deck (scale 1.52) spans about -.03 .. +.36 and the
// K0 deck (reduced snaps to it) about -.11 .. +.20, so no one pair of offsets kept 25 % of both decks on each side.
// The deck's span is now measured each cut frame (deckSpan below): its centre goes to CUT_MID of the height, clamped
// so at least CUT_KEEP_A of the deck stays above the seam and CUT_KEEP_B below it (the accept is 25 % each side; the
// wall tops measure exactly, the crew's feet are an estimate, so below keeps more margin). Swept in _dev/r4-t2-cut.mjs.
// Stage manager R2: .40/.26/.32 with CUT_EL 3 left the phone cut with 3 of 6 bands over 160 px (390x844 cut .3 and .7);
// swept in _dev/r4-sm-cut.mjs, .405/.24/.30 with CUT_EL 11 passes all 12 (390x844 and 375x812, cut .3/.5/.7, normal and
// reduced): the steeper tilt makes the deck taller, so it can hold 25 % on each side and still meet the card.
// FIX-PLAN-R3 S5.1-5.2: the deck is measured over the glass only (every wall's WALL.Y0 .. WALL.Y1; the legs and the
// crew's feet no longer count). DEVIATION (swept in _dev/r4-sm-cut.mjs, R3 stage C): the plan's .46 / .24 / .30 on the glass
// span passed 1 of 12 bands (the glass span is shorter than the old tops-to-feet span, so .24 above left the full deck
// at 21 % above at cut .3; .46 opened a 171 px sky under the nav at cut .5; .30 of the glass below pinned the deck low
// at cut .7, a 193 px gap). With portrait traffic now off through the cut (S5.3) the reduced cut .3 deck is short, and
// no mid/keep pair at CUT_EL 11 meets both "25 % above" and "no gap over 160 px" there; CUT_EL 17 makes the deck
// taller. .44 / .32 / .15 with CUT_EL 17 passes all 12 (390x844 and 375x812, cut .3/.5/.7, normal and reduced) and keeps
// over half of wall 01's glass below the seam at cut .5 (_dev/r6-cut-glass.mjs, gate 35 %).
// STAGE-MANAGER R4: .44 -> .41. The R4 cast's nearest wall-01 agent (the reader, z .95) put the deck's lowest feet
// 4-5 px over the intro card at cut .5 (gate 12); .41 clears it by 21-30 px at 390 and 375, all 12 pass.
const CUT_MID = 0.41, CUT_KEEP_A = 0.32, CUT_KEEP_B = 0.15;
// FIX-PLAN-R2 S10: portrait tilts the camera down while the cut crosses the screen (plan 3 deg; 11 after the R2 sweep;
// 17 after the R3 sweep above)
const CUT_EL = 17;
// FIX-PLAN-R1 S12 m3: trace lanes dropped after generation, as [trace k, lane]. Found by
// _dev/fix-r1-world-trace-probe.mjs: the lane whose pos-0 projection lands at x > .95, y > .87 at 1440x900.
const TRACE_DROP = [[22, 0]];
// the copy column mask on the ground traces (landscape, day): traces fade out over 160 css px at .47 of the width
// (FIX-PLAN-R2 S12 m7: 80 -> 160, so no trace runs under the hero proof block; FIX-PLAN-R3 S2.7 m2: .42 -> .47)
const TRACE_MASK_X = 0.47, TRACE_MASK_W = 160;
// FIX-PLAN-R5 S7.4, the exit gate: for pos >= EXIT_P, walls 00..04 come back only once they are no wider than the held wall
// and wholly inside the frame, so no passed wall sweeps the frame as a bar during the pull-out. The held width is wall 05
// (EXIT_HOLD) fitted to stateAt(EXIT_P), measured once per resize.
//   size: x (1 - smoothstep(EXIT_G0, EXIT_G1, w / wHold)). DEVIATION: the plan's 1.05 .. 1.25 let a wall back at 1.25x
//     (its own sentence says "only once it is no bigger than 1.05x"), and its gate (r9-glide: no wall over 1.06x with
//     presence > .02) failed at 1440 and 390 (1.09x / 1.12x at presence .04 / .36). 1.00 .. 1.05 meets both.
//   edge: per side, x smoothstep(lo, lo + EXIT_EDGE * W, the wall's distance inside that edge), lo = min(0, the same
//     distance in the pos-8 deck - EXIT_EDGE * W). Not in the plan's formula, but its gate says no returning wall may
//     touch a frame edge: the K8 pull-out turns (az 30), so at 1440 walls 00..02 cross the left edge while already smaller
//     than the hold (7.25 .. 7.7). A side that sits close to (or past) the edge in the Together deck itself (at 390 / 375
//     the receding row runs off the right edge) may come as close as it will be there: gating those at the edge made
//     walls 03 / 04 blink in, out and in again (390, 7.3 .. 8.0). With deck sides >= EXIT_EDGE * W (1440) lo is 0.
//   Both are released over EXIT_R0 .. EXIT_R1, so the deck at pos 8 is always complete.
const EXIT_P = 7, EXIT_G0 = 1.00, EXIT_G1 = 1.05, EXIT_HOLD = 5, EXIT_EDGE = 0.05, EXIT_R0 = 7.8, EXIT_R1 = 8.0;

// FIX-PLAN-R2 S2 (contract §0.3.1): wall 06's decision lands as the camera arrives at the hold. When pos rises
// through ARM6_AT the wall-06 clock is shifted forward so the 'decide' event (DECIDE6) fires about LEAD6 s later.
const ARM6_AT = 6.60, ARM6_RESET = 6.0, DECIDE6 = 5.9, HOLD6 = 7;
const LEAD6 = 2.0;                        // the fixed lead (s) when the velocity lead is off
const LEAD6_VEL = true;                   // lead = clamp((HOLD6 - pos) / v + LEAD6_PAD, LEAD6_MIN, LEAD6_MAX), v the smoothed pos/s
const LEAD6_MIN = 1.0, LEAD6_MAX = 3.0;   // FIX-PLAN-R3 S3.3: MIN .8 -> 1.0, the pin (decide - .5 s) has started by arrival
// DEVIATION (R3 stage C): the plan changes only MIN, but its gate is decide at arrival +0.3 .. +1.0 s. With MIN 1.0 alone the
// probe gave fast +.55, medium +.27, slow +.20: the velocity ETA lands decide AT arrival (the ease-out slows the last
// stretch, so the ETA runs short). The pad puts decide ~.5 s after the estimated arrival.
const LEAD6_PAD = 0.5;
const VEL_TAU = 0.25;                     // pos velocity smoothing (s)
const SKIP6_LO = 1.0, SKIP6_HI = 0.8;     // no shift when the clock is already within [target - LO, target + HI]

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const nextFrame = () => new Promise((res) => {
  let done = false;
  const fin = () => { if (!done) { done = true; res(); } };
  requestAnimationFrame(fin);
  setTimeout(fin, 60);              // background tabs pause rAF; never hang the boot on it
});

// ---------------------------------------------------------------------------------------------------
// shaders
// ---------------------------------------------------------------------------------------------------
const BG_VERT = /* glsl */`
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Base plus three elliptical blooms, composited in sRGB exactly like the CSS field
// (radial-gradient(58% 58% at -4% -12%, c 0%, transparent 70%) stacked A over B over C over base).
const BG_FRAG = /* glsl */`
uniform vec2 uResolution;
uniform vec3 uBase;
uniform vec3 uCool;
uniform vec3 uWarm;
uniform float uAlpha;
uniform float uVeil;       // FIX-PLAN-R6 S1: 1 = the ground; < 1 = the veil drawn over the rendered stage

vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
vec3 toLinear(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
// alpha of one gradient at uv: 1 at the centre, 0 at 70% of the radius, linear (as CSS interpolates it)
float bloom(vec2 uv, vec2 c, float r) { return uAlpha * max(0.0, 1.0 - length((uv - c) / r) / 0.7); }

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y = 1.0 - uv.y;                                   // measured from the top-left, like CSS
  vec3 col = toSRGB(uBase);
  vec3 cool = toSRGB(uCool);
  vec3 warm = toSRGB(uWarm);
  col = mix(col, cool, bloom(uv, vec2(0.48, 0.58), 0.46));
  col = mix(col, warm, bloom(uv, vec2(1.04, 0.06), 0.50));
  col = mix(col, cool, bloom(uv, vec2(-0.04, -0.12), 0.58));
  gl_FragColor = vec4(toLinear(col), uVeil);
  #include <colorspace_fragment>
}
`;

// Film grain (reseeded by uSeed at 24 fps), vignette and the seam at the cut (night pass only; FIX-PLAN-R3 S11 m8: exactly
// 2 device px, hard-edged, from the scissor row). FIX-PLAN-R5 S2: the glass-crossing band (R3 S1.6) is gone, with no
// replacement: in the long-lens tour the lens never nears the glass, and the band read as a white slash over the copy.
// The composite runs in display (sRGB) space: the two colours are encoded first and the result is written
// as is. (Build 1 un-premultiplied in linear and then sRGB-encoded the result, which gamma-boosted the grain
// 3-4x wherever the vignette sat under it; vignette-only and seam-only pixels are identical either way.)
const GRAIN_FRAG = /* glsl */`
uniform vec2 uResolution;
uniform float uSeed;
uniform float uGrain;
uniform float uVignette;
uniform vec3 uVigColor;
uniform vec3 uSeamColor;
uniform float uSeamY;      // device px from the top (an integer: the scissor row); the seam's two rows start here
uniform float uSeamA;      // 0 when there is no seam

vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / uResolution;
  // grain (REWORK-01 §5): ONE hash per device pixel, so it reads as 1 px film, not 2-sample static.
  // Luminance only: white above zero, black below, strength |n| scaled to 0..uGrain.
  float n = hash(fc + uSeed * vec2(37.0, 17.0)) - 0.5;
  float ga = abs(n) * 2.0 * uGrain;
  vec3 gc = vec3(step(0.0, n));
  // vignette
  float r = length(uv - 0.5) * 1.41421356;
  float va = uVignette * smoothstep(0.42, 1.0, r);
  // premultiplied composite: vignette, grain over it, seam over that
  vec4 acc = vec4(toSRGB(uVigColor) * va, va);
  acc = vec4(gc * ga + acc.rgb * (1.0 - ga), ga + acc.a * (1.0 - ga));
  // the seam: rows uSeamY and uSeamY + 1 (fc.y sits on pixel centres, so yTop = row + .5), nothing soft
  float yTop = uResolution.y - fc.y;
  float sa = uSeamA * step(uSeamY, yTop) * step(yTop, uSeamY + 2.0);
  acc = vec4(toSRGB(uSeamColor) * sa + acc.rgb * (1.0 - sa), sa + acc.a * (1.0 - sa));
  gl_FragColor = vec4(acc.a > 0.0 ? acc.rgb / acc.a : vec3(0.0), acc.a);   // display space: no output encode
}
`;

// ---------------------------------------------------------------------------------------------------
// ground: etched traces as vector ribbons (crisp at any zoom), one merged mesh
// ---------------------------------------------------------------------------------------------------
function buildTraceGeometry() {
  const rnd = mulberry32(0x1e75c0de);
  const pos = [];
  const col = [];
  const idx = [];
  const Y = 0;                       // the mesh carries the 0.001 offset
  const R = 45;
  const fadeAt = (x, z) => 1 - smoothstep(0.12, 1.0, Math.hypot(x - CENTER[0], z - CENTER[2]) / R);

  const dense = (pts, step) => {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.max(1, Math.ceil(len / step));
      for (let k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  };

  // per-vertex miter data of an xz polyline: normal m (unit) and length scale s
  const miters = (pts) => pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let d0x = p[0] - a[0], d0z = p[1] - a[1];
    let d1x = b[0] - p[0], d1z = b[1] - p[1];
    let l0 = Math.hypot(d0x, d0z), l1 = Math.hypot(d1x, d1z);
    if (l0 < 1e-9) { d0x = d1x; d0z = d1z; l0 = l1; }
    if (l1 < 1e-9) { d1x = d0x; d1z = d0z; l1 = l0; }
    d0x /= l0; d0z /= l0; d1x /= l1; d1z /= l1;
    const n0x = -d0z, n0z = d0x, n1x = -d1z, n1z = d1x;
    let mx = n0x + n1x, mz = n0z + n1z;
    const ml = Math.hypot(mx, mz) || 1;
    mx /= ml; mz /= ml;
    const dot = mx * n1x + mz * n1z;
    return [mx, mz, 1 / Math.max(0.5, dot)];
  });

  const offsetPath = (pts, off) => {
    if (off === 0) return pts;
    const m = miters(pts);
    return pts.map((p, i) => [p[0] + m[i][0] * m[i][2] * off, p[1] + m[i][1] * m[i][2] * off]);
  };

  const ribbon = (pts, halfW, aMul) => {
    const m = miters(pts);
    const base = pos.length / 3;
    for (let i = 0; i < pts.length; i++) {
      const [x, z] = pts[i];
      const w = halfW * m[i][2];
      const a = fadeAt(x, z) * aMul;
      pos.push(x + m[i][0] * w, Y, z + m[i][1] * w, x - m[i][0] * w, Y, z - m[i][1] * w);
      col.push(1, 1, 1, a, 1, 1, 1, a);
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const a = base + i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  };

  const pad = (x, z, size, aMul) => {
    const h = size / 2, a = fadeAt(x, z) * aMul;
    const base = pos.length / 3;
    pos.push(x - h, Y, z - h, x + h, Y, z - h, x - h, Y, z + h, x + h, Y, z + h);
    for (let k = 0; k < 4; k++) col.push(1, 1, 1, a);
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  };

  // one trace: runs outward from the rail, jogs on 45 deg elbows, sometimes turns 90 deg
  const makePath = (x0, z0, dir, target) => {
    let h = dir, x = x0, z = z0, total = 0, corners = 0;
    const pts = [[x, z]];
    while (total < target) {
      const L = 1.4 + rnd() * 6.5;
      x += Math.cos(h) * L; z += Math.sin(h) * L; pts.push([x, z]); total += L;
      let t = rnd() < 0.5 ? Math.PI / 4 : -Math.PI / 4;
      const D = 0.5 + rnd() * 1.2;
      const hd = h + t;
      x += Math.cos(hd) * D; z += Math.sin(hd) * D; pts.push([x, z]); total += D;
      if (corners < 2 && rnd() < 0.4) {
        // corner: continue to 90 deg off, picking the side that keeps heading outward
        let hn = h + 2 * t;
        const hn2 = h - 2 * t;
        if (Math.cos(hn2 - dir) > Math.cos(hn - dir)) hn = hn2;
        h = hn; corners++;
      }
      // else: a jog — the heading is unchanged, the run continues one diagonal step to the side
    }
    return pts;
  };

  const COUNT = 46;
  const ranges = [];                 // [k, lane, first vertex, vertex count] per kept lane (the probe reads it)
  const dropped = (k, ln) => TRACE_DROP.some((d) => d[0] === k && d[1] === ln);
  for (let k = 0; k < COUNT; k++) {
    const side = k % 2 === 0 ? 1 : -1;
    const x0 = side * (0.16 + rnd() * 0.12);
    const z0 = -13 + rnd() * 17;
    const dir = side > 0 ? 0 : Math.PI;
    const target = 10 + rnd() * 32;
    const raw = makePath(x0, z0, dir, target);
    const pts = dense(raw, 1.5);
    // the -x side runs toward the hero copy zone: keep it quieter so the copy reads over it
    const aMul = (0.55 + rnd() * 0.45) * (side < 0 ? 0.5 : 1);
    const bus = rnd() < 0.3;
    const lanes = bus ? 3 : 1;
    const gap = 0.07;
    for (let ln = 0; ln < lanes; ln++) {
      const off = (ln - (lanes - 1) / 2) * gap;
      const keep = bus ? Math.max(4, pts.length - ln * 2 - (rnd() < 0.5 ? 1 : 0)) : pts.length;
      const path = offsetPath(pts, off).slice(0, keep);
      const p0 = pos.length, c0 = col.length, i0 = idx.length;
      ribbon(path, bus ? 0.0055 : 0.0075, aMul);
      if (rnd() < 0.65) {
        const e = path[path.length - 1];
        pad(e[0], e[1], bus ? 0.075 : 0.1, aMul);
      }
      // a dropped lane still draws its random numbers above, so every other trace keeps its shape
      if (dropped(k, ln)) { pos.length = p0; col.length = c0; idx.length = i0; }
      else ranges.push([k, ln, p0 / 3, (pos.length - p0) / 3]);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));   // itemSize 4 = vertex alpha
  g.setIndex(idx);
  g.userData.ranges = ranges;
  return g;
}

// ---------------------------------------------------------------------------------------------------
// createStage
// ---------------------------------------------------------------------------------------------------
export async function createStage(canvas, { reduced = false, skipIntro = false, fitH = 0 } = {}) {
  // ---- renderer (rejects when WebGL is unavailable; main.js shows the no-WebGL page) -----------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('LENS: no WebGL context');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.autoClear = false;
  canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());

  // ---- precompute every colour once -------------------------------------------------------------------
  const TH = { day: {}, night: {} };
  for (const name of ['day', 'night']) {
    const src = THEMES[name];
    for (const k in src) TH[name][k] = src[k];
    for (const k of COLOR_KEYS) TH[name][k] = new THREE.Color(src[k]);
  }
  const rgba = (c, a) => {   // css string from a linear THREE.Color
    const o = { r: 0, g: 0, b: 0 };
    c.getRGB(o, THREE.SRGBColorSpace);
    return `rgba(${Math.round(o.r * 255)},${Math.round(o.g * 255)},${Math.round(o.b * 255)},${a})`;
  };

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(TH.day.fog, 1, 100);   // linear in both themes; colour set per pass

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 120);

  // ---- procedural environment (no RoomEnvironment vendored) ---------------------------------------------
  {
    const envScene = new THREE.Scene();
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(30, 20, 30),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(0.22), side: THREE.BackSide }));
    envScene.add(shell);
    const panel = (w, h, pos, look, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: TH.day.hemiSky.clone().multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]);
      m.lookAt(look[0], look[1], look[2]);
      envScene.add(m);
    };
    panel(16, 16, [0, 9.6, 0], [0, 0, 0], 7);          // big soft top light
    panel(7, 11, [-11, 5, 4], [0, 2, 0], 4);           // one side panel
    panel(5, 8, [11, 4, -6], [0, 2, 0], 1.4);          // dim fill so nothing goes flat
    const pmrem = new THREE.PMREMGenerator(renderer);
    const rt = pmrem.fromScene(envScene, 0.04);
    scene.environment = rt.texture;                    // set BEFORE buildObjects, never nulled
    pmrem.dispose();
    envScene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  }

  // ---- lights (count and type never change) --------------------------------------------------------------
  // FIX-PLAN-R6 S2.2: hemi, sun and key also light layer 1 (the guide passes), so a guide camera sees the same light set
  // and hits the same programs. Nothing else in this file goes on layer 1.
  const hemi = new THREE.HemisphereLight(TH.day.hemiSky, TH.day.hemiGround, TH.day.hemiI);
  hemi.layers.enable(1);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(TH.day.sunColor, TH.day.sunI);
  sun.layers.enable(1);
  sun.position.set(CENTER[0] - 6, CENTER[1] + 11, CENTER[2] + 7);
  sun.target.position.set(CENTER[0], CENTER[1], CENTER[2]);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 6;           // FIX-PLAN-R3 S2.6 m1 (was 4). NB: three's PCFSoftShadowMap path ignores radius for a
                                   // directional light; the softness comes from shadowOpacity .26. Set per plan, inert.
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  {
    // fit the ortho shadow camera to the day floor: world x -6..8, z -16..5, y 0..3. It covers every wall at
    // the hero spacing (z 0 .. -10), the people in front of wall 01 (to z +1.9), and the corridor lanes at
    // x 2.05 / 2.45 (z +2.2 .. -11.2), so every figure's sun shadow lands on the catcher.
    const cam = sun.shadow.camera;
    const probe = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    probe.position.copy(sun.position);
    probe.lookAt(sun.target.position);
    probe.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const x of [-6, 8]) for (const y of [0, 3]) for (const z of [-16, 5]) {
      v.set(x, y, z).applyMatrix4(probe.matrixWorldInverse);
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x);
      y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
      z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z);
    }
    cam.left = x0 - 1; cam.right = x1 + 1; cam.bottom = y0 - 1; cam.top = y1 + 1;
    cam.near = Math.max(0.1, -z1 - 2); cam.far = -z0 + 2;
    cam.updateProjectionMatrix();
  }

  const key = new THREE.DirectionalLight(TH.night.keyColor, 0);
  key.layers.enable(1);
  key.position.set(CENTER[0] - 4, CENTER[1] + 8, CENTER[2] + 6);
  key.target.position.set(CENTER[0], CENTER[1], CENTER[2]);
  scene.add(key, key.target);

  // ---- ground: traces + shadow catcher ---------------------------------------------------------------------
  const traceMat = new THREE.MeshBasicMaterial({
    color: TH.day.traceColor, transparent: true, opacity: TH.day.traceAlpha,
    toneMapped: false, depthWrite: false, fog: false, vertexColors: true, side: THREE.DoubleSide,
  });
  // FIX-PLAN-R1 S12 m3: the copy column mask, born in this form (one program, its own cache key)
  const traceU = { uMaskX: { value: 0 }, uMaskOn: { value: 0 }, uMaskPR: { value: 1 } };
  traceMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, traceU);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uMaskX;\nuniform float uMaskOn;\nuniform float uMaskPR;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.a *= mix(1.0, smoothstep(uMaskX - ${TRACE_MASK_W.toFixed(1)} * uMaskPR, uMaskX, gl_FragCoord.x), uMaskOn);`);
  };
  traceMat.customProgramCacheKey = () => 'lens-trace';
  const traces = new THREE.Mesh(buildTraceGeometry(), traceMat);
  traces.position.y = 0.001;
  traces.renderOrder = -10;
  traces.frustumCulled = false;
  scene.add(traces);

  const catcherMat = new THREE.ShadowMaterial({ color: TH.day.shadowColor, transparent: true, opacity: TH.day.shadowOpacity, depthWrite: false });
  const catcherGeo = new THREE.PlaneGeometry(60, 60);
  catcherGeo.rotateX(-Math.PI / 2);
  const catcher = new THREE.Mesh(catcherGeo, catcherMat);
  catcher.position.set(CENTER[0], 0, CENTER[2]);
  catcher.receiveShadow = true;
  catcher.renderOrder = -9;
  catcher.frustumCulled = false;
  scene.add(catcher);

  // ---- background and grain quads --------------------------------------------------------------------------
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const uRes = { value: new THREE.Vector2(1, 1) };

  const bgMat = new THREE.ShaderMaterial({
    vertexShader: BG_VERT, fragmentShader: BG_FRAG,
    uniforms: {
      uResolution: uRes,
      uBase: { value: new THREE.Color().copy(TH.day.bg) },
      uCool: { value: new THREE.Color().copy(TH.day.bloomCool) },
      uWarm: { value: new THREE.Color().copy(TH.day.bloomWarm) },
      uAlpha: { value: TH.day.bloomAlpha },
      uVeil: { value: 1 },
    },
    // FIX-PLAN-R6 S1.3: born transparent (its program key never changes). At uVeil 1 over the cleared buffer the
    // blend (src.a, 1 - src.a) writes the source exactly, so the ground is identical to the opaque one.
    transparent: true,
    depthTest: false, depthWrite: false, toneMapped: false, fog: false,
  });
  const bgScene = new THREE.Scene();
  const bgMesh = new THREE.Mesh(quadGeo, bgMat);
  bgMesh.frustumCulled = false;
  bgScene.add(bgMesh);

  const grainMat = new THREE.ShaderMaterial({
    vertexShader: BG_VERT, fragmentShader: GRAIN_FRAG,
    uniforms: {
      uResolution: uRes,
      uSeed: { value: 0 },
      uGrain: { value: TH.day.grainAmp },
      uVignette: { value: TH.day.vignette },
      uVigColor: { value: new THREE.Color().copy(TH.day.vignetteColor) },
      uSeamColor: { value: new THREE.Color().copy(TH.day.seam) },
      uSeamY: { value: -1000 },
      uSeamA: { value: 0 },
    },
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false,
  });
  const grainScene = new THREE.Scene();
  const grainMesh = new THREE.Mesh(quadGeo, grainMat);
  grainMesh.frustumCulled = false;
  grainScene.add(grainMesh);

  // ---- objects (env is already set) -------------------------------------------------------------------------
  // The extra keys keep a build-1 objects.js working; the REWORK-01 one imports WALL/paneZ itself and ignores them.
  // FIX-PLAN-R5 S3: the thread shares the traces' copy-column mask (by reference), so the floor line never runs under the hero copy
  const objects = buildObjects(scene, { THEMES, PANE_Y: WALL.YC, paneZ, paneFrac, maskU: traceU, maskW: TRACE_MASK_W });

  // ---- cast: guarded dynamic import, built before the faces. Any throw hides the cast; the page lives on. ----
  let castMod = null;
  try { castMod = await import('./cast.js'); } catch (e) { castMod = null; }
  let cast = null;
  // FIX-PLAN-R1 S3: step-and-scale fades, no alpha-to-coverage, so no msaa path
  if (castMod && castMod.buildCast) { try { cast = castMod.buildCast(scene, { THEMES }); } catch (e) { cast = null; } }
  let castOK = !!cast;
  const castFail = () => {
    castOK = false;
    try { if (cast && cast.root) cast.root.visible = false; } catch (e) { /* nothing left to hide */ }
  };
  // the floor's event clock for wall i at scene time ts (REWORK-01-DIRECTOR §6.2); null without a cast
  const castBeat = (i, ts) => {
    if (!castOK) return null;
    try { return cast.beat(i, ts); } catch (e) { castFail(); return null; }
  };
  // day canvases and the ghost: the reduced (STILL) beat, straight from the module
  const stillBeat = (i) => {
    try { return castMod && castMod.beat ? castMod.beat(i, 0, true) : null; } catch (e) { return null; }
  };

  // ---- faces: dynamic import so a missing or broken faces team never breaks the stage -----------------------
  const FACES = await import('./faces/index.js').then((m) => m.default).catch(() => []);
  // the faces' event clock (FIX-PLAN-R2 S2): guarded like the cast. Without SHIFT/setShift the wall-06 lead is a no-op.
  let beatMod = null;
  try { beatMod = await import('./faces/beat.js'); } catch (e) { beatMod = null; }
  const shift6OK = !!(beatMod && beatMod.SHIFT && beatMod.SHIFT.length > 5 && typeof beatMod.setShift === 'function'
    && typeof beatMod.sceneTime === 'function' && beatMod.SCENE_T && beatMod.SCENE_T[5] > 0);
  const face = (i) => (Array.isArray(FACES) && FACES[i]) || null;
  const broken = new Array(N).fill(false);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const mkTex = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  };
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  const nightCv = [], dayCv = [], ghostCv = [], nightCtx = [], dayCtx = [], ghostCtx = [], nightTex = [], dayTex = [];
  for (let i = 0; i < N; i++) {
    nightCv.push(mkCanvas(NIGHT_W, NIGHT_H)); nightCtx.push(nightCv[i].getContext('2d'));
    dayCv.push(mkCanvas(DAY_W, DAY_H)); dayCtx.push(dayCv[i].getContext('2d'));
    ghostCv.push(mkCanvas(DAY_W, DAY_H)); ghostCtx.push(ghostCv[i].getContext('2d'));
    nightTex.push(mkTex(nightCv[i]));
    dayTex.push(mkTex(dayCv[i]));
  }
  const scratchCv = mkCanvas(NIGHT_W, NIGHT_H);
  const scratchCtx = scratchCv.getContext('2d');

  // plain glass tint for a face that is missing or threw
  const fillTint = (ctx, w, h, theme) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = rgba(TH[theme].glassColor, theme === 'day' ? 0.18 : 0.06);   // FIX-PLAN-R2 S4: a white night glass must not paint a slab
    ctx.fillRect(0, 0, w, h);
  };

  // safe draw: returns false (and marks the face broken) when it throws. `beat` is the floor's event clock
  // (null lets the faces' wrapFace fall back to its own beatAt with the same numbers).
  // lod (FIX-PLAN-R3 §0.3.1, S7.3): the day canvases of walls 04-06 (i 3..5) draw as notes in haze, no glyphs; night never
  const drawOpts = { progress: 1, time: 0, theme: 'night', beat: null, lod: false };   // reused: faces read it synchronously
  const safeDraw = (i, ctx, w, h, theme, progress, time, beat) => {
    const f = face(i);
    if (!f || broken[i]) { fillTint(ctx, w, h, theme); return false; }
    try {
      drawOpts.progress = progress; drawOpts.time = time; drawOpts.theme = theme; drawOpts.beat = beat || null;
      drawOpts.lod = theme === 'day' && i >= 3;
      f.draw(ctx, w, h, drawOpts);
      return true;
    } catch (e) {
      broken[i] = true;
      fillTint(ctx, w, h, theme);
      return false;
    }
  };

  // fonts first (faces measure text); never block the boot for long
  try {
    const fonts = ['500 32px "Geist Mono"', '400 32px "Geist Mono"', '600 64px "Instrument Sans"', '400 32px Geist', '500 32px Geist'];
    await Promise.race([
      Promise.all(fonts.map((f) => document.fonts.load(f))).catch(() => {}),
      new Promise((res) => setTimeout(res, 2500)),
    ]);
  } catch (e) { /* no FontFaceSet: draw with fallbacks */ }

  // day faces: one per task, drawn once at progress 1 on the 1024 canvas
  for (let i = 0; i < N; i++) {
    safeDraw(i, dayCtx[i], DAY_W, DAY_H, 'day', 1, 0, stillBeat(i));
    dayTex[i].needsUpdate = true;
    await nextFrame();
  }
  // night canvases start at progress 0 (glass and header hairline), or complete when reduced
  for (let i = 0; i < N; i++) {
    safeDraw(i, nightCtx[i], NIGHT_W, NIGHT_H, 'night', reduced ? 1 : 0, 0, reduced ? stillBeat(i) : castBeat(i, 0));
    nightTex[i].needsUpdate = true;
    if (i < N - 1) await nextFrame();
  }

  // ---- build / redraw / ghost bookkeeping -----------------------------------------------------------------------
  const built = new Array(N).fill(!!reduced);
  const building = new Array(N).fill(false);
  const buildT = new Array(N).fill(0);
  const lastDraw = new Array(N).fill(-10);
  const lastBeatN = new Array(N).fill(-1);    // beat.n the wall's canvas was last drawn with
  const drawFrame = new Array(N).fill(-1);    // frame number of each wall's last redraw (debug)
  const dirty = new Array(N).fill(false);
  const ghostReady = new Array(N).fill(false);
  let ghostNext = 0;
  let rr = 0;
  let resolveTextures;
  const texturesReady = new Promise((res) => { resolveTextures = res; });
  if (reduced || !Array.isArray(FACES) || FACES.length === 0) { ghostNext = N; resolveTextures(); }

  const startBuild = (i) => { if (!built[i] && !building[i]) { building[i] = true; buildT[i] = 0; dirty[i] = false; } };

  // compose one night canvas: face at `p`, plus the ghost (whole face, faint) behind it until built
  function drawNight(i, p, time, beat) {
    const ctx = nightCtx[i];
    const ok = safeDraw(i, ctx, NIGHT_W, NIGHT_H, 'night', p, time, beat);
    if (ok && !reduced && ghostReady[i] && p < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.globalAlpha = GHOST_G * (1 - p);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(ghostCv[i], 0, 0, NIGHT_W, NIGHT_H);
      ctx.restore();
    }
    nightTex[i].needsUpdate = true;
  }

  function buildGhost(i) {
    const ok = safeDraw(i, scratchCtx, NIGHT_W, NIGHT_H, 'night', 1, 0, stillBeat(i));
    if (ok) {
      const g = ghostCtx[i];
      g.clearRect(0, 0, DAY_W, DAY_H);
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(scratchCv, 0, 0, DAY_W, DAY_H);
      ghostReady[i] = true;
      if (!built[i]) dirty[i] = true;   // recompose the still-unbuilt pane with its ghost
    }
  }

  // ---- runtime state ------------------------------------------------------------------------------------------------
  const size = new THREE.Vector2(1, 1);       // css px
  let pr = 1;
  const pointerT = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  let introStart = -1;
  let introPending = false;
  let ready = false;
  let resolveCanvas;
  const canvasReady = new Promise((res) => { resolveCanvas = res; });
  const presence = new Array(N).fill(1);
  const castPres = new Array(N).fill(1);
  let wHold = 0;            // FIX-PLAN-R5 S7.4: the held wall's width at a tour hold, css px (0 = no gate)
  const deckL = new Float32Array(N), deckR = new Float32Array(N);   // each wall's distance inside the left / right edge in the pos-8 deck, css px
  let holdStale = true;     // re-measured on the next frame after a resize or a fit change
  const bright = new Array(N).fill(1);
  // shared by objects and cast. navPx / viewH (FIX-PLAN-R3 S1.4): objects.js projects the crossed face's top edge
  // against the nav; viewH is the css viewport height (size.y), kept current by resize().
  // FIX-PLAN-R4 S5: viewW is the canvas css width; objects.js must not derive it from camera.aspect (= W / Hs, the fit frame)
  const upOpts = { reduced: !!reduced, introT: 1, presence, bright, camera, navPx: 64, viewH: 1, viewW: 1 };
  // scene clock: null = the frame clock; a finite number freezes every scene at that time (debug, shots)
  let clockOverride = null;
  let lastTs = 0;
  let tsFrame = -1;       // frame number at which the scene clock last changed value
  let frameNo = 0;

  const focus = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  // a neutral first state until main.js calls setState (K0 of REWORK-01-DIRECTOR §3.1)
  const defaultState = {
    camera: { focus: [0, 1.2, -4], radius: 6.4, az: 26, el: 16, fov: 32, fovM: 44, screen: K0_DESK, fog: K0_FOG },
    spacing: 2.0,
    panes: Array.from({ length: N }, () => ({ opacity: 1, yaw: 0, face: 0.7, flare: 0 })),
    active: -1, buildTrigger: -1,
    thread: { head: 1, intensity: 0.55, base: 1, near: 0, clear: 0 },
    cast: { traffic: 1 },
    flash: 0, vignette: 0.12, night: 0,
    rail: ['ahead', 'ahead', 'ahead', 'ahead', 'ahead', 'ahead'], listLive: -1,
  };
  let state = defaultState;
  let cutIn = size.y;   // css px; refreshed on resize
  let traceK = 1;       // portrait: the near traces are huge on screen, keep them quieter
  let cutSet = false;
  let flashNow = 0;
  let lastCutS = 0;
  // wall-06 clock shift (FIX-PLAN-R2 S2)
  let arm6 = false;
  let prevPos = -1;
  let posVel = 0;           // smoothed pos velocity, pos per second
  let shift6N = 0;          // shifts applied (debug)
  let shift6Last = 0;       // the last shift amount, s (debug)
  let lead6Last = 0;        // the last lead used, s (debug)
  let lead6Vel = LEAD6_VEL; // probes may compare the fixed and the velocity lead (debug.lead6Vel)
  // FIX-PLAN-R6 S1: the veil (main.js setVeil, 0 = the stage as before, 1 = the plain night ground) and the off path
  let veilIn = 0;           // as set by main.js
  let veilLast = 0;         // the V the last frame used (debug.veil)
  let offLast = false;      // the last frame took the off path (debug.off)

  // ---- fit frame (FIX-PLAN-R4 S5: fit to the small viewport, draw to the large) ----------------------------------------------
  // The canvas box is the large viewport (lvh, L css px tall). The camera is fitted to the fit frame W x Hs, Hs = the small
  // viewport height (main.js setFit, from the svh probe), and the frustum runs on past the fit frame's bottom edge to L. So
  // when a phone's toolbar hides or shows, nothing moves or scales: the hidden strip simply shows more floor. On desktop and
  // headless svh = lvh, so Hs = L and every fit is the one before S5.
  let fitReq = Number.isFinite(fitH) && fitH > 0 ? fitH : 0;   // css px; 0 = unset (Hs = L)
  const fitHs = (L) => (fitReq > 0 && fitReq < L ? fitReq : L);
  // the fit-dependent mirrors: the portrait test works on the fit frame
  function applyFit() {
    const Hs = fitHs(size.y);
    const portrait = size.x < Hs;
    traceK = portrait ? 0.65 : 1;
    defaultState.camera.screen = portrait ? K0_MOB : K0_DESK;   // K0 mirror (FIX-PLAN-R1 S11 M4)
    holdStale = true;
  }

  // ---- resize -----------------------------------------------------------------------------------------------------------
  // FIX-PLAN-R4 S5.3: sized from the canvas box (the lvh box site.css gives #stage), not from window.inner*; a no-op when
  // neither the box nor the pixel ratio changed, so a toolbar resize never touches the drawing buffer.
  let lastW = -1, lastH = -1, lastPR = -1;
  function resize() {
    const w = Math.max(1, Math.floor(canvas.clientWidth || window.innerWidth));
    const h = Math.max(1, Math.floor(canvas.clientHeight || window.innerHeight));
    const p = Math.min(window.devicePixelRatio || 1, PLANE_MAX_PR);
    if (w === lastW && h === lastH && p === lastPR) return;
    lastW = w; lastH = h; lastPR = p;
    pr = p;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    renderer.getSize(size);
    uRes.value.set(size.x * pr, size.y * pr);
    traceU.uMaskX.value = TRACE_MASK_X * size.x * pr;
    traceU.uMaskPR.value = pr;
    upOpts.viewH = size.y;
    upOpts.viewW = size.x;
    applyFit();
    if (!cutSet) cutIn = size.y;
  }
  resize();

  // ---- theme (cheap writes only) ------------------------------------------------------------------------------------------
  function applyTheme(name) {
    const T = TH[name];
    hemi.color.copy(T.hemiSky); hemi.groundColor.copy(T.hemiGround); hemi.intensity = T.hemiI;
    sun.color.copy(T.sunColor); sun.intensity = T.sunI;
    key.color.copy(T.keyColor); key.intensity = T.keyI;
    key.position.set(CENTER[0] + T.keyPos[0], CENTER[1] + T.keyPos[1], CENTER[2] + T.keyPos[2]);
    scene.fog.color.copy(T.fog);
    scene.environmentIntensity = T.envI;
    renderer.setClearColor(T.bg, 1);

    const bu = bgMat.uniforms;
    bu.uBase.value.copy(T.bg); bu.uCool.value.copy(T.bloomCool); bu.uWarm.value.copy(T.bloomWarm); bu.uAlpha.value = T.bloomAlpha;
    const gu = grainMat.uniforms;
    gu.uGrain.value = T.grainAmp; gu.uVignette.value = T.vignette; gu.uVigColor.value.copy(T.vignetteColor);
    gu.uSeamColor.value.copy(T.seam);

    traceMat.color.copy(T.traceColor); traceMat.opacity = T.traceAlpha * traceK;
    catcherMat.color.copy(T.shadowColor); catcherMat.opacity = T.shadowOpacity;
    catcher.visible = T.shadowOpacity > 0;

    const useDay = name === 'day';
    for (let i = 0; i < N; i++) {
      const p = objects.panes[i];
      const m = p && p.faceMesh && p.faceMesh.material;
      if (m) m.map = useDay ? dayTex[i] : nightTex[i];
    }
    objects.applyTheme(name);
    if (castOK) { try { cast.applyTheme(name); } catch (e) { castFail(); } }
  }

  // ---- the deck's vertical span on screen, relative to the placement sy it was fitted with (FIX-PLAN-R2 S10) ----------
  // Writes deckA / deckB (fractions of the height, top < bottom). Allocation-free; the camera must be fitted first.
  let deckA = 0, deckB = 0;
  let deckK = 1;          // L / Hs: canvas-height fractions -> fit-height fractions (1 when Hs = L)
  const spanPt = (x, y, z) => {
    tmp.set(x, y, z).project(camera);
    if (tmp.z > 1) return;                                // behind the lens
    const f = (1 - tmp.y) * 0.5 * deckK;                  // a fraction of the fit height Hs (FIX-PLAN-R4 S5.4)
    if (f < deckA) deckA = f;
    if (f > deckB) deckB = f;
  };
  function deckSpan(spacing, sy) {
    deckA = Infinity; deckB = -Infinity;
    const hw = WALL.W / 2;
    for (let i = 0; i < N; i++) {
      const z = paneZ(i, spacing);
      spanPt(-hw, WALL.Y1, z); spanPt(hw, WALL.Y1, z); spanPt(-hw, WALL.Y0, z); spanPt(hw, WALL.Y0, z);
    }
    if (deckA > deckB) { deckA = 0; deckB = 0; return; }
    deckA -= sy; deckB -= sy;
  }

  // ---- FIX-PLAN-R5 S7.4: a wall's projected x-extent (css px, into spanX0 / spanX1) under the camera as fitted now, from
  // the same 4 corners as debug.paneRect, without allocation. Returns the width; Infinity (and an extent over the whole
  // frame) when a corner is behind the lens or before the near plane: such a wall is at least as wide as the frame.
  let spanX0 = 0, spanX1 = 0;
  function wallWidth(i, spacing) {
    const z = paneZ(i, spacing);
    spanX0 = Infinity; spanX1 = -Infinity;
    for (let c = 0; c < 4; c++) {
      rectPt.set(c & 1 ? WALL.W / 2 : -WALL.W / 2, c & 2 ? WALL.Y1 : WALL.Y0, z).project(camera);
      if (rectPt.z > 1 || rectPt.z < -1) { spanX0 = -Infinity; spanX1 = Infinity; return Infinity; }
      const px = (rectPt.x * 0.5 + 0.5) * size.x;
      if (px < spanX0) spanX0 = px;
      if (px > spanX1) spanX1 = px;
    }
    return spanX1 - spanX0;
  }
  // the held width: wall 05 with the camera fitted to the pos-7 hold, and each wall's edge distance in the pos-8 deck
  // (pointer parallax off). Runs once per resize; frame() refits right after.
  function measureHold(W, Hs, L) {
    holdStale = false;
    wHold = 0;
    const px = pointer.x, py = pointer.y;
    pointer.x = 0; pointer.y = 0;
    try {
      const hs = stateAt(EXIT_P, W / Hs);
      fitCamera(hs.camera, W, Hs, undefined, 0, L);
      const w = wallWidth(EXIT_HOLD, hs.spacing);
      const ds = stateAt(EXIT_R1, W / Hs);
      fitCamera(ds.camera, W, Hs, undefined, 0, L);
      for (let i = 0; i < N; i++) { wallWidth(i, ds.spacing); deckL[i] = spanX0; deckR[i] = W - spanX1; }
      wHold = Number.isFinite(w) && w > 0 ? w : 0;
    } catch (e) { wHold = 0; }   // no hold width: no gate (the walls come back on their opacity alone)
    pointer.x = px; pointer.y = py;
  }

  // ---- camera fit (DN 1) --------------------------------------------------------------------------------------------------------
  // screenY: the vertical screen placement to use (portrait cut blend, FIX-PLAN-R1 S11); cs.screen[1] when omitted.
  // wCut: the portrait cut weight (0 on landscape); it tilts the camera down by CUT_EL deg (FIX-PLAN-R2 S10).
  // FIX-PLAN-R4 S5.4: W x H is the fit frame (H = Hs); L is the canvas css height the view renders (>= H). The fit is
  // made on W x H exactly as before, and the view offset extends the frustum down past the fit frame to L.
  function fitCamera(cs, W, H, screenY, wCut = 0, L = H) {
    const aspect = W / H;
    const sy = screenY === undefined ? cs.screen[1] : screenY;
    const az = (cs.az + PARALLAX_AZ * pointer.x) * DEG;
    const el = (cs.el + PARALLAX_EL * pointer.y + (aspect < 1 ? CUT_EL * wCut : 0)) * DEG;
    let d, Tv;
    if (aspect >= 1) {
      const t = Math.tan(cs.fov * DEG / 2);
      d = cs.radius / (cs.screen[2] * t);
      Tv = aspect >= 1.6 ? t : t * 1.6 / aspect;
    } else {
      const t = Math.tan(cs.fovM * DEG / 2);
      d = cs.radius / (cs.screen[2] * t);
      // director R2: portrait fits the width, which is right for phones (aspect ~.46). On a portrait tablet
      // (768x1024, aspect .75) the same fit made the 2.1-tall walls run up under the nav at every hold. Past
      // aspect .5 the frame stops growing the scene, so the vertical share stays what a phone shows.
      Tv = t / Math.min(aspect, 0.5);
    }
    camera.fov = 2 * Math.atan(Tv) / DEG;
    camera.aspect = aspect;
    focus.set(cs.focus[0], cs.focus[1], cs.focus[2]);
    const ce = Math.cos(el);
    camera.position.set(focus.x + d * Math.sin(az) * ce, focus.y + d * Math.sin(el), focus.z + d * Math.cos(az) * ce);
    camera.lookAt(focus);
    camera.setViewOffset(W, H, (0.5 - cs.screen[0]) * W, (0.5 - sy) * H, W, L);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    return d;
  }

  // ---- one pass of the dual render ------------------------------------------------------------------------------------------------
  // veil (FIX-PLAN-R6 S1.3): > 0 draws the ground over the rendered stage at that alpha, before the grain
  function pass(name, sy, sh, W, H, dist, fogFar, seamY, seamA, seamOn, veil) {
    renderer.setViewport(0, 0, W, H);
    renderer.setScissor(0, sy, W, sh);
    applyTheme(name);
    scene.fog.near = dist + state.camera.fog[0];
    scene.fog.far = dist + fogFar;
    grainMat.uniforms.uSeamY.value = seamOn ? seamY : -1000;
    grainMat.uniforms.uSeamA.value = seamOn ? seamA : 0;
    renderer.clear(true, true, false);
    renderer.render(bgScene, ortho);
    renderer.render(scene, camera);
    if (veil > 0) {
      bgMat.uniforms.uVeil.value = veil;
      renderer.render(bgScene, ortho);
      bgMat.uniforms.uVeil.value = 1;
    }
    renderer.render(grainScene, ortho);
  }

  // ---- guides (FIX-PLAN-R6 S2.1): guarded dynamic import after the cast, like it. ?noguides=1, a failed import, a throw
  // or a cast without buildGuides all leave guides null: html.no-guides and nothing else changes.
  let guides = null;
  if (!new URLSearchParams(location.search).has('noguides')) {
    try {
      const gm = await import('./guides.js');
      guides = gm.createGuides({ THREE, renderer, scene, THEMES, TH, castMod, reduced, lights: { hemi, sun, key }, applyTheme });
    } catch (e) { guides = null; }
  }
  if (!guides) document.documentElement.classList.add('no-guides');
  const guidesFail = () => {
    guides = null;
    document.documentElement.classList.add('no-guides');
  };

  // ---- warm-up: compile every program and upload every texture before canvasReady --------------------------------------------------
  {
    const W = size.x, H = size.y;
    const d = fitCamera(defaultState.camera, W, fitHs(H), undefined, 0, H);
    const warmOpts = { reduced: false, introT: 1, presence, bright, camera, navPx: 64, viewH: H, viewW: W };
    objects.update(defaultState, 0, 0, warmOpts);
    // every cast program compiles here, so stage.programs() stays stable afterwards
    if (castOK) { try { cast.update(defaultState, 0, 0, warmOpts); } catch (e) { castFail(); } }
    try { await renderer.compileAsync(scene, camera); } catch (e) { renderer.compile(scene, camera); }
    renderer.setScissorTest(true);
    renderer.shadowMap.needsUpdate = true;
    // 1 px scissor: everything compiles and uploads, the canvas is barely touched
    pass('day', 0, 1, W, H, d, defaultState.camera.fog[1], 0, 0, false, 0);
    pass('night', 0, 1, W, H, d, defaultState.camera.fog[2], 0, 0, false, 0);
    // every guide renders once through a 1 px scissor too, so nothing compiles mid-scroll (FIX-PLAN-R6 S2.7)
    if (guides) { try { guides.warm(W, H); } catch (e) { guidesFail(); } }
    renderer.setScissorTest(false);
  }

  // ---- the frame loop ----------------------------------------------------------------------------------------------------------------------
  let busySkips = 0;      // live redraws skipped because the face was idle (debug)
  const faceBusy = (i, ts) => {
    const f = face(i);
    if (!f || typeof f.busy !== 'function') return true;
    let b = true;
    try { b = !!f.busy(castBeat(i, ts), reduced); } catch (e) { b = true; }
    if (!b) busySkips++;
    return b;
  };
  // t = the frame clock (builds, the 20 fps throttle); ts = the scene clock (face time and the floor's beat)
  function faceStep(t, ts, dt, S, nightVisible) {
    if (!reduced) {
      const bt = S.buildTrigger;
      if (bt >= 0 && bt < N) startBuild(bt);
      for (let i = 0; i < N; i++) if (S.panes[i].flare > 0.5) startBuild(i);
      // SHOWRUNNER 2026-10-02: a fast scroll (calm < .5) races past walls before their build plays, which left
      // half-drawn ghost faces gliding by. Any wall that shows while racing is marked built at once, drawn whole.
      if (Number.isFinite(S.calm) && S.calm < 0.5) {
        for (let i = 0; i < N; i++) {
          if (!built[i] && presence[i] > 0.02) { building[i] = false; built[i] = true; dirty[i] = true; }
        }
      }
    }
    for (let i = 0; i < N; i++) {
      if (building[i]) {
        buildT[i] += dt;
        if (buildT[i] >= BUILD_S) { building[i] = false; built[i] = true; dirty[i] = true; }
      }
    }
    let pick = -1;
    let pickP = 1;
    let pickBeat = null;
    if (nightVisible && !reduced) {
      // 1. the active wall's floor event: redraw on the SAME frame the card touches the glass / lands
      const a = S.active;
      if (a >= 0 && a < N && built[a] && presence[a] > 0.02 && !broken[a] && face(a) && face(a).live) {
        const b = castBeat(a, ts);
        if (b && b.n !== lastBeatN[a]) { pick = a; pickP = 1; pickBeat = b; }
      }
      // 2. a building wall at 30 fps (round robin), else one dirty wall
      if (pick < 0) for (let k = 1; k <= N; k++) {
        const i = (rr + k) % N;
        if (building[i] && presence[i] > 0.02 && t - lastDraw[i] >= 1 / 30) { pick = i; rr = i; pickP = clamp(buildT[i] / BUILD_S, 0, 1); break; }
      }
      if (pick < 0) {
        for (let i = 0; i < N; i++) {
          if (dirty[i] && presence[i] > 0.02) { pick = i; pickP = built[i] ? 1 : 0; break; }
        }
      }
      // 3. the active wall's live redraw at 20 fps, only while its face says something moves (FIX-PLAN-R4 S6, contract
      // 0.5.3: busy(beat, reduced)); a face without busy() keeps the old always-live behaviour. A busy() that throws
      // counts as busy, so a faulty export can never freeze a wall.
      if (pick < 0 && a >= 0 && a < N && built[a] && presence[a] > 0.02 && !broken[a] && face(a) && face(a).live && t - lastDraw[a] >= 1 / 20
        && faceBusy(a, ts)) {
        pick = a; pickP = 1;
      }
    } else if (nightVisible && reduced) {
      for (let i = 0; i < N; i++) if (dirty[i] && presence[i] > 0.02) { pick = i; pickP = 1; break; }
    }
    if (pick >= 0) {
      if (!pickBeat) pickBeat = reduced ? stillBeat(pick) : castBeat(pick, ts);
      const bn = pickBeat ? pickBeat.n : -1;
      drawNight(pick, pickP, ts, pickBeat);
      dirty[pick] = false;
      lastDraw[pick] = t;
      lastBeatN[pick] = bn;
      drawFrame[pick] = frameNo;
      return true;
    }
    return false;
  }

  function frame(t, dt) {
    if (document.hidden) return;
    dt = dt > 0.1 ? 0.1 : dt < 0 ? 0 : dt;
    const S = state;
    const W = size.x, H = size.y;      // H: the canvas css height (L); every scissor and pass uses it
    const Hs = fitHs(H);               // the fit height (FIX-PLAN-R4 S5.4): the portrait test, the cut maths and the fit
    deckK = H / Hs;
    frameNo++;
    // scene clock: drives the walls, the people, the beat and the face time. The frame clock t still drives
    // the builds (dt), the grain seed, the pointer and the intro.
    const ts = clockOverride === null ? t : clockOverride;
    if (ts !== lastTs) tsFrame = frameNo;
    lastTs = ts;
    const V = veilIn;
    veilLast = V;

    // FIX-PLAN-R6 S1.4, the off frame: the proof sections are on screen and the veil is whole, so nothing of the stage
    // shows. Skip every update (presence, bright and the build timers freeze where they are) and draw one ground pass:
    // the night ground and the grain with no seam, then the guides over it.
    if (V >= 0.999) {
      offLast = true;
      renderer.setScissorTest(true);
      renderer.setViewport(0, 0, W, H);
      renderer.setScissor(0, 0, W, H);
      applyTheme('night');
      grainMat.uniforms.uSeamY.value = -1000;
      grainMat.uniforms.uSeamA.value = 0;
      grainMat.uniforms.uSeed.value = reduced ? 0 : Math.floor(t * 24) % 997;
      renderer.clear(true, true, false);
      bgMat.uniforms.uVeil.value = 1;
      renderer.render(bgScene, ortho);
      renderer.render(grainScene, ortho);
      if (guides) { try { guides.frame(t, dt, W, H); } catch (e) { guidesFail(); } }
      renderer.setScissorTest(false);
      if (!ready) { ready = true; resolveCanvas(); }
      return;
    }
    offLast = false;

    if (holdStale) measureHold(W, Hs, H);   // FIX-PLAN-R5 S7.4 (the fit below overwrites the camera)

    // FIX-PLAN-R2 S2: wall 06's clock shift, before any cast or face update reads the clock. Forward only, never
    // under reduced motion, never while the scene clock is frozen (a frozen clock is a deterministic shot).
    const pos = Number.isFinite(S.pos) ? S.pos : -1;
    if (pos >= 0 && prevPos >= 0 && dt > 0) {
      const k = 1 - Math.exp(-dt / VEL_TAU);
      posVel += ((pos - prevPos) / dt - posVel) * k;
    } else posVel = 0;
    if (pos < ARM6_RESET) arm6 = false;
    if (!arm6 && prevPos >= 0 && prevPos < ARM6_AT && pos >= ARM6_AT) {
      arm6 = true;
      if (shift6OK && !reduced && clockOverride === null) {
        const lead = lead6Vel ? (posVel > 1e-3 ? clamp((HOLD6 - pos) / posVel + LEAD6_PAD, LEAD6_MIN, LEAD6_MAX) : LEAD6_MAX) : LEAD6;
        const T6 = beatMod.SCENE_T[5];
        const target = DECIDE6 - lead;
        const tl = beatMod.sceneTime(5, ts);
        lead6Last = lead;
        if (tl < target - SKIP6_LO || tl > target + SKIP6_HI) {
          const add = (((target - tl) % T6) + T6) % T6;
          beatMod.setShift(5, beatMod.SHIFT[5] + add);
          shift6N++; shift6Last = add;
        } else shift6Last = 0;
      }
    }
    prevPos = pos;

    // pointer damping (zero when reduced)
    if (reduced) { pointer.x = 0; pointer.y = 0; }
    else {
      const k = 1 - Math.exp(-4 * dt);
      pointer.x += (pointerT.x - pointer.x) * k;
      pointer.y += (pointerT.y - pointer.y) * k;
    }

    // intro clock
    if (introPending) { introStart = t; introPending = false; }
    let introT = 1;
    if (!reduced && !skipIntro) introT = introStart < 0 ? 0 : clamp((t - introStart) / 1.6, 0, 1);

    // cut, snapped to a device pixel so both scissors abut exactly. Computed BEFORE the fit: on portrait the deck
    // rides the seam while the cut crosses the screen (FIX-PLAN-R1 S11 M3). Scratch numbers only.
    const cutS = Math.round(clamp(cutIn, 0, H) * pr) / pr;
    lastCutS = cutS;
    const nightVisible = cutS < H;
    let screenY = S.camera.screen[1];
    let wCut = 0;           // the portrait cut weight; 0 on landscape
    if (W < Hs) {
      // Director R3: under reduced motion pos (and so S.night) snaps to 0 or 1 while the seam still scrolls, which
      // left the deck parked below an empty day sky at cut .5. Reduced reads the weight from the seam itself.
      // FIX-PLAN-R2 S10: the normal run reads the seam too (max of the two). pos lags the seam early in the cut (pos .07
      // with the seam at .70 of the height), which left the framing half-applied while the deck sat low under the hero.
      const cutF = clamp(cutS / Hs, 0, 1);   // the seam as a fraction of the fit frame (below it = not yet on screen)
      const nt = reduced ? 1 - cutF : Math.max(S.night || 0, 1 - cutF);
      wCut = smoothstep(0.02, 0.12, nt) * (1 - smoothstep(0.80, 0.95, nt));
      // FIX-PLAN-R2 S10: a provisional fit gives the deck's span relative to screenY (the view offset moves the whole
      // frame, so the span does not depend on it); then the deck's centre goes to CUT_MID, keeping >= CUT_KEEP of it on
      // each side of the seam (CUT_KEEP_A above, CUT_KEEP_B below).
      if (wCut > 0) {
        const seam = cutS / Hs;
        fitCamera(S.camera, W, Hs, screenY, wCut, H);
        deckSpan(S.spacing, screenY);
        const h = deckB - deckA;
        if (h > 0) {
          const lo = seam - deckB + CUT_KEEP_B * h, hi = seam - deckA - CUT_KEEP_A * h;
          const want = CUT_MID - (deckA + deckB) / 2;
          const sy = lo <= hi ? clamp(want, lo, hi) : (lo + hi) / 2;
          screenY += (sy - screenY) * wCut;
        }
      }
    }
    // the copy column mask on the traces: landscape only, gone once night has most of the screen
    traceU.uMaskOn.value = (W >= Hs ? 1 : 0) * (1 - smoothstep(0.3, 0.8, S.night || 0));

    const dist = fitCamera(S.camera, W, Hs, screenY, wCut, H);

    // presence (DN 5), brightness, flash
    const camZ = camera.position.z, camX = camera.position.x, camY = camera.position.y;
    const inside = Math.abs(camX) < WALL.W / 2 && camY > WALL.Y0 && camY < WALL.Y1;
    let flash = 0;
    // FIX-PLAN-R5 S7.4: the pull-out's size and edge gate on walls 00..04 (released toward the Together deck)
    const exitRel = smoothstep(EXIT_R0, EXIT_R1, pos);
    const exitGate = pos >= EXIT_P && wHold > 0 && exitRel < 1;
    for (let i = 0; i < N; i++) {
      const s = camZ - paneZ(i, S.spacing);
      const op = S.panes[i].opacity;
      presence[i] = op * smoothstep(0.15, 1.4, s);
      if (exitGate && i < EXIT_HOLD && presence[i] > 0) {
        const gs = 1 - smoothstep(EXIT_G0, EXIT_G1, wallWidth(i, S.spacing) / wHold);   // also writes spanX0 / spanX1
        const em = EXIT_EDGE * W, loL = Math.min(0, deckL[i] - em), loR = Math.min(0, deckR[i] - em);
        const g = gs * smoothstep(loL, loL + em, spanX0) * smoothstep(loR, loR + em, W - spanX1);
        presence[i] *= g + (1 - g) * exitRel;
      }
      bright[i] = S.panes[i].face;
      if (inside) {
        const f = (1 - smoothstep(0, 0.35, Math.abs(s))) * op;
        if (f > flash) flash = f;
      }
    }
    flash = Math.max(S.flash, flash);
    flashNow = flash;
    renderer.toneMappingExposure = 1 + 0.18 * flash;   // FIX-PLAN-R5 S2: kept; it reads 0 in the long-lens tour

    upOpts.introT = introT;   // upOpts.camera is the camera fitted above: the cast's near fade reads it
    objects.update(S, ts, dt, upOpts);
    // SHOWRUNNER 2026-10-02: the crews read presence x calm (main.js), so they step off the walls while a fast scroll
    // races the tour and step back on when it settles; the walls and faces keep the raw presence.
    const calm = Number.isFinite(S.calm) ? S.calm : 1;
    for (let i = 0; i < N; i++) castPres[i] = presence[i] * calm;
    upOpts.presence = castPres;
    if (castOK) { try { cast.update(S, ts, dt, upOpts); } catch (e) { castFail(); } }
    upOpts.presence = presence;

    // one face redraw at most; otherwise one ghost build
    const drew = faceStep(t, ts, dt, S, nightVisible);
    if (!drew && ready && ghostNext < N && !reduced) {
      buildGhost(ghostNext);
      ghostNext++;
      if (ghostNext >= N) resolveTextures();
    }

    // dual render
    renderer.setScissorTest(true);
    if (cutS > 0) renderer.shadowMap.needsUpdate = true;
    grainMat.uniforms.uSeed.value = reduced ? 0 : Math.floor(t * 24) % 997;
    if (cutS > 0) pass('day', H - cutS, cutS, W, H, dist, S.camera.fog[1], 0, 0, false, V);
    // the seam starts on the scissor row: cutS * pr is an integer device row (cutS is snapped above)
    if (cutS < H) pass('night', 0, H - cutS, W, H, dist, S.camera.fog[2], Math.round(cutS * pr), TH.night.seamAlpha, cutS > 0, V);
    // the guides draw after the grain, so their faces stay crisp (FIX-PLAN-R6 S2.4); guides.frame restores what it touches
    if (guides) { try { guides.frame(t, dt, W, H); } catch (e) { guidesFail(); } }
    renderer.setScissorTest(false);

    if (!ready) { ready = true; resolveCanvas(); }
  }

  // ---- public API ----------------------------------------------------------------------------------------------------------------------------
  const rectPt = new THREE.Vector3();
  const stage = {
    setState(s, cutY) {
      state = s || defaultState;
      if (typeof cutY === 'number' && Number.isFinite(cutY)) { cutIn = cutY; cutSet = true; }
    },
    frame,
    resize,
    // FIX-PLAN-R4 S5.1: the fit height, css px (main.js passes the small viewport height, svh); 0 or null = the canvas height
    setFit(h) {
      const v = Number.isFinite(h) && h > 0 ? h : 0;
      if (v === fitReq) return;
      fitReq = v;
      applyFit();
    },
    intro() { if (!reduced && !skipIntro) { introPending = true; } },
    // FIX-PLAN-R6 S1.2: the veil, 0..1 (main.js, from #compare and #book); read by the next frame
    setVeil(v) { const n = Number(v); veilIn = Number.isFinite(n) ? clamp(n, 0, 1) : 0; },
    // FIX-PLAN-R6 S2.1: the guides' api (guides.js), null without guides or once they have failed
    get guides() { return guides ? guides.api : null; },
    setPointer(nx, ny) { pointerT.x = clamp(nx || 0, -1, 1); pointerT.y = clamp(ny || 0, -1, 1); },
    canvasReady,
    texturesReady,
    programs() { return renderer.info.programs ? renderer.info.programs.length : 0; },
    debug: {
      camera,
      // FIX-PLAN-R6: the last V a frame used, whether that frame took the off path, and the guides object itself
      get veil() { return veilLast; },
      get off() { return offLast; },
      get guides() { return guides; },
      paneRect(i) {
        const z = paneZ(i, state.spacing);
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const sx of [-WALL.W / 2, WALL.W / 2]) for (const sy of [WALL.Y0, WALL.Y1]) {
          rectPt.set(sx, sy, z).project(camera);
          const px = (rectPt.x * 0.5 + 0.5) * size.x;
          const py = (1 - (rectPt.y * 0.5 + 0.5)) * size.y;
          if (px < x0) x0 = px; if (px > x1) x1 = px;
          if (py < y0) y0 = py; if (py > y1) y1 = py;
        }
        return { x0, x1, y0, y1 };
      },
      get flash() { return flashNow; },
      // FIX-PLAN-R5 S7.4: each wall's presence as the last frame used it (a read-only copy; _dev/r9-glide.mjs)
      presence: () => presence.slice(),
      // the exit gate's held width, css px (0 = no gate)
      get wHold() { return wHold; },
      // scene clock override: null = live, a finite number = frozen at that time (main.js __lens.setClock)
      get clock() { return clockOverride; },
      set clock(v) { clockOverride = (v === null || v === undefined || !Number.isFinite(Number(v))) ? null : Number(v); },
      get ts() { return lastTs; },
      cast,
      get castOK() { return castOK; },
      beat(i) { return castOK ? castBeat(i, lastTs) : null; },
      // face redraw bookkeeping, for the clock-sync probe
      faces: () => ({ frameNo, tsFrame, busySkips, busyAPI: face(0) ? FACES.map((f) => !!(f && typeof f.busy === 'function')) : [], lastDraw: lastDraw.slice(), lastBeatN: lastBeatN.slice(), drawFrame: drawFrame.slice() }),
      get cutY() { return lastCutS; },
      // FIX-PLAN-R4 S5: the canvas css size and the fit height in use
      vp: () => ({ w: size.x, h: size.y, fit: fitHs(size.y), pr }),
      // the last measured deck span (FIX-PLAN-R2 S10), fractions of the height relative to the placement
      cutSpan: () => ({ a: deckA, b: deckB }),
      // wall-06 clock shift (FIX-PLAN-R2 S2)
      shift6: () => ({ ok: shift6OK, arm: arm6, n: shift6N, last: shift6Last, lead: lead6Last, vel: posVel,
        shift: shift6OK ? beatMod.SHIFT[5] : 0 }),
      get lead6Vel() { return lead6Vel; },
      set lead6Vel(v) { lead6Vel = !!v; },
      renderer,
      scene,
      traces,
      // the live, precomputed theme tables (probes tune numbers here, e.g. the FIX-PLAN-R1 S4 envI sweep)
      TH,
      built: () => built.slice(),
      ghosts: () => ghostReady.slice(),
      broken: () => broken.slice(),
    },
  };
  return stage;
}
