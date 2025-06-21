from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.source import Source
from app.models.base import PyObjectId
from app.core.db import get_db


router = APIRouter()


@router.get("/", response_model=list[Source])
async def get_sources(db: AsyncIOMotorDatabase = Depends(get_db)):
    results = []
    cursor = db["sources"].find()
    async for doc in cursor:
        results.append(Source.model_validate(doc))
    return results


@router.post("/", response_model=Source)
async def create_source(data: Source, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = data.model_dump(by_alias=True)
    result = await db["sources"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


@router.delete("/{id}")
async def delete_source(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db["sources"].delete_one({"_id": PyObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Source not found")
    return {}
