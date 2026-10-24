import { cacheLife } from "next/cache";
import { api, type ApiResult } from "@/lib/api/client";
import type { HolidaysResponse, Market } from "@/lib/api/types";

// A failed call is kept for seconds only, a profile Next.js also leaves out of prerenders, so a
// build without the API or a short outage is never served for hours.
export async function getMarkets(): Promise<ApiResult<Market[]>> {
  "use cache";
  const result = await api.markets();
  if (result.ok) cacheLife("hours");
  else cacheLife("seconds");
  return result;
}

export async function getHolidays(
  code: string,
  year: number,
): Promise<ApiResult<HolidaysResponse>> {
  "use cache";
  const result = await api.holidays(code, year);
  if (result.ok) cacheLife("hours");
  else cacheLife("seconds");
  return result;
}
