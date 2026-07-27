# DESIGN.md — Visual system (minimal-premium)

## LOCKED atoms (non-negotiable — override any reference)
- **Logo:** `RightClick:AI` wordmark, `:AI` as accent span. Mark SVG reused.
- **Primary color:** forest green `#15803D` (`oklch(~0.55 0.13 152)`). Neutrals tinted warm, NOT cool.
- **Neutrals:** warm paper `#FAFAF7` / warm sand `#F3F1EB` / operator-black `#08100A`–`#0D120F`. Never pure `#000`/`#FFF`.
- **Voice:** direct, grounded, first-person "I build". No softeners.

## FLEXIBLE presentation (from Vercel/Linear/Anthropic composition — NOT their palette/type)
- **Layout:** generous whitespace, hairline (1px, low-opacity) structure, confident asymmetry, big scale jumps. Fewer boxes; let space + type carry hierarchy. A few weighty **dark sections** as punctuation (the ownership strip, the ops-hire close) — rare and deliberate.
- **Section treatments:** kill the "every section is a bordered card grid" rhythm. Alternate: full-bleed calm → one dense proof moment → dark statement. Break-the-flow allowed on 1–2 moments max (see STRUCTURE), not everywhere.
- **Signature elements KEPT (Ben's ask):** the hover-jump/drifting **notification cards** (hero), the **dashboard mock graphics**, the **radial data→hub diagram** (#build), the card treatments. These get *refined* (premium motion, cleaner surfaces), not removed.
- **Imagery:** the mocks/diagrams ARE the imagery. Minimal photography (only the real founder + case photos).

## designlang:extract constraint
> "Extract layout composition, section structure, and motion patterns from vercel.com / linear.app / anthropic.com. IGNORE their colors and fonts — locked to RightClick:AI's forest-green-on-warm-paper brand."

## Color strategy — **Restrained** (this is the whole premium move)
- Tinted warm neutrals carry ~90%. **Forest green is a RARE accent (≤10%)** — one green thing per view, not green on every chip/eyebrow/heading. This is the #1 change from the current site (which over-uses green).
- Red/amber ONLY inside the problem-state dashboard mocks.

## Typography (MAX 2 — decide at build, verify visually; General Sans was too close to Satoshi)
- **Body:** Satoshi (keep) — clean premium grotesk, already loaded via Fontshare.
- **Display/header:** needs to read *visibly distinct* from Satoshi AND premium. Candidates (none banned): **Geist** (Vercel — the AI-premium signal), **Space Grotesk** (more techy/distinctive), or a refined grotesk with real character. `[DECIDE at build — screenshot-compare against Satoshi body; reject if imperceptible like General Sans was.]`
- Scale ratio ≥1.3 between steps. Weight contrast: display 500–600 (refined, not heavy 700), body 400/500. Body line length 65–75ch.
- **The premium is the SYSTEM (space + restraint + contrast + motion), not the font.** Do not expect the font swap alone to read as "premium."

## Motion rules
- Easing: ease-out-quart/quint (no bounce). Subtle spring only on the signature hover cards.
- Everything behind `prefers-reduced-motion`. See MOTION.md.

## Taste lane: **minimalist** (editorial, restrained). NOT soft/cinematic-maximal.

## Theme
- **Light / warm paper** default (the brand's warmth is the signature). Dark sections used as rare weighty punctuation (ownership strip, ops-hire close), not the base. One line: *a founder reading in a calm, paper-bright office, not a neon AI dashboard.*
