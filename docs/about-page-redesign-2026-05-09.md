# About Page Redesign — Design Spec

**Date:** 2026-05-09
**File:** `outputs/RightClickAI/about.html`
**Status:** Design approved by Ben. Ready for implementation plan.

---

## Why this redesign

The current about page was coded directly in the previous session without a design pass. Two problems:

1. **Reading flow is uneven.** Page swings between corporate "we" and personal "I". Six sections each restate "another fact about us" without building momentum. The page reads like a wikipedia entry, not a position.
2. **Visual design feels coded, not designed.** No visual anchor. Founder portrait is placeholder initials in a box. Dark-mode principles section breaks rhythm. Section labels are redundant. No connection between sections.

A pricing inconsistency exists: hero says "6–8 weeks" and "SGD 80,000 industry quote", which conflicts with the index.html commitment to **6 weeks** and **SGD 7,600 Foundation Build**. This must reconcile in the rebuild.

---

## Audience

- **Primary A:** Founders of 15–35-person service businesses in Singapore who already read `index.html` and are deciding whether they trust Ben specifically enough to book a call.
- **Primary C:** Partners (agency owners, consultants, people with client relationships) deciding whether RightClick:AI is the right backend to recommend to their clients.

Both audiences are buying Ben's judgment, not a corporate entity. Method, principles, sectors-delivered serve both. The C audience needs one extra explicit thread (how the partner relationship works) which lives in the engagement-terms section.

## Reader emotion at exit

**C primary, A secondary.** The page should leave the reader feeling:

- **Confrontation / respect** (primary) — "They have a point of view. They'll push back when I'm wrong, which is what I actually need."
- **Trust** (secondary, emerges from C done well) — "This person is sharp. I'd want them in the room when something breaks."

Proof (D) is the index.html job. Recognition of problem (B) is the bottleneck section's job. About page leans manifesto.

---

## Voice commitment

**First-person Ben throughout.** From the H1. The page is signed and dated like an essay. "We" only appears when it literally means Ben + a partner working together on a client engagement. The "AI development partner" corporate framing is dropped (that's the homepage's job).

This is a strategic commitment: it ties RightClick:AI to Ben as a brand. For a 15–35-person service business buyer and a partner deciding to recommend Ben, founder-as-brand is more trust-building, not less.

---

## The spine — 7 sections

### 1. Hero — the position
- **H1:** *"Most AI projects fail before the first line of code."*
- Lede: 2–3 sentences positioning the failure mode and the alternative. First person.
- Top byline: *"Bolun (Ben) Liu · Singapore · April 2026"* — single line, no badges, no eyebrow labels.
- Visual: pull-quote treatment, narrow column (~640px), generous vertical space.

### 2. What I refuse — the manifesto
- **5 numbered statements** at large type (28–32px), single column, max ~640px wide.
- Each: one sentence + one paragraph (30–50 words) of reasoning.
- Statements draft (Ben to refine wording during implementation, count fixed at 5):
  1. *"I will not pick a tool before I understand the workflow."*
  2. *"I will not take a project where the data cannot support the decision."*
  3. *"I will not bill a client for a system I would not run my own business on."*
  4. *"I will not promise a timeline I cannot back with a dated refund clause."*
  5. *"I will not hide behind an account manager. The person who scopes the work is the person who builds it."*
- Visual: numbered statements, slow rhythm, ample whitespace. The page deliberately slows down here. This is the trust-earning section.

### 3. Where this matters — bottleneck (kept)
- The bottleneck section already in place (3 cards: Reporting Overhead, Fragmented Client Visibility, Approval and Handoff Friction).
- Bridge paragraph and "conventional answer is to hire" callout flip into the method.
- No structural change. Light copy tightening only.

### 4. The method — Data Process Thinking
- Condense from 4 steps to 3 with sharper writing. Right column currently runs 3 paragraphs per step — cut to one sentence + one supporting line each.
- Keep numbered structure and the left-column callout: *"The bottleneck is not technology. It is clarity of process."*

### 5. Who I am — founder
- Replace the "BL" initials tile with a **large pull-quote treatment**: a single line ("*Clarity before tools.*") rendered in display type, set in the warm-monochrome card with Ben's signature underneath. Ties founder section back to the manifesto. No stock photo, no placeholder, no generated portrait.
- Bio: shorter, more letter-toned, less CV. 2–3 paragraphs first-person.
- Sectors delivered: collapse from credential row to a single inline line — *"Sectors: healthcare consulting, financial services, compliance, family office ops, 3PL logistics, education, marketing agencies, law firms."*
- Drop "fastest delivery" credential row.
- Keep contact line: *"ben@3nm.io · Singapore · 24-hour response."*

### 6. How we work together — engagement terms (replaces principles)
- Same six points reframed as engagement terms, not abstract principles.
- Two-column light card layout in warm-monochrome style. **No dark mode flip** — that section currently breaks page rhythm.
- Six terms:
  1. **Process before tools** — no technology decision before workflow is mapped.
  2. **Written scope in 24 hours** — exact deliverables, timeline, cost, assumptions before any commitment.
  3. **Working prototype before commitment** — 3-week Readiness Audit, SGD 200/day credit on missed deadlines.
  4. **Honest over agreeable** — if a simpler answer exists, you hear it.
  5. **You own the code** — codebase, architecture, deployment all transferred. No lock-in.
  6. **No account managers** — the person who scopes is the person who builds.
- **C-audience thread (must appear here):** *"I work with partners who own client relationships. The engagement is signed in your name. Your client never sees a 'RightClick:AI' invoice unless you want them to."*

### 7. Invitation — closing (replaces CTA)
- Not a button array. A single line addressed to the reader.
- *"If you've read this far and it resonates, write to me directly: ben@3nm.io. I read every email. I reply within 24 hours. If it's a fit, we'll talk. If it isn't, I'll tell you why."*
- Optional: small inline calendar link as secondary, but primary is the email line.

---

## Pricing & timeline reconciliation

- Hero lede: drop the "SGD 80,000 / four months" comparison entirely. That's an index.html argument.
- Timeline references throughout the page: **"6 weeks"** only (not 6–8). Aligns with index.html and the SGD 200/day refund clause.
- Pricing references: do not mention SGD 13,800. If pricing appears at all, it's SGD 7,600 Foundation Build, but ideally about page does not surface pricing — that's the homepage's job.

---

## Visual direction (vs. current)

| Section | Current | Proposed |
|---|---|---|
| Hero | Eyebrow badge + meta row + H1 with line break + lede | Single byline, narrow-column display H1, no eyebrow |
| Manifesto (new) | — | Numbered statements, large type, slow rhythm |
| Bottleneck | Working | Keep as-is |
| Method | Wall of text right column | Tightened to 1 sentence + 1 supporting line per step |
| Founder | "BL" initials tile + 3-paragraph bio + 4 credential rows | Large pull quote + tighter bio + 1-line sector summary |
| Principles → Engagement terms | Dark-mode 6-tile grid | Light cards, two-column, in page rhythm |
| CTA | H2 + sub + 2 buttons + note | Single inline letter-tone invitation |

---

## What stays. What changes. What dies.

**Stays:**
- Schema.org `AboutPage` JSON-LD (update `dateModified` to 2026-05-09)
- Bottleneck section structure (light copy edit)
- Method 4-step structure (tightened copy)
- Site nav, footer, mobile menu drawer
- All design tokens from `assets/site.css`

**Changes:**
- Hero — full rewrite, new H1, narrower visual
- Founder — replace BL tile with manifesto pull quote, tighten bio
- Principles → Engagement terms — same content reframed, light not dark, add partner thread
- CTA → Invitation — letter tone, single line, no button array
- Method copy — 60% shorter right column

**Dies:**
- "Definition" section as currently written — redundant with hero + bottleneck. The "what is RightClick:AI" answer collapses into the hero lede + the engagement-terms section.
- Dark mode principles styling
- "BL" initials placeholder
- Eyebrow badges and section labels above every section (kept only where they earn space)
- "Updated April 2026" — bumped to 2026-05-09
- The "AI development partner" repeated framing — replaced by Ben's first-person voice

---

## New section: Manifesto

Placed between hero and bottleneck. New CSS pattern:

```
.manifesto-section { padding: clamp(80px, 12vw, 140px) 0; }
.manifesto-intro { max-width: 640px; margin-bottom: 64px; }
.manifesto-list { display: flex; flex-direction: column; gap: 56px; max-width: 720px; }
.manifesto-item { display: grid; grid-template-columns: 56px 1fr; gap: 24px; }
.manifesto-num { font-size: 14px; font-weight: 600; color: var(--accent); padding-top: 12px; letter-spacing: 0.06em; }
.manifesto-stmt { font-size: clamp(22px, 2.6vw, 30px); font-weight: 600; letter-spacing: -0.02em; line-height: 1.25; color: var(--ink); margin-bottom: 14px; }
.manifesto-body { font-size: 15px; color: var(--ink-mid); line-height: 1.75; }
@media (max-width: 768px) {
  .manifesto-item { grid-template-columns: 1fr; gap: 8px; }
  .manifesto-num { padding-top: 0; }
}
```

---

## Acceptance criteria

The redesigned page passes when:

1. The H1 is "Most AI projects fail before the first line of code." (or close variant approved by Ben)
2. Voice is first-person Ben from the H1 to the closing invitation. "We" appears only in the partner-channel sentence.
3. Manifesto section exists between hero and bottleneck with 5 numbered statements.
4. Founder section has no "BL" initials tile.
5. Engagement terms section is light-mode (no dark flip), in two-column card layout.
6. Closing is a single inline letter-tone invitation, not a button array.
7. All timeline references say "6 weeks" — not "6–8 weeks". No SGD 13,800. No SGD 80,000.
8. Schema.org `dateModified` is `2026-05-09`.
9. The C-audience partner sentence appears in the engagement-terms section.
10. No dead CSS rules left from the old principles / stages / definition styling.
11. Mobile rendering verified at 375px width.
12. Navigation and footer match `assets/site.css` patterns (no regression).

---

## Out of scope

- FAQ page rewrite (separate task — flagged as content drift in the index)
- Pillar pages content rewrite (separate task)
- Founder photo procurement — using pull-quote treatment per design decision
- Calendar embed — invitation is email-only by design
- Case study pages — separate session per Ben's earlier "ask me questions" instruction
