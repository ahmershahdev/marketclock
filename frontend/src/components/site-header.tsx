"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_LINKS } from "@/lib/nav";

function DesktopLinks({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) =>
    pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
  return (
    <ul className="flex items-center gap-1">
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              isActive(link.href) ? "bg-sunken text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color] duration-500 ${
        scrolled || open ? "border-rule bg-paper/75 backdrop-blur-xl" : "border-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
          aria-label="MarketClock home"
        >
          <LogoMark className="size-6 transition-transform duration-700 ease-out-expo group-hover:rotate-[360deg]" />
          <span className="text-[15px] font-semibold tracking-tight">MarketClock</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <Suspense fallback={<DesktopLinks pathname={null} />}>
            <ActiveDesktopLinks />
          </Suspense>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-rule md:hidden"
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
        className="container-page h-[calc(100dvh-4rem)] overflow-y-auto pt-8 pb-12 md:hidden"
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
