"use client";

import dynamic from "next/dynamic";
import { Boundary } from "@/components/boundary";
import { useDeferredWebGL } from "@/components/use-webgl";

const Scene = dynamic(() => import("./scene"), { ssr: false });

export function ClosedScene({ text, label }: { text: string; label: string }) {
  const webgl = useDeferredWebGL();
  return (
    <div className="relative size-full" role="img" aria-label={label}>
      <div className="absolute inset-[15%] rounded-full glow" />
      {webgl && (
        <div className="absolute inset-0">
          <Boundary name="3D scene">
            <Scene text={text} />
          </Boundary>
        </div>
      )}
    </div>
  );
}
