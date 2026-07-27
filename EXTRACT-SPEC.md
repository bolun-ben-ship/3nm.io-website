# Content + structure extraction spec (feeds the from-scratch /design-pipeline rebuild)

Goal: capture **everything a designer needs to rebuild each page from scratch** — all copy verbatim, the section structure/order, every CTA, list, stat, form, and interactive/graphic element — WITHOUT any styling or HTML. The rebuild will re-design the look; nothing of the *content/intent* may be lost.

- SOURCE (latest content): `A:/BL Dev Work/RightClickAI/standalone-3nm-astro/src/pages/<page>.astro`
- OUTPUT: `A:/BL Dev Work/RightClickAI/standalone-3nm-v2/content/<page>.md`

## What to capture per page — use this exact template

```
# <page> — /<route>

## Meta
- Title: <verbatim>
- Description: <verbatim>
- Canonical: https://3nm.io/<route>
- Page type: <landing | article | case-study | hub | faq>
- JSON-LD present: <Organization | Service | FAQPage | Article | BlogPosting | AboutPage | none>

## Purpose (1–2 lines)
What this page is for and who it's addressing.

## Section-by-section (in document order)
For EACH section:
### <n>. <section name / id> — <one-line purpose>
- Eyebrow/label: "<verbatim>"
- Heading: "<verbatim>" (note which words are accent-coloured, e.g. "*That's the problem.*")
- Subhead/body: <all copy verbatim, as bullet points or blocks>
- List/stat items: <each item verbatim, incl. numbers>
- CTA(s): label "<verbatim>" → target (<anchor / page / modal>)
- Interactive / graphic element: <describe — e.g. "floating notification cards that jump on hover", "radial data→hub diagram", "live-updating dashboard mock", "FAQ accordion", "Formspree form with fields X,Y,Z", "comparison table 4 cols × 6 rows", "image: /assets/...">
- Notes: <anything about hierarchy, emphasis, or intent>
```

## Rules
- **Copy is verbatim.** Do not paraphrase, shorten, or "improve" — the rebuild reuses this exact copy.
- **Include the numbers/stats exactly** (SGD figures, percentages, "3 a month", etc.).
- **Name the signature interactive elements** precisely (the hover-jump notification cards, the dashboard graphics, the radial diagram, the comparison table, accordions, forms) — these are being KEPT in the rebuild.
- **Skip** the nav, footer, and discovery modal — they are shared shell (documented once separately). Only capture the page's own body sections.
- **Skip all CSS/styling.** Structure + content only.
- Preserve section ORDER exactly.

Report: the output file path + section count.
