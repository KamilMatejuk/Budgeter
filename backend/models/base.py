from bson import ObjectId
from typing import Any, Optional
from pydantic_core import core_schema
from pydantic import BaseModel, Field, GetCoreSchemaHandler
from pydantic._internal._model_construction import ModelMetaclass


# Custom override for PyObjectId to handle MongoDB ObjectId serialization in Pydantic models


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


# Metaclass to create a new model with all fields optional for PATCH requests


class Partial(ModelMetaclass):
    def __new__(self, name, bases, namespaces, **kwargs):
        annotations = namespaces.get('__annotations__', {})
        for base in bases:
            annotations.update(base.__annotations__)
        for field in annotations:
            if not field.startswith('__'):
                annotations[field] = Optional[annotations[field]]
                namespaces.setdefault(field, None)
        namespaces['__annotations__'] = annotations
        return super().__new__(self, name, bases, namespaces, **kwargs)


# Metaclass to create a new model with `id` required for CRUD responses


class WithId(ModelMetaclass):
    def __new__(mcls, name, bases, namespaces, **kwargs):
        annotations = namespaces.get('__annotations__', {})
        for base in bases:
            annotations.update(base.__annotations__)
        annotations["id"] = PyObjectId
        namespaces['__annotations__'] = annotations
        namespaces["id"] = Field(..., alias="_id")
        return super().__new__(mcls, name, bases, namespaces, **kwargs)
