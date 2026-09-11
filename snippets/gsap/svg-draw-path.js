/**
 * "Draw-on" effect for an SVG path (logo mark, icon, line diagram) as it
 * scrolls into view — pure stroke-dashoffset animation, no plugin needed
 * for the simple case (GSAP's DrawSVGPlugin exists and is free now, but
 * for a single path this manual approach is simpler and dependency-free).
 *
 * Usage: call setupDrawPath('#my-svg-path') once after the SVG mounts.
 * Assumes the target is a single <path> or <line> element.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupDrawPath(selector) {
  const path = document.querySelector(selector);
  if (!path) return null;

  const length = path.getTotalLength();

  // Establish the "undrawn" starting state before anything paints.
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.set(path, { strokeDashoffset: 0 }); // show fully drawn immediately
    return null;
  }

  return gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: path,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
}
