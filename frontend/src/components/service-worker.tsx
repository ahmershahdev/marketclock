"use client";

import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    // In development a worker would cache stale chunks between edits.
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  }, []);
  return null;
}
