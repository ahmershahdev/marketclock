"use client";

import dynamic from "next/dynamic";
import { Boundary } from "@/components/boundary";
import { useDeferredWebGL } from "@/components/use-webgl";

const GlobeScene = dynamic(() => import("./globe-scene"), { ssr: false });

export function Globe({ className = "" }: { className?: string }) {
  const webgl = useDeferredWebGL();
  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label="Globe with the world's exchange cities"
    >
      <div className="absolute inset-[8%] rounded-full glow" />
      <div className="globe-poster absolute inset-[12%] rounded-full" />
      {webgl && (
        <div className="absolute inset-0">
          <Boundary name="Globe">
            <GlobeScene />
          </Boundary>
        </div>
      )}
    </div>
  );
}
