# DESIGN.md — 3nm-v2 Landing Page · Visual Identity

> **Visual identity only** — color, typography, spacing, radius, elevation, look & feel. This borrows zig.ai's *technique* (full-bleed color-floods, section recolor) but recolors everything to the RightClick:AI brand.
> **Companions:** site skeleton + slots → **SPEC.md** · motion contract → **ANIMATION-SPEC.md**. Section IDs 0–12 are the shared key (e.g. "layout: SPEC §Section 8 · motion: ANIMATION-SPEC §Section 8").
> **Extraction source of truth:** `standalone-3nm-v2/references/zig ai analysis/`. Design tokens were extracted live from [zig.ai](https://zig.ai) on 2026-07-28 and are used for *structure* (scale relationships), never for brand color/type — the brand atoms (§1) override.

---

## 1. Brand atoms (LOCKED — these override every extracted zig.ai token)

> RightClick:AI's identity. Where these conflict with the zig.ai reference tokens (§4), **these win.** Use the zig token block for *structure* (spacing-scale/type-scale relationships), not for brand color/type.

**LOCKED atoms (non-negotiable — override any reference)**
- **Logo:** `RightClick:AI` wordmark, `:AI` as accent span. Mark SVG reused.
- **Primary color:** forest green `#15803D` (`oklch(~0.55 0.13 152)`). Neutrals tinted warm, NOT cool.
- **Neutrals:** warm paper `#FAFAF7` / warm sand `#F3F1EB` / operator-black `#08100A`–`#0D120F`. Never pure `#000`/`#FFF`.
- **Voice:** direct, grounded, first-person "I build". No softeners.

**Typography (MAX 2):** Body = **Satoshi** (Fontshare). Display = a grotesk *visibly distinct* from Satoshi (Geist / Space Grotesk candidates — decide at build). Scale ratio ≥1.3; display weight 500–600, body 400/500; body line length 65–75ch. *(Overrides zig's Archivo/Azeret Mono in §4.)*

**Taste lane:** minimalist (editorial, restrained). Light / warm-paper default; dark and green sections as rare weighty punctuation. Motion: ease-out-quart/quint, no bounce; everything behind `prefers-reduced-motion`.

---

## 2. Approved color direction (Ben confirmed 2026-07-28)

This is the resolution of the old "restrained ≤10% green vs zig's green-flood" conflict. Rule of thumb: **identity wins on brand atoms; borrow zig's technique in Ben's hue.**

1. **Identity wins on brand atoms.** Warm-paper background, forest green `#15803D` as brand primary, and the LOCKED Satoshi type family (§1) — **not** zig's Archivo. Zig's px type-scale (§5) may inform sizing; the family stays Satoshi.
2. **Borrow zig's technique, recolored.** Full-bleed section color-floods are allowed, but recolored to **forest green `#15803D`** (not zig's `#08906c`). One near-black interlude section is allowed at **`#15171a`**.
3. **One hot CTA accent.** Adopt **coral `#ce3c2b`** as the single accent used **only for primary CTAs**. Terracotta (~`#C65D3B`) is a noted swappable alternative.

### 2.1 The green-flood exception (deliberate, per-section)

The brand's default strategy is **restrained**: tinted warm neutrals carry ~90%; forest green is a RARE accent (≤10%, "one green thing per view"); red/amber only inside problem-state dashboard mocks.

**The flood sections intentionally override the ≤10%-green rule.** This is a deliberate per-section exception, keyed to which sections flood:

| Section | Flood / dark treatment | Overrides ≤10% rule? |
|---|---|---|
| §Section 6 — Gap transition | brand-green circle grows to fill, wiping paper → dark | Yes (green as full wipe) |
| §Section 7 — Win circles / Venn | dark interlude flood `#15171a` | Dark, not green |
| §Section 8 — Step wheel | **full forest-green flood `#15803D`** | Yes (whole-section green) |
| §Section 9 — Month timeline | green → paper fade-out; final tile is red CTA card | Partial (green fading out) |
| §Section 10 — Testimonials | dark interlude flood `#15171a` | Dark, not green |
| §Section 12 — Footer CTA | green-gradient flood | Yes (whole-panel green) |
| §Section 4 — Bento | one red tile + one accent-green tile (not full flood) | Local accents only |

Everywhere **outside** these keyed sections, hold the restrained ≤10%-green discipline: warm-paper base, green as a single accent per view. Body-background recolor mechanics for the flood/dark transitions live in **ANIMATION-SPEC.md §4**.

---

## 3. Color-role table (resolved hexes — build against these)

| Role | Hex | Notes |
|---|---|---|
| **bg default** (warm paper) | `#FAFAF7` | Page background, light sections. Never pure white. |
| **bg surface** (warm sand) | `#F3F1EB` | Cards, raised tiles on paper. |
| **bg flood** (brand green) | `#15803D` | Full-section floods: §8 step wheel, §12 footer CTA; §6 wipe circle. Recolor of zig's `#08906c`. |
| **bg dark** (interlude) | `#15171a` | Near-black flood: §7 win circles, §10 testimonials. |
| **text default** (operator-black) | `#0D120F` | Body/headings on light. Range `#08100A`–`#0D120F`. Never pure black. |
| **text on dark/flood** | `#FAFAF7` / `#FFFFFF` | Warm paper (or white) on green/dark sections. |
| **brand primary** (forest green) | `#15803D` | Accent word, brand mark, one green thing per light view. `oklch(~0.55 0.13 152)`. |
| **CTA accent** (coral) | `#ce3c2b` | **Primary CTAs only.** Alt: terracotta ~`#C65D3B`. Also the §4 red bento tile + §9 red CTA card. |
| **borders / hairlines** | `#E7E3D9` | Warm hairline (derived — see §9). Prefer hairlines over shadows. |
| **muted / secondary text** | `#6B6459` | Warm gray for captions, eyebrows, placeholder (derived — see §9). |

Derived values (`#E7E3D9`, `#6B6459`) are warm-neutral recolors of zig's cool grays; confirm exact tints at build (§9).

---

## 4. zig.ai color palette — extracted (structural reference only)

Extracted live from zig.ai (CSS custom props `--_zig---*`). Use to understand zig's *role assignments*; **recolor to §1–§3 brand.** Do not ship these hues.

| Token | Hex | Role on zig.ai | → Brand mapping |
|---|---|---|---|
| `--c-black` | `#15171a` | Text; dark-section bg | Kept as **bg dark** `#15171a` |
| `--c-white` | `#ffffff` | Card surfaces, text on dark/green | → warm paper `#FAFAF7` / white on dark |
| `--c-gray-50` | `#f2f6f5` | Page background (light) | → warm paper `#FAFAF7` |
| `--c-gray-100` | `#d9dfde` | Hairlines, dividers | → warm hairline `#E7E3D9` |
| `--c-gray-200` | `#bec9c6` | Borders | → warm border |
| `--c-gray-300` | `#a5b2af` | Muted UI | → warm muted |
| `--c-gray-400` | `#8b9a96` | Placeholder text | → warm muted `#6B6459` |
| `--c-gray-500` | `#73817e` | Secondary body text | → warm secondary |
| `--c-gray-600` | `#5c6764` | Body text on light | → operator-black tint |
| `--c-gray-700` | `#454e4c` | Strong body | → operator-black |
| `--c-gray-800` | `#2e3332` | Near-black text | → operator-black `#0D120F` |
| `--c-green-500` | `#08906c` | zig brand green (section bg, accent, left Venn) | → **brand `#15803D`** |
| `--c-green-400` | `#37a88a` | Green hover | → brand green hover (lighten `#15803D`) |
| `--c-green-100` | `#c4ece1` | Green tint surface | → brand green tint |
| `--c-coral-500` | `#ce3c2b` | zig CTA red | → **CTA accent `#ce3c2b`** (adopted) |
| `--c-coral-400` | `#e06f68` | CTA hover | → coral hover |
| `--c-coral-50` | `#fbeeec` | Coral tint | → coral tint |
| `--c-blue-300` | `#87bbd9` | Accent (right Venn circle) | keep for §7 right circle only |
| `--c-blue-500` | `#478fb8` | Blue accent strong | not used (brand) |
| `--c-blue-700` | `#2b4d60` | Deep blue | not used |
| `--c-purple-500` | `#ac49d8` | Sparingly-used accent | not used |
| `--c-error-red` | `#f44336` | Form validation only | keep for form errors |

Full zig ramp also includes green-50/200/300, coral-100/200/300, blue-50/100/200/400, purple-50–400, gray-100–800. Recolor the whole system to the warm-neutral + forest-green brand.

---

## 5. Typography

**Brand families (LOCKED, from §1):** Body = **Satoshi** (Fontshare); Display = grotesk visibly distinct from Satoshi (Geist / Space Grotesk — decide at build). Self-hostable. zig's Archivo + Azeret Mono are **not used** — recorded below only as scale reference.

**zig extracted (family overridden; scale kept):**

| Token | Value | Notes |
|---|---|---|
| zig primary family | Archivo, Arial, sans-serif | *(reference only — brand uses Satoshi)* |
| zig mono family | Azeret Mono | Eyebrows / index labels ("/ 01") — substitute a brand mono/grotesk |
| Weight regular / medium / bold | 400 / 500 / 700 | zig h1 renders at 500 |

**Type scale (px @ 16px root — reuse these relationships):**

| Token | rem | px | Used for |
|---|---|---|---|
| `title-xl` | 4.5rem | **72px** | Hero H1 |
| `title-l` | 3.625rem | 58px | Big section H2 |
| `title-m` | 2.25rem | 36px | Section H2 (standard) |
| `title-s` | 1.75rem | 28px | Card titles, sub-statements |
| `title-xs` | 1.375rem | 22px | Small card titles |
| `text-xl` | 1.25rem | 20px | Lead paragraphs |
| `text-l` | 1.125rem | 18px | Body large / chips |
| `text-m` | 1rem | 16px | Body |
| `text-s` | 0.875rem | 14px | Captions, nav links, eyebrows, buttons |

**Line-heights:** `100%` display · `110%` H1/H2 · `120%` titles · `130%` · `140%` body.
**Letter-spacing:** headings `-0.03 / -0.02 / -0.01em`; body `0`.
**Reference measure:** H1 72px / 86.4px LH / weight 500. Apply the brand's ≥1.3 scale ratio and weight-contrast rules (§1); display weight 500–600, body 400/500; body measure 65–75ch.

---

## 6. Spacing scale

`4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 32 · 38 · 40 · 42 · 44 · 48 · 50 · 52 · 60 · 64 · 80 · 90 · 100 · 105 · 120 · 140` (px, 8-based with half-steps).

Section vertical padding: **80–140px** desktop, **48–64px** mobile. (Container width and breakpoints are structural — see SPEC.md §2.)

---

## 7. Radius, elevation & buttons

| Token | Value | Use |
|---|---|---|
| Button radius | `5rem` (80px, pill) | zig buttons are full pills — reconcile with brand button style at build |
| Card radius | `16–24px` (`TBD` exact — §9) | Cards, bento tiles |
| Circle | `50%` | Stat circles, Venn circles, badges |

**Elevation:** minimalist/editorial lane — prefer **hairline borders** (`#E7E3D9`) over drop-shadows. Reserve any real elevation for cards on flood/dark sections. No heavy shadows. (No explicit elevation token was extracted; keep flat.)

---

## 8. Easing vocabulary (design token)

The motion *mechanics* live in ANIMATION-SPEC.md; the easing **vocabulary** is a shared design token, listed here so color/motion stay coherent:

`power4.out` · `power2.out` / `power2.in` · `inOutCubic` · `inOutQuad` · `easeInOut` · `outCubic` · `ease:'none'` (linear, for scrubbed motion).

**Brand rule:** ease-out-quart/quint feel, **no bounce**. None of zig's eases bounce, so they are compatible. All scrubbed sections stay linear. Full per-section params: **ANIMATION-SPEC.md §2 + §5**.

---

## 9. Values marked TBD (visual)

| Item | Status | Guidance |
|---|---|---|
| Card border-radius (non-button) | `TBD` | Not isolated in the token dump; 16–24px reads correct vs screenshots. Confirm at build. |
| Testimonial section exact bg hex (§10) | `TBD` (dark navy) | Using `#15171a`; confirm a near-navy from screenshots if desired. |
| Warm-neutral border/muted hexes (`#E7E3D9`, `#6B6459`) | `TBD` (derived) | Warm recolors of zig's cool grays; fine-tune tints against the paper base at build. |
| Green-flood reconciliation vs ≤10% rule | **RESOLVED** | Ben approved the per-section flood exception (§2.1). Kept here for record. |
| Per-element vertical spacing | `TBD` | Scale defined (§6); exact per-section rhythm left to the build (see SPEC.md §8). |

---

## Appendix — source-of-truth pointers

- Design tokens: extracted live from https://zig.ai, 2026-07-28 (§4–§7 above)
- Motion timings/eases: `standalone-3nm-v2/references/zig ai analysis/ZIG-MOTION-SPEC-MASTER.md`
- Verbatim GSAP: `standalone-3nm-v2/references/zig ai analysis/zig-gsap-source.js`
- Raw Webflow IX2 keyframes: `standalone-3nm-v2/references/zig ai analysis/zig-webflow-ix2.json`
- Visual layout reference: `standalone-3nm-v2/references/zig-sheets/` (1fps contact sheets)
