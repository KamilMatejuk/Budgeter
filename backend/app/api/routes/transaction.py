from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from app.models.transaction import Transaction
from app.models.user import PyObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db  # zakładamy, że masz funkcję zależności
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[Transaction])
async def get_transactions(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    transactions = await db["transactions"].find({"user_id": ObjectId(user_id)}).to_list(100)
    return transactions

@router.post("/", response_model=Transaction)
async def create_transaction(data: Transaction, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = data.dict(by_alias=True)
    result = await db["transactions"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc
