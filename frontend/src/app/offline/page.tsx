import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Offline",
  description: "You are offline. MarketClock reloads by itself when the connection is back.",
  path: "/offline",
  index: false,
});

const CODES = [
  "XNYS",
  "XLON",
  "XKAR",
  "XSAU",
  "XTSE",
  "XHKG",
  "XJPX",
  "XNSE",
  "XETR",
  "XASX",
  "XSES",
  "XNAS",
];

const reloadWhenOnline = `addEventListener("online", function () { location.reload(); });`;

export default function OfflinePage() {
  return (
    <section className="container-page grid min-h-[80dvh] items-center gap-12 py-16 lg:grid-cols-12">
      <div
        className="offline-stage h-[24rem] lg:order-2 lg:col-span-6 lg:h-[32rem]"
        aria-hidden="true"
      >
        <div className="offline-ring">
          {CODES.map((code, index) => (
            <div
              key={code}
              className="offline-tile flex flex-col justify-between rounded-2xl border border-rule-strong bg-surface p-4"
              style={{ "--i": index } as CSSProperties}
            >
              <span className="flex items-center justify-between eyebrow">
                Feed
                <span className="size-2 rounded-full bg-closed" />
              </span>
              <span className="font-mono text-2xl tracking-tight">{code}</span>
              <span className="font-mono text-[10px] text-ink-3">NO SIGNAL</span>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-6">
        <p className="mb-6 flex items-center gap-3 eyebrow">
          <span className="size-2 animate-pulse-dot rounded-full bg-closed text-closed" />
          Offline
        </p>
        <h1 className="text-display text-[clamp(3.5rem,9vw,8rem)]">
          No <em className="text-closed">signal.</em>
        </h1>
        <p className="mt-8 max-w-md text-lg text-pretty text-ink-2">
          Your device is not connected, so no market can answer right now. This page reloads by
          itself when the connection is back.
        </p>
        {/* A plain link, not next/link: it must work without the app's scripts. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Try again
        </a>
      </div>
      <script dangerouslySetInnerHTML={{ __html: reloadWhenOnline }} />
    </section>
  );
}
