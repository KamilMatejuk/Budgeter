import datetime
from async_lru import alru_cache
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from models.tag import TagWithId
from core.utils import Value, Date
from models.tag import TagRichWithId
from routes.base import fail_wrapper, get
from models.base import PyBaseModel, PyObjectId
from routes.transaction import enrich_transactions
from routes.utils import remove_leading_zero_history
from routes.sources.utils import mark_account_value_in_history
from models.transaction import TransactionRichWithId, TransactionWithId
from routes.tag import get_children, get_all_children_ids, get_name as get_tag_name, get_rich_tag, create_tags_condition, Join
from models.history import AccountDailyHistory, CardMonthlyHistory, ChartRange, MonthComparisonRow, TagComposition, TagCompositionItem, Comparison, ComparisonItemRecursive
from models.products import CardWithId, StockAccountWithId, CapitalInvestmentWithId, PersonalAccountWithId, Currency

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
    # accounts
    for account in accounts:
        account_values = await get_account_values(str(account.id), range, db)
        account_values = [(len(account_values) - i, a) for i, a in enumerate(account_values)] # index end-to-start
        for i, val in account_values: response[i] = Value.add(response.get(i, 0.0), val)
    # investments
    investment_values = await get_investments_values(range, db)
    investment_values = [(len(investment_values) - i, a) for i, a in enumerate(investment_values)] # index end-to-start
    for i, val in investment_values: response[i] = Value.add(response.get(i, 0.0), val)
    # total
    sorted_response = sorted(response.items(), key=lambda x: x[0], reverse=True)
    return [val for _, val in sorted_response]

@router.get("/account_value/{range}/{id}", response_model=list[float])
async def get_account_values(id: str, range: ChartRange, db: AsyncIOMotorDatabase = Depends(get_db)):
    if id == "Investments": return await get_investments_values(range, db)
    @fail_wrapper
    async def inner():
        start = _range_to_dates(range)
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": id}, one=True)
        # get history
        condition = {"account": str(account.id)}
        if start is not None:
            condition["date"] = {"$gte": start.isoformat()}
        history: list[AccountDailyHistory] = await get(db, "account_daily_history", AccountDailyHistory, condition, "date", reverse=False)
        first = history[0] if history else None
        # expand to full month
        before: AccountDailyHistory = await get(
            db, "account_daily_history", AccountDailyHistory,
            {"account": str(account.id), "date": {"$lte": start.isoformat()}},
            "date", one=True
        ) if start is not None else first
        current_value = before.value if before else 0.0
        response = []
        record_index = 0
        for current_date in Date.iterate_days(start if start is not None else first.date if first else Date.today()):
            if (record_index < len(history)) and (history[record_index].date == current_date):
                current_value = history[record_index].value
                record_index += 1
            response.append(current_value)
        return response
    return await inner()

async def get_investments_values(range: ChartRange, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        stock: list[StockAccountWithId] = await get(db, "stock_account", StockAccountWithId)
        capital: list[CapitalInvestmentWithId] = await get(db, "capital_investment", CapitalInvestmentWithId)
        stable_value = Value.sum(Value.multiply(s.value, Currency.convert(s.currency, Currency.PLN)) for s in stock)
        value_map = {}
        start_date = Date.today()
        for c in capital:
            if c.start < start_date: start_date = c.start
            for date in Date.iterate_days(c.start, c.end):
                value_map[date] = Value.add(value_map.get(date, 0.0), c.value)
        start = _range_to_dates(range)
        if start is None: start = start_date
        response = []
        record_index = 0
        for current_date in Date.iterate_days(start): # todo start None
            record_index += 1
            response.append(Value.add(stable_value, value_map.get(current_date, 0.0)))
        return response
    return await inner()


class PatchAccountValueRequest(PyBaseModel):
    value: float



@router.patch("/account_value", response_model=dict)
async def patch_account_value(data: PatchAccountValueRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(data.id)}, one=True)
        await mark_account_value_in_history(account, None, data.value, db)
        await remove_leading_zero_history(account, db)
        return {}
    return await inner()


################################ Income/Expense ###############################

@router.get("/income_expense/{range}", response_model=tuple[list[float], list[float]])
async def get_total_income_expense(range: ChartRange, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = _range_to_dates(range)
    if start is None:
        first: TransactionWithId = await get(db, "transactions", TransactionWithId, {"deleted": False}, "date", one=True, reverse=False)
        start = first.date if first else Date.today()
    incomes = []
    expenses = []
    for month in Date.iterate_months(start):
        condition = {
            "deleted": False,
            "date": Date.condition(month, Date.month_end(month)),
            "$or": [{"debt_person": None}, {"debt_person": ""}],
        }
        transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition)
        incomes.append(Value.sum(Value.multiply(t.value, Currency.convert(t.currency, Currency.PLN)) for t in transactions if t.value > 0))
        expenses.append(Value.sum(Value.multiply(t.value, Currency.convert(t.currency, Currency.PLN)) for t in transactions if t.value < 0))
    return (incomes, expenses)


############################## Monthly Comparison #############################

@router.get("/month_comparison", response_model=list[MonthComparisonRow])
async def get_month_comparison(db: AsyncIOMotorDatabase = Depends(get_db)):
    root_tags: list[TagWithId] = await get(db, "tags", TagWithId, {"parent": None})
    request_id = hash(datetime.datetime.now().isoformat())
    response = []
    for tag in sorted(root_tags, key=lambda t: t.name.lower()):
        row = await _calculate_tag_comparison(str(tag.id), request_id)
        response.append(row)
    return response

@alru_cache(maxsize=128)
async def _calculate_tag_comparison(tag_id: str, request_id: int) -> MonthComparisonRow:
    # request_id is to avoid cross-request caching
    db: AsyncIOMotorDatabase = await get_db()
    tag: TagWithId = await get(db, "tags", TagWithId, {"_id": tag_id}, one=True)
    first: TransactionWithId = await get(db, "transactions", TransactionWithId, {"deleted": False}, "date", one=True, reverse=False)
    # tag ids
    this_tag_id = [str(tag.id)]
    child_tag_ids = await get_all_children_ids(tag, db)    
    # values
    all_child_values = []
    this_tag_values = []
    for month in Date.iterate_months(first.date if first else Date.today()):
        condition = {
            "deleted": False,
            "date": Date.condition(month, Date.month_end(month)),
            "$or": [{"debt_person": None}, {"debt_person": ""}],
        }
        all_child_transactions: list[TransactionWithId] = await get(
            db, "transactions", TransactionWithId, {**condition, "tags": {"$in": this_tag_id + child_tag_ids}})
        this_tag_transactions: list[TransactionWithId] = await get(
            db, "transactions", TransactionWithId, {**condition, "tags": {"$in": this_tag_id, "$nin": child_tag_ids}})
        # sum and convert to PLN
        all_child_values.append(Value.sum(Value.multiply(t.value, Currency.convert(t.currency, Currency.PLN)) for t in all_child_transactions))
        this_tag_values.append(Value.sum(Value.multiply(t.value, Currency.convert(t.currency, Currency.PLN)) for t in this_tag_transactions))

    # children
    subitems = []
    children: list[TagWithId] = await get_children(tag, db)
    for child in sorted(children, key=lambda t: t.name.lower()):
        subitem = await _calculate_tag_comparison(str(child.id), request_id)
        subitems.append(subitem)

    rich_tag: TagRichWithId = await get_rich_tag(str(tag.id), db)
    # only include Other, if its not zero and there are other subitems
    if len(subitems) > 0 and any(v != 0 for v in this_tag_values):
        subitems.append(MonthComparisonRow(
            _id=str(PyObjectId()),
            tag=TagRichWithId(_id=str(PyObjectId()), name=f"{rich_tag.name}/Other", colour=rich_tag.colour),
            currency=Currency.PLN,
            values=this_tag_values,
            value_avg=Value.avg(this_tag_values),
            subitems=[]
        ))

    return MonthComparisonRow(
        _id=str(PyObjectId()),
        tag=rich_tag,
        currency=Currency.PLN,
        values=all_child_values,
        value_avg=Value.avg(all_child_values),
        subitems=subitems
    )


############################## Tag Composition #############################

@router.get("/tag_composition", response_model=list[TagComposition])
async def get_tag_composition(db: AsyncIOMotorDatabase = Depends(get_db)):
    root_tags: list[TagWithId] = await get(db, "tags", TagWithId, {"parent": None})
    request_id = hash(datetime.datetime.now().isoformat())
    response = []
    for tag in sorted(root_tags, key=lambda t: t.name.lower()):
        comp = await _calculate_tag_composition(str(tag.id), request_id)
        response.extend(comp)
    return response

@alru_cache(maxsize=128)
async def _calculate_tag_composition(tag_id: str, request_id: int) -> list[TagComposition]:
    # request_id is to avoid cross-request caching
    db: AsyncIOMotorDatabase = await get_db()
    tag: TagWithId = await get(db, "tags", TagWithId, {"_id": tag_id}, one=True)
    # tag ids
    this_tag_id = [str(tag.id)]
    child_tag_ids = await get_all_children_ids(tag, db)
    # values
    condition = {"deleted": False, "$or": [{"debt_person": None}, {"debt_person": ""}]}
    this_month = Date.this_month()
    this_year = Date.add_months(this_month, -11)
        
    async def _aggregate(tags_in: list[str], tags_out: list[str], date_start: datetime.date | None) -> list[TagCompositionItem]:
        cond = {**condition, "tags": {"$in": tags_in, "$nin": tags_out}}
        if date_start: cond["date"] = Date.condition(date_start)
        transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, cond)
        tag_map = {}
        for transaction in transactions:
            converted_value = Value.multiply(transaction.value, Currency.convert(transaction.currency, Currency.PLN))
            for other_tag in transaction.tags:
                if other_tag == str(tag.id): continue
                tag_map[other_tag] = Value.add(tag_map.get(other_tag, 0.0), converted_value)
            if len(transaction.tags) == 1: # only this tag
                tag_map["Untagged"] = Value.add(tag_map.get("Untagged", 0.0), converted_value)
        res = []
        for t, v in tag_map.items():
            if t == "Untagged":
                res.append(TagCompositionItem(tag_name="Untagged", colour="#000000", value=abs(v)))
            else:
                comp_tag: TagWithId = await get(db, "tags", TagWithId, {"_id": t}, one=True)
                if tag.colour == comp_tag.colour: continue # skip tags from same group
                name = await get_tag_name(comp_tag, db) if comp_tag else t
                colour = comp_tag.colour if comp_tag else "#000000"
                res.append(TagCompositionItem(tag_name=name, colour=colour, value=abs(v)))
        return sorted(res, key=lambda x: x.tag_name.lower())

    all_child_values_total = await _aggregate(this_tag_id + child_tag_ids, [], None)
    all_child_values_year = await _aggregate(this_tag_id + child_tag_ids, [], this_year)
    all_child_values_month = await _aggregate(this_tag_id + child_tag_ids, [], this_month)
    
    this_tag_values_total = await _aggregate(this_tag_id, child_tag_ids, None)
    this_tag_values_year = await _aggregate(this_tag_id, child_tag_ids, this_year)
    this_tag_values_month = await _aggregate(this_tag_id, child_tag_ids, this_month)

    rich_tag: TagRichWithId = await get_rich_tag(str(tag.id), db)
    response = [TagComposition(
        _id=str(PyObjectId()),
        tag=rich_tag,
        values_total=all_child_values_total,
        values_year=all_child_values_year,
        values_month=all_child_values_month,
    )]
    
    children: list[TagWithId] = await get_children(tag, db)
    for child in sorted(children, key=lambda t: t.name.lower()):
        response.extend(await _calculate_tag_composition(str(child.id), request_id))

    if len(children) > 0 and (
        len(this_tag_values_total) > 0 or
        len(this_tag_values_year) > 0 or
        len(this_tag_values_month) > 0
    ):
        response.append(TagComposition(
            _id=str(PyObjectId()),
            tag=TagRichWithId(_id=str(PyObjectId()), name=f"{rich_tag.name}/Other", colour=rich_tag.colour),
            values_total=this_tag_values_total,
            values_year=this_tag_values_year,
            values_month=this_tag_values_month,
        ))
    return response


############################## Comparison #############################

@router.get("/compare", response_model=list[Comparison])
async def get_transactions_filtered(
    tagsIn: list[str] | None = Query(None),
    tagsInJoin: Join = Query(Join.OR),
    tagsOut: list[str] | None = Query(None),
    tagsOutJoin: Join = Query(Join.OR),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # condition
    condition = {"deleted": False, "$or": [{"debt_person": None}, {"debt_person": ""}]}
    condition.update(await create_tags_condition(tagsIn, tagsOut, tagsInJoin, tagsOutJoin, db))
    # iterate months
    response = []
    first: TransactionWithId = await get(db, "transactions", TransactionWithId, condition, "date", one=True, reverse=False)
    if not first: return []
    for month in Date.iterate_months(first.date):
        m_cond = {**condition, "date": Date.condition(month, Date.month_end(month))}
        transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, m_cond)
        transactions: list[TransactionRichWithId] = await enrich_transactions(transactions, db)
        total_value = Value.sum(t.value_pln for t in transactions)
        response.append(Comparison(
            _id=str(PyObjectId()),
            month=month.month,
            year=month.year,
            value_pln=total_value,
            transactions=len(transactions),
            children_tags=[await _create_aggregation_by_children(ti, transactions, db) for ti in tagsIn or []]
        ))
    return response

async def _create_aggregation_by_children(tag: str, transactions: list[TransactionRichWithId], db: AsyncIOMotorDatabase) -> ComparisonItemRecursive:
    children = await _aggregate_by_children(tag, transactions, db)
    total_value = Value.sum(c.value_pln for c in children)
    return ComparisonItemRecursive(_id=str(PyObjectId()), tag=await get_rich_tag(tag, db), value_pln=total_value, children=children)

async def _aggregate_by_children(tag: str, transactions: list[TransactionRichWithId], db: AsyncIOMotorDatabase) -> list[ComparisonItemRecursive]:
    tag: TagWithId = await get(db, "tags", TagWithId, {"_id": tag}, one=True)
    if not tag: return []
    tagFullName = await get_tag_name(tag, db)
    children = await get_children(tag, db)
    children_map: dict[str, list[TransactionRichWithId]] = {t: [] for t in (tag.children or []) + ["Other"]}
    # map to immediate children
    for t in transactions:
        found_child = False
        for ttag in t.tags:
            if not ttag.name.startswith(tagFullName + "/"): continue
            immediate_child_name = ttag.name[len(tagFullName) + 1:].split("/")[0]
            immediate_child = [c for c in children if c.name == immediate_child_name]
            if immediate_child:
                children_map[str(immediate_child[0].id)].append(t)
                found_child = True
        if not found_child and str(tag.id) in [str(ttag.id) for ttag in t.tags]:
            children_map["Other"].append(t)
    # create recursive response
    response = []
    for child_tag_id, child_transactions in children_map.items():
        total_value = Value.sum(t.value_pln for t in child_transactions)
        if child_tag_id == "Other":
            if len(children_map) > 1:
                response.append(ComparisonItemRecursive(
                    _id=str(PyObjectId()),
                    tag=TagRichWithId(_id=str(PyObjectId()), name=f"{await get_tag_name(tag, db)}/Other", colour=tag.colour),
                    value_pln=total_value,
                    children=[],
                ))
        else:
            children = await _aggregate_by_children(child_tag_id, child_transactions, db)
            response.append(ComparisonItemRecursive(
                _id=str(PyObjectId()),
                tag=await get_rich_tag(child_tag_id, db),
                value_pln=total_value,
                children=children,
            ))
    return response
