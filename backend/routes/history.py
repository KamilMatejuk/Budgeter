import datetime
from fastapi import APIRouter, Depends
from models.products import CardWithId
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from models.base import PyBaseModel
from routes.base import fail_wrapper, get
from models.transaction import TransactionWithId
from models.products import PersonalAccountWithId
from models.history import AccountDailyHistory, CardMonthlyHistory


router = APIRouter()


################################ Requirements #################################

class RequirementsResponse(PyBaseModel):
    name: str
    remaining: int | float

@router.get("/requirements/cards", response_model=list[RequirementsResponse])
async def get_required_card_transactions(db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        today = datetime.datetime.now()
        cards: list[CardWithId] = await get(db, "card", CardWithId, {"active": True})
        responses = []
        for c in cards:
            required = c.min_number_of_transactions_monthly or 0
            if required == 0:
                continue
            condition = {"card": str(c.id), "year": today.year, "month": today.month}
            history: CardMonthlyHistory = await get(db, "card_monthly_history", CardMonthlyHistory, condition, one=True)
            if not history:
                responses.append(RequirementsResponse(name=c.name, remaining=required))
            else:
                remaining = max(required - history.transactions, 0)
                if remaining > 0:
                    responses.append(RequirementsResponse(name=c.name, remaining=remaining))
        return responses
    return await inner()

@router.get("/requirements/accounts/in", response_model=list[RequirementsResponse])
async def get_required_account_amount_in(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await _get_required_account_amount(db, "min_incoming_amount_monthly", lambda t: t.value > 0)

@router.get("/requirements/accounts/out", response_model=list[RequirementsResponse])
async def get_required_account_amount_out(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await _get_required_account_amount(db, "min_outgoing_amount_monthly", lambda t: t.value < 0)

@fail_wrapper
async def _get_required_account_amount(db, key, filtr):
    today = datetime.datetime.now()
    start = datetime.date(today.year, today.month, 1)
    end = (start + datetime.timedelta(days=32)).replace(day=1)
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    responses = []
    for a in accounts:
        required = getattr(a, key, 0)
        if required == 0:
            continue
        condition = {"account": str(a.id), "deleted": False, "date": {"$gte": start.isoformat(), "$lt": end.isoformat()}}
        history: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition)
        if not history:
            responses.append(RequirementsResponse(name=a.name, remaining=required))
        else:
            done = abs(sum(t.value for t in history if filtr(t)))
            remaining = max(required - done, 0)
            if remaining > 0:
                responses.append(RequirementsResponse(name=a.name, remaining=remaining))
    return responses


################################ Account Value #################################

@router.get("/account_value/{year}", response_model=dict[str, list[float]])
async def get_account_values_yearly(year: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = datetime.date(year, 1, 1)
    end = (start + datetime.timedelta(days=366)).replace(day=1)
    if end > datetime.date.today():
        end = datetime.date.today() + datetime.timedelta(days=1)
    return await _get_account_values(start, end, db)

@router.get("/account_value/{year}/{month}", response_model=dict[str, list[float]])
async def get_account_values_monthly(year: int, month: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = datetime.date(year, month, 1)
    end = (start + datetime.timedelta(days=32)).replace(day=1)
    if end > datetime.date.today():
        end = datetime.date.today() + datetime.timedelta(days=1)
    return await _get_account_values(start, end, db)

@fail_wrapper
async def _get_account_values(start: datetime.date, end: datetime.date, db: AsyncIOMotorDatabase):
    response = {}
    # get accounts
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    # get history
    for account in accounts:
        condition = {"date": {"$gte": start.isoformat(), "$lt": end.isoformat()}, "account": str(account.id)}
        history: list[AccountDailyHistory] = await get(db, "account_daily_history", AccountDailyHistory, condition)
        # expand to full month
        before = await db["account_daily_history"].find_one({"account": str(account.id), "date": {"$lt": start.isoformat()}}, sort=[("date", -1)])
        current_value = before["value"] if before else 0.0
        full_records = []
        record_index = 0
        records = sorted(history, key=lambda x: x.date)
        for day in range(1, (end - start).days + 1):
            current_date = start + datetime.timedelta(days=day - 1)
            if (record_index < len(records)) and (records[record_index].date == current_date):
                current_value = records[record_index].value
                record_index += 1
            full_records.append(current_value)
        response[account.name] = full_records
    return response
