# RightClick:AI v2 — Copy Map

Every live copy string on the single-page site, in page order. Reference the **#** to tell me what to change.

- **chars** = current exact character count.
- **limit** = the real layout bound. `flex` = no hard limit (rewrite freely, keep it sane). A `ch`/`px`/line note = the design constrains length; overrunning it breaks the layout.
- `slot` = the in-code label (e.g. S1.2) where one exists.

---

## Meta / SEO — `pages/index.astro`

| # | role | copy | chars | limit |
|---|---|---|---|---|
| 1 | meta title | RightClick:AI — Custom Internal Software for Singapore Service Businesses | 73 | **~60** (over) |
| 2 | meta description | I build Singapore service founders the exact internal software their business needs — the custom system off-the-shelf SaaS won't build. Scoped per client after a paid audit. You own the code. No grant paperwork. | 211 | **~155** (over) |
| 3 | og:site_name | RightClick:AI | 13 | flex |

## Header — `components/Header.astro`

| # | role | copy | chars | limit |
|---|---|---|---|---|
| 4 | logo | RightClick:AI | 13 | flex |
| 5 | nav | What I build | 12 | mono nav, ≤16ch |
| 6 | nav | How it works | 12 | mono nav, ≤16ch |
| 7 | nav | My work | 7 | mono nav, ≤16ch |
| 8 | nav | FAQ | 3 | mono nav, ≤16ch |
| 9 | CTA | Book a call → | 13 | flex |

## 1 · Hero — `sections/Hero.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 10 | S1.1 | eyebrow | For founder-run Singapore service firms · 5–35 staff | 52 | flex |
| 11 | S1.2 | h1 | You're the system / holding it all together. / That's the problem. | 62 | 26ch, forced 3-line |
| 12 | S1.3 | subhead | You don't have to be. I build you one system to see and run your whole business, the custom internal software off-the-shelf SaaS won't. It stops running through you, so you can scale without the next hire. You own every line. | 225 | 42ch measure |
| 13 | S1.4 | CTA primary | Book a free 30-min call → | 25 | flex |
| 14 | S1.5 | CTA ghost | See how it works | 16 | flex |
| 15 | S1.6 | trust | You own the code | 16 | flex |
| 16 | S1.6 | trust | Live in weeks, not quarters | 27 | flex |
| 17 | S1.6 | trust | Stop anytime | 12 | flex |
| 18 | S1.6 | trust | Built in Singapore | 18 | flex |

### Hero illustration cards (the interrupt pile)

| # | role | copy | chars | limit |
|---|---|---|---|---|
| 19 | card time | 2m ago | 6 | flex |
| 20 | card title | Slack · Sarah | 13 | 1 line, ellipsized |
| 21 | card body | @you can you approve the Q3 forecast deck before 3pm? | 53 | 1 line, ~186px |
| 22 | card time | Tue, 3 days | 11 | flex |
| 23 | card title | Email · Compliance | 18 | 1 line, ellipsized |
| 24 | card body | Re: Trade authorisation — awaiting your sign-off. | 49 | 1 line, ~186px |
| 25 | card time | Just now | 8 | flex |
| 26 | card title | Alert · Invoicing | 17 | 1 line, ellipsized |
| 27 | card body | Invoice overdue. SGD 8,400 · 14 days late. | 42 | 1 line, ~186px |
| 28 | card time | In 12 min | 9 | flex |
| 29 | card title | Calendar | 8 | 1 line, ellipsized |
| 30 | card body | Forecast review · prep needed before call | 41 | 1 line, ~186px |
| 31 | summary title | The system did | 14 | card 310px |
| 32 | summary meta | Status, reports, follow-ups | 27 | card 310px |
| 33 | summary title | You did | 7 | card 310px |
| 34 | summary meta | Made the one call that mattered | 31 | card 310px |

## 2 · BeforeAfter — `sections/BeforeAfter.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 35 | S2.1 | eyebrow | The execution gap | 17 | ≤20ch |
| 36 | S2.2 | h2 | You didn't sign up to do busywork | 33 | 12ch measure, ≤44 |
| 37 | S2.3 | col label | Before RightClick:AI | 20 | flex |
| 38 | S2.4 | before | You spend forty minutes after every call on work nobody built a tool for. | 73 | ≤78 |
| 39 | S2.4 | before | Your CRM is a to-do list you silently agreed to ignore. The board notices. | 74 | ≤78 |
| 40 | S2.4 | before | Follow-ups slip the moment the next call starts. Deals go quiet. | 64 | ≤78 |
| 41 | S2.4 | before | Your best rep is spending half their week not selling at all. | 61 | ≤78 |
| 42 | S2.5 | col label | After RightClick:AI | 19 | flex |
| 43 | S2.6 | after | A pipeline your manager can defend to the board. | 48 | ≤52 |
| 44 | S2.6 | after | Every record current, without anyone touching it. | 49 | ≤52 |
| 45 | S2.6 | after | Follow-ups sent before the last call even ends. | 47 | ≤52 |
| 46 | S2.6 | after | Your best rep back to closing, full-time. | 41 | ≤52 |

## 3 · Statement — `sections/Statement.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 47 | S3 | eyebrow | It starts with your data. | 25 | flex |
| 48 | S3.1 | h2 | One view across the tools your data already lives in. | 53 | 42rem, balanced |
| 49 | S3.2 | label | Works with | 10 | mono label, short |

## 4 · Bento — `sections/Bento.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 50 | S4.1 | eyebrow | What I actually build | 21 | flex |
| 51 | S4.2 | h2 | Custom software SaaS won't build. | 33 | 18ch measure |
| 52 | S4.3 | intro | The exact internal system your business runs on, built to your real workflow and your real data. Off-the-shelf tools can't fit it and won't price for a team your size. I build it. You own it. | 191 | 40ch measure |
| 53 | S4.5 | card 01 title | BI dashboards | 13 | flex |
| 54 | S4.6 | card 01 body | Your sales and ops data in one live view: revenue, pipeline, capacity, client health. Stop chasing status updates. See it. | 122 | 34ch measure |
| 55 | S4.5 | card 02 title | Custom internal apps | 20 | flex |
| 56 | S4.6 | card 02 body | The tool no SaaS sells you: CV scoring, delivery ops, review boards, intake pipelines. Built to your process, not someone else's template. | 138 | 34ch measure |
| 57 | S4.5 | card 03 title | Admin automation | 16 | flex |
| 58 | S4.6 | card 03 body | Report generation, deck creation, client onboarding, the calculation buried across five spreadsheets. The work that eats your week, handled. | 140 | 34ch measure |
| 59 | S4.5 | card 04 title | Team adoption, built in | 23 | flex |
| 60 | S4.6 | card 04 body | Your whole team using the system day to day, not just you. Sessions and guardrails so it gets used, not admired. | 112 | 34ch measure |
| 61 | S4.7 | card 04 CTA | See how it works → | 18 | flex |
| 62 | S4.5 | card 05 title | No grant paperwork | 18 | flex |
| 63 | S4.6 | card 05 body | No PSG or EDG route, and no 3 to 6 months of approval before a line of code is written. Cashflow-only. Scope starts right after you commit. | 139 | 34ch measure |
| 64 | S4.5 | card 06 title | You own it. All of it. | 22 | flex |
| 65 | S4.6 | card 06 body | Every line of code and all your data, yours outright. No subscription. No lock-in. Source, infrastructure, every SOP. | 117 | 34ch measure |

> Bento decorative viz microcopy (labels baked into the card illustrations) — tell me if you want any changed:
> Revenue · $142k · ↑ 12% · Pipeline · 38 · ↑ 5 · Capacity · 82% · CV Scoring · A. Rahman 92 · M. Tan 78 · W. Lin 85 · 5 spreadsheets · Report, sent · Seats active · 8 / 8 · +3 · Grant route · 3–6 mo ✕ · RightClick:AI · Now ✓ · Source code · Database · Infrastructure · SOPs · Knowledge wiki · 100% yours · no lock-in

## 5 · Stats — `sections/Stats.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 66 | S5.1 | eyebrow | The results | 11 | flex |
| 67 | S5.2 | h2 | What changed for them. | 22 | flex |
| 68 | S5.3 | subhead | Four builds, four Singapore service firms. Anonymised on request. | 65 | flex |
| 69 | S5.4 | stat | 3h | 2 | flex |
| 70 | S5.5 | stat label | Weekly sync killed. Education consulting. | 41 | 22ch measure |
| 71 | S5.4 | stat | −8h | 3 | flex |
| 72 | S5.5 | stat label | Per candidate. Executive recruitment. | 37 | 22ch measure |
| 73 | S5.4 | stat | 4→1 | 3 | flex |
| 74 | S5.5 | stat label | Retailers unified into one live view. 3PL logistics. | 52 | 22ch measure |
| 75 | S5.4 | stat | 0 | 1 | flex |
| 76 | S5.5 | stat label | New admin hires needed after the build. | 39 | 22ch measure |

## 6 · WinCircles (ops-hire Venn) — `sections/WinCircles.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 77 | — | grow caption | Most founders solve this by hiring. First an admin. Then a GM. Then a head of ops. Here's what it hides. | 104 | 20ch measure |
| 78 | S7.1 | eyebrow | Before you write the job description | 36 | flex |
| 79 | S7.2 | h2 | An ops hire rents you a fix. It never becomes yours. | 52 | 46rem |
| 80 | S7.4 | venn label L | Hire the ops role | 17 | mono, nowrap |
| 81 | S7.4 | venn label R | Build the system instead | 24 | mono, nowrap |
| 82 | S7.5 | tooltip L | They need training. Months before they run it instead of you. | 61 | **≤66**, 174px box |
| 83 | S7.5 | tooltip L | They take leave. The team routes right back to you. | 51 | ≤66, 174px box |
| 84 | S7.5 | tooltip L | They leave for good. The handover is thin. You start the climb again. | 69 | ≤66 (**over**), 174px |
| 85 | S7.5 | tooltip R | Every line of code and all your data, yours outright. | 53 | ≤66, 174px box |
| 86 | S7.5 | tooltip R | Nothing leaves. Code, database, SOPs, wiki, all yours. | 54 | ≤66, 174px box |
| 87 | S7.5 | tooltip R | Some founders haven't hired the role. They built it instead. | 60 | ≤66, 174px box |
| 88 | S7.3 | punchline | Skip the ops hire. Build a system that you own. | 47 | 24ch measure |
| 89 | S7.6 | CTA primary | Book a free 30-min call → | 25 | flex |
| 90 | S7.7 | CTA ghost | See how it works | 16 | flex |

## 7 · StepWheel — `sections/StepWheel.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 91 | S8.1 | eyebrow | How it works | 12 | flex |
| 92 | S8.2 | h2 | How a build actually runs. | 26 | flex |
| 93 | S8.3 | intro | Free call, paid audit, then a scope and quote you approve before anything is built. Three a month, because I build each one myself. | 131 | 48ch measure |
| 94 | S8.4 | step 1 label | Discovery call | 14 | flex |
| 95 | S8.5 | step 1 body | Free 30 minutes. If we are not a fit, you hear it on the call. | 62 | flex |
| 96 | S8.4 | step 2 label | Workflow audit | 14 | flex |
| 97 | S8.5 | step 2 body | Paid. Maps your workflow, your data, and what the software has to do. | 69 | flex |
| 98 | S8.4 | step 3 label | Scope + quote | 13 | flex |
| 99 | S8.5 | step 3 body | You see the full plan and quote before any build starts. | 56 | flex |
| 100 | S8.4 | step 4 label | Build in phases | 15 | flex |
| 101 | S8.5 | step 4 body | On your real data, with you in the loop as it takes shape. | 58 | flex |
| 102 | S8.4 | step 5 label | You own it | 10 | flex |
| 103 | S8.5 | step 5 body | Every phase becomes your property as it ships. Stop anytime. | 60 | flex |
| 104 | S8.4 | step 6 label | Live | 4 | flex |
| 105 | S8.5 | step 6 body | I build until it is live and doing the job. The result, not a refund. | 69 | flex |
| 106 | S8.6 | link | See how it works → | 18 | flex |

## 8 · Timeline — `sections/Timeline.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 107 | S9.1 | eyebrow | More client work | 16 | flex |
| 108 | S9.2 | h2 | Built and shipped. | 18 | 18ch measure |
| 109 | S9.3 | intro | Five case studies across education, recruitment, family office, logistics, and compliance. Built by Ben, owned by the client. Anonymised on request. | 148 | 52ch (**only 4 cards render**) |
| 110 | S9.4 | card 1 label | Education consulting | 20 | flex |
| 111 | S9.5 | card 1 title | From shared inboxes and PDF folders to one platform. | 52 | flex |
| 112 | S9.6 | card 1 body | Killed the 3-hour weekly sync. No new admin hire. | 49 | flex |
| 113 | S9.4 | card 2 label | Executive recruitment | 21 | flex |
| 114 | S9.5 | card 2 title | Automated market mapping, sourcing, intelligent filtering. | 58 | flex |
| 115 | S9.6 | card 2 body | −8h per candidate. 2-3× pool growth. Market map live. | 53 | flex |
| 116 | S9.4 | card 3 label | Family office | 13 | flex |
| 117 | S9.5 | card 3 title | Bank statement intelligence with OCR, consolidation, risk flags. | 64 | flex |
| 118 | S9.6 | card 3 body | Live portfolio view. Multi-bank OCR. Auto risk flags. | 53 | flex |
| 119 | S9.4 | card 4 label | 3PL logistics | 13 | flex |
| 120 | S9.5 | card 4 title | Multi-retailer BI dashboard with AI analysis agent. | 51 | flex |
| 121 | S9.6 | card 4 body | Four retailers unified. Live SKU view. AI analysis agent. | 57 | flex |
| 122 | — | card link (×4) | Read case study → | 17 | flex |
| 123 | S9.7 | CTA head | Yours could be the next one. | 28 | flex |
| 124 | S9.8 | CTA primary | Book a free 30-min call → | 25 | flex |
| 125 | S9.9 | CTA ghost | See all five case studies | 25 | flex |

## 9 · Testimonials (founder voice) — `sections/Testimonials.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 126 | S10.1 | eyebrow | From the founder | 16 | flex |
| 127 | S10.2 | h2 | Marketer and AI operator. | 25 | flex |
| 128 | — | quote 1 | "If your problem has a simpler, cheaper answer (a better process, a different tool, no AI at all), you hear it." | 112 | 820px |
| 129 | — | quote 2 | "I build everything myself: no subcontractors, no handoffs. I build until it is live and doing the job. You get the result, not a refund." | 138 | 820px |
| 130 | — | quote 3 | "Every line of code, every database, the infrastructure, the SOPs, the knowledge wiki: everything becomes your sole property on delivery." | 138 | 820px |
| 131 | — | attribution name | Bolun (Ben) Liu | 15 | flex |
| 132 | — | attribution role | Founder · RightClick:AI · Singapore | 35 | flex |
| 133 | — | link | Read the manifesto → | 20 | flex |

## 10 · FAQ — `sections/Faq.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 134 | S11.1 | h2 | Questions founders actually ask. | 32 | flex |
| 135 | S11.2 | subhead | If something isn't here, email ben@3nm.io. Reply within 24 hours. | 65 | flex |
| 136 | S11.3 | Q1 | What happens after I book a call? | 33 | flex |
| 137 | S11.4 | A1 | Free 30-minute discovery call, then a paid workflow audit if both sides see a fit. The audit maps your workflow, your data, and what the software actually needs to do. That map becomes the scope. You see the full plan and quote before any build starts. Then I build on your real data, in phases, with you in the loop as it takes shape. You own each phase as it ships. I build until it's live and doing the job. | 410 | flex |
| 138 | S11.3 | Q2 | What do you actually build? | 27 | flex |
| 139 | S11.4 | A2 | Custom internal software, built to your workflow: BI dashboards that put your sales and ops data in one live view, admin automations for the work that eats your week, custom internal apps no SaaS sells you, and AI workshops to get your team actually using it. Plus the infrastructure (hosting, authentication, database) and the data connections agreed in scoping (typically finance, calendar, email, and one source specific to your business). Scoped to your business, never a fixed package. | 490 | flex |
| 140 | S11.3 | Q3 | Who builds it? | 14 | flex |
| 141 | S11.4 | A3 | Ben builds it. No subcontractors, no outsourcing, no handoffs. You work directly with the same person from discovery call to deployment. | 136 | flex |
| 142 | S11.3 | Q4 | What if Ben misses a deadline? | 30 | flex |
| 143 | S11.4 | A4 | I don't sell a deadline. I build until it's live and doing the job. You get the result, not a refund. You see the plan before any build starts, and I keep building until the system does what it's supposed to. One thing I need from you: fast feedback. Momentum matters, every blocked decision compounds, so I move fast and I need you to move with me. If feedback consistently stalls, we flag it in writing and reset expectations together. | 437 | flex |
| 144 | S11.3 | Q5 | Do I own the code? | 18 | flex |
| 145 | S11.4 | A5 | Completely. Every line of code, every database, the infrastructure, the SOPs, the knowledge wiki: everything becomes your sole property on delivery. Ben retains no license or rights. If we ever part ways, the system continues to work as intended. | 246 | flex |
| 146 | S11.3 | Q6 | What does it cost? | 18 | flex |
| 147 | S11.4 | A6 | Every build is scoped and quoted per client after the audit. There's no fixed price and no fixed package; what you pay depends on what you're having built and how much of it. The 30-minute discovery call is free. The workflow audit is paid: SGD 635 for a sample BI dashboard, or SGD 865 for a functioning custom workflow (a CRM, a mini-ERP, and the like). Whatever the audit produces is yours to keep, whether you build further with me or not. You see the full scope and quote before any build starts. Nothing gets built until you've approved the plan. | 552 | flex |
| 148 | S11.3 | Q7 | Do you work with PSG or EDG grants? | 35 | flex |
| 149 | S11.4 | A7 | No, and the reason matters. Grant routes add 3 to 6 months of approval time before a single line of code is written, and they freeze scope during the wait, so the system you receive is the one you specced before you knew what you actually needed. The founders I build for pay out of cashflow because they want the system live fast, not next quarter. If grant cost-recovery is your top priority, I'm not the right fit. If speed and clarity are, this is built for you. | 466 | flex |
| 150 | — | link | See all questions → | 19 | flex |

## 11 · Closing / Footer — `sections/FooterCta.astro`

| # | slot | role | copy | chars | limit |
|---|---|---|---|---|---|
| 151 | — | eyebrow | Get started | 11 | flex |
| 152 | S12.1 | h2 | Book a 30-minute call. / It's free. | 33 | 16ch, forced break |
| 153 | S12.2 | subhead | No pitch. No proposal. Book a call, or if you're not ready, just tell me the one thing eating your week below and I'll reply with whether it's even worth a call. I read every one myself. I build every project myself, so I only take three a month. | 246 | 54ch measure |
| 154 | — | form label | Your name | 9 | flex |
| 155 | — | placeholder | Jane Smith | 10 | flex |
| 156 | — | form label | Work email | 10 | flex |
| 157 | — | placeholder | you@company.com | 15 | flex |
| 158 | — | form label | Not ready to book? Tell me the one thing eating your week (optional) | 68 | flex |
| 159 | — | placeholder | 2 to 3 sentences is enough. | 27 | flex |
| 160 | S12.3 | submit | Book my free call → | 19 | flex |
| 161 | — | form note | ben@3nm.io · Singapore · No pitch, no proposal. | 47 | flex |
| 162 | — | error state | Something went wrong. Email ben@3nm.io directly, or try again. | 62 | flex |
| 163 | — | success head | I'll be in touch shortly. | 25 | flex |
| 164 | — | success sub | Expect an email from ben@3nm.io within 24 hours. Singapore timezone (SGT, UTC+8). | 81 | flex |
| 165 | S12.4 | footer logo | RightClick:AI | 13 | flex |
| 166 | — | footer email | ben@3nm.io | 10 | flex |
| 167 | S12.5 | footer link | About | 5 | flex |
| 168 | S12.5 | footer link | FAQ | 3 | flex |
| 169 | S12.5 | footer link | Blog | 4 | flex |
| 170 | S12.6 | footer copy | © 2026 RightClick:AI. All rights reserved. | 42 | flex |
| 171 | S12.7 | footer credit | Built in Singapore. | 19 | flex |

---

## Flags (not copy edits — worth deciding)

- **#1 / #2** exceed SEO length targets (title 73 vs ~60; description 211 vs ~155).
- **#109** promises "Five case studies … and compliance" but only 4 cards render. Either add the compliance card or change the copy to "Four".
- **#84** tooltip is 69 chars vs the ≤66 box target — may wrap awkwardly.
- **Repeated CTAs:** "Book a free 30-min call →" (#13, #89, #124) and "See how it works" (#14, #61, #90, #106) recur verbatim. Edit one → tell me if you want it changed everywhere or just that instance.
- `Footer.astro` and `DiscoveryModal.astro` exist in the repo but are **not used** on this page — excluded from the map.
