import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiError, ApiOffline } from "@/components/api-offline";
import { MarketTable } from "@/components/market-table";
import { PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Every exchange and financial market covered by MarketClock and the holidays library.",
};

async function Markets() {
  const result = await api.markets();
  if (!result.ok) {
    return result.kind === "offline" ? (
      <ApiOffline what="The list of markets" />
    ) : (
      <ApiError message={result.message} />
    );
  }
  return <MarketTable markets={result.data} />;
}

function MarketsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-12 max-w-sm" />
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}

export default function MarketsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Markets"
        title={
          <>
            Every exchange, <em className="text-ink-3">one calendar each.</em>
          </>
        }
        lead="Stock exchanges and financial markets supported by the holidays library, each with its own weekend, closures and early closes."
      />
      <section className="container-page">
        <Suspense fallback={<MarketsSkeleton />}>
          <Markets />
        </Suspense>
      </section>
    </>
  );
}
