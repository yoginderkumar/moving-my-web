# Performance: keeping animation at 60fps (or 120fps on modern displays)

Every frame budget is roughly **16.6ms at 60fps** (about 8.3ms at 120fps). Anything that pushes a frame over budget shows up as visible jank/stutter. The goal is to keep as much of the animation work as possible on the **compositor thread**, which can run independently of the main JS thread and of expensive layout/paint work.

## The property tiers

**Compositor-only (cheap — animate these):**
- `transform` (translate, scale, rotate, skew)
- `opacity`
- `filter` (mostly — some filters like heavy blurs are still expensive to paint, just not to composite)
- `clip-path`
- `backdrop-filter` (compositor-friendly but can still be expensive to paint underneath)

**Triggers layout (expensive — avoid animating these):**
- `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`
- `font-size`, `border-width`

Animating these forces the browser to recompute layout for the element (and often its neighbors/ancestors) on every single frame — this is "layout thrash" and is the single most common cause of janky "modern" web animation.

**Triggers paint (moderately expensive):**
- `background-color`, `background-position`, `box-shadow`, `border-radius`, `color`

These don't force a full layout recalculation but do force the browser to repaint pixels, which is still real work per frame, especially over large areas.

**Rule of thumb:** if you want to animate a size/position change, animate a `transform: scale()`/`translate()` instead of `width`/`height`/`top`/`left`. If you want to animate a shadow appearing, cross-fade two elements' `opacity` (one with the shadow, one without) instead of animating the shadow's spread directly.

## `will-change`

`will-change` hints to the browser to promote an element to its own compositor layer ahead of time, which can prevent a stutter on the *first* frame of an animation. It is easy to misuse:

- **Use it as a fix for a measured problem, not preemptively.** Adding it everywhere "just in case" consumes memory (each promoted layer costs GPU memory) and can *hurt* performance overall.
- **Toggle it dynamically in JS**, on right before the animation starts and off right after it ends — don't hardcode it in a stylesheet for anything that isn't a constantly-recurring, predictable animation:
  ```js
  el.addEventListener('pointerenter', () => { el.style.willChange = 'transform'; });
  el.addEventListener('transitionend', () => { el.style.willChange = 'auto'; });
  ```
- **Scope it to the specific properties and the specific element** — `will-change: transform, opacity` on the element that's actually moving, never on `body` or a large wrapping section.
- You don't need to add properties to `will-change` that are already inside an active `@keyframes`/transition — the browser already treats those as promoted while the animation runs.

## The FLIP technique (for when you actually need to animate layout)

Sometimes the *visual effect* genuinely requires a layout change — an item reordering in a list, a card expanding to fill more space, a shared element transitioning between two layouts. FLIP makes this cheap by turning a layout animation into a transform animation:

1. **First** — measure the element's starting position/size (`getBoundingClientRect()`).
2. **Last** — apply the layout change instantly (no animation) and measure the new position/size.
3. **Invert** — compute the delta between first and last, and apply a `transform` (`translate`/`scale`) that visually puts the element back at its *first* position, so nothing appears to have moved yet.
3. **Play** — remove the inverting transform with a transition, animating from the fake "first" position to the real "last" position — purely via `transform`, so it's compositor-cheap the whole way.

GSAP's `Flip` plugin (free, part of the core install now) implements this for you — reach for it instead of hand-rolling FLIP once the layout is non-trivial.

## Profiling jank

When something feels janky, don't guess — measure:

1. Chrome DevTools → **Performance** panel → record while the animation runs. Look for long tasks on the main thread and frames that take longer than ~16.6ms (shown as a red/pink marker).
2. DevTools → **Rendering** tab → enable **"Paint flashing"** to see which areas are repainting on every frame (should be minimal for a well-built animation) and **"Layer borders"** to confirm the animating element actually got its own compositor layer.
3. If the main thread is busy (JS-driven animation, scroll listeners doing work per-frame), consider moving to a CSS/native-timeline approach, or batching DOM reads and writes (read all `getBoundingClientRect()` calls first, then write all style changes — interleaving them forces "layout thrashing" from repeated forced synchronous layout).
4. `requestAnimationFrame` should be used for any hand-rolled JS animation loop instead of `setInterval`/`setTimeout`, so work is synced to the browser's actual paint cycle.

## Scroll listeners vs. native/library timelines

A raw `scroll` event handler that does per-frame math on the main thread is the most common source of scroll-jank. Prefer, in order:
1. Native CSS `animation-timeline: scroll()/view()` (see `css-patterns.md`) — runs on the compositor, no JS at all.
2. GSAP `ScrollTrigger` — still uses a scroll listener internally, but it's heavily optimized, batches DOM reads, and exposes `scrub`/`batch` to avoid per-element listeners.
3. A hand-rolled scroll listener — only as a last resort, and always throttled/batched via `requestAnimationFrame`, never doing layout reads and style writes interleaved per scroll event.
