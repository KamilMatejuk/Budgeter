from datetime import datetime

from models.tag import Tag
from models.base import PyBaseModel
from models.optional import Partial


class Transaction(PyBaseModel):
    hash: str
    card: str
    date: datetime
    title: str
    organisation: str
    value: float
    tags: list[Tag]


class TransactionPartial(Transaction, metaclass=Partial):
    pass
