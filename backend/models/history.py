import enum
from datetime import date
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


class ComparisonItemRecursive(PyBaseModel, metaclass=WithId):
    tag: TagRichWithId
    value_pln: float
    children: list["ComparisonItemRecursive"] = []

class Comparison(PyBaseModel, metaclass=WithId):
    month: int
    year: int
    value_pln: float
    transactions: int
    children_tags: list[ComparisonItemRecursive] = [] # mapping of each include tag id to its children comparison
    other_tags: list[ComparisonItemRecursive] = [] # mapping of each include tag id to other tags comparison
