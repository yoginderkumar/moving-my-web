/**
 * Scroll-linked parallax using useScroll + useTransform — multiple layers
 * moving at different rates as functions of the same scroll progress
 * value. This is the case where Motion genuinely earns its place over
 * native CSS scroll-driven animations (see references/effects-catalog.md):
 * correlating several non-linear transforms from one progress value.
 *
 * npm install motion
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

export function ParallaxHero() {
  const sectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'], // progress 0 when section enters viewport, 1 when it fully exits
  });

  // Background moves slowest, foreground fastest — the classic parallax depth cue.
  const bgY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -80]);
  const midY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -160]);
  const fgY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -260]);

  return (
    <section ref={sectionRef} className="parallax-hero">
      <motion.div className="layer layer--bg" style={{ y: bgY }} />
      <motion.div className="layer layer--mid" style={{ y: midY }} />
      <motion.div className="layer layer--fg" style={{ y: fgY }} />
    </section>
  );
}

/**
 * This animates `y` (a transform), so it's compositor-friendly — but
 * useScroll/useTransform still run their calculation per scroll event on
 * the main thread unless the browser's native ScrollTimeline is available
 * (Motion uses it automatically where supported).
 *
 * For a section that also needs to PIN in place while scrubbing, Motion
 * has no pin primitive — reach for GSAP ScrollTrigger instead
 * (snippets/gsap/pinned-scroll-section.js).
 */
