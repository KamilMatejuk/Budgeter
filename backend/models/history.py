import enum
from datetime import date
from models.base import PyBaseModel, WithId
from models.products import Currency


class CardMonthlyHistory(PyBaseModel):
    year: int
    month: int
    card: str # id of Card
    transactions: int


class AccountDailyHistory(PyBaseModel):
    date: date
    account: str # id of Account
    value: float
    manual_update: bool = False # if value was set manually, don't update with new transactions


class ChartRange(enum.Enum):
    _3M = "3M"
    _1Y = "1Y"
    _FULL = "FULL"


class MonthComparisonRow(PyBaseModel, metaclass=WithId):
    tag: str # id of Tag or plaintext name
    values: list[float]
    value_avg: float
    currency: Currency
    subitems: list["MonthComparisonRow"] = []
