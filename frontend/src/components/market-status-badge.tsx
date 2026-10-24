"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { MarketStatus } from "@/lib/api/types";
import { TONE_CLASS, TONE_DOT, statusLabel } from "@/lib/market-status";

export function MarketStatusBadge({ code }: { code: string }) {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api.status(code).then((result) => {
        if (!cancelled && result.ok) {
          setStatus(result.data);
          setNow(Date.now());
        }
      });
    load();
    const refresh = setInterval(load, 60_000);
    const tick = setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, [code]);

  if (!status) return <span className="inline-block h-8 w-56" aria-hidden="true" />;
  const label = statusLabel(status, now);
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs ${TONE_CLASS[label.tone]}`}
    >
      <span className={`size-1.5 rounded-full ${TONE_DOT[label.tone]}`} />
      {label.text}
    </span>
  );
}
