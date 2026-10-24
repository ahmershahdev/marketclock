import pytest

from app.core.calendar import UnknownMarketError, market_codes
from app.core.markets import MARKET_INFO, get_market, list_markets


def test_every_library_market_has_info() -> None:
    assert set(MARKET_INFO) == market_codes()


def test_info_has_https_sources_area_timezones_and_country_codes() -> None:
    for info in MARKET_INFO.values():
        assert info.source_url.startswith("https://")
        assert "/" in info.timezone
        assert len(info.country_code) == 2
        assert info.country_code.isupper()


def test_market_combines_library_and_info() -> None:
    market = get_market("XSAU")

    assert market.name == "Saudi Exchange (Tadawul)"
    assert market.timezone == "Asia/Riyadh"
    assert market.weekend == [4, 5]
    assert market.categories == ["public"]
    assert market.first_year == 2020


def test_half_day_markets_list_both_categories() -> None:
    assert get_market("XNYS").categories == ["half_day", "public"]


def test_unknown_market() -> None:
    with pytest.raises(UnknownMarketError):
        get_market("NYSE")


def test_markets_are_sorted_by_code() -> None:
    codes = [market.code for market in list_markets()]

    assert codes == sorted(market_codes())
