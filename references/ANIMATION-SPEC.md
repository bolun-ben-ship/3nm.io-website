# ANIMATION-SPEC.md — 3nm-v2 Landing Page · Motion Contract

> **The buildable motion contract.** Per-section triggers, exact params (duration, ease, stagger, ScrollTrigger start/end, Lottie segment plan), and the code reference for each. Numbers are cited from the MASTER spec rather than re-derived.
> **Companions:** site skeleton + slots → **SPEC.md** · visual identity → **DESIGN.md**. Section IDs 0–12 are the shared key (e.g. "layout: SPEC §Section 8 · colors: DESIGN §Section 8").
> **Extraction source of truth:** `standalone-3nm-v2/references/zig ai analysis/` — `ZIG-MOTION-SPEC-MASTER.md` (**MASTER**, authoritative), `zig-gsap-source.js` (verbatim GSAP), `zig-webflow-ix2.json` (raw Webflow IX2, 62 events / 20 action lists). Motion mimics [zig.ai](https://zig.ai); recolor per DESIGN.md.

---

## 0. THE CRITICAL RULE — play-once vs scroll-scrubbed (read first)

> Two kinds of motion. Get this wrong and the page feels wrong. (MASTER "CRITICAL: two kinds of motion".)

| Type | Timing driven by | How to build it | Video reliable? |
|---|---|---|---|
| **Play-once** | A fixed `duration` (seconds), fires on enter | `scrollTrigger:{ start, toggleActions:'play none none none' }` + `duration` | Yes |
| **Scroll-scrubbed** | The **scroll distance** — progress tied to scroll position, NOT seconds | `scrollTrigger:{ start, end, scrub:true }` — **no duration**; advances as the user scrolls, reverses on scroll-up | No — video "timing" is just scroll speed |
| **Loop** | Fixed infinite tween | `repeat:-1` (or Lottie/Splide loop config) | n/a |

**The two most eye-catching sections — stat circles (§Section 5) and step wheel (§Section 8) — are scrubbed.** Their "duration" is meaningless; match the ScrollTrigger `start`/`end` scroll window, not a seconds value. The heading word-reveal (`.animate-text_opacity`) is also scrubbed.

**Reduced-motion:** honor `prefers-reduced-motion` — disable Lenis, render scrubbed/entrance animations in their final state, show a static hero poster frame.

---

## 1. Motion stack

| Library | Role | Placeholder-build equivalent | File / block |
|---|---|---|---|
| **Lottie** (lottie-web / bodymovin) | Hero animation only | Placeholder `.lottie`; GSAP-driven frame scrub | MASTER §1; `zig-gsap-source.js` script_12 |
| **GSAP + ScrollTrigger + SplitText** | Hero scrub, heading reveals, win-circle line-draw, step wheel, bg-color | Core dependency | script_12/13/15/16/17 |
| **Lenis** | Smooth-scroll inertia | `new Lenis()` bound to `gsap.ticker` | script_11 |
| **Splide** | Testimonial slider | `perPage:1, type:'loop'` | script_18 |
| **Webflow IX2 (equivalent)** | Native scroll reveals: stat circles, nav, card scale-ins, marquees | Re-implement as GSAP ScrollTrigger tweens using the IX2 params below | `zig-webflow-ix2.json` |

**Lenis bind (script_11):** `const lenis = new Lenis(); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);`

**Licensing:** GSAP is free under its standard no-charge license; SplitText is free as of GSAP 3.13. Splide + Lenis are MIT. Motion libraries only — the hero `.lottie`, fonts, and assets are licensed to zig.ai and must be substituted (see SPEC §7).

---

## 2. Easing cheat-sheet (verbatim from MASTER / source)

| Ease | Where used |
|---|---|
| `power4.out` | Block appear (fade-up on enter) |
| `power2.out` / `power2.in` | Win-circle line draw / hide |
| `inOutCubic` | Nav hide/show, size-grow |
| `inOutQuad` | Feature-card scale |
| `easeInOut` | Card press (scale 0.95→1) |
| `outCubic` | Gap-circle grow |
| `ease:'none'` (linear) | **All scrubbed motion + the Lottie frame scrub** |

**Brand-motion note (DESIGN.md):** the brand prefers ease-out-quart/quint, no bounce. None of zig's eases bounce, so they are compatible — keep scrubbed sections linear (`ease:'none'`).

---

## 3. Global reveal patterns (reused across sections — MASTER §2, script_13)

- **`.animate-text_opacity`** (heading word-reveal, **scrubbed**): SplitText by words → `gsap.set(words, {opacity:0.2})` → each word `opacity 0.2 → 1`, `stagger 0.5`, `ease:'none'`, `scrollTrigger:{ start:'top 60%', end:'bottom 40%', scrub:true }`. Words brighten as the heading scrolls through. Used on: S3.1, S6.1, S7.2, S12.1 (and any `.animate-text_opacity` heading).
- **`.animate-block_appear`** (**play-once**): `gsap.from(el, { opacity:0, y:40, duration:1.2, ease:'power4.out', scrollTrigger:{ start:'top 65%', toggleActions:'play none none none' }})`. Used for Before/After rows and generic block entrances.
- **Nav hide/show** (IX2 `a-2`/`a-3`, play-once): `translateY 0% ↔ -100%`, `dur 300ms, ease inOutCubic`, on `PAGE_SCROLL_UP`/`PAGE_SCROLL_DOWN`.
- **Marquees** (IX2 `a` / `a-32`): `translateX -100% → 0%` looped; logo/graph `dur 30000ms`, fast `dur 10000ms`. Linear, infinite.

---

## 4. Global body background-color transitions (script_16, ≥992px only)

`ScrollTrigger.matchMedia('(min-width:992px)')` steps `body.style.backgroundColor` as sections cross center. Instant swaps (`onEnter`), reversible (`onLeaveBack`):

| Trigger | Start | onEnter → | onLeaveBack → |
|---|---|---|---|
| `.wins-animation-track` | `top center` | black (Section 7) | gray-50 |
| `.steps-animation-track` | `top center` | green-500 (Section 8) | black |
| `.steps-section` | `bottom 50%` | green-500 (section bg) | transparent |
| `.steps-section` | `bottom 20%` | gray-50 (Section 9) | green-500 |

`window.addEventListener('load', () => ScrollTrigger.refresh())`. **Recolor to brand** (see DESIGN.md): warm-paper base, brand-green flood, operator-black / `#15171a` dark interlude.

---

## 5. Section-by-section motion

> Reference: SPEC §Section N (layout) · DESIGN §Section N (color). Sections 0 and 11 have interaction-only motion; all others below.

### Section 0 — Global Nav — *play-once*
Sticky hide/show: `translateY 0% ↔ -100%`, `dur 300ms, ease inOutCubic`; hides on scroll-down, shows on scroll-up. Mobile menu = display toggle (IX2 `a-10`/`a-11`). **Code:** IX2 `a-2`/`a-3`; MASTER §11.

### Section 1 — Hero — *custom segmented loop (NOT a plain loop)*
Lottie: 24fps / 192 frames / 8.0s / 74 layers. GSAP scrubs the frame in **3 segments with two 1s holds** (script_12):
- Seg A: frame `0 → t*0.25` (2.0s, `ease:'none'`) · **hold 1s** (`delay:1`)
- Seg B: `t*0.25 → t*0.65` (3.2s, `ease:'none'`) · **hold 1s** (`delay:1`)
- Seg C: `t*0.65 → t` (2.8s, `ease:'none'`) → `onComplete: playLoop` (restarts)
- **Real cycle ≈ 10s** (8s motion + two 1s holds). Holds = "read the card" pauses — reproduce them; do **not** use `loop:true`.
- `segmentDuration(from,to) = ((to-from)/t) * 8`. `anim.goToAndStop(proxy.frame, true)` on each `onUpdate`.
- Swap 4 responsive files by breakpoint (2500 / 1280 / 820 / 420); only the visible one plays.
- On load: H1 line reveal (SplitText); CTAs fade in.
**Code:** MASTER §1; `zig-gsap-source.js` script_12.

### Section 2 — Before / After — *play-once*
Rows reveal on scroll via `.animate-block_appear`: `opacity 0→1, y 40→0, dur 1.2, ease power4.out, start 'top 65%'`, **staggered per row**. H2 word-reveal via `.animate-text_opacity` (scrubbed); one key word accent-colored. **Code:** MASTER §2; script_13.

### Section 3 — Statement + Trusted-by — *scrubbed + loop*
Statement = word-reveal (`.animate-text_opacity`, scrubbed). Logos = marquee (`translateX -100%→0, dur 30000ms`, linear infinite) or fade/slide-in stagger. **Code:** MASTER §2/§12; script_13; IX2 `a`.

### Section 4 — "Why different" Bento — *play-once + loop*
Cards scale-in on enter (IX2 `a-7`/`a-9`/`a-24`): `scale 0.95→1` (or `a-7`: `scale 0→0.25→1, inOutQuad ~1s`, opacity `1 @ delay 1500`, size-grow `1000ms delay 1750 inOutCubic`), play-once. Red card's phone badge = **continuous rotate/orbit loop** (infinite linear). **Code:** MASTER §9; IX2 `a-7`/`a-9`/`a-24`.

### Section 5 — Stat Circles — **SCRUBBED** (signature)
IX2 `a-16`/`a-20`, `SCROLLING_IN_VIEW`, smoothing 50–80. Per circle, tied to scroll progress:
- `TRANSFORM_SCALE 0.2 → 1` between **40%→50%** of the scroll window
- `STYLE_OPACITY` crossfade (number/label swap): `0 @60% → 1 @70% → dip @78% → 1 @80%`
- text-color shift at **10–20%**
- Circles scale up **one-at-a-time as you scroll** — not timed. **Match the scroll window**, not a seconds value. Optional scroll-driven count-up.
**Code:** MASTER §3; IX2 `a-16`/`a-20`.

### Section 6 — Gap-Circle Transition — *play-once*
IX2 `a-23`: circle `STYLE_SIZE width 0 → 400` (→ scale to cover viewport) over **3500ms, ease outCubic**; `opacity 0→1, dur 1000ms, delay 1000ms`. Pairs with body-bg recolor to black (script_16, §4 above). Caption (S6.1) = word-reveal, omittable. **Code:** MASTER §4; IX2 `a-23`.

### Section 7 — Win Circles / Venn — *play-once* (≥992px only; disabled <480)
Circles revealed via **clip-path circle + radial mask** once illustration inline `opacity ≥ 0.7` (MASK_THRESHOLD, MutationObserver-driven). SVG annotation lines draw on once tooltips `opacity ≥ 0.5` (TIP_THRESHOLD):
- line `stroke-dashoffset → 0`, **dur 0.5s, ease power2.out, stagger 0.15s** (`delay = i*0.15`)
- end dot `opacity → 1`, **dur 0.2s, delay +0.45s**
- hide (scroll back): dashoffset back to `len`, `dur 0.3s, delay 0.15s, ease power2.in`; dot `opacity→0, dur 0.15s, delay 0.1s`; svg fade `opacity→0, dur 0.3s, delay 0.4s`
- full recompute on resize (150ms debounce). Left circle line color = brand green, right = `#87bbd9`.
**Placeholder build:** reproduce mask reveal + staggered line-draw; gate lines to ≥992px. **Code:** MASTER §6; `zig-gsap-source.js` script_15.

### Section 8 — Step Wheel — **SCRUBBED** (signature; disabled ≤767)
`gsap.to(wheel, { rotation: totalRotation, ease:'none', scrollTrigger:{ trigger:'.steps-animation-wrapp', start:'50% top-=200', end:'bottom bottom-=400', scrub:true, onUpdate:self => tick(self.progress * totalRotation) }})`.
- `totalRotation = min(180°, computed ctaFinalAngle - lineStart)`; card start angle `lineStart = -35°`, `lineStep = 30°` per card; `angles[i] = -35 + (n-1-i)*30`.
- Per-frame `tick(rotation)` maps each card's angle → horizontal `x` (projects angle onto the track via `deltaY * cos/sin`; cards past the horizon are pushed off-screen `±innerWidth*2`).
- Card icons also reveal via marquee (IX2 `a-18`, `x 10→-100`, scrubbed).
- **Match the scroll window**, not seconds.
**Code:** MASTER §7; `zig-gsap-source.js` script_17.

### Section 9 — Month Timeline — *play-once*
`.built-card` (IX2 `a-22`): `TRANSFORM_SCALE 0.95 → 1, dur 500→300ms, easeInOut`, on enter (scrollOffset ~10%), **staggered** so months pop in sequence. Red CTA card slides in last. **Code:** MASTER §8; IX2 `a-22`.

### Section 10 — Testimonials — *interactive (Splide)*
`new Splide('.testim_slider', { perPage:1, perMove:1, type:'loop', arrows:true, pagination:true, rewindSpeed:400, updateOnMove:true }).mount();` — 6 slides. **Code:** MASTER §10; `zig-gsap-source.js` script_18.

### Section 11 — FAQ Accordion — *interactive (click)*
Items expand/collapse on click — height auto-animate + icon `+ ↔ −` rotate. No scroll trigger. One-open-at-a-time or independent (build choice). **Code:** none in source (native Webflow/interaction); implement directly.

### Section 12 — Footer CTA + Footer — *scrubbed*
CTA H2 (S12.1) = word-reveal (`.animate-text_opacity`, scrubbed). Footer static (optional fade-in on enter). **Code:** MASTER §2; script_13.

---

## 6. Section motion index

| # | Section | Motion type | Primary code ref |
|---|---|---|---|
| 0 | Global nav | play-once | IX2 `a-2`/`a-3` |
| 1 | Hero | custom segmented loop | script_12 |
| 2 | Before / After | play-once | script_13 `.animate-block_appear` |
| 3 | Statement + trusted-by | scrubbed + loop | script_13 + IX2 `a` |
| 4 | Bento | play-once + loop | IX2 `a-7`/`a-9`/`a-24` |
| 5 | Stat circles | **scrubbed** | IX2 `a-16`/`a-20` |
| 6 | Gap circle | play-once | IX2 `a-23` |
| 7 | Win circles / Venn | play-once | script_15 |
| 8 | Step wheel | **scrubbed** | script_17 |
| 9 | Month timeline | play-once | IX2 `a-22` |
| 10 | Testimonials | interactive | script_18 |
| 11 | FAQ | interactive | native |
| 12 | Footer CTA | scrubbed | script_13 |

Global: nav hide/show (§Section 0), body bg recolor (§4), marquees (IX2 `a`/`a-32`).

---

## Appendix — source-of-truth pointers

- Motion timings/eases (authoritative): `standalone-3nm-v2/references/zig ai analysis/ZIG-MOTION-SPEC-MASTER.md`
- Verbatim GSAP: `standalone-3nm-v2/references/zig ai analysis/zig-gsap-source.js`
- Raw Webflow IX2 keyframes: `standalone-3nm-v2/references/zig ai analysis/zig-webflow-ix2.json`
- Section narrative + timecodes: `standalone-3nm-v2/references/zig ai analysis/zig-motion-storyboard.md`
- Timing sheets: `standalone-3nm-v2/references/zig-timing/` (10fps), `standalone-3nm-v2/references/zig-sheets/` (1fps)
