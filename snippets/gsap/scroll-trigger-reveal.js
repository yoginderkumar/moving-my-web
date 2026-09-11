/**
 * Performant reveal for MANY elements using ScrollTrigger.batch — this is
 * the right tool the moment you have more than a handful of cards/rows to
 * reveal on scroll; creating one ScrollTrigger per element by hand doesn't
 * scale and re-measures the page far more than necessary.
 *
 * Usage: call setupBatchReveal('.card') once after the list renders.
 * Returns the batch's ScrollTriggers so the caller can kill them on
 * unmount/route change.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupBatchReveal(selector) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    gsap.set(selector, { opacity: 1, y: 0 });
    return [];
  }

  return ScrollTrigger.batch(selector, {
    start: 'top 85%',
    onEnter: (batch) =>
      gsap.from(batch, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true,
      }),
    // Optional: also handle elements scrolling back up past the trigger.
    // Omit onLeaveBack (leave it undefined) if you want reveals to be one-way/permanent.
    onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 30 }),
  });
}

/**
 * Cleanup — call this on unmount/route change:
 *
 *   const triggers = setupBatchReveal('.card');
 *   // later:
 *   triggers.forEach((t) => t.kill());
 */
