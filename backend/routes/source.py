import hashlib
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.sources.millennium import MillenniumRequest, create_millennium_transaction
from routes.sources.revolut import RevolutRequest, create_revolut_transaction
from models.transaction import TransactionWithId
from routes.base import fail_wrapper, get
from models.source import Source
from core.db import get_db


router = APIRouter()

@router.get("", response_model=list[str])
async def get_sources():
    return [source.value for source in Source]


@router.post("/Millennium", response_model=TransactionWithId | dict)
async def create_transaction_from_millennium(data: MillenniumRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        hash = hashlib.sha256(str({k: v for k, v in data.model_dump().items() if k != "id"}).encode()).hexdigest()
        # check hash exists
        existing = await get(db, "transactions", TransactionWithId, {"hash": hash, "deleted": False}, one=True)
        if existing: return existing
        # create new
        if data.type == "": data.type = "PŁATNOŚĆ KARTĄ"
        return await create_millennium_transaction(hash, data, db)
    return await inner()


@router.post("/Revolut/{owner}", response_model=TransactionWithId | dict)
async def create_transaction_from_revolut(data: RevolutRequest, owner: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        hash = hashlib.sha256(str({k: v for k, v in data.model_dump().items() if k != "id"}).encode()).hexdigest()
        # check hash exists
        existing = await get(db, "transactions", TransactionWithId, {"hash": hash, "deleted": False}, one=True)
        if existing: return existing
        # create new
        return await create_revolut_transaction(hash, data, owner, db)
    return await inner()
