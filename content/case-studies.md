# case-studies — /case-studies

## Meta
- Title: Case Studies — Real Singapore Service Businesses · RightClick:AI
- Description: Five real Singapore service businesses. Five custom operational systems. From education consulting to financial compliance, family offices, 3PL logistics, and executive recruitment. Built to fit, owned by the client.
- Canonical: https://3nm.io/case-studies
- Page type: hub
- JSON-LD present: CollectionPage (with hasPart: 5 × Article) — publisher Organization
- OG Title: Case Studies — Singapore Service Businesses on Custom Internal Software
- OG Description: Five real builds. Education, compliance, family office, 3PL, recruitment. One custom system each, owned by the client.
- Twitter Title: Case Studies — RightClick:AI
- Twitter Description: Five real Singapore SMEs. Five custom operational systems, each owned by the client.

## Purpose (1–2 lines)
The case-studies index/hub. Presents five real Singapore SME builds as a grid of cards so a prospect can self-select the one that resembles their own business, then click through to the full case study. Closes with a discovery-call CTA.

## Section-by-section (in document order)

### 1. csi-hero — orient the visitor; five real builds, owned outright
- Eyebrow/label: "Case studies · Singapore SMEs" (preceded by a small pulsing dot)
- Heading: "Five businesses.<br>Five custom systems.<br>*Built to fit, owned outright.*" (the third line "Built to fit, owned outright." is accent-coloured via `<em>`)
- Subhead/body: "Real Singapore service businesses I've built custom systems for. Anonymous on request, but every number, every workflow, every artefact below is real. Pick the one that looks like yours."
- List/stat items (4 stats, value + label):
  - "5" — "Live builds"
  - "Weeks" — "Not months"
  - "0" — "New ops hires triggered"
  - "100%" — "Owned by client"
- CTA(s): none in hero
- Interactive / graphic element: pulsing accent dot next to the eyebrow (2s pulse animation); reveal-on-scroll animation on heading, lede, and stats row; stats row sits above a top border divider.
- Notes: `<h1>` uses hard line breaks to force three lines. Skip-link "Skip to content" → #csi-hero precedes the section.

### 2. csi-grid — the five case-study cards (index grid)
- Eyebrow/label: none (section has no header; goes straight to the card grid)
- Heading: none
- Subhead/body: none
- Interactive / graphic element: responsive card grid — 1 column on mobile, 2 columns ≥720px; first card (Education) is a full-width feature spanning both columns with a side-by-side image/body layout. Cards lift on hover (translateY, shadow, border shift); thumbnail images zoom to scale 1.04 on hover; each entire card is a cover-link. Reveal-on-scroll with staggered delays.
- Notes: five `<article>` cards follow, each with a thumbnail (photo or graphic mock), tag row, title, summary, KPI row, a "Read case study →" arrow, and a full-card cover link. Each card's content captured below.

#### Card 1 — Education Consulting (FEATURE, full-width)
- Thumb tag (on image): "Education consulting"
- Thumb image: /assets/case-study-images/education.jpg — alt "University admissions consulting environment" (1600×900)
- Tags: "University admissions", "Singapore"
- Title: "From shared inboxes and PDF folders to one platform. No new admin hire."
- Summary: "Dozens of student applications per consultant, tracked across spreadsheets, shared inboxes, and PDF folders. I unified the work into one platform. The 3-hour weekly sync between consultants and the sales/CS manager is gone."
- KPIs (value / label):
  - "3h → 0" — "Weekly sync"
  - "Weeks" — "Not months"
  - "1" — "Platform replaces 5"
- CTA / link: "Read case study →" → /case-study-education-consulting (whole card is a cover link; aria-label "Read the Education Consulting case study")

#### Card 2 — Compliance Workflow
- Thumb tag: "Compliance workflow"
- Thumb: graphic MOCK (not a photo) — a dark-gradient card titled by 4 status rows, each with a coloured status dot, a label, and a right-aligned meta tag:
  - green (ok) dot · "Onboarding · KYC complete" · "L1"
  - green (ok) dot · "Compliance review" · "L2"
  - amber (warn) dot · "Risk approval pending" · "L3"
  - red (err) dot · "SLA breach · re-route" · "auto"
- Tags: "Financial services", "Singapore"
- Title: "Approval chains, replaced. 13% errors → near zero."
- Summary: "Multi-step compliance routing was held together by email and chasing. I rebuilt the chain as a versioned workflow with auto-escalation. Errors collapsed. The compliance officer stopped being a router."
- KPIs (value / label):
  - "13% → ~0" — "Routing errors"
  - "Weeks" — "Not months"
- CTA / link: "Read case study →" → /case-study-compliance-workflow (aria-label "Read the Compliance Workflow case study")

#### Card 3 — Family Office
- Thumb tag: "Family office"
- Thumb image: /assets/case-study-images/family-office.jpg — alt "Financial documents and portfolio analysis on a desk" (1600×900)
- Tags: "Wealth · OCR", "Singapore"
- Title: "Bank statement intelligence: OCR, consolidation, risk flags."
- Summary: "Hundreds of bank statements per quarter, manually consolidated by analysts. I built a pipeline that ingests, reconciles, flags anomalies, and outputs a portfolio view by Monday morning."
- KPIs (value / label):
  - "~80%" — "Manual prep killed"
  - "Weeks" — "Not months"
- CTA / link: "Read case study →" → /case-study-family-office (aria-label "Read the Family Office case study")

#### Card 4 — 3PL Logistics
- Thumb tag: "3PL logistics"
- Thumb image: /assets/case-study-images/3pl-logistics.jpg — alt "Last-mile delivery warehouse with sorted parcels" (1600×900)
- Tags: "Multi-retailer", "Singapore"
- Title: "Multi-retailer BI dashboard with AI analysis agent."
- Summary: "Operational data from multiple retailer systems was reconciled by hand each week. I unified it into one BI surface with an AI agent that surfaces what changed and why. No more pivot-table archaeology."
- KPIs (value / label):
  - "1 view" — "Replaces 6+ exports"
  - "Weeks" — "Not months"
- CTA / link: "Read case study →" → /case-study-3pl-logistics (aria-label "Read the 3PL Logistics case study")

#### Card 5 — Executive Recruitment
- Thumb tag: "Executive recruitment"
- Thumb image: /assets/case-study-images/executive-recruitment.jpg — alt "Executive recruitment interview setting" (1600×900)
- Tags: "Senior placements", "Singapore"
- Title: "Pipeline intelligence: no more “where are we with this candidate?”" (uses curly quotes around the candidate question)
- Summary: "Senior placements lived in inboxes, calendars, and partners' heads. I built a pipeline view with movement tracking, follow-up alerts, and signal scoring. The Monday catch-up became a 5-minute scan."
- KPIs (value / label):
  - "5 min" — "Monday catch-up"
  - "Weeks" — "Not months"
- CTA / link: "Read case study →" → /case-study-executive-recruitment (aria-label "Read the Executive Recruitment case study")

### 3. csi-cta — closing CTA band, book a call
- Eyebrow/label: "Yours could be the next one"
- Heading: "Build the system before you build the next hire." (no accent-colour spans; white text on dark band)
- Subhead/body: "No pitch. No proposal. I talk through your business, identify the bottleneck, and tell you honestly whether I can help."
- CTA(s): label "Book a 30-minute call →" → opens discovery modal (`data-modal-open="discovery"`, href="#")
- Interactive / graphic element: dark-background band, centre-aligned; reveal-on-scroll with staggered delays on eyebrow/heading/body/button.
- Notes: white button style (btn btn-white) with an arrow. The discovery modal itself is shared shell (not documented here).
