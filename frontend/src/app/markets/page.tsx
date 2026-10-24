import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiError, ApiOffline } from "@/components/api-offline";
import Link from "next/link";
import { MarketTable } from "@/components/market-table";
import { PageHeader, Skeleton } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getMarkets } from "@/lib/api/server";
import { breadcrumbs, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Stock Exchange Holidays and Trading Hours",
  description:
    "All 30 exchanges in the holidays library: country, timezone, weekend, live status and every closure and early close by year.",
  path: "/markets",
});

async function Markets() {
  const result = await getMarkets();
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
      <JsonLd data={breadcrumbs([["Markets", "/markets"]])} />
      <PageHeader
        eyebrow="Markets"
        title={
          <>
            Every exchange, <em className="text-ink-3">one calendar each.</em>
          </>
        }
        lead="Stock exchanges and financial markets supported by the holidays library, each with its own weekend, closures and early closes."
      >
        <Link
          href="/holidays"
          className="mt-8 inline-flex rounded-full border border-rule-strong px-4 py-2 text-sm hover:border-ink"
        >
          Every market&apos;s holidays by year
        </Link>
      </PageHeader>
      <section className="container-page">
        <Suspense fallback={<MarketsSkeleton />}>
          <Markets />
        </Suspense>
      </section>
    </>
  );
}
