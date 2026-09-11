# CSS animation patterns

## Custom easing cheat sheet

Never leave a meaningful animation on the default `ease`/`linear` — define these once (see `snippets/css/easing-tokens.css`) and reuse:

| Name | `cubic-bezier` | Use for |
|---|---|---|
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | General entrances |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Snappy entrances, the "premium" default |
| `--ease-in-quart` | `cubic-bezier(0.5, 0, 0.75, 0)` | General exits |
| `--ease-in-out-circ` | `cubic-bezier(0.85, 0, 0.15, 1)` | Modals, things that open then settle |
| `--ease-overshoot` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful confirmations (use sparingly) |

## `@keyframes` and `transition` basics, done well

```css
/* Prefer transition for simple two-state changes (hover, toggle) */
.card {
  transform: translateY(0) scale(1);
  transition: transform 0.25s var(--ease-out-quart);
}
.card:hover {
  transform: translateY(-4px) scale(1.02);
}

/* Prefer @keyframes for anything with more than 2 states or that runs on its own */
@keyframes rise-in {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal {
  animation: rise-in 0.5s var(--ease-out-expo) both; /* `both` fill-mode: holds start state before it plays, end state after */
}
```

Always set a fill-mode (`forwards` or `both`) on entrance animations that start from a non-default state (like `opacity: 0`) — without it, the element snaps back to its natural state the instant the animation ends, or (with scroll timelines) shows the wrong state before the animation range begins.

## Native scroll-driven animations

Two timeline types:

- **`scroll()`** — progress tied to a scroll container's scroll position (0% = scrolled to top, 100% = scrolled to bottom). Good for progress bars, sticky-section backgrounds.
- **`view()`** — progress tied to how far an *individual element* has traveled through its scroll container's viewport. This is what you want for "fade/rise this card in as it scrolls into view" — the far more common case.

```css
@keyframes rise-in {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@supports (animation-timeline: view()) {
  .reveal {
    animation: rise-in 0.6s var(--ease-out-expo) both;
    animation-timeline: view();
    /* animation-range controls WHEN in the element's journey through the viewport
       the animation plays. Default is `cover` (the whole entry-to-exit journey). */
    animation-range: entry 0% cover 40%;
  }
}

/* Fallback for browsers without support (currently Firefox, unless flagged on):
   ship a JS IntersectionObserver that adds a class to trigger the same @keyframes,
   or simply let content render in its final state with no animation. Never leave
   content invisible with no fallback path. */
```

`animation-range` keywords: `cover` (full entry→exit journey, default), `contain` (only while fully inside the viewport), `entry`/`entry-crossing`, `exit`/`exit-crossing`. Combine a start and end (`entry 0% cover 40%` above means: start as the element starts entering, finish 40% of the way through its full journey) to control exactly how "early" or "late" the animation resolves relative to scroll position.

For animating one element based on a *different* element's scroll position (e.g., a progress bar in a fixed header tracking scroll through an article below it), name a timeline on the shared scroller and reference it:

```css
article {
  timeline-scope: --article-progress;
  scroll-timeline: --article-progress;
}
.progress-bar {
  animation: fill-bar linear;
  animation-timeline: --article-progress;
}
```

## Stagger without JS

CSS can stagger a list purely with `nth-child` + a custom property (see `snippets/css/stagger-children.css` for the full version):

```css
.item {
  animation: rise-in 0.5s var(--ease-out-expo) both;
  animation-delay: calc(var(--i) * 60ms);
}
```
Set `--i` per item inline (`style="--i: 0"`, `--i: 1"`...) or via a small loop if the list is server-rendered/static — no JS animation logic needed, just index assignment.
