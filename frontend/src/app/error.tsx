"use client";

import { HaltedPage } from "@/components/halted-page";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  return <HaltedPage error={error} retry={retry} />;
}
