from models.base import PyBaseModel, Partial, WithId


class Organisation(PyBaseModel):
    pattern: str
    name: str
    icon: str | None = None


class OrganisationPartial(Organisation, metaclass=Partial): pass
class OrganisationWithId(Organisation, metaclass=WithId): pass
