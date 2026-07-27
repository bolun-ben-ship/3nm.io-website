# case-study-family-office — /case-study-family-office

## Meta
- Title: Case Study — Family Office · OCR + Portfolio Intelligence | RightClick:AI
- Description: A Singapore family office had bank statements scattered across multiple banks, all read manually. I built an OCR engine, consolidation layer, and risk-flag dashboard. Director sees the full portfolio, live.
- Canonical: https://3nm.io/case-study-family-office
- Page type: case-study
- JSON-LD present: Article
- og:type: article
- og:title: Family Office · OCR + Portfolio Intelligence — Case Study
- og:description: Multi-bank statements parsed automatically. Full portfolio view, live.
- twitter:title: Family Office Case Study — RightClick:AI
- twitter:description: Multi-bank OCR. Consolidation. Risk flags. Full portfolio view, live.
- JSON-LD detail: Article — headline "Family Office · OCR + Portfolio Intelligence"; author Person Bolun Liu (alt Ben Liu), Founder, RightClick:AI; publisher Organization RightClick:AI; datePublished/dateModified 2026-05-09; keywords: family office, OCR, portfolio intelligence, case study, Singapore, financial services

## Purpose (1–2 lines)
Case-study story for financial-services principals living with weekly manual portfolio compilation. Shows how a Singapore family office's multi-bank PDF statements were turned into an OCR + consolidation + risk-flag dashboard giving the director a live portfolio view.

## Section-by-section (in document order)

### 1. cs-hero — hero: the transformation in one line
- Eyebrow/label (meta row): "Case study · Family office" · "Financial services" · "Singapore"
- Heading: "Bank statements parsed automatically." / (line break) "*Full portfolio view, live.*" (second line emphasised/accent)
- Subhead/body: "A Singapore family office held positions across multiple private banks, with each bank's statement arriving in a different PDF format. The director needed a consolidated view; the team built it manually every week. I built an OCR + consolidation + risk-flagging system, fast. The director sees everything, live, without asking anyone."
- CTA(s): label "Build something like this →" → discovery modal (data-modal-open="discovery"); label "See more work" → /case-studies
- Interactive / graphic element: meta divider chips

### 2. cs-kpi-band — KPI band: four headline metrics
- List/stat items (4 KPIs, value + label):
  - "4" — "Banks consolidated"
  - "Live" — "Portfolio view"
  - "Multi" — "Bank OCR"
  - "Client" — "Owns the code"
- Interactive / graphic element: horizontal KPI stat row (4 tiles)

### 3. cs-visual — hero image
- Interactive / graphic element: image /assets/case-study-images/family-office.jpg, alt "Financial documents and portfolio analysis on a desk", 1600×900, loading eager
- Caption: "Family office · Singapore"

### 4. cs-body / cs-section "Before" — the problem
- Eyebrow/label: "Before"
- Heading: "The portfolio was always one week behind."
- Body:
  - "The family office held positions across four private banks. Each bank produced statements in a different PDF format, on a different cadence. The director wanted one consolidated view of the portfolio: total exposure, currency mix, asset class allocation, internal dependencies, and a flag on anything unusual."
  - "The team built that view manually. Every week. Two analysts spent the better part of a day each pulling numbers, re-keying them into a master spreadsheet, and reconciling the inevitable mismatches. By the time the director saw the spreadsheet on Wednesday, it represented Monday's reality."
  - "For a family office moving real money in real time, "Monday's reality on Wednesday" wasn't visibility. It was a delay disguised as a report."

### 5. cs-pull — pull quote
- Quote: ""I was making decisions on data I knew was a few days stale. *I just had no way to fix that without hiring two more analysts.*"" (second sentence emphasised)
- Attribution: "The director, paraphrased from scoping"
- Interactive / graphic element: pull-quote block

### 6. cs-section "What I built" — the solution + components
- Eyebrow/label: "What I built"
- Heading: "An OCR engine, a consolidation layer, and a risk surface."
- Body: "Fast, from kick-off to full deployment. A custom build with one follow-on phase. The OCR was what opened it up; the rest fell into place once the data was structured."
- List/stat items — numbered component list (5 items, number + name + description):
  - 01 "Multi-bank OCR engine" — "Statements from each bank parsed into a normalised position schema. Format differences absorbed; the director's view doesn't care which bank produced which PDF."
  - 02 "Consolidation layer" — "Cross-bank duplicates collapsed. Currency conversion applied at consistent reference rates. Asset class taxonomy reconciled across providers."
  - 03 "Risk and dependency flags" — "The system surfaces internal dependencies (positions correlated across banks), concentration risk, and unusual movement against a rolling baseline. The director gets flags, not a sea of numbers."
  - 04 "Director's dashboard" — "One view: total exposure, currency mix, allocation, top-N positions, recent movement. Drill in by bank, by asset class, by date. No spreadsheet involved."
  - 05 "AI consolidation suggestions" — "Where positions can be consolidated for fee or risk reasons, the system surfaces suggestions with the rationale visible. The director decides; the system shows the work."
- Interactive / graphic element: numbered component cards (01–05)

### 7. cs-section "Timeline" — delivery milestones
- Eyebrow/label: "Timeline"
- Heading: "Tight scope, fast delivery."
- Body: "Family office scope was tighter because the data sources were narrower. I compressed the schedule accordingly."
- List/stat items — timeline rows (when / what, "what" leads with a bold phrase):
  - "48 hours" — "**Scope document delivered.** OCR template per bank confirmed, consolidation rules agreed, risk thresholds set, dashboard layout sketched."
  - "Day 7" — "**Working MVP.** Two of four banks parsing correctly. Consolidation logic running. Director reviewing real numbers in the dashboard."
  - "Go-live" — "**Full build deployed.** All four banks parsing. Consolidation layer reconciling. Risk flags live. Manual weekly compilation retired."
  - "Follow-on phase" — "**AI consolidation suggestions added** as a follow-on phase once the director had used the base view for a while."
- Interactive / graphic element: timeline rows (when + description)

### 8. cs-section "What this means" — takeaway
- Eyebrow/label: "What this means"
- Heading: "If "the team compiles it weekly" is your reporting model, you don't have a reporting model."
- Body: "Manual compilation is fine when the data fits in one head. The moment it lives across multiple sources or formats, weekly compilation is a delay you've decided to accept. Most of the time, it's a delay you can stop accepting in weeks, not months."

### 9. cs-sidebar — at-a-glance card + sidebar CTA (rendered alongside body)
- Eyebrow/label: "At a glance"
- List/stat items (label / value):
  - Industry — "Family office"
  - Location — "Singapore"
  - Scope — "Custom build" (accent value)
  - Delivery — "Fast, in phases"
  - Built by — "Ben"
  - Owned by — "Client"
- Sidebar CTA text: "**Reporting that lives in spreadsheets compiled weekly?** Book a 30-minute call. I'll show you what live consolidation could look like."
- CTA: label "Book a call →" → discovery modal
- Interactive / graphic element: sticky sidebar card + CTA block
- Notes: sidebar sits next to body sections (4–8) in a two-column grid

### 10. cs-cta-band — closing CTA band
- Eyebrow/label: "Yours could be the next one"
- Heading: "Build a portfolio view that updates itself."
- Subhead/body: "No pitch. No proposal. I talk through your business, identify the bottleneck, and tell you honestly whether I can help."
- CTA: label "Book a 30-minute call →" → discovery modal

### 11. cs-related — related case studies
- Eyebrow/label: "More client work"
- List/stat items — 3 related cards (tag / title / link "Read case study →"):
  - Tag "Education consulting" — "From shared inboxes and PDF folders to one platform. No new admin hire." → /case-study-education-consulting
  - Tag "Financial services" — "Approval chains, replaced. 13% errors → near zero." → /case-study-compliance-workflow
  - Tag "3PL logistics" — "Multi-retailer BI dashboard with AI analysis agent." → /case-study-3pl-logistics
- Interactive / graphic element: 3-card related-work grid (linked cards)
