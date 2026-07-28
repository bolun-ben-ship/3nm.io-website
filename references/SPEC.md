# SPEC.md — 3nm-v2 Landing Page · Structure & Content Budgets

> **The site skeleton.** Page inventory, per-section DOM/layout/responsive rules, and the content-slot budget tables. This is the *structural* layer only.
> **Companions:** visual identity → **DESIGN.md** · motion contract → **ANIMATION-SPEC.md**. Section IDs 0–12 are the shared key across all three files (e.g. "colors: DESIGN §Section 8 · motion: ANIMATION-SPEC §Section 8").
> **Extraction source of truth:** `standalone-3nm-v2/references/zig ai analysis/` (motion spec master, verbatim GSAP, raw Webflow IX2). Layout/structure mimics [zig.ai](https://zig.ai); content is placeholder.

---

## 1. How to use this file

This file is **build-ready** for structure. A developer can build the placeholder skeleton from this document (for look & feel pull DESIGN.md, for motion pull ANIMATION-SPEC.md). Ben later drops his own copy into the defined slots.

**The one rule: fill each slot, never exceed its budget.**

Every place text appears is a numbered **content slot** with an exact budget:

- **Max chars** — hard ceiling including spaces. Derived from the longest real zig.ai string that occupies that slot, so it reflects what genuinely fits the layout.
- **Max words** — soft guide for rhythm.
- **Max lines** — how many wrapped lines the design reserves at desktop width. Going over pushes the layout.
- **Repeat count** — how many identical items the section renders (e.g. "4 stat circles"). If Ben wants a different count, the layout must be re-checked.

Slot IDs are stable (`S<section>.<n>`). The **Consolidated content-budget summary** (§6) lists every slot in one table.

**Placeholder text is generic dummy copy sized to the real budget** — it shows the developer roughly how long the string runs. It is NOT final copy. Copy is deliberately deferred to a later session; leave the placeholder slots as budgeted placeholders. **Do not ship the dummy copy.**

Scope note: this file covers **layout, semantic structure, responsive behavior, and content budgets**. It deliberately does not hand-author every element's spacing or hover microstate — it gives the structural grid, the responsive rules, and the slot set a developer needs, and leaves visual fine-tuning to DESIGN.md and the build. Where a value could not be obtained it is marked `TBD` (see §8).

---

## 2. Layout tokens — breakpoints & container

> Color, type, spacing-scale, radius and elevation tokens live in **DESIGN.md**. Only the structural (responsive) tokens live here.

| Name | Width | Notes |
|---|---|---|
| Container max-width | **85rem = 1360px** | Centered, 24px side gutters |
| Desktop | ≥ 992px | Full motion (bg recolor, win lines, step wheel gate on ≥992) |
| Tablet | 768–991px | Step wheel disabled ≤767; grids collapse |
| Mobile | ≤ 767px | Single column; win circles disabled < 480 |

Section vertical padding: **80–140px** desktop, **48–64px** mobile (from the DESIGN.md spacing scale).

---

## 3. Page inventory — section order at a glance

| # | Section | Purpose (one line) | Flood/bg → DESIGN | Signature motion → ANIMATION-SPEC |
|---|---|---|---|---|
| 0 | Global nav | Persistent top nav + primary CTA | paper, transparent→light | hide/show on scroll |
| 1 | Hero | Headline + promise + dual CTA + node-graph illustration | paper | segmented Lottie scrub (3 seg + 2 holds) |
| 2 | Before / After | Contrast pain vs outcome, two aligned columns | paper | staggered row fade-up |
| 3 | Statement + trusted-by | One-line thesis + logo row | paper | word-reveal + logo marquee |
| 4 | "Why different" bento | 6 differentiators, one red tile + one accent-green | paper (+red/green tiles) | card scale-in + badge orbit |
| 5 | Stat circles | 4 headline metrics as circular counters | paper | circles scale up one-by-one (**scrubbed**) |
| 6 | Gap-circle transition | Green circle grows to wipe light→dark | paper → dark | green circle grows to fill |
| 7 | Win circles / Venn | Dark Venn of two audiences meeting | **dark flood** | clip-path reveal + SVG line-draw |
| 8 | Step wheel | Full workflow as rotating step cards | **green flood** | cards rotate through center (**scrubbed**) |
| 9 | Month timeline | Compounding value across months + red CTA card | green → paper | month cards pop in sequence |
| 10 | Testimonials | Rotating client quotes | **dark flood** | Splide loop |
| 11 | FAQ accordion | Objections, click-to-expand | paper | expand/collapse on click |
| 12 | Footer CTA + footer | Final conversion push + footer nav | **green flood** | word-reveal |

Section order is fixed 0→12. The flood/dark sections (7, 8, 10, 12, plus the 6→7 transition and the 9 fade-out) are documented as a deliberate brand exception in **DESIGN.md**.

---

## 4. Section-by-section — structure, layout, responsive

> Each block: **Purpose · Semantic structure/DOM · Grid/layout · Responsive**. Colors → DESIGN.md §Section N. Motion → ANIMATION-SPEC.md §Section N.

---

### Section 0 — Global Nav

**Purpose:** persistent top navigation with primary CTA.

**Semantic/DOM:** `<header>` sticky bar → logo (link) · nav link cluster (`<nav>` list) · login text link · primary pill button. Mobile: logo + hamburger toggle → full-width menu panel.

**Grid/layout:** logo left · center/right link cluster · right "Login" + pill "Book a demo". Sticky top, ~72px tall. Container 1360px.

**Responsive**
- Desktop (≥992): full inline bar; transparent over hero, light on scroll.
- Tablet (768–991): same, links may collapse.
- Mobile (≤767): logo + hamburger; full-width menu panel (IX2 display toggle).

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S0.1 | logo | `RightClick:AI` | — | — | 1 | 1 | Wordmark, `:AI` accent span |
| S0.2 | nav link | `How it works` | 16 | 2 | 1 | 3–4 | ≤16 chars keeps single line |
| S0.3 | login link | `Login` | 10 | 1 | 1 | 1 | Text link |
| S0.4 | nav button | `Book a demo` | 16 | 3 | 1 | 1 | Pill button |

---

### Section 1 — Hero

**Purpose:** headline + value promise + dual CTA, anchored by the animated node-graph illustration.

**Semantic/DOM:** two-part hero row → left content column (eyebrow · H1 · sub-paragraph · CTA row of two buttons) + right illustration container holding the Lottie (`.hero_lottie`, 4 responsive files, only the visible one plays).

**Grid/layout:** left column of text; right/overlapping Lottie illustration (~2500×887 aspect, bleeds right). Container 1360px.

**Responsive**
- Desktop: text left, illustration right/overlapping.
- Tablet: illustration shrinks (820px Lottie), sits right at reduced size or stacks.
- Mobile: single column — eyebrow → H1 → sub → CTAs → illustration below (420px Lottie).

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S1.1 | eyebrow | `AI copilots for busy teams` | 30 | 5 | 1 | 1 | Mono, uppercase optional |
| S1.2 | h1 | `Close the deal. We handle the rest of it.` | 42 | 7 | 2 | 1 | Two-tone; line 2 accent. 72px |
| S1.3 | sub-paragraph | `Your own crew of assistants — one per task. They research, draft, prep, follow up, and log. You review and ship.` | 135 | 24 | 3 | 1 | Lead paragraph, text-xl |
| S1.4 | primary CTA | `Start now` | 12 | 2 | 1 | 1 | Accent pill |
| S1.5 | secondary CTA | `Book a demo for a team` | 24 | 5 | 1 | 1 | Ghost pill |
| S1.6 | hero illustration | *(Lottie asset)* | — | — | — | 1 | Placeholder `.lottie`, §7 |

---

### Section 2 — Before / After ("data entry")

**Purpose:** contrast pain (Before) vs outcome (After) in two aligned columns.

**Semantic/DOM:** section header (eyebrow · H2) above a two-column grid. Left "Before" column = labelled list of problem rows; right "After" column = labelled list of outcome rows; rows align 1:1. Optional per-row divider.

**Grid/layout:** eyebrow + H2 centered above a two-column grid. Rows align 1:1 across columns.

**Responsive**
- Desktop: two columns side by side.
- Tablet: two columns, narrower.
- Mobile: stack — all Before rows then all After (or interleave pairs). Single column.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S2.1 | eyebrow | `The execution gap` | 20 | 3 | 1 | 1 | |
| S2.2 | h2 | `You didn't sign up for busywork` | 44 | 9 | 2 | 1 | One word can be accent |
| S2.3 | column label (Before) | `Before` | 10 | 1 | 1 | 1 | |
| S2.4 | before row | `You spend forty minutes after every call on work nobody built a tool for.` | 78 | 14 | 3 | 4 | 4 problem rows |
| S2.5 | column label (After) | `After` | 10 | 1 | 1 | 1 | |
| S2.6 | after row | `A pipeline your manager can defend to the board.` | 52 | 10 | 2 | 4 | 4 outcome rows, 1:1 with Before |

---

### Section 3 — Statement + Trusted-by

**Purpose:** one-line thesis, reinforced by a social-proof logo row.

**Semantic/DOM:** large centered two-line statement (`<h2>`, line 2 accent span) → small "Trusted by" label → logo row (6 `<img>`, grayscale placeholders).

**Grid/layout:** centered statement; below, label + row of 6 monochrome logos.

**Responsive**
- Desktop: single-line-per-clause statement; logos in a row of 6.
- Tablet: statement wraps; logos 3×2 or marquee.
- Mobile: statement centered smaller; logos marquee or 2×3.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S3.1 | h2 statement | `We don't speed up the busywork. We give your team a crew that runs it.` | 66 | 13 | 2 | 1 | Line 2 accent. title-l |
| S3.2 | trusted-by label | `Trusted by` | 14 | 2 | 1 | 1 | Mono small |
| S3.3 | logo | *(logo img)* | — | — | 1 | 6 | Placeholder grayscale logos, §7 |

---

### Section 4 — "Why different" Bento

**Purpose:** 6 differentiators as an asymmetric bento grid, one tile loud (red) and one accent-green.

**Semantic/DOM:** section header (eyebrow · H2 · intro paragraph) above a bento grid of 6 tiles. Each tile: index label ("/ 0N") · title · body. One tile = red variant with phone mockup + rotating badge; one tile = accent-green variant. One tile may carry an optional CTA link.

**Grid/layout:** bento grid, mixed tile sizes (2-col, varying height). Asymmetric proportions — see §8 TBD for exact ratios.

**Responsive**
- Desktop: asymmetric bento, mixed tile sizes.
- Tablet: 2-col even grid.
- Mobile: single column, cards stack full-width.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S4.1 | eyebrow | `Built different` | 18 | 2 | 1 | 1 | |
| S4.2 | h2 | `Why this beats everything you've tried` | 54 | 9 | 2 | 1 | |
| S4.3 | intro paragraph | `Most tools wait to be opened. This one is the teammate that never stops working.` | 82 | 15 | 2 | 1 | |
| S4.4 | card index | `/ 01` | 5 | 1 | 1 | 6 | Mono; auto "/ 0N" |
| S4.5 | card title | `Always working. Never waiting.` | 34 | 5 | 2 | 6 | Longest real ≈ 33 |
| S4.6 | card body | `From first touch to closed deal — research, outreach, meetings, follow-ups, and sync, all connected and talking to each other.` | 200 | 34 | 5 | 6 | Longest card body ≈ 195 |
| S4.7 | card CTA (optional) | `Learn more` | 14 | 2 | 1 | 1 | On one card only |

---

### Section 5 — Stat Circles ("what changes")

**Purpose:** four headline metrics as large circular counters — the page's most prominent scroll animation.

**Semantic/DOM:** section header (eyebrow · H2 · one-line sub) above a row of 4 circle units. Each circle unit: big stat value (center) + label beneath.

**Grid/layout:** row of 4 large circles, generous whitespace.

**Responsive**
- Desktop: row of 4 circles.
- Tablet: 2×2 circle grid.
- Mobile: 1 column stacked (or 2×2 smaller).

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S5.1 | eyebrow | `The impact` | 14 | 2 | 1 | 1 | |
| S5.2 | h2 | `What changes when it runs` | 30 | 5 | 1 | 1 | |
| S5.3 | sub-line | `What happens when the team finally has backup.` | 48 | 9 | 1 | 1 | |
| S5.4 | stat value | `60+` | 4 | 1 | 1 | 4 | e.g. `60+` `95%` `30%` `3x` |
| S5.5 | stat label | `Hours back. Per person. Every month.` | 36 | 6 | 2 | 4 | Below each circle |

---

### Section 6 — Gap-Circle Transition

**Purpose:** a single accent circle grows to fill the viewport, wiping from the light section into the dark section below.

**Semantic/DOM:** full-bleed transition block → a single accent circle element centered + optional caption (word-reveal). Doubles as divider into the dark section 7.

**Grid/layout:** full-bleed; accent circle centered, scaling to cover the viewport as the section leaves.

**Responsive**
- Desktop/tablet: circle scales to cover viewport.
- Mobile (≤767): may simplify to a color block.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S6.1 | caption | `The longer it runs, the wider the gap between you and everyone starting fresh.` | 80 | 14 | 2 | 1 | Word-reveal; omittable |

---

### Section 7 — Win Circles / Venn ("rep closes")

**Purpose:** dark-section Venn of two overlapping circles (one audience each) meeting at a central mark, with annotated tooltips.

**Semantic/DOM:** dark full section → header (eyebrow · H2 · sub) → illustration wrapper (`.win-circles-wrapp`) containing left circle (`.win-circle.is--left`, audience A), right circle (`.is--right`, audience B), central brand mark, an SVG overlay (`.win-svg-overlay`) for annotation lines, and tooltip nodes (3 per circle) → dual CTA below.

**Grid/layout:** two large overlapping circles (Venn); 3 tooltip lines fan off each circle via thin SVG annotation lines to a central mark. Dual CTA below.

**Responsive**
- Desktop (≥992): full Venn + SVG line-draw.
- Tablet: circles smaller, tooltips reflow; lines recompute on resize.
- Mobile (<480): **win-circle motion disabled** — stack two circles or a two-column list of tooltip points, no line-draw.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S7.1 | eyebrow | `One platform. Two wins` | 24 | 4 | 1 | 1 | |
| S7.2 | h2 | `The team closes. The lead has their back.` | 44 | 8 | 2 | 1 | Line 2 accent |
| S7.3 | sub-line | `The team stops administrating. The lead stops guessing. The number moves.` | 84 | 13 | 2 | 1 | |
| S7.4 | circle label | `For the person doing the closing` | 34 | 6 | 2 | 2 | One per circle |
| S7.5 | tooltip line | `One layer that replaces four separate tools you pay for today.` | 66 | 12 | 2 | 6 | 3 per circle × 2 |
| S7.6 | primary CTA | `Start now` | 12 | 2 | 1 | 1 | |
| S7.7 | secondary CTA | `Book a demo for a team` | 24 | 5 | 1 | 1 | |

---

### Section 8 — Step Wheel ("every part of the sale")

**Purpose:** the full workflow as a horizontal sequence of steps that rotate through center on an invisible wheel — the second signature scroll animation.

**Semantic/DOM:** green full section → header (eyebrow · H2 · intro) → animation wrapper (`.steps-animation-wrapp`) containing an invisible wheel (`.sales-figure-wheel`) and a card track (`.sales-cards_track`) of 6 step cards (`.sales-card`: icon + label + body). Optional "Learn more" link.

**Grid/layout:** horizontal track of 6 step cards on an invisible wheel; scrolling rotates the wheel, sliding each card horizontally through center.

**Responsive**
- Desktop (>767): wheel active, cards rotate through center.
- Tablet: horizontal scroll or 2-col grid (wheel on if >767).
- Mobile (≤767): **wheel disabled** — vertical stacked list (icon + label + body), no rotation.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S8.1 | eyebrow | `Every workflow` | 16 | 2 | 1 | 1 | |
| S8.2 | h2 | `Every part of the job. Handled.` | 32 | 6 | 1 | 1 | |
| S8.3 | intro paragraph | `Every workflow in your motion — researched, executed, tracked, and followed through. Automatically.` | 104 | 16 | 2 | 1 | |
| S8.4 | step label | `CRM Sync` | 12 | 2 | 1 | 6 | Short — one/two words |
| S8.5 | step body | `Every interaction captured. Your records always current.` | 50 | 8 | 2 | 6 | One per step |
| S8.6 | link (optional) | `Learn more` | 14 | 2 | 1 | 1 | |

---

### Section 9 — Month Timeline ("gets better")

**Purpose:** compounding value across time as a sequence of month cards, capped by a red CTA card.

**Semantic/DOM:** section (bg transitions green→paper) → header (eyebrow · H2 · intro) → timeline track of 4 month cards (`.built-card`: Month N + title + body) → a final red CTA card (headline + dual CTA).

**Grid/layout:** timeline of 4 month cards, then a red CTA card as the final item.

**Responsive**
- Desktop: linear timeline of 4 cards + CTA card.
- Tablet: 2×2 month cards + CTA card below.
- Mobile: single column in month order, CTA last.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S9.1 | eyebrow | `Gets smarter every day` | 26 | 4 | 1 | 1 | |
| S9.2 | h2 | `The only team that gets better the longer it works for you` | 64 | 12 | 2 | 1 | |
| S9.3 | intro paragraph | `Most tools forget everything the moment you log out. This one remembers every signal and uses it to make the next move sharper.` | 145 | 25 | 3 | 1 | |
| S9.4 | month label | `Month 1` | 10 | 2 | 1 | 4 | |
| S9.5 | month title | `Flags risk before you feel it` | 32 | 6 | 2 | 4 | |
| S9.6 | month body | `Stalled work surfaced before it's gone.` | 44 | 8 | 2 | 4 | |
| S9.7 | CTA card headline | `Start today. In six months, today is what you'll wish you'd done.` | 70 | 13 | 3 | 1 | Red card |
| S9.8 | CTA card primary | `Start now` | 12 | 2 | 1 | 1 | |
| S9.9 | CTA card secondary | `Book a demo for a team` | 24 | 5 | 1 | 1 | |

---

### Section 10 — Testimonials (Splide)

**Purpose:** rotating client quotes for social proof.

**Semantic/DOM:** dark/navy section → header (eyebrow · H2) → Splide slider (`.testim_slider`) with 6 slides, each = large quote + author name + role/company → prev/next arrows + pagination dots.

**Grid/layout:** 1 slide visible: large quote + author name + role/company; arrows + pagination.

**Responsive**
- Desktop: single slide centered, arrows + dots.
- Tablet/mobile: single slide, arrows below/edge; smaller quote.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S10.1 | eyebrow | `Testimonials` | 16 | 1 | 1 | 1 | |
| S10.2 | h2 | `What our clients say` | 24 | 4 | 1 | 1 | |
| S10.3 | quote | `This has significantly increased our results. It helps us find the right customers, enrich our data, and reach them through the right channels — all in one place.` | 230 | 40 | 5 | 6 | Longest slide; 6 slides |
| S10.4 | author name | `Alex Sample` | 28 | 3 | 1 | 6 | |
| S10.5 | author role | `Director of Demand Generation, Company` | 44 | 6 | 1 | 6 | Role + company |

---

### Section 11 — FAQ Accordion

**Purpose:** answer objections in a click-to-expand accordion.

**Semantic/DOM:** header (H2 · short sub) → single-column accordion (~800px max-width) of 7 rows; each row = question button (+/− icon) → collapsible answer panel.

**Grid/layout:** single-column accordion, ~800px max-width, centered.

**Responsive**
- Desktop: centered ~800px accordion.
- Tablet/mobile: full-width.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S11.1 | h2 | `FAQ` | 20 | 3 | 1 | 1 | Or "Questions" |
| S11.2 | sub-line | `Something we didn't cover? Talk to us.` | 40 | 7 | 1 | 1 | |
| S11.3 | question | `My team won't adopt another tool — and will they actually be in control?` | 74 | 13 | 2 | 7 | Longest question ≈ 71 |
| S11.4 | answer | `They don't have to open it, and they never lose control. It works through the surfaces they already use — email, chat, phone. The work happens in the background: drafting, preparing, proposing. One tap to approve before anything goes out. No new interface. Nothing sends without them knowing.` | 360 | 62 | 8 | 7 | Longest answer ≈ 345 |

---

### Section 12 — Footer CTA + Footer

**Purpose:** final conversion push + site footer nav.

**Semantic/DOM:** green-gradient CTA panel (H2 · one-line sub · dual CTA) → `<footer>` with logo, nav-link columns, legal links, social icons, copyright, optional credit line.

**Grid/layout:** CTA panel above; footer with logo + nav-link columns + legal + socials + copyright.

**Responsive**
- Desktop: full CTA panel; multi-column footer.
- Tablet: panel full-width; footer columns collapse to 2.
- Mobile: single column throughout.

**Content slots**

| Slot ID | Element | Placeholder text | Max chars | Max words | Max lines | Repeat | Notes |
|---|---|---|---|---|---|---|---|
| S12.1 | h2 | `Stop managing tools. Start executing.` | 40 | 6 | 2 | 1 | Word-reveal |
| S12.2 | sub-line | `Every day without this is forty minutes per person you're not getting back.` | 70 | 14 | 2 | 1 | |
| S12.3 | primary CTA | `Start now` | 12 | 2 | 1 | 1 | Accent pill |
| S12.4 | secondary CTA | `Book a demo for a team` | 24 | 5 | 1 | 1 | Ghost pill |
| S12.5 | footer nav link | `How it works` | 18 | 3 | 1 | 7 | How it works / Pricing / About / Blog / Privacy / Terms / Security |
| S12.6 | copyright | `© 2026 RightClick:AI. All rights reserved.` | 44 | 6 | 1 | 1 | |
| S12.7 | credit line | `Website designed by Studio` | 32 | 4 | 1 | 1 | Optional |
| S12.8 | social icon link | *(icon)* | — | — | 1 | 4 | Placeholder social icons |

---

## 5. Placeholder / dummy-content convention

Placeholder strings use generic dummy text sized to the real budget. Ben replaces them in a later copy session. **Do not ship the dummy copy.** Logos, avatars, and the hero Lottie are placeholder assets (§7).

---

## 6. Consolidated content-budget summary

> Every slot on the page with its budget. **Total defined slots: 71** distinct slot IDs (S0.1–S12.8) across 13 section blocks (0–12). *(The merged source labelled this "~62"; the actual enumerated count is 71 — every original row is preserved.)*

| Slot ID | Section | Element | Max chars | Max words | Max lines | Repeat |
|---|---|---|---|---|---|---|
| S0.1 | Nav | logo | — | — | 1 | 1 |
| S0.2 | Nav | nav link | 16 | 2 | 1 | 3–4 |
| S0.3 | Nav | login link | 10 | 1 | 1 | 1 |
| S0.4 | Nav | nav button | 16 | 3 | 1 | 1 |
| S1.1 | Hero | eyebrow | 30 | 5 | 1 | 1 |
| S1.2 | Hero | h1 | 42 | 7 | 2 | 1 |
| S1.3 | Hero | sub-paragraph | 135 | 24 | 3 | 1 |
| S1.4 | Hero | primary CTA | 12 | 2 | 1 | 1 |
| S1.5 | Hero | secondary CTA | 24 | 5 | 1 | 1 |
| S1.6 | Hero | illustration | — | — | — | 1 |
| S2.1 | Before/After | eyebrow | 20 | 3 | 1 | 1 |
| S2.2 | Before/After | h2 | 44 | 9 | 2 | 1 |
| S2.3 | Before/After | col label Before | 10 | 1 | 1 | 1 |
| S2.4 | Before/After | before row | 78 | 14 | 3 | 4 |
| S2.5 | Before/After | col label After | 10 | 1 | 1 | 1 |
| S2.6 | Before/After | after row | 52 | 10 | 2 | 4 |
| S3.1 | Statement | h2 statement | 66 | 13 | 2 | 1 |
| S3.2 | Statement | trusted-by label | 14 | 2 | 1 | 1 |
| S3.3 | Statement | logo | — | — | 1 | 6 |
| S4.1 | Bento | eyebrow | 18 | 2 | 1 | 1 |
| S4.2 | Bento | h2 | 54 | 9 | 2 | 1 |
| S4.3 | Bento | intro paragraph | 82 | 15 | 2 | 1 |
| S4.4 | Bento | card index | 5 | 1 | 1 | 6 |
| S4.5 | Bento | card title | 34 | 5 | 2 | 6 |
| S4.6 | Bento | card body | 200 | 34 | 5 | 6 |
| S4.7 | Bento | card CTA | 14 | 2 | 1 | 1 |
| S5.1 | Stats | eyebrow | 14 | 2 | 1 | 1 |
| S5.2 | Stats | h2 | 30 | 5 | 1 | 1 |
| S5.3 | Stats | sub-line | 48 | 9 | 1 | 1 |
| S5.4 | Stats | stat value | 4 | 1 | 1 | 4 |
| S5.5 | Stats | stat label | 36 | 6 | 2 | 4 |
| S6.1 | Gap circle | caption | 80 | 14 | 2 | 1 |
| S7.1 | Win circles | eyebrow | 24 | 4 | 1 | 1 |
| S7.2 | Win circles | h2 | 44 | 8 | 2 | 1 |
| S7.3 | Win circles | sub-line | 84 | 13 | 2 | 1 |
| S7.4 | Win circles | circle label | 34 | 6 | 2 | 2 |
| S7.5 | Win circles | tooltip line | 66 | 12 | 2 | 6 |
| S7.6 | Win circles | primary CTA | 12 | 2 | 1 | 1 |
| S7.7 | Win circles | secondary CTA | 24 | 5 | 1 | 1 |
| S8.1 | Step wheel | eyebrow | 16 | 2 | 1 | 1 |
| S8.2 | Step wheel | h2 | 32 | 6 | 1 | 1 |
| S8.3 | Step wheel | intro paragraph | 104 | 16 | 2 | 1 |
| S8.4 | Step wheel | step label | 12 | 2 | 1 | 6 |
| S8.5 | Step wheel | step body | 50 | 8 | 2 | 6 |
| S8.6 | Step wheel | link | 14 | 2 | 1 | 1 |
| S9.1 | Timeline | eyebrow | 26 | 4 | 1 | 1 |
| S9.2 | Timeline | h2 | 64 | 12 | 2 | 1 |
| S9.3 | Timeline | intro paragraph | 145 | 25 | 3 | 1 |
| S9.4 | Timeline | month label | 10 | 2 | 1 | 4 |
| S9.5 | Timeline | month title | 32 | 6 | 2 | 4 |
| S9.6 | Timeline | month body | 44 | 8 | 2 | 4 |
| S9.7 | Timeline | CTA card headline | 70 | 13 | 3 | 1 |
| S9.8 | Timeline | CTA card primary | 12 | 2 | 1 | 1 |
| S9.9 | Timeline | CTA card secondary | 24 | 5 | 1 | 1 |
| S10.1 | Testimonials | eyebrow | 16 | 1 | 1 | 1 |
| S10.2 | Testimonials | h2 | 24 | 4 | 1 | 1 |
| S10.3 | Testimonials | quote | 230 | 40 | 5 | 6 |
| S10.4 | Testimonials | author name | 28 | 3 | 1 | 6 |
| S10.5 | Testimonials | author role | 44 | 6 | 1 | 6 |
| S11.1 | FAQ | h2 | 20 | 3 | 1 | 1 |
| S11.2 | FAQ | sub-line | 40 | 7 | 1 | 1 |
| S11.3 | FAQ | question | 74 | 13 | 2 | 7 |
| S11.4 | FAQ | answer | 360 | 62 | 8 | 7 |
| S12.1 | Footer CTA | h2 | 40 | 6 | 2 | 1 |
| S12.2 | Footer CTA | sub-line | 70 | 14 | 2 | 1 |
| S12.3 | Footer CTA | primary CTA | 12 | 2 | 1 | 1 |
| S12.4 | Footer CTA | secondary CTA | 24 | 5 | 1 | 1 |
| S12.5 | Footer | footer nav link | 18 | 3 | 1 | 7 |
| S12.6 | Footer | copyright | 44 | 6 | 1 | 1 |
| S12.7 | Footer | credit line | 32 | 4 | 1 | 1 |
| S12.8 | Footer | social icon | — | — | 1 | 4 |

**Repeatable-item counts to plan copy against:** Before rows ×4, After rows ×4, trusted-by logos ×6, bento cards ×6, stat circles ×4, Venn tooltip lines ×6 (3 per side), step cards ×6, month cards ×4, testimonial slides ×6, FAQ items ×7, footer nav links ×7.

---

## 7. Assets & placeholders (structural)

> Font choices → DESIGN.md. Motion libraries & licensing → ANIMATION-SPEC.md.

- **Hero Lottie (S1.6)** — zig's real hero is a licensed 24fps / 192-frame / 74-layer `.lottie` (2500×887) with 4 responsive exports (2500 / 1280 / 820 / 420). **Do not reuse zig.ai's file.** Commission/build a placeholder node-graph `.lottie`, or ship a static SVG poster + CSS/GSAP fallback. Provide 4 breakpoint exports; only the visible one plays. (Scrub mechanics: ANIMATION-SPEC §Section 1.)
- **Logos (S3.3 ×6)** — placeholder grayscale blocks. Real client logos require permission before launch.
- **Testimonial avatars/names (S10.4–S10.5)** — placeholder. Real quotes require client sign-off.
- **Icons** — bento/step/social icons are placeholders (open set, e.g. Lucide/Phosphor). The rotating badge on the red bento card (Section 4) = brand mark; substitute Ben's `RightClick:AI` mark.
- **Copy** — all placeholder strings are dummy text sized to budget. Replace before launch (deferred copy session).

---

## 8. Values marked TBD (structural)

| Item | Status | Guidance |
|---|---|---|
| Exact bento tile size ratios (Section 4) | `TBD` | Asymmetric 2-col bento; reconstruct proportions from `standalone-3nm-v2/references/zig-sheets/`. |
| Per-element vertical spacing values | `TBD` | Spacing *scale* is defined in DESIGN.md; exact per-section rhythm left to the build. |

Visual TBDs (card radius, testimonial bg hex, flood-green reconciliation) now live in DESIGN.md §9.

---

## Appendix — source-of-truth pointers

- Motion timings/eases: `standalone-3nm-v2/references/zig ai analysis/ZIG-MOTION-SPEC-MASTER.md`
- Verbatim GSAP: `standalone-3nm-v2/references/zig ai analysis/zig-gsap-source.js`
- Raw Webflow IX2 keyframes: `standalone-3nm-v2/references/zig ai analysis/zig-webflow-ix2.json`
- Section narrative + real copy: `standalone-3nm-v2/references/zig ai analysis/zig-motion-storyboard.md`
- Visual layout reference: `standalone-3nm-v2/references/zig-sheets/` (1fps contact sheets)
- Design tokens: extracted live from https://zig.ai, 2026-07-28 (see DESIGN.md)
