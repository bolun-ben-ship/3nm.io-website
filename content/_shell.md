# Shared shell — nav, footer, discovery modal (on every page)

The extraction docs skip these (they're global). Rebuild them once as shared components.

## Nav (sticky, top)
- Logo: `RightClick:AI` (the ":AI" is a distinct/accent span) → links to `/`
- Links: **What I build** → `/#build` · **How it works** → `/how-it-works` · **My work** → `/case-studies` · **FAQ** → `/faq` · **About** → `/about`
- CTA button: **Book a call** → opens the discovery modal (`data-modal-open="discovery"`)
- Mobile: hamburger → slide/overlay menu with the same links + CTA.
- Signature behaviour: nav gets a subtle "scrolled" state after 24px; a thin scroll-progress bar sits at the very top.

## Footer
- Logo: `RightClick:AI`
- Links: **About** → `/about` · **FAQ** → `/faq` · **Blog** → `/blog`
- Copy: `© 2026 RightClick:AI. All rights reserved.`
- Email: `ben@3nm.io` (mailto)

## Discovery modal (opened by any "Book a call" CTA)
- Eyebrow: `Get started`
- Heading: `Book a 30-minute call. It's free.`
- Sub: `No pitch. No proposal. Just me looking at your business, finding the bottleneck, and telling you honestly whether I can help.`
- Form (Formspree `https://formspree.io/f/xzdyljay`, POST):
  - Your name (text, required)
  - Work email (email, required)
  - `Not ready to book? Tell me the one thing eating your week` (textarea, optional)
  - Submit: `Book my free call`
  - Bottom note: `ben@3nm.io · Singapore · No pitch, no proposal.`
  - Error state: `Something went wrong. Email ben@3nm.io directly, or try again.`
  - Success state: `I'll be in touch shortly.` / `Expect an email from ben@3nm.io within 24 hours. Singapore timezone (SGT, UTC+8).`

## Global signature elements to KEEP in the rebuild (Ben's ask)
- The hover-jump / drifting **notification cards** (hero "chaos" pile).
- The **dashboard mock graphics** (status-window mocks, KPI rows, live-view mocks).
- The **radial data→hub diagram** (#build) with animated flow dots.
- The **cards** treatment generally.
- Signature interactions feel premium — motion is an accent, not decoration.
