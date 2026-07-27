# self-improving-system — /self-improving-system

## Meta
- Title: The Self-Improving System: knowledge that compounds overnight | RightClick:AI
- Description: A knowledge system that reads across everything your firm knows and gets smarter every night on its own. Built on Claude Code and plain files. Yours to own. Get the free blueprint.
- Canonical: https://3nm.io/self-improving-system
- OG Title: Your firm's knowledge, finally compounding — while you sleep.
- OG Description: A self-improving knowledge system that connects everything your firm knows, overnight. Built on Claude Code + plain files. Yours to own. Get the free blueprint.
- Twitter Title: Your firm's knowledge, finally compounding — while you sleep.
- Twitter Description: A self-improving knowledge system that connects everything your firm knows, overnight. Built on Claude Code + plain files. Yours to own.
- Page type: landing (bespoke lead-gen / VSL funnel landing page)
- JSON-LD present: none

## Purpose (1–2 lines)
A dedicated lead-magnet landing page selling a "self-improving knowledge system" — a custom AI knowledge base that re-reads and re-connects a firm's knowledge overnight. The whole page funnels to a free "blueprint" opt-in (email + qualifying fields via Formspree). Addressed to founders of service firms 7+ years old, where a decade of knowledge is trapped in a few people's heads.

## Editorial note — `[BEN: confirm]` placeholders
Throughout the page, unresolved/to-be-verified facts are wrapped in a highlighted `.ben-confirm` inline marker (amber highlight; a dark-background variant `.on-dark`). These are author notes to Ben, not customer-facing copy in final state, but they mark exactly which numbers/claims are placeholders. Every one is captured verbatim below where it appears.

## Section-by-section (in document order)

### 0. Attention bar — top qualifier strip
- Copy (verbatim): "For service firms **7+ years in**, with a decade of hard-won knowledge trapped in a few people's heads."
- Interactive / graphic element: full-width dark bar pinned above the nav; "7+ years in" is accent-coloured/bold.
- Notes: audience-qualifier ribbon; sets the ICP before the hero.

### 1. #hero — headline + value bullets + primary CTA + chaos visual
- Eyebrow/label: "The self-improving system"
- Heading (H1): "Your firm's [7] years of knowledge, finally *compounding*, while you sleep."
  - The "7" is a `.ben-confirm` inline marker with title/tooltip "Swap the number to match your video hook".
  - "compounding" is the accent-coloured emphasis word (`<em>`, rendered in accent, not italic).
- Subhead/body: "A knowledge base that reads across everything your firm knows (client history, playbooks, the judgment calls nobody wrote down) and connects it overnight. Built on Claude Code and plain files. Yours to own outright."
- List/stat items (3 value bullets, each a bold title + description):
  1. "It improves itself overnight. You don't feed it." — "Every night it re-reads what you've added and finds connections you didn't ask for. You wake up to what you'd have missed."
  2. "Built on tools you can get today, not exotic tech." — "Claude Code and plain text files. Nothing that hasn't shipped, nothing you've never heard of, nothing locked behind a vendor."
  3. "You own the whole compounding asset: code, files, all of it." — "It appreciates as your firm learns. A SaaS subscription depreciates the day you stop paying. This is yours."
- CTA: label "Get the self-improving system blueprint →" → target: #optin (anchor scroll to opt-in form). Note beside CTA: "Free. The exact setup I run for my own firm."
- Interactive / graphic element: **CHAOS VISUAL — "interrupt pile"** signature hero graphic. A `.chaos-stage` figure with five overlapping, rotated "notification cards" that drift/float via keyframe animation and lift-straighten on hover (`chaos-card:hover` → rotate(0) translateY). Plus a pulsing red circular floater badge and a caption. Card contents (verbatim), stacked c1→c5:
  - c1 (Slack): app label "Slack · Sarah", meta "2m ago"; message "**@you** how did we price the SkyBridge job last year? Client's asking again." (@you is accent-coloured mention)
  - c2 (Email/Gmail): app label "Email · Junior", meta "Tue, 3 days"; from "Re: The Hartwell workaround"; subject "Did we ever document how we solved this? Can't find it anywhere."
  - c3 (Notion/alert): app label "Notion · Wiki", meta "Stale"; message "Last edited 2023. Nobody owns this folder."; red amount line "412 docs · nobody trusts them"
  - c4 (Calendar): app label "Calendar", meta "In 12 min"; message "Handover call · the partner on leave knew this, not you"
  - c5 (DM): app label "DM · You", meta "9:42 AM"; message ""I know we solved this before. I just can't remember where.""
  - Floater badge (pulsing red circle): "47", aria-label "47 things only you remember"
  - Caption (under stage): "Everything you know: scattered, and only in a few heads"
- Notes: hero is a 2-column grid (copy left, chaos visual right). The chaos cards are a KEY interactive element to keep (hover-lift + drift animation). App icons are small coloured square badges (Slack, Gmail red "M", red "!", accent "C", ink "D").

### 2. #vsl — VSL (video sales letter) slot
- Eyebrow/label: "Watch first"
- Heading (H2): "See it find a connection overnight."
- Interactive / graphic element: **VSL video frame placeholder** (16:9 dark frame). Contains: a "Video coming" badge (top-left), a large circular accent play button (SVG play triangle, non-functional/`cursor:default`), and poster text.
  - Poster line: "Watch: how the system found a connection overnight that I'd have missed for months. (4 min)"
- Caption (below frame): "I walk through my own setup on real data. No slides, no theory. If the overnight claim sounds like hype, this is where it stops sounding like hype."
- Notes: video not yet embedded — placeholder poster frame. On warm background, own top border.

### 3. #optin — Opt-in form #1 (qualifying, no price)
- Heading (H2): "Get the exact blueprint I run for my own firm. Free."
- Subhead: "The real setup, not a teaser: how the system reads, connects, and surfaces overnight. The same one running behind this page."
- Interactive / graphic element: **Formspree opt-in form #1** (id `discovery-form`, action https://formspree.io/f/xzdyljay, POST). Fields:
  - "Work email" — email input (id `email`, name `email`, placeholder "you@yourfirm.com", required)
  - "How many staff?" — select (id `staff`, name `staff`, required); options: "Select" (disabled default), "1–4", "5–9", "10–15", "15+"
  - "Years in business" — select (id `years`, name `years`, required); options: "Select" (disabled default), "Under 3", "3–6", "7–10", "10+"
  - "The one thing that lives in one person's head (optional)" — text input (id `onehead`, name `one_thing_in_one_head`, placeholder "e.g. how we price a custom job")
  - Submit button: "Send me the blueprint →"
  - Bottom note: "No spam, no drip-machine. The blueprint, then the occasional note when I ship something worth your time. Unsubscribe in one click."
  - Error state (hidden until triggered): "Something went wrong. Email ben@3nm.io directly, or try again."
  - Success state (hidden until submit): title "Blueprint's on its way."; sub "Check your inbox for an email from ben@3nm.io. Singapore timezone (SGT, UTC+8)."
- Notes: dark card; form submits via JS fetch (see script), swaps to success message on 200. This is the primary conversion form.

### 4. #how — Mechanism (3-step strip) — how it works
- Eyebrow/label: "How it actually works"
- Heading (H2): "How it gets smarter without you touching it."
- Lead: "For a claim like "it compounds overnight," the *how* is the proof. Here's the whole mechanism: three steps, nothing hidden."
- List/stat items (3 mechanism steps, each numbered card):
  - Step 1 — "Reads across everything." — "It ingests your client history, past projects, playbooks, notes, decisions: plain files it can read end to end, not folders it dumps and forgets."
  - Step 2 — "Connects it overnight." — "While you sleep, it re-reads the whole base and looks for links between things filed months and clients apart. New knowledge you add tonight gets connected to everything already there."
  - Step 3 — "Surfaces what you'd have missed." — "In the morning you get the connections worth acting on: the "this client's problem is the one we solved for someone else two years ago" moment, handed to you instead of lost."
- Interactive / graphic element: 3-column card strip (`mech-steps`); below it a bordered "concrete example" callout (`mech-example`).
- Concrete example callout:
  - Label: "A concrete one"
  - Body (verbatim): "On 12 June 2026, a prospect asked me a pricing question I was sure I'd never handled. Overnight, my own system connected it to a scoping call from November 2025 (a different industry, a different client, but the same underlying constraint) and surfaced the exact number I'd landed on back then and why. I hadn't tagged either. I hadn't linked them. I'd have spent an afternoon re-deriving it, or worse, guessed. The system had already done the work while I slept. That's the entire product: not a place to store what you know, but something that keeps finding what you already knew and forgot."
  - `[BEN: confirm]` note (verbatim): "[BEN: confirm or replace with your real overnight example. Keep the exact date, the two things it connected, and what you'd have lost without it. The specificity IS the proof; a vague version reads as hype.]"

### 5. #beforeafter — Before → After
- Interactive / graphic element: 3-column grid — Before column / arrow / After column (`ba-grid`; arrow SVG rotates to vertical on mobile).
- Before column:
  - Label: "Today"
  - Title: "Everything you know, scattered."
  - Sub: "In your head. In two other people's heads. In an inbox nobody owns, a drive nobody trusts, a doc last touched in 2023."
  - Graphic: **scatter chips** — 10 randomly-rotated tags (`ba-scatter`): "Client history", "Pricing calls", "Playbooks", "Call notes", "The workaround", "Old proposals", "Decisions", ""Ask Sarah"", "Dead Notion", "Someone's inbox"
- After column:
  - Label: "After"
  - Title: "Everything you know, connected, and compounding every night."
  - Sub: "One base the whole firm can query. Every new piece linked to everything already there. The green node pulses because the connections keep forming while you're not looking."
  - Graphic: **mini knowledge-graph SVG** (dark) — 4 cluster nodes + 2 leaf nodes converging via bright green lines onto a central **pulsing green hub node** (animated `wiki-hub-pulse`).
- Notes: the pulsing green hub is the visual payoff (mirrors the larger #wiki graph). Arrow points Today → After.

### 6. #wiki — The mechanism made visible (knowledge graph)
- Eyebrow/label: "The mechanism, made visible"
- Heading (H2): "One base. Every night, the connections multiply."
- Lead: "This is what "compounding" looks like: everything your firm knows, pulled into one place, then re-read and re-linked every night into a single brain that gets smarter on its own."
- Interactive / graphic element: **large knowledge-graph SVG** (900×520 viewBox) inside a dark "app window" card. Card chrome: 3 window dots, title "Knowledge graph", meta "live · re-connected 03:14 SGT". Graph: four labelled cluster nodes — "Client history", "Playbooks", "Call notes", "Decisions" — plus scattered leaf nodes, all converging via bright green lines onto a central pulsing accent hub labelled "Gets smarter nightly".
- List/stat items — two-column "in/out" lists below the graph:
  - "What goes in":
    - "Client history: every account, every past engagement, every thread"
    - "Playbooks and SOPs: the way you actually do the work"
    - "Past projects and proposals: what you scoped, priced, shipped"
    - "Call notes and decisions: the judgment calls nobody wrote down"
  - "What comes back out":
    - "Connections between things filed months and clients apart"
    - ""We solved this before," surfaced before you re-solve it"
    - "A plain-language answer to anything the firm has ever known"
    - "A record that stays, even when the person who knew it leaves"
- Notes: signature radial data→hub diagram (ported from index.html). Warm background, own top+bottom border. Central hub pulses via animation.

### 7. #pain — Predigest pain ("Sound familiar?")
- Eyebrow/label: "Sound familiar?"
- Heading (H2): "Where does everything your firm knows actually live?"
- Lead: "Seven years in, the answer is almost always the same, and it's the answer that keeps you up at night."
- List/stat items (5 pain cards, each bold lead-in + body; 5th is full-width):
  1. "**It's in your head.** You're the search engine. Every "how did we handle X" routes through you, and it always will until you write it all down, which you never will."
  2. "**It's in one other person's head.** If they take two weeks off (or leave), a chunk of how your firm actually works walks out the door with them."
  3. "**You tried Notion. It rotted.** It became another folder nobody updates, because keeping a wiki alive is a job, and nobody has that job."
  4. "**The same problem gets solved from scratch, twice.** Something you cracked for a client in 2024 gets re-figured-out in 2026 because nobody remembered it existed."
  5. (wide) "**Your best judgment never gets written down.** The pricing calls, the "don't take this kind of client," the workaround that saved a project. The most valuable knowledge you have is the least documented."
- Interactive / graphic element: 2-column card grid, each card with a red warning circle-alert icon.

### 8. #proof — The proof
- Eyebrow/label: "The proof"
- Heading (H2): "The proof is that I run this myself, and it's already saved my own firm work."
- Lead: "The blueprint you're opting in for isn't a concept. It's the system behind this page. Below it: four builds I've shipped, each one turning trapped knowledge into something the firm keeps."
- Lead exhibit card (dark):
  - Eyebrow: "Lead exhibit · my own system"
  - Title: "My own system."
  - Body: "It reads across every scoping call, every proposal, every build I've done since I started. It runs overnight and hands me connections in the morning. The 12 June example above is one of dozens. I didn't build this to sell it. I built it because I was the bottleneck in my own firm, and I got tired of being the only place my knowledge lived. The blueprint is exactly this, documented so you can see how it's put together."
  - `[BEN: confirm]` note (on-dark, verbatim): "[BEN: confirm the "since I started" scope and the "dozens" count. Keep it to what's literally true.]"
- List/stat items — 4 case-study proof cards (tag / title / body / metrics line):
  1. Tag "Executive recruitment" — Title "Past searches, finally compounding." — Body: "A Singapore senior-placements firm did 8 hours of manual market mapping per candidate, much of it repeating work done six months earlier on a similar search. I built an automated sourcing pipeline. The pool grew 2–3×. And the part that compounds: every past search is now searchable, so the firm stops re-doing work it already did. The knowledge accumulates instead of evaporating." — Metrics: "−8h per candidate · 2–3× pool · custom build"
  2. Tag "Family office" — Title "A decade of statements, one live view. And it stays." — Body: "A Singapore family office held positions across multiple private banks, each statement a different PDF format, consolidated by hand every week. I built an OCR + consolidation + risk-flagging system. The director sees the full portfolio live, without asking anyone. Every statement the system parses stays parsed. The historical record builds itself instead of living in a stack of PDFs nobody can query." — Metrics: "multi-bank OCR · live portfolio view · custom build"
  3. Tag "3PL logistics" — Title "Four retailers' data, unified. And every month retained." — Body: "A Singapore last-mile 3PL ran performance analysis across four retailer accounts, each in a different Excel format on a different cadence. Days of manual compilation. I rebuilt the pipeline and dashboard: four feeds into one, year-on-year and SKU-level, answered in seconds. Every period that flows in is kept and comparable. The operating history compounds instead of resetting each month." — Metrics: "4 feeds → 1 · SKU-level live view · custom build"
  4. Tag "Education consulting" — Title "The knowledge left the weekly meeting and moved into the system." — Body: "A Singapore education consulting firm ran a 3-hour weekly sync just so everyone could update everyone: the only time anyone had a complete picture, and it was wrong by Wednesday. I unified the work into one platform. The 3-hour sync is gone. No new admin hire. Student count per consultant went from 12 to 18. What used to live in one meeting a week now lives in a system the whole firm can query any day." — Metrics: "3h weekly sync killed · 0 new hires · 12 → 18 per consultant"
- Interactive / graphic element: dark lead-exhibit card + 2-column grid of 4 proof cards with accent metrics footers.

### 9. #vs — Comparison table (the honest comparison)
- Eyebrow/label: "The honest comparison"
- Heading (H2): "The honest comparison."
- Intro: "Five ways to deal with what your firm knows. Four of them you've already tried."
- Interactive / graphic element: **comparison table** (5 columns × 5 comparison rows + header row; role="table", horizontal-scroll on mobile). Columns:
  - "Comparing" (row-label column)
  - "Static wiki" (sub: "Notion / Confluence")
  - "Knowledge in heads" (sub: "You and two other people")
  - "Generic ChatGPT" (sub: "Cheap seats, no memory of you")
  - "A self-improving system you own" (highlighted "us" column; sub: "Built by Ben · yours outright")
- Rows (row label → static wiki / knowledge in heads / generic ChatGPT / **us**):
  - "Year-one cost" → "Low subscription, plus the unpaid job of keeping it updated" / ""Free," until someone leaves and takes it with them" / "Cheap seats, plus your data pasted into someone else's model" / **"One build. Then it's yours, no subscription."** `[BEN: confirm]` note verbatim: "[BEN: confirm no price shown, routes to the call]"
  - "Gets smarter on its own?" → "No. It rots the day you stop feeding it" / "No. It only knows what today's people remember" / "No. It forgets you the moment the chat closes" / **"Yes.** It re-reads and re-connects every night"
  - "If a key person leaves" → "You lose whatever they never wrote down" / "You lose a chunk of how the firm works" / "Nothing was ever captured to lose or keep" / **"Their knowledge is already in the base**, connected and searchable"
  - "Who owns it" → "The vendor. You rent access" / "Whoever's head it's in" / "The vendor. And they train on the industry, not on you" / **"You.** Code, files, the whole asset"
  - "What you're left with" → "A dead folder nobody trusts" / "A bottleneck named you" / "Generic answers with no memory of your firm" / **"A proprietary asset that appreciates** as your firm learns"
- Notes: last (us) column is accent-tinted/highlighted throughout; bold segments as marked.

### 10. #guarantee — Guarantee
- Interactive / graphic element: shield/checkmark seal icon (accent circle)
- Heading (H2): "If it hasn't surfaced a connection you'd have missed within *30 days*, I rebuild it, or that cycle is free." ("30 days" is accent emphasis)
- Subhead: "The whole claim is that it finds things you'd have lost. If it doesn't do that inside a month, I haven't delivered, and I don't get to keep pretending I did."
- Notes: centered, performance guarantee (30-day connection-surfacing).

### 11. #faq — FAQ accordion
- Section label: "Questions"
- Sidebar heading (H2): "The things founders ask before they opt in."
- Sidebar sub: "Straight answers. If yours isn't here, email ben@3nm.io."
- Interactive / graphic element: **FAQ accordion** (8 items; each `.faq-q` button toggles `.faq-a`, plus/×-rotate icon). Layout: sticky sidebar (heading) + accordion list.
- FAQ items (question → answer):
  1. "Is my data safe?" → "Yes, and it never leaves your control. The system is built on plain files that sit in your own storage, on infrastructure you own. Nothing is pooled into a shared model, and nothing trains anyone else's product on your firm's knowledge. On delivery, the whole thing is yours to host wherever you want." `[BEN: confirm]` note: "[BEN: confirm hosting posture (self-hosted vs your managed infra) and state it plainly.]"
  2. "What if I'm not technical?" → "You don't touch the code. I build it, hand it over documented, and it runs on its own overnight without you managing it. Using it is asking it questions in plain language. Notion asked you to become a librarian; this doesn't."
  3. "Do I own it?" → "Completely. Every line of code, every file, the whole system becomes yours on delivery. No SaaS seat, no lock-in, no "cancel and lose it." It's an asset on your side of the table, and it appreciates as your firm adds to it."
  4. "How is this not just Notion?" → "Notion is a place you put things and then have to maintain. This reads across everything on its own and connects it overnight. The part where a human keeps it alive is exactly the part I removed. Notion stores. This one thinks about what you stored while you sleep."
  5. "What's actually delivered?" → "The self-improving knowledge system built on your firm's real data: the ingestion setup, the overnight connection engine, a plain-language way to query it, and the plain files underneath, all documented and handed over as yours." `[BEN: confirm]` note: "[BEN: confirm the exact deliverable list before this ships: ingestion, nightly job, query interface, docs, ownership handover.]"
  6. "How long does it take?" → "A working version on your real data early, then the full build inside a fixed window, same cadence as every build on my case-study page: scoped in writing within 48 hours, something real by day 7." `[BEN: confirm]` note: "[BEN: confirm the exact timeline you'll commit to for this offer.]"
  7. "What does it cost?" → "No number on this page on purpose: the build scales with what your firm knows and how it's stored, and I won't quote you blind. We settle it on the call, in writing, before anything starts. Start with the free blueprint; the cost conversation only happens if the blueprint makes sense to you."
  8. "Who builds it?" → "I do. Ben: one operator, direct, no agency layer and no handoff to a junior. The system running behind this page is mine; the one I build for you is built the same way."

### 12. #closing — Closing opt-in
- Eyebrow/label: "Get started" (on-dark)
- Heading (H2): "Start with the blueprint. It's the same system running behind this page." (line break after "blueprint.")
- Subhead: "Get the exact setup: how it reads, connects overnight, and surfaces what you'd have missed. Then decide if you want me to build yours."
- Interactive / graphic element: **Formspree opt-in form #2** (id `discovery-form-2`, action https://formspree.io/f/xzdyljay, POST). Fields:
  - "Work email" — email input (id `email2`, name `email`, placeholder "you@yourfirm.com", required)
  - "How many staff?" — select (id `staff2`, name `staff`, required); options: "Select" (disabled default), "1–4", "5–9", "10–15", "15+"
  - "Years in business" — select (id `years2`, name `years`, required); options: "Select" (disabled default), "Under 3", "3–6", "7–10", "10+"
  - Submit button: "Get the self-improving system blueprint →"
  - Bottom note: "No spam. Unsubscribe in one click. ben@3nm.io"
  - Error state: "Something went wrong. Email ben@3nm.io directly, or try again."
  - Success state: title "Blueprint's on its way."; sub "Check your inbox for an email from ben@3nm.io. Singapore timezone (SGT, UTC+8)."
- Closing long-term note: "Not ready to build? Leave your email anyway. I send one note when I ship something worth your time, no drip machine, no chasing. When your firm's knowledge finally becomes the thing you can't afford to lose, you'll know where to find me."
- Notes: dark full-bleed closing section. Form #2 is a slimmer version of form #1 (no "one thing in one head" field). Both forms wired via inline JS fetch handler → success/error swap.

## Page scripts (behaviour, not copy)
- Inline JS: `wireForm()` attaches a submit handler to both opt-in forms (`discovery-form`, `discovery-form-2`). On submit: preventDefault, disable button + show "Sending…", POST via fetch to Formspree with Accept: application/json; on ok → hide form, show success block; on failure → re-enable button, show error block.
