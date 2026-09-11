/**
 * Coordinated hero-entrance timeline: eyebrow -> headline -> subhead -> CTA -> art,
 * each overlapping the previous rather than waiting for it to finish.
 *
 * Usage: call setupHeroEntrance() once after the hero section mounts.
 * Requires markup with these classes present inside your hero section:
 *   .hero-eyebrow, .hero-headline, .hero-subhead, .hero-cta, .hero-art
 */
import gsap from 'gsap';

export function setupHeroEntrance() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Jump straight to the end state — no motion, but no broken/hidden content either.
    gsap.set(['.hero-eyebrow', '.hero-headline', '.hero-subhead', '.hero-cta', '.hero-art'], {
      opacity: 1,
      y: 0,
      scale: 1,
    });
    return null;
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.7 } });

  tl.from('.hero-eyebrow', { opacity: 0, y: 16 })
    .from('.hero-headline', { opacity: 0, y: 24 }, '-=0.5') // starts before eyebrow finishes
    .from('.hero-subhead', { opacity: 0, y: 16 }, '-=0.45')
    .from('.hero-cta', { opacity: 0, y: 12, duration: 0.5 }, '-=0.3')
    .from('.hero-art', { opacity: 0, scale: 0.96 }, '-=0.6');

  return tl; // caller can .kill() this on unmount if the hero can be removed while playing
}
