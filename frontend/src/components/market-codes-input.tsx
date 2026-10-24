"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Flag } from "@/components/flag";
import { inputClass } from "@/components/ui";
import { api } from "@/lib/api/client";
import type { Market } from "@/lib/api/types";

export function parseCodes(value: string): string[] {
  return [
    ...new Set(
      value
        .toUpperCase()
        .split(/[\s,]+/)
        .filter(Boolean),
    ),
  ];
}

export function lastToken(value: string): string {
  return value.split(/[\s,]+/).at(-1) ?? "";
}

export function completeCode(value: string, code: string): string {
  const head = value.slice(0, value.length - lastToken(value).length);
  return `${head}${code}, `;
}

export function matchMarkets(markets: Market[], value: string, limit = 8): Market[] {
  const query = lastToken(value).toLowerCase();
  const chosen = new Set(parseCodes(value));
  return markets
    .filter((market) => !chosen.has(market.code) || market.code.toLowerCase() === query)
    .filter((market) =>
      [market.code, market.name, market.country].some((field) =>
        field.toLowerCase().includes(query),
      ),
    )
    .slice(0, limit);
}

export function MarketCodesInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.markets().then((result) => {
      if (!cancelled && result.ok) setMarkets(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = open ? matchMarkets(markets, value) : [];
  const listId = `${id}-options`;
  const current = Math.min(active, options.length - 1);

  function choose(market: Market) {
    onChange(completeCode(value, market.code));
    setActive(0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + options.length) % Math.max(options.length, 1));
    } else if (event.key === "Enter" && open && options[current]) {
      event.preventDefault();
      choose(options[current]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={options.length > 0 ? `${listId}-${current}` : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={`${inputClass} uppercase`}
      />
      <ul
        id={listId}
        role="listbox"
        hidden={options.length === 0}
        className="absolute inset-x-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-rule-strong bg-surface p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)]"
      >
        {options.map((market, index) => (
          <li
            key={market.code}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === current}
            // mousedown, not click: click fires after the input's blur has closed the list.
            onMouseDown={(event) => {
              event.preventDefault();
              choose(market);
            }}
            onMouseEnter={() => setActive(index)}
            className={`flex cursor-pointer items-baseline gap-3 rounded-xl px-3 py-2.5 ${
              index === current ? "bg-sunken text-ink" : "text-ink-2"
            }`}
          >
            <Flag code={market.country_code} className="w-5 self-center" />
            <span className="w-12 font-mono text-sm text-ink">{market.code}</span>
            <span className="flex-1 truncate">{market.name}</span>
            <span className="eyebrow">{market.country}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
