"""Create models with all field optional for PATCH requests"""

from pydantic._internal._model_construction import ModelMetaclass
from typing import Optional

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
