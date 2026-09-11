/**
 * 3D card tilt — the pointer-tracked perspective/rotate effect used all
 * over Aceternity-style card components. No library needed: this is the
 * same technique vanilla-tilt.js uses under the hood, inlined here and
 * scoped to compositor-only transforms. See references/effects-catalog.md.
 *
 * Markup:
 *   <div class="tilt-card">
 *     <div class="tilt-card__inner">...card content...</div>
 *   </div>
 *
 * CSS:
 *   .tilt-card { perspective: 800px; }
 *   .tilt-card__inner {
 *     transform-style: preserve-3d;
 *     transition: transform 0.2s var(--ease-out-quart, ease-out);
 *   }
 *
 * Usage: call setupTiltCards('.tilt-card') once after the cards render.
 * Returns a cleanup function — call it on unmount/route change.
 */
export function setupTiltCards(selector, { maxTilt = 10, scale = 1.02 } = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return () => {}; // leave cards flat — tilt is decorative, not informational

  const cards = document.querySelectorAll(selector);
  const cleanups = [];

  cards.forEach((card) => {
    const inner = card.querySelector('.tilt-card__inner') || card;
    // Promote the layer only while it's actually being interacted with —
    // see references/performance.md on toggling will-change dynamically.
    inner.style.willChange = 'auto';

    function onPointerMove(e) {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width; // 0-1 across the card
      const relY = (e.clientY - rect.top) / rect.height;

      const rotateY = (relX - 0.5) * 2 * maxTilt; // left/right tilt
      const rotateX = (0.5 - relY) * 2 * maxTilt; // up/down tilt (inverted: top of card tilts back)

      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    }

    function onPointerEnter() {
      inner.style.willChange = 'transform';
    }

    function onPointerLeave() {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      inner.style.willChange = 'auto';
    }

    card.addEventListener('pointerenter', onPointerEnter);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerleave', onPointerLeave);

    cleanups.push(() => {
      card.removeEventListener('pointerenter', onPointerEnter);
      card.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerleave', onPointerLeave);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
