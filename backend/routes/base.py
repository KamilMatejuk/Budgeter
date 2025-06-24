import traceback
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.base import PyObjectId, PyBaseModel


def fail_wrapper(func):
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
    return wrapper


@fail_wrapper
async def get(db: AsyncIOMotorDatabase, table: str, model: type[PyBaseModel]):
    results = []
    cursor = db[table].find()
    async for doc in cursor:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        results.append(model.model_validate(doc))
    return results


@fail_wrapper
async def create(db: AsyncIOMotorDatabase, table: str, model: type[PyBaseModel], data: PyBaseModel):
    data.id = str(data.id)
    doc = data.model_dump(by_alias=True)
    result = await db[table].insert_one(doc)
    return model.model_validate({**doc, "_id": str(result.inserted_id)})


@fail_wrapper
async def patch(db: AsyncIOMotorDatabase, table: str, model: type[PyBaseModel], data: PyBaseModel):
    data = data.model_copy(deep=True, update={"id": str(data.id)})
    doc = data.model_dump(by_alias=True, exclude_unset=True)
    id = PyObjectId(doc.pop("_id", None))
    print(f"Updating document with id={id} in table={table} with data={doc}")
    result = await db[table].update_one({"_id": id}, {"$set": doc})
    if result.matched_count == 0:
        raise ValueError(f"Document with id={id} not found")
    updated = await db[table].find_one({"_id": id})
    return model.model_validate({**updated, "_id": str(id)})


@fail_wrapper
async def delete(db: AsyncIOMotorDatabase, table: str, id: str):
    result = await db[table].delete_one({"_id": PyObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {}
