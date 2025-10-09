from datetime import datetime

from models.tag import Tag
from models.base import PyBaseModel, Partial, WithId


class Transaction(PyBaseModel):
    hash: str
    card: str
    date: datetime
    title: str
    organisation: str
    value: float
    tags: list[Tag]


class TransactionPartial(Transaction, metaclass=Partial): pass
class TransactionWithId(Transaction, metaclass=WithId): pass
