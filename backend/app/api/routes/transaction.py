from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.transaction import Transaction
from app.models.base import PyObjectId
from app.core.db import get_db


router = APIRouter()


@router.get("/", response_model=list[Transaction])
async def get_transactions(db: AsyncIOMotorDatabase = Depends(get_db)):
    results = []
    cursor = db["transactions"].find()
    async for doc in cursor:
        results.append(Transaction.model_validate(doc))
    return results


@router.post("/", response_model=Transaction)
async def create_transaction(data: Transaction, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = data.model_dump(by_alias=True)
    result = await db["transactions"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


@router.delete("/{id}")
async def delete_transaction(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db["transactions"].delete_one({"_id": PyObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {}
