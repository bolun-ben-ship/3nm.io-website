# case-study-compliance-workflow — /case-study-compliance-workflow

## Meta
- Title: Case Study — Compliance Workflow · 13% errors → near zero | RightClick:AI
- Description: A 22-person Singapore finance firm running compliance approvals through email and spreadsheets had a 13% error rate. I rebuilt the workflow. Errors near zero. Coordination work −60%.
- Canonical: https://3nm.io/case-study-compliance-workflow
- Page type: case-study
- JSON-LD present: Article (with about → Service "Custom software build")
- OG type: article
- OG title: Compliance Workflow · 13% errors → near zero — Case Study
- OG description: A 22-person finance firm. Email and spreadsheet approval chains, 13% error rate. I rebuilt the workflow.
- Twitter title: Compliance Workflow Case Study — RightClick:AI
- Twitter description: 22-person finance firm. Coordination work −60%, errors 13% → near zero.
- Article author: Bolun Liu (alt: Ben Liu), Founder, RightClick:AI, https://3nm.io/about
- Article datePublished / dateModified: 2026-05-09

## Purpose (1–2 lines)
Case-study page addressing founders/compliance leads of small finance firms whose approval chains live in email and spreadsheets. Shows a rebuilt, rule-routed workflow with automatic escalation and a self-writing audit trail that cut errors from 13% to near zero and coordination work by 60%.

## Section-by-section (in document order)

### 1. cs-hero — hero: headline promise + lede + primary CTAs
- Eyebrow/label (meta row, three items separated by dividers): "Case study · Financial services" · "Compliance workflow" · "Singapore"
- Heading: "Approval chains, replaced. *Errors 13% → near zero.*" (note: "Errors 13% → near zero." set in `<em>`/accent; line break before it)
- Subhead/body: "A 22-person Singapore finance firm was running compliance approvals through email threads and spreadsheets. Version errors. Missed steps. Every escalation traced manually. I rebuilt the workflow with rule-based routing, timestamped steps, and a full audit trail that writes itself."
- CTA(s): label "Build something like this →" → discovery modal (data-modal-open="discovery"); label "See more work" → /case-studies
- Interactive / graphic element: none (text hero)

### 2. cs-kpi-band — KPI band: four headline metrics
- List/stat items (4 KPIs, value + label):
  - "−60%" — "Coordination work"
  - "~0%" — "Error rate (was 13%)"
  - "5" — "Functions built"
  - "Client" — "Owns the code"
- Interactive / graphic element: static KPI row (4 columns)

### 3. cs-visual (cs-visual-mock) — signature graphic: live compliance-workflow mock card
- Interactive / graphic element: **animated/dark "Compliance Workflow · Live" mock card** (comp-card) — a KEEP element. Structure verbatim:
  - Top bar: three window dots · title "Compliance Workflow · Live" · meta badge "Audit log on"
  - Request block: label "Request · 12:14 PM SGT"; text "Trade authorisation, Hartwell Partners portfolio"; amount (accent) "SGD 2,400,000 · Equity rebalance"
  - Flow (4 vertical steps with connector line; marker = checkmark for done, number for pending; each has name, sub, time):
    - Step (done, ✓): name "Submitted" · sub "Analyst · auto-routed" · time "12:14 PM"
    - Step (done, ✓): name "Compliance review" · sub "Cleared · 6 checks passed" · time "12:31 PM"
    - Step (active, marker "3"): name "Senior partner sign-off" · sub "Awaiting · escalates 2:00 PM" · time "In progress"
    - Step (pending, marker "4"): name "Audit log entry" · sub "Auto-generated on completion" · time "Queued"
  - Footer: left "4 steps · 0 manual emails" · right "Audit trail: complete"
- Notes: this is the page's signature graphic — a vertical timeline/approval-chain card with done/active/queued states. Rebuild should keep it.

### 4. cs-section (Before) — the pain: approval chains lived in inboxes
- Eyebrow/label: "Before"
- Heading: "Approval chains lived in inboxes."
- Subhead/body (three paragraphs verbatim):
  - "The firm's compliance team processed 30 to 50 trade authorisation requests a week. Each request started as a forwarded email, picked up a spreadsheet attachment somewhere along the chain, and bounced through compliance review, partner sign-off, and audit-log entry, manually, person by person, in whichever email thread someone happened to start."
  - "Roughly 13% of submissions had a version-control error: a stale spreadsheet attached, an out-of-date compliance note copied in, or a missed sign-off step that surfaced only when an auditor flagged it weeks later. Every one of those errors meant a re-do. Every re-do meant the analyst, the compliance officer, and the senior partner all touched the request again."
  - "The firm wasn't short on talent. They were short on a system that knew what step came next without anyone having to remember."

### 5. cs-pull — pull quote
- Quote: "We didn't have a process problem. *We had an inbox problem pretending to be a process.*" (note: "We had an inbox problem pretending to be a process." in `<em>`/accent)
- Attribution: "The compliance lead, paraphrased from scoping"
- Interactive / graphic element: pull-quote block

### 6. cs-section (What I built) — the solution
- Eyebrow/label: "What I built"
- Heading: "Routing by rule. Timestamps by default. Audit log by construction."
- Subhead/body: "A custom build, then two follow-on phases. The workflow stopped living in email and started living in a system that wrote its own audit trail."
- List/stat items (5 numbered components, num + name + desc):
  - "01" — "Structured intake form" — "Analysts file requests through a single form. Required fields enforce what used to be a memo's worth of context. No more attaching last week's spreadsheet by mistake."
  - "02" — "Rule-based routing" — "Each request routes to the right reviewer based on type, threshold, and portfolio. The system knows the rules; people stop re-deciding them every time."
  - "03" — "Automatic escalation" — "Sign-off pending past the SLA escalates to a backup. No one sits on a request because they're on leave or out of office."
  - "04" — "Audit log, written automatically" — "Every submission, review, sign-off, and escalation timestamps itself. The audit trail is a byproduct of the work, not a manual reconstruction afterward."
  - "05" — "Compliance dashboard" — "Live view of every request in flight. Stuck approvals, breached SLAs, and audit anomalies surface without anyone running a query."
- Interactive / graphic element: numbered component list (5 items)

### 7. cs-section (Timeline) — four committed milestones
- Eyebrow/label: "Timeline"
- Heading: "Four committed milestones."
- List/stat items (4 timeline rows, when + what; bold lead in what):
  - "48 hours" — "**Scope document delivered.** Routing rules captured, escalation thresholds confirmed, data sources mapped, audit-log format agreed."
  - "Day 7" — "**Working MVP.** Intake form live, three of five routing rules wired, dashboard reading from real submissions. Compliance lead testing in parallel with the old email flow."
  - "Go-live" — "**Full build deployed.** All routing rules live. Escalation active. Audit log generating automatically. Old email-and-spreadsheet flow retired."
  - "Ongoing" — "**Follow-on phases.** Two further phases added: a quarterly compliance report generator and an external-auditor portal that reads the audit log directly."
- Interactive / graphic element: timeline (4 rows, when-column + what-column)

### 8. cs-section (What this means) — the lesson
- Eyebrow/label: "What this means"
- Heading: "Process errors are usually system absences."
- Subhead/body (two paragraphs verbatim):
  - "Most \"process problems\" in service businesses are actually missing systems. The work itself is fine. The way the work is captured, routed, and recorded is held together by people remembering things."
  - "For this firm, that meant a fast custom build, a 60% drop in coordination work, and an audit trail that's never going to be the reason an audit fails. The team didn't get smaller. The work that didn't need a person stopped needing a person."

### 9. cs-sidebar — sticky sidebar: at-a-glance facts + inline CTA
- Eyebrow/label: "At a glance"
- List/stat items (label / value rows):
  - "Industry" — "Financial services"
  - "Location" — "Singapore"
  - "Team size" — "22"
  - "Scope" — "Custom build + 2 phases" (accent-coloured value)
  - "Requests/week" — "30–50"
  - "Built by" — "Ben"
  - "Owned by" — "Client"
- Sidebar CTA body: "**Approval chains live in your inbox?** Book a 30-minute call. I'll show you what the workflow would look like for your firm."
- CTA(s): label "Book a call →" → discovery modal (data-modal-open="discovery")
- Interactive / graphic element: sidebar card + CTA card

### 10. cs-cta-band — closing CTA band
- Eyebrow/label (pre): "Yours could be the next one"
- Heading: "Build a workflow that writes its own audit trail."
- Subhead/body: "No pitch. No proposal. I talk through your business, identify the bottleneck, and tell you honestly whether I can help."
- CTA(s): label "Book a 30-minute call →" → discovery modal (data-modal-open="discovery")

### 11. cs-related — related case studies
- Eyebrow/label: "More client work"
- List/stat items (3 related cards, tag + title + link "Read case study →"):
  - Tag "Education consulting" — "From shared inboxes and PDF folders to one platform. No new admin hire." → /case-study-education-consulting
  - Tag "Family office" — "Bank statement intelligence: OCR, consolidation, risk flags." → /case-study-family-office
  - Tag "3PL logistics" — "Multi-retailer BI dashboard with AI analysis agent." → /case-study-3pl-logistics
- Interactive / graphic element: 3-card related grid, each a link
