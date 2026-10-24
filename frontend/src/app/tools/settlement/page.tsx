import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { SettlementForm } from "./settlement-form";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Settlement Date Calculator: T+1 and T+2",
  description:
    "Work out when a trade settles, counted only on days every market is open, using the cycle in force on the trade date.",
  path: "/tools/settlement",
});

export default function SettlementPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          ["Tools", "/tools/settlement"],
          ["Settlement", "/tools/settlement"],
        ])}
      />
      <PageHeader
        eyebrow="Tools / Settlement"
        title={
          <>
            When does <em className="text-signal">it settle?</em>
          </>
        }
        lead="T+n counted in trading days. With two markets, the settlement date has to be a trading day on both."
      />
      <section className="container-page">
        <SettlementForm />
      </section>
    </>
  );
}
