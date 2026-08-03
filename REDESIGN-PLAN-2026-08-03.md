# v2 Homepage Redesign — Execution & Verification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` (inline) or `superpowers:subagent-driven-development` (per-task subagents). Steps use checkbox (`- [ ]`) syntax.
> **Companion spec:** [REDESIGN-SPEC-2026-08-03.md](REDESIGN-SPEC-2026-08-03.md). Every task cites its spec section.

**Goal:** Ship the v2 homepage redesign (hero copy reconcile, native-color logos, animated build-cards, card-based results, icon eyebrows) and build 3 new pages (How it works, FAQ, About) in the integrated live×v2 design.

**Architecture:** Astro static site. Section components in `src/components/sections/`. Design tokens in `src/styles/global.css`. Scroll/reveal animation in `src/scripts/motion.js`. No backend. Self-contained assets only (no runtime external calls).

**Tech Stack:** Astro 4.16, vanilla CSS + custom-properties, vanilla JS (IntersectionObserver), DiceBear (pre-rendered static SVG).

**Verification model:** no unit tests — this is visual/behavioral. Each task ends with a **Browser check** on `localhost:4321` using the preview tools (`read_console_messages`, `read_page`/`get_page_text`, `javascript_tool` for computed styles, `screenshot` when the pane is visible). Astro HMR auto-reloads; no manual restart.

---

## Gate 0 — decisions, branch, baseline

Resolve the 5 spec §8 decisions. **Recommended defaults baked in below** — execution proceeds on these unless Ben overrides.

| # | Decision | Default (used unless overridden) |
|---|---|---|
| 1 | Container width | **1160px** — CONFIRMED (Ben deferred to rec; 1160 reads premium across sizes) |
| 2 | Eyebrow icons | **Accept §5 mapping** — CONFIRMED |
| 3 | Avatar style | **DiceBear `notionists`** — CONFIRMED |
| 4 | Results cards | **Visual-only, NO links** — CONFIRMED (Ben: "just visuals only for now"). No cover link, no href. |
| 5 | Logo SVGs | **I source the 10 full-color SVGs** — CONFIRMED |

- [ ] **Step 1: Branch**

```bash
cd "A:/BL Dev Work/RightClickAI"
git switch -c feat/v2-redesign-2026-08-03
```

- [ ] **Step 2: Start dev server + confirm clean baseline**

Use `preview_start` name `3nm-v2` → open `localhost:4321`.
`read_console_messages onlyErrors:true` → **Expected: none.**
`get_page_text` → **Expected: hero "Cut the dirty work…" renders.**

- [ ] **Step 3: Commit checkpoint marker**

```bash
git commit --allow-empty -m "chore: start v2 redesign branch"
```

---

## Phase 1 — Hero copy reconcile (spec §1)

No design change. Make `COPY-MAP.md` match the shipped `Hero.astro`.

### Task 1: Fix stale hero rows in COPY-MAP.md

**Files:**
- Modify: `standalone-3nm-v2/COPY-MAP.md:35-36` (rows 11–12)

- [ ] **Step 1: Replace stale H1/subhead rows**

Current rows 11–12 read the retired "You're the system…" copy. Replace with the shipped strings from `Hero.astro:21-22`:

```markdown
| 11 | S1.2 | h1 | Cut the dirty work / and your admin costs. / Scale without hiring. | 66 | 26ch, forced 3-line |
| 12 | S1.3 | subhead | I build you an AI operating system that runs the admin, so you stop being the decision bottleneck. Live in weeks. You own every line. | 133 | 42ch measure |
```

- [ ] **Step 2: Add a review column to the hero block header**

Change the hero illustration table header (`COPY-MAP.md` line 46) and the §1 table header to append ` ✎ | ` and a blank review cell per row, so Ben can mark keep/change. Header becomes:

```markdown
| # | slot | role | copy | chars | limit | ✎ |
```

Add a trailing ` |  |` to rows 10–34.

- [ ] **Step 3: Verify no other stale strings**

Cross-check rows 19–34 against `Hero.astro:9-14,59-71`. **Expected: all match** (Slack·Sarah, Email·Compliance, Alert·Invoicing, Calendar, "The system did"/"Status, reports, follow-ups", "You did"/"Made the one call that mattered").

- [ ] **Step 4: Commit**

```bash
git add standalone-3nm-v2/COPY-MAP.md
git commit -m "docs(copy): reconcile hero rows in COPY-MAP with shipped Hero.astro"
```

**Browser check:** none (docs only).

---

## Phase 2 — Eyebrow icon system (spec §5)

Touches every section — do before per-section work.

### Task 2: Create the Eyebrow component

**Files:**
- Create: `standalone-3nm-v2/src/components/Eyebrow.astro`
- Modify: `standalone-3nm-v2/src/styles/global.css:124-135` (`.eyebrow` block)

- [ ] **Step 1: Write the icon set + component**

Inline Lucide-style 1.5px-stroke SVGs, `currentColor`, ~14px. Create `Eyebrow.astro`:

```astro
---
/* Icon eyebrow — replaces the .eyebrow::before dot (spec §5).
   icon = key from ICONS; omit or use variant="plain" for no icon. */
const { icon, variant = '', class: cls = '' } = Astro.props;
const ICONS = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  blocks: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.008V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h.5c.5 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.008V20c0 1 0 1 1 1z"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
};
const svg = ICONS[icon] ?? '';
---
<p class={`eyebrow ${variant} ${cls}`.trim()}>
  {svg && <svg class="eyebrow-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" set:html={svg} />}
  <slot />
</p>
```

- [ ] **Step 2: Swap the dot for the icon in global.css**

Replace `.eyebrow::before` (lines 134–135) — delete the dot rule; add icon sizing:

```css
/* icon replaces the old ::before dot (spec §5) */
.eyebrow { display: inline-flex; align-items: center; gap: 8px; }
.eyebrow-ic { width: 15px; height: 15px; flex: none; color: var(--green); }
.eyebrow.plain .eyebrow-ic { display: none; }
.flood-green .eyebrow-ic { color: #fff; }
.flood-dark .eyebrow-ic { color: var(--green-on-dark); }
```

Delete lines 134, 172, 177 (the `::before` dot + flood dot recolors).

- [ ] **Step 3: Replace the 10 inline eyebrows**

In each file, swap `<p class="eyebrow …">COPY</p>` → `<Eyebrow icon="KEY" …>COPY</Eyebrow>` and add `import Eyebrow from '../Eyebrow.astro';` to the frontmatter. Mapping:

| File | icon= |
|---|---|
| `Hero.astro` | `users` |
| `BeforeAfter.astro` | `inbox` |
| `Statement.astro` | `database` |
| `Bento.astro` | `blocks` |
| `Stats.astro` | `trending` |
| `StepWheel.astro` | `route` |
| `Timeline.astro` | `briefcase` |
| `WinCircles.astro` | `userplus` |
| `Testimonials.astro` | `quote` |
| `FooterCta.astro` | `arrow` |

Preserve existing `reveal`/`animate-text_opacity` classes via `class=` prop and any `data-r`.

- [ ] **Step 4: Browser check**

`read_console_messages onlyErrors:true` → **none.**
`javascript_tool`: `document.querySelectorAll('.eyebrow-ic').length` → **Expected: 10.**
`javascript_tool`: `getComputedStyle(document.querySelector('.eyebrow-ic')).color` → **Expected: rgb(21,128,61)** (green) on light sections.
`get_page_text` → eyebrow labels unchanged.

- [ ] **Step 5: Commit**

```bash
git add standalone-3nm-v2/src/components/Eyebrow.astro standalone-3nm-v2/src/styles/global.css standalone-3nm-v2/src/components/sections/*.astro
git commit -m "feat(eyebrow): replace dot with per-section semantic icons"
```

---

## Phase 3 — Native-color logo marquee (spec §2)

### Task 3: Swap logos + colorize-on-hover with pause

**Files:**
- Replace: `standalone-3nm-v2/public/assets/logos/{hubspot,notion,airtable,asana,clickup,googlesheets,quickbooks,xero,trello,zapier}.svg`
- Modify: `standalone-3nm-v2/src/components/sections/Statement.astro:37-38` (`.st-logo`)

- [ ] **Step 1: Source full-color brand SVGs**

Obtain official full-color SVGs for all 10 brands. Run each through SVGO. Keep `viewBox`, strip fixed `width`/`height`. Overwrite the monochrome files in `public/assets/logos/` (same filenames).

- [ ] **Step 2: Verify each SVG carries color**

```bash
cd "A:/BL Dev Work/RightClickAI/standalone-3nm-v2/public/assets/logos" && for f in hubspot notion airtable asana clickup googlesheets quickbooks xero trello zapier; do echo -n "$f: "; grep -oiE '#[0-9a-fA-F]{6}' "$f.svg" | sort -u | tr '\n' ' '; echo; done
```

**Expected:** each line shows ≥1 hex that is NOT `#8a968f` (i.e., real brand color present).

- [ ] **Step 3: Update marquee CSS**

Replace `.st-logo` rules (`Statement.astro:37-38`) and add pause-on-hover:

```css
.st-logo { height: 30px; width: auto; flex: none; filter: grayscale(1) opacity(0.55); transition: filter var(--dur) var(--ease-quint); }
.st-marquee:hover .marquee-track { animation-play-state: paused; }
.st-logo:hover { filter: grayscale(0) opacity(1); }
@media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
```

If the marquee is JS-driven (not CSS `animation`) check `motion.js` `data-marquee` init and gate its rAF loop on a `paused` flag toggled by `mouseenter`/`mouseleave` on `.st-marquee`.

- [ ] **Step 4: Browser check**

`read_console_messages onlyErrors:true` → **none.**
`javascript_tool`: hover-simulate — `const l=document.querySelector('.st-logo'); getComputedStyle(l).filter` before/after adding `:hover` isn't scriptable; instead assert default: **Expected filter contains `grayscale(1)`**.
Screenshot the marquee region (pane visible) → logos read grey; manually hover one → colorizes + strip freezes.

- [ ] **Step 5: Commit**

```bash
git add standalone-3nm-v2/public/assets/logos standalone-3nm-v2/src/components/sections/Statement.astro
git commit -m "feat(marquee): full-color brand logos, native color + pause on hover"
```

---

## Phase 4 — Bento "What I actually build" animations (spec §3)

Add one self-contained IntersectionObserver block. Each viz animates to its end-state; reduced-motion + `no-js` show end-state immediately.

### Task 4: Bar chart grows from x-axis (§3a)

**Files:**
- Modify: `standalone-3nm-v2/src/components/sections/Bento.astro` (`.vd-chart i` CSS + markup class)
- Modify: `standalone-3nm-v2/src/scripts/motion.js` (append observer)

- [ ] **Step 1: Set bars to collapsed initial state**

In `Bento.astro` `.vd-chart i` (line 138) add origin + initial scale; add a played-state class hook:

```css
.vd-chart i { flex: 1; height: var(--h); border-radius: 3px 3px 0 0; background: var(--ink-faint); opacity: 0.5; transform: scaleY(0); transform-origin: bottom; transition: transform 0.52s var(--ease-quint); }
.vd-chart i.hot { background: var(--green); opacity: 1; }
.bento-viz.in .vd-chart i { transform: scaleY(1); }
.bento-viz.in .vd-chart i:nth-child(1){transition-delay:.00s}
.bento-viz.in .vd-chart i:nth-child(2){transition-delay:.06s}
.bento-viz.in .vd-chart i:nth-child(3){transition-delay:.12s}
.bento-viz.in .vd-chart i:nth-child(4){transition-delay:.18s}
.bento-viz.in .vd-chart i:nth-child(5){transition-delay:.24s}
.bento-viz.in .vd-chart i:nth-child(6){transition-delay:.30s}
.bento-viz.in .vd-chart i:nth-child(7){transition-delay:.36s}
html.no-js .vd-chart i { transform: scaleY(1); }
@media (prefers-reduced-motion: reduce) { .vd-chart i { transform: scaleY(1); transition: none; } }
```

- [ ] **Step 2: Append the observer to motion.js**

```js
/* Bento viz reveal (spec §3) — adds .in when a card's viz scrolls into view */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const vizzes = document.querySelectorAll('.bento-viz');
  if (!vizzes.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.35 });
  vizzes.forEach((v) => io.observe(v));
})();
```

- [ ] **Step 3: Browser check**

`read_console_messages onlyErrors:true` → **none.**
`javascript_tool`: `document.querySelector('.bento-viz.viz-dash')?.parentElement` — scroll `#build` into view via `document.querySelector('#build').scrollIntoView()`, wait, then `document.querySelectorAll('.bento-viz.in').length` → **Expected: ≥1**, and `getComputedStyle(document.querySelector('.vd-chart i')).transform` → **not `matrix(...,0)`** (bars grown).

- [ ] **Step 4: Commit**

```bash
git add standalone-3nm-v2/src/components/sections/Bento.astro standalone-3nm-v2/src/scripts/motion.js
git commit -m "feat(bento): bar chart grows from x-axis on scroll"
```

### Task 5: Team card — illustrated headshots (§3b)

**Files:**
- Create: `standalone-3nm-v2/public/assets/avatars/{1..5}.svg`
- Modify: `standalone-3nm-v2/src/components/sections/Bento.astro` (`.viz-team` markup + `.vt-avatars i` CSS)

- [ ] **Step 1: Generate 5 static illustrated avatars**

DiceBear `notionists` style, pre-rendered to static SVG (no runtime call). Save as `public/assets/avatars/1.svg` … `5.svg`. Distinct seeds. If DiceBear CLI unavailable, download 5 SVGs from the DiceBear playground and commit.

- [ ] **Step 2: Swap gradient discs for `<img>`**

In `Bento.astro` `viz === 'team'` block (lines 72–77), replace the 5 `<i>` avatars:

```astro
<div class="vt-avatars">
  {[1,2,3,4,5].map((n) => (<img src={`/assets/avatars/${n}.svg`} alt="" class="vt-face" loading="lazy" />))}
  <b>+3</b>
</div>
```

Update CSS (replace lines 166–172):

```css
.vt-avatars .vt-face, .vt-avatars b { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--sand); margin-left: -10px; background: var(--paper); object-fit: cover; }
.vt-avatars .vt-face:first-child { margin-left: 0; }
.bento-viz.in .vt-face { animation: vt-pop 0.4s var(--ease-quint) both; }
.vt-avatars .vt-face:nth-child(1){animation-delay:.00s}
.vt-avatars .vt-face:nth-child(2){animation-delay:.08s}
.vt-avatars .vt-face:nth-child(3){animation-delay:.16s}
.vt-avatars .vt-face:nth-child(4){animation-delay:.24s}
.vt-avatars .vt-face:nth-child(5){animation-delay:.32s}
@keyframes vt-pop { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .vt-face { animation: none !important; } }
```

- [ ] **Step 3: Browser check**

`read_console_messages onlyErrors:true` → **none** (watch for 404 on avatar SVGs).
`read_network_requests urlPattern:"avatars"` → **Expected: 5 × 200.**
`javascript_tool`: `document.querySelectorAll('.vt-face').length` → **Expected: 5.**
Screenshot team card → illustrated faces, not gradient blobs.

- [ ] **Step 4: Commit**

```bash
git add standalone-3nm-v2/public/assets/avatars standalone-3nm-v2/src/components/sections/Bento.astro
git commit -m "feat(bento): illustrated headshots on team-adoption card"
```

### Task 6: Grant route reads red/bad (§3c)

**Files:**
- Modify: `standalone-3nm-v2/src/components/sections/Bento.astro` (`.viz-grant` CSS lines 180–188)

- [ ] **Step 1: Recolor grant row to negative**

Replace the grant CSS:

```css
.viz-grant { display: flex; flex-direction: column; gap: 12px; }
.vg-row { display: flex; align-items: center; gap: 12px; font-size: 0.76rem; }
.vg-lbl { width: 92px; flex: none; color: var(--ink-mid); font-weight: 500; }
.vg-bar { height: 10px; border-radius: 6px; }
.vg-bar.long { flex: 1; background: repeating-linear-gradient(90deg, var(--coral) 0 8px, transparent 8px 14px); opacity: 0.85; transform: scaleX(0); transform-origin: left; transition: transform 1.1s var(--ease-quint); }
.vg-bar.short { width: 62px; background: var(--green); transform: scaleX(0); transform-origin: left; transition: transform 0.4s var(--ease-quint) 0.15s; }
.bento-viz.in .vg-bar.long, .bento-viz.in .vg-bar.short { transform: scaleX(1); }
.vg-row em { font-style: normal; font-family: var(--font-mono); font-weight: 600; margin-left: auto; }
.vg-row .no { color: var(--coral); } .vg-row .yes { color: var(--green); }
.vg-row.muted .vg-lbl { color: var(--coral); }
.vg-row.go .vg-lbl { color: var(--ink); }
html.no-js .vg-bar.long, html.no-js .vg-bar.short { transform: scaleX(1); }
@media (prefers-reduced-motion: reduce) { .vg-bar.long, .vg-bar.short { transform: scaleX(1); transition: none; } }
```

Note the storytelling timing: red bar draws slow (1.1s), green snaps (0.4s) — the wait *is* the point.

- [ ] **Step 2: Browser check**

`javascript_tool`: `getComputedStyle(document.querySelector('.vg-bar.long')).backgroundImage` → **Expected: contains the coral rgb** (`206,60,43`).
Screenshot grant card → red grant route vs green RightClick:AI row, unmistakable.

- [ ] **Step 3: Commit**

```bash
git add standalone-3nm-v2/src/components/sections/Bento.astro
git commit -m "feat(bento): grant route reads red/bad vs green go-now"
```

### Task 7: Remaining viz reveals (§3d)

**Files:**
- Modify: `standalone-3nm-v2/src/components/sections/Bento.astro` (`.viz-app`, `.viz-flow`, `.viz-own` CSS)

- [ ] **Step 1: Add `.bento-viz.in` reveal rules**

Append:

```css
/* app phone + orbit */
.viz-app .phone { opacity: 0; transform: scale(0.92); transition: opacity .5s var(--ease-quint), transform .5s var(--ease-quint); }
.bento-viz.in .viz-app .phone { opacity: 1; transform: scale(1); }
/* flow nodes L→R */
.viz-flow .vf-node, .viz-flow .vf-core { opacity: 0; transform: translateY(8px); transition: opacity .45s var(--ease-quint), transform .45s var(--ease-quint); }
.bento-viz.in .viz-flow .vf-node:nth-child(1){transition-delay:0s}
.bento-viz.in .viz-flow .vf-core{transition-delay:.15s}
.bento-viz.in .viz-flow .vf-node.out{transition-delay:.3s}
.bento-viz.in .viz-flow .vf-node, .bento-viz.in .viz-flow .vf-core { opacity: 1; transform: none; }
/* ownership chips */
.viz-own .vo-chip { opacity: 0; transform: translateY(6px); transition: opacity .4s var(--ease-quint), transform .4s var(--ease-quint); }
.bento-viz.in .viz-own .vo-chip { opacity: 1; transform: none; }
.viz-own .vo-chip:nth-child(2){transition-delay:.06s} .viz-own .vo-chip:nth-child(3){transition-delay:.12s} .viz-own .vo-chip:nth-child(4){transition-delay:.18s} .viz-own .vo-chip:nth-child(5){transition-delay:.24s}
html.no-js .viz-app .phone, html.no-js .viz-flow .vf-node, html.no-js .viz-flow .vf-core, html.no-js .viz-own .vo-chip { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .viz-app .phone, .viz-flow .vf-node, .viz-flow .vf-core, .viz-own .vo-chip { opacity: 1; transform: none; transition: none; } }
```

- [ ] **Step 2: Browser check**

Scroll `#build` into view; `javascript_tool`: `getComputedStyle(document.querySelector('.viz-app .phone')).opacity` → **Expected: "1"** after reveal.
`read_console_messages onlyErrors:true` → **none.**

- [ ] **Step 3: Commit**

```bash
git add standalone-3nm-v2/src/components/sections/Bento.astro
git commit -m "feat(bento): coordinated reveal on app/flow/ownership vizzes"
```

---

## Phase 5 — Token reconcile + CaseCard component (spec §6a/6b)

### Task 8: Reconcile tokens

**Files:**
- Modify: `standalone-3nm-v2/src/styles/global.css:72` (`--wrap`)

- [ ] **Step 1: Set integrated container width (Gate 0 default = 1160)**

```css
--wrap: 1160px;   /* integrated with live case-studies (was 1360) */
```

If Ben chose 1360, skip this task.

- [ ] **Step 2: Browser check**

`javascript_tool`: `getComputedStyle(document.querySelector('.wrap')).maxWidth` → **Expected: 1160px.**
Screenshot homepage → no layout breakage; sections still aligned.

- [ ] **Step 3: Commit**

```bash
git add standalone-3nm-v2/src/styles/global.css
git commit -m "refactor(tokens): container width 1160 to match live case-studies"
```

### Task 9: Create CaseCard.astro

**Files:**
- Create: `standalone-3nm-v2/src/components/CaseCard.astro`

- [ ] **Step 1: Port the `.csi-item` card (live values, v2 tokens)**

```astro
---
/* Case-study card ported from live case-studies.html .csi-item (spec §6b).
   props: tag (thumb overlay), chips[], title, summary, kpis[{val,label}], href, img?, mock? */
/* href optional. Gate 0 D4 = visuals only for now → no href = no cover link, no arrow CTA. */
const { tag, chips = [], title, summary, kpis = [], href, img } = Astro.props;
const linked = href && href !== '#';
---
<article class={`cc reveal-card ${linked ? '' : 'is-static'}`}>
  <div class="cc-thumb">
    {img ? <img src={img} alt="" loading="lazy" width="1600" height="900" /> : <span class="cc-thumb-mock" aria-hidden="true"></span>}
    {tag && <span class="cc-thumb-tag">{tag}</span>}
  </div>
  <div class="cc-body">
    {chips.length > 0 && <div class="cc-tags">{chips.map((c) => <span class="cc-tag">{c}</span>)}</div>}
    <h3 class="cc-title">{title}</h3>
    <p class="cc-summary">{summary}</p>
    {kpis.length > 0 && (
      <div class="cc-kpis">{kpis.map((k) => (<div><div class="cc-kpi-val">{k.val}</div><div class="cc-kpi-label">{k.label}</div></div>))}</div>
    )}
    {linked && <span class="cc-arrow">Read case study <span aria-hidden="true">→</span></span>}
  </div>
  {linked && <a href={href} class="cc-cover" aria-label={`Read case study: ${title}`}>Read case study</a>}
</article>

<style>
  .cc { position: relative; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; transition: transform var(--dur) var(--ease-quint), border-color var(--dur) var(--ease-quint), box-shadow var(--dur) var(--ease-quint); }
  @media (hover: hover) and (pointer: fine) {
    .cc:hover { transform: translateY(-3px); border-color: var(--line-2); box-shadow: 0 18px 40px -12px rgba(13,18,15,0.12); }
    .cc:hover .cc-thumb img { transform: scale(1.04); }
  }
  .cc:active { transform: translateY(-1px); }
  /* visual-only cards (no link) must not imply clickability */
  .cc.is-static { cursor: default; }
  .cc.is-static:hover { transform: none; box-shadow: none; border-color: var(--line); }
  .cc.is-static:hover .cc-thumb img { transform: none; }
  .cc-thumb { position: relative; aspect-ratio: 16 / 10; background: var(--sand); overflow: hidden; }
  .cc-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s var(--ease-quint); }
  .cc-thumb-mock { position: absolute; inset: 0; background: linear-gradient(135deg, var(--ink-2), var(--dark-2)); }
  .cc-thumb-tag { position: absolute; top: 14px; left: 14px; background: rgba(8,16,10,0.78); backdrop-filter: blur(6px); color: rgba(255,255,255,0.92); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 10px; border-radius: var(--r-pill); }
  .cc-body { padding: 24px 24px 26px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .cc-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .cc-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); padding: 4px 9px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--paper); }
  .cc-title { font-size: clamp(20px, 2.2vw, 24px); font-weight: 700; letter-spacing: -0.025em; line-height: 1.2; color: var(--ink); }
  .cc-summary { font-size: 14.5px; color: var(--ink-mid); line-height: 1.6; }
  .cc-kpis { display: flex; gap: 18px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid var(--line); margin-top: auto; }
  .cc-kpi-val { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); line-height: 1; }
  .cc-kpi-label { font-size: 11px; color: var(--ink-muted); margin-top: 4px; letter-spacing: 0.02em; }
  .cc-arrow { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: var(--green); margin-top: 6px; }
  .cc-arrow span { transition: transform var(--dur) var(--ease-quint); }
  .cc:hover .cc-arrow span { transform: translateX(4px); }
  .cc-cover { position: absolute; inset: 0; z-index: 2; text-indent: -9999px; font-size: 0; }
  .cc-cover:focus-visible { outline: 2px solid var(--green); outline-offset: -3px; }
</style>
```

- [ ] **Step 2: Browser check**

Component-only; verified via first use in Task 10.

- [ ] **Step 3: Commit**

```bash
git add standalone-3nm-v2/src/components/CaseCard.astro
git commit -m "feat(card): port live case-studies card as CaseCard.astro"
```

---

## Phase 6 — Rebuild "The results" as cards (spec §4)

### Task 10: Replace stat circles with CaseCard grid

**Files:**
- Modify: `standalone-3nm-v2/src/components/sections/Stats.astro` (full rewrite of body + styles)
- Read (content): `standalone-3nm-v2/content/case-study-*.md` for real KPIs/summaries

- [ ] **Step 1: Pull the 4 case studies' real data**

From `content/case-study-family-office.md`, `-executive-recruitment.md`, `-3pl-logistics.md`, `-education-consulting.md`, extract each: tag, chips, title, 1-line summary, 2 KPIs (before→after). Keep the existing 4 stat values as KPI values where they fit (3h, −8h, 4→1, 0).

- [ ] **Step 2: Rewrite Stats.astro**

```astro
---
import Eyebrow from '../Eyebrow.astro';
import CaseCard from '../CaseCard.astro';
/* Section 5 — results as case-study cards (spec §4). Real KPIs from content/case-study-*.md. */
/* Gate 0 D4: visuals only, no href — cards do not link yet. */
const cases = [
  { tag: 'Education consulting', chips: ['Ops','Reporting'], title: 'Weekly sync, killed.', summary: 'A recurring 3-hour status meeting replaced by one live view.', kpis: [{val:'3h → 0',label:'Weekly sync'},{val:'Weeks',label:'Not months'}] },
  { tag: 'Executive recruitment', chips: ['Hiring','Scoring'], title: 'Eight hours back per candidate.', summary: 'CV scoring and shortlisting the tool nobody sells you.', kpis: [{val:'−8h',label:'Per candidate'},{val:'You own it',label:'All of it'}] },
  { tag: '3PL logistics', chips: ['Ops','Dashboards'], title: 'Four retailers, one live view.', summary: 'Delivery status across four systems, consolidated.', kpis: [{val:'4 → 1',label:'Systems to view'},{val:'Live',label:'Real-time'}] },
  { tag: 'Family office', chips: ['Wealth','OCR'], title: 'Bank statement intelligence.', summary: 'OCR, consolidation and risk flags on statements.', kpis: [{val:'~80%',label:'Manual prep killed'},{val:'0',label:'New admin hires'}] },
];
---
<section class="section stats" id="stats">
  <div class="wrap">
    <header class="section-head">
      <Eyebrow icon="trending" class="reveal">The results</Eyebrow>
      <h2 class="stats-h2 animate-text_opacity">What changed for them.</h2>
      <p class="stats-sub reveal">Real builds for Singapore service firms. Anonymised on request.</p>
    </header>
    <div class="cc-grid">
      {cases.map((c) => <CaseCard {...c} />)}
    </div>
  </div>
</section>

<style>
  .stats-h2 { font-size: var(--title-m); margin-top: 14px; }
  .stats-sub { font-size: var(--text-l); color: var(--ink-muted); margin-top: 12px; }
  .cc-grid { display: grid; grid-template-columns: 1fr; gap: clamp(24px, 3vw, 32px); margin-top: clamp(40px, 6vw, 72px); }
  @media (min-width: 720px) { .cc-grid { grid-template-columns: 1fr 1fr; } }
</style>
```

- [ ] **Step 3: Browser check**

`read_console_messages onlyErrors:true` → **none.**
`javascript_tool`: `document.querySelectorAll('#stats .cc').length` → **Expected: 4.**
`javascript_tool`: `document.querySelectorAll('#stats .stat-circle').length` → **Expected: 0** (circles gone).
Screenshot `#stats` → 2-col card grid matching live case-studies look.

- [ ] **Step 4: Commit**

```bash
git add standalone-3nm-v2/src/components/sections/Stats.astro
git commit -m "feat(results): rebuild stat circles as case-study cards"
```

---

## Phase 7 — Build How it works, FAQ, About (spec §6c)

Each page: `BaseLayout` + Header/Footer + integrated tokens + Eyebrow icons. Content from `content/*.md`. Verify each independently.

### Task 11: How it works page

**Files:**
- Create: `standalone-3nm-v2/src/pages/how-it-works.astro`
- Read: `standalone-3nm-v2/content/how-it-works.md`

- [ ] **Step 1: Build the page**

Structure (from live, agent-verified): page-hero → "The sequence" (6 numbered steps) → "The agreement" (two-col commitments) → dark closing CTA. Use `BaseLayout` with title/description/canonical; import `Header`, `Footer`, `Eyebrow`, `FooterCta` (reuse existing). Pull copy from `content/how-it-works.md`. Use `.section`/`.wrap`/`.section-head` conventions already in `global.css`.

- [ ] **Step 2: Browser check**

Navigate `localhost:4321/how-it-works`.
`read_console_messages onlyErrors:true` → **none.**
`get_page_text` → **Expected:** hero + 6 steps + commitments + CTA present.
`javascript_tool`: `document.querySelectorAll('.eyebrow-ic').length` → **≥1** (icon eyebrows used).
Screenshot → visually consistent with homepage + live case-studies.

- [ ] **Step 3: Commit**

```bash
git add standalone-3nm-v2/src/pages/how-it-works.astro
git commit -m "feat(pages): build How it works in integrated design"
```

### Task 12: FAQ page

**Files:**
- Create: `standalone-3nm-v2/src/pages/faq.astro`
- Read: `standalone-3nm-v2/content/faq.md`

- [ ] **Step 1: Build the page**

Structure: page-hero → 2-col layout `280px 1fr` gap 80px (sticky TOC sidebar + accent-tint CTA box; right = categories) → accordion `.faq-item` (`+`→`×` rotate toggle via `::after`, `max-height` transition) → dark CTA. Collapse to 1 col below 860px. Accordion toggle = minimal inline JS (`<details>`/`<summary>` is the no-JS-safe alternative — prefer `<details>` to avoid custom JS). Copy from `content/faq.md`.

- [ ] **Step 2: Browser check**

Navigate `localhost:4321/faq`.
`read_console_messages onlyErrors:true` → **none.**
`read_page` → TOC + categories + accordion items present.
`computer` click a question → answer expands (or `<details>` opens); re-`read_page` confirms.
Resize to 800px (`resize_window`) → single column.

- [ ] **Step 3: Commit**

```bash
git add standalone-3nm-v2/src/pages/faq.astro
git commit -m "feat(pages): build FAQ in integrated design"
```

### Task 13: About page

**Files:**
- Create: `standalone-3nm-v2/src/pages/about.astro`
- Read: `standalone-3nm-v2/content/about.md`

- [ ] **Step 1: Build the page**

Structure: page-hero → intro → method → manifesto → engagement → invitation (closing CTA). Copy from `content/about.md`. Same chrome + Eyebrow icons.

- [ ] **Step 2: Browser check**

Navigate `localhost:4321/about`.
`read_console_messages onlyErrors:true` → **none.**
`get_page_text` → all 6 sections present.
Screenshot → consistent.

- [ ] **Step 3: Commit**

```bash
git add standalone-3nm-v2/src/pages/about.astro
git commit -m "feat(pages): build About in integrated design"
```

---

## Phase 8 — Final verification & build

### Task 14: Full-site regression + production build

- [ ] **Step 1: Console sweep across all routes**

For each of `/`, `/how-it-works`, `/faq`, `/about`: navigate → `read_console_messages onlyErrors:true` → **Expected: none.**

- [ ] **Step 2: Reduced-motion pass**

`resize_window colorScheme` n/a — instead `javascript_tool`: emulate via `matchMedia`; visually confirm animations snap to end-state (bars full, avatars shown, grant bars full) — no missing content.

- [ ] **Step 3: Production build must pass**

```bash
cd "A:/BL Dev Work/RightClickAI/standalone-3nm-v2" && npm run build
```

**Expected:** exit 0, all 4 pages emitted to `dist/`, no errors. (`output: 'static'`, `format: 'file'` → `how-it-works.html`, `faq.html`, `about.html`, `index.html`.)

- [ ] **Step 4: Responsive spot-check**

`resize_window preset:"mobile"` on `/` → hero stacks, bento 1-col, results 1-col, no horizontal scroll (`javascript_tool`: `document.documentElement.scrollWidth <= window.innerWidth` → **true**).

- [ ] **Step 5: Final commit + push (ask Ben first)**

```bash
git add -A && git commit -m "chore: v2 redesign complete — verified across routes"
# push only on Ben's go (bolun-ben-ship / rcai-root)
```

---

## Coverage check (plan vs spec)

| Spec § | Task |
|---|---|
| §1 hero copy | Task 1 |
| §2 logos | Task 3 |
| §3a bars | Task 4 |
| §3b avatars | Task 5 |
| §3c grant red | Task 6 |
| §3d viz reveals | Task 7 |
| §4 results cards | Tasks 9–10 |
| §5 eyebrows | Task 2 |
| §6a tokens | Task 8 |
| §6b CaseCard | Task 9 |
| §6c 3 pages | Tasks 11–13 |
| §8 decisions | Gate 0 |

All spec sections covered. Results cards are visual-only (Gate 0 D4 = no links yet — no cover link, no arrow CTA, no hover-lift) — flagged, not silent.
