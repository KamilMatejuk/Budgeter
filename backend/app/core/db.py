from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "expense_tracker")

client: AsyncIOMotorClient = None

def get_client() -> AsyncIOMotorClient:
    global client
    if client is None:
        client = AsyncIOMotorClient(MONGO_URL)
    return client

def get_database() -> AsyncIOMotorDatabase:
    return get_client()[MONGO_DB_NAME]

async def get_db() -> AsyncIOMotorDatabase:
    return get_database()
