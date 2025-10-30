import datetime
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from routes.base import CRUDRouterFactory, get
from models.transaction import Transaction, TransactionPartial, TransactionWithId

router = APIRouter()

factory = CRUDRouterFactory(router, "transactions", Transaction, TransactionPartial, TransactionWithId, "hash")
factory.create_get()
factory.create_post()
factory.create_patch()
factory.create_delete()

@router.get("/{year}/{month}", response_model=list[TransactionWithId])
async def create_tag(year: int, month: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = datetime.date(year, month, 1)
    end = (start + datetime.timedelta(days=32)).replace(day=1)
    return await get(db, "transactions", TransactionWithId, {"date": {"$gte": start.isoformat(), "$lt": end.isoformat()}})
