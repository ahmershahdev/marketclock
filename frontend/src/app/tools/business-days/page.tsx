import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { BusinessDaysForm } from "./business-days-form";

export const metadata: Metadata = {
  title: "Business-day calculator",
  description:
    "Add or subtract trading days from a date, or count the trading days between two dates, on one or more exchanges.",
};

export default function BusinessDaysPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tools / Business days"
        title={
          <>
            Count in <em className="text-signal">trading days.</em>
          </>
        }
        lead="Move a date forward or back by trading days, or count the trading days between two dates. With several markets, only days open on all of them count."
      />
      <section className="container-page">
        <BusinessDaysForm />
      </section>
    </>
  );
}
