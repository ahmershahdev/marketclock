"use client";

import { useEffect, useState } from "react";
import { hasHardwareWebGL, whenIdle } from "@/lib/webgl";

const LARGE_POINTER_SCREEN = "(min-width: 1024px) and (pointer: fine)";

// The 3D scenes are decoration and three.js is about 900 KB, so phones, tablets and Data Saver
// visitors keep the static fallback.
export function useDeferredWebGL(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (saveData || !matchMedia(LARGE_POINTER_SCREEN).matches) return;
    return whenIdle(() => setReady(hasHardwareWebGL()));
  }, []);
  return ready;
}
