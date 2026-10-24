import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "@/components/icons";

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="container-page pt-16 pb-12 md:pt-24 md:pb-16">
      <p className="mb-6 rise eyebrow">{eyebrow}</p>
      <h1
        className="max-w-5xl rise text-display text-[clamp(3rem,8vw,7.5rem)]"
        style={{ animationDelay: "80ms" }}
      >
        {title}
      </h1>
      {lead && (
        <p
          className="mt-8 max-w-2xl rise text-lg text-pretty text-ink-2"
          style={{ animationDelay: "160ms" }}
        >
          {lead}
        </p>
      )}
      {children}
    </header>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium transition-[background-color,color,border-color,transform] duration-300 active:scale-[0.98] ${
        variant === "solid"
          ? "bg-accent text-accent-ink hover:bg-ink hover:text-paper"
          : "border border-rule-strong text-ink hover:border-ink"
      }`}
    >
      {children}
      <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-rule bg-surface p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-rule-strong bg-paper px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-3 transition-colors focus:border-ink focus:outline-none";

export const submitClass =
  "inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-[background-color,color,transform] duration-300 hover:bg-accent hover:text-accent-ink active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-sunken ${className}`} />;
}
