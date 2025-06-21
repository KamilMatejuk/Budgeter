from datetime import datetime

from models.tag import Tag
from models.base import PyBaseModel


class Transaction(PyBaseModel):
    date: datetime
    title: str
    shop: str
    value: float
    tags: list[Tag]

    model_config = {
        **PyBaseModel.model_config,
    }
