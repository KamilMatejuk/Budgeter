from models.base import PyBaseModel, Partial, WithId
from routes.tag import TagRichWithId

class Organisation(PyBaseModel):
    patterns: list[str]
    name: str
    tags: list[str]
    icon: str | None = None


class OrganisationPartial(Organisation, metaclass=Partial): pass
class OrganisationWithId(Organisation, metaclass=WithId): pass

class OrganisationRich(Organisation): tags: list[TagRichWithId]
class OrganisationRichWithId(OrganisationRich, metaclass=WithId): pass
