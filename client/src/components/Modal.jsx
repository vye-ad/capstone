import { useEffect, useState } from 'react';

// §10.8/§13: scale + fade from centre, never a page-style pan. This is a
// small self-contained CSS transition, not the route-transition system
// (motion/AnimatePresence) reserved for week 4.
export default function Modal({ children, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded border border-hairline bg-paper p-6 transition-all duration-200 motion-reduce:transition-none ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
