"use client";

import { useState, type FormEvent } from "react";
import { MarketCodesInput, parseCodes } from "@/components/market-codes-input";
import { Field, Panel, inputClass, submitClass } from "@/components/ui";
import { api, type ApiResult } from "@/lib/api/client";
import type { OverlapResponse } from "@/lib/api/types";
import { MONTH_NAMES, isValidIsoDate } from "@/lib/calendar";

const MAX_RANGE_DAYS = 400;

function spanDays(start: string, end: string): number {
  return (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000 + 1;
}

export function OverlapForm() {
  const [codes, setCodes] = useState("XNYS, XLON");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult<OverlapResponse> | null>(null);

  const markets = parseCodes(codes);
  const datesValid = isValidIsoDate(start) && isValidIsoDate(end);
  const span = datesValid ? spanDays(start, end) : 0;
  const problem =
    markets.length < 2
      ? "Add at least two markets."
      : datesValid && span < 1
        ? "The end date is before the start date."
        : span > MAX_RANGE_DAYS
          ? `Ranges are capped at ${MAX_RANGE_DAYS} days.`
          : null;
  const valid = datesValid && problem === null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setPending(true);
    setResult(await api.overlap(markets, start, end));
    setPending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="lg:col-span-5">
        <form onSubmit={submit} className="flex flex-col gap-6">
          <Field label="Markets" hint="Two or more codes, separated by commas.">
            <MarketCodesInput
              id="overlap-markets"
              value={codes}
              onChange={setCodes}
              placeholder="XNYS, XLON, XTKS"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="From">
              <input
                type="date"
                required
                value={start}
                onChange={(event) => setStart(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="To">
              <input
                type="date"
                required
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <p className="min-h-5 text-sm text-ink-3" aria-live="polite">
            {problem ?? (datesValid ? `${span} days, both ends included.` : "")}
          </p>
          <button type="submit" disabled={!valid || pending} className={submitClass}>
            {pending ? "Comparing" : "Find shared trading days"}
          </button>
        </form>
      </Panel>

      <Panel className="min-h-[22rem] lg:col-span-7">
        <ResultView result={result} />
      </Panel>
    </div>
  );
}

function ResultView({ result }: { result: ApiResult<OverlapResponse> | null }) {
  if (result === null) {
    return (
      <div className="flex h-full flex-col justify-between gap-8">
        <p className="eyebrow">Shared trading days</p>
        <p className="text-display text-[clamp(4rem,12vw,9rem)] text-ink-3/50">00</p>
        <p className="text-sm text-ink-3">Choose markets and a date range.</p>
      </div>
    );
  }
  if (!result.ok) {
    return (
      <div className="flex h-full flex-col justify-between gap-8">
        <p className="eyebrow text-closed">
          {result.kind === "offline" ? "API not reachable" : "Request failed"}
        </p>
        <p className="text-display text-5xl">
          {result.kind === "offline" ? "The API is not running." : result.message}
        </p>
        <p className="text-sm text-ink-3">
          {result.kind === "offline" ? "Start the Flask API and try again." : "Check the inputs."}
        </p>
      </div>
    );
  }

  const byMonth = new Map<string, string[]>();
  for (const day of result.data.days) {
    const key = day.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), day]);
  }

  return (
    <div className="flex rise flex-col gap-8">
      <div>
        <p className="eyebrow">Shared trading days, {result.data.markets.join(" / ")}</p>
        <p className="mt-2 text-display text-[clamp(4rem,12vw,9rem)] text-signal tabular">
          {result.data.days.length}
        </p>
      </div>
      <div className="flex max-h-[28rem] flex-col gap-6 overflow-y-auto pr-2">
        {[...byMonth].map(([month, days]) => (
          <div key={month}>
            <p className="mb-2 eyebrow">
              {MONTH_NAMES[Number(month.slice(5)) - 1]} {month.slice(0, 4)}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {days.map((day) => (
                <li key={day}>
                  <time
                    dateTime={day}
                    className="grid size-9 place-items-center rounded-md bg-sunken font-mono text-xs tabular"
                  >
                    {Number(day.slice(8))}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
