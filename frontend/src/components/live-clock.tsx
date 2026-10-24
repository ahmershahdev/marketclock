"use client";

import { useNow } from "@/lib/use-now";

function parts(epoch: number, timeZone?: string) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(epoch);
  const pick = (type: string) => formatted.find((part) => part.type === type)?.value ?? "--";
  return { hour: pick("hour"), minute: pick("minute"), second: pick("second") };
}

function offsetLabel(epoch: number, timeZone?: string) {
  const name = new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "shortOffset" })
    .formatToParts(epoch)
    .find((part) => part.type === "timeZoneName")?.value;
  return name === "GMT" ? "UTC+00:00" : (name?.replace("GMT", "UTC") ?? "");
}

export function BigClock() {
  const now = useNow();
  const time = now === null ? { hour: "--", minute: "--", second: "--" } : parts(now);
  const zone = now === null ? "" : Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 eyebrow">
        <span className="size-1.5 animate-pulse-dot rounded-full bg-accent text-accent" />
        Your time
        <span className="text-ink-2">{zone && `${zone.replaceAll("_", " ")}`}</span>
      </div>
      <p
        className="font-mono tabular text-[clamp(2.75rem,8vw,6.5rem)] leading-none font-light tracking-[-0.06em]"
        aria-live="off"
      >
        {time.hour}
        <span className="text-ink-3">:</span>
        {time.minute}
        <span className="text-ink-3">:</span>
        <span className="text-accent">{time.second}</span>
      </p>
    </div>
  );
}

export function ZoneClock({ label, timeZone }: { label: string; timeZone: string }) {
  const now = useNow();
  const time = now === null ? null : parts(now, timeZone);
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-rule py-3">
      <span className="eyebrow">{label}</span>
      <span className="font-mono tabular text-sm text-ink-2">
        {time ? `${time.hour}:${time.minute}:${time.second}` : "--:--:--"}
        <span className="ml-2 text-ink-3">{now === null ? "" : offsetLabel(now, timeZone)}</span>
      </span>
    </div>
  );
}
