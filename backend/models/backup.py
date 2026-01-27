from datetime import datetime
from models.base import PyBaseModel, WithId


class BackupRequest(PyBaseModel):
    auto: bool
    name: str

class BackupPatchRequest(PyBaseModel):
    prev_name: str
    name: str

class BackupResponse(PyBaseModel, metaclass=WithId):
    name: str
    auto: bool
    timestamp: datetime
    size_mb: float
    description: str