from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.base import get, create, patch, delete
from models.transaction import Transaction, TransactionPartial
from core.db import get_db


router = APIRouter()

@router.get("/", response_model=list[Transaction])
async def get_transactions(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "transactions", Transaction)

@router.post("/", response_model=Transaction)
async def create_transaction(data: Transaction, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await create(db, "transactions", Transaction, data)

@router.patch("/", response_model=TransactionPartial)
async def get_sources(data: TransactionPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await patch(db, "sources", TransactionPartial, data)

@router.delete("/{id}")
async def delete_transaction(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await delete(db, "transactions", id)
