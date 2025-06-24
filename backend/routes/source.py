from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import get, create, patch, delete
from models.source import Source, SourcePartial
from core.db import get_db

router = APIRouter()


@router.get("/", response_model=list[Source])
async def get_sources(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "sources", Source)

@router.post("/", response_model=Source)
async def create_source(data: Source, db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        return await create(db, "sources", Source, data)
    except HTTPException as e:
        if "duplicate key" in str(e):
            raise HTTPException(status_code=400, detail="Duplicate key error")
        raise e

@router.patch("/", response_model=SourcePartial)
async def get_sources(data: SourcePartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await patch(db, "sources", SourcePartial, data)

@router.delete("/{id}")
async def delete_source(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await delete(db, "sources", id)
