import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { SettlementForm } from "./settlement-form";

export const metadata: Metadata = {
  title: "Settlement calculator",
  description: "Settlement dates in trading days, for one market or across two.",
};

export default function SettlementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tools / Settlement"
        title={
          <>
            When does <em className="text-accent">it settle?</em>
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
