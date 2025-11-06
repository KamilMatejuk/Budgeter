from datetime import date
from models.base import PyBaseModel

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
