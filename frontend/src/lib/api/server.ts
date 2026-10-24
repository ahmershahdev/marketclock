import { cacheLife } from "next/cache";
import { api, type ApiResult } from "@/lib/api/client";
import type { HolidaysResponse, Market } from "@/lib/api/types";

// Failures throw inside the cached scope so an outage is never cached; the caller then asks again
// uncached to get the real error.
async function cachedMarkets(): Promise<Market[]> {
  "use cache";
  cacheLife("hours");
  const result = await api.markets();
  if (!result.ok) throw new Error("markets unavailable");
  return result.data;
}

async function cachedHolidays(code: string, year: number): Promise<HolidaysResponse> {
  "use cache";
  cacheLife("hours");
  const result = await api.holidays(code, year);
  if (!result.ok) throw new Error("holidays unavailable");
  return result.data;
}

export async function getMarkets(): Promise<ApiResult<Market[]>> {
  try {
    return { ok: true, data: await cachedMarkets() };
  } catch {
    return api.markets();
  }
}

export async function getHolidays(
  code: string,
  year: number,
): Promise<ApiResult<HolidaysResponse>> {
  try {
    return { ok: true, data: await cachedHolidays(code, year) };
  } catch {
    return api.holidays(code, year);
  }
}
