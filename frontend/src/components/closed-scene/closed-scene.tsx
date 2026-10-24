"use client";

import dynamic from "next/dynamic";
import { Boundary } from "@/components/boundary";

const Scene = dynamic(() => import("./scene"), { ssr: false });

export function ClosedScene({ text, label }: { text: string; label: string }) {
  return (
    <div className="relative size-full" role="img" aria-label={label}>
      <div className="absolute inset-[15%] rounded-full glow" />
      <Boundary name="3D scene">
        <Scene text={text} />
      </Boundary>
    </div>
  );
}
