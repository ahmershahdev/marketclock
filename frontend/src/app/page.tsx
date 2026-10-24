import Link from "next/link";
import { Dial } from "@/components/dial";
import { WeekendDemo } from "@/components/home/weekend-demo";
import { ArrowUpRightIcon } from "@/components/icons";
import { BigClock, ZoneClock } from "@/components/live-clock";
import { ButtonLink } from "@/components/ui";

const ENDPOINTS = [
  "markets",
  "holidays",
  "is-trading-day",
  "next-trading-day",
  "previous-trading-day",
  "trading-days",
  "settlement",
  "overlap",
];

const QUESTIONS = [
  {
    title: "Is it open today?",
    body: "Trading days for each market, using its own weekend and the closures in the holidays library.",
    tag: "is-trading-day",
  },
  {
    title: "Does it close early?",
    body: "Half-day sessions from the library's HALF_DAY category, with the local closing time.",
    tag: "holidays",
  },
  {
    title: "When does it settle?",
    body: "T+n counted in trading days, on one market or across two, where settlement must be open on both.",
    tag: "settlement",
  },
  {
    title: "When are both open?",
    body: "Days on which every market in a set is trading, for cross-listed orders and FX.",
    tag: "overlap",
  },
];

const SETTLEMENT_STRIP = [
  { day: "Thu", label: "T", kind: "trade" },
  { day: "Fri", label: "T+1", kind: "count" },
  { day: "Sat", label: "skip", kind: "skip" },
  { day: "Sun", label: "skip", kind: "skip" },
  { day: "Mon", label: "T+2", kind: "settle" },
] as const;

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 container-page grid grid-cols-4 md:grid-cols-12"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`border-l border-rule ${i >= 4 ? "hidden md:block" : ""} ${i === 11 ? "border-r" : ""}`}
            />
          ))}
        </div>

        <div className="relative container-page pt-14 pb-20 md:pt-24 md:pb-28">
          <p className="mb-8 flex rise items-center gap-3 eyebrow">
            <span className="h-px w-8 bg-ink-3" />
            Exchange calendars for desks and back offices
          </p>
          <h1 className="text-display text-[clamp(3.6rem,12.5vw,12.5rem)]">
            <span className="block rise">Every trading day,</span>
            <span className="block rise text-ink-2" style={{ animationDelay: "120ms" }}>
              <em className="text-accent">every</em> settlement date.
            </span>
          </h1>

          <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:items-end">
            <div
              className="flex rise flex-col gap-10 md:col-span-7"
              style={{ animationDelay: "240ms" }}
            >
              <p className="max-w-xl text-lg text-pretty text-ink-2 md:text-xl">
                Is the exchange open, does it close early, and when does the trade settle?
                MarketClock answers from the <span className="text-ink">holidays</span> library,
                checked against what each exchange publishes.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/markets">Browse markets</ButtonLink>
                <ButtonLink href="/developers" variant="ghost">
                  Read the API
                </ButtonLink>
              </div>
              <div className="max-w-md">
                <BigClock />
                <div className="mt-6">
                  <ZoneClock label="UTC" timeZone="UTC" />
                </div>
              </div>
            </div>
            <div
              className="mx-auto w-full max-w-[440px] rise md:col-span-5"
              style={{ animationDelay: "360ms" }}
            >
              <Dial />
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-rule bg-surface py-4" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...ENDPOINTS, ...ENDPOINTS].map((name, index) => (
            <span key={index} className="flex items-center gap-10 font-mono text-sm text-ink-2">
              <span>
                <span className="text-ink-3">GET /api/v1/</span>
                {name}
              </span>
              <span className="size-1 rounded-full bg-accent" />
            </span>
          ))}
        </div>
      </div>

      <section className="container-page py-24 md:py-36">
        <div className="mb-14 grid gap-6 md:grid-cols-12">
          <p className="eyebrow md:col-span-3" data-reveal="">
            What it answers
          </p>
          <h2 className="text-display text-5xl md:col-span-9 md:text-7xl" data-reveal="">
            Four questions a desk asks <em className="text-ink-3">every morning.</em>
          </h2>
        </div>
        <ol className="border-t border-rule">
          {QUESTIONS.map((question, index) => (
            <li
              key={question.title}
              data-reveal=""
              style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}
              className="group grid gap-4 border-b border-rule py-8 transition-colors duration-500 hover:bg-surface md:grid-cols-12 md:items-baseline md:py-10"
            >
              <span className="font-mono tabular text-sm text-ink-3 md:col-span-1 md:pl-2">
                0{index + 1}
              </span>
              <h3 className="text-display text-4xl transition-transform duration-700 ease-out-expo group-hover:translate-x-2 md:col-span-5 md:text-6xl">
                {question.title}
              </h3>
              <p className="max-w-md text-ink-2 md:col-span-4">{question.body}</p>
              <span className="eyebrow md:col-span-2 md:pr-2 md:text-right">{question.tag}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-rule bg-sunken/40">
        <div className="container-page grid gap-14 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-4" data-reveal="">
            <p className="mb-6 eyebrow">Weekends</p>
            <h2 className="text-display text-5xl md:text-6xl">Not every week ends on Saturday.</h2>
            <p className="mt-6 text-ink-2">
              Each market keeps its own weekend, read from the library&apos;s market class, so a
              trading day in Riyadh is not a trading day in New York.
            </p>
          </div>
          <div className="md:col-span-8" data-reveal="">
            <WeekendDemo />
          </div>
        </div>
      </section>

      <section className="container-page py-24 md:py-36">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5" data-reveal="">
            <p className="mb-6 eyebrow">Settlement</p>
            <h2 className="text-display text-5xl md:text-6xl">
              T+n counts trading days, <em className="text-ink-3">not calendar days.</em>
            </h2>
            <p className="mt-6 max-w-md text-ink-2">
              Cycles are stored with their effective date and source, so an old trade still uses the
              cycle that applied on its trade date.
            </p>
            <div className="mt-8">
              <ButtonLink href="/tools/settlement" variant="ghost">
                Settlement calculator
              </ButtonLink>
            </div>
          </div>
          <div className="md:col-span-7 md:pt-4" data-reveal="">
            <ol
              className="grid grid-cols-5 gap-2"
              aria-label="Example: a T+2 trade placed on a Thursday"
            >
              {SETTLEMENT_STRIP.map((step, index) => (
                <li
                  key={step.day}
                  style={{ transitionDelay: `${index * 90}ms` }}
                  className={`flex aspect-[3/4] flex-col justify-between rounded-2xl border p-3 md:p-5 ${
                    step.kind === "settle"
                      ? "border-accent bg-accent text-accent-ink"
                      : step.kind === "skip"
                        ? "border-rule bg-[repeating-linear-gradient(135deg,var(--rule)_0_1px,transparent_1px_7px)] text-ink-3"
                        : step.kind === "trade"
                          ? "border-ink bg-ink text-paper"
                          : "border-rule-strong bg-surface"
                  }`}
                >
                  <span className="font-mono text-[10px] tracking-widest uppercase opacity-70">
                    {step.day}
                  </span>
                  <span className="text-display text-2xl md:text-5xl">{step.label}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-ink-3">
              Example: a T+2 trade on a Thursday settles on Monday when the market keeps a Saturday
              and Sunday weekend and has no closure in between.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-page grid gap-14 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-5" data-reveal="">
            <p className="mb-6 eyebrow text-paper/50">Data quality</p>
            <h2 className="text-display text-5xl md:text-7xl">Checked against the exchange.</h2>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-paper/10 md:col-span-7 md:grid-cols-3">
            {[
              [
                "Sourced",
                "Every session hour, cycle and official closure keeps the URL it came from.",
              ],
              [
                "Compared",
                "Library dates are diffed against each exchange's own calendar, year by year.",
              ],
              [
                "Sent upstream",
                "Real differences become issues and pull requests on the holidays library.",
              ],
            ].map(([title, body], index) => (
              <li
                key={title}
                data-reveal=""
                style={{ ["--reveal-delay" as string]: `${index * 100}ms` }}
                className="flex flex-col gap-10 bg-ink p-6 md:p-8"
              >
                <span className="font-mono text-xs text-paper/40">0{index + 1}</span>
                <div>
                  <h3 className="text-display text-3xl">{title}</h3>
                  <p className="mt-3 text-sm text-paper/60">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-24 md:py-36">
        <div
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
          data-reveal=""
        >
          <div>
            <p className="mb-6 eyebrow">API</p>
            <h2 className="text-display text-5xl md:text-7xl">One request, one date.</h2>
          </div>
          <ButtonLink href="/developers" variant="ghost">
            All endpoints
          </ButtonLink>
        </div>
        <div
          className="grid overflow-hidden rounded-2xl border border-rule md:grid-cols-2"
          data-reveal=""
        >
          <div className="border-b border-rule bg-surface p-6 md:border-r md:border-b-0 md:p-8">
            <p className="mb-4 eyebrow">Request</p>
            <pre className="overflow-x-auto font-mono text-sm leading-7">
              <span className="text-accent">GET</span> /api/v1/markets/XNYS/{"\n"}
              {"    "}next-trading-day?date=<span className="text-ink-2">2026-10-24</span>
            </pre>
          </div>
          <div className="bg-paper p-6 md:p-8">
            <p className="mb-4 eyebrow">Response</p>
            <pre className="overflow-x-auto font-mono text-sm leading-7 text-ink-2">
              {"{\n"}
              {"  "}
              <span className="text-ink">&quot;market&quot;</span>: &quot;XNYS&quot;,{"\n"}
              {"  "}
              <span className="text-ink">&quot;date&quot;</span>: &quot;2026-10-24&quot;,{"\n"}
              {"  "}
              <span className="text-ink">&quot;next_trading_day&quot;</span>:{" "}
              <span className="text-accent">&quot;2026-10-26&quot;</span>
              {"\n}"}
            </pre>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-3">Planned shape. The API is under construction.</p>
      </section>

      <section className="container-page">
        <Link
          href="/markets"
          data-reveal=""
          className="group flex flex-col gap-8 rounded-3xl border border-rule-strong p-8 transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-accent-ink md:flex-row md:items-end md:justify-between md:p-14"
        >
          <h2 className="text-display text-6xl md:text-[8rem]">
            Know before <em>the bell.</em>
          </h2>
          <span className="grid size-16 shrink-0 place-items-center rounded-full border border-current transition-transform duration-700 ease-out-expo group-hover:rotate-45 md:size-24">
            <ArrowUpRightIcon width={28} height={28} />
          </span>
        </Link>
      </section>
    </>
  );
}
