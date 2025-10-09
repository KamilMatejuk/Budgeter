from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import CRUDRouterFactory, get
from models.source import Source, SourcePartial, SourceWithId
from core.db import get_db

router = APIRouter()

factory = CRUDRouterFactory(router, "sources", Source, SourcePartial, SourceWithId, "name")
factory.create_get()
factory.create_post()
factory.create_patch()
factory.create_delete()

@router.get("/{name}", response_model=Source)
async def get_source_by_name(name: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "sources", Source, {"name": name}, one=True)
