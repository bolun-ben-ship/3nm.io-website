# ZIG-MOTION-SPEC — scroll-choreography encoding + 3nm content mapping

> Source of truth for the motion rebuild. Derived frame-by-frame from `references/2026-07-27 21-44-25.mov` (zig.ai, 74s, 30fps) and `standalone-3nm-v2/content/index.md`.
> Stack (confirmed same as zig.ai): **Lenis** smooth-scroll + **GSAP ScrollTrigger** (pin + scrub). zig runs this on Webflow; we run it in Astro.
> Rule of restraint (from `iterate` + MOTION.md): **one emphasis per viewport, max two.** Every motion behind `prefers-reduced-motion`.

---

## PART 1 — The zig.ai animation encoding library

14 reusable archetypes. Each = a black-box a section can "follow": trigger → mechanics → timing → reduced-motion fallback. Timestamps reference the source video.

### A · Pinned hero card-flow  `@0–10s`
- **What:** notification cards fly in one-by-one from a central node along thin connector lines, stagger, drift; as scroll continues they collapse into a stacked "did/didn't" comparison; emoji reactions pop.
- **Trigger:** section pinned, `scrub`.
- **Mechanics:** `ScrollTrigger{pin, scrub:.6, end:'+=150%'}`; timeline: cards `fromTo` opacity/scale/xy along a path, `stagger .08`; SVG connector `path` `attr:{d}` draws; hover state = spring lift (Motion, not scroll).
- **Timing:** card in .5s `power3.out`; connectors .4s; whole sequence spans the pin.
- **Reduced-motion:** cards render in final stacked state, no fly-in, no scrub. Hover still works.

### B · Two-column compare reveal  `@11–15s, 26–30s`
- **What:** Before/After (or row list) beside a sticky panel; rows stagger up, status badges pop, left=pain / right=win.
- **Trigger:** enter viewport (`start:'top 75%'`), one-shot.
- **Mechanics:** sticky column via CSS `position:sticky`; rows `gsap.from{y:20,opacity:0,stagger:.09}`; badge `scale` pop `back.out(1.6)`.
- **Reduced-motion:** rows static, badges static.

### C · Word-fill headline  `@15–18s`
- **What:** big 2-line statement; the accent colour sweeps across the words left→right as you scroll.
- **Trigger:** scrub across the headline's own scroll span.
- **Mechanics:** wrap each word in a span; `scrub` a `gsap.to(words,{color:accent, stagger:.5})` OR a clip-path/background-clip gradient wipe driven by scroll progress.
- **Reduced-motion:** headline renders fully in accent (end state), no sweep.

### D · Logo trust row  `@16–18s`
- **What:** partner logos fade + rise in a stagger under a "Trusted by" label.
- **Trigger:** enter viewport, one-shot.
- **Mechanics:** `gsap.from(logos,{y:14,opacity:0,stagger:.05})`.
- **Reduced-motion:** static.

### E · Bento assembly  `@18–24s`
- **What:** a grid of feature cards (mixed green / red / dark) scale+fade in staggered; **each card carries its own live micro-mock** (pipeline chips, phone with radial rings, approval toggle, month timeline).
- **Trigger:** enter viewport, one-shot; inner mocks loop subtly (CSS) after landing.
- **Mechanics:** `gsap.from(cards,{y:24,scale:.96,opacity:0,stagger:.08,ease:'power3.out'})`; micro-mocks are independent looping CSS/Motion.
- **Reduced-motion:** cards static, mocks static (no loop).

### F · Stat circles  `@24–34s`
- **What:** big numbers each inside a green circle; circles scale from 0, pulse, settle; then all collapse toward a single circle.
- **Trigger:** scrub.
- **Mechanics:** circles `scale 0→1 back.out`; numbers count via `innerText` tween; collapse = `scale`/`xy` toward centroid on further scroll.
- **Reduced-motion:** numbers + circles static at final value.

### G · Circle-wipe transition  `@34–38s`
- **What:** one circle grows from a stat to fill the viewport, carries a line of text, and *becomes* the next (dark) section — a masked wipe between light→dark.
- **Trigger:** scrub, bridges two sections.
- **Mechanics:** a fixed circle `scale` up with `clip`/overflow; background of next section revealed inside it; text cross-fades. Cheap version: big `border-radius` block scaling with `transform` only.
- **Reduced-motion:** hard cut between sections, no grow.

### H · Dark statement + CTA  `@37–43s`
- **What:** white headline on near-black, red/primary CTAs; holds.
- **Trigger:** enter, one-shot fade+rise.
- **Mechanics:** `gsap.from(h,{y:24,opacity:0})`, CTA `y` follow.
- **Reduced-motion:** static.

### I · Venn draw  `@44–48s`
- **What:** two ring outlines slide in from opposite sides on dark, overlap, logo fades at the intersection, perimeter annotations fade in.
- **Trigger:** scrub.
- **Mechanics:** two SVG circles `x` from ±offset → overlap; `stroke-dashoffset` draw; centre logo `opacity`; labels `stagger`.
- **Reduced-motion:** final overlapped state, no slide/draw.

### J · Pinned horizontal scroll (process)  `@48–52s`
- **What:** vertical scroll drives a horizontal filmstrip of steps (Research→…→Pipeline) across a pinned green panel.
- **Trigger:** pin + scrub.
- **Mechanics:** `ScrollTrigger{pin, scrub, end:'+=Npx'}` translating a flex track `xPercent` negative.
- **Reduced-motion:** track becomes a normal wrap/scroll list, no pin.

### K · Horizontal timeline cards  `@52–57s`
- **What:** Month 1→6 cards slide in from the right as you scroll; ends on a red "act now" card.
- **Trigger:** pin + scrub (or enter-stagger if space allows).
- **Mechanics:** track `x` scrubbed; final red card `scale` emphasis.
- **Reduced-motion:** static row/stack.

### L · Testimonial carousel  `@57–66s`
- **What:** quote cards swap horizontally with ‹ › arrows on a dotted-texture dark panel; auto-advances.
- **Trigger:** interaction + timer (not scroll).
- **Mechanics:** Motion `AnimatePresence`-style x-swap; arrows + autoplay; pause on hover.
- **Reduced-motion:** crossfade instead of slide; autoplay off.

### M · FAQ accordion  `@62–71s`
- **What:** sticky "FAQ" label left; questions stagger in; rows expand with +/−.
- **Trigger:** enter-stagger (scroll) + click (expand).
- **Mechanics:** `gsap.from(rows,{y:16,opacity:0,stagger:.05})`; expand = height auto tween / grid-rows 0fr→1fr.
- **Reduced-motion:** rows static; expand instant.

### N · Final CTA wipe  `@71–74s`
- **What:** full-colour panel wipes up from the bottom; footer sits under it.
- **Trigger:** enter, one-shot.
- **Mechanics:** panel `clip-path`/`y` reveal; headline + CTA `stagger`.
- **Reduced-motion:** static panel.

### Global layer (all sections)
- **Lenis** smooth-scroll, `lerp≈.09`; `lenis.on('scroll', ScrollTrigger.update)`.
- **Connector hairlines:** thin diagonal SVG lines thread *between* sections, parallaxed at a slower rate — the visual thread that makes the page feel like one continuous system. `yPercent` scrub, ~0.06 opacity.
- **Colour discipline:** green = the one accent; **red/primary reserved for CTAs only**; dark and green full-bleed panels are punctuation, not the default.
- **Type:** oversized display headings, generous whitespace, hairline borders.
- **Sticky nav** gains a hairline border after 20px scroll.
- **Cadence:** zig alternates paper → green → dark → paper to create drama. A flat single-tone page kills the effect.

---

## PART 2 — 3nm content mapped onto the encodings

My existing content and its **presentation methods are preserved** (notification cards, tools ticker, status-dashboard mock, radial data→hub diagram, comparison table, FAQ accordion, Formspree form). Each section adopts an archetype for *how it moves*, not *what it says*.

| # | My section (content preserved) | Archetype | What animates | Panel tone |
|---|---|---|---|---|
| 1 | Hero — 5 notification cards + "47" badge | **A** | cards fly in along connector lines from a hub, drift, hover-jump kept; badge pulses | paper |
| 2 | Tools ticker (14 logos) | **J-lite** | keep auto-marquee; slight speed-coupling to scroll velocity | paper |
| 3 | Capability strip (4 chips) | **D** | chips rise + stagger on enter | paper |
| 4 | Who this is for — sticky status-dashboard mock + 5 numbered rows | **B** | rows stagger up; each status badge (Manual/Late/Guess/Stalled) pops as its row enters; mock sticky | warm |
| 5 | Ops-hire trap — 3 cards + "Skip the ops hire" closing | **E** + **C** | 3 cards scale+fade stagger; accent sweeps "*Skip the ops hire.*" | **dark** (new — drama beat) |
| 6 | Case study 1 — student-platform mock + 3 results | **E / live-mock** | mock assembles: KPI row counts up, student rows in, **progress bars fill L→R** on enter | warm |
| 7 | Proof — 3 case-study cards | **E** | cards scale+fade stagger; KPI tiles count up | paper |
| 8 | **What I build — radial data→hub diagram + ownership strip** | **A/G hybrid — the centrepiece** | section pins; 8 data sources fly into the hub along the SVG lines (scrubbed); hub scales in; headline resolves; ownership rows stagger | paper→**dark** strip |
| 9 | Comparison — 5-col × 7-row table | **B** | rows stagger in; RightClick:AI column lifts/highlights as it lands | paper |
| 10 | Founder voice — quote + attribution | **C** | accent sweeps "*you hear it.*"; quote fades in calm (1 emphasis) | warm |
| 11 | FAQ — 11-item accordion | **M** | sticky label; questions stagger in; +/− expand | paper |
| 12 | Closing — dark Formspree form | **N + H** | dark panel wipes up; heading + fields stagger | **dark** |

### Section-by-section detail

**1 · Hero → A.** The 5 cards currently drift + hover-jump. Add the zig entrance: on load they fly in from a centre point along thin connector lines with `stagger .08`; the "47" badge pulses. On scroll-out, subtle parallax (cards leave at different speeds). Hover-jump stays (spring, Motion). *Emphasis: the cards.*

**2 · Tools ticker → J-lite.** Keep the seamless auto-marquee. Optional: couple track speed to Lenis scroll velocity so it "leans" as you scroll. No pin. *Emphasis: motion is ambient, not focal.*

**4 · Who this is for → B.** Status-dashboard mock stays sticky on desktop. The 5 numbered recognition rows stagger up beside it; as each enters, its dashboard badge pops (`back.out`). This is zig's before/after reveal applied to your recognition list. *Emphasis: the row currently entering.*

**5 · Ops-hire trap → E + C, on DARK.** Promote this to a dark full-bleed panel — your first drama beat, the "enemy" section. The 3 One/Two/Three cards assemble (bento stagger). The closing line "*Skip the ops hire.* Build a system that you own." uses the word-fill sweep (C) in accent. *Emphasis: the closing line.*

**6 · Case study 1 → live-mock (E).** The student-platform mock is your best zig-style "live graphic." On enter: window bar draws, KPI numbers (38/6/3) count up, the 5 student rows stagger in, and **each progress bar fills from 0 to its width** — the single most zig-like micro-mock on the page. Copy reveals left. *Emphasis: the mock filling.*

**8 · What I build → the centrepiece (A/G hybrid).** This is the "plays like a video" moment — the one I prototyped. Pin the section. Scrub: 8 data-source nodes (Finance…+Custom) fly inward along the radial SVG lines into the hub; flow-dots become scroll-driven; the hub node scales in with its pulse; the headline "Your whole business in one view" resolves; then the dark ownership strip rows (First / You own / Your team / Capacity / Guarantee) stagger up. Keep the radial diagram — it *is* your version of zig's hub. *Emphasis: convergence into the hub, then the ownership strip.*

**9 · Comparison → B.** 7 rows stagger in; the RightClick:AI column cells lift and the highlight fills as the column lands. Table content unchanged. *Emphasis: the us-column.*

**11 · FAQ → M.** Direct port of zig's accordion: sticky "FAQ" heading, questions stagger in on enter, first item open, +/− expand with height tween. *Emphasis: the open row.*

**12 · Closing → N + H.** Dark panel wipes up from the bottom (N). Heading "Book a 30-minute call. It's free." + form fields stagger in (H). Success/error states unchanged. *Emphasis: the form.*

### Optional additive moments (only if Ben wants more zig density)
- **F (stat circles):** a "What changes when I build this" beat between §7 and §8, pulling KPIs from the case studies into big animated circles. Net-new content.
- **I (Venn):** a dark "For the founder / For the team" overlap beat. Net-new content — only if it earns a place.

---

## PART 3 — Build system & order

**Tone cadence (drama through alternation):**
`paper (1–4) → DARK (5) → warm (6) → paper (7) → paper+dark strip (8) → paper (9–11) → DARK (12)`
Two dark beats (§5 enemy, §12 close) + the §8 strip = punctuation. Everything else calm paper/warm.

**Motion budget per viewport:** exactly one focal animation. If a section already has its emphasis, any added motion must replace it or be cut (`iterate` rule).

**Perf gating:**
- GSAP + ScrollTrigger + Lenis ≈ 35KB gz, deferred, non-blocking — no LCP/SEO hit.
- Pins/scrubs use `transform`/`opacity` only (no layout thrash, 0 CLS).
- `prefers-reduced-motion: reduce` → every archetype renders its documented static end-state; no-JS keeps all content usable.

**Build order:**
1. Global layer first: Lenis init, ScrollTrigger, sticky nav, connector-hairline system, tone tokens.
2. §8 centrepiece (A/G hub) — highest risk, validate first.
3. §1 hero (A), §6 live-mock, §11 FAQ (M) — the other signature moments.
4. Remaining sections (B/D/E/C) — cheaper, batch them.
5. Reduced-motion + no-JS pass.
6. Playwright verify each (frames → interpolated video, as established).

**Held:** nothing deploys. Live site (`standalone-3nm-astro`) untouched until Ben approves the rebuilt homepage.
