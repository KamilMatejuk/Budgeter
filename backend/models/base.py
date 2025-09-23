"""
Custom override for PyObjectId to handle MongoDB ObjectId serialization
and deserialization in Pydantic models.
"""

from bson import ObjectId
from pydantic import BaseModel, Field, GetCoreSchemaHandler
from pydantic_core import core_schema
from typing import Any


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, handler: GetCoreSchemaHandler) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema()
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: core_schema.CoreSchema, handler):
        return {"type": "string"}



class PyBaseModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    model_config = {
        "arbitrary_types_allowed": True,
        "extra": "forbid",
        "json_encoders": {
            PyObjectId: str,
        }
    }
