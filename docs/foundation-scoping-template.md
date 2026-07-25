# Foundation Build — Scoping Document

**Client:** [Company name]
**Industry:** [e.g. Financial advisory]
**Team size:** [e.g. 22 people]
**Primary contact:** [Name, email]
**Scoping date:** [Date]
**Scope document version:** 1.0

---

> This document defines exactly what will be built in the Foundation Build. Once signed off by Client, the scope below is locked. New requests after sign-off are logged and addressed in subsequent function cycles.

---

## 1. Current Tool Audit

List every tool the client currently pays for or uses:

| Tool | Purpose | Monthly cost (SGD) | Actually using? (Y/N) | Data accessible via API or export? |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

**Total current monthly SaaS spend:** SGD ___________

**Tools with accessible APIs or data exports (to be connected):**
1.
2.
3.

**Tools with no accessible data (manual input only):**

---

## 2. Current Pain Points

Ranked by business impact (from discovery call):

**Primary bottleneck (the one thing causing the most friction):**

**Secondary pain points:**
1.
2.
3.

**What the founder currently has to do manually that they hate:**

---

## 3. Data Sources for the Foundation Build

| Data source | What it contains | Format / access method | Update frequency | Priority |
|---|---|---|---|---|
| | | | | Primary |
| | | | | Secondary |
| | | | | Optional |

**Connection 1 (required — Xero or primary accounting tool):**
- Tool:
- What it provides:
- Integration method:
- Estimated complexity: Low / Medium / High

**Connection 2:**
- Tool:
- What it provides:
- Integration method:
- Estimated complexity: Low / Medium / High

**Connection 3 (if applicable):**
- Tool:
- What it provides:
- Integration method:
- Estimated complexity: Low / Medium / High

**Data sources explicitly excluded from this build (deferred to future functions):**

---

## 4. Users and Access Roles

Who will use the system and what they should see:

| Role | Number of users | Can see | Can edit | Notes |
|---|---|---|---|---|
| Founder / Director | | Everything | Everything | |
| [Role 2] | | | | |
| [Role 3] | | | | |
| [Role 4] | | | | |

**Login method:** Email + password / Google SSO / Other: ___________

---

## 5. Foundation Build Scope

### 5.1 Dashboard panels

For each panel: what it shows, what data it pulls from, who can see it.

**Panel 1 — Operational overview**
- Shows:
- Data source:
- Visible to:
- Key metrics displayed:

**Panel 2 — Revenue and pipeline**
- Shows: Deal name, client, status, value, expected close, next action
- Data source: Manual input into system table / Xero / CRM export
- Visible to:
- Notes:

**Panel 3 — Project and engagement status**
- Shows: Active clients/projects, status, responsible person, last update
- Data source: Manual input / [tool]
- Visible to:

**Panel 4 — Team capacity**
- Shows: Each team member, availability status (available / busy / on leave)
- Data source: Manual — each person updates their own status weekly
- Visible to:

**Panel 5 — [Client-specific, if applicable]**
- Shows:
- Data source:
- Visible to:

### 5.2 AI assistant scope

**What the AI assistant can query:**
- All data connected in Section 3
- [Specific data sets confirmed in discovery call]

**Types of queries confirmed in discovery call:**
1.
2.
3.
4.

**Data explicitly excluded from AI queries:**

### 5.3 Notification and alert triggers

| Trigger event | Condition / threshold | Who receives it | Delivery method |
|---|---|---|---|
| | | | Email |
| | | | Email |
| | | | Email |

### 5.4 User management
- Total initial users: ___
- User invite process: Email invite / Admin-managed
- Password reset: Self-serve / Admin-managed

---

## 6. Explicitly Out of Scope (this Foundation Build)

The following are NOT included and will require a separate function cycle if needed:

- WhatsApp integration (WhatsApp Business API is unreliable and expensive for this use case)
- External client-facing portal
- [Item from discovery call — confirmed deferred]
- [Item from discovery call — confirmed deferred]
- Any data source not listed in Section 3
- Complex automated workflows beyond basic notification triggers

---

## 7. Technical Environment

**Hosting preference:**
- [ ] Managed by RightClick:AI (recommended — included in Maintain Mode)
- [ ] Client-managed VPS
- [ ] No preference

**Existing infrastructure (if any):**
- Domain: ___________
- Existing hosting: ___________
- Existing database: ___________

**Browser support:**
- [ ] All modern browsers (Chrome, Safari, Firefox, Edge)
- [ ] Chrome only (acceptable for internal tools)

**Mobile requirement:**
- [ ] Mobile-optimised (responsive design)
- [ ] Desktop-only is acceptable for internal use

**Additional technical notes:**

---

## 8. Timeline

Every build is custom — scoped and sequenced per engagement. You receive a scope document for approval, then a working MVP on real data, then the full build, delivered and reviewed in phases. No fixed calendar timeline is promised.

---

## 9. What Client Commits To

By approving this document, Client confirms:

- [ ] Two × 1-hour sessions will be attended within the first 10 days of the build
- [ ] Feedback on delivered work will be provided within 24 hours
- [ ] The scope above is complete and agreed — new requests after approval will be addressed in subsequent function cycles
- [ ] The designated point of contact for this engagement is: ___________

---

## 10. Pricing Confirmation

**Foundation Build:** [scoped per engagement]

**Guarantee:** I build until it is live and doing the job in the approved scope — the result, not a refund. **Cancellation:** stop at any phase boundary; all delivered code and assets are yours; no payment is due for unstarted phases.

**Payment terms:** [50% upfront, 50% on full build delivery] / [100% upfront] / [Invoice on completion]

**Invoice to:** [Company name, billing address, GST registration if applicable]

---

## 11. Approval

By signing below, Client confirms the scope defined in this document and authorises the Foundation Build to begin. Scope is frozen from this point.

**Client approval:**

Name: _________________________
Signature: _________________________ Date: _____________

**Builder confirmation:**

Name: Bolun Liu (Ben), RightClick:AI
Signature: _________________________ Date: _____________

---

*Version history: v1.0 — initial scope. Any changes to this document after Client signature require written agreement from both parties and may affect timeline and pricing.*
