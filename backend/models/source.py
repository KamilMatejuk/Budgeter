from pydantic import field_validator

from models.base import PyBaseModel
from models.optional import Partial


class Source(PyBaseModel):
    name: str
    field_name_id: str | None
    field_name_card: str
    field_name_date: str
    field_name_title: str
    field_name_organisation: str
    field_name_value_positive: str
    field_name_value_negative: str
    starting_amount: float

    @field_validator("name",
                     "field_name_card",
                     "field_name_date",
                     "field_name_title",
                     "field_name_organisation",
                     "field_name_value_positive",
                     "field_name_value_negative")
    @classmethod
    def no_empty_field_names(cls, v: str) -> str:
        if not v.strip(): raise ValueError("Field cannot be empty")
        return v
    
    @field_validator("starting_amount")
    @classmethod
    def validate_starting_amount(cls, v: float) -> float:
        if v < 0: raise ValueError("starting_amount cannot be negative")
        return v

    model_config = {
        "extra": "forbid",
        **PyBaseModel.model_config,
    }


class SourcePartial(Source, metaclass=Partial):
    pass
