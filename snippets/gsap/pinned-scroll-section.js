/**
 * Classic "scrollytelling" pattern: pin a section in place while the user
 * scrolls, and drive a timeline's progress directly off scroll position
 * (scrub) rather than time. Good for a section with layered art/copy that
 * should feel like it's reacting 1:1 to the user's scroll gesture.
 *
 * Usage: call setupPinnedSection() once after the section mounts. Requires
 * markup with a wrapping .pinned-section containing .layer-1 / .layer-2
 * (adapt names/count to the design).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupPinnedSection() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pinning + large-scale scrubbed motion is exactly the category
  // prefers-reduced-motion exists for — skip pinning entirely and let the
  // section scroll normally with content in its final state.
  if (prefersReducedMotion) {
    return null;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.pinned-section',
      start: 'top top',
      end: '+=1500', // pin persists for 1500px of additional scroll — tune to content
      pin: true,
      scrub: 1, // 1 second of smoothing between scroll input and timeline progress
      // markers: true, // uncomment while building to see start/end trigger lines
    },
  });

  tl.to('.layer-1', { xPercent: -20, ease: 'none' })
    .to('.layer-2', { xPercent: -60, ease: 'none' }, 0); // `0` = start at the same time as the tween above

  return tl.scrollTrigger; // caller can .kill() this on unmount/route change
}
