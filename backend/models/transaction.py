from datetime import date

from models.tag import Tag
from models.base import PyBaseModel, Partial, WithId


class Transaction(PyBaseModel):
    hash: str
    account: str # id of PersonalAccount
    date: date
    title: str
    organisation: str
    value: float
    tags: list[Tag]
    deleted: bool = False


class TransactionPartial(Transaction, metaclass=Partial): pass
class TransactionWithId(Transaction, metaclass=WithId): pass


class TransactionSplitRequestItem(PyBaseModel):
    title: str
    value: float

class TransactionSplitRequest(PyBaseModel):
    items: list[TransactionSplitRequestItem]
