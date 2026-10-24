from dataclasses import dataclass

import holidays

from app.core.calendar import UnknownMarketError, market_codes


@dataclass(frozen=True)
class MarketInfo:
    name: str
    country: str
    timezone: str
    source_url: str


@dataclass(frozen=True)
class Market:
    code: str
    name: str
    country: str
    timezone: str
    weekend: list[int]
    categories: list[str]
    first_year: int
    last_year: int
    source_url: str


# Name, country and timezone of each exchange, from the exchange's own website.
MARKET_INFO: dict[str, MarketInfo] = {
    "BVMF": MarketInfo("B3", "Brazil", "America/Sao_Paulo", "https://www.b3.com.br"),
    "IFEU": MarketInfo(
        "ICE Futures Europe",
        "United Kingdom",
        "Europe/London",
        "https://www.ice.com/futures-europe",
    ),
    "XASX": MarketInfo(
        "Australian Securities Exchange", "Australia", "Australia/Sydney", "https://www.asx.com.au"
    ),
    "XBOG": MarketInfo(
        "Bolsa de Valores de Colombia", "Colombia", "America/Bogota", "https://www.bvc.com.co"
    ),
    "XBOM": MarketInfo("BSE", "India", "Asia/Kolkata", "https://www.bseindia.com"),
    "XBUE": MarketInfo(
        "Bolsas y Mercados Argentinos",
        "Argentina",
        "America/Argentina/Buenos_Aires",
        "https://www.byma.com.ar",
    ),
    "XCME": MarketInfo("CME Group", "United States", "America/Chicago", "https://www.cmegroup.com"),
    "XECB": MarketInfo(
        "European Central Bank (TARGET2)",
        "Euro area",
        "Europe/Berlin",
        "https://www.ecb.europa.eu",
    ),
    "XETR": MarketInfo(
        "Deutsche Börse (Xetra)", "Germany", "Europe/Berlin", "https://www.deutsche-boerse.com"
    ),
    "XHKG": MarketInfo(
        "Hong Kong Exchanges and Clearing",
        "Hong Kong",
        "Asia/Hong_Kong",
        "https://www.hkex.com.hk",
    ),
    "XIST": MarketInfo(
        "Borsa Istanbul", "Türkiye", "Europe/Istanbul", "https://www.borsaistanbul.com"
    ),
    "XJPX": MarketInfo("Japan Exchange Group", "Japan", "Asia/Tokyo", "https://www.jpx.co.jp"),
    "XJSE": MarketInfo(
        "Johannesburg Stock Exchange",
        "South Africa",
        "Africa/Johannesburg",
        "https://www.jse.co.za",
    ),
    "XKAR": MarketInfo(
        "Pakistan Stock Exchange", "Pakistan", "Asia/Karachi", "https://www.psx.com.pk"
    ),
    "XKRX": MarketInfo("Korea Exchange", "South Korea", "Asia/Seoul", "https://www.krx.co.kr"),
    "XLON": MarketInfo(
        "London Stock Exchange",
        "United Kingdom",
        "Europe/London",
        "https://www.londonstockexchange.com",
    ),
    "XMAD": MarketInfo(
        "Bolsas y Mercados Españoles", "Spain", "Europe/Madrid", "https://www.bolsasymercados.es"
    ),
    "XMEX": MarketInfo(
        "Bolsa Mexicana de Valores", "Mexico", "America/Mexico_City", "https://www.bmv.com.mx"
    ),
    "XNAS": MarketInfo("Nasdaq", "United States", "America/New_York", "https://www.nasdaq.com"),
    "XNSE": MarketInfo(
        "National Stock Exchange of India", "India", "Asia/Kolkata", "https://www.nseindia.com"
    ),
    "XNYS": MarketInfo(
        "New York Stock Exchange", "United States", "America/New_York", "https://www.nyse.com"
    ),
    "XNZE": MarketInfo("NZX", "New Zealand", "Pacific/Auckland", "https://www.nzx.com"),
    "XSAU": MarketInfo(
        "Saudi Exchange (Tadawul)", "Saudi Arabia", "Asia/Riyadh", "https://www.saudiexchange.sa"
    ),
    "XSES": MarketInfo("Singapore Exchange", "Singapore", "Asia/Singapore", "https://www.sgx.com"),
    "XSHE": MarketInfo("Shenzhen Stock Exchange", "China", "Asia/Shanghai", "https://www.szse.cn"),
    "XSHG": MarketInfo(
        "Shanghai Stock Exchange", "China", "Asia/Shanghai", "https://www.sse.com.cn"
    ),
    "XSWX": MarketInfo(
        "SIX Swiss Exchange", "Switzerland", "Europe/Zurich", "https://www.six-group.com"
    ),
    "XTAI": MarketInfo("Taiwan Stock Exchange", "Taiwan", "Asia/Taipei", "https://www.twse.com.tw"),
    "XTSE": MarketInfo(
        "Toronto Stock Exchange", "Canada", "America/Toronto", "https://www.tsx.com"
    ),
    "XWAR": MarketInfo("Warsaw Stock Exchange", "Poland", "Europe/Warsaw", "https://www.gpw.pl"),
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
        timezone=info.timezone,
        weekend=sorted(calendar.weekend),
        categories=sorted(calendar.supported_categories),
        first_year=calendar.start_year,
        last_year=calendar.end_year,
        source_url=info.source_url,
    )


def list_markets() -> list[Market]:
    return [get_market(code) for code in sorted(market_codes())]
