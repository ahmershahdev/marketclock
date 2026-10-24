import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { OverlapForm } from "./overlap-form";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Market Overlap: Days Every Market Trades",
  description:
    "Find the days on which two or more stock exchanges are all open, with each market's own weekend and holidays.",
  path: "/tools/overlap",
});

export default function OverlapPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          ["Tools", "/tools/overlap"],
          ["Overlap", "/tools/overlap"],
        ])}
      />
      <PageHeader
        eyebrow="Tools / Overlap"
        title={
          <>
            When are <em className="text-signal">all of them</em> open?
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
