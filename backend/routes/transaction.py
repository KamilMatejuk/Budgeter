import datetime
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from routes.base import CRUDRouterFactory, fail_wrapper, get, patch
from models.transaction import Transaction, TransactionPartial, TransactionWithId

router = APIRouter()

factory = CRUDRouterFactory(router, "transactions", Transaction, TransactionPartial, TransactionWithId, "hash")
factory.create_get_by_id()
factory.create_post()
factory.create_patch()


@router.get("/{year}/{month}", response_model=list[TransactionWithId])
async def get_transactions_monthly(year: int, month: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = datetime.date(year, month, 1)
    end = (start + datetime.timedelta(days=32)).replace(day=1)
    return await get(db, "transactions", TransactionWithId, {"deleted": False, "date": {"$gte": start.isoformat(), "$lt": end.isoformat()}})


@router.delete("/{id}", response_model=dict)
async def delete_transaction(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": id}, one=True)
        transaction.deleted = True
        await patch(db, "transactions", TransactionPartial, transaction)
        return {}
    return await inner()
