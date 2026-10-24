import { Panel } from "@/components/ui";

export function ApiOffline({ what }: { what: string }) {
  return (
    <Panel className="relative overflow-hidden">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <p className="mb-3 flex items-center gap-2 eyebrow">
            <span className="size-1.5 rounded-full bg-early" />
            API not reachable
          </p>
          <h2 className="text-display text-4xl">No live data yet.</h2>
          <p className="mt-4 text-ink-2">
            {what} comes from the MarketClock API, which reads the <code>holidays</code> library.
            Start the API and this page fills in by itself.
          </p>
        </div>
        <pre className="shrink-0 rounded-xl border border-rule bg-paper p-4 font-mono text-xs leading-relaxed text-ink-2 tabular">
          <span className="text-ink-3"># frontend/.env.local</span>
          {"\n"}API_URL=http://localhost:5000
        </pre>
      </div>
    </Panel>
  );
}

export function ApiError({ message }: { message: string }) {
  return (
    <Panel>
      <p className="mb-3 eyebrow text-closed">Request failed</p>
      <p className="text-ink-2">{message}</p>
    </Panel>
  );
}
