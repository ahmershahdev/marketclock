import { absoluteUrl } from "@/lib/site";

export function feedUrls(code: string, year: number) {
  const path = `/api/v1/markets/${code}/calendar.ics`;
  const webcal = absoluteUrl(path).replace(/^https?:/, "webcal:");
  return {
    webcal,
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    download: `${path}?year=${year}`,
    csv: `/api/v1/markets/${code}/holidays.csv?year=${year}`,
  };
}

const linkClass =
  "inline-flex items-center gap-2 rounded-full border border-rule-strong px-4 py-2 text-sm transition-colors hover:border-ink";

export function CalendarLinks({ code, year }: { code: string; year: number }) {
  const urls = feedUrls(code, year);
  return (
    <div className="mt-10 rounded-2xl border border-rule bg-surface p-6">
      <p className="mb-2 eyebrow">Add to your calendar</p>
      <p className="mb-5 max-w-xl text-sm text-ink-2">
        Subscribe once and {code} closures and early closes for this year and next stay in your
        calendar, updated as the library changes.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={urls.webcal} className={linkClass}>
          Subscribe (Apple, Outlook)
        </a>
        <a href={urls.google} target="_blank" rel="noreferrer" className={linkClass}>
          Google Calendar
        </a>
        <a href={urls.download} download className={linkClass}>
          Download {year} (.ics)
        </a>
        <a href={urls.csv} download className={linkClass}>
          Download {year} (.csv)
        </a>
      </div>
    </div>
  );
}
