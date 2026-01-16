import enum
from datetime import date
from models.products import Currency
from models.tag import TagRichWithId
from models.base import PyBaseModel, WithId


class CardMonthlyHistory(PyBaseModel):
    year: int
    month: int
    card: str # id of Card
    transactions: int


class AccountDailyHistory(PyBaseModel):
    date: date
    account: str # id of Account
    value: float


class ChartRange(enum.Enum):
    _3M = "3M"
    _1Y = "1Y"
    _FULL = "FULL"


class MonthComparisonRow(PyBaseModel, metaclass=WithId):
    tag: TagRichWithId
    values: list[float]
    value_avg: float
    currency: Currency
    subitems: list["MonthComparisonRow"] = []


class TagCompositionItem(PyBaseModel):
    tag_name: str # name of Tag
    value: float
    colour: str

class TagComposition(PyBaseModel, metaclass=WithId):
    tag: TagRichWithId
    values_total: list[TagCompositionItem]
    values_year: list[TagCompositionItem]
    values_month: list[TagCompositionItem]
