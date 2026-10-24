"use client";

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "shown");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () =>
      document.querySelectorAll('[data-reveal=""]').forEach((node) => observer.observe(node));
    const mutations = new MutationObserver(scan);

    scan();
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}
