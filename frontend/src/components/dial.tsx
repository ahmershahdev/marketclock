"use client";

import { useNow } from "@/lib/use-now";

const SIZE = 400;
const C = SIZE / 2;

function polar(radius: number, turn: number) {
  const angle = turn * 2 * Math.PI - Math.PI / 2;
  // Node and browsers disagree in the last float digits, which breaks hydration.
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(C + radius * Math.cos(angle)), y: round(C + radius * Math.sin(angle)) };
}

export function Dial() {
  const now = useNow();
  let dayTurn = 0;
  let minuteTurn = 0;
  if (now !== null) {
    const date = new Date(now);
    const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    dayTurn = seconds / 86400;
    minuteTurn = (date.getSeconds() + date.getMilliseconds() / 1000) / 60;
  }
  const hand = polar(C - 64, dayTurn);
  const seconds = polar(C - 10, minuteTurn);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-auto w-full text-ink"
      role="img"
      aria-label="24-hour dial showing your local time of day"
    >
      <circle cx={C} cy={C} r={C - 10} fill="none" stroke="var(--rule-strong)" />
      <circle cx={C} cy={C} r={C - 64} fill="none" stroke="var(--rule)" />
      <circle cx={C} cy={C} r={C - 120} fill="var(--surface)" stroke="var(--rule)" />

      {Array.from({ length: 96 }, (_, i) => {
        const major = i % 4 === 0;
        const outer = polar(C - 22, i / 96);
        const inner = polar(major ? C - 40 : C - 30, i / 96);
        return (
          <line
            key={i}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke={major ? "var(--ink-2)" : "var(--rule-strong)"}
            strokeWidth={major ? 1.25 : 1}
          />
        );
      })}

      {Array.from({ length: 8 }, (_, i) => {
        const hour = i * 3;
        const point = polar(C - 88, hour / 24);
        return (
          <text
            key={hour}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-ink-3 font-mono text-[11px] tracking-widest"
          >
            {String(hour).padStart(2, "0")}
          </text>
        );
      })}

      {now !== null && (
        <>
          <line
            x1={C}
            y1={C}
            x2={hand.x}
            y2={hand.y}
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx={hand.x} cy={hand.y} r="5" fill="var(--accent)" />
          <circle cx={seconds.x} cy={seconds.y} r="3.5" fill="var(--ink)" />
        </>
      )}
      <circle cx={C} cy={C} r="4" fill="var(--ink)" />
    </svg>
  );
}
