from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from pydantic import GetJsonSchemaHandler
from pydantic_core import core_schema
from typing import Any

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            python_schema=core_schema.is_instance_schema(cls),
            json_schema=core_schema.str_schema(),
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler) -> dict:
        return {"type": "string", "format": "objectid"}

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class UserSettings(BaseModel):
    theme: Optional[str] = "light"
    starting_amount: float = 0.0

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: str
    settings: UserSettings = UserSettings()

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
