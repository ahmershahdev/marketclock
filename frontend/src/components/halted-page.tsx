"use client";

import { useEffect } from "react";
import { ClosedPage } from "@/components/closed-page";
import { ArrowIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui";
import { errorDigest } from "@/lib/error-digest";

export function HaltedPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = errorDigest(error);

  return (
    <ClosedPage
      code="500"
      eyebrow={digest ? `Error / ${digest}` : "Error"}
      title={
        <>
          Trading <em className="text-closed">halted.</em>
        </>
      }
      lead="Something broke while this page was loading. Try again; if it keeps happening, the API may be down."
    >
      <button
        type="button"
        onClick={() => retry()}
        className="group inline-flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-[background-color,color,transform] duration-300 hover:bg-ink hover:text-paper active:scale-[0.98]"
      >
        Try again
        <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      <ButtonLink href="/" variant="ghost">
        Back home
      </ButtonLink>
    </ClosedPage>
  );
}
