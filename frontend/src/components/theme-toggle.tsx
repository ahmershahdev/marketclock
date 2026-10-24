"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";
import {
  THEME_CHOICES,
  THEME_STORAGE_KEY,
  parseThemeChoice,
  resolveTheme,
  type ThemeChoice,
} from "@/lib/theme";

const CHANGE_EVENT = "marketclock:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readChoice(): ThemeChoice {
  try {
    return parseThemeChoice(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  const theme = resolveTheme(choice, matchMedia(DARK_QUERY).matches);
  document.documentElement.setAttribute("data-theme", theme);
}

function subscribe(onChange: () => void) {
  const media = matchMedia(DARK_QUERY);
  const onSystem = () => {
    if (readChoice() === "system") apply("system");
    onChange();
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("storage", onSystem);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onSystem);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const LABELS: Record<ThemeChoice, string> = { system: "System", light: "Light", dark: "Dark" };
const ICONS = { system: MonitorIcon, light: SunIcon, dark: MoonIcon };

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as const);

  function select(next: ThemeChoice, event: MouseEvent<HTMLButtonElement>) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}

    const before = document.documentElement.getAttribute("data-theme");
    const after = resolveTheme(next, matchMedia(DARK_QUERY).matches);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (before === after || reduceMotion || !document.startViewTransition) {
      apply(next);
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return;
    }

    const x = event.clientX || window.innerWidth;
    const y = event.clientY || 0;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => {
      apply(next);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 700,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-full border border-rule bg-surface/60 p-0.5"
    >
      {THEME_CHOICES.map((option) => {
        const Glyph = ICONS[option];
        const active = option === choice;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={LABELS[option]}
            title={LABELS[option]}
            onClick={(event) => select(option, event)}
            className={`grid size-7 place-items-center rounded-full transition-colors duration-300 ${
              active ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"
            }`}
          >
            <Glyph width={14} height={14} />
          </button>
        );
      })}
    </div>
  );
}
