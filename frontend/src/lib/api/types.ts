import type { components } from "./schema";

type Schemas = components["schemas"];

export type IsoDate = string;

export type MarketHoliday = Schemas["Holiday"];
export type HolidaysResponse = Schemas["HolidaysResponse"];
export type TradingDayResponse = Schemas["TradingDayResponse"];
export type AdjacentTradingDayResponse = Schemas["AdjacentTradingDayResponse"];
export type TradingDaysResponse = Schemas["TradingDaysResponse"];
export type ApiErrorBody = Schemas["ErrorResponse"];

// Hand-written until the markets, settlement and overlap endpoints are in the OpenAPI schema.

export interface Market {
  code: string;
  name: string;
  country: string;
  timezone: string;
  // Python weekday numbers: Monday is 0, not Sunday.
  weekend: number[];
  categories: string[];
}

export interface SettlementResponse {
  markets: string[];
  trade_date: IsoDate;
  cycle: number;
  settlement_date: IsoDate;
}

export interface OverlapResponse {
  markets: string[];
  start: IsoDate;
  end: IsoDate;
  days: IsoDate[];
}
