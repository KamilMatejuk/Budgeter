import traceback
from fastapi import HTTPException, APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.base import PyBaseModel
from core.logger import get_logger
from core.db import get_db


LOGGER = get_logger(__name__)


def fail_wrapper(func):
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            LOGGER.error(str(e))
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
    return wrapper


@fail_wrapper
async def get(db: AsyncIOMotorDatabase, table: str, model: type[PyBaseModel], condition: dict = None, one: bool = False):
    results = []
    cursor = db[table].find(condition or {})
    async for doc in cursor:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        results.append(model.model_validate(doc))
    if one:
        return results[0] if len(results) > 0 else None
    return results


@fail_wrapper
async def create(db: AsyncIOMotorDatabase, table: str, model: type[PyBaseModel], data: PyBaseModel, unique_field: str = None):
    if unique_field and hasattr(data, unique_field):
        unique_value = getattr(data, unique_field)
        existing = await db[table].find_one({unique_field: unique_value})
        if existing:
            LOGGER.warning(f'Trying to create {data} failed unique constraint of {existing} in table {table}')
            return model.model_validate({**existing, "_id": str(existing["_id"])})
    data.id = str(data.id)
    doc = data.model_dump(by_alias=True, mode="json")
    result = await db[table].insert_one(doc)
    return model.model_validate({**doc, "_id": str(result.inserted_id)})


@fail_wrapper
async def patch(db: AsyncIOMotorDatabase, table: str, model: type[PyBaseModel], data: PyBaseModel):
    data = data.model_copy(deep=True, update={"id": str(data.id)})
    doc = data.model_dump(by_alias=True, exclude_unset=True, mode="json")
    id = doc.pop("_id", None)
    result = await db[table].update_one({"_id": id}, {"$set": doc})
    if result.matched_count == 0:
        raise ValueError(f"Document with id={id} not found")
    updated = await db[table].find_one({"_id": id})
    return model.model_validate({**updated, "_id": str(id)})


@fail_wrapper
async def delete(db: AsyncIOMotorDatabase, table: str, id: str):
    result = await db[table].delete_one({"_id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {}


class CRUDRouterFactory:
    def __init__(
        self,
        router: APIRouter,
        table: str,
        model: type[PyBaseModel],
        partial_model: type[PyBaseModel],
        model_with_id: type[PyBaseModel],
        unique_field: str | None = None,
    ):
        self.router = router
        self.table = table
        self.model = model
        self.partial_model = partial_model
        self.model_with_id = model_with_id
        self.unique_field = unique_field

    def create_get(self):
        # define GET function
        async def f(db: AsyncIOMotorDatabase = Depends(get_db)):
            return await get(db, self.table, self.model_with_id)
        # update name and annotations for OpenAPI
        f.__annotations__["return"] = list[self.model_with_id]
        f.__name__ = f"get_{self.model.__name__.lower()}s"
        # register route
        self.router.get("/", response_model=list[self.model_with_id])(f)

    def create_post(self):
        # define POST function
        async def f(data, db: AsyncIOMotorDatabase = Depends(get_db)):
            return await create(db, self.table, self.model_with_id, data, self.unique_field)
        # update name and annotations for OpenAPI
        f.__annotations__["data"] = self.model
        f.__annotations__["return"] = self.model_with_id
        f.__name__ = f"create_{self.model.__name__.lower()}"
        # register route
        self.router.post("/", response_model=self.model_with_id)(f)

    def create_patch(self):
        # define PATCH function
        async def f(data, db: AsyncIOMotorDatabase = Depends(get_db)):
            return await patch(db, self.table, self.model_with_id, data)
        # update name and annotations for OpenAPI
        f.__annotations__["data"] = self.partial_model
        f.__annotations__["return"] = self.model_with_id
        f.__name__ = f"patch_{self.model.__name__.lower()}"
        # register route
        self.router.patch("/", response_model=self.model_with_id)(f)

    def create_delete(self):
        # define DELETE function
        async def f(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
            return await delete(db, self.table, id)
        # update name and annotations for OpenAPI
        f.__annotations__["return"] = dict
        f.__name__ = f"delete_{self.model.__name__.lower()}"
        # register route
        self.router.delete("/{id}", response_model=dict)(f)
