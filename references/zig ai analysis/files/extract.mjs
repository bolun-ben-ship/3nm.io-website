#!/usr/bin/env node
/**
 * design-extractor
 * Measures a live page's design system from the rendered DOM (computed styles),
 * not from a screenshot. Outputs design.md, tokens.json, raw CSS, and screenshots.
 *
 * Usage: node extract.mjs https://example.com [outDir]
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const url = process.argv[2];
const outDir = path.resolve(process.argv[3] || './design-audit');

if (!url) {
  console.error('Usage: node extract.mjs <url> [outDir]');
  process.exit(1);
}

const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// ---------------------------------------------------------------- browser eval

/**
 * Runs inside the page. Walks every rendered element, tallies computed values.
 */
function collect() {
  const tally = () => new Map();
  const bump = (m, k) => {
    if (k === undefined || k === null) return;
    const s = String(k).trim();
    if (!s) return;
    m.set(s, (m.get(s) || 0) + 1);
  };

  const NONE = new Set([
    'none', 'normal', 'auto', '0px', '0', 'rgba(0, 0, 0, 0)', 'transparent',
    'currentcolor', 'initial', '0s', 'start', 'repeat',
  ]);

  const out = {
    color: tally(),
    backgroundColor: tally(),
    borderColor: tally(),
    fontFamily: tally(),
    fontSize: tally(),
    fontWeight: tally(),
    lineHeight: tally(),
    letterSpacing: tally(),
    textTransform: tally(),
    borderRadius: tally(),
    boxShadow: tally(),
    textShadow: tally(),
    borderWidth: tally(),
    spacing: tally(),      // all margin/padding/gap values pooled
    gap: tally(),
    zIndex: tally(),
    transition: tally(),
    animation: tally(),
    display: tally(),
    backdropFilter: tally(),
    backgroundImage: tally(),  // gradients
    maxWidth: tally(),
    opacity: tally(),
  };

  const els = Array.from(document.querySelectorAll('*'));
  const visible = [];

  for (const el of els) {
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'META' || tag === 'LINK') continue;

    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const rendered = rect.width > 0 && rect.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    if (!rendered) continue;
    visible.push(el);

    bump(out.color, cs.color);
    if (!NONE.has(cs.backgroundColor)) bump(out.backgroundColor, cs.backgroundColor);
    if (parseFloat(cs.borderTopWidth) > 0 && !NONE.has(cs.borderTopColor)) {
      bump(out.borderColor, cs.borderTopColor);
      bump(out.borderWidth, cs.borderTopWidth);
    }

    bump(out.fontFamily, cs.fontFamily);
    bump(out.fontSize, cs.fontSize);
    bump(out.fontWeight, cs.fontWeight);
    if (!NONE.has(cs.lineHeight)) bump(out.lineHeight, cs.lineHeight);
    if (!NONE.has(cs.letterSpacing)) bump(out.letterSpacing, cs.letterSpacing);
    if (!NONE.has(cs.textTransform)) bump(out.textTransform, cs.textTransform);

    if (!NONE.has(cs.borderRadius)) bump(out.borderRadius, cs.borderRadius);
    if (!NONE.has(cs.boxShadow)) bump(out.boxShadow, cs.boxShadow);
    if (!NONE.has(cs.textShadow)) bump(out.textShadow, cs.textShadow);
    if (!NONE.has(cs.backdropFilter)) bump(out.backdropFilter, cs.backdropFilter);
    if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
      bump(out.backgroundImage, cs.backgroundImage);
    }

    for (const p of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight',
                     'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']) {
      const v = cs[p];
      if (v && v !== '0px') bump(out.spacing, v);
    }
    for (const p of ['gap', 'rowGap', 'columnGap']) {
      const v = cs[p];
      if (v && !NONE.has(v)) { bump(out.gap, v); bump(out.spacing, v); }
    }

    if (cs.zIndex !== 'auto') bump(out.zIndex, cs.zIndex);
    if (!NONE.has(cs.transition) && cs.transition !== 'all 0s ease 0s') bump(out.transition, cs.transition);
    if (!NONE.has(cs.animationName)) bump(out.animation, `${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction}`);
    bump(out.display, cs.display);
    if (!NONE.has(cs.maxWidth)) bump(out.maxWidth, cs.maxWidth);
    if (cs.opacity !== '1') bump(out.opacity, cs.opacity);
  }

  // ---- CSS custom properties declared anywhere in the cascade
  const customProps = {};
  const cssTexts = [];
  const fontFaces = [];
  const mediaQueries = new Set();
  const keyframes = new Set();

  const readRules = (rules) => {
    for (const rule of rules) {
      try {
        if (rule.cssText) cssTexts.push(rule.cssText);
        if (rule.constructor.name === 'CSSFontFaceRule' || rule.type === 5) {
          fontFaces.push(rule.style.getPropertyValue('font-family') + ' | ' +
                         rule.style.getPropertyValue('font-weight') + ' | ' +
                         rule.style.getPropertyValue('src').slice(0, 120));
        }
        if (rule.media) mediaQueries.add(rule.media.mediaText);
        if (rule.name && rule.type === 7) keyframes.add(rule.name);
        if (rule.style) {
          for (let i = 0; i < rule.style.length; i++) {
            const prop = rule.style[i];
            if (prop.startsWith('--')) {
              customProps[prop] = rule.style.getPropertyValue(prop).trim();
            }
          }
        }
        if (rule.cssRules) readRules(rule.cssRules);
      } catch (e) { /* cross-origin rule */ }
    }
  };

  const inaccessible = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      readRules(sheet.cssRules);
    } catch (e) {
      if (sheet.href) inaccessible.push(sheet.href);
    }
  }

  // resolved values of custom props on :root (what the browser actually uses)
  const rootCS = getComputedStyle(document.documentElement);
  const resolvedRoot = {};
  for (const key of Object.keys(customProps)) {
    const v = rootCS.getPropertyValue(key).trim();
    if (v) resolvedRoot[key] = v;
  }

  const loadedFonts = Array.from(document.fonts).map(f =>
    `${f.family} ${f.weight} ${f.style} (${f.status})`);

  const toObj = (m) => Object.fromEntries(
    [...m.entries()].sort((a, b) => b[1] - a[1])
  );

  return {
    meta: {
      url: location.href,
      title: document.title,
      elementsScanned: visible.length,
      viewport: { w: innerWidth, h: innerHeight },
      scrollHeight: document.documentElement.scrollHeight,
    },
    tokens: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, toObj(v)])),
    customProperties: customProps,
    resolvedRootVariables: resolvedRoot,
    fontFaces,
    loadedFonts: [...new Set(loadedFonts)],
    mediaQueries: [...mediaQueries],
    keyframes: [...keyframes],
    inaccessibleStylesheets: inaccessible,
    cssText: cssTexts.join('\n'),
  };
}

// ---------------------------------------------------------------- helpers

const toHex = (rgb) => {
  const m = rgb.match(/rgba?\(([^)]+)\)/);
  if (!m) return rgb;
  const parts = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
  const [r, g, b, a] = parts;
  if ([r, g, b].some(n => Number.isNaN(n))) return rgb;
  const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
  return a !== undefined && a < 1 ? `${hex} @ ${a}` : hex;
};

const px = (v) => parseFloat(v) || 0;

const table = (obj, { limit = 40, transform = (x) => x, header = ['Value', 'Uses'] } = {}) => {
  const rows = Object.entries(obj).slice(0, limit);
  if (!rows.length) return '_none found_\n';
  return [
    `| ${header[0]} | ${header[1]} |`,
    '| --- | ---: |',
    ...rows.map(([k, v]) => `| \`${transform(k)}\` | ${v} |`),
  ].join('\n') + '\n';
};

const sortedNumeric = (obj) =>
  Object.fromEntries(Object.entries(obj).sort((a, b) => px(a[0]) - px(b[0])));

// ---------------------------------------------------------------- main

(async () => {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = {};

  for (const bp of BREAKPOINTS) {
    const ctx = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    console.log(`→ ${bp.name} (${bp.width}px)`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() =>
      page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    );
    // trigger lazy content
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          y += window.innerHeight;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 120);
          else { window.scrollTo(0, 0); setTimeout(res, 400); }
        };
        step();
      });
    });
    await page.waitForTimeout(800);

    results[bp.name] = await page.evaluate(collect);

    await page.screenshot({
      path: path.join(outDir, `screenshot-${bp.name}.png`),
      fullPage: true,
    });
    await ctx.close();
  }

  await browser.close();

  const d = results.desktop;
  const t = d.tokens;

  // raw CSS for downstream analysis (Project Wallace, etc.)
  await fs.writeFile(path.join(outDir, 'raw.css'), d.cssText);

  // machine-readable
  const tokensJson = {
    source: d.meta,
    generatedAt: new Date().toISOString(),
    color: {
      text: Object.fromEntries(Object.entries(t.color).map(([k, v]) => [toHex(k), v])),
      background: Object.fromEntries(Object.entries(t.backgroundColor).map(([k, v]) => [toHex(k), v])),
      border: Object.fromEntries(Object.entries(t.borderColor).map(([k, v]) => [toHex(k), v])),
      gradient: t.backgroundImage,
    },
    typography: {
      families: t.fontFamily,
      sizes: sortedNumeric(t.fontSize),
      weights: t.fontWeight,
      lineHeights: t.lineHeight,
      letterSpacing: t.letterSpacing,
      transform: t.textTransform,
      fontFaces: d.fontFaces,
      loadedFonts: d.loadedFonts,
    },
    space: {
      scale: sortedNumeric(t.spacing),
      gap: sortedNumeric(t.gap),
      containerMaxWidths: sortedNumeric(t.maxWidth),
    },
    radius: sortedNumeric(t.borderRadius),
    shadow: { box: t.boxShadow, text: t.textShadow, backdropFilter: t.backdropFilter },
    border: { widths: sortedNumeric(t.borderWidth) },
    motion: { transitions: t.transition, animations: t.animation, keyframes: d.keyframes },
    layout: { display: t.display, zIndex: t.zIndex, opacity: t.opacity },
    breakpoints: d.mediaQueries,
    cssVariables: d.resolvedRootVariables,
    cssVariablesRaw: d.customProperties,
    perBreakpointFontSizes: Object.fromEntries(
      BREAKPOINTS.map(b => [b.name, sortedNumeric(results[b.name].tokens.fontSize)])
    ),
    warnings: d.inaccessibleStylesheets.length
      ? [`${d.inaccessibleStylesheets.length} cross-origin stylesheet(s) unreadable: ${d.inaccessibleStylesheets.join(', ')}`]
      : [],
  };

  await fs.writeFile(
    path.join(outDir, 'tokens.json'),
    JSON.stringify(tokensJson, null, 2)
  );

  // ------------------------------------------------------------- design.md
  const vars = Object.entries(d.resolvedRootVariables);
  const md = `# Design Spec — ${d.meta.title || url}

> Measured from the rendered DOM via computed styles.
> Source: ${d.meta.url}
> Generated: ${new Date().toISOString().slice(0, 10)}
> Elements scanned (desktop): ${d.meta.elementsScanned}
${tokensJson.warnings.length ? `\n> ⚠️ ${tokensJson.warnings.join('; ')}\n` : ''}
---

## 1. Color

### Text
${table(tokensJson.color.text, { transform: (x) => x, limit: 25 })}
### Background
${table(tokensJson.color.background, { limit: 25 })}
### Border
${table(tokensJson.color.border, { limit: 15 })}
### Gradients
${table(tokensJson.color.gradient, { limit: 10 })}
---

## 2. Typography

### Families
${table(t.fontFamily, { limit: 10 })}
### Size scale (px, ascending)
${table(tokensJson.typography.sizes, { limit: 30 })}
### Weights
${table(t.fontWeight, { limit: 12 })}
### Line heights
${table(t.lineHeight, { limit: 20 })}
### Letter spacing
${table(t.letterSpacing, { limit: 12 })}
### Webfonts loaded
${d.loadedFonts.length ? d.loadedFonts.map(f => `- ${f}`).join('\n') : '_system fonts only_'}

### @font-face declarations
${d.fontFaces.length ? d.fontFaces.map(f => `- ${f}`).join('\n') : '_none accessible_'}

### Responsive type (font sizes per breakpoint)
${BREAKPOINTS.map(b => {
  const sizes = Object.keys(tokensJson.perBreakpointFontSizes[b.name]);
  return `- **${b.name} (${b.width}px):** ${sizes.join(', ') || 'n/a'}`;
}).join('\n')}

---

## 3. Spacing

### Full scale (ascending)
${table(tokensJson.space.scale, { limit: 40 })}
### Flex/grid gaps
${table(tokensJson.space.gap, { limit: 20 })}
### Container max-widths
${table(tokensJson.space.containerMaxWidths, { limit: 15 })}
---

## 4. Shape

### Border radius
${table(tokensJson.radius, { limit: 20 })}
### Border widths
${table(tokensJson.border.widths, { limit: 10 })}
### Box shadows
${table(tokensJson.shadow.box, { limit: 15 })}
### Backdrop filters
${table(tokensJson.shadow.backdropFilter, { limit: 8 })}
---

## 5. Motion

### Transitions
${table(tokensJson.motion.transitions, { limit: 20 })}
### Animations applied
${table(tokensJson.motion.animations, { limit: 15 })}
### Keyframes defined
${d.keyframes.length ? d.keyframes.map(k => `- \`${k}\``).join('\n') : '_none_'}

---

## 6. Layout

### Display modes
${table(t.display, { limit: 12 })}
### z-index stack
${table(t.zIndex, { limit: 15 })}
### Breakpoints (media queries)
${d.mediaQueries.length ? d.mediaQueries.map(m => `- \`${m}\``).join('\n') : '_none accessible_'}

---

## 7. CSS Variables (resolved on :root)

${vars.length
  ? '| Variable | Value |\n| --- | --- |\n' + vars.map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')
  : '_no custom properties found — likely a utility-class framework (Tailwind) or inlined styles_'}

---

## 8. Rebuild notes

- Screenshots: \`screenshot-mobile.png\`, \`screenshot-tablet.png\`, \`screenshot-desktop.png\`
- Machine-readable tokens: \`tokens.json\`
- Concatenated stylesheet: \`raw.css\` — feed to \`npx wallace-cli\` or projectwallace.com for specificity/complexity analysis
- Values ranked by usage count. High-count values are the real system; long tails are one-offs or drift.
- Fonts listed above are licensed to the source domain. Substitute before shipping.
`;

  await fs.writeFile(path.join(outDir, 'design.md'), md);

  console.log(`\n✓ Wrote ${outDir}/`);
  console.log('  design.md, tokens.json, raw.css, screenshot-{mobile,tablet,desktop}.png');
})();
