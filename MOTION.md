# MOTION.md — Motion layer

## The stack (this build)
| Role | Library | Decision |
|---|---|---|
| Default motion (reveals, scroll-link, micro-interactions, the hover-jump cards) | **Motion** — vanilla `motion` (animate/inView/scroll/spring), self-hosted ESM, deferred. NOT `motion/react` (site is static Astro HTML, no React). | **USE, vanilla.** Keep it light; CSS for simple enters. |
| Accent glass (a tag/badge or two) | vanilla `backdrop-filter: blur() saturate()` | Optional, ≤2 spots. Never a layout. |
| Hero background | **Static export only** — a subtle CSS conic/radial warm-paper gradient or a light grain. NO live WebGL/shadergradient on this LCP/SEO homepage. | **Static.** (Optional tiny r3f/shader accent only if perf-gated + lazy — default is none.) |

## Springs vs CSS
- CSS transition = default (hover, active, simple enters).
- Motion spring = ONLY the signature hover-jump / drifting notification cards (physical, interruptible) and any mouse-tracking. That's the one place JS physics earns its weight.

## Per-view emphasis map (1–2 focal points per view; everything else calm)
| View | THE emphasis | 2nd (optional) | Rest |
|---|---|---|---|
| Hero | The H1 line + the drifting notification pile (one green word) | CTA | calm |
| Ops-hire trap | The dark ownership punch ("Skip the ops hire…") | — | calm |
| What I build | The radial data→hub diagram animating once on enter | the 4 chips | calm |
| Proof / cases | one KPI per card | — | calm |
| Comparison | the RightClick column | — | calm |
| Closing | the form + primary CTA | — | calm |

## Reduced-motion contract (non-negotiable)
- Every motion behind `prefers-reduced-motion: reduce` → static end-state, nothing blocked. The notification cards render in place (no drift), the diagram shows its final state, reveals show immediately.
- No-JS: every element usable; motion decorates only.

## Perf budget
- Animate transform + opacity ONLY. No layout-property animation.
- Tree-shake vanilla `motion` to used APIs; defer. 0 CLS, LCP unchanged, 60fps, reduced-motion clean.
