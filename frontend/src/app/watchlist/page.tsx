import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { WatchlistView } from "./watchlist-view";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Market Holiday Watchlist",
  description:
    "Follow the exchanges you trade and see their next closures, with optional reminders. Stored only in your browser.",
  path: "/watchlist",
});

export default function WatchlistPage() {
  return (
    <>
      <JsonLd data={breadcrumbs([["Watchlist", "/watchlist"]])} />
      <PageHeader
        eyebrow="Watchlist"
        title={
          <>
            Your markets, <em className="text-ink-3">next closures first.</em>
          </>
        }
        lead="Stored in this browser only. No account, nothing sent anywhere."
      />
      <section className="container-page">
        <WatchlistView />
      </section>
    </>
  );
}
