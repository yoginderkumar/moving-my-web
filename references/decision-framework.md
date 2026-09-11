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
