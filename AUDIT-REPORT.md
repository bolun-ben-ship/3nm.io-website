# RightClick:AI — Audit Report

**Target:** `outputs/RightClickAI/index.html` (2,382 lines, single-file)
**Date:** 2026-05-08
**Scope:** Combined `impeccable audit` (technical) + `impeccable critique` (UX/heuristics) + `emil-design-eng review` (interaction craft)
**Register:** brand (marketing landing surface; design IS the product)

---

## Executive Summary

The site is **well above the AI-generic floor**. Forest green over AI-purple, Satoshi over Inter, custom cubic-bezier easing, dashboard inserts as proof-of-product, founder-direct voice. The aesthetic is distinctive and the rhetorical structure is strong. A skeptical visitor would ask "how was this made?" — not "which AI made this?"

The weak dimensions are accessibility, theming consistency, and interaction polish. None of these are surface-level AI-tells; they're craft details a senior designer would catch on the second pass. They are exactly the kind of thing the new skills (impeccable + emil-design-eng) exist to enforce.

**Bottom line:** retrofit with targeted polish passes, not a rebuild. The bones are right.

---

## Audit Health Score (impeccable audit)

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 / 4 | WCAG AA contrast failures on `--ink-faint` and dark-surface low-alpha text; no mobile menu below 680px |
| 2 | Performance | 3 / 4 | Mostly hardware-accelerated; `width`-based typewriter and continuous infinite animations should respect reduced motion |
| 3 | Responsive | 3 / 4 | Strong fluid clamps and breakpoints; mobile menu missing; two touch targets borderline |
| 4 | Theming | 2 / 4 | Solid token system in places, but cross-page token drift (index vs about) and many hardcoded white-alpha values on dark surfaces |
| 5 | Anti-Patterns | 4 / 4 | No AI-slop tells. Distinctive, intentional design |
| **Total** | | **14 / 20** | **Good — address weak dimensions** |

## Design Health Score (impeccable critique — Nielsen's 10)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Form submit failure is silent (no error path) |
| 2 | Match System / Real World | 4 | Operator-native language throughout; no marketing abstractions |
| 3 | User Control and Freedom | 3 | Cancel-anytime, prorated refunds, code ownership all reinforce user control |
| 4 | Consistency and Standards | 2 | Token drift across pages; some buttons have press feedback, others don't; varying letter-spacing on labels |
| 5 | Error Prevention | 3 | `required` and `type="email"` on form; no inline validation |
| 6 | Recognition Rather Than Recall | 4 | Eyebrow labels, comparison table, FAQ surface decision points before user has to recall them |
| 7 | Flexibility and Efficiency | 2 | Form is 5 fields (could be 3); no save-and-continue |
| 8 | Aesthetic and Minimalist Design | 3 | Information density medium-high; rewards reading, may bounce fast skimmers |
| 9 | Error Recovery | 2 | Form submit failure has no UI path; only success is handled |
| 10 | Help and Documentation | 3 | FAQ is comprehensive; About page is present; no live chat (correctly, given brand voice) |
| **Total** | | **29 / 40** | **Good — solid mid-band** |

## Anti-Patterns Verdict

**LLM assessment.** Does this look AI-generated? **No.** Forest green is a deliberate departure from the AI-default palette. The hero leads with a diagnostic statement ("Late reports. Fuzzy forecasts. Stalled handoffs.") instead of a value prop. The dashboard mocks earn their decorative weight because the offer IS a dashboard. Single-family Satoshi typography rejects both Inter-default and serif-display reflex. The comparison table (`Hire ops manager / DIY / Agency / Us`) is a structured rhetorical move, not a feature grid. **Pass.**

**Deterministic scan.** All six absolute bans cleared:
- ✅ No side-stripe borders
- ✅ No gradient text (hero `<em>` uses solid colour swap)
- ✅ No glassmorphism as default (one instance: nav scrolled state, justified)
- ✅ No hero-metric template
- ✅ No identical card grids (each grid carries different functional density)
- ✅ No modals (zero on the page; correct)

**Single concession.** The 2x2 grids in `#foundation` (`.fn-item`), `#commitments` (`.commit-item`), and the 3-col grid in `#time-horizon` (`.horizon-col`) share visual rhythm. They're not template-identical (different content density, different surface treatment), but a more committed brand surface might break one of them into an asymmetric layout for variety. P3 polish.

---

## Detailed Findings (by severity)

### P1 — Major (fix before next traffic push)

**[P1] Mobile nav has no menu below 680px**
- Location: `nav .nav-links` — `@media (max-width: 680px) { .nav-links { display: none; } }`
- Category: Accessibility / Responsive
- Impact: Mobile users (likely a meaningful share of traffic, given founders skim on phone) cannot navigate to "How it works," "Foundation," "Our work," "FAQ," or "About" without scrolling the entire page. The nav-cta ("Book a call") still works but the structural nav is gone.
- Standard: WCAG 2.4.5 (Multiple Ways)
- Fix: Add a hamburger toggle that reveals a vertical list at small viewports. Match brand voice: simple slide-down panel, no overlay, no animation theatrics.
- Suggested command: `/impeccable adapt` (responsive behaviour for mobile nav).

**[P1] Color contrast failures on `--ink-faint` (`#B8C4BE`) and on white-alpha text below 0.30 on dark backgrounds**
- Location: `.hcr-eyebrow`, `.hcr-num`, `.hcr-desc`, `.work-disclaimer`, `.fn-def-note`, `.preview-copy-body` (`rgba(255,255,255,0.42)`), `.footer-copy` (`rgba(255,255,255,0.18)`), `.footer-email` (`rgba(255,255,255,0.28)`), `.horizon-desc` (`rgba(255,255,255,0.28)`), multiple `.dash-*` labels at `rgba(255,255,255,0.25)` and below.
- Category: Accessibility
- Impact: Contrast ratios estimated 1.8–2.5:1 in several places. Body copy at `--ink-faint` over `--bg` measures roughly 2.0:1 (target: 4.5:1). White-alpha at 0.18–0.28 on `#08100A` lands roughly 2.0–3.0:1.
- Standard: WCAG 2.1 AA (1.4.3 Contrast Minimum — 4.5:1 body, 3:1 large text)
- Fix: Pick one of two paths: (a) lift `--ink-faint` to a darker value that hits 4.5:1 on `--bg` (try `#7A8580` or similar); (b) keep `--ink-faint` for non-text purposes (dots, dividers) and remove it as a body-text color, replacing all instances with `--ink-muted`. For dark surfaces, raise floor to `rgba(255,255,255,0.55)` for any prose; reserve lower alphas for purely decorative elements.
- Suggested command: `/impeccable colorize` (recolour the failing tokens) or `/impeccable harden` (a11y pass).

**[P1] Token drift between `index.html` and `about.html`**
- Location: index has `--accent: #15803D`, about has `--accent: #1A5C3A`. Same drift in `--ink` (`#0D120F` vs `#141210`), `--bg-dark` (`#08100A` vs `#101210`), and elsewhere.
- Category: Theming / Consistency
- Impact: The brand's signature green is materially different across pages. A buyer who lands on a pillar page first then visits the homepage will subconsciously register inconsistency. Compounds as more pages are added.
- Standard: Design system integrity.
- Fix: Lift the index.html token block into a shared `assets/tokens.css` file. Link it from every page. Delete the per-page `:root` token block. DESIGN.md has now committed to the index.html palette as canonical.
- Suggested command: `/impeccable extract` (pull tokens into a shared system).

**[P1] Form submission has no error path**
- Location: `index.html:2362-2378` — the form submit handler only acts on `res.ok`; failed requests fall through silently.
- Category: Error Recovery
- Impact: A buyer who fills the form and hits Submit on a flaky connection sees no feedback at all. They assume nothing happened, click Submit again, and either spam Formspree or give up.
- Fix: Add an else branch that renders an error message inline (e.g., "Something went wrong. Email ben@3nm.io directly or try again."). Keep the form mounted so they don't lose their input.
- Suggested command: `/impeccable harden` (production-readiness for form).

**[P1] No `prefers-reduced-motion` handling**
- Location: `.hero-contrast` (7s float, infinite), `.ticker-track` (35s linear infinite), `.dash-bar` (1.2s scaleY), `.dash-ai-answer` (typewriter), `.reveal` cascade, `.pulse-dot` (2s infinite).
- Category: Accessibility
- Impact: Users who set reduced-motion (vestibular sensitivity, motion sickness) get the full motion treatment. Continuous infinite animations are the worst offenders.
- Standard: WCAG 2.3.3 (Animation from Interactions, AAA — but reduced-motion respect is an industry-wide AA expectation).
- Fix: Wrap each motion ruleset in `@media (prefers-reduced-motion: no-preference) { ... }`, OR add a global `@media (prefers-reduced-motion: reduce)` block that overrides `animation: none !important` on the named keyframes.
- Suggested command: `/impeccable animate` (motion pass) or `/impeccable harden`.

### P2 — Minor (fix in next polish pass)

**[P2] Active-state press feedback only on `.btn-primary`**
- Location: `.btn-ghost`, `.btn-dark`, `.btn-white`, `.path-btn`, `.faq-q`, `.nav-cta`, `.nav-links a` — none of these have an `:active` state.
- Category: Anti-Pattern (per emil-design-eng's "buttons must feel responsive" rule)
- Impact: The page feels half-tactile. The hero CTA confirms the press; the secondary CTA does not. Inconsistent feel across the site.
- Fix: Add `transform: scale(0.98)` or `translateY(0)` on `:active` for every pressable element. See the Emil-Design-Eng Review table below for exact substitutions.
- Suggested command: `/impeccable polish` (focused on interaction states).

**[P2] `transition` declarations missing per-property easing**
- Location: `.btn-ghost`, `.btn-dark`, `.btn-white`, `.path-content`, `.data-conn-item`, `.faq-q`, `.faq-icon`, several others.
- Category: Anti-Pattern (emil-design-eng's "specify exact properties and easing")
- Impact: Default `ease` is too weak. Animations feel slightly mushy where they should snap.
- Fix: Specify each property and its easing curve. Use `cubic-bezier(0.16, 1, 0.3, 1)` (already the system's signature curve) for entrances, `cubic-bezier(0.23, 1, 0.32, 1)` for hover/active.
- Suggested command: `/impeccable animate` or `/impeccable polish`.

**[P2] Hardcoded white-alpha and accent-on-dark values**
- Location: `rgba(255,255,255,0.04)` through `rgba(255,255,255,0.85)` appear ~50+ times across dark surfaces. `#6FBF8E` (light forest green) appears hardcoded ~12 times.
- Category: Theming
- Impact: When the dark palette evolves (it will, as the design matures), every instance must be edited individually. Token drift waiting to happen.
- Fix: Define `--ink-on-dark-1` through `--ink-on-dark-5` (or named: `--ink-on-dark-strong`, `--ink-on-dark-medium`, `--ink-on-dark-mute`, `--ink-on-dark-faint`, `--ink-on-dark-disabled`), and `--surface-on-dark-1`, `--surface-on-dark-2`, `--accent-on-dark`. Replace all hardcoded values.
- Suggested command: `/impeccable extract`.

**[P2] Touch targets borderline on `.path-btn` and `.nav-cta`**
- Location: `.path-btn { padding: 10px 22px; font-size: 13.5px; }` ≈ 38px height. `.nav-cta { padding: 8px 20px; font-size: 13px; }` ≈ 38px height.
- Category: Responsive / Accessibility
- Impact: Below the 44×44px minimum recommended by Apple HIG and WCAG 2.5.5 (AAA). Possible mis-taps on mobile.
- Fix: Increase vertical padding to 12px (path-btn) and 11px (nav-cta) to clear 44px.
- Suggested command: `/impeccable adapt`.

**[P2] FAQ buttons missing `aria-controls` / panel `id`**
- Location: `.faq-q` buttons have `aria-expanded` updated but no `aria-controls` reference. The `.faq-a` panel has no `id` or `role`.
- Category: Accessibility
- Impact: Screen readers cannot announce that pressing the button reveals associated content. The relationship is implicit.
- Fix: Add unique `id` to each `.faq-a` panel and set `aria-controls="faq-panel-N"` on the matching `.faq-q` button.
- Suggested command: `/impeccable harden`.

**[P2] No visible `:focus-visible` ring on buttons or links**
- Location: All `<a>` and `<button>` elements (except form inputs).
- Category: Accessibility
- Impact: Keyboard users have no visible focus indicator on most interactive elements. Tab-order traversal is invisible.
- Standard: WCAG 2.4.7 (Focus Visible — AA)
- Fix: Add a `:focus-visible` rule with a brand-consistent outline (e.g., `outline: 2px solid var(--accent); outline-offset: 2px;`). On dark surfaces, use `outline: 2px solid var(--accent-on-dark);`.
- Suggested command: `/impeccable harden`.

**[P2] `.dash-ai-answer` typewriter animates `width`**
- Location: `index.html:944-946` — `width: 0; animation: type-answer 0.9s steps(40, end) 2s forwards;` with keyframe `from { width: 0; } to { width: 100%; }`.
- Category: Performance (animating layout property)
- Impact: Each frame triggers layout, paint, and composite — the most expensive pipeline. On low-end devices, this can drop frames, especially during the 5-second cycle interval where text changes.
- Fix: Use `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)` instead. GPU-accelerated, same visual effect.
- Suggested command: `/impeccable optimize`.

**[P2] Hover effects not gated by `@media (hover: hover) and (pointer: fine)`**
- Location: `.btn-primary:hover { transform: translateY(-1px); ... }`, `.recognition-list` items, `.data-conn-item:hover { border-color: ...; }`, others.
- Category: Anti-Pattern (emil-design-eng's touch-device hover rule)
- Impact: Touch devices fire `:hover` on tap and the state sticks until the user taps elsewhere. The button stays lifted, the border stays accent-coloured. False-positive hover states.
- Fix: Wrap hover-only effects in `@media (hover: hover) and (pointer: fine) { ... }`.
- Suggested command: `/impeccable adapt`.

**[P2] Repeated `transition` declarations should use shared duration tokens**
- Location: `0.15s`, `0.2s`, `0.22s`, `0.25s`, `0.3s`, `0.35s`, `0.4s`, `0.65s` all appear with various properties throughout. No shared scale.
- Category: Theming
- Impact: As the design evolves, tweaking one duration requires editing many declarations. No semantic naming.
- Fix: Define `--dur-fast: 150ms`, `--dur-normal: 200ms`, `--dur-slow: 300ms`, `--dur-section: 650ms`, and the `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-snap: cubic-bezier(0.23, 1, 0.32, 1)` curves. Replace inline values.
- Suggested command: `/impeccable extract`.

### P3 — Polish (fix when convenient)

**[P3] Em dashes (`—`) in body copy**
- Location: ~15+ instances of `—` across hero-sub, prehire-body, preview-copy-body, FAQ answers.
- Category: Brand Voice
- Impact: PRODUCT.md and the impeccable shared design laws both reject em dashes; brand voice for this project commits to the rule. Currently inconsistent.
- Fix: Phase out on next content pass. Use commas, colons, semicolons, periods, parentheses, or sentence restructure.
- Suggested command: `/impeccable clarify` (UX copy pass) or manual edit during content updates.

**[P3] Two `<style>` blocks (in `<head>` and inside `#prehire`)**
- Location: line 22 (main) and line 1373 (`#prehire` styles).
- Category: Structure
- Impact: Cosmetic — works fine, but unconventional and harder to maintain.
- Fix: Consolidate into the head `<style>` block. When tokens move to `assets/tokens.css`, also move all `index.html` styles into `assets/index.css`.
- Suggested command: manual cleanup.

**[P3] Three identical-rhythm 2x2 / 3-col grids**
- Location: `.foundation-fn-grid`, `.commitments-grid`, `.horizon-grid`.
- Category: Anti-Pattern (visual rhythm convergence)
- Impact: Each grid is functionally distinct (4 functions / 4 commitments / 3 time horizons) but they share rectangular cell rhythm. A more committed brand surface might break one of them (e.g., commitments could be a horizontal scroll-snapped sequence; time-horizon could be an angled timeline).
- Fix: Optional. Only worth doing if you want the brand surface to feel less template-symmetric. Don't break for breaking's sake.
- Suggested command: `/impeccable bolder` (only if you want to push composition).

**[P3] No `prefers-color-scheme: dark` support**
- Category: Theming (low priority — marketing site)
- Impact: System dark mode users see the warm-paper light theme. Acceptable for a brand surface; users expect marketing sites to carry their own visual identity.
- Fix: Skip unless future strategy calls for it.

---

## Emil-Design-Eng Review (interactive elements, Before/After)

| Before | After | Why |
|---|---|---|
| `.btn-primary { transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }` | `transition: background 0.2s ease-out, transform 0.15s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.2s ease-out;` | Default `ease` is too weak. Specify per-property easing |
| `.btn-ghost` has no `:active` state | Add `.btn-ghost:active { transform: scale(0.98); }` | Pressables must feel responsive to press |
| `.btn-dark` has no `:active` state | Add `.btn-dark:active { transform: scale(0.98); }` | Same — closing-CTA neighborhood especially |
| `.btn-white:hover { opacity: 0.92; transform: translateY(-1px); }` (no `:active`) | Add `.btn-white:active { transform: scale(0.98); }`; consider removing the opacity drop in favour of a subtle background shift | Press feedback for the closing CTA is the most important interaction on the page |
| `.path-btn { transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1); }` | `transition: background 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);` | Never `transition: all` — adds invisible properties to the animation list |
| `.faq-q { transition: color 0.2s; }` (no `:active`) | `transition: color 0.2s ease-out;` and add `:active { color: var(--accent-hover); }` | Interactive state needs feedback; missing easing |
| `.path-content { transition: opacity 0.25s; }` | `transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);` | No easing specified; defaults to weak `ease` |
| `.faq-a` opens in 400ms and closes in 400ms | Open in 400ms, close in 250ms | Asymmetric enter/exit per emil — exit should be snappier |
| `.hero-contrast { animation: hero-card-float 7s ease-in-out infinite; }` | Wrap rule in `@media (prefers-reduced-motion: no-preference)` | Continuous motion violates a11y default |
| `.ticker-track { animation: ticker-scroll 35s linear infinite; }` | Same — gate behind `@media (prefers-reduced-motion: no-preference)` | Same rationale |
| `.btn-primary:hover { transform: translateY(-1px); ... }` (always-on) | Wrap in `@media (hover: hover) and (pointer: fine) { .btn-primary:hover { ... } }` | Touch-tap false-positive sticks the lift state |
| `.dash-ai-answer { width: 0; animation: type-answer ... }` (animates width) | `clip-path: inset(0 100% 0 0); animation: type-reveal 0.9s steps(40) 2s forwards;` with keyframe `to { clip-path: inset(0 0 0 0); }` | `width` triggers layout; `clip-path` is GPU-accelerated |
| No global `:focus-visible` style | Add `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` (light surfaces) and a paired rule with `--accent-on-dark` for dark surfaces | Keyboard users currently invisible |
| `.dash-bar:nth-child(6).accent { background: #15803D; }` selectors duplicated | Use `:nth-child(6) { background: var(--accent); animation-fill-mode: both; }` consistently | Cohesion |
| Bar grow uses `cubic-bezier(0.16, 1, 0.3, 1)` (system curve) | No change — already correct | Validates the system curve as the right choice |
| Reveal stagger uses 80ms cumulative steps via `.reveal-d1`–`d4` | No change — within emil's 30–80ms guidance | Validates stagger timing |
| `:active` on `.btn-primary` returns to `translateY(0) scale(0.98)` | No change — exemplary | The single best-feeling button on the page; replicate this pattern across all buttons |

---

## Patterns & Systemic Issues

1. **Tokens are present but cross-page drift exists.** The token system in `index.html` is well-considered. The token system in `about.html` is similar but materially different. As more pages are added, this drift will multiply. Lift tokens to a shared file (`/assets/tokens.css`) and link from every HTML page. **Single source of truth.**

2. **Interaction polish is uneven.** The hero CTA feels excellent. Every other button feels half-baked by comparison. Apply the `.btn-primary` craft pattern (custom easing, `:active` press, hover-query gate) to every interactive element.

3. **Reduced-motion respect is absent.** Five distinct continuous/infinite animations run regardless of user preference. This is the single biggest accessibility gap aside from contrast.

4. **Hardcoded white-alpha values on dark surfaces.** Same systemic issue as the cross-page token drift. Define on-dark tokens once.

5. **Em dashes are present in body copy despite brand voice rejecting them.** Phase out on next content pass; bake into a CI check or pre-commit hook eventually.

---

## Positive Findings (preserve and replicate)

- **Forest green over AI-purple** is the single most distinctive choice on the site. Defend it.
- **Hero leads with diagnostic statement**, not value proposition. Resists the SaaS-template hero. Excellent.
- **`<em>` styled as colour swap** rather than italic for emphasis. Sophisticated typographic move; keep using it.
- **Dashboard inserts as proof-of-product.** They earn their decorative complexity by demonstrating the offer.
- **Custom cubic-bezier(0.16, 1, 0.3, 1) used consistently** as the system's signature ease-out curve.
- **Comparison table structure** (3 alternatives + us) is a strong rhetorical move and visually well-composed.
- **`.btn-primary:active { scale(0.98) }`** is the gold standard for button press feedback. Use it as the template.
- **Reveal stagger at 80ms cascade** lands inside emil-design-eng's recommended 30–80ms range.
- **No modals, no popups, no exit-intent overlays.** Clean. Brand-aligned.
- **Inline form, not a separate page.** Reduces friction; matches "no pitch, no proposal" framing.

---

## Recommended Action Sequence

Run in this order. Each step is a focused command on the existing site.

1. **`/impeccable extract`** — Lift tokens and on-dark scale into `assets/tokens.css`. Define duration and easing tokens. Replace hardcoded white-alpha values. Single source of truth for the colour and motion system. *(Addresses P1 token drift, P2 hardcoded values, P2 transition tokens.)*

2. **`/impeccable harden`** — Production-readiness pass: add reduced-motion guards across all five infinite/continuous animations, add `:focus-visible` on every interactive element, fix the form's silent error path, add `aria-controls` on FAQ buttons, address contrast failures on `--ink-faint` and low-alpha white text. *(Addresses P1 reduced motion, P1 contrast, P1 form error path, P2 focus, P2 ARIA.)*

3. **`/impeccable adapt`** — Mobile pass: add the missing hamburger menu below 680px, lift `.path-btn` and `.nav-cta` touch targets above 44px, gate hover effects behind `@media (hover: hover) and (pointer: fine)`. *(Addresses P1 mobile menu, P2 touch targets, P2 hover gating.)*

4. **`/impeccable animate`** — Motion pass driven by emil-design-eng's review table: per-property easing on every transition, `:active` press feedback on every button, asymmetric enter/exit on FAQ accordion, `clip-path` typewriter instead of width-based. *(Addresses P2 active states, P2 transition easing, P2 typewriter performance.)*

5. **`/impeccable clarify`** — Content polish: phase out em dashes from body copy. Optionally tighten the discovery-form copy (5 fields could become 3 if "How did you find us?" and "Team size" were folded into the bottleneck textarea). *(Addresses P3 em dashes.)*

6. **`/impeccable polish`** — Final pass before the next traffic push. Fresh eyes review. *(Standard close.)*

You can run these one at a time, all at once, or in any order you prefer. Re-run `/impeccable audit` and `/impeccable critique` after each batch to track score improvement.

---

## What This Audit Did Not Cover

- **`about.html` and pillar pages.** Token-drift inspection only. A full audit of each page is its own pass.
- **Live browser testing.** A proper impeccable critique would run `npx impeccable live` and inject the deterministic-detector overlay into a browser tab. This text-based audit covered the same ground from source code; the browser pass would catch additional layout-and-paint issues a static read can miss.
- **Performance metrics (LCP / CLS / INP).** No real-device measurement. The recommendations on `width`-animation and continuous infinite motion are based on craft principles, not measured data.
- **SEO and structured-data review.** `llms.txt`, `robots.txt`, `sitemap.xml`, and JSON-LD schema all exist but were not the scope here.
- **Cross-browser testing.** Safari backdrop-filter behaviour, Firefox `clip-path` quirks, etc.

If any of these matter for the next push, they're each a separate pass.

---

*Audit conducted using `impeccable audit` + `impeccable critique` (technical and UX dimensions) and `emil-design-eng review` (interaction craft) against the source of `index.html` only. PRODUCT.md and DESIGN.md (committed in this same pass) define the design intent the audit measures against.*
