# zig.ai — Motion Storyboard (reverse-engineered)

> Reconstructed from `references/2026-07-27 21-44-25.mov` (74.3s, 1920×1080, 29.97fps)
> Sampled at 1fps → 74 frames → 3 contact sheets (`standalone-3nm-v2/references/zig-sheets/`).
> Cross-checked against live DOM inspection (Webflow + GSAP/ScrollTrigger + Lenis + Lottie + Splide).
> Generated 2026-07-28.

## Motion stack (measured from live DOM)

| Library | Role |
|---|---|
| **Lottie** | Hero animation only (8s loop, 4 responsive sizes: 2500/1280/820/420) |
| **GSAP + ScrollTrigger** | All body-section scroll reveals (12 `data-w-id` triggers) |
| **Lenis** | Smooth-scroll inertia (the "glide" feel) |
| **Splide** | Testimonial slider (6 slides, loop) |
| **SplitText** | Heading text reveals (per-line/char) |
| Webflow | Host platform (site id `692db0eaf3c473ac91a06392`) |

No `<video>`. No `<canvas>`. Hero is the only downloadable animation asset.

---

## Storyboard — section by section (timecodes ≈ recording position)

### 1. Hero — "Close deals. Zig handles the rest." (~0–13s)
- **Asset:** Lottie, 8s loop. Radial node-graph centered right of the headline.
- **Motion:** Notification cards fan in/out around a central hub along faint connector lines — `Meeting completed`, `Follow-up drafted`, `CRM updated`, `Next step scheduled`, each with a green check. Then a `Zig did` (green) vs `You did` (black) comparison card swaps in. Loops.
- **Headline:** two-tone — black "Close deals." + green "Zig handles the rest." Likely SplitText line reveal on load.
- **CTAs:** red "Start Now" + ghost "Book a demo for a Team".

### 2. "You didn't get into sales to do data entry" (~14–20s)
- **Layout:** two-column before/after list under eyebrow "The execution gap".
- **Motion:** rows reveal on scroll (GSAP fade-up, staggered). **Before Zig** column (problems) vs **After Zig** column. Key word "data entry" highlighted green.

### 3. "Zig doesn't speed up admin. It gives the rep a team that runs it." (~20–23s)
- Centered two-line statement (black + green second line).
- **Trusted-by logo row:** oksum, checksum, SellingSara, Ketch, velociti, Farmers Insurance — fade/slide in.

### 4. "Why Zig is different from everything else you've tried" (~24–30s)
- **Layout:** 2×2 bento grid.
  - `Full revenue motion` (light card, step chips: Research/Outreach/Meetings/CRM sync)
  - `Field-first mobile` (RED card, phone mockup with rotating **Z** badge + orbital ring)
  - `Always working. Never waiting.` (GREEN card)
  - `The rep stays in control` (light card)
- **Motion:** cards reveal on scroll; phone badge has a continuous rotate/orbit loop.

### 5. "What changes when Zig runs" (~30–36s)
- **Layout:** 4 large stat circles — `60+` hours back, `95%` CRM accuracy, `30%` faster front-foot, `3x` revenue impact.
- **Motion:** circles **scale up from small → full** on scroll-in (GSAP scale + count-up likely on the numbers). This is the most prominent scroll animation on the page.

### 6. "The longer it runs, the wider the gap…" (~36–40s)
- A single green circle **scales up to fill the viewport**, acting as the transition wipe from the light section into the dark section below.

### 7. "The rep closes. The leader has their back." (~40–46s)
- **Section:** dark (near-black) background.
- **Motion:** two large **overlapping Venn circles** draw/fade in — `For the rep doing the closing` (left) ∩ `For the leader running the number` (right), central Z mark at the intersection. Surrounding labels fade in around the ring.

### 8. "Every part of the sale. Handled." (~46–52s)
- **Section:** solid GREEN.
- **Layout:** horizontal step row — `Research → Outreach → Meetings → Follow-Up → CRM Sync → Pipeline`, each an icon + label.
- **Motion:** steps reveal left-to-right along a connecting line (staggered GSAP, connector line draws across). Small Z tokens travel the baseline.

### 9. "The only sales team that gets better the longer it works for you" (~52–58s)
- **Layout:** timeline cards `Month 1 → Month 3 → Month 6` + red CTA card "Start today. Because in 6 months, today is what you'll wish you'd done."
- **Motion:** month cards reveal in sequence (scroll-stagger); CTA card slides in last.

### 10. "What Our Clients Say" (~58–64s)
- **Section:** dark navy, dotted texture.
- **Asset:** **Splide slider**, 6 slides, loop. Testimonials — Stéphane Le Mentec (Ketch), Anthony Argenziano (velociti), etc. Prev/next arrows, auto-advance.

### 11. FAQ (~64–70s)
- **Layout:** accordion. Questions: Salesforce/Gong/Apollo overlap, phone/voice, time-to-value, rep adoption, gets-smarter, who-it's-for, pricing.
- **Motion:** items **expand/collapse on click** (height + icon +/− rotate). Captured expanded in the recording via your click.

### 12. Footer CTA — "Stop managing tools. Start executing." (~70–74s)
- Green gradient panel, red "Start Now" + ghost demo CTA, footer nav + socials. "Website designed by Peppermint".

---

## What the 1fps pass gives vs. doesn't

- **Gives:** complete section inventory + which sections animate + animation *type* and direction. Enough to rebuild the page's motion design intent.
- **Doesn't give:** frame-accurate *timing/easing* inside each animation (a scale-in that plays over 0.6s falls between 1fps samples).
- **To get timing:** re-sample a specific window at high fps — e.g. the stat-circle grow (§5) or the step-row draw (§8) at 10–15fps — then measure the ease curve.

## Better-than-frames sources (for exact rebuild)
- **Hero:** download the `.lottie` (§ hero) → every keyframe is inside the JSON. Best possible fidelity.
- **Scroll sections:** extract Webflow **IX2 interaction JSON** from the live page → each `data-w-id` carries its timeline (property, from→to, duration, easing, trigger). Exact, no video needed.
