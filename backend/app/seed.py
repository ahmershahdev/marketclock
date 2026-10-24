from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import OfficialClosure, SettlementCycle

SEC_T2 = "https://www.sec.gov/newsroom/press-releases/2017-68-0"
SEC_T1 = "https://www.sec.gov/newsroom/press-releases/2023-29"
CSA_T1 = (
    "https://www.asc.ca/en/news-and-publications/news-releases/2024/05/"
    "may-27-canadian-securities-regulators-announce-move-to-t1-settlement-cycle"
)
FCA_T1 = "https://www.fca.org.uk/markets/about-t1-settlement"

# Only rows whose source page was read and confirmed; a market with no row has no default.
SETTLEMENT_CYCLES: list[tuple[str, int, date, str]] = [
    ("XNYS", 2, date(2017, 9, 5), SEC_T2),
    ("XNYS", 1, date(2024, 5, 28), SEC_T1),
    ("XNAS", 2, date(2017, 9, 5), SEC_T2),
    ("XNAS", 1, date(2024, 5, 28), SEC_T1),
    ("XTSE", 1, date(2024, 5, 27), CSA_T1),
    ("XLON", 1, date(2027, 10, 11), FCA_T1),
]


def seed_settlement_cycles(session: Session) -> int:
    existing = {
        (row.market, row.effective_from): row for row in session.scalars(select(SettlementCycle))
    }
    for market, days, effective_from, source_url in SETTLEMENT_CYCLES:
        row = existing.get((market, effective_from))
        if row is None:
            session.add(
                SettlementCycle(
                    market=market, days=days, effective_from=effective_from, source_url=source_url
                )
            )
        else:
            row.days, row.source_url = days, source_url
    session.commit()
    return len(SETTLEMENT_CYCLES)


NYSE_CALENDAR = "https://www.nyse.com/markets/hours-calendars"
LSE_CALENDAR = "https://www.londonstockexchange.com/equities-trading/business-days"
NASDAQ_CALENDAR = "https://www.nasdaq.com/market-activity/stock-market-holiday-schedule"
CHECKED_ON = date(2026, 10, 24)

# Whole years only, copied from the exchange page on CHECKED_ON: a year that is here is compared
# in full, so a partial year would report false differences.
OFFICIAL_CLOSURES: list[tuple[str, date, str, str, str]] = [
    ("XNYS", date(2026, 1, 1), "closed", "New Year's Day", NYSE_CALENDAR),
    ("XNYS", date(2026, 1, 19), "closed", "Martin Luther King, Jr. Day", NYSE_CALENDAR),
    ("XNYS", date(2026, 2, 16), "closed", "Washington's Birthday", NYSE_CALENDAR),
    ("XNYS", date(2026, 4, 3), "closed", "Good Friday", NYSE_CALENDAR),
    ("XNYS", date(2026, 5, 25), "closed", "Memorial Day", NYSE_CALENDAR),
    ("XNYS", date(2026, 6, 19), "closed", "Juneteenth National Independence Day", NYSE_CALENDAR),
    ("XNYS", date(2026, 7, 3), "closed", "Independence Day (observed)", NYSE_CALENDAR),
    ("XNYS", date(2026, 9, 7), "closed", "Labor Day", NYSE_CALENDAR),
    ("XNYS", date(2026, 11, 26), "closed", "Thanksgiving Day", NYSE_CALENDAR),
    ("XNYS", date(2026, 11, 27), "half_day", "Day after Thanksgiving", NYSE_CALENDAR),
    ("XNYS", date(2026, 12, 24), "half_day", "Christmas Eve", NYSE_CALENDAR),
    ("XNYS", date(2026, 12, 25), "closed", "Christmas Day", NYSE_CALENDAR),
    ("XNYS", date(2027, 1, 1), "closed", "New Year's Day", NYSE_CALENDAR),
    ("XNYS", date(2027, 1, 18), "closed", "Martin Luther King, Jr. Day", NYSE_CALENDAR),
    ("XNYS", date(2027, 2, 15), "closed", "Washington's Birthday", NYSE_CALENDAR),
    ("XNYS", date(2027, 3, 26), "closed", "Good Friday", NYSE_CALENDAR),
    ("XNYS", date(2027, 5, 31), "closed", "Memorial Day", NYSE_CALENDAR),
    ("XNYS", date(2027, 6, 18), "closed", "Juneteenth (observed)", NYSE_CALENDAR),
    ("XNYS", date(2027, 7, 5), "closed", "Independence Day (observed)", NYSE_CALENDAR),
    ("XNYS", date(2027, 9, 6), "closed", "Labor Day", NYSE_CALENDAR),
    ("XNYS", date(2027, 11, 25), "closed", "Thanksgiving Day", NYSE_CALENDAR),
    ("XNYS", date(2027, 11, 26), "half_day", "Day after Thanksgiving", NYSE_CALENDAR),
    ("XNYS", date(2027, 12, 24), "closed", "Christmas Day (observed)", NYSE_CALENDAR),
    ("XNYS", date(2028, 1, 17), "closed", "Martin Luther King, Jr. Day", NYSE_CALENDAR),
    ("XNYS", date(2028, 2, 21), "closed", "Washington's Birthday", NYSE_CALENDAR),
    ("XNYS", date(2028, 4, 14), "closed", "Good Friday", NYSE_CALENDAR),
    ("XNYS", date(2028, 5, 29), "closed", "Memorial Day", NYSE_CALENDAR),
    ("XNYS", date(2028, 6, 19), "closed", "Juneteenth National Independence Day", NYSE_CALENDAR),
    ("XNYS", date(2028, 7, 3), "half_day", "Day before Independence Day", NYSE_CALENDAR),
    ("XNYS", date(2028, 7, 4), "closed", "Independence Day", NYSE_CALENDAR),
    ("XNYS", date(2028, 9, 4), "closed", "Labor Day", NYSE_CALENDAR),
    ("XNYS", date(2028, 11, 23), "closed", "Thanksgiving Day", NYSE_CALENDAR),
    ("XNYS", date(2028, 11, 24), "half_day", "Day after Thanksgiving", NYSE_CALENDAR),
    ("XNYS", date(2028, 12, 25), "closed", "Christmas Day", NYSE_CALENDAR),
    ("XNAS", date(2026, 1, 1), "closed", "New Year's Day", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 1, 19), "closed", "MLK, Jr. Day", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 2, 16), "closed", "Presidents Day", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 4, 3), "closed", "Good Friday", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 5, 25), "closed", "Memorial Day", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 6, 19), "closed", "Juneteenth", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 7, 3), "closed", "Independence Day (Observed)", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 9, 7), "closed", "Labor Day", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 11, 26), "closed", "Thanksgiving Day", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 11, 27), "half_day", "Early Close", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 12, 24), "half_day", "Early Close", NASDAQ_CALENDAR),
    ("XNAS", date(2026, 12, 25), "closed", "Christmas Day", NASDAQ_CALENDAR),
    ("XLON", date(2027, 1, 1), "closed", "New Year's Day", LSE_CALENDAR),
    ("XLON", date(2027, 3, 26), "closed", "Good Friday", LSE_CALENDAR),
    ("XLON", date(2027, 3, 29), "closed", "Easter Monday", LSE_CALENDAR),
    ("XLON", date(2027, 5, 3), "closed", "Early May Bank Holiday", LSE_CALENDAR),
    ("XLON", date(2027, 5, 31), "closed", "Spring Bank Holiday", LSE_CALENDAR),
    ("XLON", date(2027, 8, 30), "closed", "Summer Bank Holiday", LSE_CALENDAR),
    ("XLON", date(2027, 12, 24), "half_day", "Christmas Holiday half day", LSE_CALENDAR),
    ("XLON", date(2027, 12, 27), "closed", "Christmas Day (substitute)", LSE_CALENDAR),
    ("XLON", date(2027, 12, 28), "closed", "Boxing Day (substitute)", LSE_CALENDAR),
    ("XLON", date(2027, 12, 31), "half_day", "New Year's Holiday half day", LSE_CALENDAR),
    ("XLON", date(2028, 1, 3), "closed", "New Year's Day (substitute)", LSE_CALENDAR),
    ("XLON", date(2028, 4, 14), "closed", "Good Friday", LSE_CALENDAR),
    ("XLON", date(2028, 4, 17), "closed", "Easter Monday", LSE_CALENDAR),
    ("XLON", date(2028, 5, 1), "closed", "Early May Bank Holiday", LSE_CALENDAR),
    ("XLON", date(2028, 5, 29), "closed", "Spring Bank Holiday", LSE_CALENDAR),
    ("XLON", date(2028, 8, 28), "closed", "Summer Bank Holiday", LSE_CALENDAR),
    ("XLON", date(2028, 12, 22), "half_day", "Christmas Holiday half day", LSE_CALENDAR),
    ("XLON", date(2028, 12, 25), "closed", "Christmas Day", LSE_CALENDAR),
    ("XLON", date(2028, 12, 26), "closed", "Boxing Day", LSE_CALENDAR),
    ("XLON", date(2028, 12, 29), "half_day", "New Year's Holiday half day", LSE_CALENDAR),
]


def seed_official_closures(session: Session) -> int:
    existing = {(row.market, row.date): row for row in session.scalars(select(OfficialClosure))}
    for market, day, kind, name, source_url in OFFICIAL_CLOSURES:
        row = existing.get((market, day))
        if row is None:
            row = OfficialClosure(market=market, date=day)
            session.add(row)
        row.kind, row.name, row.source_url, row.checked_on = kind, name, source_url, CHECKED_ON
    session.commit()
    return len(OFFICIAL_CLOSURES)
