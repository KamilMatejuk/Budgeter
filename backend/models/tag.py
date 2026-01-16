import re
from pydantic import field_validator

from models.base import PyBaseModel, Partial, WithId


class Tag(PyBaseModel):
    name: str
    colour: str
    parent: str | None = None # id of parent tag
    children: list[str] | None = None # ids of child tags

    @field_validator("name")
    @classmethod
    def validate_name(cls: "Tag", v: str) -> str:
        if len(v) == 0: raise ValueError("Tag name cannot be empty")
        if len(v) > 100: raise ValueError("Tag name must be shorter than 100 characters")
        return v
    
    @field_validator("colour")
    @classmethod
    def validate_colour(cls: "Tag", v: str) -> str:
        v = v.strip().upper()
        m = re.match(r"^#[0-9A-F]{6}$", v)
        if not m: raise ValueError("Colour must be a valid hex code (e.g. #ff0000)")
        return v

class TagRequest(Tag):
    colour: str | None = None

class TagPartial(Tag, metaclass=Partial): pass
class TagWithId(Tag, metaclass=WithId): pass

class TagRich(PyBaseModel):
    name: str # parsed name of tag, including parents e.g. "Parent/Child"
    colour: str
class TagRichWithId(TagRich, metaclass=WithId): pass
