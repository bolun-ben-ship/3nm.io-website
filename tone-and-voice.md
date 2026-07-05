---
name: RightClick:AI Tone &amp; Voice
description: Operational checklist run against any client-facing copy before it ships. AI-slop filters, front-facing output rule, voice patterns, banned phrases. Paired with PRODUCT.md (offer + voice baseline) and brand-guide.html § 04 (do/don't summary).
register: brand
applies-to:
  - marketing site (3nm.io)
  - client proposals
  - client deliverables (reports, dashboards, briefs)
  - cold outbound (Instantly campaigns)
  - blog posts, social posts, ads
  - any artefact a buyer or client reads
created: 2026-05-18
updated: 2026-05-18
authority:
  - marketing-site/PRODUCT.md (voice + offer)
  - marketing-site/brand-guide.html § 04 voice rules + § 09 anti-references
  - Goshen Spec Guide v1.9 § 12 Front-Facing Output Rule
---

# Tone &amp; Voice

> The single source of truth for how RightClick:AI sounds in writing. Every client-facing artefact passes through this before it ships. Human or AI author, no exception. If the artefact fails the filter, the artefact is the problem, not the filter.

## 1. The North Star

The voice is **one founder talking to another, not a brand voice**. Direct, grounded, owner-operated. First-person reasoning. Numbers and dates on every claim. Comfortable being polarising. Underpromise on tone, deliver on the call.

The reader is a Singapore service-business founder running a team of 10 to 35 people. They are tired, slightly defensive, sceptical of AI-agency claims. They have seen too many decks promising transformation and delivering Zapier flows. The copy must earn trust before it pitches anything.

## 2. The Front-Facing Output Rule

Adapted from Goshen Spec Guide v1.9 § 12. The single rule that catches the most AI slop:

> **A deliverable should read as a finished artefact, not an artefact of its own production.**

If a sentence reveals how the document was made, who reviewed it, what version it is, what spec governed it, or what the AI was thinking, that sentence does not belong in the artefact. Move it to internal notes. The reader is the buyer, not the maintainer.

### Banned in any client-facing rendered output

| Category | Examples |
|---|---|
| Version numbers in body or footer | "v1 · Draft", "report v6", "Spec v1.9", "Updated for the v2 brief" |
| Internal file paths | "see research/table-management-landscape.md", "per docs/offer-strategy.md" |
| Process meta-commentary | "this proposal was generated with...", "after reviewing the brand guide we...", "the engine then computes..." |
| Implementation jargon | "adapter", "pipeline", "config", "module", "engine", "agent", "prompt" (in the noun-of-art sense) |
| Methodology debates left in the doc | "should we frame this as X or Y?", "TBD", "open question for Ben" |
| Author or reviewer attribution | "confirmed by [internal team]", "per Bolun" |
| Spec-section references | "Section § X.Y", "per § 3.6", "as covered in the appendix" (unless that appendix is part of the artefact the client receives) |

The test: would a buyer reading this artefact cold recognise the term as part of what they bought, or treat it as a footnote about how it was made? If the latter, cut it.

Internal-process language belongs in: `projects/<name>/scoping.md`, internal memory, commit messages, the team channel. Not in the artefact.

## 3. Voice Rules

### Do

- **Use first-person reasoning.** "I think", "I've thought through", "Here's why." The page is one founder talking, not a brand voice. Avoid "we believe" / "our team" theatre.
- **Show numbers and dates on every claim.** SGD 12,000. Day 7. 6 weeks. 95% back. SGD 200 per day late. The buyer does the maths and concludes the offer is real. Vague promises are a tell that the offer is not.
- **Name the buyer's actual problem before the pitch.** "Late reports. Fuzzy forecasts. Stalled handoffs. Work that never gets done." Recognition before sales.
- **State beliefs as beliefs, not as universal truth.** "Most AI automation failures happen before the first tool is chosen" reads as a position. "AI is transforming everything" reads as marketing.
- **Be comfortable being polarising.** Filters work. The no-grant FAQ is a filter, not a hedge. Right buyers self-select.
- **Underpromise on tone, deliver on the call.** The artefact should leave the buyer wanting more clarity, not less.
- **Concrete over abstract.** "Their admin re-types invoice rows into a spreadsheet that nobody reads" beats "operational inefficiency in data workflows".

### Don't

- **Marketing softeners.** "We believe", "we strive to", "passionate about", "our mission is", "we're committed to". Cut on sight.
- **Buzzword stacks.** "AI-powered, cloud-native, scalable platform that seamlessly integrates with your existing tech stack." Every word in that sentence is a tell. Replace with one verb and a number.
- **Hours-saved claims without specifying what gets built.** AI-grift copy. Always tie outcomes to specific deliverables.
- **"Founder &amp; CEO" titles on a one-person operation.** Ben is the founder.
- **Calendar-popup CTAs.** "Free strategy session" funnels with phone-number harvesting. The discovery call is "no pitch, no proposal".
- **Default to em dashes.** Use commas, colons, semicolons, periods, or parentheses. Existing copy phases them out on each pass.

## 4. The AI-Slop Filter

The patterns below are how LLM-generated copy gives itself away. They are the rhythm and lexicon of "generic SaaS marketing voice" that no Singapore service-business founder believes. Scrub on sight.

### 4.1 Banned phrases and lexical tells

Verbs to delete or replace with something concrete:

| Banned | Why | Use instead |
|---|---|---|
| Leverage (verb) | Consultantese | Use, exploit, apply |
| Streamline | Vague | Replace with the specific change ("cut the rekeying step") |
| Optimise | Vague | Name the metric ("reduce the report cycle from 5 days to 1") |
| Synergy / synergies | Empty | Cut the sentence |
| Transform / elevate / empower | Marketing softeners | State the specific outcome |
| Seamless / seamlessly | Empty | If integration is real, describe the seam; if not, cut |
| Robust | Empty | Replace with a property ("survives a 10x traffic spike") |
| Comprehensive | Empty | List what is actually covered |
| Cutting-edge / state-of-the-art / next-generation | Hype | Cut |
| Game-changer / revolutionise / disrupt | Hype | Cut |
| Drive (as metaphor) | Consultantese | Use the literal verb ("increase", "trigger", "lead to") |
| Unleash / unlock potential | Empty | Cut |
| Holistic | Vague | Replace with what is included |
| Best-in-class / world-class | Empty | If true, prove with a number |
| Mission-critical | Empty | If true, name what breaks if it fails |
| At scale | Vague | Name the scale ("across 30 outlets") |
| Solution (as a noun) | Empty | Name the thing ("the dashboard", "the workflow") |
| Solutions provider / partner of choice | Hype | Cut the sentence |
| Empowered to | Passive empty | Cut |
| Delight customers / delight users | Sentimental | Cut |

### 4.2 Banned sentence shapes

These are the rhythmic tells of LLM copy. Once you start seeing them, you cannot unsee them.

- **Triadic stacks.** "We are clear, direct, and grounded." "Faster, cheaper, better." Three-item parallel lists with no asymmetry. Allowed sparingly when the three items are concrete and earned. Banned as a stylistic default.
- **The "X is Y. Y is Z. Z is what makes A great." rhetorical climb.** Read as motivational poster.
- **Hedge-then-sweep.** "While X may seem Y, in reality it is the key to Z." LLM tells a story the reader did not ask for.
- **"In today's fast-paced world..."** and every sibling opener. Cut. Start with the buyer's problem.
- **"It's important to note that..."** / "It's worth mentioning that..." Cut. Whatever follows is the point. Lead with it.
- **"At the end of the day..."** Cut. Use what is actually meant.
- **Moreover / Furthermore / Additionally / In addition** as paragraph starters. LLM glue. Restructure so the next sentence stands on its own.
- **"Not only X, but also Y."** Almost always weaker than two separate sentences.
- **"Whether you're A, B, or C — we've got you covered."** Generic SaaS slop. Name the actual buyer.
- **Sentence-initial gerunds when used as decoration.** "Delivering value to clients across..." Cut.
- **The closing "we're excited to help you..." sweep.** Cut. The artefact ends when the work ends.

### 4.3 Rhythm and length

- **Mix sentence length deliberately.** A run of three medium-length parallel sentences reads as AI. Break it with a short sentence. Or a longer one with a subclause that earns its place.
- **Paragraph length: 2 to 5 sentences.** One idea per paragraph. Walls of text read as generated. Single-sentence paragraphs are fine for emphasis.
- **Avoid sentence-level parallelism over more than two clauses.** "We build, we measure, we iterate." OK once. As a habit, it reads as a marketing tic.
- **Cut "that" where the sentence works without it.** "The thing that matters most" → "what matters most".
- **Cut "in order to" → "to".**

### 4.4 The "would a real founder write this" test

The single most useful filter. Read the sentence out loud. Would Bolun actually say this to another founder over coffee, in a service-business context, with no marketing posture? If not, rewrite or cut.

A sentence passes if any of the following are true:
- It contains a specific number, date, dollar amount, or named system.
- It names a concrete observed thing in the buyer's world (a specific tool, a specific frustration, a specific workflow).
- It states a belief the writer is willing to be wrong about, with a reason.
- It commits to something specific the buyer can hold them to.

A sentence fails if:
- It could appear word-for-word on any SaaS landing page.
- It contains two or more banned phrases from § 4.1.
- It is a sentence-level rhythmic tell from § 4.2.
- It tells the buyer how the document was made (§ 2 Front-Facing Output Rule).

## 5. Punctuation, Capitalisation, Numbers

- **Em dashes (—):** default to none. Use commas, colons, semicolons, periods, or parentheses. The live site still has some legacy em dashes; new copy ships with zero.
- **Smart quotes ("" '') and apostrophes (' '):** use these, not straight quotes, in body copy.
- **Title case:** sentence case for body headings ("How it works"). Title Case only for proper-noun product names ("Foundation Build", "Function Cycle").
- **Numbers in body copy:** spell out one to nine; use digits for 10 and above; always use digits for prices, percentages, dates, durations.
- **Currency:** "SGD 12,000" not "$12,000" or "S$12,000". Comma thousands. No decimals on whole-amount prices.
- **Time:** "Day 7", "Week 3", "6 weeks", "48 hours". Hyphens used sparingly.
- **Brand:** "RightClick:AI" with the colon. "Bolun (Ben) Liu" first reference, "Ben" thereafter. Never "Founder &amp; CEO".

## 6. Anti-References (avoid imitating these voices)

- **AI-agency template.** "Leverage AI to streamline your business and unlock unprecedented growth." Purple gradients optional, the voice is the giveaway.
- **Big-agency corporate.** "We partner with forward-thinking organisations to deliver transformative outcomes." Cut.
- **Crypto / AI-maximalist.** "The future is here. Are you ready?" Cut.
- **LinkedIn thought-leader.** "5 lessons I learned scaling AI for SMEs (number 4 will surprise you)." Cut.
- **Productivity-bro.** "Stop wasting time on busywork. Reclaim your hours. Level up." Cut.

## 7. The Pre-Ship Checklist

Run before any client-facing artefact ships. Five passes, in this order.

1. **Front-Facing pass (§ 2).** Grep the artefact for: "v" followed by a number (version stamps), file paths (any `/`), the word "draft", the word "TBD", spec-section references, internal jargon. Every match either belongs in the artefact (rare) or moves to internal notes (default).
2. **Banned-phrases pass (§ 4.1).** Grep for each banned verb and phrase. Each hit is a sentence to rewrite or cut.
3. **Sentence-shape pass (§ 4.2).** Read each paragraph out loud. Listen for triadic stacks, "moreover" openers, hedge-then-sweep climbs.
4. **Em-dash pass (§ 5).** Grep for "—". New copy ships with zero unless the writer can defend each one.
5. **Real-founder pass (§ 4.4).** Read the whole thing as if you are the buyer. Would Bolun say this to another founder over coffee? Cut anything that fails.

A clean run usually takes 10 to 15 minutes per page. Skip it and the artefact bleeds trust before the discovery call.

## 8. Worked Examples

### Bad (LLM slop)

> RightClick:AI leverages cutting-edge AI to seamlessly transform your business operations. Our comprehensive platform empowers founders to streamline workflows, optimise efficiency, and unlock unprecedented growth. Whether you're scaling a small team or managing complex operations, we've got you covered with our holistic, end-to-end solution.

### Good (RightClick:AI voice)

> You're the system holding it all together. That's the problem. We build the operating layer your team runs on so you stop being the bottleneck. Foundation Build is SGD 9,500, six weeks, four functions live on real data by Day 7. You own the code on delivery.

What changed: every banned verb cut, every claim now has a number or a specific commitment, the buyer's actual problem is named in the first sentence, the offer mechanic is visible, no triadic stack, no "comprehensive solution", no "we've got you covered".

### Bad (process leakage)

> This proposal v1 was drafted on 18 May 2026. See research/table-management-landscape.md for the full market scan. The pricing in §06 is indicative pending the discovery audit referenced in scoping.md.

### Good (front-facing)

> Pricing below is indicative until discovery locks scope. Market context is summarised in § 02; if useful, I can share the full landscape scan on the call.

What changed: no version stamp, no file path, no internal scoping reference. The same information is conveyed without revealing the production trail.

## 9. Where This Doc Lives in the System

- `marketing-site/PRODUCT.md` owns the **offer + voice baseline** (audience, three-word personality, beliefs).
- `marketing-site/brand-guide.html` § 04 owns the **at-a-glance voice do/don't summary**, alongside the visual system.
- `marketing-site/tone-and-voice.md` (this file) owns the **operational checklist** that any author runs copy against before it ships.

If any of the three drift, fix this file last. PRODUCT.md and brand-guide.html are upstream; this file is downstream of both.
