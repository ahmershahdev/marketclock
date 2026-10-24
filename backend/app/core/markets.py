from dataclasses import dataclass

import holidays

from app.core.calendar import UnknownMarketError, market_codes


@dataclass(frozen=True)
class MarketInfo:
    name: str
    country: str
    country_code: str
    timezone: str
    source_url: str


@dataclass(frozen=True)
class TradingSession:
    open: str | None
    close: str | None
    early_close: str | None
    source_url: str


@dataclass(frozen=True)
class Market:
    code: str
    name: str
    country: str
    country_code: str
    timezone: str
    weekend: list[int]
    categories: list[str]
    first_year: int
    last_year: int
    source_url: str
    session: TradingSession | None


# Name, country and timezone of each exchange, from the exchange's own website.
# Country codes are ISO 3166-1 alpha-2; EU stands for the euro area.
MARKET_INFO: dict[str, MarketInfo] = {
    "BVMF": MarketInfo("B3", "Brazil", "BR", "America/Sao_Paulo", "https://www.b3.com.br"),
    "IFEU": MarketInfo(
        "ICE Futures Europe",
        "United Kingdom",
        "GB",
        "Europe/London",
        "https://www.ice.com/futures-europe",
    ),
    "XASX": MarketInfo(
        "Australian Securities Exchange",
        "Australia",
        "AU",
        "Australia/Sydney",
        "https://www.asx.com.au",
    ),
    "XBOG": MarketInfo(
        "Bolsa de Valores de Colombia", "Colombia", "CO", "America/Bogota", "https://www.bvc.com.co"
    ),
    "XBOM": MarketInfo("BSE", "India", "IN", "Asia/Kolkata", "https://www.bseindia.com"),
    "XBUE": MarketInfo(
        "Bolsas y Mercados Argentinos",
        "Argentina",
        "AR",
        "America/Argentina/Buenos_Aires",
        "https://www.byma.com.ar",
    ),
    "XCME": MarketInfo(
        "CME Group", "United States", "US", "America/Chicago", "https://www.cmegroup.com"
    ),
    "XECB": MarketInfo(
        "European Central Bank (TARGET2)",
        "Euro area",
        "EU",
        "Europe/Berlin",
        "https://www.ecb.europa.eu",
    ),
    "XETR": MarketInfo(
        "Deutsche Börse (Xetra)",
        "Germany",
        "DE",
        "Europe/Berlin",
        "https://www.deutsche-boerse.com",
    ),
    "XHKG": MarketInfo(
        "Hong Kong Exchanges and Clearing",
        "Hong Kong",
        "HK",
        "Asia/Hong_Kong",
        "https://www.hkex.com.hk",
    ),
    "XIST": MarketInfo(
        "Borsa Istanbul", "Türkiye", "TR", "Europe/Istanbul", "https://www.borsaistanbul.com"
    ),
    "XJPX": MarketInfo(
        "Japan Exchange Group", "Japan", "JP", "Asia/Tokyo", "https://www.jpx.co.jp"
    ),
    "XJSE": MarketInfo(
        "Johannesburg Stock Exchange",
        "South Africa",
        "ZA",
        "Africa/Johannesburg",
        "https://www.jse.co.za",
    ),
    "XKAR": MarketInfo(
        "Pakistan Stock Exchange", "Pakistan", "PK", "Asia/Karachi", "https://www.psx.com.pk"
    ),
    "XKRX": MarketInfo(
        "Korea Exchange", "South Korea", "KR", "Asia/Seoul", "https://www.krx.co.kr"
    ),
    "XLON": MarketInfo(
        "London Stock Exchange",
        "United Kingdom",
        "GB",
        "Europe/London",
        "https://www.londonstockexchange.com",
    ),
    "XMAD": MarketInfo(
        "Bolsas y Mercados Españoles",
        "Spain",
        "ES",
        "Europe/Madrid",
        "https://www.bolsasymercados.es",
    ),
    "XMEX": MarketInfo(
        "Bolsa Mexicana de Valores", "Mexico", "MX", "America/Mexico_City", "https://www.bmv.com.mx"
    ),
    "XNAS": MarketInfo(
        "Nasdaq", "United States", "US", "America/New_York", "https://www.nasdaq.com"
    ),
    "XNSE": MarketInfo(
        "National Stock Exchange of India",
        "India",
        "IN",
        "Asia/Kolkata",
        "https://www.nseindia.com",
    ),
    "XNYS": MarketInfo(
        "New York Stock Exchange", "United States", "US", "America/New_York", "https://www.nyse.com"
    ),
    "XNZE": MarketInfo("NZX", "New Zealand", "NZ", "Pacific/Auckland", "https://www.nzx.com"),
    "XSAU": MarketInfo(
        "Saudi Exchange (Tadawul)",
        "Saudi Arabia",
        "SA",
        "Asia/Riyadh",
        "https://www.saudiexchange.sa",
    ),
    "XSES": MarketInfo(
        "Singapore Exchange", "Singapore", "SG", "Asia/Singapore", "https://www.sgx.com"
    ),
    "XSHE": MarketInfo(
        "Shenzhen Stock Exchange", "China", "CN", "Asia/Shanghai", "https://www.szse.cn"
    ),
    "XSHG": MarketInfo(
        "Shanghai Stock Exchange", "China", "CN", "Asia/Shanghai", "https://www.sse.com.cn"
    ),
    "XSWX": MarketInfo(
        "SIX Swiss Exchange", "Switzerland", "CH", "Europe/Zurich", "https://www.six-group.com"
    ),
    "XTAI": MarketInfo(
        "Taiwan Stock Exchange", "Taiwan", "TW", "Asia/Taipei", "https://www.twse.com.tw"
    ),
    "XTSE": MarketInfo(
        "Toronto Stock Exchange", "Canada", "CA", "America/Toronto", "https://www.tsx.com"
    ),
    "XWAR": MarketInfo(
        "Warsaw Stock Exchange", "Poland", "PL", "Europe/Warsaw", "https://www.gpw.pl"
    ),
}


# Local exchange time, continuous trading only (lunch breaks and auctions are left out).
# Only sessions whose source page was read and confirmed; None where the page is silent.
SESSIONS: dict[str, TradingSession] = {
    "XNYS": TradingSession(
        "09:30", "16:00", "13:00", "https://www.nyse.com/markets/hours-calendars"
    ),
    "XNAS": TradingSession(
        "09:30",
        "16:00",
        "13:00",
        "https://www.nasdaq.com/market-activity/stock-market-holiday-schedule",
    ),
    "XJPX": TradingSession(
        "09:00",
        "15:30",
        None,
        "https://www.jpx.co.jp/english/equities/trading/domestic/01.html",
    ),
    "XHKG": TradingSession(
        "09:30",
        "16:00",
        "12:00",
        "https://www.hkex.com.hk/Services/Trading-hours-and-Severe-Weather-Arrangements/"
        "Trading-Hours/Securities-Market?sc_lang=en",
    ),
    "XASX": TradingSession(
        "10:00",
        "16:00",
        None,
        "https://www.asx.com.au/markets/market-resources/trading-hours-calendar/"
        "cash-market-trading-hours",
    ),
    "XLON": TradingSession(
        None, None, "12:30", "https://www.londonstockexchange.com/equities-trading/business-days"
    ),
}


def get_market(code: str) -> Market:
    if code not in market_codes():
        raise UnknownMarketError(code)
    calendar = holidays.financial_holidays(code)
    info = MARKET_INFO[code]
    return Market(
        code=code,
        name=info.name,
        country=info.country,
        country_code=info.country_code,
        timezone=info.timezone,
        weekend=sorted(calendar.weekend),
        categories=sorted(calendar.supported_categories),
        first_year=calendar.start_year,
        last_year=calendar.end_year,
        source_url=info.source_url,
        session=SESSIONS.get(code),
    )


def list_markets() -> list[Market]:
    return [get_market(code) for code in sorted(market_codes())]
