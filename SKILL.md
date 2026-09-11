---
name: moving-my-web
description: Craft award-worthy, production-grade motion for web apps and landing pages — hero entrances, scroll-triggered reveals, stagger/choreography, micro-interactions (hover, magnetic buttons, cursor effects, spotlight/tilt/aurora-style effects), page/route transitions, and scrollytelling sections, using plain CSS, native scroll-driven CSS, GSAP, or Motion (formerly Framer Motion) depending on what the moment actually needs. Use this any time the user asks for "animations," "motion," a "landing page that feels premium/award-winning/like an Awwwards site," scroll effects, transitions, micro-interactions, hover effects, parallax, smooth scroll (Lenis), or an "Aceternity/Magic UI-style" effect — even if they don't name a library. Also use it to review or fix existing animation code for jank, layout thrash, or missing prefers-reduced-motion support.
---

# World-class web animation

Most "bad" web animation isn't bad because of poor taste — it's bad because of two habits: animating properties that force the browser to repaint the whole page every frame, and animating *everything* at once with no hierarchy. Fix those two things and you're already ahead of most sites. Everything below builds from there.

## Workflow: discover → research → propose → execute

Don't jump straight to code for a new animation engagement — a landing page or app that hasn't been animated with this skill yet, or a broad ask ("make my site feel premium," "animate my landing page," "add some world-class motion to this"). Treat it as a small project with four phases, in order. For a narrow, already-scoped follow-up within a plan you already agreed on ("also stagger this section the same way," "fix the jank on that hover," a one-line tweak) — or when the user explicitly says to just build something — skip straight to **Execute**. Re-running the interview on every message is friction, not rigor; the phases exist for the moments that actually need judgment calls, not for every tweak.

### 1. Discover — ask before looking at anything

Ask these up front, batched into one round rather than dripped one at a time (use a single multiple-choice/open question turn if your environment supports it):

- **What the product or page is, and who it's for.** This is what "world-class" cashes out to concretely — a fintech dashboard and a creative agency's portfolio site shouldn't move the same way, and you can't pick that without knowing what you're building for.
- **Any theme or brand direction already decided** — tone (minimal/technical, bold/playful, luxury/editorial), and existing brand colors/type/design tokens if there's a system already.
- **Any reference sites, screenshots, or "like X" examples** they have in mind for the motion specifically (not just visual design).
- **Scope and what's already there**: which part of the product this covers (the whole app, just the landing page, just the hero), and what's actually in the codebase already — stack (React/vanilla/etc.), any animation library already installed, anything already animated. You need this to propose something that fits the project, not something that requires a rewrite.

Don't treat this as a rigid form. If the user's first message already answers two of these, don't ask again — ask only what's still missing.

### 2. Research — read before proposing

Two things to read, not one:

- **Their project.** Open the actual codebase: confirm the stack, check for an existing design-token/theme file (don't propose a second easing/timing language that fights one that already exists), and look at what the target sections currently look like and whether anything is already animated.
- **The outside reference.** If they named a site or style, fetch/open it and describe concretely what it's actually doing — which sections animate, what triggers each one (load vs. scroll vs. hover), and a rough guess at technique (translate the vibe into the vocabulary this skill uses: choreography, easing, stagger, trigger — see `references/principles.md`) rather than a vague "it feels smooth." If they didn't name a reference but gave a clear industry/theme, a couple of searches for well-regarded sites in that space beats proposing a plan in a vacuum.

### 3. Propose — a plan, not code yet

Write the plan in plain language before touching code. For each section in scope: what animates, why (tie back to `references/principles.md` — feedback, hierarchy, delight, spatial continuity; cut anything you can't justify this way), roughly how it's triggered and choreographed (order, overlap, stagger), and which tool per `references/decision-framework.md` — say why briefly, since this is also where you show you didn't reach for GSAP out of habit. Keep it skimmable: a short list per section, not an essay.

End by asking for a go-ahead or changes, and don't move to Execute until you get one — unless the user said up front to just build it, in which case treat the plan as something you state plainly (so they can still redirect) rather than something you wait on.

### 4. Execute

Build against the approved plan:

1. **Write it against the non-negotiables checklist below.** These are not style preferences — skipping them is how sites end up janky, inaccessible, or actively nauseating to some users.
2. **Reach for a snippet** in `snippets/` as a starting point rather than writing boilerplate from scratch — adapt it, don't just paste it in unmodified.
3. **Verify before calling it done**: does it respect `prefers-reduced-motion`? Does it only animate compositor-friendly properties? Is there cleanup (event listeners, GSAP contexts, ScrollTriggers) so it doesn't leak or double-fire on re-render/navigation? Does it actually match the plan the user signed off on?
4. **If reality diverges from the plan** once you're in the code (the reference site's effect needs a technique the plan didn't anticipate, or a section turns out to need GSAP after all), say so and adjust rather than silently deviating from what was agreed.

## Non-negotiables

- **Animate `transform`, `opacity`, `filter`, and `clip-path` — not layout or paint properties.** `width`, `height`, `top`/`left`, `margin`, `padding`, `box-shadow` spread, and background-position force layout or paint on every frame and are the #1 cause of janky animation. See `references/performance.md` for the full list and the FLIP technique for the cases where you genuinely need to animate layout.
- **Always respect `prefers-reduced-motion`.** Large-scale motion (parallax, spins, zooms, autoplay backgrounds) can cause real physical symptoms for people with vestibular disorders — this isn't a nice-to-have. Wrap decorative motion in the media query; keep essential state-change feedback but shorten and simplify it. Details and patterns in `references/accessibility.md`.
- **Give every animation a reason.** If you can't say what an animation communicates (this appeared, this is now selected, this leads here, this is the important thing), cut it or fold it into something that does. Restraint is what makes the couple of animations you *do* keep read as intentional rather than decorative noise.
- **Never leave dangling side effects.** `IntersectionObserver`s, scroll listeners, `ScrollTrigger` instances, and GSAP contexts must be torn down on unmount/navigation, or they double-fire, leak memory, and cause exactly the kind of bugs that are miserable to track down later. The React GSAP snippet shows the cleanup pattern.
- **Don't fight the browser's own idle time.** Prefer CSS/native timelines (which the compositor thread can run even while JS is busy) over `scroll` event handlers doing per-frame math, unless you're already inside GSAP's ScrollTrigger, which handles this for you.

## Reference files (read the ones relevant to the task)

- `references/principles.md` — motion design fundamentals: why animate, easing and timing by animation type, choreography/stagger, visual hierarchy. Read this when the request is about *feel* ("make it feel premium," "it feels stiff/cheap") rather than a specific bug.
- `references/performance.md` — compositor vs. layout vs. paint properties, `will-change` usage (and misuse), the FLIP technique, how to profile jank in DevTools. Read this when something is janky, or before shipping anything with more than a couple of moving elements.
- `references/accessibility.md` — `prefers-reduced-motion` patterns, vestibular-safety guidance, focus/ARIA interactions with animated content.
- `references/decision-framework.md` — the full CSS vs. native-scroll-CSS vs. GSAP vs. Motion decision tree, with concrete triggers for each, plus notes on the View Transitions API for page/route transitions, when Lenis smooth-scroll earns its place, and where "premium" actually crosses into needing WebGL.
- `references/css-patterns.md` — `@keyframes`/transition patterns, native scroll-driven animations (`animation-timeline: view()`/`scroll()`, `animation-range`) with progressive-enhancement fallbacks, and a small custom-easing cheat sheet (avoid the default `ease`/`linear` for anything that should feel deliberate).
- `references/gsap-patterns.md` — timelines, stagger, ScrollTrigger (pin/scrub/batch), the React cleanup pattern, and `autoAlpha` vs. `opacity`. Note: GSAP (including ScrollTrigger, SplitText, etc.) is fully free as of the Webflow acquisition — no paywalled plugins to work around anymore.
- `references/motion-patterns.md` — Motion (formerly Framer Motion): variants/stagger, `AnimatePresence`, `layout`/`layoutId` shared-element transitions, scroll-linked hooks (`useScroll`/`useTransform`/`useMotionValue`), the Next.js App Router page-transition gotcha, and built-in reduced-motion support (`MotionConfig`, `useReducedMotion`).
- `references/effects-catalog.md` — the "Aceternity/Magic UI-style effect" to technique map (spotlight, 3D tilt, meteors, aurora, marquee, vortex, shared-element hover, etc.), tagged by whether it needs nothing but CSS/vanilla JS or a genuine dependency — read this before reaching for a component library to get one effect.

## Snippet library

Working, copy-adaptable starting points — not a component library to import wholesale. Read the file, understand what it's doing, then adapt names/timing/easing to the actual design.

**`snippets/css/`** (no library, ship these on any project):
- `easing-tokens.css` — a small set of named custom-easing curves and duration tokens to define once and reuse.
- `scroll-reveal.css` — native `animation-timeline: view()` fade/rise-in on scroll, with an `@supports` fallback comment for unsupported browsers.
- `stagger-children.css` — CSS-only staggered entrance for a list/grid using an `--i` custom property.
- `text-mask-reveal.css` — headline reveal via `clip-path`.
- `marquee-infinite.css` — seamless infinite-scrolling logo/text strip.
- `magnetic-hover-button.html` — cursor-following "magnetic" button, the classic premium-landing-page micro-interaction, in vanilla JS + CSS.
- `spotlight-cursor.css` — pointer-tracked radial-gradient glow (the Aceternity "Spotlight" effect), no dependency.
- `aurora-background.css` — layered animated gradient background (the "Aurora Background" effect), no dependency.
- `meteors.css` — diagonal falling-streak background accent, no dependency.

**`snippets/js/`** (vanilla JS, no library):
- `3d-tilt-card.js` — pointer-tracked 3D card tilt via `perspective`/`rotateX`/`rotateY`, with cleanup and reduced-motion handling.

**`snippets/motion/`** (pull in Motion when the task in `decision-framework.md` calls for it):
- `shared-layout-transition.jsx` — `layoutId` shared-element ("magic motion") transition from a grid card into an expanded detail view.
- `scroll-parallax.jsx` — multi-layer scroll-linked parallax via `useScroll`/`useTransform`, reduced-motion aware.

**`snippets/gsap/`** (pull in GSAP when the task in `decision-framework.md` calls for it):
- `hero-timeline.js` — coordinated multi-element hero entrance (headline, subhead, CTA, art) with stagger.
- `scroll-trigger-reveal.js` — `ScrollTrigger.batch` for performant reveal of many elements (don't create one ScrollTrigger per card by hand).
- `pinned-scroll-section.js` — pin + scrub pattern for a scrollytelling section.
- `svg-draw-path.js` — stroke-draw-on-scroll for logos/icons/diagrams.
- `react-gsap-cleanup.jsx` — `useGSAP` + scoped context pattern that avoids the classic "animation restarts or doubles on re-render" GSAP-in-React bug.
- `lenis-scrolltrigger-sync.js` — Lenis smooth-scroll synced with ScrollTrigger, with cleanup.

## A note on taste

The libraries and properties above are the craft; the taste is in restraint and timing. When in doubt: fewer simultaneous animations, shorter durations than feel natural at first (premium sites are often *faster* than they look, not slower), and always ease-out on things entering, ease-in on things leaving. If a design brief says "make it feel like an Awwwards site," what they usually mean is *confident, quick, and coherent* — not maximal.
