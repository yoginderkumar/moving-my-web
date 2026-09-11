# Motion design principles

## Why animate at all

Every animation should do at least one of these jobs. If it's not doing one, cut it:

- **Feedback** — confirms an action happened (button press, item added, form submitted).
- **Hierarchy / attention** — tells the eye what matters and in what order (hero headline before subhead before CTA).
- **Spatial continuity** — helps the user keep a mental model of where things went (a card expanding into a detail view, a menu sliding in from where it lives).
- **Delight / brand** — a small amount of personality on things the user will see often (a logo mark, a hover state) or once at a moment that matters (a hero, a success state). This is the one that's easiest to overdose on.

Decorative motion that does none of these — background blobs drifting for no reason, everything fading in one at a time when nothing about the order matters — is what makes a page feel busy rather than crafted.

## Easing

The default browser `ease` and `linear` read as generic because everything uses them. Real motion accelerates and decelerates the way physical things do, and different situations call for different curves:

- **Entrances (things appearing/arriving): ease-out.** Fast start, gentle settle — `cubic-bezier(0.16, 1, 0.3, 1)` ("ease-out-expo" family) or `cubic-bezier(0.22, 1, 0.36, 1)`. Feels responsive because it gets moving immediately.
- **Exits (things leaving/dismissing): ease-in.** Slow start, fast finish — the mirror of the above. Things that are leaving shouldn't linger.
- **Both directions in one move (a modal opening then settling, a card flipping): ease-in-out.** `cubic-bezier(0.65, 0, 0.35, 1)` is a good general-purpose one.
- **Playful/bouncy brand moments (a like button, a mascot, a toast): overshoot easing** — a curve with a y-value above 1 like `cubic-bezier(0.34, 1.56, 0.64, 1)`, or a spring if the library supports it (GSAP's `elastic`/`back` eases, Motion's `type: "spring"`). Use sparingly — overshoot on every element reads as cartoonish.

Named tokens for these are in `snippets/css/easing-tokens.css` — define the set once per project rather than hand-writing bezier curves inline everywhere.

## Timing

Duration should scale with *distance and purpose*, not be a single global number:

- **Micro-interactions** (hover, focus, toggle, button press): 100–250ms. Longer than this feels laggy, not premium.
- **Section/element reveals** (a card fading up into view, a modal opening): 300–600ms.
- **Hero / first-impression choreography** (the sequence when a landing page first loads): 600ms–2.5s *total* across the whole sequence, but each individual element within it should still be fast (300–500ms) — the length comes from staggering multiple fast movements, not from any one element moving slowly.
- **Page/route transitions**: 200–500ms. Users are waiting on this to see content — don't make them wait on a flourish.

A common beginner mistake is making everything the same duration. Vary it slightly by element size/distance/importance and the whole thing reads as more deliberate.

## Choreography and stagger

A single element animating alone reads as an event. Multiple elements animating with a *slight, consistent offset* reads as choreography — this is most of what makes hero sections and list reveals feel high-end.

- Typical stagger between siblings: **40–100ms**. Too tight (under 30ms) and it looks like a single event with a glitch; too loose (over 150ms) and it looks slow/laggy for anything more than ~5 items.
- **Overlap, don't wait.** The second element in a sequence should usually start before the first has fully finished, not strictly after. This is what makes GSAP timelines (which support negative offsets like `"-=0.3"`) feel smoother than naively chained CSS `animation-delay`s.
- **Order matters and should follow reading order or visual hierarchy** — headline, then supporting text, then CTA, then imagery, or top-to-bottom/left-to-right for grids. Randomizing order for its own sake usually just looks buggy.

## Borrowed animation principles that actually matter for UI

Out of Disney's twelve classic animation principles, the ones with real UI payoff:

- **Anticipation** — a tiny counter-movement before the real movement (a button that compresses slightly before it "launches" something) makes motion feel physical rather than mechanical. Use very subtly in UI — a few pixels/a few percent scale, not a cartoon wind-up.
- **Follow-through / overshoot** — an element slightly overshoots its resting position and settles back (the overshoot easing above). Great for things confirming a completed action.
- **Ease in/ease out** — covered above; this is the single highest-leverage principle for UI.
- **Staging** — only one thing should be the focal point of a given moment; don't animate the whole page at once with equal weight, or nothing reads as important.

## Hierarchy in practice

When a section has multiple animating elements, decide *before* writing code which element the eye should land on first, and make everything else support that: it should start first and/or be the most prominent movement, and secondary elements should be quieter (smaller movement distance, more subtle easing, later in the stagger).
