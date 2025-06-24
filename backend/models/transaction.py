from datetime import datetime

from models.tag import Tag
from models.base import PyBaseModel
from models.optional import Partial


class Transaction(PyBaseModel):
    date: datetime
    title: str
    shop: str
    value: float
    tags: list[Tag]

    model_config = {
        **PyBaseModel.model_config,
    }


class TransactionPartial(Transaction, metaclass=Partial):
    pass
