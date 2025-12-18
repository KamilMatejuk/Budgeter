import datetime
import hashlib
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from core.utils import Value
from models.base import PyObjectId
from models.products import PersonalAccountWithId
from routes.base import CRUDRouterFactory, fail_wrapper, get, create, patch
from routes.sources.utils import mark_transaction_in_history, match_organisation_pattern
from models.transaction import Transaction, TransactionPartial, TransactionSplitRequest, TransactionRepayRequest, TransactionWithId

single_router = APIRouter()
multi_router = APIRouter()

factory = CRUDRouterFactory(single_router, "transactions", Transaction, TransactionPartial, TransactionWithId, "hash")
factory.create_get_by_id()
factory.create_patch()


@single_router.post("", response_model=TransactionWithId)
async def create_transaction(data: Transaction, db: AsyncIOMotorDatabase = Depends(get_db)):
    data.hash = hashlib.sha256(str({k: v for k, v in data.model_dump().items() if k != "id"}).encode()).hexdigest()
    data.organisation = await match_organisation_pattern(data.organisation, db)
    return await create(db, "transactions", TransactionWithId, data, "hash")


@single_router.delete("/{id}", response_model=dict)
async def delete_transaction(id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": id}, one=True)
        assert transaction is not None, "Transaction not found"
        # delete
        transaction.deleted = True
        await patch(db, "transactions", TransactionPartial, transaction)
        # update history
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(transaction.account)}, one=True)
        date = transaction.date.strftime("%Y-%m-%d")
        await mark_transaction_in_history(account, date, Value.parse_negate(transaction.value), db)
        return {}
    return await inner()


@single_router.patch("/split", response_model=list[TransactionWithId])
async def split_transaction(data: TransactionSplitRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    @fail_wrapper
    async def inner():
        transaction: TransactionWithId = await get(db, "transactions", TransactionWithId, {"_id": str(data.id), "deleted": False}, one=True)
        assert transaction is not None, "Transaction not found"
        total_value = 0.0
        for item in data.items: total_value = Value.add(total_value, item.value)
        before_split = Value.parse(transaction.value)
        after_split = Value.parse(total_value)
        assert after_split == before_split, f"Sum of split items ({after_split:.2f}) must equal original transaction value ({before_split:.2f})"
        new_transactions = []
        for i, item in enumerate(data.items):
            new_transaction = transaction.model_copy(deep=True, update={
                "id": PyObjectId(),
                "hash": hashlib.sha256(f"{transaction.hash}_{i}".encode()).hexdigest(),
                "title": item.title,
                "value": item.value,
            })
            new_transaction = await create(db, "transactions", TransactionWithId, new_transaction, "hash")
            new_transactions.append(new_transaction)
        transaction.deleted = True
        await patch(db, "transactions", TransactionPartial, transaction)
        return new_transactions
    return await inner()


@multi_router.get("/{year}/{month}", response_model=list[TransactionWithId])
async def get_transactions_monthly(year: int, month: int, db: AsyncIOMotorDatabase = Depends(get_db)):
    start = datetime.date(year, month, 1)
    end = (start + datetime.timedelta(days=32)).replace(day=1)
    res = await get(db, "transactions", TransactionWithId, {"deleted": False, "date": {"$gte": start.isoformat(), "$lt": end.isoformat()}})
    return sorted(res, key=lambda x: x.date, reverse=True)


@multi_router.get("/debt", response_model=list[TransactionWithId])
async def get_transactions_with_debt(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await get(db, "transactions", TransactionWithId, {"debt_person": {"$ne": None}, "deleted": False})

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
        await patch(db, "transactions", TransactionPartial, repay_transaction)
        # if fully repaid, just delete debt transaction
        if diff == 0.0:
            debt_transaction.deleted = True
            await patch(db, "transactions", TransactionPartial, debt_transaction)
        else:
            # otherwise, update debt transaction with remaining value and mark as not debt anymore
            debt_transaction.title += f" (after {debt_transaction.debt_person} debt repayment)"
            debt_transaction.debt_person = None
            debt_transaction.value = diff
            await patch(db, "transactions", TransactionPartial, debt_transaction)
        return {}
    return await inner()
