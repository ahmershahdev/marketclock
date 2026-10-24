"use client";

import dynamic from "next/dynamic";
import { Boundary } from "@/components/boundary";

const GlobeScene = dynamic(() => import("./globe-scene"), { ssr: false });

export function Globe({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label="Globe with the world's exchange cities"
    >
      <div className="absolute inset-[8%] rounded-full glow" />
      <Boundary name="Globe">
        <GlobeScene />
      </Boundary>
    </div>
  );
}
