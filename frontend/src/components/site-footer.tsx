import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-rule">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="mb-4 eyebrow">MarketClock</p>
          <p className="max-w-sm text-ink-2">
            Trading days, early closes, settlement dates and market overlap, built on the{" "}
            <a
              className="text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-accent"
              href="https://github.com/vacanza/holidays"
            >
              holidays
            </a>{" "}
            library.
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-3">
          <p className="mb-4 eyebrow">Product</p>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink-2 transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="mb-4 eyebrow">Source</p>
          <ul className="space-y-2 text-ink-2">
            <li>
              <a
                className="transition-colors hover:text-ink"
                href="https://github.com/vacanza/holidays"
              >
                Holiday data: holidays library (MIT)
              </a>
            </li>
            <li>
              <a className="transition-colors hover:text-ink" href="https://ahmershah.dev">
                Built by Syed Ahmer Shah
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-page overflow-hidden" aria-hidden="true">
        <p className="translate-y-[18%] text-display text-[clamp(4rem,17.5vw,16.5rem)] whitespace-nowrap text-ink/[0.07] select-none">
          MarketClock
        </p>
      </div>
    </footer>
  );
}
