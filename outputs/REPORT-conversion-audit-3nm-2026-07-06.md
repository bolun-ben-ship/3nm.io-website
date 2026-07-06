# Conversion Audit — 3nm.io (homepage) — 2026-07-06

**Pages:** https://3nm.io/ (homepage) · captured live via Playwright, 0 console errors, fast load.
**Method:** conversion-audit skill — 6 specialist lenses run in parallel on one shared brief: offer-positioning (marketing-strategy-pmm), marketing-psychology, copywriting, ads-landing, seo-sxo, impeccable (visual).
**Lens skipped:** `ads-google` (no paid-search traffic named) · `seo-technical` (page loads clean, 0 errors — not the lever for an offer pivot).
**Goal judged against:** the NEW positioning — sell a *self-improving knowledge system* to service businesses 7+ years old with 5–15 staff. Alex Hormozi Value-Equation lens applied throughout.
**Scope note:** Audit-only. Diagnoses + rewrites; does not rebuild the page. Handoffs named at the end. No performance data was invented — the audit is qualitative.

---

## The one diagnosis
**The site is a well-built funnel for the wrong offer.** Every load-bearing element — H1, subhead, animated hero, four case studies, product spec, pricing — sells an *AI Operating System* (dashboard + automation + assistant + notifications) as a *replacement for an ops hire*. The new offer — a knowledge base that improves itself overnight — appears in exactly one place: a single mid-FAQ line at section 9 of 10. For a visitor primed by your "gets smarter while you sleep" pitch, message-match breaks in the first two seconds. **All 6 lenses reached this independently.**

## The core decision (resolve this before any tactics)
Two forks, in order:

**Fork 1 — DIY or done-for-you?** Your video hook says *"you can build this yourself in minutes with Claude Code."* Your business sells *done-for-you builds*. If the new offer inherits the DIY framing, it competes with your own paid service. Decide what the self-improving system **is**:
- (a) **Lead magnet** — give the blueprint away; it feeds discovery calls for paid builds. *(Panel's implicit lean — the psychology + ads-landing lenses both note that giving the working system away is itself the proof the claim is real.)*
- (b) **Productized paid build** — a named fixed-scope offer beside the Foundation Build.
- (c) **DIY course/product** — a different business model entirely.

This choice sets the CTA. Recommended: **(a) as the front door → (b) as the paid conversion.** The blueprint proves the claim, the build is what you sell.

**Fork 2 — re-hero the homepage, or build a dedicated page?** The homepage still converts the *old* operational-visibility buyer well. Recommended: **dedicated landing page** for your content/video traffic (hero + product + single CTA all matching the pitch), leave the homepage serving its current buyer. Ads-landing lens explicit on this; visual + PMM compatible. Re-hero only if you're fully retiring the old offer.

## Prioritised fixes (ship order)

### P0 — Fix the above-fold message-match [consensus: 6 lenses]
The hero sells the bottleneck/dashboard story. Rewrite H1 + subhead to lead with trapped-knowledge-that-compounds and name the mechanism. Convergent rewrites from the panel (pick/blend):

- **H1** — current: *"You're the system holding it all together. That's the problem."*
  → *"After 7 years, your best knowledge is trapped in a few people's heads. That's the asset you're not using."* (PMM)
  → *"Seven years of hard-won knowledge, scattered across inboxes and heads. That's the problem."* (copy — keeps the exact "X. That's the problem." cadence)
- **Subhead** — current: *"You don't have to be. We build operating systems for service firms scaling without the next hire."*
  → *"I build you a knowledge system that connects your scattered notes, calls, and decisions overnight — so it gets smarter every day without you feeding it. Built on Claude Code and plain files on your own machine. Not a tool you've never heard of."* (copy/psychology)

Note the voice shift: **"We build" → "I build"** — matches your actual singular founder pitch. Every number+date survives unchanged.

### P1 — Render the knowledge-graph visual you already built [lone catch: visual — verified]
`index.html` contains a complete `.wiki-graph-card` (CSS lines 3044–3139) — cross-linked nodes, green connection lines, a pulsing hub (`wiki-hub-pulse` keyframe animation). **It is used by zero HTML elements** (grep-confirmed). The single most on-message asset on the site is switched off. Wrap it in a `<section id="wiki">` and make it the hero/body visual — its pulsing green hub literally animates "compounding overnight." The pivot is ~90% built. Reuse the existing chaos-pile as the *before* state that resolves into the graph.

### P1 — Add a lower-commitment CTA rung [consensus: psychology + ads-landing]
The only ask is a 30-min sales call — the giant yes, with no intermediate rung for curiosity-state traffic. Add an email-gated **"Get the self-improving system blueprint"** as the primary CTA; keep the call secondary. Giving your actual plain-files + Claude Code system away *is the proof* the overnight claim is real (Reciprocity + demonstrated capability). Replace the `See how it works` ghost button with *"Show me how it works →"* (email-gated walkthrough).

### P1 — Move the mechanism into the first scroll [consensus: sxo + psychology + pmm + visual]
For a compounding claim, **"how" is the proof.** Pull the wiki out of the FAQ into a dedicated section 2, above pricing. H2: *"The part that compounds: a knowledge base that improves itself."* + a 3-step overnight-connections strip (reads across everything → connects overnight → surfaces what you'd have missed).

### P1 — Name the ICP up top [consensus: pmm + psychology + sxo]
The "7+ years / 5–15 staff" qualifier that triggers "he means me" is absent from the fold. Work it into the hero or the pain-list intro — it's your best-fit filter and it earns the scroll.

### P2 — Kill the word "wiki" as the hero noun [lone catch: PMM — high conviction, challenges your stated goal]
"Wiki" carries the exact static / manual / effortful baggage the offer is built to escape — it *is* the failed Notion/Confluence the buyer already resents. Sell the outcome + mechanism. **"Self-Improving AI System"** matches your video hook verbatim (lowest message-match friction); "Compounding Brain" / "a business brain that gets smarter while you sleep" as alternates. Keep "wiki" only as an under-the-hood explainer, never the headline. *(This directly reframes your stated goal: push the outcome, not the mechanism's name.)*

### P2 — Re-point proof and comparison table at the new outcome [consensus: pmm + sxo + copy]
All four case studies prove ops/time outcomes (−8h/candidate, killed a 3-hour sync); none proves knowledge compounding. Add one proof point of the system surfacing a connection nobody asked for. In the "Four ways to fix this" table, swap the competitive set to the new one: *static wiki / knowledge-in-heads / generic ChatGPT / off-the-shelf AI tool.*

### P2 — Add a belief-specific guarantee [lone catch: psychology]
Your risk-reversal (Stop anytime, SGD 200/day late, 95% back) all de-risks *a build*. None addresses the new-offer fear: *"what if it never actually gets smarter?"* Add: *"If it hasn't surfaced a connection you'd have missed within 30 days, I rebuild it or that cycle's free."*

### P3 — Technical leaks [lone catches: ads-landing + sxo]
- Dead hero anchors: `Book a call` uses `href="#"` (lines ~4039, 4056) — jumps to top on JS failure / middle-click / new-tab. Fix → `href="#closing"`.
- Closing form: the `bottleneck` textarea is `required` — a required free-text field is the top abandonment point in a 3-field form. Make it optional and re-label from the old-offer framing to *"What would you want your system to get smarter at?"*

## Value Equation scorecard (Hormozi) — new offer, current page
| Term | State | Why |
|---|---|---|
| Dream Outcome | **Low** | Page dream = "skip the hire," not "your knowledge compounds into a proprietary asset." |
| Perceived Likelihood | **Near-zero** | The overnight/compounding claim is asserted nowhere on-page; all proof is for the old outcome. Huge dream × ~0 belief = ~0 value → reads as hype. |
| Time Delay | **High (conflicting)** | "6 weeks to full build" fights the video's "build it in minutes." |
| Effort & Sacrifice | **High** | Only CTA is a 30-min call — max effort for a curiosity-state visitor. |
Every term is mistuned. P0–P1 above move all four.

## Single highest-leverage change
**Fix the first screen: rewrite H1 + subhead to the self-improving-knowledge promise, and render the already-built `.wiki-graph-card` as the hero visual.** No below-fold polish recovers a message-match break at the top — and the on-message visual is already coded, one `<section>` away from live.

## What to preserve through the pivot (all 6 lenses agreed)
- The direct, first-person, **numbers-and-dates** voice — same register as your video pitch; carry it verbatim. It's also the best defense against the "hype" read.
- **"You own the code"** trust chip — maps *better* to "an appreciating asset you own outright" than it ever did to the dashboard. Swap the other chips toward mechanism/accessibility: *"Runs on Claude Code + plain files · Gets smarter nightly, hands-off."*
- The full risk-reversal stack, the fixed SGD 9,500 clarity, the honest "Four ways to fix this" table format, and the "Does this sound like your week?" pain-list format (re-skin items toward knowledge-loss).
- The chaos-pile hero animation — reuse as the *before* state; the `wiki-hub-pulse` graph is the *after*.

## Next steps (not run by this skill)
1. **Decide Fork 1 + Fork 2** (above) — that unlocks the CTA and page structure.
2. **Fix/build:** hand P0/P1 to `copywriting` + `frontend-design`/`redesign-skill`/`impeccable` — build the dedicated self-improving-system page, render the `.wiki-graph-card`, wire the blueprint email-gate.
3. **Test:** turn the rest into a ranked A/B backlog via `ab-test-loop`.

*Evidence trail: per-lens reports in scratchpad/lens-*.md (pmm, psychology, copy, adslanding, sxo, visual).*
