import type { ReactNode } from "react";
import { ClosedScene } from "@/components/closed-scene/closed-scene";

export function ClosedPage({
  code,
  eyebrow,
  title,
  lead,
  children,
}: {
  code: string;
  eyebrow: string;
  title: ReactNode;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="h-[46dvh] min-h-80 md:h-[58dvh]">
        <ClosedScene text={code} label={`${code} spelled out in closed calendar days`} />
      </div>
      <div className="relative container-page -mt-10 grid gap-10 pb-24 md:-mt-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="mb-6 rise eyebrow">{eyebrow}</p>
          <h1
            className="rise text-display text-[clamp(3.5rem,10vw,9rem)]"
            style={{ animationDelay: "80ms" }}
          >
            {title}
          </h1>
        </div>
        <div className="rise md:col-span-5" style={{ animationDelay: "160ms" }}>
          <p className="max-w-md text-lg text-pretty text-ink-2">{lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
