from motor.motor_asyncio import AsyncIOMotorDatabase

from models.history import CardMonthlyHistory, AccountDailyHistory
from models.products import CardWithId, PersonalAccountWithId
from models.organisation import OrganisationWithId
from core.utils import Value
from routes.base import get


async def mark_card_usage_in_history(card: CardWithId, date: str, db: AsyncIOMotorDatabase):
    year = int(date.split("-")[0])
    month = int(date.split("-")[1])
    condition = {"card": str(card.id), "year": year, "month": month}
    history: CardMonthlyHistory = await get(db, "card_monthly_history", CardMonthlyHistory, condition, one=True)
    if history is None:
        history = CardMonthlyHistory(year=year, month=month, card=str(card.id), transactions=1)
        await db["card_monthly_history"].insert_one(
            history.model_dump(by_alias=True, mode="json"))
    else:
        await db["card_monthly_history"].update_one(
            {"_id": str(history.id)},
            {"$set": {"transactions": history.transactions + 1}})


async def mark_transaction_in_history(account: PersonalAccountWithId, date: str, value: float, db: AsyncIOMotorDatabase):
    history: AccountDailyHistory = await get(db, "account_daily_history", AccountDailyHistory, {"account": str(account.id), "date": date}, one=True)
    if history is None:
        history = AccountDailyHistory(account=str(account.id), date=date, value=value)
        await db["account_daily_history"].insert_one(
            history.model_dump(by_alias=True, mode="json"))
    else:
        await db["account_daily_history"].update_one(
            {"_id": str(history.id)},
            {"$set": {"value": Value.add(history.value, value)}})
    # update all future dates until manual_update is True
    async for doc in db["account_daily_history"].find({"account": str(account.id), "date": {"$gt": date}}):
        if doc.get("manual_update", False): break
        await db["account_daily_history"].update_one({"_id": doc["_id"]}, {"$set": {"value": Value.add(doc["value"], value)}})
    # update current value of the account
    latest: AccountDailyHistory = await get(db, "account_daily_history", AccountDailyHistory, sort="date", one=True)
    value = latest.value if latest else 0.0
    await db["personal_account"].update_one({"_id": str(account.id)}, {"$set": {"value": value}})


async def match_organisation_pattern(name: str, db: AsyncIOMotorDatabase):
    for org in await get(db, "organisations", OrganisationWithId):
        if org.pattern.lower() in name.lower():
            return org.name
    return name
