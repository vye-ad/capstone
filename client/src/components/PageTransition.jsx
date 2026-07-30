import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigationDirection } from '../lib/NavigationDirectionContext.jsx';
import { useMediaQuery } from '../lib/useMediaQuery.js';

// §13: below this width, shorten the pan distance so it doesn't fight the
// browser's back-swipe gesture.
const NARROW_QUERY = '(max-width: 639px)';
const WIDE_PAN_PERCENT = 100;
const NARROW_PAN_PERCENT = 30;

// Variant functions receive the AnimatePresence `custom` value at animation
// time — this is what lets an *already-mounted, exiting* page react to a
// direction decided after it started rendering.
const variants = {
  initial: ({ isBack, narrow }) => ({
    x: `${isBack ? '-' : ''}${narrow ? NARROW_PAN_PERCENT : WIDE_PAN_PERCENT}%`,
    opacity: 0,
  }),
  animate: { x: 0, opacity: 1 },
  exit: ({ isBack, narrow }) => ({
    x: `${isBack ? '' : '-'}${narrow ? NARROW_PAN_PERCENT : WIDE_PAN_PERCENT}%`,
    opacity: 0,
  }),
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function PageTransition({ children }) {
  const location = useLocation();
  const { isBack, resetToForward } = useNavigationDirection();
  const prefersReducedMotion = useReducedMotion();
  const narrow = useMediaQuery(NARROW_QUERY);

  // Consumed for this transition — reset so the *next* navigation defaults
  // back to forward unless goBack() sets it again.
  useEffect(() => {
    resetToForward();
  }, [location.pathname, resetToForward]);

  const duration = prefersReducedMotion ? 0.1 : narrow ? 0.2 : 0.25;
  const custom = { isBack, narrow };

  return (
    <AnimatePresence mode="wait" initial={false} custom={custom}>
      <motion.div
        key={location.pathname}
        custom={custom}
        variants={prefersReducedMotion ? reducedMotionVariants : variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
