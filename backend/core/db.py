import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from core.logger import get_logger

logger = get_logger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "expense_tracker")


client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase | None = None


async def get_db(): return db


async def setup_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB_NAME]
    logger.debug(f"Connected to MongoDB at {MONGO_URL}, using database {MONGO_DB_NAME}")
    await create_indexes(db)
    # await clear_db(db)


async def create_indexes(db: AsyncIOMotorDatabase):
    await db["transactions"].drop_indexes()
    await db["transactions"].create_index("hash", unique=True)
    logger.debug("Created indexes")


async def clear_db(db: AsyncIOMotorDatabase):
    await db["transactions"].delete_many({})
    await db["card_monthly_history"].delete_many({})
    logger.debug("Cleared database")
