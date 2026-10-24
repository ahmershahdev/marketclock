"use client";

import { useState } from "react";
import { MonthGrid } from "@/components/month-grid";
import { Skeleton } from "@/components/ui";
import { useNow } from "@/lib/use-now";

const NO_CLOSURES = new Map();

const WEEKENDS = [
  { id: "sat-sun", label: "Saturday and Sunday", days: [5, 6], example: "most exchanges" },
  { id: "fri-sat", label: "Friday and Saturday", days: [4, 5], example: "Tadawul" },
] as const;

export function WeekendDemo() {
  const now = useNow();
  const [selected, setSelected] = useState<(typeof WEEKENDS)[number]["id"]>("sat-sun");
  const weekend = WEEKENDS.find((option) => option.id === selected) ?? WEEKENDS[0];
  const date = now === null ? null : new Date(now);

  return (
    <div className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="Weekend" className="flex flex-col gap-2">
          {WEEKENDS.map((option) => {
            const active = option.id === selected;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(option.id)}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors duration-300 ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-rule-strong text-ink hover:border-ink"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <span className={`eyebrow ${active ? "text-paper/60" : ""}`}>{option.example}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-ink-3">
          Illustration of the weekend only. Real closures come from the API and the library.
        </p>
      </div>
      <div className="rounded-2xl border border-rule bg-surface p-6">
        {date ? (
          <MonthGrid
            year={date.getFullYear()}
            month={date.getMonth() + 1}
            weekend={weekend.days}
            closures={NO_CLOSURES}
          />
        ) : (
          <Skeleton className="aspect-[7/6] w-full" />
        )}
      </div>
    </div>
  );
}
