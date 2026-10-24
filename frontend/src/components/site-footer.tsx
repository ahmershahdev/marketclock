import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { ZoneClock } from "@/components/live-clock";
import { Emblem } from "@/components/logo";
import { CONTACT } from "@/lib/contact";
import { NAV_LINKS } from "@/lib/nav";

const RESOURCES = [
  { href: CONTACT.github, label: "Source on GitHub" },
  { href: "https://github.com/vacanza/holidays", label: "holidays library" },
  { href: CONTACT.website, label: "ahmershah.dev" },
];

const CONTACT_LINKS = [
  { href: `mailto:${CONTACT.email}`, label: CONTACT.email },
  { href: CONTACT.linkedin, label: "LinkedIn" },
];

function ExternalLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="md:col-span-3">
      <p className="mb-5 eyebrow">{title}</p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="group inline-flex items-center gap-1.5 break-all text-ink-2 transition-colors hover:text-ink"
            >
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
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] border border-rule bg-surface">
        <div className="pointer-events-none absolute -top-1/2 left-1/2 aspect-square w-[70%] -translate-x-1/2 glow" />

        <div className="relative grid gap-12 p-8 md:grid-cols-12 md:p-12">
          <div className="flex flex-col gap-6 md:col-span-4">
            <Link href="/" aria-label="MarketClock home" className="w-48 md:w-56">
              <Emblem className="w-full transition-transform duration-700 ease-out-expo hover:scale-[1.03]" />
            </Link>
            <p className="max-w-sm text-ink-2">
              Trading days, early closes, settlement dates and market overlap for the world&apos;s
              exchanges.
            </p>
            <div className="max-w-xs">
              <ZoneClock label="UTC now" timeZone="UTC" />
            </div>
          </div>

          <nav aria-label="Footer" className="md:col-span-2">
            <p className="mb-5 eyebrow">Product</p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink-2 transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ExternalLinks title="Resources" links={RESOURCES} />
          <ExternalLinks title="Contact" links={CONTACT_LINKS} />
        </div>

        <div className="relative flex flex-col gap-3 border-t border-rule px-8 py-5 text-sm text-ink-3 md:flex-row md:items-center md:justify-between md:px-12">
          <p>MIT licensed. Holiday data from the holidays library.</p>
          <p>
            Built by{" "}
            <a href={CONTACT.website} className="text-ink-2 hover:text-ink">
              Syed Ahmer Shah
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
