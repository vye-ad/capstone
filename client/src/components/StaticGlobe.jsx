// §14: static fallback for Landing/Sign In/Sign Up (mandatory, no 3D there)
// and for GlobeView's narrow-viewport / reduced-motion / no-WebGL cases.
// Reuses the same dark Earth texture as the 3D globe — cropped to a circle
// and shaded to read as a sphere rather than a flat map strip.
export default function StaticGlobe({ size = 160 }) {
  return (
    <div
      role="presentation"
      style={{
        width: size,
        height: size,
        backgroundImage: 'url(/textures/earth-dark.jpg)',
        backgroundSize: '220% 100%',
        backgroundPosition: 'center',
        boxShadow: 'inset -0.3em -0.3em 0.6em rgba(0,0,0,0.6), inset 0.2em 0.2em 0.5em rgba(255,255,255,0.06)',
      }}
      className="rounded-full bg-hairline/40"
    />
  );
}
