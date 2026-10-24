import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, marketTitle, pageMetadata } from "@/lib/seo";
import { CalendarSkeleton, MarketCalendar, marketCode } from "./market-calendar";

export async function generateMetadata({
  params,
}: PageProps<"/markets/[code]">): Promise<Metadata> {
  const code = marketCode((await params).code);
  if (!code) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    title: marketTitle(code),
    description: `Is ${code} open today? Live status, trading hours, closures and early closes, with a full calendar for every year.`,
    path: `/markets/${code}`,
  });
}

async function CurrentYear({ params }: PageProps<"/markets/[code]">) {
  const code = marketCode((await params).code);
  if (!code) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          ["Markets", "/markets"],
          [code, `/markets/${code}`],
        ])}
      />
      <MarketCalendar code={code} year={null} />
    </>
  );
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
