/**
 * The React-safe way to use GSAP: @gsap/react's useGSAP hook.
 *
 * Why this matters: a plain useEffect calling gsap.from(...)/ScrollTrigger
 * is the #1 source of "animation plays twice" / "ScrollTrigger duplicates
 * on re-render" / "animation keeps running after navigating away" bugs.
 * useGSAP scopes selector-based animations to a ref (so `.card` only
 * matches inside this component, not the whole document) and automatically
 * reverts everything — including killing ScrollTriggers — on unmount or
 * when its dependency array changes. This is what prevents the class of
 * bug that React 18 Strict Mode's double-invoked effects are specifically
 * designed to surface in development.
 *
 * npm install @gsap/react
 */
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HeroSection() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      // Selectors here are automatically scoped to containerRef's subtree.
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set(['.hero-headline', '.hero-cta'], { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.7 } });
      tl.from('.hero-headline', { opacity: 0, y: 24 }).from(
        '.hero-cta',
        { opacity: 0, y: 12 },
        '-=0.4'
      );

      // Anything created inside this callback (timelines, ScrollTriggers,
      // tweens) is automatically reverted/killed when the component
      // unmounts or `dependencies` changes — no manual cleanup needed.
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <section ref={containerRef} className="hero">
      <h1 className="hero-headline">Ship faster, feel it in every pixel.</h1>
      <button className="hero-cta">Get started</button>
    </section>
  );
}

/**
 * If you're not able to add @gsap/react as a dependency, the manual
 * equivalent is:
 *
 *   useEffect(() => {
 *     const ctx = gsap.context(() => {
 *       gsap.from('.hero-headline', { opacity: 0, y: 24 });
 *     }, containerRef);
 *     return () => ctx.revert(); // kills everything created inside, incl. ScrollTriggers
 *   }, []);
 *
 * The useGSAP hook is preferred when available — it also handles a few
 * React 18 concurrent-rendering edge cases gsap.context alone doesn't.
 */
