import hashlib
import datetime
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from routes.sources.millennium import MillenniumRequest, create_millennium_transaction
from routes.sources.revolut import RevolutRequest, create_revolut_transaction
from models.transaction import TransactionWithId
from routes.base import create, fail_wrapper, get
from models.source import Source, SourceParsed
from models.base import PyBaseModel
from core.db import get_db


router = APIRouter()

@router.get("", response_model=list[str])
async def get_sources():
    return [source.value for source in Source]


def hash(data: PyBaseModel) -> str:
    data_str = str({k: v for k, v in data.model_dump().items() if k != "id"})
    return hashlib.sha256(data_str.encode()).hexdigest()


@router.get("/parsed/{source}/{hash}", response_model=SourceParsed | None)
async def check_parsed(source: Source, hash: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "source_parsed", SourceParsed, {"hash": hash, "source": source.value}, one=True)


@router.post("/parsed/{source}/{hash}", response_model=SourceParsed | None)
async def mark_parsed(source: Source, hash: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    item = SourceParsed(source=source, hash=hash, date=datetime.date.today())
    return await create(db, "source_parsed", SourceParsed, item, "hash")


@router.post("/Millennium", response_model=dict)
async def create_transaction_from_millennium(data: MillenniumRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        hash_value = hash(data)
        # check if already parsed
        parsed = await check_parsed(Source.MILLENNIUM, hash_value, db)
        if parsed: return {}
        # create new
        await create_millennium_transaction(data, db)
        # mark as parsed
        await mark_parsed(Source.MILLENNIUM, hash_value, db)
        return {}
    return await inner()


@router.post("/Revolut/{owner}", response_model=dict)
async def create_transaction_from_revolut(data: RevolutRequest, owner: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        hash_value = hash(data)
        # check if already parsed
        parsed = await check_parsed(Source.REVOLUT, hash_value, db)
        if parsed: return {}
        # create new
        await create_revolut_transaction(data, owner, db)
        # mark as parsed
        await mark_parsed(Source.REVOLUT, hash_value, db)
        return {}
    return await inner()
