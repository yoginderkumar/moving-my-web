/**
 * Lenis smooth-scroll synced with GSAP ScrollTrigger — the standard
 * pairing for a site that wants tunable scroll inertia (Lenis) alongside
 * pinned/scrubbed sections (ScrollTrigger). Lenis keeps REAL native scroll
 * (unlike older transform-hack smooth-scroll libraries), so it doesn't
 * break position: sticky, find-in-page, or scroll-snap — but ScrollTrigger
 * still needs to know when Lenis moves the page, or its trigger positions
 * drift out of sync.
 *
 * npm install lenis gsap
 */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lenis already respects prefers-reduced-motion internally (it forces
  // instant scroll tracking instead of lerped/eased scroll), but skipping
  // instantiation entirely when reduced motion is set is simpler and avoids
  // shipping the dependency's runtime cost for no visual benefit.
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({
    autoRaf: false, // we drive the frame loop via gsap.ticker below, not Lenis's own rAF
  });

  // Keep ScrollTrigger's cached trigger positions in sync with Lenis's
  // virtual scroll position — without this, triggers fire at the wrong
  // scroll offset because ScrollTrigger doesn't know Lenis is involved.
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis from GSAP's ticker (already synced to requestAnimationFrame)
  // instead of Lenis's own rAF loop, so both stay on the same clock.
  function raf(time) {
    lenis.raf(time * 1000); // gsap.ticker reports seconds, Lenis wants ms
  }
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0); // don't let GSAP's lag-smoothing fight Lenis's own easing

  // Call this on unmount/route change, or Lenis keeps listening after the
  // page it was set up for is gone.
  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}
