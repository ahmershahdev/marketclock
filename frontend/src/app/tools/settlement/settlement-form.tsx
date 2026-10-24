"use client";

import { useState, type FormEvent } from "react";
import { MarketCodesInput, parseCodes } from "@/components/market-codes-input";
import { Field, Panel, inputClass, submitClass } from "@/components/ui";
import { api, type ApiResult } from "@/lib/api/client";
import type { SettlementResponse } from "@/lib/api/types";
import { WEEKDAY_SHORT, isValidIsoDate, weekdayOf } from "@/lib/calendar";

const CYCLES: (number | null)[] = [null, 0, 1, 2, 3];

export function SettlementForm() {
  const [codes, setCodes] = useState("XNYS");
  const [tradeDate, setTradeDate] = useState("");
  const [cycle, setCycle] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiResult<SettlementResponse> | null>(null);

  const markets = parseCodes(codes);
  const valid = markets.length >= 1 && markets.length <= 2 && isValidIsoDate(tradeDate);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setPending(true);
    setResult(await api.settlement(markets, tradeDate, cycle));
    setPending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="lg:col-span-5">
        <form onSubmit={submit} className="flex flex-col gap-6">
          <Field label="Markets" hint="One market, or two when settlement must be open on both.">
            <MarketCodesInput
              id="settlement-markets"
              value={codes}
              onChange={setCodes}
              placeholder="XNYS, XLON"
            />
          </Field>
          <Field label="Trade date">
            <input
              type="date"
              required
              value={tradeDate}
              onChange={(event) => setTradeDate(event.target.value)}
              className={inputClass}
            />
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 eyebrow">Cycle</legend>
            <p className="-mt-1 mb-1 text-xs text-ink-3">
              Auto uses the cycle in force on the trade date, where a source is on file.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {CYCLES.map((n) => (
                <label
                  key={n ?? "default"}
                  className={`cursor-pointer rounded-xl border py-3 text-center font-mono text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                    n === cycle
                      ? "border-ink bg-ink text-paper"
                      : "border-rule-strong hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="cycle"
                    value={n ?? "default"}
                    checked={n === cycle}
                    onChange={() => setCycle(n)}
                    className="sr-only"
                  />
                  {n === null ? "Auto" : `T+${n}`}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" disabled={!valid || pending} className={submitClass}>
            {pending ? "Calculating" : "Calculate settlement date"}
          </button>
        </form>
      </Panel>

      <Panel className="flex min-h-[22rem] flex-col justify-between lg:col-span-7">
        <ResultView result={result} />
      </Panel>
    </div>
  );
}

function ResultView({ result }: { result: ApiResult<SettlementResponse> | null }) {
  if (result === null) {
    return (
      <>
        <p className="eyebrow">Settles on</p>
        <p className="text-display text-[clamp(3rem,9vw,7rem)] text-ink-3/70">YYYY-MM-DD</p>
        <p className="text-sm text-ink-3">Pick a market and a trade date.</p>
      </>
    );
  }
  if (!result.ok) {
    return (
      <>
        <p className="eyebrow text-closed">
          {result.kind === "offline" ? "API not reachable" : "Request failed"}
        </p>
        <p className="text-display text-5xl">
          {result.kind === "offline" ? "The API is not running." : result.message}
        </p>
        <p className="text-sm text-ink-3">
          {result.kind === "offline"
            ? "Start the Flask API and try again."
            : "Check the market codes and the date."}
        </p>
      </>
    );
  }
  const { data } = result;
  return (
    <>
      <p className="eyebrow">
        Settles on, T+{data.cycle} from {data.trade_date}
      </p>
      <div className="rise">
        <p className="text-display text-[clamp(3rem,9vw,7rem)] text-signal tabular">
          {data.settlement_date}
        </p>
        <p className="mt-2 font-mono text-sm text-ink-2">
          {WEEKDAY_SHORT[weekdayOf(data.settlement_date)]}, open on {data.markets.join(" and ")}
        </p>
      </div>
      <div className="space-y-2 text-sm text-ink-3">
        <p>
          {data.trade_date_is_trading_day
            ? "Counted in trading days on every market listed."
            : `${data.trade_date} is not a trading day on every market, so counting starts from the next one.`}
        </p>
        {data.default_cycles.map((found) => (
          <p key={found.market}>
            {found.market}: T+{found.days} since {found.effective_from} (
            <a
              href={found.source_url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-rule-strong underline-offset-4 hover:text-ink"
            >
              source
            </a>
            )
          </p>
        ))}
      </div>
    </>
  );
}
