const SOFTWARE_RENDERERS = /swiftshader|llvmpipe|softpipe|software|basic render driver/i;

// WebGL drawn on the CPU (no GPU, many VMs, headless audits) blocks the main thread every frame.
export function hasHardwareWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !SOFTWARE_RENDERERS.test(renderer);
  } catch {
    return false;
  }
}

export function whenIdle(callback: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 1200);
  return () => clearTimeout(id);
}
