from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import get, create, patch, delete
from models.source import Source, SourcePartial
from core.db import get_db

router = APIRouter()


@router.get("/", response_model=list[Source])
async def get_sources(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "sources", Source)


@router.get("/{name}", response_model=Source)
async def get_source_by_name(name: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db["sources"].find_one({"name": name})
    if result is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return Source.model_validate({**result, "_id": str(result["_id"])})


@router.post("/", response_model=Source)
async def create_source(data: Source, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await create(db, "sources", Source, data, "name")


@router.patch("/", response_model=SourcePartial)
async def patch_sources(data: SourcePartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await patch(db, "sources", SourcePartial, data)


@router.delete("/{id}")
async def delete_source(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await delete(db, "sources", id)
