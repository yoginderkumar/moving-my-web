# Effects catalog: how the "Aceternity-style" effects actually work

Libraries like Aceternity UI, Magic UI, Motion Primitives, and similar copy-paste component catalogs are a good source of ideas and reference implementations — worth browsing for what's possible. But most of their signature effects don't need the library (or even the dependency) they ship with — the underlying technique is often plain CSS or a few lines of vanilla JS. This file is the technique-first version: what an effect actually *is*, so it can be hand-rolled instead of installing a component library wholesale, consistent with this skill's minimal-dependency bias.

A licensing note before diving in, in case a user wants to vendor real source rather than just the technique: this space is almost universally MIT-licensed for the free tier (safe to read and adapt). Two exceptions worth flagging if copying code directly — React Bits ships under MIT + Commons Clause (no reselling components as a standalone product), and a couple of others (Skiper UI, Hover.dev) are proprietary even in their free tier.

## No dependency needed — CSS/vanilla JS reproduces these exactly

| Effect | Technique |
|---|---|
| **Spotlight** (cursor-tracked glow) | `radial-gradient(circle at var(--x) var(--y), color, transparent)` on a `pointer-events-none` overlay; update `--x`/`--y` custom properties on `pointermove`. See `snippets/css/spotlight-cursor.css`. |
| **3D card tilt** | `perspective` on the container + `transform-style: preserve-3d`, then compute rotation from cursor offset within the card and write `rotateX`/`rotateY` on `pointermove`. No Motion/GSAP needed — the same technique vanilla-tilt.js uses. See `snippets/js/3d-tilt-card.js`. |
| **Meteors** | N absolutely-positioned elements with randomized `left` and `animation-delay`, one shared `@keyframes` translating + rotating diagonally. See `snippets/css/meteors.css`. |
| **Infinite marquee / logo strip** | Duplicate the content once, one `@keyframes translateX(-50%)`, edge-fade via `mask-image`. Already covered in `snippets/css/marquee-infinite.css`. |
| **Aurora / gradient-mesh background** (non-shader version) | Layered `repeating-linear-gradient()`s animated via `background-position`, `mix-blend-mode: difference` for the color interplay, `mask-image` to feather the edges. Zero dependencies. See `snippets/css/aurora-background.css`. For a genuinely shader-driven, more organic mesh gradient (2025-2026 award-site trend), that's a real WebGL case — see the dependency table below. |
| **Bento grid + basic hover** | Plain CSS Grid + `:hover`/`group-hover` state changes. Only reach for `layoutId` (below) if the hover highlight needs to visually slide *between* sibling cards. |
| **Text generate / reveal on load** | Split text into spans (server-side or a tiny JS loop), animate `opacity`/`filter: blur()` with staggered `animation-delay` (CSS) or `stagger()` (Motion/GSAP). No dedicated library required for the split itself unless the text wraps dynamically across lines, in which case GSAP's `SplitText` (free) handles the line-wrap edge cases CSS can't. |
| **Image comparison / before-after slider** | `clip-path: inset(0 ${100 - pct}% 0 0)` on the top image, `pct` driven by pointer/touch position via `getBoundingClientRect()`. |
| **Floating navbar** (hide on scroll down, show on scroll up) | A scroll listener (throttled via `requestAnimationFrame`) diffing current vs. previous `scrollY`, toggling a `transform: translateY()`/class. Motion's `useMotionValueEvent` mainly saves the "diff against previous sample" bookkeeping if the project is already in Motion. |

## Where a real dependency earns its place

| Effect | Dependency | Why it's justified |
|---|---|---|
| **Dense particle fields / interactive sparkles** | `tsparticles` | Real particle simulation (velocity, collision, DPR-aware canvas) — hand-rolling this well is a lot of code for something already well-optimized and free. |
| **Vortex / wavy organic backgrounds** | `simplex-noise` | Coherent, non-repeating noise fields (curl noise driving particle velocity) are genuinely hard to fake with simpler math — one of the few cases a small noise library is worth it even under a CSS-first bias. |
| **Multi-layer correlated scroll animation** (e.g. an element rotating, scaling, and translating all as functions of the same scroll progress, at different rates) | Motion (`useScroll` + multiple `useTransform` calls) | Cleanly correlating several non-linear scroll-tied transforms from one progress value is exactly what these hooks are for; native `animation-timeline: scroll()` can't yet express multi-keyframe, viewport-responsive ranges like this. |
| **Shared sliding highlight between siblings** (active-tab underline, a selection outline that moves) | Motion (`layoutId`) | CSS `:hover`/`:focus` alone can't interpolate a shared element's geometry across different DOM siblings — this needs FLIP-style measurement, which is what `layoutId` automates. |
| **3D scenes, shader gradients, interactive globes/product viewers** | three.js / React Three Fiber, or a lighter WebGL lib (`ogl`) for a single custom shader | Genuine 3D/WebGL with no CSS equivalent. See `decision-framework.md` for the threshold on when this is actually worth the bundle/battery cost. |
| **Real physics simulation** (gravity, cursor-attraction with mass/collision) | `matter-js` | A real 2D rigid-body physics engine — impractical to hand-roll to the same quality. |
| **Confetti burst** | `canvas-confetti` | Small and self-contained; a physics-correct confetti burst is fiddly enough to hand-roll that the small dependency is a reasonable trade — a judgment call, not a hard rule. |
| **Complex AE-authored character/icon animation** | Lottie (`@lottiefiles/dotlottie-web`) or Rive | For animation a motion designer builds in After Effects (Lottie, static playback) or that needs live state-machine interactivity (Rive) — see `decision-framework.md`. |

## The pattern to apply

When a user shows a reference site or asks for an "Aceternity-style" effect by name: identify which bucket it's in above, then either hand it back as CSS/vanilla JS (the first bucket — most effects) or name the specific dependency and why it earns its place (the second bucket). Don't reach for installing a whole component library to get one effect out of it — that's how a landing page quietly picks up Tailwind, Motion, and three other transitive dependencies to get one hover effect.
