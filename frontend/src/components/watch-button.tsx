"use client";

import { StarIcon } from "@/components/icons";
import { useWatchlist } from "@/lib/watchlist";

export function WatchButton({ code }: { code: string }) {
  const { has, toggle } = useWatchlist();
  const watching = has(code);

  return (
    <button
      type="button"
      aria-pressed={watching}
      onClick={() => toggle(code)}
      className={`inline-flex items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-medium transition-colors duration-300 ${
        watching
          ? "border-accent bg-accent text-accent-ink"
          : "border-rule-strong text-ink hover:border-ink"
      }`}
    >
      <StarIcon filled={watching} />
      {watching ? "On your watchlist" : "Add to watchlist"}
    </button>
  );
}
