import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { WatchlistView } from "./watchlist-view";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Upcoming closures for the markets you follow.",
};

export default function WatchlistPage() {
  return (
    <>
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
