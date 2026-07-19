# RightClick:AI — Offer Strategy & Model
*Captured: May 2026 · Working document*

---

## Context

This document records the offer redesign for RightClick:AI. The shift is from a fixed-project model (single large engagement) to a function-based build model — inspired by Design Joy's subscription approach but adapted for software, where delivery has natural completion points.

**Target buyer:** Founders and ops leads of 15–35 person service businesses in Singapore who are already problem-aware. They know their systems are broken. They have tried duct-tape solutions (Zapier, Make, n8n). They've been quoted SGD 80,000+ by agencies. They want something properly built but don't know how to access it.

**Positioning:** Speed is the brand and moat. Not the cheapest. Not the biggest. The fastest legitimate option in Singapore for custom AI systems at SME scale.

---

## Core Model

### Three stages

**Stage 1 — Foundation Build**
The starting point for every client. Four functions bundled. Delivered in 6–8 weeks.

**Stage 2 — Function Cycles**
Individual capability additions after the Foundation. One function per cycle. SGD 2,400 each.

**Stage 3 — Maintain Mode**
After the active build phase is complete (typically 6 months). Hosting, maintenance, support, and AI model refresh. SGD 2,400/year.

---

## Pricing

| Product | Price | Notes |
|---|---|---|
| Foundation Build | SGD 9,500 | 4 functions fixed scope, 6 weeks |
| Custom Build | RFQ | Final number locked within 48 hours of workflow audit |
| Per function cycle | SGD 2,400 | |
| Pre-buy 3 function cycles | SGD 6,600 | SGD 2,200 each, save SGD 600 |
| Maintain Mode | Annual subscription | Opt-in |
| Enhancement (Maintain Mode, beyond free allowance) | SGD 300 | Per request |

### Foundation Build pricing
SGD 9,500 fixed scope. Live site at 3nm.io is canonical. Previous pricing iterations (SGD 6,800 bundle, SGD 12,000 sample) are deprecated.

---

## Foundation Build — What's Always Included

### The 4 functions

**Function 1 — Operational dashboard with role-based access**
Central view of everything the business is doing. Founders see everything. Team leads see their scope. Staff see their own. Access levels built in from day one.

**Function 2 — Revenue and pipeline tracker**
A lightweight deal and project tracker built into the system. Not a separate CRM. Client name, status, value, next action. Live data — no more spreadsheet forecasts.

**Function 3 — AI assistant**
Natural language queries over their connected data. "Who has the lowest utilisation this month?" "Which clients haven't had a touchpoint in 30 days?" Answers in seconds.

**Function 4 — Notification and alert centre**
System-triggered alerts based on thresholds the client defines. Delivered to email (in-app feed as primary). Not WhatsApp — WhatsApp Business API is unreliable and costly.

### Also built in the Foundation (infrastructure — one-time, never repeated)
- Full infrastructure: hosting, authentication, database architecture
- 2–3 data connections (Xero required if available, plus one other)
- Lightweight project and capacity status views (manually updated where needed)
- Role-based access control

### Explicitly not in the Foundation
- WhatsApp integration
- External client-facing portal (subsequent function)
- Complex reporting or analytics beyond standard dashboard (subsequent function)
- Any workflow automation beyond basic notifications
- Data sources beyond the initial 2–3 connections

---

## Function Cycle — Process

Each function cycle follows the same sequence:

| Step | Timing | Description |
|---|---|---|
| Scope document | 48 hours from start | Architecture, database, features, functions — in writing. Can be taken anywhere. |
| Working MVP | Day 7 from scope approval | Actual running system, not a mockup. 2 sessions included. |
| Full build | Week 4 from scope approval | Fully deployable. Client uses it from this point. |

---

## Maintain Mode — What's Included

- Hosting and infrastructure
- Security and dependency updates
- 24-hour async support for bugs
- AI model refresh as underlying models evolve (Claude/GPT version updates, prompt degradation review)
- 1x quarterly 30-minute review call
- 2 enhancement requests per quarter at no charge
- Priority re-entry into active function cycle

**Default transition:** At approximately 6 months (when most SME builds are substantially complete), the engagement transitions to Maintain Mode unless the client requests continuation of active build.

---

## Definitions

### What is a Function?
A function requires at least one of:
1. Connecting to a new data source or external system
2. Automating a workflow that currently requires a human decision or manual step
3. Surfacing information that currently requires someone to compile manually
4. Building a new interface or module that did not previously exist
5. Creating a new AI workflow, agent, or automation with custom logic

**Examples of functions:** New Xero/GA4 integration, approval workflow automation, review board module, student portal, OCR document processing, BI dashboard from a new data source, new AI agent with custom logic.

### What is an Enhancement?
An enhancement is ONLY the following (exhaustive list — anything not here is a function):

- Search and filtering on an existing view
- Export to CSV or PDF of existing data
- Notes, comments, or tags on any record
- Notifications and alerts triggered by logic already built
- Sorting, pagination, date range filters
- Adding new columns or fields to an existing table
- Adjusting permissions within an existing role structure
- UI, layout, or visual changes to existing views
- Adding a new user or modifying access for an existing user

### Enhancement billing
- During an active build cycle: included at no charge (logged into current cycle)
- During Maintain Mode: 2 free per quarter, SGD 300 per additional request

---

## SLAs and Commitments

### Ben's commitments

| Commitment | Timeline | What client receives if missed |
|---|---|---|
| Scope document | 48 hours from cycle start | SGD 200 back for each day late |
| Working MVP | Day 7 from scope approval | SGD 200 back for each day late |
| Full build | Week 4 from scope approval | SGD 200 back for each day late |
| Request classification (function vs enhancement) | 24 hours | SGD 200 back for each day late |
| Bug response (Maintain Mode) | 24 hours | SGD 200 back for each day late |

Credits applied against the next invoice. Refunded directly if no future invoice exists.

### Client's commitments
- Attend 2 × 1-hour sessions within the first 10 days of each function cycle
- Respond to delivered work and feedback requests within 24 hours
- Approve or reject the scope document within 48 hours of receipt

Failure to meet client commitments suspends SLA timelines. Deadlines reset from the point client response is received.

---

## Scope Management

**Scope freeze:** Once the scope document is approved, the scope for that cycle is locked. New requests after approval are logged and addressed in:
- The next function cycle (if a function)
- The enhancement queue (if an enhancement)

**No scope additions mid-cycle.** Ben is not obligated to add requests to the current cycle.

Exception: at Ben's sole discretion, if a request takes under 2 hours and poses zero risk to current deadlines, he may include it. This is not a client right.

---

## Cancellation and Refund Policy

### During an active function cycle

| Milestone | Refund |
|---|---|
| After scope document delivered, before MVP | 70% of current cycle fee |
| After MVP delivered, before full build | 50% of current cycle fee |
| After full build delivered | No refund (work is complete) |

### Pre-purchased function credits
- Unused credits: 100% refundable
- Active cycle: milestone refund policy applies

### Maintain Mode
Cancel anytime. Prorated refund of remaining annual fee.

---

## Code Ownership
Client owns everything. All code, databases, documentation, and system architecture become the sole property of the client on delivery. Ben retains no license or rights. Ben may reference the engagement for portfolio purposes unless client requests anonymisation.

---

## Case Study Reference (reframed under new model)

| Client | Industry | Functions | Timeline |
|---|---|---|---|
| Healthcare consulting | Quality assessment SG | Foundation + 2 functions | 7 weeks |
| Financial services | Compliance and approvals SG | Foundation + 2 functions | ~6 weeks |
| Financial services | Family office SG | Foundation + 1 function | 3 weeks |
| 3PL logistics | Last-mile delivery SG | Foundation + 2 functions | 5 weeks |
| Education consulting | University admissions SG | Foundation + 2 functions | 6 weeks |

---

## What Subsequent Functions Look Like (months 3–12)

After the Foundation is live, subsequent functions are additions to the same system. Every new function adds a panel to the dashboard and expands the AI assistant's scope. The system grows as the business grows.

Examples of real subsequent functions:
- A new data integration (new accounting tool, external API, partner system)
- A new automated workflow (approval chains, automated report generation)
- A new user-facing module (client portal, student portal, review board)
- A new AI agent trained on a specific domain (logistics analytics, compliance review)
- New business intelligence layer from a new data source (multi-retailer dashboard)

After 6 months, most SMEs have a substantially complete core system. They then transition to Maintain Mode and re-enter Build Mode when a new function is needed (new service line, new client type, new tool integration).

---

## Design Joy Comparison

| | Design Joy | RightClick:AI |
|---|---|---|
| Buyer assumption | Already wants design | Already knows systems are broken |
| Pricing unit | Monthly subscription | Per function (SGD 2,400) |
| Risk reversal | Pause/cancel anytime, 75% back in week 1 | Stop anytime, milestone-based refunds (70%/50%) |
| Speed signal | 48-hour delivery | 48hr scope, 7-day MVP, 4-week build |
| Natural completion | None (design is infinite) | Yes (~6 months for SME core build) |
| Post-completion | Ongoing by nature | Maintain Mode (SGD 2,400/year) |
| Incentive to go fast | Always a queue | Reputation, referrals, throughput |

Key structural difference: Design Joy works on recurrence because design is genuinely infinite. Software has natural completion points. The Foundation + function model captures the build phase at per-function pricing, then transitions to Maintain Mode for the ongoing relationship. These are two different products, not one subscription stretched.
