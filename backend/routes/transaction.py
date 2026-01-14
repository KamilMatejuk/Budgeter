import datetime
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from models.tag import TagWithId
from core.utils import Value, Date
from models.base import PyObjectId
from routes.tag import get_name as get_tag_name
from models.products import PersonalAccountWithId
from routes.base import CRUDRouterFactory, fail_wrapper, get, create, patch
from routes.sources.utils import mark_account_value_in_history, match_organisation_pattern
from models.transaction import Transaction, TransactionPartial, TransactionSplitRequest, TransactionRepayRequest, TransactionWithId
from routes.history import remove_leading_zero_history

single_router = APIRouter()
multi_router = APIRouter()

factory = CRUDRouterFactory(single_router, "transactions", Transaction, TransactionPartial, TransactionWithId)
factory.create_get_by_id()


async def sort_tags(tags: list[str], db: AsyncIOMotorDatabase):
    tags = list(set(tags))
    tags = [await get(db, "tags", TagWithId, {"_id": t}, one=True) for t in tags]
    for t in tags:
        t.name = await get_tag_name(t, db)
    tags = sorted(tags, key=lambda t: not t.name.startswith("Wyjazdy"))
    return [str(t.id) for t in tags]

@single_router.patch("", response_model=TransactionWithId)
async def patch_transaction(data: TransactionPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    if data.organisation is not None:
        data.organisation = await match_organisation_pattern(data.organisation, db)
    if data.tags is not None:
        data.tags = await sort_tags(data.tags, db)
    assert data.value is None, "Transaction value cannot be changed via patch"
    return await patch(db, "transactions", TransactionWithId, data)


@single_router.post("", response_model=TransactionWithId)
async def create_transaction(data: Transaction, db: AsyncIOMotorDatabase = Depends(get_db)):
    data.organisation = await match_organisation_pattern(data.organisation, db)
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


@multi_router.get("/{year}/{month}", response_model=list[TransactionWithId])
async def get_transactions_monthly(year: int, month: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = datetime.date(year, month, 1)
    end = Date.month_end(start)
    return await get(db, "transactions", TransactionWithId, {"deleted": False, "date": Date.condition(start, end)}, "date")


@single_router.get("/last/{account}", response_model=TransactionWithId)
async def get_last_transaction_from_accont(account: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "transactions", TransactionWithId, {"deleted": False, "account": account}, "date", one=True)


@multi_router.get("/deleted", response_model=list[TransactionWithId])
async def get_transactions_deleted(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "transactions", TransactionWithId, {"deleted": True}, "date")


@single_router.post("/restore/{id}", response_model=TransactionWithId)
async def restore_deleted_transaction(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": id, "deleted": True}, one=True)
        assert transaction is not None, "Deleted transaction not found"
        transaction.deleted = False
        # revert account history
        account = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(transaction.account)}, one=True)
        await mark_account_value_in_history(account, transaction.date.strftime("%Y-%m-%d"), transaction.value, db)
        # update
        return await patch(db, "transactions", TransactionWithId, transaction)
    return await inner()


@multi_router.get("/new", response_model=list[TransactionWithId])
async def get_transactions_without_tags(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "transactions", TransactionWithId, {"tags": {"$size": 0}, "deleted": False}, "date")


@multi_router.get("/debt", response_model=list[TransactionWithId])
async def get_transactions_with_debt(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "transactions", TransactionWithId, {"debt_person": {"$ne": None}, "deleted": False}, "date")


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
