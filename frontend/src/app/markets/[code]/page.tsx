import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarSkeleton, MarketCalendar, marketCode } from "./market-calendar";

export async function generateMetadata({
  params,
}: PageProps<"/markets/[code]">): Promise<Metadata> {
  const code = (await params).code.toUpperCase();
  return {
    title: `${code} holidays and trading days`,
    description: `Is ${code} open today? Trading days, closures, early closes and hours for ${code}, with a calendar per year.`,
  };
}

async function CurrentYear({ params }: PageProps<"/markets/[code]">) {
  const code = marketCode((await params).code);
  if (!code) notFound();
  return <MarketCalendar code={code} year={null} />;
}

export default function MarketPage(props: PageProps<"/markets/[code]">) {
  return (
    <div className="container-page">
      <Suspense fallback={<CalendarSkeleton />}>
        <CurrentYear {...props} />
      </Suspense>
    </div>
  );
}
