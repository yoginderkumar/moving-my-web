/**
 * Shared-element ("magic motion") transition via layoutId — Motion's one
 * genuinely unique capability, see references/motion-patterns.md. A card
 * in a grid morphs into an expanded detail view using the same layoutId;
 * Motion computes the FLIP-style transform automatically, no manual
 * getBoundingClientRect math.
 *
 * npm install motion
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function ExpandableGrid({ items }) {
  const [activeId, setActiveId] = useState(null);
  const active = items.find((item) => item.id === activeId);

  return (
    <>
      <ul className="grid">
        {items.map((item) => (
          <motion.li
            key={item.id}
            layoutId={`card-${item.id}`}
            onClick={() => setActiveId(item.id)}
            className="card"
          >
            <motion.h3 layoutId={`title-${item.id}`}>{item.title}</motion.h3>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div className="overlay" onClick={() => setActiveId(null)}>
            <motion.div layoutId={`card-${active.id}`} className="card card--expanded">
              <motion.h3 layoutId={`title-${active.id}`}>{active.title}</motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15 }} // let the shared-element morph mostly finish before body text appears
              >
                {active.body}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Reduced motion: Motion's own MotionConfig handles this app-wide — wrap
 * the app root once:
 *
 *   <MotionConfig reducedMotion="user">
 *     <App />
 *   </MotionConfig>
 *
 * which automatically disables layout/transform animation (including this
 * layoutId morph) for users with prefers-reduced-motion set, while keeping
 * the opacity cross-fade on the body text — no per-component branching needed.
 */
