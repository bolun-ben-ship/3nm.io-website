# about — /about

## Meta
- Title: About — RightClick:AI | Built by Ben Liu in Singapore
- Description: RightClick:AI is built and run by Bolun (Ben) Liu in Singapore. The manifesto, the method, and the engagement terms behind every system I ship for service businesses.
- Canonical: https://3nm.io/about
- Page type: article (founder manifesto / about page)
- JSON-LD present: AboutPage (with nested Person "Bolun Liu" / alternateName "Ben Liu", jobTitle Founder, worksFor RightClick:AI, email ben@3nm.io, sameAs LinkedIn, address Singapore SG; dateModified 2026-05-09; publisher RightClick:AI)

## Purpose (1–2 lines)
A founder's manifesto establishing why RightClick:AI exists and how Ben works: the argument is that most AI projects fail before any code is written, so the differentiator is process design, data mapping, and clarity before tools. Addresses founders of growing (15–35 person) Singapore service businesses evaluating whether to trust Ben with a build.

## Section-by-section (in document order)

### 1. Page hero — the position / manifesto opener
- Eyebrow/label: "A founder's manifesto · Singapore"
- Heading: "Most AI projects fail *before* the first line of code." (the word "before" is accent-coloured — rendered as `<em>`)
- Subhead/body:
  - "I started RightClick:AI because most automation fails for the same reason, and it is not the technology. The work that decides whether a system survives contact with a real business is process design, data mapping, and clarity before tools. Most agencies skip it to ship faster."
  - "**This page is what I do instead, and what I refuse to compromise on.**" (whole line is bold/strong-emphasised)
- CTA(s):
  - label "Book a discovery call →" → discovery modal (`data-modal-open="discovery"`)
  - label "See the method" → anchor `#method`
- Interactive / graphic element: none (text hero with two CTAs; reveal-on-scroll animation classes)
- Notes: Two staggered lede paragraphs; the second is the emphasised thesis line.

### 2. Bottlenecks — where this matters
- Eyebrow/label: "Where this matters" (section-label)
- Heading: "Where growing service businesses get stuck."
- Subhead/body: "Service businesses between fifteen and thirty-five people tend to hit the same three structural bottlenecks. They are not strategy problems and they are rarely about the team's capability. They are operational frictions that compound quietly until the founder is the slowest part of the system."
- List/stat items — numbered bottleneck list (each has number, statement heading, body):
  - "01 — Reporting overhead. Producing client reports, internal status reports, and management updates absorbs an enormous amount of skilled time. Most of it is manual data assembly the team would never choose to do if the system did it for them."
  - "02 — Fragmented client visibility. Information about a client lives across email threads, project tools, finance software, and individual heads. Answering a basic question (what stage is this client at, what is outstanding, what is at risk) requires asking three people and opening four systems."
  - "03 — Approval and handoff friction. Work waits on someone to be notified, to remember, to approve, or to pass it along. Each handoff loses time and context. The slowest part of delivery is usually not the work itself. It is the gap between the work."
- Interactive / graphic element: **Sticky mock "visual card"** styled as an app window titled "Your operation · This month" (three window dots red/amber/green). Five rows, each a workflow name + sub-line + coloured status badge:
  - "Client report assembly" — sub: "14 hours this week. Same as last week." — badge: **Manual** (error/red)
  - "\"Where are we with Sarah?\"" — sub: "Asked 3 times. 4 systems opened." — badge: **Scattered** (warn/amber)
  - "Approval queue" — sub: "6 items waiting. Average idle: 3 days." — badge: **Stalled** (warn/amber)
  - "Internal status update" — sub: "Slack thread. Tuesday. Still unread." — badge: **Lost** (neutral)
  - "Cross-team handoff" — sub: "Designer → PM → Client. Two days each gap." — badge: **Idle** (neutral)
  - The card is `position: sticky` on desktop while the numbered list scrolls beside it (2-column layout: card left, list right).
- Bridge paragraph (after the list): "There is a quieter problem underneath all three: the parts of the operation that fall between roles. The reports nobody owns. The approvals nobody chases. The data nobody is responsible for keeping current. Those gaps grow as the business grows, and they are where founders end up spending their attention by default."
- Callout box (accent left-border): "The conventional answer is to hire. Hire an operations manager, hire an analyst, hire a chief of staff. That works, but it is expensive, slow to onboard, and adds another node that needs to be managed. **I am proposing a different answer.**" (final sentence bold)
- Notes: The mock card mirrors the homepage "recognition" pattern; badges escalate red → amber → neutral to dramatise decay.

### 3. Method — Data Process Thinking (id: `method`)
- Eyebrow/label: "The method" (section-label)
- Heading: "Data Process Thinking."
- Subhead/body: "Most automation projects fail not because the technology was insufficient, but because the process was never clearly understood before the build began. The bottleneck is not technology. It is clarity of process."
- Callout (accent left-border): "**Design before you build. Build before you scale.** The four steps below are non-skippable. The first three are where I do most of the work." (first sentence bold)
- List/stat items — four numbered method steps (title + body):
  - "01 — Map input → output at every stage. Every workflow has explicit inputs and outputs. I map them granularly: who, when, with what data, in what format. The map becomes the specification."
  - "02 — Surface the invisible micro-processes. The small decisions people make without thinking are the ones that break automated systems. I name them all before the build, not after."
  - "03 — Verify the data behind the decision. You cannot automate a decision the data cannot support. I check what exists, how reliable it is, and whether it can carry the system. If it cannot, you hear it before the build starts."
  - "04 — Only then: design and build. With the map, the data, and the edge cases clear, the build is straightforward. Fast, with a working prototype early. No surprises, because I eliminated them up front."
- Interactive / graphic element: none (two-column grid — heading + callout left, numbered steps list right; warm background section)
- Notes: Steps 1–3 framed as where the real work happens; step 4 (build) is the payoff.

### 4. Manifesto — what I refuse
- Eyebrow/label: "The manifesto" (section-label)
- Heading: "Five things I refuse to do."
- Subhead/body: "These are not preferences. They are non-negotiables. I have said no to projects worth more than the cost of this entire website because the engagement would have violated one of them. The list is short, and it is the reason the work stays good."
- List/stat items — five numbered manifesto items (statement heading + body):
  - "01 — I will not pick a tool before I understand the workflow. The technology decision is the smallest decision in the project. If the workflow is mapped poorly, no tool (Zapier, Make, n8n, custom build) will save it. Most automation projects skip this and pay for it later, usually at the worst possible moment."
  - "02 — I will not take a project where the data cannot support the decision. You cannot automate what you cannot measure. If the data does not exist, is unreliable, or cannot be cleanly extracted, I say so before the contract is signed. The honest answer is sometimes \"fix the data first, then automate.\""
  - "03 — I will not bill a client for a system I would not run my own business on. Every system I ship, I evaluate against the same standard I evaluate my own internal tools by. If I would not use it, I do not deliver it. The work is too expensive on both sides to be embarrassed by the result."
  - "04 — I will not promise a fixed timeline I cannot honestly back. Every build is scoped per client, so I don't sell a date I can't keep. I build until it's live and doing the job. You get the result, not a refund. The commitment exists because soft promises are how trust dies."
  - "05 — I will not hide behind an account manager. The person who scopes the work is the person who builds it. No briefing chains. No junior developers interpreting senior promises. You work directly with me at every stage of the engagement: the mapping session, the prototype, the build, the handover."
- Interactive / graphic element: none (numbered list, large statement type; reveal stagger)
- Notes: Statements are first-person commitments ("I will not…"); each pairs a hard refusal with the reasoning.

### 5. Founder — Bolun (Ben) Liu
- Eyebrow/label: "The founder" (section-label)
- Heading: "Bolun (Ben) Liu"
- Sub-labels: role "Founder, RightClick:AI · Singapore" · date "Published 2026-05-09"
- Subhead/body — bio paragraphs:
  - "I am a marketer and an AI operator. I run AI workflows inside a service-based SME by day, and I started RightClick:AI because I watched too many service businesses pay for automation that never produced what was promised, not because the technology failed, but because nobody mapped the process before anyone wrote any code."
  - "My edge is not code. It is process-first thinking with data discipline. Before I design any system, I map every input and output. I identify what data exists and whether it can support the decision the system is supposed to make. I surface the small invisible micro-processes that nobody consciously tracks. **Only then does the build begin.**" (final sentence bold)
  - "Everything else on this page (the manifesto, the method, the engagement terms) is the operating system I work by. I have not changed my mind about any of it."
- List/stat items — founder meta lines:
  - "**Sectors delivered:** healthcare consulting · financial services · compliance workflows · family office operations · 3PL logistics · education consulting · marketing agencies · law firms."
  - "**Contact:** ben@3nm.io · Singapore (SGT, UTC+8) · 24-hour response."
- Interactive / graphic element:
  - **Founder photo quote-card** — portrait image with dark gradient overlay carrying a pull-quote. Image: `/assets/ben-portrait.webp` (WebP source) / `/assets/ben-portrait.jpg` (fallback, 900×1352), alt "Bolun (Ben) Liu, founder of RightClick:AI". Overlay quote mark `"`, quote text "Clarity *before* tools." (the word "before" is italic + accent), signature "— **Bolun (Ben) Liu**, Founder".
  - Two-column grid: quote-card left, bio + meta right.
- Notes: The pull-quote "Clarity before tools." is the page's thesis distilled.

### 6. Engagement terms — how we work together
- Eyebrow/label: "How we work together" (section-label)
- Heading: "The terms of every engagement."
- Subhead/body: "These are the same six terms in every contract I sign. They are the operating boundaries of the work: the things you are buying when you buy from me, and the things I will not bend on, regardless of project size."
- List/stat items — six engagement cards (number + title + body), 2-column grid:
  - "01 — Process before tools. No technology decision before the workflow is mapped. The tool is the smallest decision in the project, and I treat it that way."
  - "02 — Written scope before any build. After your mapping session, you receive an exact written scope (deliverables, scope, assumptions) before any build starts. No vague statements of work."
  - "03 — MVP on real data. Built until it's live. Your operational dashboard comes up first on real data. The build is scoped per client and I build until it's live and doing the job, written into the contract."
  - "04 — Honest over agreeable. If your problem has a simpler, cheaper answer (a better process, a different tool, no AI at all), you hear it. I turn down projects where the system will not return its cost many times over."
  - "05 — You own the code. Codebase, architecture, deployment: all transferred to you. No SaaS subscription. No lock-in. Any developer anywhere can pick up the work and continue it."
  - "06 — No account managers. The person who scopes the work is the person who builds it. No handoffs. No briefing chains. You work directly with the founder."
- Partner callout box (label "For partners"): "I work with partners who own the client relationship: agencies, consultancies, advisory firms. **The engagement is signed in your name.** Your client never sees a \"RightClick:AI\" invoice unless you want them to. I am the backend; you stay the brand." (middle sentence bold)
- Interactive / graphic element: 2×3 grid of hover-lift accent-bordered cards; separate partner callout below. Warm background section.
- Notes: Cards restate the manifesto/method commitments as contractual terms; partner callout adds the white-label positioning.

### 7. Invitation — closing letter
- Eyebrow/label: "If you've read this far" (invitation-eyebrow)
- Heading: none (letter-format lines, no H2)
- Subhead/body — letter lines in order:
  - "If this resonates,"
  - "write to me directly: ben@3nm.io." (email is a `mailto:ben@3nm.io` link)
  - "I read every email. I reply within 24 hours." (muted)
  - "If it's a fit, we'll talk. If it isn't, I'll tell you why." (muted)
- Signature: "— Ben" then meta line "Bolun (Ben) Liu · Singapore (SGT, UTC+8)"
- CTA(s): mailto link "ben@3nm.io" → `mailto:ben@3nm.io`
- Interactive / graphic element: none (personal letter block, max-width narrow)
- Notes: Closes the manifesto in first-person letter voice rather than a hard CTA.
