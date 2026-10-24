"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_LINKS } from "@/lib/nav";

function isActive(pathname: string | null, href: string) {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

function DesktopLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-0.5">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`relative block rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                active ? "bg-ink text-paper" : "text-ink-2 hover:bg-sunken hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Under Cache Components usePathname must sit inside Suspense or dynamic routes fail to build.
function ActiveDesktopLinks() {
  return <DesktopLinks pathname={usePathname()} />;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-5">
      <div
        className={`relative mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 rounded-full border pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled || open
            ? "border-rule bg-surface/80 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl"
            : "border-transparent"
        }`}
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
          aria-label="MarketClock home"
        >
          <LogoMark className="size-7 transition-transform duration-700 ease-out-expo group-hover:rotate-[360deg]" />
          <span className="font-display text-lg font-semibold tracking-[-0.03em]">MarketClock</span>
        </Link>

        <nav
          aria-label="Main"
          className="absolute left-1/2 hidden -translate-x-1/2 rounded-full border border-rule bg-surface/60 p-1 backdrop-blur-xl lg:block"
        >
          <Suspense fallback={<DesktopLinks pathname={null} />}>
            <ActiveDesktopLinks />
          </Suspense>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/markets"
            className="group hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-ink transition-transform active:scale-95 sm:inline-flex"
          >
            Open calendars
            <ArrowIcon
              width={14}
              height={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-rule bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!open}
        className="mx-auto mt-2 h-[calc(100dvh-5.5rem)] max-w-[1440px] overflow-y-auto rounded-3xl border border-rule bg-surface p-6 lg:hidden"
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((link, index) => (
            <li
              key={link.href}
              className="rise border-b border-rule"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-5"
              >
                <span className="text-display text-5xl">{link.label}</span>
                <span className="eyebrow">0{index + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
