// §14: "Static PNG as fallback... when WebGL is unavailable." Some low-end
// Android browsers and locked-down environments disable WebGL entirely.
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}
