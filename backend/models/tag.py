from pydantic import BaseModel, field_validator, Field

from models.base import PyBaseModel


class Tag(PyBaseModel):
    name: str
    parent: str | None = None # id of parent tag
    children: list[str] | None = None # ids of child tags

    @field_validator("name")
    @classmethod
    def validate_name(cls: "Tag", v: str) -> str:
        if len(v) == 0: raise ValueError("Tag name cannot be empty")
        if len(v) > 100: raise ValueError("Tag name must be shorter than 100 characters")
        return v

    model_config = {
        "extra": "forbid",
        **PyBaseModel.model_config,
    }
