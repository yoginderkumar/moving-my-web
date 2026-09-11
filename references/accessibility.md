# Accessibility and motion safety

This isn't an optional polish pass — for a meaningful number of users, unrestrained motion causes real physical symptoms (dizziness, nausea, migraine triggers), particularly for people with vestibular disorders. Treat `prefers-reduced-motion` as a requirement on any animation of real scale, the same way you'd treat color contrast.

## `prefers-reduced-motion`

Wrap anything with large-scale movement, parallax, spin, zoom, or autoplay in the media query. The pattern is: **default to the reduced version, opt into the full version for users who haven't asked for less motion** — this also means people get *something* sensible even before the media query is evaluated (progressive enhancement, not a broken default).

```css
/* Default: minimal, safe motion */
.hero-layer {
  transform: none;
}

/* Only for users who haven't opted into reduced motion */
@media (prefers-reduced-motion: no-preference) {
  .hero-layer {
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .hero-layer.parallax {
    transform: translateY(var(--parallax-offset));
  }
}
```

In JS (GSAP example):

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  gsap.set(targets, { opacity: 1, y: 0 }); // jump straight to end state
} else {
  gsap.from(targets, { opacity: 0, y: 40, duration: 0.6, stagger: 0.06 });
}
```

GSAP also has a built-in helper for this: `gsap.matchMedia()` lets you register entirely different animation setups per media query condition, including `(prefers-reduced-motion: reduce)`, and cleans up automatically when the condition stops matching.

Motion has even more direct support — see `references/motion-patterns.md`. Wrap the app root once:

```jsx
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

`reducedMotion="user"` automatically disables transform- and layout-based animation (including `layout`/`layoutId` shared-element transitions) app-wide for users with the OS preference set, while still letting `opacity`/`color` transitions through so state changes stay visible. This is a real default to reach for, not just a fallback — the manual `useReducedMotion()` hook is for the narrower case of needing a custom (not just "disabled") treatment for a specific animation.

If the project uses Lenis for smooth scroll, it already respects `prefers-reduced-motion` by default (forcing instant, non-eased scroll tracking) — no extra work needed there, just don't pass `respectReducedMotion: false` without a specific reason.

## What to reduce vs. what to keep

Reduced motion doesn't mean *no* motion — it means removing the motion that's disorienting or purely decorative while keeping the feedback that communicates state:

- **Remove/simplify**: parallax scrolling, autoplaying background video/canvas motion, large zooms, spins, anything that moves independently of user intent at a large scale.
- **Keep, but shorten/simplify**: a button press acknowledging a click, a form field showing an error, a loading indicator, focus movement — these communicate state and their absence can itself be disorienting (did my click register?). A quick opacity cross-fade instead of a slide/scale is usually enough.

## Other motion-adjacent accessibility concerns

- **Don't remove focus indicators via animation resets.** If a hover/focus micro-interaction restyles an element, make sure the visible focus ring (or an equivalent custom one) still survives — a common bug is a CSS transition or `outline: none` reset that quietly kills keyboard-focus visibility.
- **Autoplaying content should pause when off-screen and respect reduced data preferences** — a hero background video looping forever off-screen wastes battery/data for no visual benefit; pause it via `IntersectionObserver` when it scrolls out of view.
- **Purely decorative animated elements should be hidden from assistive tech** (`aria-hidden="true"`) so screen reader users aren't forced to parse motion that carries no information for them.
- **Animated content that carries meaning needs a non-animated equivalent for anyone not seeing the animation** — e.g., a number counting up should still have the final value present in the DOM/accessible name, not only as an animated visual.
- **Don't animate away critical content on a timer that the user can't control** (auto-advancing carousels, toasts that disappear before they can be read) — respect `prefers-reduced-motion` for auto-advance timing too, and give a pause/dismiss control where the content matters.
- **`<canvas>`/WebGL content is invisible to CSS media queries.** A particle background, shader gradient, or three.js scene built for a "premium" feel won't be touched by a `prefers-reduced-motion` media query at all — check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` in JS before initializing the render loop, and provide a static fallback (a still frame, a plain gradient) rather than skipping the check because "it's just a background."
