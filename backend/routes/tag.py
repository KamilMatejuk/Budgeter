from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.tag import Tag
from models.base import PyObjectId
from core.db import get_db


router = APIRouter()


@router.get("/", response_model=list[Tag])
async def get_tags(db: AsyncIOMotorDatabase = Depends(get_db)):
    results = []
    cursor = db["tags"].find()
    async for doc in cursor:
        results.append(Tag.model_validate(doc))
    return results


@router.post("/", response_model=Tag)
async def create_tag(data: Tag, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = data.model_dump(by_alias=True)
    result = await db["tags"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


@router.delete("/{id}")
async def delete_tag(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db["tags"].delete_one({"_id": PyObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {}
