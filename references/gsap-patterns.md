# GSAP patterns

GSAP (including ScrollTrigger, SplitText, Draggable, Flip, MorphSVG, etc.) is 100% free as of the 2024 Webflow acquisition — there's no paywalled "Club GreenSock" tier to work around anymore. Install what you need:

```bash
npm install gsap
```

## Core mental model

- `gsap.to(target, {...})` animates *to* the given values from the current state.
- `gsap.from(target, {...})` animates *from* the given values to the current state — the common pattern for entrances (`gsap.from(el, { opacity: 0, y: 40 })`).
- `gsap.set(target, {...})` sets values instantly, no animation — use this to establish a starting state before the page paints, so there's no flash of unstyled/wrong-state content.
- `gsap.timeline()` sequences multiple `to`/`from`/`set` calls with precise relative timing.

## `autoAlpha` instead of `opacity`

Use `autoAlpha` (a GSAP-specific property) instead of `opacity` when an element also needs to stop intercepting clicks/hovers while hidden — it animates opacity *and* toggles `visibility: hidden` at 0, so a faded-out element doesn't silently block interaction with what's behind it.

## Timeline choreography (the hero-entrance pattern)

```js
const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.7 } });

tl.from('.hero-eyebrow', { opacity: 0, y: 16 })
  .from('.hero-headline', { opacity: 0, y: 24 }, '-=0.5') // starts 0.5s before previous ends — overlap, not wait
  .from('.hero-subhead', { opacity: 0, y: 16 }, '-=0.4')
  .from('.hero-cta', { opacity: 0, y: 12, duration: 0.5 }, '-=0.3')
  .from('.hero-art', { opacity: 0, scale: 0.96 }, '-=0.6');
```

The `'-=0.5'` position parameters are what makes a GSAP timeline feel like real choreography instead of a relay race — each element starts while the previous one is still finishing.

## Stagger

```js
gsap.from('.card', {
  opacity: 0,
  y: 32,
  duration: 0.5,
  ease: 'power3.out',
  stagger: 0.06, // 60ms between each
});
```
For grids, `stagger` can take an object (`{ each: 0.05, grid: 'auto', from: 'center' }`) to stagger outward from a point rather than strictly in DOM order.

## ScrollTrigger — reveal, scrub, pin

**Simple reveal (element animates once when it scrolls into view):**
```js
gsap.from('.reveal', {
  opacity: 0,
  y: 40,
  duration: 0.6,
  ease: 'expo.out',
  scrollTrigger: {
    trigger: '.reveal',
    start: 'top 85%', // when the element's top hits 85% down the viewport
    toggleActions: 'play none none none',
  },
});
```

**Batch reveal for many elements** (don't create one ScrollTrigger per card by hand — `ScrollTrigger.batch` is built for exactly this and is far cheaper):
```js
ScrollTrigger.batch('.card', {
  onEnter: (batch) => gsap.from(batch, { opacity: 0, y: 30, stagger: 0.08, duration: 0.5 }),
  start: 'top 85%',
});
```

**Scrubbed / pinned (classic scrollytelling section):**
```js
gsap.timeline({
  scrollTrigger: {
    trigger: '.pinned-section',
    start: 'top top',
    end: '+=1500', // pin for 1500px of scroll distance
    pin: true,
    scrub: 1, // ties timeline progress directly to scroll position; the number is smoothing (seconds to catch up)
  },
})
  .to('.layer-1', { xPercent: -20 })
  .to('.layer-2', { xPercent: -60 }, 0); // the `0` starts this at the same point as the previous tween
```

## Cleanup — the part that's easy to get wrong, especially in React

Every `ScrollTrigger` and timeline needs to be killed when the component unmounts or the DOM it targets goes away, or you get duplicate triggers, animations firing on unmounted elements, and memory leaks that compound on every navigation in an SPA. In plain JS, keep a reference and kill it:

```js
const st = ScrollTrigger.create({ /* ... */ });
// later, e.g. on route change:
st.kill();
```

In React, the robust pattern is GSAP's own `useGSAP` hook (from `@gsap/react`), which scopes selectors to a ref and auto-reverts everything on unmount — see `snippets/gsap/react-gsap-cleanup.jsx` for the full pattern. This is the fix for the extremely common "animation plays twice / restarts weirdly" bug that shows up when GSAP is used with a plain `useEffect` in a component that can re-render or remount (React 18 Strict Mode double-invokes effects in development specifically to surface this class of bug).

## Respecting reduced motion with `gsap.matchMedia`

```js
let mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  // full animation setup here — automatically cleaned up if the user's
  // preference changes, or on gsap.matchMedia().revert()
  gsap.from('.hero', { opacity: 0, y: 40, duration: 0.6 });
});

mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.set('.hero', { opacity: 1, y: 0 }); // jump straight to end state
});
```
