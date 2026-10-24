from collections.abc import Mapping
from dataclasses import dataclass
from datetime import date
from typing import Literal

from app.core.calendar import Category

DifferenceKind = Literal["missing_in_library", "extra_in_library", "category_differs"]


@dataclass(frozen=True)
class Difference:
    date: date
    kind: DifferenceKind
    library: Category | None
    official: Category | None


def compare(
    library: Mapping[date, Category], official: Mapping[date, Category]
) -> list[Difference]:
    found = []
    for day in sorted(library.keys() | official.keys()):
        lib, off = library.get(day), official.get(day)
        if lib == off:
            continue
        kind: DifferenceKind = (
            "missing_in_library"
            if lib is None
            else "extra_in_library"
            if off is None
            else "category_differs"
        )
        found.append(Difference(day, kind, lib, off))
    return found
