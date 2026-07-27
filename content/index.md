# index — /

## Meta
- Title: RightClick:AI — Custom Internal Software for Singapore Service Businesses
- Description: I build Singapore service founders the exact internal software their business needs — the custom system off-the-shelf SaaS won't build. Scoped per client after a paid audit. You own the code. No grant paperwork.
- Canonical: https://3nm.io/
- OG Title: RightClick:AI — Scale your service business without hiring
- OG Description: I build the exact internal software your Singapore service business needs — the custom system SaaS won't. Scoped per client after a paid audit. You own the code. No grant paperwork.
- Twitter Title: RightClick:AI — Scale your service business without hiring
- Twitter Description: Singapore service founders get the custom internal software SaaS won't build. Scoped per client after a paid audit. You own the code. No grant paperwork.
- Page type: landing
- JSON-LD present: Organization + Service (with hasOfferCatalog of 4 offers: BI dashboards, Admin automation, Custom internal apps, AI workshops) + FAQPage (11 questions — mirrors the FAQ section verbatim)

## Purpose (1–2 lines)
Top-of-funnel homepage for founder-run Singapore service firms (5–35 staff). Names the founder-as-bottleneck problem, positions RightClick:AI's custom internal software as the fix (own the code, no grant paperwork, live in weeks), proves it with case studies, contrasts it against the alternatives, and converts to a free discovery call / bottleneck form.

## Section-by-section (in document order)

### 1. Hero (#hero) — name the problem: the founder is the system
- Eyebrow/label: "For founder-run Singapore service firms · 5–35 staff"
- Heading: "You're the system holding it all together. *That's the problem.*" (line breaks after "You're the system" and "holding it all together."; "That's the problem." is the accent-coloured `<em>` — accent green)
- Subhead/body: "You don't have to be. I build you one system to see and run your whole business, the custom internal software off-the-shelf SaaS won't. It stops running through you, so you can **scale without the next hire**. You own every line." ("scale without the next hire" is bold/`<strong>`)
- CTA(s):
  - label "Book a free 30-min call →" → anchor #closing (primary button)
  - label "See how it works" → /how-it-works (ghost button)
- List/stat items — trust row (4 items, each with an accent dot):
  - "You own the code"
  - "Live in weeks, not quarters"
  - "Stop anytime"
  - "Built in Singapore"
- Interactive / graphic element: **"chaos-stage" — a pile of 5 floating/tilted notification cards that drift (idle animation) and jump to upright + lift on hover** (`role="figure"`, aria-label "An ordinary morning of interrupts addressed to the founder"). Plus a pulsing red circular "47" floater badge (aria-label "47 unread"). The 5 cards, verbatim:
  1. Slack card — app line "Slack · Sarah" · meta "2m ago"; message "**@you** can you approve the Q3 forecast deck before 3pm?" ("@you" is an accent mention)
  2. Email card — app line "Email · Compliance" · meta "Tue, 3 days"; from "Re: Trade authorisation"; subject "Awaiting your sign-off. Senior partner on leave."
  3. Alert card — app line "Alert · Invoicing" · meta "Just now"; message "Invoice overdue. Hartwell Partners."; amount "SGD 8,400 · 14 days late" (error-red, with dot)
  4. Calendar card — app line "Calendar" · meta "In 12 min"; message "Forecast review · prep needed before call"
  5. DM card — app line "DM · Team" · meta "9:42 AM"; message "\"Need a decision on the SkyBridge contract by EOD. Team's blocked.\""
- Notes: App icons are stylised single-letter glyphs (Slack "#", Gmail "M", Alert "!", Calendar "C", DM "D"). Cards have subtle random rotations and z-stacking. Reveal-animation staggered (reveal, reveal-d1…d4).

### 2. Tools ticker (#tools-ticker) — "one view across your tools"
- Eyebrow/label: "One view across" (ticker-label; full aria-label "One view across the tools your data lives in")
- Interactive / graphic element: **Horizontal auto-scrolling marquee/ticker of tool logos + names** (track is duplicated for seamless loop). Items, in order: Xero (logo), HubSpot (logo), Notion (logo), Monday.com (text), Google Sheets (logo), Zapier (logo), Airtable (logo), Slack (text), ClickUp (logo), FreshBooks (text), QuickBooks (logo), Pipedrive (text), Trello (logo), Asana (logo). Logo assets: /assets/logos/{xero,hubspot,notion,googlesheets,zapier,airtable,clickup,quickbooks,trello,asana}.svg
- Notes: The full set repeats a second time (aria-hidden) to make the scroll continuous.

### 3. Capability strip (.cap-strip) — one-line summary of what's built
- Label: "What I actually build" (cap-strip-label; section aria-label "What I build")
- List/stat items — 4 chips, verbatim:
  - "BI dashboards"
  - "Admin automation"
  - "Custom internal apps"
  - "Team adoption"
- Interactive / graphic element: static chip row (no animation).

### 4. Who this is for (#recognition) — mirror the founder's week back at them
- Eyebrow/label (section-label): "Who this is for"
- Heading: "Does this sound like your week?"
- Subhead/body (lead): "Every line below is what a founder said to me, before I built them out of it."
- Interactive / graphic element: **"rec-visual-card" — a status-dashboard mock** (`role="figure"`, aria-label "Status of a typical service business this week") with a window top-bar (3 dots + title "Your business · This week") and 5 status rows, each a name + sub-line + coloured status badge:
  1. "Status updates" / "11 messages today" — badge "Manual" (error)
  2. "Last month's report" / "Coming Tuesday. Third month running." — badge "Late" (error)
  3. "Next quarter's forecast" / "\"Probably hit target\"" — badge "Guess" (warn)
  4. "Decisions waiting on you" / "4 in your inbox. Team blocked." — badge "Stalled" (warn)
  5. "Work nobody owns" / "3 priorities. 6 weeks no movement." — badge "Not happening" (neutral)
  (On desktop the card is sticky as the list scrolls beside it.)
- List/stat items — numbered recognition list (5 items, staggered reveal), verbatim:
  - 01 — "Every real question routes through you."
  - 02 — "Last month's numbers won't be ready until next week. Same as last month."
  - 03 — "Next quarter is a guess. It's been close enough that nobody has pushed back."
  - 04 — "Your team can't move without your sign-off. The context lives in your head."
  - 05 — "The work everyone agrees matters keeps not getting done. It's nobody's job."
- CTA(s): boxed callout — "**Sound like your week?** Book a free 30-min call →" → anchor #closing (inline link-cta with arrow)
- Notes: Two-column layout — sticky dashboard mock on one side, numbered list on the other. Warm background section.

### 5. Ops-hire trap (#ops-trap) — the enemy is the ops hire
- Eyebrow/label (section-label): "Before you write the job description"
- Heading: "An ops hire rents you a fix. *It never becomes yours.*" ("It never becomes yours." is the accent `<em>`)
- Subhead/body (ot-intro): "Most founders solve this by hiring. First an admin. Then a GM. Then a head of ops. It feels like the answer. **Here's what it hides.**" ("Here's what it hides." is bold)
- List/stat items — 3 cards (labelled One / Two / Three), each title + body, verbatim:
  - One — "They need training." — "Months before they run it instead of you. You're teaching the very business you're trying to step out of."
  - Two — "They take leave." — "And the team routes right back to you. The bottleneck didn't move. It just took a holiday."
  - Three — "They leave for good." — "The handover is thin. Can the next hire even carry it? You start the whole climb again."
- Closing block (ot-own), verbatim:
  - "Every SOP, every process they build: is it a line on *their* résumé, or *your* company's property? A month, three months, six months after they walk out, what is actually left?" ("their" and "your" are accent `<em>`)
  - "*Skip the ops hire.* Build a system that you own." ("Skip the ops hire." is accent `<em>`)
  - "Some founders haven't hired the role they were planning. They built it instead."
- Interactive / graphic element: 3-card grid (staggered reveal). No CTA button.
- Notes: Pure argument/persuasion section, no dashboard mock.

### 6. Case study 1 — Education consulting (.case.case-warm, #case-edu) — inline flagship case study
- Heading: "From shared inboxes and PDF folders to one platform."
- Subhead/body (case-sub): "An education consulting firm tracking university admissions for dozens of students across spreadsheets, shared inboxes, and PDF folders."
- Story (case-story): "I unified the work into one platform. Consultants track every student like a deal. Students log in to submit work and upload documents. Sales and customer service can see every student's progress in real time and follow up with parents directly. The weekly 3-hour sync between consultants and the sales/CS manager is gone. The dashboard tells them what they used to ask for."
- List/stat items — 3 results (label / value; accent on 2nd & 3rd values):
  - "Unified" / "One platform"
  - "Killed" / "3-hour weekly sync" (accent)
  - "Outcome" / "No new admin hire" (accent)
- Meta line (2 items with dots): "Built by Ben" · "Owned by client"
- CTA(s): label "Read the full case study →" → /case-study-education-consulting
- Interactive / graphic element: **"edu-card" — a student-management platform mock** (`role="figure"`, aria-label "Student management platform mock"): window top-bar (3 dots, title "Student Operations · Active cohort", "Live" pill with pulsing dot); a KPI row of 3 — "On track" 38 (green), "At risk" 6 (warn), "Enrolled" 3 (neutral); and a 5-row student list, each name + sub + progress bar (width %) + stage pill:
  1. "Daniel Chen" / "Stanford · Submitted" — 100% — stage "Submit"
  2. "Priya Sharma" / "UPenn · Essay v3" — 62% — stage "Essay"
  3. "Marcus Tan" / "Imperial · Documents missing" — 35% (warn fill) — stage "Review"
  4. "Aisha Rahman" / "Duke · Transcript uploaded" — 48% — stage "Docs"
  5. "Wei Lin" / "NUS · Personal statement" — 78% — stage "Essay"
- Notes: Two-column — copy left, mock right. Warm-tinted case background.

### 7. Proof (#work) — 3 more case studies grid
- Eyebrow/label (section-label): "More client work"
- Heading: "Built and shipped."
- Disclaimer (top-right of header): "Anonymised on request."
- Interactive / graphic element: **3-card proof grid** (staggered reveal); each card has a whole-card cover link, a coloured "visual" header block (status pill + industry + location), a body (headline + description + 3 KPI tiles + tags + read-more).
- Card 1 → /case-study-executive-recruitment (cover link aria "Read the full Executive Recruitment case study"):
  - status "Completed" · industry "Executive Recruitment" · location "Singapore · Senior placements"
  - headline "Automated market mapping, sourcing, intelligent filtering."
  - desc "Automated market mapping pipeline. Better-fit candidates surfaced faster. Hiring data retained, searchable, compounds."
  - KPIs: "−8h" / "Per candidate" · "2-3×" / "Pool growth" · "Live" / "Market map"
  - tags: "Recruitment ops" (accent), "Built by Ben"
  - "Read case study →"
- Card 2 → /case-study-family-office (cover link aria "Read the full Family Office case study"):
  - status "Completed" · industry "Family Office" · location "Singapore · Financial services"
  - headline "Bank statement intelligence with OCR, consolidation, risk flags."
  - desc "OCR parses statements across multiple banks. Positions normalised, consolidation surfaced. Director sees live, no waiting."
  - KPIs: "Live" / "Portfolio view" · "Multi" / "Bank OCR" · "Auto" / "Risk flags"
  - tags: "OCR + BI" (accent), "Built by Ben"
  - "Read case study →"
- Card 3 → /case-study-3pl-logistics (cover link aria "Read the full 3PL Logistics case study"):
  - status "Completed" · industry "3PL Logistics" · location "Singapore · Last-mile"
  - headline "Multi-retailer BI dashboard with AI analysis agent."
  - desc "Four retailers, previously scattered across Excel, unified. YoY, MoM, store-vs-store, SKU. AI agent surfaces recommendations from live data."
  - KPIs: "4 → 1" / "Retailers unified" · "Live" / "SKU view" · "AI" / "Analysis agent"
  - tags: "BI dashboard" (accent), "Built by Ben"
  - "Read case study →"
- CTA(s):
  - label "See all five case studies →" → /case-studies (mobile "see-all-m" link)
  - section CTA: pre-text "Yours could be the next one." + button "Book a free 30-min call →" → anchor #closing
- Notes: Header uses "See all five" — total of five case studies across site (this section shows 3; the education one is section 6).

### 8. What I build (#build) — the offer + data→hub architecture
- Stage banner (reveal, aria-label "What I build"):
  - eyebrow "What I build"
  - name "Custom software SaaS won't build."
  - tag "The exact internal system your business runs on, built to your real workflow and your real data. Off-the-shelf tools can't fit it and won't price for a team your size. I build it. You own it."
- Heading (foundation-h2): "Your whole business in one view. Built from scratch, owned by you." (line break after "one view.")
- Subhead (foundation-sub): "It starts with your data. Every signal your business already produces, pulled into one place you actually own, so you can see what's happening without asking anyone or opening five tools."
- Interactive / graphic element A: **"foundation-arch" — a radial data→hub diagram** (`role="figure"`, aria-label "Architecture: every business signal flows into your live dashboard"). An SVG (viewBox 0 0 800 600) with 8 radiating lines converging on a centre, and 8 animated "flow dots" travelling along each line inward (staggered SVG `animateMotion`, 2.6s loop). 8 data-source nodes around the ring, each tagged "Data": Finance, Calendar, Sales, Marketing, HR, Operations, Email, "+ Custom". Centre hub node ("arch-hub-center") with a pulse dot and text:
  - title "One connected system"
  - headline "Your live operational brain."
  - tagline "Always on. Always yours. Every signal in one place."
  - footer "One source of truth. Decisions in seconds."
- Lead into grid (fn-grid-lead): "A few of the things founders have had me build:"
- List/stat items — 4 "function" items (each with a green check), name + desc, verbatim:
  - "BI dashboards" — "Your sales and ops data in one live view: revenue, pipeline, capacity, client health. Stop chasing status updates. See it."
  - "Admin automation" — "Report generation, deck creation, client onboarding, the calculation buried across five spreadsheets. The work that eats your week, handled by the system."
  - "Custom internal apps" — "The tool no SaaS sells you: CV scoring, delivery ops, review boards, intake pipelines. Built to your process, not someone else's template."
  - "Team adoption, built in" — "Your whole team using the system day to day, not just you. Sessions and guardrails so it gets used, not admired."
- Interactive / graphic element B: **"foundation-price-bar" — ownership + timeline strip** (dark bar, 2 columns). Left (pitch):
  - large "You own it. All of it."
  - bundle "Every line of code and all your data, yours outright. No subscription. No lock-in."
  - CTA button "Book a free 30-min call" → anchor #closing (white button)
  - Right (timeline, 5 label/value rows):
    - "First" — "A paid audit, your scope + quote"
    - "You own" — "Each phase as it ships"
    - "Your team" — "Talks to me, touches one board"
    - "Capacity" — "3 a month, I build each one"
    - "Guarantee" — "Built until it's live, not a refund"
- Notes: Biggest section. The radial diagram + ownership strip are both signature elements to keep.

### 9. Comparison (.vs-section, #vs) — four ways to fix this
- Eyebrow/label (section-label): "The honest comparison"
- Heading: "Four ways to fix this."
- Subhead/body (vs-intro): "Most founders solve operational chaos by hiring an ops manager. Most expensive. Longest runway. Fails quietly when the person leaves."
- Interactive / graphic element: **Comparison table, 5 columns × 7 rows** (`role="table"`, aria-label "Comparison: hire vs DIY vs agency vs RightClick:AI"). Column headers (col 1 is the row-label column):
  - "Comparing"
  - "Hire an ops manager" (sub "Full-time, 4–6 month onboarding")
  - "DIY no-code" (sub "Make · Notion · spreadsheets")
  - "Agency or dev shop" (sub "Local, regional, or offshore")
  - "RightClick:AI" (highlighted "us" column; sub "Built in Singapore, by Ben")
- Rows (label → Hire / DIY / Agency / RightClick:AI), verbatim:
  - **Year-one cost** → "SGD 80–120K + CPF + tools" / "SGD ~5K tools + your weekends" / "SGD 80–200K+ project fee" / "**Scoped to your build after the audit.** You own every line."
  - **Time to first result** → "4–6 months" / "Weeks of nights. Maybe." / "4–6 months" / "**MVP on real data. Scoped per client.**"
  - **If they leave** → "Knowledge walks out." / "Only what you wrote down." / "You keep the IP, not the code." / "**Nothing leaves.** Code, database, SOPs, wiki, all yours."
  - **Who owns it** → "They do. In their head." / "You, if you remember." / "Barely documented, at best." / "**You.** Source, infrastructure, every SOP."
  - **If it doesn't work** → "Severance, replace, redo." / "Sunk cost of your hours." / "Walk away mid-project. IP fight." / "**Stop anytime. I build until it's live.** All code delivered is yours."
  - **Grant paperwork** → "N/A, it's a hire." / "N/A, it's you." / "Often required. 3–6 months of approval before code starts. Scope freezes during the wait." / "**None.** Cashflow-only. Scope starts right after you commit."
- Notes: RightClick:AI column visually highlighted; its cell copy is bolded on the lead phrase.

### 10. Founder voice (#founder-voice) — short trust block
- Section aria-label: "From the founder"
- Quote (fv-text, with large opening quote mark): "If your problem has a simpler, cheaper answer (a better process, a different tool, no AI at all), *you hear it.*" ("you hear it." is accent `<em>`)
- Attribution:
  - name "Bolun (Ben) Liu"
  - role "Founder · RightClick:AI · Singapore"
  - body "Marketer and AI operator. **I build everything myself**: no subcontractors, no handoffs. Free discovery call, then a workflow audit. I build until it's live and doing the job. You get the result, not a refund. If we're not a fit, you hear it on the call. Read the manifesto →" ("I build everything myself" is bold; "Read the manifesto →" links to /about)
- Interactive / graphic element: 2-column quote/attribution block, no mock.

### 11. FAQ (#faq) — accordion of the questions founders ask
- Sidebar: section-label "FAQ"; heading "Questions founders actually ask."; sub "If something isn't here, email ben@3nm.io. Reply within 24 hours." (email is a mailto link, accent)
- Interactive / graphic element: **FAQ accordion** (faq-list) — 11 items, each a `<button>` toggle with a plus/minus SVG icon and an expandable answer region (aria-expanded / aria-controls). First item ("What happens after I book a call?") is open by default. Questions + answers verbatim:
  1. Q: "What happens after I book a call?" — A: "Free 30-minute discovery call, then a paid workflow audit if both sides see a fit. The audit maps your workflow, your data, and what the software actually needs to do. That map becomes the scope. **You see the full plan and quote before any build starts.** Then I build on your real data, in phases, with you in the loop as it takes shape. You own each phase as it ships. I build until it's live and doing the job."
  2. Q: "What do you actually build?" — A: "Custom internal software, built to your workflow: BI dashboards that put your sales and ops data in one live view, admin automations for the work that eats your week, custom internal apps no SaaS sells you, and AI workshops to get your team actually using it. Plus the infrastructure (hosting, authentication, database) and the data connections agreed in scoping (typically finance, calendar, email, and one source specific to your business). Scoped to your business, never a fixed package."
  3. Q: "What if I want to add something once we've started?" — A: "New requests are welcome; they just go through scoping so nothing derails what's already in flight. A bigger addition (a new data connection, interface, AI workflow, or automation) becomes its own next phase. A small tweak to something already built (filtering, CSV export, a UI change, an extra column) gets bundled into the current scope. Once the scope is approved it's frozen, so anything new goes into the next phase. Every request is classified before it's allowed to change scope."
  4. Q: "Who builds it?" — A: "Ben builds it. No subcontractors, no outsourcing, no handoffs. You work directly with the same person from discovery call to deployment."
  5. Q: "What if Ben misses a deadline?" — A: "I don't sell a deadline. I build until it's live and doing the job. You get the result, not a refund. You see the plan before any build starts, and I keep building until the system does what it's supposed to. **One thing I need from you:** fast feedback. Momentum matters, every blocked decision compounds, so I move fast and I need you to move with me. If feedback consistently stalls, we flag it in writing and reset expectations together."
  6. Q: "Can I cancel anytime?" — A: "Yes. Stop anytime, no penalty. All code delivered is yours regardless. No lock-in."
  7. Q: "Do I own the code?" — A: "Completely. Every line of code, every database, the infrastructure, the SOPs, the knowledge wiki: everything becomes your sole property on delivery. Ben retains no license or rights. If we ever part ways, the system continues to work as intended."
  8. Q: "What's in the knowledge wiki, and why should I care?" — A: "Every SOP, role, responsibility, decision, and rule that shapes how your business runs. Cross-linked. Searchable from inside the AI assistant. Maintained as the system grows. It's the difference between a system that works for you and a system you actually own. If we ever part ways, the wiki and the system continue to work as intended."
  9. Q: "How do I know if we're a good fit?" — A: "**Good fit:** a service business of 5 to 35 people, a founder who can describe what's broken, data that already exists but isn't centralised. **Poor fit:** a business that hasn't started, needs a consumer product, or can't give timely feedback during the build. For how engagements are structured, see *\"Can I cancel anytime?\"* above."
  10. Q: "What does it cost?" — A: "**Every build is scoped and quoted per client after the audit.** There's no fixed price and no fixed package; what you pay depends on what you're having built and how much of it. The 30-minute discovery call is free. The workflow audit is paid: **SGD 635** for a sample BI dashboard, or **SGD 865** for a functioning custom workflow (a CRM, a mini-ERP, and the like). Whatever the audit produces is yours to keep, whether you build further with me or not. You see the full scope and quote before any build starts. Nothing gets built until you've approved the plan."
  11. Q: "Do you work with PSG or EDG grants?" — A: "No, and the reason matters. Grant routes add 3 to 6 months of approval time before a single line of code is written, and they freeze scope during the wait, so the system you receive is the one you specced before you knew what you actually needed. The founders I build for pay out of cashflow because they want the system live fast, not next quarter. **If grant cost-recovery is your top priority, I'm not the right fit.** If speed and clarity are, this is built for you."
- CTA(s):
  - label "See all questions →" → /faq (mobile see-all-m link)
  - section CTA: pre-text "Still have questions? Bring them." + button "Book a free 30-min call →" → anchor #closing
- Notes: The FAQ copy is mirrored (near-verbatim, some expanded) in the FAQPage JSON-LD.

### 12. Closing CTA (#closing) — book-a-call form
- Eyebrow/label (on dark): "Get started"
- Heading: "Book a 30-minute call. It's free." (line break after "call.")
- Subhead/body (closing-sub): "No pitch. No proposal. Book a call, or if you're not ready, just tell me the one thing eating your week below and I'll reply with whether it's even worth a call. I read every one myself. I build every project myself, so I only take three a month."
- Interactive / graphic element: **Formspree form** (id "discovery-form", action https://formspree.io/f/xzdyljay, method POST). Fields:
  - "Your name" — text input, id/name `name`, placeholder "Jane Smith", required, autocomplete name
  - "Work email" — email input, id/name `email`, placeholder "you@company.com", required, autocomplete email
  - "Not ready to book? Tell me the one thing eating your week (optional)" — textarea, id/name `bottleneck`, placeholder "2 to 3 sentences is enough."
  - Submit button: "Book my free call →" (white button)
- Form bottom note: "ben@3nm.io · Singapore · No pitch, no proposal."
- Error state (form-error): "Something went wrong. Email ben@3nm.io directly, or try again." (email mailto link)
- Success state (form-success, aria-live): title "I'll be in touch shortly."; sub "Expect an email from ben@3nm.io within 24 hours. Singapore timezone (SGT, UTC+8)."
- Notes: Dark section. Anchor #closing is the target of every "Book a free 30-min call" CTA on the page.
