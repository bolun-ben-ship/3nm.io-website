# STRUCTURE.md — site blueprint (Layer A)

Full verbatim copy + per-section detail lives in `content/*.md` (17 pages) + `content/_shell.md`. This file is the map + each section's JOB.

## Site map
- `/` **homepage** (landing) — the flagship. Build FIRST, show founder.
- `/how-it-works` · `/case-studies` (hub) · 5× `/case-study-*` details · `/compliance-workflow-case-study` (long-form) · `/faq` · `/about` · `/blog` · 4× explainer articles.
- Shared shell (nav/footer/discovery-modal) → `content/_shell.md`.

## Homepage section order + job (from content/index.md — 12 sections)
| # | Section | Its JOB | Notes |
|---|---|---|---|
| 1 | Hero | Recognise the pain in 5s; premium first impression | H1 "You're the system holding it all together. That's the problem." + hover-jump notification cards (KEEP, refine) |
| 2 | Tools ticker | "your data lives in N tools" | auto-scroll marquee |
| 3 | Capability strip | what I build, scannable | 4 chips |
| 4 | Who this is for | agitate the founder-as-bottleneck | numbered pains + status dashboard mock (KEEP) |
| 5 | Ops-hire trap | name the enemy (the ops hire) → ownership | 3 hidden costs + dark ownership close |
| 6 | Inline case (education) | first proof | student-platform mock (KEEP) |
| 7 | Proof grid | 3 shipped builds | case cards |
| 8 | What I build (#build) | the offer + how it's safe | radial data→hub diagram (KEEP) + 4 work-types + dark ownership strip |
| 9 | Comparison | vs ops-hire / DIY / agency | table (compress on mobile) |
| 10 | Founder voice | trust, the human | pull-quote |
| 11 | FAQ | kill objections | accordion |
| 12 | Closing | book the call | Formspree form |

## Structure rules (minimal-premium)
- Not every section is a bordered card. Alternate calm ↔ dense ↔ dark.
- Green appears ONCE per view (restraint).
- Break-the-flow candidates (max 2): the hero notification pile, and ONE dark statement moment (ops-hire close or ownership strip). Planned here, executed in refine.
- No breadcrumbs in any hero.

## Other pages (register)
- Explainers / case studies = article layout (calm, editorial, sticky TOC). Lower drama than homepage.
- FAQ = the `.faq-question` accordion convention (see content/faq.md).
- self-improving-system = a bespoke VSL/lead-magnet LP with its OWN funnel — treat separately (may keep a page-specific nav); see content/self-improving-system.md.
