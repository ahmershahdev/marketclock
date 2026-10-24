import type {
  ApiErrorBody,
  HolidaysResponse,
  Market,
  OverlapResponse,
  SettlementResponse,
} from "./types";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: "offline" }
  | { ok: false; kind: "error"; status: number; message: string };

function baseUrl(): string {
  return typeof window === "undefined" ? (process.env.API_URL ?? "http://localhost:5000") : "";
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.message === "string"
  );
}

async function get<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<ApiResult<T>> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  const url = `${baseUrl()}/api/v1${path}${query ? `?${query}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    return { ok: false, kind: "offline" };
  }

  // The Next rewrite proxy answers 5xx when Flask is down.
  const body: unknown = await response.json().catch(() => null);
  if (response.ok && body !== null) return { ok: true, data: body as T };
  if (isApiErrorBody(body)) {
    return { ok: false, kind: "error", status: response.status, message: body.error.message };
  }
  if (response.status >= 500) return { ok: false, kind: "offline" };
  return { ok: false, kind: "error", status: response.status, message: response.statusText };
}

export const api = {
  markets: () => get<Market[]>("/markets"),
  holidays: (code: string, year: number) =>
    get<HolidaysResponse>(`/markets/${encodeURIComponent(code)}/holidays`, { year }),
  settlement: (markets: string[], tradeDate: string, cycle: number | null) =>
    get<SettlementResponse>("/settlement", {
      markets: markets.join(","),
      trade_date: tradeDate,
      ...(cycle === null ? {} : { cycle }),
    }),
  overlap: (markets: string[], start: string, end: string) =>
    get<OverlapResponse>("/overlap", { markets: markets.join(","), start, end }),
};
