# Motion (Framer Motion) patterns

Motion — published to npm as `motion` (`framer-motion` still works as an import path to the same underlying engine, but new code should install `motion` and import from `motion/react`) — is the React-idiomatic way to express animation: state-driven and declarative, and it tree-shakes to a much smaller footprint than pulling in GSAP for what's fundamentally component logic.

```bash
npm install motion
```
```jsx
import { motion } from 'motion/react';
```

## Core mental model

- Any HTML/SVG tag is available as `motion.tagname` (`motion.div`, `motion.path`, ...). Wrap a custom component with `motion.create(Component)` to make it animatable.
- `initial` — the state to render in on mount (`initial={false}` skips the entry animation entirely — useful when a component re-mounts but shouldn't re-play its intro).
- `animate` — the target state; changing the values Motion is tracking automatically transitions between old and new.
- `exit` — only fires for a child unmounting inside `AnimatePresence` (below); a plain unmount elsewhere skips it.
- `transition` — physical props (`x`, `scale`, `rotate`) default to spring physics; visual props (`opacity`, `color`) default to a tween. Override explicitly with `type: 'tween' | 'spring' | 'inertia'`.

```jsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
/>
```

## Variants and orchestration — the choreography primitive

Variants propagate down the component tree: a child `motion` component sharing a variant label with its parent animates in sync automatically, no prop drilling or manual delay math.

```jsx
const list = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul initial="hidden" animate="visible" variants={list}>
  {items.map((it) => (
    <motion.li key={it.id} variants={item}>{it.label}</motion.li>
  ))}
</motion.ul>;
```

This is the Motion equivalent of a GSAP stagger timeline — reach for it instead of hand-computing `animation-delay` per item.

## `AnimatePresence` — exit animations

Plain React unmounts a component instantly; `AnimatePresence` keeps it mounted just long enough to run its `exit` animation.

```jsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

- `mode="sync"` (default) — enter and exit run simultaneously (crossfade-style).
- `mode="wait"` — the exiting element finishes before the entering one starts. Use for anything that shouldn't overlap (tab panels, modal swaps).
- `mode="popLayout"` — the exiting element is pulled out of layout flow immediately, so siblings reflow right away instead of waiting for the exit to finish (good for a list item being removed).
- Direct children need a **stable, unique `key`** — no index keys — or Motion can't tell which element is exiting vs. new.

## `layout` / `layoutId` — the one thing GSAP can't do easily

This is Motion's actual differentiator, not a "nice to have":

- `layout` on a `motion` component makes Motion detect a layout change (size/position from re-render, reflow, reorder) and animate it via transform+scale (FLIP-style — cheap, compositor-friendly) instead of jumping instantly.
- `layoutId` shared between a component that's unmounting and one mounting elsewhere makes Motion tween between their positions/sizes automatically — the mechanism behind "magic motion" shared-element transitions (a list thumbnail morphing into a detail-page hero image, an active-tab indicator sliding to the new tab).

```jsx
{tabs.map((tab) => (
  <button key={tab.id} onClick={() => setActive(tab.id)}>
    {tab.label}
    {tab.id === active && <motion.div layoutId="active-tab-underline" className="underline" />}
  </button>
))}
```

See `snippets/motion/shared-layout-transition.jsx` for a full grid-to-detail example.

Gotchas: doesn't work on `display: inline`; not supported on SVG components; a parent animating `scale` can visually distort non-`layout` children (give them `layout` too, or counter-scale); avoid animating `border` width during a layout transition (it stretches — animate padding or an inset background instead).

## Gestures

`whileHover`, `whileTap`, `whileDrag`, `whileFocus`, `whileInView` all accept a target object or variant label and auto-revert when the gesture ends — no manual event-listener bookkeeping.

```jsx
<motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} />
```

`whileInView` replaces hand-rolled `IntersectionObserver` boilerplate for below-the-fold reveals:
```jsx
<motion.div
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.4 }} // fire once, when 40% of the element is visible
/>
```

Drag: `drag` (`true`/`"x"`/`"y"`), `dragConstraints` (a box or a ref to a bounding container), `dragElastic`, `dragMomentum` (inertia on release, on by default).

## Scroll-linked animation

```jsx
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
const y = useTransform(scrollYProgress, [0, 1], [0, -120]); // parallax
const smoothed = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

<motion.div ref={sectionRef} style={{ y }} />
<motion.div style={{ scaleX: smoothed, originX: 0 }} /> {/* scroll progress bar */}
```

See `snippets/motion/scroll-parallax.jsx` for a multi-layer version.

- `useScroll` returns motion values, not React state — reading them doesn't cause re-renders.
- `useTransform` maps one motion value's range to another (scroll progress → position/opacity/blur). Pass `{ clamp: false }` when the output should keep extrapolating past the input range (some parallax layers want this).
- Where the browser supports the native `ScrollTimeline` API, Motion uses it under the hood, so simple scroll-linked transforms can run off the main thread — a real perf edge over a hand-rolled `scroll` listener.
- **No pinning primitive.** Unlike GSAP's `ScrollTrigger` `pin: true`, Motion has no JS-managed pin/unpin lifecycle — its own scroll-pinning examples just use CSS `position: sticky` alongside `useScroll`. For a section that needs to pin *and* scrub a complex multi-layer timeline, reach for GSAP ScrollTrigger instead (see `gsap-patterns.md`).

## Motion values and the cursor-follow pattern

`useMotionValue` writes to the DOM directly, bypassing React's render cycle entirely — the reason a cursor-follow effect stays smooth even in a large tree (a `useState`-driven equivalent would re-render on every `pointermove`).

```jsx
const x = useMotionValue(0);
const y = useMotionValue(0);
const springX = useSpring(x, { stiffness: 300, damping: 30 });
const springY = useSpring(y, { stiffness: 300, damping: 30 });

<div onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}>
  <motion.div style={{ x: springX, y: springY }} />
</div>;
```

## `useAnimate` — the imperative escape hatch

For sequencing that doesn't map cleanly onto component state (a click that triggers several DOM mutations in order), `useAnimate` gives an imperative API scoped to a ref, without losing automatic unmount cleanup:

```jsx
const [scope, animate] = useAnimate();

async function sequence() {
  await animate(scope.current, { opacity: 1 });
  await animate('li', { backgroundColor: '#111' }, { delay: stagger(0.05) });
}
```

Prefer this over the older `useAnimation()` controller pattern for new code.

## Reduced motion — built in, use it

Motion has first-class, exact-named support for this — more complete than most JS animation libraries — and it should be the default wrapper for any project using Motion:

```jsx
// once, at the app root
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

`reducedMotion="user"` (the default is `"never"` — you must opt in) automatically disables transform- and layout-based animation app-wide when the OS `prefers-reduced-motion` setting is on, while still letting `opacity`/`color` transitions through so state changes stay visible. For a case needing custom fallback treatment rather than just "turn it off":

```jsx
const shouldReduceMotion = useReducedMotion();
<motion.div animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, rotate: 0 }} />;
```

See `references/accessibility.md` for how this fits alongside the CSS-only pattern used elsewhere in this skill.

## Next.js App Router page transitions — the gotcha

The App Router unmounts the old route almost immediately on navigation, so a naive `<AnimatePresence>` wrapping `{children}` in `layout.tsx` often skips the exit animation entirely — the old tree doesn't stay mounted long enough to play it. There's no built-in page-transition primitive in the App Router as of this writing. Two working approaches:

1. Key `AnimatePresence`'s child by `pathname` and take the exiting route out of layout flow (`position: absolute`) so the entering route can render underneath while the old one finishes exiting (search for "FrozenRouter pattern" for a current reference implementation — it wraps internal Next.js router context, so check it still matches the Next.js version in use).
2. Skip Motion for this specific problem and use the native View Transitions API instead (see `decision-framework.md`) — genuinely simpler for a route-level crossfade/slide, and doesn't fight the App Router's unmount timing at all.

Always set `mode="wait"` for sequential (non-overlapping) route transitions.

## Motion vs. GSAP

See `decision-framework.md` for the full breakdown. Short version: Motion for anything React-state-driven (enter/exit, shared layout transitions, in-app UI), GSAP for anything requiring scroll pinning, complex rewindable timeline sequencing, or SVG-heavy work outside a React tree.
