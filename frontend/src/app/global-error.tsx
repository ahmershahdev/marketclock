"use client";

import { HaltedPage } from "@/components/halted-page";
import { themeScript } from "@/lib/theme";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <title>Trading halted | MarketClock</title>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <main className="flex min-h-dvh flex-col justify-center">
          <HaltedPage error={error} retry={retry} />
        </main>
      </body>
    </html>
  );
}
