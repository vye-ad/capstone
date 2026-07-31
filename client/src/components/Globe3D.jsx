import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { loadCountryFeatures, findCountryFeature } from '../lib/countryTopology.js';

// [DEVIATION from §14] Photographic full-colour Earth, not the spec's dark
// monochrome one — an explicit, requested exception to the app's monochrome
// design; see DEVELOPMENT.md §14's deviation note. globe.gl's default
// lighting is tuned for exactly this kind of texture, so no custom `lights`
// override is needed here (unlike the dark texture this replaced, which
// needed one to be legible at all).
const ATMOSPHERE = '#87ceeb';
// Bright, saturated gold reads clearly against both the ocean blue and the
// land greens/tans in this texture — a subtler colour (e.g. the app's
// status.ongoing blue) would blend into the ocean.
const HIGHLIGHT = '#FFD700';
const TRANSPARENT = 'rgba(0,0,0,0)';

// §14: "pause the render loop when not visible" — a continuously rendering
// WebGL canvas drains battery for no reason when the tab is hidden or the
// globe has scrolled out of view.
function useVisibilityPause(globeRef, containerRef) {
  useEffect(() => {
    const globe = () => globeRef.current;

    function handleVisibilityChange() {
      if (!globe()) return;
      if (document.hidden) globe().pauseAnimation();
      else globe().resumeAnimation();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!globe()) return;
        if (entry.isIntersecting) globe().resumeAnimation();
        else globe().pauseAnimation();
      },
      { threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [globeRef, containerRef]);
}

// mode: 'rotate' (Home — auto-rotating, no highlight) or 'country'
// (Country detail — camera points at the country and highlights its border).
export default function Globe3D({ mode, country, size }) {
  const globeRef = useRef();
  const containerRef = useRef();
  const [features, setFeatures] = useState(null);

  useVisibilityPause(globeRef, containerRef);

  useEffect(() => {
    if (mode === 'country') {
      loadCountryFeatures().then(setFeatures);
    }
  }, [mode]);

  function handleGlobeReady() {
    const controls = globeRef.current?.controls();
    if (!controls) return;

    if (mode === 'rotate') {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }

    if (mode === 'country' && country) {
      globeRef.current.pointOfView({ lat: country.latitude, lng: country.longitude, altitude: 1.8 }, 1000);
    }
  }

  const highlighted = mode === 'country' && country ? findCountryFeature(features, country.cca3, country.nameEn) : null;

  return (
    <div ref={containerRef} style={{ width: size, height: size }}>
      <Globe
        ref={globeRef}
        width={size}
        height={size}
        backgroundColor={TRANSPARENT}
        globeImageUrl="/textures/earth.jpg"
        showAtmosphere={mode === 'rotate'}
        atmosphereColor={ATMOSPHERE}
        atmosphereAltitude={0.15}
        polygonsData={mode === 'country' ? features ?? [] : []}
        polygonCapColor={(f) => (f === highlighted ? HIGHLIGHT : TRANSPARENT)}
        polygonSideColor={(f) => (f === highlighted ? HIGHLIGHT : TRANSPARENT)}
        polygonAltitude={0.01}
        polygonsTransitionDuration={0}
        onGlobeReady={handleGlobeReady}
      />
    </div>
  );
}
