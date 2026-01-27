from motor.motor_asyncio import AsyncIOMotorDatabase

from models.products import PersonalAccountWithId
from models.history import AccountDailyHistory
from routes.base import get


async def remove_leading_zero_history(account: PersonalAccountWithId, db: AsyncIOMotorDatabase):
    hist: list[AccountDailyHistory] = await get(db, "account_daily_history", AccountDailyHistory,
                                                {"account": str(account.id)}, "date", reverse=False)
    to_remove = []
    for h in hist:
        if h.value != 0.0: break
        to_remove.append(h)
    # leave one zero record to avoid empty history
    if len(to_remove) > 1:
        to_remove = to_remove[:-1]
    for h in to_remove:
        await db["account_daily_history"].delete_one({"_id": str(h.id)})
