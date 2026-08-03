# v2 Homepage Redesign + Design Integration — Spec

**Date:** 2026-08-03
**Target:** `standalone-3nm-v2/` (the active rebuild; localhost:4321)
**Reference (design donor):** live `standalone-3nm-website/case-studies.html` + `assets/site.css`
**Execution rule:** every visual/layout edit runs through the **`/iterate`** 5-gate contract (echo-back interpretation → cascade audit → measure-before-edit → change → verify). No CSS written before its gate.

---

## Decisions locked (from Ben, 2026-08-03)

| # | Decision | Answer |
|---|---|---|
| D1 | Hero artifacts | **Not a redesign.** Extract/verify their copy into the copy file for review. |
| D2 | Marquee logos | **Swap to full-color brand SVGs.** Grey by default, native brand color on hover. |

Still open — see §8.

---

## §0 · Scope map (named section → file)

| Ben's name | File | Job |
|---|---|---|
| "hero artifacts" | `sections/Hero.astro` | Copy extraction only (§1) |
| "logos scrolling section" | `sections/Statement.astro` | Native-color-on-hover (§2) |
| "What I actually build" | `sections/Bento.astro` | Animate viz elements (§3) |
| "the results" | `sections/Stats.astro` | Rebuild as case-study cards (§4) |
| "all of the eyebrows" | every section + `styles/global.css` `.eyebrow` | Dot → semantic icons (§5) |
| "How it works / FAQ / About" | **do not exist in v2 yet** | Build 3 new pages w/ integrated design (§6) |

**Note:** v2 is currently single-page — `src/pages/` holds only `index.astro`. How-it-works, FAQ, About exist only as `content/*.md`. §6 = build them.

---

## §1 · Hero artifacts — copy extraction (D1)

Not a design change. Ben wants the hero card strings in the copy file to review.

**Status:** the artifact copy **is already captured** in `COPY-MAP.md` rows 19–34 (the 4 notification cards + "The system did" / "You did" summary cards) and matches current `Hero.astro`.

**Action required — reconcile, don't add:**
1. `COPY-MAP.md` rows **11–12 are STALE.** They show old H1/subhead ("You're the system holding it all together / That's the problem" · "You don't have to be…") but the live code (`Hero.astro` S1.2–S1.3) reads "Cut the dirty work / and your admin costs. / Scale without hiring." + "I build you an AI operating system that runs the admin…". Update rows 11–12 to the shipped strings.
2. Re-verify rows 19–34 char counts against current code (they look correct).
3. Add a `✎ REVIEW` column flag on the hero block so Ben can mark each line keep/change.

**Acceptance:** `COPY-MAP.md` hero section = 1:1 with `Hero.astro` source, zero stale strings.

---

## §2 · Logo marquee — native color on hover (D2)

**Plain English**
The logos are grey pictures with no color inside them. Hovering can't reveal a color that isn't there. Fix = replace them with the real colored logos, keep them grey until the mouse is on them.

**Technical**
- **Root cause:** all 10 SVGs in `public/assets/logos/` are monochrome, fill `#8A968F`. `Statement.astro` line 37 `filter: grayscale(1) opacity(0.5)` → hover `grayscale(0) opacity(1)` is a no-op on a single-color file.
- **Swap assets:** source official **full-color** brand SVGs for all 10: hubspot, notion, airtable, asana, clickup, googlesheets, quickbooks, xero, trello, zapier. Optimize (SVGO), keep viewBox, strip fixed width/height. Overwrite in `public/assets/logos/`.
- **Default state:** `filter: grayscale(1) opacity(0.55);` (unchanged intent).
- **Hover state:** `filter: grayscale(0) opacity(1);` — now reveals true brand color.
- **UX fix (required):** hovering a *moving* logo is near-impossible. On `.st-marquee:hover .marquee-track { animation-play-state: paused; }` so the strip freezes under the cursor, individual logo colorizes. Add to `motion.js` marquee init or as CSS if the marquee is CSS-animated.
- **Reduced-motion:** marquee already static → hover still colorizes; fine.

**Acceptance:** hover any logo → it stops scrolling and shows its real brand color; off-hover → grey + resumes.

---

## §3 · "What I actually build" (Bento) — animate viz elements

Run each under `/iterate`. Animations fire on scroll-into-view (IntersectionObserver in `motion.js`), respect `prefers-reduced-motion` (snap to end-state), and degrade to end-state under `html.no-js`.

### 3a · BI dashboard bar chart (`.vd-chart i`) — grow from x-axis
- `transform-origin: bottom; transform: scaleY(0);` → animate to `scaleY(1)`.
- Stagger bars left→right, ~60ms apart, `--ease-quint`, ~520ms each.
- The `.hot` bars (green) land last for emphasis.
- The stat tiles (`.vd-tile b`) count up (reuse the `data-count-to` counter from Stats if present).

### 3b · Team adoption (`.viz-team`) — real headshots, not gradient discs
- **Current:** `.vt-avatars i` are 5 CSS gradient circles.
- **Change:** replace with actual **animated / cartoon** headshots (Ben's words) — NOT stock photos.
- **Source:** DiceBear-style illustrated avatars, **pre-rendered to static SVG** and committed to `public/assets/avatars/` (no runtime external calls — keeps the site self-contained/CSP-safe). Recommended style: `notionists` or `adventurer` (flat, on-brand, warm). 5 distinct faces + the `+3` counter chip stays.
- **Animation:** avatars pop in one-by-one (scale 0.6→1 + fade), left→right, then the `.vt-fill` seat bar wipes 0→100% width. "8 / 8" counts up.
- Sizing/border unchanged (40px, 2px `--sand` ring, −10px overlap).

### 3c · No grant paperwork (`.viz-grant`) — make the grant route red/bad
- **Current:** grant row is muted grey (`--ink-faint`), RightClick:AI row green. Reads neutral, not "bad."
- **Change:** grant route = **red/negative**. `.vg-bar.long` → red dashed/striped (`--coral` or a dedicated `--state-err` tint), `.vg-row.muted .no` "3–6 mo ✕" in red. Keep RightClick:AI row green "Now ✓". The contrast should read *red bad → green good* instantly.
- **Animation:** the long red bar draws slowly L→R (the "3–6 month wait" felt as duration); the short green bar snaps in fast. Timing itself tells the story.

### 3d · Remaining vizzes (reveal polish)
- `.viz-app` phone: orbit rings rotate slowly (`data-orbit` already wired); phone + badge scale-in.
- `.viz-flow`: nodes fade in L→R, the dashed `.vf-link` lines draw, `.vf-core` pops, `.vf-tick` last.
- `.viz-own`: chips stagger-in; lock badge last.

**Acceptance:** scrolling to `#build` plays a coordinated per-card reveal; grant card unmistakably red-bad; team card shows illustrated faces; bars grow from the axis.

---

## §4 · "The results" (Stats) — rebuild as cards

**Plain English**
The four green circles look bad. Replace them with the same case-study cards as the live "My work" page.

**Technical**
- **Kill:** the `.stat-circle` green-disc grid in `Stats.astro`.
- **Rebuild as:** the `.csi-item` card grid ported from live `case-studies.html` (full spec in §6). Each result = one case-study card: thumbnail/mock, tag chips, title, 1-line summary, KPI row (before→after), "Read case study →".
- **Content source:** the 4 real builds already referenced (education consulting, executive recruitment, 3PL logistics, family office) — pull KPIs + summaries from `content/*.md` case-study files. Keep the eyebrow "The results" and H2 "What changed for them."
- **Layout:** `1fr → 1fr 1fr` at 720px, gap `clamp(24px,3vw,32px)`. Optionally 1 feature card (full-width row) + others, matching the live page.
- Cards link to the corresponding v2 case-study pages (build later or point to anchors).

**Acceptance:** the results section is a 2-col card grid visually identical to the live case-studies cards; zero green circles.

---

## §5 · Eyebrows — dot → semantic icons (zig-style)

**Plain English**
Every small green label has a green dot. Replace each dot with a small icon that matches what the section is about.

**Technical**
- **Current:** `global.css` `.eyebrow::before` = 6px green dot (line 134). Flood/dark variants recolor it.
- **Change:** replace the `::before` dot with a per-section **inline icon** (Lucide-style, 1.5px stroke, ~14px, `currentColor` = green). Keep mono tracking + size. Zig uses tiny line-icons at the eyebrow — match that weight.
- **Mechanism:** add an `icon` slot to the eyebrow. Cleanest = a small `<Eyebrow icon="database">…</Eyebrow>` component (create `components/Eyebrow.astro`) rendering an inline SVG + label, replacing the 10 inline `<p class="eyebrow">`. Preserves flood/dark recolor via `currentColor`.
- Keep `.eyebrow.plain` (no icon) as an escape hatch.

**Icon mapping (proposed — confirm in §8):**

| Section | Eyebrow copy | Icon |
|---|---|---|
| Hero | For founder-run Singapore service firms · 5–35 staff | `users` |
| BeforeAfter | The dirty work | `list-todo` / `inbox` |
| Statement | It starts with your data. | `database` |
| Bento | What I actually build | `blocks` / `box` |
| Stats | The results | `trending-up` |
| StepWheel | How it works | `route` / `git-commit` |
| Timeline | More client work | `briefcase` |
| WinCircles | Before you write the job description | `file-text` / `user-plus` |
| Testimonials | From the founder | `quote` |
| FooterCta | Get started | `arrow-right` |

**Acceptance:** no eyebrow shows a bare dot; each carries an on-brand line icon; dark/flood sections keep correct color.

---

## §6 · Design integration — live case-studies × v2 → apply to How it works, FAQ, About

**Plain English**
Merge the look of the live "My work" page with the current v2 look, then build three new pages (How it works, FAQ, About) in that merged look.

**The two systems are already siblings.** Same green `#15803D`, same paper `#FAFAF7`, same warm sand `#F3F1EB`, same Satoshi body. Integration = reconcile the few deltas, not a rewrite.

### 6a · Token reconciliation

| Token | Live (site.css) | v2 (global.css) | Integrated decision |
|---|---|---|---|
| Accent green | `--accent #15803D` | `--green #15803D` | **Same** — keep `--green` |
| Page bg | `--bg #FAFAF7` | `--paper #FAFAF7` | **Same** |
| Warm surface | `--bg-warm #F3F1EB` | `--sand #F3F1EB` | **Same** |
| Ink | `#0D120F` | `#0D120F` | **Same** |
| Body font | Satoshi | Satoshi | **Same** |
| Display font | Satoshi 700 | General Sans | **Keep v2 General Sans** for display (brand atom, LOCKED per DESIGN.md); live pages adopt it |
| Eyebrow | plain uppercase, no dot | mono + green dot | **New §5 icon system** wins on both |
| Card radius | `--r-2xl 16px` | `--r 16px` | **Same** |
| Container | `--max-w 1160px` | `--wrap 1360px` | **Decision needed (§8)** — 1160 (live, tighter) vs 1360 (v2, wide) |
| Coral CTA | none | `--coral` | v2-only accent — keep, use sparingly |
| Easing | `--ease-out cubic-bezier(.16,1,.3,1)` | `--ease-quint` | Alias to one name |

### 6b · Port the card component
Bring `.csi-item` and its children into v2 as a reusable `components/CaseCard.astro`, using v2 tokens. Load-bearing values (from live):
- Card: `#fff` bg · `1px solid rgba(13,18,15,0.07)` · **16px** radius · body padding `24px 24px 26px` · gap `12px`.
- Hover (fine-pointer only): `translateY(-3px)` + `box-shadow 0 18px 40px -12px rgba(13,18,15,0.12)` + thumb `img scale(1.04)`.
- Thumb: `aspect-ratio 16/10`, `--sand` placeholder, dark-glass overlay tag top-left.
- KPI row pinned to card bottom (`margin-top:auto`, `border-top`), `.csi-kpi-val` 18px/700, `.csi-kpi-label` 11px muted.
- Arrow: green 13.5px/600, `→` translateX(4px) on hover.
- Whole-card click via stretched `.csi-cover-link` (not `<a>` wrap).
Reused by §4 (results) and the case-study index.

### 6c · Build the 3 pages (in v2, merged design)
Create `src/pages/how-it-works.astro`, `faq.astro`, `about.astro` using `BaseLayout`, the v2 chrome (Header/Footer), the integrated tokens, the §5 eyebrow-icon system, and shared `.page-hero`. Content from `content/how-it-works.md`, `content/faq.md`, `content/about.md`.

Structure to mirror the live pages (agent-verified):
- **How it works:** page-hero → "The sequence" (6 numbered steps, same order every time) → "The agreement" (two-column commitments) → dark closing CTA.
- **FAQ:** page-hero → 2-col layout `280px 1fr` gap 80px (sticky TOC sidebar + accent-light CTA box, right = categories) → accordion `.faq-item` (`+`→`×` rotate toggle, max-height transition) → dark CTA. Collapses <860px.
- **About:** page-hero → intro → method → manifesto → engagement → invitation (closing CTA).

**Acceptance:** the 3 pages render in v2 on their own routes, visually consistent with the homepage and the live case-studies look, sharing one token set, one eyebrow-icon system, one card component.

---

## §7 · Build order

1. **§1** copy reconcile (fast, no design) — unblocks Ben's review.
2. **§5** eyebrow component + icons (touches every section; do before per-section work).
3. **§2** logo swap (asset sourcing + small CSS).
4. **§3** Bento animations (per viz, `/iterate` each).
5. **§6a/6b** token reconcile + `CaseCard.astro`.
6. **§4** results rebuild (depends on CaseCard).
7. **§6c** build How it works, FAQ, About.

Each step: `/iterate` gates → verify on localhost:4321 (Browser pane: read_page + screenshot) → no console errors.

---

## §8 · Open decisions (need Ben)

1. **Container width** for the integrated system: **1160px** (live, tighter/editorial) or **1360px** (v2, wide)? Affects every page.
2. **Eyebrow icons** — confirm the §5 mapping or swap any.
3. **Avatar style** — DiceBear `notionists` vs `adventurer` (or supply your own illustrated set)?
4. **Results cards** — link to real built v2 case-study pages, or homepage-only cards (no detail page yet)?
5. **Marquee logos** — I source the 10 full-color SVGs, or you drop a preferred set in `public/assets/logos/`?
