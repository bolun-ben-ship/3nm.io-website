# Conversion Audit — 3nm.io homepage (index.html, May 23 build) — 2026-07-25

**Pages:** local `standalone-3nm-website/index.html` (mtime 2026-05-23; unchanged since the Jul 6 audit). Captured by direct file read, not live-scrape.
**Method:** `conversion-audit` skill — 3 lenses run in parallel on one shared brief: `marketing-strategy-pmm`, `copywriting`, `marketing-psychology`.
**Lenses skipped (recorded):** `ads-google` (no paid-search traffic) · `seo-technical` (page loads clean, 0 errors — not the lever for a positioning fix) · `impeccable` (Jul 6 already graded visual craft; page unchanged) · `ads-landing` (no distinct ad promise given — message-match folded into pmm) · `seo-sxo` (scannability folded into synthesis).
**Goal judged against:** the **Jul 22 verdict** — done-for-you, cloud-run AI OS the client *owns*; lead with **ownership + visibility + speed**, not "AI"/the mechanism; solo-founder "I build" voice; ICP = founder-run SG service SME, **5–35 staff**, offshore/lean non-technical team.
**Diff anchor:** Jul 22 research bundle (`experiments/aios-direction/research/`).
**Scope:** Audit-only. Qualitative — no performance data provided, none invented.

---

## The one diagnosis
**The page has all the right material in the wrong sequence.** Every element the Jul 22 verdict needs — ownership, the four-alternatives table, the solo-founder proof, a pain-led H1 — already exists. But the **fold leads with the mechanism and the commoditising buzzword** ("AI Operating Partner" / "We build operating systems" / "Your AI Operating System"), while ownership, visibility, and speed sit *below* the fold as chips and a mid-page table. The value line chosen on Jul 22 to fix exactly this was never placed on the page. **All 3 lenses reached this independently.**

## The core decision (resolve before tactics)
**Re-hero for the Jul 22 positioning — copy-only, ships today — vs. wait and rebuild.** The substance is ~90% present; the fix is re-ordering + one missing section, not a rebuild. Recommended: **re-sequence the fold now.** Nothing below the fold needs to move first.

Secondary decision surfaced by all 3 lenses: **the page never answers the ICP's silent fear — "will my lean offshore team actually use this?"** The central-delivery story (Ben runs the agent layer; the team touches only a task board + wiki + copilot) is the least-copyable moat in the whole strategy and appears *nowhere*. This is a new section, not a rewrite.

## Prioritised fixes (ship order)

### P0 — Re-hero the fold to ownership + visibility + speed [consensus: 3 lenses]
The subhead is the worst line on the page: leads with the mechanism, flips voice to "we," names zero ownership/visibility/speed/number.
- **Subhead** — current: *"You don't have to be. We build operating systems for service firms scaling without the next hire."*
  → *"You don't have to be. I build you one system that runs the operations you hold in your head — you own it outright, live on your real data in 6 weeks."*
- **Eyebrow** — current: *"AI Operating Partner · Singapore"* → *"For founder-run Singapore service firms · 5–35 staff"* (installs ICP + kills the buzzword-first read).
- **Foundation H2** — current: *"Your AI Operating System. Built from scratch."* → *"Your whole business in one view. Built from scratch, owned by you."*
- Keep H1 verbatim (*"You're the system holding it all together. That's the problem."*) — strong felt-pain, all 3 lenses said keep.

### P0/P1 — Add the central-delivery adoption section [consensus: 3 lenses — flagged the single biggest gap]
For an ICP whose adoption killer is "figure-it-out AI on every laptop" (market finding #5: 15–20% adoption vs 72% with central rollout), the delivery moat must be sold, not assumed. New section, H2 e.g. *"Your team doesn't have to learn AI."* Body: *"Your team touches one task board, one wiki, one assistant. I run the AI layer centrally. Nothing to install, nothing for your admin team to figure out."* Psychology lens: demonstrate it by making the live demo a self-serve CTA (below).

### P1 — Add a lower-commitment CTA rung: the live demo [consensus: copy + psychology]
Every CTA is the same high-cost ask (30-min call); the ghost "See how it works" is a nav link, not a rung. The strongest anti-hype asset — the working AI OS Ben runs his own business on — is a CTA nowhere.
- Replace the hero ghost → *"See the live system I run my own business on →"* (→ demo). Keep *"Book a 30-minute call"* primary. Foot-in-the-door + reciprocity: let the skeptic verify before committing time.

### P1 — Fix the voice flips "we" → "I" [consensus: 3 lenses]
The "we" hides Ben's owner-operated accountability — the direct answer to the rented-agency alternative the ICP distrusts.
- Recognition: *"…what founders said to **us**, before **we** built…"* → *"…said to **me**, before **I** built…"*
- Form sub: *"No pitch. No proposal. **We** talk about your business…"* → *"No pitch. No proposal. Just me asking where your business is stuck."*
- Hero + Foundation "We build" → "I build" (P0).

### P1 — Frame the price so cheap doesn't read *small* [consensus: pmm + psychology]
S$9,500 sits naked next to S$80–200K (market finding #3: risk is looking small, not expensive). Reframe on permanence/ownership, not the number.
- vs-table RightClick price cell → lead with ownership, price second: *"S$9,500 once — four functions live in 6 weeks. Yours forever. No subscription."*
- Optional anchor line: *"About six weeks of an ops manager's cost — except it doesn't quit, and you own it forever."*

### P2 — Re-point the "Replaces" ticker [consensus: pmm + psychology]
"Replaces [14 SaaS logos]" picks the wrong category fight (tool-consolidation, not the ops-hire/agency alternatives) and overreaches — no 6-week build credibly replaces Xero AND QuickBooks AND HubSpot, which *feeds* the hype suspicion. Relabel *"Replaces"* → *"One view across"* and trim to 5–6 logos.

### P2 — Make the closing "bottleneck" textarea optional [lone catch: psychology — but Jul 6 flagged it too]
A *required* free-text field is the top-abandonment element on a 3-field form, and asks a skeptic to disclose their biggest weakness before the free call. → make optional, relabel *"Anything specific you want me to look at before we talk? (optional)"*, or drop to 2 fields.

### P3 — Dead nav anchor [lone catch: copy]
Nav "Book a call" uses `href="#"` (lines 4039, 4056) — drops high-intent clicks to page top on JS-fail / middle-click / new-tab. → `href="#closing"`.

## Page ↔ market diff (scorecard)
| Market finding (Jul 22) | Page state |
|---|---|
| #2 Ownership must differentiate, not the word | **FAILS at fold** — wedge demoted below the buzzword it should beat |
| #5 Central-delivery = the adoption moat | **MISSING entirely** — the least-copyable differentiator isn't sold |
| #3 Risk is looking *small*, not expensive | **FAILS** — naked S$9,500 signals widget, not whole-business asset |
| Anti-hype (buyers primed to distrust "AI OS") | **PARTIAL** — H1 + founder block win; eyebrow/subhead/H2 + "replaces 14 tools" feed the suspicion |
| #6 Real fight = ops-hire + rented agency | **PASSES (below fold)** — "Four ways to fix this" table is the page's best asset; should inform the fold, not just mid-page |
| #1 Non-price wedge | **PARTIAL** — ticker + unframed price drag toward a cost axis RCAI can't win |

## Single highest-leverage change
**Rewrite the fold (subhead first, then eyebrow + Foundation H2) to lead with ownership + visibility + speed, and add the central-delivery adoption section.** The fold decides whether the buyer reads this as "another AI-OS pitch" or something categorically different — right now it says the former. Copy + one section, not a build.

## What to preserve
- H1 and the chaos-stage hero visual (felt-pain, all lenses agreed keep).
- The founder-voice block ("I build everything myself") — it's the voice the whole page should match.
- The "Four ways to fix this" table — best positioning asset on the page.
- The full risk-reversal stack (Stop anytime, prorated refund, S$200/day-late) and the "You own the code" chip.

## Open tension (not a fix — a decision for Ben)
The "Grant paperwork: None" wedge sits against market finding that grant-subsidised rivals are cheaper net, and against the `references/` research suggesting an EDG funding path. Keep as speed/ownership wedge, or reconcile. Decide before the next positioning pass.

## Next steps (not run by this skill)
1. **Decide the core fork** (re-hero now vs rebuild) + the central-delivery section.
2. **Fix:** hand P0/P1 copy to `copywriting` + `frontend-design`/`redesign-skill`/`impeccable`.
3. **Test:** turn the rest into a ranked A/B backlog via `ab-test-loop`.

*Evidence trail: per-lens reports in scratchpad/lens-{pmm,copy,psychology}.md.*
