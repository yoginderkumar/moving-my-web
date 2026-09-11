# Decision framework: what tool for what job

The instinct "use CSS for the small stuff, reach for a real library when things get complex" is the right one — this file makes it concrete so the call is fast and consistent instead of case-by-case guessing.

## Quick answer

| Need | Use |
|---|---|
| Hover/focus/active state, simple toggle | Plain CSS `transition` |
| One-off fade/slide/scale on load or on a class toggle | Plain CSS `@keyframes` |
| Fade/slide/reveal triggered by scroll position, no scrubbing | Native CSS `animation-timeline: view()` (progressively enhanced) |
| Many elements revealing on scroll (list/grid of cards) | Native CSS `view()` timelines, or `ScrollTrigger.batch` if you need JS-level control (e.g. reacting to visibility in JS too) |
| Multiple elements sequenced/choreographed together (hero entrance) | GSAP timeline (or Motion `variants` + `staggerChildren` if already in React and it's not scroll-tied) |
| Scroll-scrubbed animation (progress tied exactly to scroll position) or a pinned section | GSAP `ScrollTrigger` with `scrub`/`pin` |
| SVG path drawing, text-splitting effects, morphing shapes | GSAP (`DrawSVG`-style stroke animation is free now; text-splitting via a small custom split or GSAP's `SplitText`, also free) |
| React component enter/exit, shared layout animation between states | Motion (`AnimatePresence`, `layout` prop) — this is the one thing GSAP is genuinely more work for in React |
| Full page/route transition | View Transitions API natively if the target browsers support it (see below), otherwise Motion `AnimatePresence` (React) or a GSAP-orchestrated exit/enter if outside React |
| Drag, physics-based gestures (swipe-to-dismiss, draggable cards) | Motion (`drag`, spring physics) or GSAP `Draggable` |
| Tunable smooth-scroll feel across the whole page | Lenis, layered on top of native scroll (not a replacement for it) — see below |
| A "recognizable Aceternity/Magic UI effect" (spotlight, tilt, meteors, aurora, etc.) | Usually plain CSS/vanilla JS, not the component library itself — see `references/effects-catalog.md` |
| Particle field, noise-driven organic background (Vortex/Sparkles-style) | `tsparticles` (particle sim) or `simplex-noise` (organic motion) — see `effects-catalog.md` |
| 3D scene, shader background, interactive product viewer/globe | three.js / React Three Fiber, or a lighter `ogl`/single-shader approach — only when 3D is genuinely the point, not a stand-in for a CSS gradient (see below) |
| Complex AE-authored character/icon animation, or state-machine-driven interactive vector art | Lottie (`@lottiefiles/dotlottie-web`) for static AE playback, Rive for interactive state machines |

## The concrete triggers for reaching past CSS

Don't reach for a JS animation library just because an animation exists — reach for one when at least one of these is actually true:

1. **You need to sequence more than ~3-4 elements with precise relative timing/overlap** (not just a flat stagger, but "B starts 0.3s before A finishes, C starts after B is 60% done").
2. **The animation's progress needs to be tied exactly to scroll position** (scrubbing), or an element needs to **pin** in place while other content scrolls past it.
3. **You're animating an SVG path, drawing a line/icon on**, or need to **split text into characters/words/lines** and animate the pieces.
4. **You need one thing to reliably drive many different possible states** (a complex hero with several interactive variants) where hand-written CSS class-toggling would become unmanageable.
5. **You're already in React and want declarative enter/exit or shared-layout animation** — this is Motion's actual specialty, not a "complex enough to need a library" case so much as "the React-idiomatic way to express this."

If none of those are true, plain CSS (ideally with native scroll-driven timelines for anything scroll-triggered) will do it with less code, smaller bundle size, and animation that runs on the compositor thread without any JS involvement at all.

## Native CSS scroll-driven animations — the caveat

`animation-timeline: view()`/`scroll()` (see `css-patterns.md`) is real, shipped, compositor-driven, and the right default for scroll reveals — but as of this writing it's supported in Chromium and Safari, with Firefox support still behind a flag (~85% global support on caniuse). For anything where the fallback experience matters (i.e., most production sites), wrap it in `@supports (animation-timeline: view())` and provide a sensible non-animated or `IntersectionObserver`-based fallback for the remainder — don't ship it as the only path unless the project's browser support policy already excludes Firefox.

## View Transitions API for page/route transitions

The View Transitions API (`document.startViewTransition()` for SPA-style transitions, or the cross-document version via `@view-transition { navigation: auto }` for full page navigations) gives native, GPU-composited transitions between two DOM/page states without a library. It's the right default for route/page transitions when:
- The target browsers support it (Chromium and Safari currently; check current support before committing for Firefox-heavy audiences), and
- The transition is a state morph (old view → new view crossfade/slide) rather than something needing GSAP-level choreography of many independent elements.

For anything more choreographed than a crossfade/slide between states, or where Firefox support matters today, fall back to Motion's `AnimatePresence` (React) or a manually orchestrated exit-then-enter (GSAP or CSS classes) instead.

## On GSAP vs. Motion specifically (both are free now)

Both libraries dropped their paywalls for premium plugins (GSAP via the 2024 Webflow acquisition; Motion has always been open-source) — so the choice is about fit, not licensing:

- **GSAP** feels the same whether you're in React, Vue, or vanilla JS, and has the deepest, most battle-tested scroll/timeline/SVG tooling. Pick it when "the motion is the product" — marketing sites, scrollytelling, complex hero sequences — regardless of framework.
- **Motion** is the React-native way to express animation: it reads like the rest of your component code (`variants`, `AnimatePresence`, the `layout` prop for automatic layout animations), and tree-shakes to a small footprint. Pick it for in-app UI animation (modals, lists reordering, page transitions inside a React SPA) where you want animation to live declaratively next to the component logic rather than in an imperative timeline.

It's normal for a single project to use both: Motion for in-app component transitions, GSAP for a marketing/landing page section that needs real choreography.

## Smooth scroll (Lenis) — a layer, not a default

Lenis adds tunable inertia/lerp on top of scrolling without faking it via a `transform`-scrolled wrapper (the older approach, used by pre-v5 Locomotive Scroll), so it doesn't break `position: sticky`, native find-in-page, or scroll-snap the way that older technique did. It respects `prefers-reduced-motion` by default (forces instant scroll tracking rather than eased).

Reach for it when a project specifically wants that heavier, eased scroll feel site-wide, or needs tight frame-by-frame sync between scroll position and a GSAP/WebGL scene (see `snippets/gsap/lenis-scrolltrigger-sync.js` for the ScrollTrigger sync pattern — Lenis moving the page without ScrollTrigger knowing about it is the most common bug). Skip it for an ordinary content site — native scroll is faster to ship, has zero dependency cost, and most users don't actually notice its absence the way they'd notice added scroll lag on a low-end device. Don't add it reflexively just because a reference site has it; ask whether the eased-scroll feel is actually part of the brief.

## When does "premium" actually need WebGL?

A shader-driven mesh-gradient background or a 3D hero scene is a real 2025-2026 award-site pattern, but it's also the single easiest way to blow a landing page's performance and battery budget for a marginal visual gain. Reach for three.js/React Three Fiber (or a lighter single-purpose lib like `ogl` or `tsparticles`) only when at least one of these is true:

1. **The 3D-ness is the actual product** — a configurator, spatial data visualization, an interactive object the user rotates/inspects.
2. **The visual genuinely can't be approximated in CSS/canvas** — a specific organic shader gradient, a real particle field with physics, a custom generative background that's core to the brand.
3. The team has (or is budgeting for) the shader/WebGL literacy to build and *maintain* it — a webGL hero nobody on the team can debug six months later is a liability, not a flex.

If none of those hold, a CSS gradient (animated via `background-position` or `@property`-interpolated custom properties), the CSS-only `aurora-background.css` snippet, or a config-driven `tsparticles` background gets 80% of the visual richness at a fraction of the bundle size and zero WebGL maintenance burden. And WebGL/canvas content is **invisible to `prefers-reduced-motion` media queries** — a canvas scene needs its own `matchMedia` check in JS before it starts rendering motion, and needs manual ARIA/fallback content since screen readers get nothing from a `<canvas>` by default.
