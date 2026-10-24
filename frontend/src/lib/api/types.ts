import type { components } from "./schema";

type Schemas = components["schemas"];

export type IsoDate = string;

export type Market = Schemas["Market"];
export type MarketHoliday = Schemas["Holiday"];
export type HolidaysResponse = Schemas["HolidaysResponse"];
export type TradingDayResponse = Schemas["TradingDayResponse"];
export type AdjacentTradingDayResponse = Schemas["AdjacentTradingDayResponse"];
export type TradingDaysResponse = Schemas["TradingDaysResponse"];
export type SettlementResponse = Schemas["SettlementResponse"];
export type OverlapResponse = Schemas["OverlapResponse"];
export type AddDaysResponse = Schemas["AddDaysResponse"];
export type MarketQuality = Schemas["MarketQuality"];
export type DataQualityReport = Schemas["DataQualityReport"];
export type MarketStatus = Schemas["MarketStatusResponse"];
export type ApiErrorBody = Schemas["ErrorResponse"];
