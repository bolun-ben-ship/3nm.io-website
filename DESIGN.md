---
name: RightClick:AI
description: Custom internal software for Singapore service businesses, built function by function.
colors:
  bg: "#FAFAF7"
  bg-warm: "#F3F1EB"
  bg-dark: "#08100A"
  surface-dark-elevated: "#0F1A12"
  ink: "#0D120F"
  ink-mid: "#374840"
  ink-muted: "#6B7D74"
  ink-faint: "#B8C4BE"
  accent: "#15803D"
  accent-hover: "#166534"
  accent-light: "#F0FDF4"
  accent-on-dark: "#6FBF8E"
  border: "rgba(13, 18, 15, 0.07)"
  border-mid: "rgba(13, 18, 15, 0.12)"
  border-on-dark: "rgba(255, 255, 255, 0.07)"
  border-on-dark-mid: "rgba(255, 255, 255, 0.14)"
  state-error: "#DC2626"
  state-error-on-dark: "#F87171"
  state-warn: "#92400E"
typography:
  display:
    fontFamily: "Satoshi, -apple-system, sans-serif"
    fontSize: "clamp(38px, 5.2vw, 60px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Satoshi, -apple-system, sans-serif"
    fontSize: "clamp(28px, 3.5vw, 44px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Satoshi, -apple-system, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Satoshi, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body-lead:
    fontFamily: "Satoshi, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Satoshi, -apple-system, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  pill: "20px"
  card-sm: "6px"
  card: "12px"
  card-lg: "14px"
  panel: "16px"
spacing:
  pad-x: "clamp(20px, 5vw, 72px)"
  section-y: "clamp(80px, 10vw, 128px)"
  max-w: "1160px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.card-sm}"
    padding: "13px 28px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-mid}"
    rounded: "{rounded.card-sm}"
    padding: "12px 24px"
  button-dark:
    backgroundColor: "rgba(255,255,255,0.08)"
    textColor: "rgba(255,255,255,0.85)"
    rounded: "{rounded.card-sm}"
    padding: "13px 28px"
  button-white:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.card-sm}"
    padding: "14px 32px"
  card-light:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.card-lg}"
    padding: "22px 24px"
  card-dark:
    backgroundColor: "{colors.surface-dark-elevated}"
    rounded: "{rounded.card-lg}"
    padding: "20px"
  pill-accent:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
---

# Design System: RightClick:AI

## 1. Overview

**Creative North Star: "The Operator's Desk"**

This is the desk of a working operator, not the lobby of an agency. Warm paper-cream surfaces carry the typography. Tight, instrument-grade dashboard inserts (the hero contrast card, the rec-visual card, the dark live-preview panel, the cycle tracker) puncture the calm with real numbers, real status badges, real KPI strips. The dashboards aren't decorative; they earn their space because the offer is *also* a dashboard. The page demonstrates the product by being the product's quieter, paper-bound cousin.

The aesthetic is forest-green-on-warm-cream with structured dark surfaces for emphasis. It rejects the AI-agency reflex (purple/blue gradients, glassmorphism, gradient text, hero-metric template). It rejects the Linear/Notion/Stripe-clone reflex (cool grey on white, Inter, identical card grids). It rejects the editorial-magazine reflex (display serif italic, drop caps, ruled separators). The closest reference points are Stripe-restraint *with a warmer base* and Vercel-utility *with a softer surface*, but neither is right — this brand needs its own lane.

Density is medium-high. Sections breathe but the page is information-rich; the buyer should feel they got a thorough briefing, not a teaser. Composition is asymmetric where it serves the narrative (hero, recognition, model, foundation, comparison) and gridded where the affordance demands it (commitments, functions, time horizon).

**Key Characteristics:**
- Forest green over AI-default purple/blue. The accent is the brand.
- Warm paper background (`#FAFAF7`) over cool clinical white.
- Single-family typography (Satoshi) carrying the entire system.
- Instrument-grade dashboard inserts as proof-of-product.
- Numbers, dates, and dollar amounts on every claim — visible accountability.
- Asymmetric narrative composition with structured grids only where they earn it.
- Mostly flat with selective depth (one floating hero card, light shadows on lifted surfaces).

## 2. Colors

The palette is **committed monochrome neutrals + one strategic accent**. Forest green carries the brand; everything else is warm-tinted greyscale. Dark surfaces are reserved for moments where the offer needs weight (price bars, time-horizon section, live preview panel, closing CTA).

### Primary
- **Forest Operator Green** (`#15803D`): the brand. Used for primary CTAs, accent text, status dots, eyebrow labels, "us" cells in the comparison table, the foundation badge pulse. Never used as a background fill on light surfaces (would dominate); used as a 4–10% tint (`#F0FDF4`) when a green surface is needed.

### Neutral (light surfaces)
- **Warm Paper** (`#FAFAF7`): default page background. Slightly warmer than off-white; reads as paper, not screen.
- **Warm Sand** (`#F3F1EB`): secondary surface. Used on `#recognition`, `#foundation`, `#commitments`, the tools ticker, hover states for `.btn-ghost`. Provides separation without introducing cool grey.
- **White** (`#FFFFFF`): used for cards that lift off the page (hero contrast card, rec-visual card, function items at 50% alpha, foundation `.fn-item`).

### Neutral (text on light)
- **Body Ink** (`#0D120F`): primary text. Warm-black, never pure black.
- **Mid Ink** (`#374840`): secondary copy, prehire-body paragraphs.
- **Muted Ink** (`#6B7D74`): subdued copy, hero-sub text, fn-desc.
- **Faint Ink** (`#B8C4BE`): de-emphasised labels, the disclaimer line.

### Dark surface palette (for `#bg-dark` sections)
- **Operator Black** (`#08100A`): backgrounds for time-horizon, live-preview, closing CTA, footer.
- **Elevated Dark** (`#0F1A12`): dashboard cards on dark surfaces.
- **Light Forest** (`#6FBF8E`): the green accent on dark backgrounds. Slightly less saturated than the light-mode accent so it doesn't strobe.

### Borders and divisions
- `rgba(13, 18, 15, 0.07)` — default divider.
- `rgba(13, 18, 15, 0.12)` — emphasised divider (around cards, grid borders).
- `rgba(255, 255, 255, 0.07)` — divider on dark surfaces.

### State colors (used sparingly in dashboard mocks only)
- **Error** (`#DC2626` light, `#F87171` dark): badges showing operational failure states ("Manual," "Late") in the demo dashboards.
- **Warn** (`#92400E` light): badges for soft warnings ("Guess," "Stalled").

### Named Rules

**The Single Accent Rule.** Forest green is the only saturated colour. Reds and ambers exist solely inside dashboard mocks to show the *problem state* the product solves. They never appear in primary nav, CTAs, or page chrome. If a future page introduces a second saturated brand colour, that is a strategic decision, not a styling whim.

**The No-Pure-Black Rule.** Never `#000`. Never `#FFF` for primary text. Backgrounds tilt warm (`#FAFAF7` not `#FAFAFA`); ink tilts warm (`#0D120F` not `#1A1A1A`). The warmth is the brand's signature.

**The Dark-Surface-Earns-Its-Place Rule.** Dark sections are structural emphasis, not decorative variety. They carry: the price bar (the offer), time-horizon (the strategic stakes), live-preview (the product mock), closing CTA (the conversion). Adding more dark sections dilutes their weight.

## 3. Typography

**Display & Body Font:** Satoshi (`@font-face` from Fontshare). Single family, weights 300 / 400 / 500 / 600 / 700 / 900.

**Character:** Satoshi is geometric humanist. It carries technical authority without IBM Plex's defaultness or Inter's flatness. Tight tracking on headlines (`-0.025em` to `-0.03em`) gives the display sizes a confident, finished feel. Body sits at default tracking with generous line-height (1.6–1.7) for long-form readability.

### Hierarchy
- **Display** (700, `clamp(38px, 5.2vw, 60px)`, line-height 1.06, letter-spacing -0.03em): the hero headline. The single largest type on the page; carries the diagnostic statement ("Late reports. Fuzzy forecasts. Stalled handoffs. *Work that never gets done.*"). Italic-non-italic mix (`<em>` styled to non-italic green) creates emphasis without typographic mode-switching.
- **Headline** (700, `clamp(28px, 3.5vw, 44px)`, line-height 1.12, letter-spacing -0.025em): section H2s. One per section.
- **Title** (700, 18px, line-height 1.25, letter-spacing -0.01em): card titles, model-step names, fn-name.
- **Body Lead** (400, 17px, line-height 1.65): hero-sub and high-emphasis introductory paragraphs.
- **Body** (400, 16px, line-height 1.6): default page body.
- **Body Small** (400, 13.5–14.5px, line-height 1.55–1.7): card body copy, FAQ answers, fn-desc.
- **Body Tiny** (400/500, 12–13px): metadata, captions, sub-labels.
- **Label** (600/700, 9–11px, letter-spacing 0.06–0.12em, uppercase): section labels, eyebrow text, status pills, table headers. The label scale is wider (more `letter-spacing`) the smaller the font, to maintain readable rhythm at tiny sizes.

Body line length is roughly 60–75ch; hero-sub is capped at `max-width: 500px`, prehire-body at 720px, foundation-sub at 680px, model-sub at 560px. Maximum width is the implicit ceiling.

### Named Rules

**The One-Family Rule.** Satoshi alone. No serif companion, no mono companion. The brand is technical but not terminal-coded; the offer is operational but not editorial. A single committed family with weight and tracking contrast is stronger than a timid display+body pair.

**The Headline Italic Trick.** The `<em>` element inside hero-h1 and prehire-h2 is styled `font-style: normal; color: var(--accent)` — emphasis through colour swap, not italic mode-switch. This keeps the visual rhythm tight and gives the green a narrative role. Don't use real italic for emphasis on display sizes; reserve italic for citations, foreign phrases, or stylistic deliberate choices.

**The Tracking-Inversion Rule.** Display sizes track tight (-0.025 to -0.03em). Label sizes track wide (0.06–0.12em uppercase). The reversal is intentional: large type benefits from tightness; small type benefits from openness.

## 4. Elevation

The system is **mostly flat with selective elevation**. There is no shadow ladder, no Material-style elevation tokens. Surfaces lift only when they need to read as instruments — dashboard cards, the hero contrast card, the rec-visual sticky card. Everything else uses borders and background tonal shifts to create separation.

### Shadow Vocabulary

- **Subtle Lift** (`box-shadow: 0 2px 16px rgba(13, 18, 15, 0.05)`): used on `.rec-visual-card`. Reads as "this is a window into the system."
- **Card Lift** (`box-shadow: 0 4px 24px rgba(13, 18, 15, 0.06), 0 1px 3px rgba(13, 18, 15, 0.04)`): used on `.hero-contrast`. Two-layer (large soft + crisp tight) gives the card a real-paper quality.
- **Hover Glow** (`box-shadow: 0 8px 24px rgba(21, 128, 61, 0.18)`): only on `.btn-primary:hover`. Green-tinted to reinforce the brand colour as an action signal.
- **Tab Lift** (`box-shadow: 0 1px 4px rgba(13, 18, 15, 0.1)`): only on `.path-btn.active` inside the path toggle. Subtle but visible.
- **Nav Hairline** (`box-shadow: 0 1px 0 var(--border)`): only on `nav.scrolled`. Not a real shadow — a 1px line that asserts the nav has separated from the content.

### Backdrop Effects

- **Nav Glass** (`backdrop-filter: blur(16px)` on `nav.scrolled` with `background: rgba(250, 250, 247, 0.93)`): the only glassmorphism on the site. Justified because it solves a real problem (nav must stay legible over varied content) and is invisible above the fold (the nav has no shadow until the user scrolls).

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to a real need — a card representing the *product itself*, a button hovering, the sticky nav crossing into content. New components default to no shadow.

**The Glass-Once Rule.** One backdrop-blur on the entire site (the nav). Adding a second instance — a glass card, a glass modal — breaks the discipline and pushes the design toward the AI-agency aesthetic this brand explicitly rejects.

## 5. Components

### Buttons

**Shape:** 6px radius (`{rounded.card-sm}`), inline-flex with a centered icon gap (8px primary, 6px ghost).

- **Primary** (`#15803D` bg, white text, 13px/28px padding, weight 600): the dominant CTA. Hover: `accent-hover` background + `translateY(-1px)` lift + green-tinted glow shadow. Active: returns to base position with `scale(0.98)`. **Note (audit):** the active-state scale value is `scale(0.98)`, but `.btn-ghost` and `.btn-dark` have *no* active state — see Do's and Don'ts.
- **Ghost** (transparent bg, ink-mid text, 1px border-mid border, 12px/24px padding, weight 500): secondary CTA. Hover: deeper text, deeper border, `bg-warm` background. **No active state currently — needs one.**
- **Dark** (white-alpha bg, white-alpha text, white-alpha border, 13px/28px padding, weight 600): used inside dark sections (closing CTA, dark price bar). Hover: lifts alpha values.
- **White** (white bg, ink text, 14px/32px padding, weight 700): used on dark surfaces as a high-contrast primary CTA. Full-width by default.

**Transition behaviour:** all buttons use `transition: <property> 0.15s, <property> 0.2s` style. **Note (Emil-design-eng review):** these should be specified per-property with explicit easing, not relying on default `ease`. See the Do's and Don'ts.

### Cards

- **Card-light** (`#FFFFFF` bg, `border-mid` border, 14px radius, 22–34px padding): hero-contrast, rec-visual-card, fn-card-base, fn-definition.
- **Card-soft** (`rgba(255,255,255,0.5)` or `rgba(255,255,255,0.7)` bg over `bg-warm`, 12px radius): foundation `.fn-item`, `.data-conn-item`. Used inside `bg-warm` sections to create gentle subdivision without introducing fully white surfaces.
- **Card-dark** (`#0F1A12` bg, white-alpha border, 14px radius, 16–24px padding): dashboard cards (`.dash-card`, `.mini-dash`). Always carries the three-dot title bar simulating a real dashboard window.

### Pills, Badges, Eyebrows

- **Pill-accent** (`accent-light` bg, `accent` text, 20px radius, 4px/11px padding, 11px label type): foundation badge with pulse-dot.
- **Pill-state-error / pill-state-warn / pill-state-neutral**: used only inside dashboard mocks. 20px radius, semantically tinted backgrounds.
- **Eyebrow** (`accent` colour, 10–11px, weight 600–700, 0.1em letter-spacing, uppercase, `margin-bottom: 16px`): the section-label pattern. One per section, above the H2.

### Comparison Table (`.vs-table`)

Five-column grid (`140px 1fr 1fr 1fr 1fr`), 14px radius, `min-width: 760px` with horizontal scroll on mobile. Last column (`.us`) has `bg: var(--ink)` header and 4% accent-tinted body cells with the accent-coloured "us" content. The visual weight progression (neutral → neutral → neutral → accent) is the rhetorical structure: three alternatives, then the pitch.

### FAQ Accordion

- 18px `+` icon that rotates 45° to `×` on open (300ms cubic-bezier(0.16, 1, 0.3, 1)).
- `max-height: 0` → `max-height: 500px` transition for the answer panel (400ms).
- Single-open behaviour (opening one closes others).
- `aria-expanded` is updated; `role="button"` is implicit via `<button>`. **Note (audit):** the `aria-controls` / `aria-labelledby` pair is not set — see Do's and Don'ts.

### Form (Discovery)

Dark surface with white-alpha inputs:
- Input bg: `rgba(255,255,255,0.06)`, border: `rgba(255,255,255,0.11)`, 6px radius, 11px/14px padding.
- Focus: border swaps to `rgba(111, 191, 142, 0.45)` (light-forest green at 45% alpha), bg lifts to `rgba(255,255,255,0.09)`.
- Two-column rows on desktop, collapse to single column at 540px.
- Labels: 10px, weight 700, 0.08em letter-spacing, uppercase, `rgba(255,255,255,0.32)`.
- Submit success replaces the form with a quiet confirmation panel — no toast, no modal.

### Nav

Fixed 64px height, transparent at top, transitions to glass (`backdrop-filter: blur(16px)`, 93% warm-paper bg) when `scrollY > 24`. Logo is left-aligned (icon + wordmark with green colon-AI). Centre-aligned nav links collapse below 680px (mobile menu currently missing — see Do's and Don'ts).

### Animation Patterns

- **Reveal on scroll:** `opacity: 0 → 1`, `translateY(18px) → 0`, 0.65s cubic-bezier(0.16, 1, 0.3, 1) with cascading 80ms delays via `.reveal-d1`–`.reveal-d4`.
- **Pulse dot:** 2s ease-in-out infinite, scaling 0.8 → 1, opacity 0.4 → 1. Used on the foundation badge and the dash-live-ring.
- **Hero card float:** `translateY(0 → -10px → 0)`, 7s ease-in-out infinite. Decorative, applied to `.hero-contrast`.
- **Bar grow:** `transform: scaleY(0) → scaleY(1)`, 1.2s cubic-bezier(0.16, 1, 0.3, 1) with 100ms cascade. Replays via IntersectionObserver when the card enters view.
- **Type-answer:** keyframe steps animation simulating typewriter output. 0.9s `steps(40, end)` after a 2s delay.
- **Tools ticker:** 35s linear infinite horizontal scroll, paused on hover.

## 6. Do's and Don'ts

### Do

- **Do** use forest green (`#15803D`) as the only saturated brand colour. Reds and ambers belong inside dashboard mocks only.
- **Do** keep the cubic-bezier(0.16, 1, 0.3, 1) easing curve as the system's signature exponential ease-out. It's used consistently and works.
- **Do** show numbers, dates, and dollar amounts on every claim. Vague promises read as untrustworthy in this brand.
- **Do** use single Satoshi family with weight contrast for hierarchy. Resist the urge to add a serif "for elegance."
- **Do** keep dark sections rare and weighty (price bar, time-horizon, live-preview, closing). They carry the offer's emphasis.
- **Do** treat dashboard mocks as proof-of-product. They earn their decorative complexity because the offer is also a dashboard.
- **Do** respect `prefers-reduced-motion: reduce` on the floating hero card, the bar-chart growth, the type-answer animation, the ticker, and the cascading reveals. **(Currently missing — see audit.)**
- **Do** match active-state press feedback (`scale(0.98)` or `translateY(0)`) on every clickable element. Currently only `.btn-primary` has this — `.btn-ghost`, `.btn-dark`, `.btn-white`, `.path-btn`, `.faq-q` need it too.

### Don't

- **Don't** introduce purple, blue, or violet anywhere. The forest-green-over-AI-purple stance is the most distinctive visual decision on the site; breaking it dissolves the brand.
- **Don't** add gradient text (`background-clip: text`). Hero emphasis is solid green via `<em>` colour swap. That's the system.
- **Don't** add a second instance of `backdrop-filter: blur()`. The nav glass is the only one. Glass cards, glass modals, glass overlays push the design toward the AI-agency aesthetic this brand rejects.
- **Don't** drift the colour tokens between pages. The current site has token drift between `index.html` (`--accent: #15803D`) and `about.html` (`--accent: #1A5C3A`). **All future work uses the index.html token set.** A consolidation pass to lift the tokens into a shared stylesheet is the right next step.
- **Don't** use `transition: all`. Specify per-property: `transition: background 0.2s ease-out, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease-out`.
- **Don't** use `ease-in` on UI elements. The standard CSS `ease` and `ease-in` defaults are too weak. Use `cubic-bezier(0.16, 1, 0.3, 1)` for entrances or `cubic-bezier(0.23, 1, 0.32, 1)` for hover/active.
- **Don't** add em dashes (`—`) to body copy. The brand voice rejects them. Use commas, colons, semicolons, periods, or parentheses. Existing copy has some; phase them out on next content pass.
- **Don't** add icon-tile-stacks above headings. Rounded-corner-icon-above-h3 is the most over-used SaaS template element on the internet. The hero "fn-check" SVG inside the foundation grid is acceptable because it serves a checklist semantic; an icon above every section H2 is not.
- **Don't** add nested cards. The hero contrast card is one card. The dashboard cards are one card. Cards inside cards are always the wrong answer; rewrite the structure.
- **Don't** add another modal. There are zero modals on the page; this is correct. The discovery form is inline. Future flows should also stay inline or use progressive disclosure.
- **Don't** introduce mobile-menu hamburger UI without an actual menu. Below 680px the nav links currently disappear with no replacement. This is an accessibility gap that needs fixing — see audit.
- **Don't** animate keyboard-initiated actions (per emil-design-eng). The path-toggle and FAQ are click-only currently, which is fine; if keyboard shortcuts are added, they should not animate.
- **Don't** default to scale(0) entry animations. Use scale(0.95) with opacity 0. The bar-chart `scaleY(0)` is acceptable because bars literally grow from zero; it's a representational animation, not an entry animation.

### Anti-references (visual lanes to avoid)

- AI-agency template (purple gradients, glassmorphism, hero metrics).
- Linear / Notion / Stripe clones (cool grey on white, Inter, identical card grids).
- Editorial-magazine reflex (Fraunces / Cormorant / display serif italic, drop caps).
- Brutalist-utility (monospace headlines, harsh borders, aggressive grid).
- Crypto/AI-maximalist (acid colours on black, animated gradient backgrounds).

The lane this brand occupies is its own: **operational utility on warm paper.** Defend it.
