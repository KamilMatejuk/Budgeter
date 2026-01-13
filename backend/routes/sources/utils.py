from motor.motor_asyncio import AsyncIOMotorDatabase

from models.history import CardMonthlyHistory, AccountDailyHistory
from models.products import CardWithId, PersonalAccountWithId
from models.organisation import OrganisationWithId
from core.utils import Value
from routes.base import get, patch, create


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


async def _update_daily_history(account: PersonalAccountWithId, date: str, value: float, db: AsyncIOMotorDatabase):
    history_on_this_day: AccountDailyHistory = await get(db, "account_daily_history", AccountDailyHistory,
                                                         {"account": str(account.id), "date": date}, one=True)
    if history_on_this_day:
        # update this day
        history_on_this_day.value = Value.add(history_on_this_day.value, value)
        return await patch(db, "account_daily_history", AccountDailyHistory, history_on_this_day)

    history_before: AccountDailyHistory = await get(db, "account_daily_history", AccountDailyHistory,
                                                    {"account": str(account.id), "date": {"$lt": date}}, "date", one=True)
    if history_before:
        # create new based on previous
        value = Value.add(history_before.value, value)
        history_on_this_day = AccountDailyHistory(account=str(account.id), date=date, value=value)
        return await create(db, "account_daily_history", AccountDailyHistory, history_on_this_day)

    # create new from scratch
    history_on_this_day = AccountDailyHistory(account=str(account.id), date=date, value=value)
    return await create(db, "account_daily_history", AccountDailyHistory, history_on_this_day)

    
async def mark_account_value_in_history(account: PersonalAccountWithId, date: str | None, value: float, db: AsyncIOMotorDatabase):
    # if no date, update all dates
    if date: await _update_daily_history(account, date, value, db)
    condition = {"account": str(account.id)}
    if date: condition["date"] = {"$gt": date}
    async for doc in db["account_daily_history"].find(condition):
        await db["account_daily_history"].update_one({"_id": doc["_id"]}, {"$set": {"value": Value.add(doc["value"], value)}})
    # update current value of the account
    latest: AccountDailyHistory = await get(db, "account_daily_history", AccountDailyHistory, {"account": str(account.id)}, "date", one=True)
    value = latest.value if latest else 0.0
    await db["personal_account"].update_one({"_id": str(account.id)}, {"$set": {"value": value}})


async def match_organisation_pattern(name: str, db: AsyncIOMotorDatabase):
    for org in await get(db, "organisations", OrganisationWithId):
        if org.pattern.lower() in name.lower():
            return org.name
    return name
