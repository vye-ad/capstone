import { lazy, Suspense, useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { isWebGLAvailable } from '../lib/webgl.js';
import GlobeErrorBoundary from './GlobeErrorBoundary.jsx';
import StaticGlobe from './StaticGlobe.jsx';

// §14: "Static PNG as fallback, not placeholder" for viewport below md,
// prefers-reduced-motion, or no WebGL. The check happens *before* the
// dynamic import below, so none of those cases ever fetches the 3D chunk.
const NARROW_QUERY = '(max-width: 639px)';

// §14 mandatory mitigation #1: a separate chunk that never enters the
// initial bundle. Only requested when a page actually renders in 3D mode.
const Globe3D = lazy(() => import('./Globe3D.jsx'));

// mode: 'rotate' (Home) or 'country' (Country detail — needs `country`).
export default function GlobeView({ mode, country, size = 96 }) {
  const prefersReducedMotion = useReducedMotion();
  const narrow = useMediaQuery(NARROW_QUERY);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setWebglOk(isWebGLAvailable());
  }, []);

  const useFallback = narrow || prefersReducedMotion || !webglOk;

  if (useFallback) return <StaticGlobe size={size} />;

  return (
    <GlobeErrorBoundary fallback={<StaticGlobe size={size} />}>
      <Suspense fallback={<StaticGlobe size={size} />}>
        <Globe3D mode={mode} country={country} size={size} />
      </Suspense>
    </GlobeErrorBoundary>
  );
}
