"use client";

import { useEffect, useState } from "react";

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string) => style.getPropertyValue(name).trim() || "#888888";
  return {
    dot: get("--ink-3"),
    base: get("--paper"),
    accent: get("--signal"),
    ink: get("--ink"),
    closed: get("--closed"),
  };
}

export function useThemeColors() {
  const [colors, setColors] = useState(readColors);
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return colors;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  return reduced;
}
