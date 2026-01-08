import datetime
from functools import cache
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from models.tag import Tag
from core.utils import Value, Date
from models.base import PyBaseModel, PyObjectId
from models.products import CardWithId
from routes.tag import get_children, get_all_children
from routes.base import fail_wrapper, get, patch, create
from models.transaction import TransactionWithId
from models.products import PersonalAccountWithId, Currency
from models.history import AccountDailyHistory, CardMonthlyHistory, ChartRange, MonthComparisonRow

router = APIRouter()


################################ Requirements #################################

class CardRequirementsResponse(PyBaseModel):
    card: CardWithId
    remaining: int | float

class AccountRequirementsResponse(PyBaseModel):
    account: PersonalAccountWithId
    remaining: int | float

@router.get("/requirements/cards", response_model=list[CardRequirementsResponse])
async def get_required_card_transactions(db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        today = Date.today()
        cards: list[CardWithId] = await get(db, "card", CardWithId, {"active": True})
        responses = []
        for c in cards:
            required = c.min_number_of_transactions_monthly or 0
            if required == 0:
                responses.append(CardRequirementsResponse(card=c, remaining=0))
                continue
            condition = {"card": str(c.id), "year": today.year, "month": today.month}
            history: CardMonthlyHistory = await get(db, "card_monthly_history", CardMonthlyHistory, condition, one=True)
            if not history:
                responses.append(CardRequirementsResponse(card=c, remaining=required))
                continue
            remaining = max(required - history.transactions, 0)
            responses.append(CardRequirementsResponse(card=c, remaining=remaining))
        return responses
    return await inner()

@router.get("/requirements/accounts/in", response_model=list[AccountRequirementsResponse])
async def get_required_account_amount_in(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await _get_required_account_amount(db, "min_incoming_amount_monthly", lambda t: t.value > 0)

@router.get("/requirements/accounts/out", response_model=list[AccountRequirementsResponse])
async def get_required_account_amount_out(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await _get_required_account_amount(db, "min_outgoing_amount_monthly", lambda t: t.value < 0)

@fail_wrapper
async def _get_required_account_amount(db, key, filtr):
    start = Date.this_month()
    end = Date.month_end(start)
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    responses = []
    for a in accounts:
        required = getattr(a, key, 0)
        if required == 0:
            responses.append(AccountRequirementsResponse(account=a, remaining=0))
            continue
        condition = {"account": str(a.id), "deleted": False, "date": Date.condition(start, end)}
        history: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition)
        if not history:
            responses.append(AccountRequirementsResponse(account=a, remaining=required))
            continue
        done = abs(sum(t.value for t in history if filtr(t)))
        remaining = max(required - done, 0)
        responses.append(AccountRequirementsResponse(account=a, remaining=remaining))
    return responses


################################ Account Value #################################

def _range_to_dates(range: ChartRange):
    this_month = Date.this_month()
    if range == ChartRange._3M:
        start = Date.add_months(this_month, -2)
    elif range == ChartRange._1Y:
        start = Date.add_months(this_month, -11)
    elif range == ChartRange._FULL:
        start = None
    else:
        raise ValueError(f"Invalid range {range}")
    return start


@router.get("/account_value/{range}", response_model=list[float])
async def get_total_account_values(range: ChartRange, db: AsyncIOMotorDatabase = Depends(get_db)):
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    response = {}
    for account in accounts:
        account_values = await get_account_values(str(account.id), range, db)
        # index end-to-start
        account_values = [(len(account_values) - i, a) for i, a in enumerate(account_values)]
        for i, val in account_values:
            response[i] = Value.add(response.get(i, 0.0), val)
    sorted_response = sorted(response.items(), key=lambda x: x[0], reverse=True)
    return [val for _, val in sorted_response]

@router.get("/account_value/{range}/{id}", response_model=list[float])
async def get_account_values(id: str, range: ChartRange, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        start = _range_to_dates(range)
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": id}, one=True)
        # get history
        condition = {"account": str(account.id)}
        if start is not None:
            condition["date"] = {"$gte": start.isoformat()}
        history: list[AccountDailyHistory] = (await get(db, "account_daily_history", AccountDailyHistory, condition, "date"))[::-1]
        # expand to full month
        before: AccountDailyHistory = await get(
            db, "account_daily_history", AccountDailyHistory,
            {"account": str(account.id), "date": {"$lte": start.isoformat()}},
            "date", one=True
        ) if start is not None else history[0]
        current_value = before.value if before else 0.0
        response = []
        record_index = 0
        for current_date in Date.iterate_days(start if start is not None else history[0].date):
            if (record_index < len(history)) and (history[record_index].date == current_date):
                current_value = history[record_index].value
                record_index += 1
            response.append(current_value)
        return response
    return await inner()


class PatchAccountValueRequest(PyBaseModel):
    date: datetime.date
    value: float

@router.patch("/account_value", response_model=dict)
async def patch_account_value(data: PatchAccountValueRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(data.id)}, one=True)
        before: AccountDailyHistory = await get(db, "account_daily_history", AccountDailyHistory,
                                                {"account": str(account.id), "date": {"$lte": data.date.isoformat()}}, "date", one=True)
        diff = data.value - (before.value if before else 0.0)
        # add curr day
        if before.date == data.date:
            before.value = data.value
            before.manual_update = True
            await patch(db, "account_daily_history", AccountDailyHistory, before)
        else:
            before = AccountDailyHistory(account=str(account.id), date=data.date.isoformat(), value=data.value, manual_update=True)
            await create(db, "account_daily_history", AccountDailyHistory, before)
        # update all following days
        history: list[AccountDailyHistory] = await get(db, "account_daily_history", AccountDailyHistory,
                                                       {"date": {"$gte": data.date.isoformat()}, "account": str(account.id)}, "date")
        for i, record in enumerate(history):
            new_value = Value.add(record.value, diff)
            await db["account_daily_history"].update_one({"_id": record.id}, {"$set": {"value": new_value, "manual_update": i == 0}})
        # update final value
        account.value = Value.add(account.value, diff)
        await patch(db, "personal_account", PersonalAccountWithId, account)
        return {}
    return await inner()

################################ Income/Expense ###############################

@router.get("/income_expense/{range}", response_model=tuple[list[float], list[float]])
async def get_total_income_expense(range: ChartRange, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = _range_to_dates(range)
    if start is None:
        start = (await get(db, "transactions", TransactionWithId, None, "date", one=True, reverse=False)).date
    incomes = []
    expenses = []
    for month in Date.iterate_months(start):
        condition = {
            "deleted": False,
            "date": Date.condition(month, Date.month_end(month)),
            "$or": [{"debt_person": None}, {"debt_person": ""}],
        }
        transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition)
        incomes.append(sum(t.value for t in transactions if t.value > 0))
        expenses.append(sum(t.value for t in transactions if t.value < 0))
    return (incomes, expenses)

############################## Monthly Comparison #############################

@router.get("/month_comparison/{year}/{month}", response_model=list[MonthComparisonRow])
async def get_month_comparison(year: int, month: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    root_tags = await get(db, "tags", Tag, {"parent": None})
    response = []
    for tag in root_tags:
        row = await _calculate_tag_comparison(tag, year, month, db)
        response.append(row)
    return response

# @cache
async def _calculate_tag_comparison(tag: Tag, year: int, month: int, db: AsyncIOMotorDatabase) -> MonthComparisonRow:
    start_current = datetime.date(year, month, 1)
    start_prev = Date.add_months(start_current, -1)
    start_last_year = datetime.date(year - 1, month, 1)
    tags = await get_all_children(tag, db)
    condition = { "deleted": False, "tags": {"$in": [str(tag.id)] + [str(t.id) for t in tags]} }
    # TODO - convert to PLN
    # TODO calculate all months for all tags, then calculate averages and select specific months
    # TODO include other (not tagged)

    transactions_current: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, {
        **condition,
        "date": Date.condition(start_current, Date.month_end(start_current))
    })
    value_current = Value.sum(t.value for t in transactions_current)
    
    transactions_prev: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, {
        **condition,
        "date": Date.condition(start_prev, Date.month_end(start_prev))
    })
    value_prev = Value.sum(t.value for t in transactions_prev)
    
    transactions_last_year: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, {
        **condition,
        "date": Date.condition(start_last_year, Date.month_end(start_last_year))
    })
    value_last_year = Value.sum(t.value for t in transactions_last_year)
    
    transactions_total: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition)
    months_count = max(1, len(set((Date.to_string(t.date)[:7] for t in transactions_total))))
    value_avg = Value.divide(Value.sum(t.value for t in transactions_total), months_count)

    subitems = []
    for child in await get_children(tag, db):
        subitem = await _calculate_tag_comparison(child, year, month, db)
        subitems.append(subitem)

    return MonthComparisonRow(
        _id=str(PyObjectId()),
        tag=str(tag.id),
        currency=Currency.PLN,
        value=value_current,
        value_avg=value_avg,
        value_prev_month=value_prev,
        value_2nd_month=0,
        value_last_year=value_last_year,
        subitems=subitems
    )
