"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene"), { ssr: false });

export function ClosedScene({ text, label }: { text: string; label: string }) {
  return (
    <div className="relative size-full" role="img" aria-label={label}>
      <div className="absolute inset-[15%] rounded-full glow" />
      <Scene text={text} />
    </div>
  );
}
