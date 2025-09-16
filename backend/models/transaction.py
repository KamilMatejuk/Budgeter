from datetime import datetime

from models.tag import Tag
from models.base import PyBaseModel
from models.optional import Partial


class Transaction(PyBaseModel):
    identification: str
    card: str
    date: datetime
    title: str
    organisation: str
    value: float
    tags: list[Tag]

    model_config = {
        **PyBaseModel.model_config,
    }


class TransactionPartial(Transaction, metaclass=Partial):
    pass
