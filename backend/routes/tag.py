from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import get, create, patch, delete
from models.tag import Tag, TagPartial
from core.db import get_db


router = APIRouter()


@router.get("/", response_model=list[Tag])
async def get_tags(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "tags", Tag)


@router.post("/", response_model=Tag)
async def create_tag(data: Tag, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await create(db, "tags", Tag, data)


@router.patch("/", response_model=TagPartial)
async def get_sources(data: TagPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await patch(db, "sources", TagPartial, data)


@router.delete("/{id}")
async def delete_tag(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await delete(db, "tags", id)
