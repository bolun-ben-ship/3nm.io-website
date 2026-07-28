# zig.ai — Master Motion Spec (authoritative)

> Built from three sources, cross-checked:
> 1. **Source code** (exact) — custom GSAP `zig-gsap-source.js` + Webflow IX2 `zig-webflow-ix2.json` + hero `.lottie`.
> 2. **Video** `2026-07-27 21-44-25.mov` (74s) — 1fps map (`zig-sheets/`) + 10fps timing (`zig-timing/`).
> 3. **Live DOM** inspection.
> Generated 2026-07-28. This file supersedes `zig-motion-storyboard.md` for timing.

## CRITICAL: two kinds of motion — read this first

| Type | Timing source | Video reliable? |
|---|---|---|
| **Play-once** (fires on enter, fixed duration) | The code's `duration`/`ease` | Yes |
| **Scroll-scrubbed** (progress tied to scroll position) | No fixed duration — speed = how fast the user scrolls | **No** — video "timing" is just your scroll speed |

The two most eye-catching sections (stat circles, step wheel) are **scrubbed**. Their "duration" is meaningless — they advance as the user scrolls. Match the *scroll distance* (the ScrollTrigger `start`/`end`), not a seconds value.

---

## Motion stack

| Library | Role | File |
|---|---|---|
| Lottie (bodymovin) | Hero only | `lottie/hero-*.lottie` |
| GSAP + ScrollTrigger + SplitText | Hero playback control, text reveals, win-circles, step wheel, bg-color | `zig-gsap-source.js` |
| Lenis | Smooth-scroll inertia | script_11 |
| Splide | Testimonial slider | script_18 |
| Webflow IX2 | Native reveals: stat circles, nav, cards, marquees | `zig-webflow-ix2.json` (62 events, 20 action lists) |

---

## Section-by-section spec

### 1. Hero Lottie — "Close deals. Zig handles the rest."
- **File:** `hero-2500.lottie` → `animation.json`: **24fps, 192 frames, 8.0s, 2500×887, 74 layers, 6 PNG assets**.
- **Playback (script_12):** NOT a plain loop. GSAP scrubs the Lottie frame in 3 segments with 1s holds between:
  - Seg A: frame 0 → 25% (2.0s, linear)
  - hold 1s → Seg B: 25% → 65% (3.2s, linear)
  - hold 1s → Seg C: 65% → 100% (2.8s, linear) → `onComplete` restarts.
  - **Real cycle ≈ 10s** (8s motion + two 1s holds). Holds = the "read the card" pauses.
- **Content:** node graph; cards `Meeting completed / Follow-up drafted / CRM updated / Next step scheduled`; then `Zig did` (green) vs `You did` (black) `Closed the deal`.
- **Responsive:** 4 files swapped by breakpoint (2500/1280/820/420) — only the visible one plays.

### 2. Heading word-reveal (global pattern, script_13)
- `.animate-text_opacity`: SplitText by **words**, each word opacity **0.2 → 1**, `stagger 0.5`, **scrubbed** (`start top 60%`, `end bottom 40%`). Words brighten as the heading scrolls through.
- `.animate-block_appear`: **play-once** — `opacity 0→1, y 40→0, duration 1.2s, ease power4.out`, `start top 65%`.

### 3. Stat circles — "What changes when Zig runs" (60+ / 95% / 30% / 3x)
- **Scrubbed** (IX2 `a-16` / `a-20`, `SCROLLING_IN_VIEW`, smoothing 50–80). Per circle:
  - `TRANSFORM_SCALE 0.2 → 1` between **40%→50%** scroll progress
  - `STYLE_OPACITY` crossfade: 0 at 60% → 1 at 70% → dips 78% → 1 at 80% (the number/label swap)
  - text-color shift at 10–20%.
- **Video confirms:** circles scale up one-at-a-time and pulse as you scroll — not a timed sequence. (10fps sheet shows one big while others small, cycling.)

### 4. Gap circle — "The longer it runs, the wider the gap"
- **Play-once** (IX2 `a-23`): `STYLE_SIZE width 0 → 400` over **3500ms, ease outCubic**; `opacity 0→1` `dur 1000ms delay 1000ms`. Green circle grows to fill → wipes into the dark section.

### 5. Body background color transitions (script_16)
- ScrollTrigger `matchMedia ≥992px`. Body bg steps as sections cross center:
  - `.wins-animation-track` top center → **black**
  - `.steps-animation-track` top center → **green-500**
  - `.steps-section` bottom 20% → back to **gray-50**
- Instant swaps (onEnter), reversible (onLeaveBack). This is why the page recolors as you scroll.

### 6. Win circles (Venn) — "The rep closes. The leader has their back." (script_15)
- Dark section. Two circles (`.win-circle.is--left` green, `.is--right` #87bbd9) revealed via **clip-path circle + radial mask** once `illus` opacity ≥ 0.7.
- **SVG annotation lines** draw on tooltip reveal (opacity ≥ 0.5, ≥992px only):
  - line `stroke-dashoffset → 0`, **duration 0.5s, ease power2.out**, `stagger 0.15s`
  - dot `opacity → 1`, dur 0.2s, delay +0.45s
  - hide: dashoffset back, dur 0.3s ease power2.in; svg fades dur 0.3s delay 0.4s.
- MutationObservers watch inline opacity to trigger; full recompute on resize.

### 7. Step wheel — "Every part of the sale. Handled." (script_17)
- Green section. Cards `Research → Outreach → Meetings → Follow-Up → CRM Sync → Pipeline` sit on an invisible **wheel**; rotating the wheel slides each card horizontally through center.
- **Scrubbed:** `gsap.to(wheel, {rotation: totalRotation, ease:'none', scrollTrigger:{ trigger:'.steps-animation-wrapp', start:'50% top-=200', end:'bottom bottom-=400', scrub:true }})`. `totalRotation = min(180°, computed)`; angles start −35°, step 30° per card.
- Card icons also reveal via IX2 `a-18` (marquee x10→−100, scrubbed). **Video confirms** labels sweeping left as you scroll.

### 8. Timeline cards — "…better the longer it works for you"
- `.built-card` (IX2 `a-22`, play-once): `TRANSFORM_SCALE 0.95 → 1`, dur 500→300ms, `easeInOut`. Month 1 / 3 / 6 pop in on enter (scrollOffset 10%).

### 9. Pricing / feature cards (IX2 `a-24`, `a-9`, `a-7`)
- `.pricinng-card` / `.feature_component`: scale 0.95→1 easeInOut, opacity/scale-in on enter (`a-7`: scale 0→0.25→1 inOutQuad over ~1s, opacity 1 @ delay 1500, size grow 1000ms delay 1750 inOutCubic).

### 10. Testimonials — Splide (script_18)
- `.testim_slider`: `perPage 1, type 'loop', arrows, pagination, rewindSpeed 400, updateOnMove`. 6 slides.

### 11. Nav (IX2 `a-2`/`a-3`)
- Sticky nav hide/show: `TRANSFORM_MOVE y 0% ↔ y −100%`, **dur 300ms, ease inOutCubic**, on PAGE_SCROLL_UP/DOWN. Mobile navbar open/close = `a-10`/`a-11` display toggles.

### 12. Marquees
- `a` (logos/graph): `TRANSFORM_MOVE x −100% → 0%`, **dur 30000ms** loop. `a-32`: x −100%, **dur 10000ms** loop.

---

## Easing cheat-sheet (verbatim from source)
`power4.out` (block appear) · `power2.out`/`power2.in` (win lines) · `inOutCubic` (nav, size grow) · `inOutQuad` (feature scale) · `easeInOut` (card press) · `outCubic` (gap circle) · `ease:'none'` (all scrubbed + Lottie).

## Files produced
```
standalone-3nm-v2/references/zig ai analysis/
├── ZIG-MOTION-SPEC-MASTER.md   ← this file
├── zig-motion-storyboard.md    ← section narrative + timecodes
├── zig-gsap-source.js          ← exact custom GSAP (verbatim)
├── zig-webflow-ix2.json        ← raw Webflow interactions (62 events, 20 lists)
└── lottie/
    ├── hero-2500.lottie / 1280 / 420   ← source hero animations
    └── hero-2500-unpacked/animations/animation.json  ← 24fps 192f keyframes
references/
├── zig-sheets/     ← 1fps full-page map (3 sheets)
└── zig-timing/     ← 10fps timing (stat-circles, step-row)
```

## To rebuild
- **Hero:** load the `.lottie` with lottie-web; replicate the script_12 segmented scrub for the pauses. Don't just `loop:true` — you'll lose the holds.
- **Scroll sections:** copy the GSAP blocks + IX2 keyframes 1:1. The values above are exact.
- **Fonts/assets** are licensed to zig.ai — substitute.
