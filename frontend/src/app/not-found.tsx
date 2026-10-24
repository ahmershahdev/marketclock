import type { Metadata } from "next";
import { ClosedPage } from "@/components/closed-page";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <ClosedPage
      code="404"
      eyebrow="404 / Not found"
      title={
        <>
          Market <em className="text-closed">closed.</em>
        </>
      }
      lead="There is nothing trading at this address. The market code may be wrong, or the page has moved."
    >
      <ButtonLink href="/markets">See all markets</ButtonLink>
      <ButtonLink href="/" variant="ghost">
        Back home
      </ButtonLink>
    </ClosedPage>
  );
}
