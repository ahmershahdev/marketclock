"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    let cancelled = false;
    api.markets().then((result) => {
      if (!cancelled && result.ok) setMarkets(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        list={`${id}-options`}
        autoComplete="off"
        spellCheck={false}
        className={`${inputClass} uppercase`}
      />
      <datalist id={`${id}-options`}>
        {markets.map((market) => (
          <option key={market.code} value={market.code}>
            {market.name}
          </option>
        ))}
      </datalist>
    </>
  );
}
