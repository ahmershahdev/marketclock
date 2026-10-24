import { MONTH_NAMES, WEEKDAY_SHORT, dayKind, monthWeeks, type DayKind } from "@/lib/calendar";

export interface Closure {
  name: string;
  halfDay: boolean;
}

const CELL: Record<DayKind, string> = {
  open: "text-ink hover:bg-sunken",
  weekend:
    "text-ink-3 bg-[repeating-linear-gradient(135deg,var(--rule)_0_1px,transparent_1px_6px)]",
  closed: "bg-closed text-closed-ink",
  early: "text-early ring-1 ring-inset ring-early/60 bg-early/10",
};

const LABEL: Record<DayKind, string> = {
  open: "Trading day",
  weekend: "Weekend",
  closed: "Closed",
  early: "Early close",
};

export function MonthGrid({
  year,
  month,
  weekend,
  closures,
  today,
  compact = false,
}: {
  year: number;
  month: number;
  weekend: readonly number[];
  closures: ReadonlyMap<string, Closure>;
  today?: string | null;
  compact?: boolean;
}) {
  const weeks = monthWeeks(year, month);

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between">
        <span className={compact ? "text-sm font-medium" : "text-display text-3xl"}>
          {MONTH_NAMES[month - 1]}
        </span>
        <span className="eyebrow">{year}</span>
      </figcaption>
      <table className="w-full table-fixed border-collapse text-center">
        <thead>
          <tr>
            {WEEKDAY_SHORT.map((day) => (
              <th
                key={day}
                scope="col"
                className="pb-2 font-mono text-[10px] font-normal tracking-widest text-ink-3 uppercase"
              >
                <abbr title={day} className="no-underline">
                  {day.slice(0, compact ? 1 : 2)}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, row) => (
            <tr key={row}>
              {week.map((iso, column) => {
                if (!iso) return <td key={column} />;
                const kind = dayKind(iso, weekend, closures);
                const closure = closures.get(iso);
                const title = closure ? `${closure.name} (${LABEL[kind]})` : LABEL[kind];
                return (
                  <td key={iso} className="p-[2px]">
                    <time
                      dateTime={iso}
                      title={title}
                      className={`relative grid aspect-square place-items-center rounded-[4px] font-mono tabular transition-colors ${
                        compact ? "text-[11px]" : "text-xs"
                      } ${CELL[kind]} ${iso === today ? "outline-2 outline-offset-1 outline-ink" : ""}`}
                    >
                      {Number(iso.slice(8))}
                      <span className="sr-only">, {title}</span>
                    </time>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function CalendarLegend() {
  const items: { kind: DayKind; label: string }[] = [
    { kind: "open", label: "Trading day" },
    { kind: "weekend", label: "Weekend" },
    { kind: "early", label: "Early close" },
    { kind: "closed", label: "Closed" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item) => (
        <li key={item.kind} className="flex items-center gap-2 eyebrow">
          <span
            className={`size-3 rounded-[3px] border border-rule ${CELL[item.kind].replace(/hover:\S+/, "")}`}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
