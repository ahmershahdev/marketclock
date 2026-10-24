import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { OverlapForm } from "./overlap-form";

export const metadata: Metadata = {
  title: "Market overlap",
  description: "Days when two or more markets are all open.",
};

export default function OverlapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tools / Overlap"
        title={
          <>
            When are <em className="text-accent">all of them</em> open?
          </>
        }
        lead="Days on which every market in the set is trading. Ranges include both ends and are capped at 400 days."
      />
      <section className="container-page">
        <OverlapForm />
      </section>
    </>
  );
}
