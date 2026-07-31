import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { loadCountryFeatures, findCountryFeature } from '../lib/countryTopology.js';

// globe.gl's default lighting is tuned for photographic textures. Against
// this texture's near-black ocean, the default intensity left land and
// ocean almost indistinguishable — confirmed by looking at it, not just
// reading the numbers — so this brightens things enough to read the
// continents clearly while staying within the dark, low-contrast palette
// §14 asks for (nothing here approaches a lit "daytime" look).
function useGlobeLights() {
  return useMemo(
    () => [new THREE.AmbientLight(0xffffff, 2.2), new THREE.DirectionalLight(0xffffff, 0.6)],
    []
  );
}

const INK = '#111111';
// Reuses the existing status.ongoing design token — plain ink-on-ink against
// the dark globe texture would make the highlight effectively invisible,
// and this app's colour palette already treats this blue as "the thing
// that's currently active/relevant", which fits a highlighted country.
const HIGHLIGHT = '#2F6FED';
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
  const lights = useGlobeLights();

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
        globeImageUrl="/textures/earth-dark.jpg"
        lights={lights}
        showAtmosphere={mode === 'rotate'}
        atmosphereColor={INK}
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
