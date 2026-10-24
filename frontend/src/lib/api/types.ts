// Hand-written draft; replace with types generated from the OpenAPI schema in M2.

export type IsoDate = string;

export interface Market {
  code: string;
  name: string;
  country: string;
  timezone: string;
  // Python weekday numbers: Monday is 0, not Sunday.
  weekend: number[];
  categories: string[];
}

export interface MarketHoliday {
  date: IsoDate;
  name: string;
  category: string;
  half_day: boolean;
  close_time: string | null;
}

export interface HolidaysResponse {
  market: string;
  year: number;
  holidays: MarketHoliday[];
}

export interface TradingDayResponse {
  market: string;
  date: IsoDate;
  is_trading_day: boolean;
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

export interface ApiErrorBody {
  error: { code: string; message: string; params: Record<string, unknown> };
}
