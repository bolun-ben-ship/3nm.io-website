# design-extractor

Measures a live page's design system from **computed styles on the rendered DOM** — not from a screenshot, and not from copy-pasted HTML.

## Why this over screenshot analysis

A screenshot forces a model to *estimate* values ("looks like ~16px, maybe #3B82F6"). This reads what the browser actually resolved: exact hex, exact px, exact cubic-bezier. Every value is ranked by usage count, so you can tell the real system apart from one-off drift.

## Setup

```bash
mkdir design-extractor && cd design-extractor
# drop extract.mjs here
npm init -y
npm pkg set type=module
npm i playwright
npx playwright install chromium
```

## Run

```bash
node extract.mjs https://linear.app ./linear-audit
```

## Output

| File | Contents |
| --- | --- |
| `design.md` | Human/LLM-readable spec: color, type scale, spacing, radius, shadow, motion, z-index, breakpoints, CSS variables |
| `tokens.json` | Same data, machine-readable — feed to Style Dictionary or a Tailwind config generator |
| `raw.css` | Every accessible CSS rule, concatenated |
| `screenshot-{mobile,tablet,desktop}.png` | Full-page, 2× DPI, after lazy-load scroll |

## Then

1. Feed `design.md` + `screenshot-desktop.png` to Claude Code. The screenshot supplies layout and hierarchy; the markdown supplies exact values. Neither alone is enough.
2. Optional deeper CSS audit:
   ```bash
   npx wallace-cli ./raw.css
   ```
   or paste the URL into projectwallace.com — gives specificity distribution, cascade layers, complexity score, and Design-Tokens-spec output via `@projectwallace/css-design-tokens`.

## Limits

- **Cross-origin stylesheets** can't be read by JS. The script logs which ones failed at the top of `design.md`. Rare on modern sites (most self-host CSS), common with third-party widgets.
- **Only what renders.** Modal, dropdown, and hover states aren't captured unless triggered. Add `page.hover()` / `page.click()` calls before `collect()` for those.
- **Fonts are licensed** to the source domain. `design.md` lists what loaded; substitute before shipping.
- **Tailwind sites** often show no `:root` variables — the system lives in utility classes. The measured values in sections 1–5 are still exact and are what you want.
