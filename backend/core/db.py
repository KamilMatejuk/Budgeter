import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "expense_tracker")


client: AsyncIOMotorClient = None


async def get_db() -> AsyncIOMotorDatabase:
    global client
    if client is not None:
        return client[MONGO_DB_NAME]
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB_NAME]
    # await clear_db(db)
    await create_indexes(db)
    return db


async def create_indexes(db: AsyncIOMotorDatabase):
    await db["sources"].create_index("name", unique=True)
    await db["transactions"].create_index("hash", unique=True)


async def clear_db(db: AsyncIOMotorDatabase):
    # await db["tags"].delete_many({})
    await db["transactions"].delete_many({})
    await db["card_monthly_history"].delete_many({})
    # await db.drop_collection("transactions")


