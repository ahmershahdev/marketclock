"use client";

import { useState, type FormEvent } from "react";
import { MarketCodesInput, parseCodes } from "@/components/market-codes-input";
import { Field, Panel, inputClass, submitClass } from "@/components/ui";
import { api } from "@/lib/api/client";
import { WEEKDAY_SHORT, isValidIsoDate, weekdayOf } from "@/lib/calendar";

type Mode = "add" | "count";
type Result =
  { ok: true; big: string; caption: string; note: string } | { ok: false; message: string };

const MODES = [
  ["add", "Add or subtract"],
  ["count", "Count between"],
] as const;

export function BusinessDaysForm() {
  const [mode, setMode] = useState<Mode>("add");
  const [codes, setCodes] = useState("XNYS");
  const [date, setDate] = useState("");
  const [days, setDays] = useState("5");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const markets = parseCodes(codes);
  const shift = Number(days);
  const valid =
    markets.length >= 1 &&
    (mode === "add"
      ? isValidIsoDate(date) && Number.isInteger(shift) && shift !== 0 && Math.abs(shift) <= 400
      : isValidIsoDate(start) && isValidIsoDate(end) && start <= end);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setPending(true);
    if (mode === "add") {
      const found = await api.addTradingDays(markets, date, shift);
      setResult(
        found.ok
          ? {
              ok: true,
              big: found.data.result,
              caption: `${shift > 0 ? "+" : ""}${shift} trading days from ${date}`,
              note: `${WEEKDAY_SHORT[weekdayOf(found.data.result)]}, open on ${markets.join(" and ")}`,
            }
          : {
              ok: false,
              message: found.kind === "offline" ? "The API is not running." : found.message,
            },
      );
    } else {
      const found = await api.overlap(markets, start, end);
      setResult(
        found.ok
          ? {
              ok: true,
              big: String(found.data.count),
              caption: `Trading days from ${start} to ${end}, both included`,
              note: `Open on ${markets.join(" and ")}`,
            }
          : {
              ok: false,
              message: found.kind === "offline" ? "The API is not running." : found.message,
            },
      );
    }
    setPending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="lg:col-span-5">
        <form onSubmit={submit} className="flex flex-col gap-6">
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-2 eyebrow">Calculate</legend>
            {MODES.map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border py-3 text-center text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                  mode === value
                    ? "border-ink bg-ink text-paper"
                    : "border-rule-strong hover:border-ink"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => {
                    setMode(value);
                    setResult(null);
                  }}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </fieldset>
          <Field label="Markets" hint="Only days open on every market count.">
            <MarketCodesInput
              id="business-days-markets"
              value={codes}
              onChange={setCodes}
              placeholder="XNYS, XLON"
            />
          </Field>
          {mode === "add" ? (
            <>
              <Field label="From">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Trading days" hint="Negative goes back, at most 400 either way.">
                <input
                  type="number"
                  required
                  min={-400}
                  max={400}
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <input
                  type="date"
                  required
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="End">
                <input
                  type="date"
                  required
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          )}
          <button type="submit" disabled={!valid || pending} className={submitClass}>
            {pending ? "Calculating" : "Calculate"}
          </button>
        </form>
      </Panel>

      <Panel className="flex min-h-[22rem] flex-col justify-between lg:col-span-7">
        {result === null ? (
          <>
            <p className="eyebrow">Result</p>
            <p className="text-display text-[clamp(3rem,9vw,7rem)] text-ink-3/70">
              {mode === "add" ? "YYYY-MM-DD" : "0"}
            </p>
            <p className="text-sm text-ink-3">Pick markets and dates.</p>
          </>
        ) : result.ok ? (
          <>
            <p className="eyebrow">{result.caption}</p>
            <p className="rise text-display text-[clamp(3rem,9vw,7rem)] text-signal tabular">
              {result.big}
            </p>
            <p className="font-mono text-sm text-ink-2">{result.note}</p>
          </>
        ) : (
          <>
            <p className="eyebrow text-closed">Request failed</p>
            <p className="text-display text-4xl">{result.message}</p>
            <p className="text-sm text-ink-3">Check the market codes and the dates.</p>
          </>
        )}
      </Panel>
    </div>
  );
}
