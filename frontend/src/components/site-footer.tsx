import Link from "next/link";
import { ArrowIcon, ArrowUpRightIcon } from "@/components/icons";
import { ZoneClock } from "@/components/live-clock";
import { Emblem } from "@/components/logo";
import { CONTACT } from "@/lib/contact";

const GROUPS = [
  {
    title: "Markets",
    links: [
      { href: "/markets", label: "All markets" },
      { href: "/holidays", label: "Holidays by year" },
      { href: "/watchlist", label: "Watchlist" },
      { href: "/data-quality", label: "Data quality" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/tools/settlement", label: "Settlement" },
      { href: "/tools/overlap", label: "Overlap" },
      { href: "/tools/business-days", label: "Business days" },
      { href: "/developers", label: "API" },
    ],
  },
];

const EXTERNAL = [
  {
    title: "Resources",
    links: [
      { href: CONTACT.github, label: "Source on GitHub" },
      { href: "https://github.com/vacanza/holidays", label: "holidays library" },
      { href: CONTACT.website, label: "ahmershah.dev" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: `mailto:${CONTACT.email}`, label: CONTACT.email },
      { href: CONTACT.linkedin, label: "LinkedIn" },
    ],
  },
];

const linkClass =
  "group inline-flex items-center gap-1.5 text-ink-2 transition-[color,translate] hover:translate-x-0.5 hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="mt-32 px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] border border-rule bg-surface">
        <div className="pointer-events-none absolute -top-1/3 right-0 aspect-square w-[60%] glow" />

        <div className="relative flex flex-col gap-8 border-b border-rule p-8 md:flex-row md:items-end md:justify-between md:p-12">
          <div>
            <p className="mb-4 eyebrow">Open every day you need it</p>
            <p className="max-w-2xl text-display text-[clamp(2.25rem,5vw,4rem)] text-balance">
              Every trading day. <span className="text-signal">Every settlement date.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/markets"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Open calendars
              <ArrowIcon className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/developers"
              className="inline-flex items-center gap-2 rounded-full border border-rule-strong px-5 py-3 text-sm transition-colors hover:border-ink"
            >
              Read the API
            </Link>
          </div>
        </div>

        <div className="relative grid gap-12 p-8 sm:grid-cols-2 md:p-12 lg:grid-cols-12">
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-4">
              <Link href="/" aria-label="MarketClock home" className="w-20 shrink-0">
                <Emblem className="w-full transition-transform duration-700 ease-out-expo hover:scale-105" />
              </Link>
              <p className="max-w-xs text-sm text-ink-2">
                Trading days, early closes and settlement dates for 30 exchanges, every fact linked
                to its source.
              </p>
            </div>
            <div className="max-w-xs rounded-2xl border border-rule bg-paper/60 p-4">
              <ZoneClock label="UTC now" timeZone="UTC" />
            </div>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title} className="lg:col-span-2">
              <p className="mb-5 eyebrow">{group.title}</p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {EXTERNAL.map((group) => (
            <div
              key={group.title}
              className={group.title === "Contact" ? "lg:col-span-3" : "lg:col-span-2"}
            >
              <p className="mb-5 eyebrow">{group.title}</p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={`${linkClass} [overflow-wrap:anywhere]`}>
                      {link.label}
                      <ArrowUpRightIcon
                        width={12}
                        height={12}
                        className="shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <svg
          viewBox="0 0 1000 150"
          aria-hidden="true"
          className="pointer-events-none relative -mb-[2%] block w-full select-none"
        >
          <text
            x="50%"
            y="118"
            textAnchor="middle"
            textLength="960"
            lengthAdjust="spacingAndGlyphs"
            fill="none"
            stroke="var(--rule-strong)"
            strokeWidth="1"
            style={{ fontFamily: "var(--font-bricolage)", fontWeight: 800, fontSize: 150 }}
          >
            MarketClock
          </text>
        </svg>

        <div className="relative flex flex-col gap-3 border-t border-rule px-8 py-5 text-sm text-ink-3 md:flex-row md:items-center md:justify-between md:px-12">
          <p>MIT licensed. Holiday data from the holidays library.</p>
          <p>
            Built by{" "}
            <a href={CONTACT.website} className="text-ink-2 transition-colors hover:text-ink">
              Syed Ahmer Shah
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
