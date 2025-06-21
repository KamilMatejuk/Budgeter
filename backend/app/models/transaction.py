from datetime import datetime
from app.models.tag import Tag
from app.models.base import PyBaseModel


class Transaction(PyBaseModel):
    date: datetime
    title: str
    shop: str
    value: float
    tags: list[Tag]

    model_config = {
        **PyBaseModel.model_config,
    }
