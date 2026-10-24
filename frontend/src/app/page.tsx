import Link from "next/link";
import { Globe } from "@/components/globe/globe";
import { WeekendDemo } from "@/components/home/weekend-demo";
import { ArrowUpRightIcon } from "@/components/icons";
import { BigClock, ZoneClock } from "@/components/live-clock";
import { Tilt } from "@/components/tilt";
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
    body: "Trading days for each market, with its own weekend and the closures in the holidays library.",
    tag: "is-trading-day",
  },
  {
    title: "Does it close early?",
    body: "Half-day sessions from the library's HALF_DAY category, with the local closing time.",
    tag: "holidays",
  },
  {
    title: "When does it settle?",
    body: "T+n counted in trading days, on one market or across two that must both be open.",
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

const STRIP_STYLE = {
  trade: "border-ink bg-ink text-paper",
  count: "border-rule-strong bg-surface",
  skip: "border-rule bg-[repeating-linear-gradient(135deg,var(--rule)_0_1px,transparent_1px_7px)] text-ink-3",
  settle: "border-accent bg-accent text-accent-ink shadow-[0_20px_60px_-20px_var(--accent)]",
};

const QUALITY = [
  ["Sourced", "Every session hour, cycle and official closure keeps the URL it came from."],
  ["Compared", "Library dates are diffed against each exchange's own calendar, year by year."],
  ["Sent upstream", "Real differences become issues and pull requests on the holidays library."],
];

function Words({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return text.split(" ").map((word, index) => (
    <span key={index} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
      <span
        className={`inline-block rise ${className}`}
        style={{ animationDelay: `${delay + index * 70}ms` }}
      >
        {word}&nbsp;
      </span>
    </span>
  ));
}

export default function Home() {
  return (
    <>
      <section className="relative -mt-[4.25rem] overflow-hidden pt-[4.25rem]">
        <div className="relative container-page grid min-h-[calc(100dvh-4.25rem)] items-center gap-8 py-12 lg:grid-cols-12">
          <div className="relative z-10 flex flex-col gap-10 lg:col-span-7">
            <p className="inline-flex w-fit rise items-center gap-2.5 rounded-full border border-rule bg-surface/70 py-1.5 pr-4 pl-2 text-[13px] text-ink-2 backdrop-blur">
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-accent-ink uppercase">
                New
              </span>
              Built on the open-source holidays library
            </p>

            <h1 className="text-display text-[clamp(3rem,6.4vw,6.75rem)]">
              <span className="block">
                <Words text="Every trading day." />
              </span>
              <span className="block text-ink-3">
                <Words text="Every" delay={250} />
                <Words text="settlement date." delay={320} className="text-signal" />
              </span>
            </h1>

            <p
              className="max-w-xl rise text-lg text-pretty text-ink-2 md:text-xl"
              style={{ animationDelay: "500ms" }}
            >
              Is the exchange open, does it close early, and when does the trade settle? One
              calendar per market, checked against what each exchange publishes.
            </p>

            <div className="flex rise flex-wrap gap-3" style={{ animationDelay: "600ms" }}>
              <ButtonLink href="/markets">Browse markets</ButtonLink>
              <ButtonLink href="/developers" variant="ghost">
                Read the API
              </ButtonLink>
            </div>

            <div
              className="grid max-w-lg rise gap-4 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-10"
              style={{ animationDelay: "700ms" }}
            >
              <BigClock />
              <ZoneClock label="UTC" timeZone="UTC" />
            </div>
          </div>

          <div className="pointer-events-none relative -mx-[10%] aspect-square lg:absolute lg:top-1/2 lg:right-[-8%] lg:mx-0 lg:w-[56%] lg:-translate-y-1/2">
            <Globe className="size-full" />
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
              <span className="size-1.5 rotate-45 bg-accent" />
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
        <ol className="grid gap-4 md:grid-cols-2">
          {QUESTIONS.map((question, index) => (
            <li
              key={question.title}
              data-reveal=""
              style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}
            >
              <Tilt className="h-full rounded-3xl border border-rule bg-surface">
                <div className="flex h-full [transform:translateZ(30px)] flex-col justify-between gap-16 p-7 md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-ink-3 tabular">0{index + 1}</span>
                    <span className="rounded-full border border-rule px-3 py-1 font-mono text-[11px] text-ink-2">
                      {question.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-display text-4xl md:text-5xl">{question.title}</h3>
                    <p className="mt-4 max-w-md text-ink-2">{question.body}</p>
                  </div>
                </div>
              </Tilt>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-rule bg-surface/60">
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
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal="">
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
          <div className="lg:col-span-7" data-reveal="">
            <ol
              className="grid grid-cols-5 gap-2 [perspective:1200px] md:gap-3"
              aria-label="Example: a T+2 trade placed on a Thursday"
            >
              {SETTLEMENT_STRIP.map((step, index) => (
                <li
                  key={step.day}
                  className="[transform:rotateY(-14deg)_rotateX(8deg)] transition-transform duration-700 ease-out-expo hover:[transform:rotateY(0)_rotateX(0)_translateZ(40px)]"
                  style={{ transitionDelay: `${index * 40}ms` }}
                >
                  <div
                    className={`flex aspect-[3/4] flex-col justify-between rounded-2xl border p-3 md:p-5 ${STRIP_STYLE[step.kind]}`}
                  >
                    <span className="font-mono text-[10px] tracking-widest uppercase opacity-70">
                      {step.day}
                    </span>
                    <span className="text-display text-2xl md:text-5xl">{step.label}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-ink-3">
              Example: a T+2 trade on a Thursday settles on Monday when the market keeps a Saturday
              and Sunday weekend and has no closure in between.
            </p>
          </div>
        </div>
      </section>

      <section className="px-3 md:px-5">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-[#07080a] text-[#eef0ec]">
          <div className="pointer-events-none absolute -right-1/4 -bottom-1/2 aspect-square w-[80%] bg-[radial-gradient(closest-side,rgb(212_255_58/0.16),transparent)]" />
          <div className="relative grid gap-14 p-8 md:p-14 lg:grid-cols-12">
            <div className="lg:col-span-5" data-reveal="">
              <p className="mb-6 eyebrow !text-[#646a63]">Data quality</p>
              <h2 className="text-display text-5xl md:text-7xl">
                Checked against <em className="text-[#d4ff3a]">the exchange.</em>
              </h2>
            </div>
            <ul className="grid gap-3 md:grid-cols-3 lg:col-span-7">
              {QUALITY.map(([title, body], index) => (
                <li
                  key={title}
                  data-reveal=""
                  style={{ ["--reveal-delay" as string]: `${index * 100}ms` }}
                >
                  <Tilt className="h-full rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="flex h-full flex-col gap-12 p-6">
                      <span className="font-mono text-xs text-[#646a63]">0{index + 1}</span>
                      <div>
                        <h3 className="text-display text-3xl">{title}</h3>
                        <p className="mt-3 text-sm text-[#a3a8a0]">{body}</p>
                      </div>
                    </div>
                  </Tilt>
                </li>
              ))}
            </ul>
          </div>
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
        <Tilt className="rounded-3xl" max={4}>
          <div
            className="grid overflow-hidden rounded-3xl border border-rule md:grid-cols-2"
            data-reveal=""
          >
            <div className="border-b border-rule bg-surface p-6 md:border-r md:border-b-0 md:p-8">
              <p className="mb-4 eyebrow">Request</p>
              <pre className="overflow-x-auto font-mono text-sm leading-7">
                <span className="text-signal">GET</span> /api/v1/markets/XNYS/{"\n"}
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
                <span className="text-signal">&quot;2026-10-26&quot;</span>
                {"\n}"}
              </pre>
            </div>
          </div>
        </Tilt>
        <p className="mt-4 text-sm text-ink-3">Planned shape. The API is under construction.</p>
      </section>

      <section className="container-page">
        <Link
          href="/markets"
          data-reveal=""
          className="group relative flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-accent p-8 text-accent-ink md:flex-row md:items-end md:justify-between md:p-14"
        >
          <h2 className="text-display text-6xl md:text-[8rem]">
            Know before
            <br />
            the bell.
          </h2>
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-accent-ink text-accent transition-transform duration-700 ease-out-expo group-hover:scale-110 group-hover:rotate-45 md:size-24">
            <ArrowUpRightIcon width={28} height={28} />
          </span>
        </Link>
      </section>
    </>
  );
}
