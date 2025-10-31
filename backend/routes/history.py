import datetime
from fastapi import APIRouter, Depends
from models.products import CardWithId
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from routes.base import get
from models.base import PyBaseModel
from models.history import CardMonthlyHistory
from models.products import PersonalAccountWithId
from models.transaction import TransactionWithId


router = APIRouter()


class RequirementsResponse(PyBaseModel):
    name: str
    remaining: int | float


@router.get("/requirements/cards", response_model=list[RequirementsResponse])
async def get_required_card_transactions(db: AsyncIOMotorDatabase = Depends(get_db)):
    today = datetime.datetime.now()
    cards: list[CardWithId] = await get(db, "card", CardWithId)
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

@router.get("/requirements/accounts/in", response_model=list[RequirementsResponse])
async def get_required_account_amount_in(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get_required_account_amount(db, "min_incoming_amount_monthly", lambda t: t.value > 0)

@router.get("/requirements/accounts/out", response_model=list[RequirementsResponse])
async def get_required_account_amount_out(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get_required_account_amount(db, "min_outgoing_amount_monthly", lambda t: t.value < 0)

async def get_required_account_amount(db, key, filtr):
    today = datetime.datetime.now()
    start = datetime.date(today.year, today.month, 1)
    end = (start + datetime.timedelta(days=32)).replace(day=1)
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    responses = []
    for a in accounts:
        required = getattr(a, key, 0)
        if required == 0:
            continue
        condition = {"account": str(a.id), "date": {"$gte": start.isoformat(), "$lt": end.isoformat()}}
        history: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition)
        if not history:
            responses.append(RequirementsResponse(name=a.name, remaining=required))
        else:
            done = abs(sum(t.value for t in history if filtr(t)))
            remaining = max(required - done, 0)
            if remaining > 0:
                responses.append(RequirementsResponse(name=a.name, remaining=remaining))
    return responses
