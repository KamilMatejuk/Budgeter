import enum
import datetime
from models.base import PyBaseModel


class Source(enum.Enum):
    MILLENNIUM = "Millennium"
    REVOLUT = "Revolut"
    EDENRED = "Edenred"


class SourceParsed(PyBaseModel):
    hash: str
    source: Source
    date: datetime.date

