import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { BusinessDaysForm } from "./business-days-form";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Business Day Calculator for Stock Markets",
  description:
    "Add or subtract trading days from a date, or count the trading days between two dates, on one or more exchanges.",
  path: "/tools/business-days",
});

export default function BusinessDaysPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          ["Tools", "/tools/business-days"],
          ["Business days", "/tools/business-days"],
        ])}
      />
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
