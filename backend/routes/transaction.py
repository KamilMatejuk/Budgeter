import datetime
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from core.utils import Value, Date
from models.base import PyObjectId
from routes.tag import sort_by_name as sort_tags, get_rich_tags, get_all_children
from models.products import PersonalAccountWithId, CashWithId
from models.organisation import OrganisationWithId
from routes.history import remove_leading_zero_history
from routes.sources.utils import mark_account_value_in_history
from routes.base import CRUDRouterFactory, fail_wrapper, get, create, patch
from routes.organisation import match_organisation_by_name_regex, get_organisation_name_by_name_regex
from models.transaction import Transaction, TransactionPartial, TransactionSplitRequest, TransactionRepayRequest, TransactionWithId, TransactionRichWithId

single_router = APIRouter()
multi_router = APIRouter()

factory = CRUDRouterFactory(single_router, "transactions", Transaction, TransactionPartial, TransactionWithId)
factory.create_get_by_id()


async def enrich_transactions(transactions: list[TransactionWithId], db: AsyncIOMotorDatabase) -> list[TransactionRichWithId]:
    organisations: list[OrganisationWithId] = await get(db, "organisations", OrganisationWithId)
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    cashs: list[CashWithId] = await get(db, "cash", CashWithId)
    result = []
    for t in transactions:
        org = await match_organisation_by_name_regex(t.organisation, organisations)
        acc = next((c for c in cashs if str(c.id) == t.account), None) \
            if t.cash else next((a for a in accounts if str(a.id) == t.account), None)
        tags = await get_rich_tags(t.tags, db)
        result.append(TransactionRichWithId(
            **t.model_dump(exclude={"organisation", "account", "tags"}, by_alias=True, mode="json"),
            organisation=org,
            account=acc,
            tags=tags))
    return result


@single_router.patch("", response_model=TransactionWithId)
async def patch_transaction(data: TransactionPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    if data.organisation is not None:
        data.organisation = await get_organisation_name_by_name_regex(data.organisation, db)
    if data.tags is not None:
        data.tags = await sort_tags(data.tags, db)
    assert data.value is None, "Transaction value cannot be changed via patch"
    return await patch(db, "transactions", TransactionWithId, data)


@single_router.post("", response_model=TransactionWithId)
async def create_transaction(data: Transaction, db: AsyncIOMotorDatabase = Depends(get_db)):
    data.organisation = await get_organisation_name_by_name_regex(data.organisation, db)
    data.tags = await sort_tags(data.tags, db)
    transaction: TransactionWithId = await create(db, "transactions", TransactionWithId, data)
    # update history
    account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(transaction.account)}, one=True)
    if account: # it can be cash transaction with no account history to update
        date = transaction.date.strftime("%Y-%m-%d")
        await mark_account_value_in_history(account, date, Value.parse(transaction.value), db)
    return transaction


@single_router.delete("/{id}", response_model=dict)
async def delete_transaction(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": id}, one=True)
        assert transaction is not None, "Transaction not found"
        # delete
        transaction.deleted = True
        await patch(db, "transactions", TransactionWithId, transaction)
        # update history
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(transaction.account)}, one=True)
        if account: # it can be cash transaction with no account history to update
            date = transaction.date.strftime("%Y-%m-%d")
            await mark_account_value_in_history(account, date, Value.parse_negate(transaction.value), db)
            await remove_leading_zero_history(account, db)
        return {}
    return await inner()


@single_router.patch("/split", response_model=list[TransactionWithId])
async def split_transaction(data: TransactionSplitRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": str(data.id), "deleted": False}, one=True)
        assert transaction is not None, "Transaction not found"
        total_value = Value.sum([i.value for i in data.items])
        before_split = Value.parse(transaction.value)
        after_split = Value.parse(total_value)
        assert after_split == before_split, f"Sum of split items ({after_split:.2f}) must equal original transaction value ({before_split:.2f})"
        new_transactions = []
        for i, item in enumerate(data.items):
            new_transaction = transaction.model_copy(deep=True, update={
                "id": PyObjectId(),
                "title": item.title,
                "value": item.value,
            })
            new_transaction = await create(db, "transactions", TransactionWithId, new_transaction)
            new_transactions.append(new_transaction)
        transaction.deleted = True
        await patch(db, "transactions", TransactionWithId, transaction)
        return new_transactions
    return await inner()


@multi_router.get("/{year}/{month}", response_model=list[TransactionRichWithId])
async def get_transactions_monthly(year: int, month: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = datetime.date(year, month, 1)
    end = Date.month_end(start)
    condition = {"deleted": False, "date": Date.condition(start, end)}
    transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition, "date")
    transactions = await enrich_transactions(transactions, db)
    return transactions

    
@single_router.get("/last/{account}", response_model=TransactionWithId)
async def get_last_transaction_from_accont(account: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "transactions", TransactionWithId, {"deleted": False, "account": account}, "date", one=True)


@multi_router.get("/deleted", response_model=list[TransactionRichWithId])
async def get_transactions_deleted(db: AsyncIOMotorDatabase = Depends(get_db)):
    transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, {"deleted": True, "transfer_between_accounts": False}, "date")
    transactions = await enrich_transactions(transactions, db)
    return transactions


@multi_router.get("/transfer", response_model=list[TransactionRichWithId])
async def get_transactions_transfer(db: AsyncIOMotorDatabase = Depends(get_db)):
    transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, {"transfer_between_accounts": True}, "date")
    transactions = await enrich_transactions(transactions, db)
    return transactions


@single_router.post("/restore/{id}", response_model=TransactionWithId)
async def restore_deleted_transaction(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": id, "deleted": True}, one=True)
        assert transaction is not None, "Deleted transaction not found"
        # restore transfer
        if transaction.transfer_between_accounts:
            transaction.deleted = False
            transaction.transfer_between_accounts = False
        # restore deleted
        elif transaction.deleted:
            transaction.deleted = False
            account = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(transaction.account)}, one=True)
            await mark_account_value_in_history(account, transaction.date.strftime("%Y-%m-%d"), transaction.value, db)
        return await patch(db, "transactions", TransactionWithId, transaction)
    return await inner()


@multi_router.get("/new", response_model=list[TransactionRichWithId])
async def get_transactions_without_tags(db: AsyncIOMotorDatabase = Depends(get_db)):
    transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, {"tags": {"$size": 0}, "deleted": False}, "date")
    transactions = await enrich_transactions(transactions, db)
    return transactions


@multi_router.get("/debt", response_model=list[TransactionRichWithId])
async def get_transactions_with_debt(db: AsyncIOMotorDatabase = Depends(get_db)):
    transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, {"debt_person": {"$ne": None}, "deleted": False}, "date")
    transactions = await enrich_transactions(transactions, db)
    return transactions


@single_router.post("/repay", response_model=dict)
async def repay_transaction(data: TransactionRepayRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        repay_transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": str(data.id), "deleted": False}, one=True)
        assert repay_transaction is not None, "Repayment transaction not found"
        assert repay_transaction.value > 0.0, "Repayment transaction value must be positive"
        debt_transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": str(data.debt_transaction_id), "deleted": False}, one=True)
        assert debt_transaction is not None, "Debt transaction not found"
        assert debt_transaction.value < 0.0, "Debt transaction value must be negative"
        diff = Value.add(repay_transaction.value, debt_transaction.value)
        # remove repay transaction
        repay_transaction.deleted = True
        await patch(db, "transactions", TransactionWithId, repay_transaction)
        # if fully repaid, just delete debt transaction
        if diff == 0.0:
            debt_transaction.deleted = True
            await patch(db, "transactions", TransactionWithId, debt_transaction)
        else:
            # otherwise, update debt transaction with remaining value and mark as not debt anymore
            debt_transaction.title += f" (after {debt_transaction.debt_person} debt repayment)"
            debt_transaction.debt_person = None
            debt_transaction.value = diff
            await patch(db, "transactions", TransactionWithId, debt_transaction)
        return {}
    return await inner()


@multi_router.get("/filtered", response_model=list[TransactionRichWithId])
async def get_transactions_filtered(
    accounts: list[str] | None = Query(None),
    organisations: list[str] | None = Query(None),
    tagsIn: list[str] | None = Query(None),
    tagsOut: list[str] | None = Query(None),
    title: str | None = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # condition
    condition = {"deleted": False}
    if accounts is not None and len(accounts) > 0: condition["account"] = {"$in": accounts}
    if organisations is not None and len(organisations) > 0: condition["organisation"] = {"$in": organisations}
    if title is not None and title.strip() != "": condition["title"] = {"$regex": title, "$options": "i"}
    # include tags and subtags
    all_tags_to_include = set()
    for t in tagsIn or []:
        all_tags_to_include.add(t)
        children = await get_all_children(t, db)
        for c in children:
            all_tags_to_include.add(str(c.id))
    # exclude tags and subtags
    all_tags_to_exclude = set()
    for t in tagsOut or []:
        all_tags_to_exclude.add(t)
        children = await get_all_children(t, db)
        for c in children:
            all_tags_to_exclude.add(str(c.id))
    # fix conflicting tags
    all_tags_to_include = all_tags_to_include - all_tags_to_exclude
    if len(all_tags_to_include) > 0 or len(all_tags_to_exclude) > 0:
        condition["tags"] = {}
        condition["tags"]["$in"] = list(all_tags_to_include)
        condition["tags"]["$nin"] = list(all_tags_to_exclude)
    # run
    transactions: list[TransactionWithId] = await get(db, "transactions", TransactionWithId, condition, "date")
    transactions = await enrich_transactions(transactions, db)
    return transactions
