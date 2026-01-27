from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.db import get_db
from core.utils import Date, Value
from routes.base import CRUDRouterFactory, create, get, patch
from routes.sources.utils import mark_account_value_in_history
from models.products import (Currency,
    Cash, CashPartial, CashWithId, CashRichWithId,
    Card, CardPartial, CardWithId, CardRichWithId,
    PersonalAccount, PersonalAccountPartial, PersonalAccountWithId, PersonalAccountRichWithId,
    StockAccount, StockAccountPartial, StockAccountWithId, StockAccountRichWithId,
    CapitalInvestment, CapitalInvestmentPartial, CapitalInvestmentWithId, CapitalInvestmentRichWithId,
)

router = APIRouter()

cash_router = APIRouter(prefix="/cash")
cash_factory = CRUDRouterFactory(cash_router, "cash", Cash, CashPartial, CashWithId)

@cash_router.get("", response_model=list[CashRichWithId])
async def get_cashs(db: AsyncIOMotorDatabase = Depends(get_db)):
    items: list[CashWithId] = await get(db, "cash", CashWithId)
    result = []
    for i in items:
        result.append(CashRichWithId(
            **i.model_dump(by_alias=True, mode="json"),
            value_pln=Value.multiply(i.value, Currency.convert(i.currency, Currency.PLN))
        ))
    return result

cash_factory.create_post()
cash_factory.create_patch()
cash_factory.create_delete()
router.include_router(cash_router)

personal_account_router = APIRouter(prefix="/personal_account")
personal_account_factory = CRUDRouterFactory(personal_account_router, "personal_account", PersonalAccount, PersonalAccountPartial, PersonalAccountWithId)
personal_account_factory.create_delete()

@personal_account_router.get("", response_model=list[PersonalAccountRichWithId])
async def get_personalaccounts(db: AsyncIOMotorDatabase = Depends(get_db)):
    items: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    result = []
    for i in items:
        result.append(PersonalAccountRichWithId(
            **i.model_dump(by_alias=True, mode="json"),
            value_pln=Value.multiply(i.value, Currency.convert(i.currency, Currency.PLN))
        ))
    return result

@personal_account_router.post("", response_model=PersonalAccountWithId)
async def create_personalaccount(data: PersonalAccount, db: AsyncIOMotorDatabase = Depends(get_db)):
    item: PersonalAccountWithId = await create(db, "personal_account", PersonalAccountWithId, data)
    await mark_account_value_in_history(item, Date.today().isoformat(), item.value, db)
    return item

@personal_account_router.patch("", response_model=PersonalAccountWithId)
async def patch_personalaccount(data: PersonalAccountPartial, db: AsyncIOMotorDatabase = Depends(get_db)):
    before: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": str(data.id)}, one=True)
    item: PersonalAccountWithId = await patch(db, "personal_account", PersonalAccountWithId, data)
    if before.value != item.value:
        await mark_account_value_in_history(item, Date.today().isoformat(), item.value, db)
    return item

async def get_personalaccount_by_number(number: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    for account in accounts:
        account_parsed = account.number.replace(" ", "").replace("PL", "")
        number_parsed = number.replace(" ", "").replace("PL", "")
        if account_parsed == number_parsed:
            return account
    return None

router.include_router(personal_account_router)


card_router = APIRouter(prefix="/card")
card_factory = CRUDRouterFactory(card_router, "card", Card, CardPartial, CardWithId)

@card_router.get("", response_model=list[CardRichWithId])
async def get_cards(db: AsyncIOMotorDatabase = Depends(get_db)):
    cards: list[CardWithId] = await get(db, "card", CardWithId)
    accounts: list[PersonalAccountWithId] = await get(db, "personal_account", PersonalAccountWithId)
    result = []
    for c in cards:
        acc = next((a for a in accounts if str(a.id) == c.account), None)
        result.append(CardRichWithId(**c.model_dump(exclude={"account"}, by_alias=True, mode="json"), account=acc))
    return result

card_factory.create_post()
card_factory.create_patch()
card_factory.create_delete()
router.include_router(card_router)

stock_account_router = APIRouter(prefix="/stock_account")
stock_account_factory = CRUDRouterFactory(stock_account_router, "stock_account", StockAccount, StockAccountPartial, StockAccountWithId)
stock_account_factory.create_post()
stock_account_factory.create_patch()
stock_account_factory.create_delete()

@stock_account_router.get("", response_model=list[StockAccountRichWithId])
async def get_stockaccounts(db: AsyncIOMotorDatabase = Depends(get_db)):
    items: list[StockAccountWithId] = await get(db, "stock_account", StockAccountWithId)
    result = []
    for i in items:
        result.append(StockAccountRichWithId(
            **i.model_dump(by_alias=True, mode="json"),
            value_pln=Value.multiply(i.value, Currency.convert(i.currency, Currency.PLN))
        ))
    return result

router.include_router(stock_account_router)

capital_investment_router = APIRouter(prefix="/capital_investment")
capital_investment_factory = CRUDRouterFactory(capital_investment_router, "capital_investment", CapitalInvestment, CapitalInvestmentPartial, CapitalInvestmentWithId)
capital_investment_factory.create_post()
capital_investment_factory.create_patch()
capital_investment_factory.create_delete()

@capital_investment_router.get("", response_model=list[CapitalInvestmentRichWithId])
async def get_capitalinvestments(db: AsyncIOMotorDatabase = Depends(get_db)):
    items: list[CapitalInvestmentWithId] = await get(db, "capital_investment", CapitalInvestmentWithId)
    result = []
    for i in items:
        result.append(CapitalInvestmentRichWithId(
            **i.model_dump(by_alias=True, mode="json"),
            value_pln=Value.multiply(i.value, Currency.convert(i.currency, Currency.PLN))
        ))
    return result

router.include_router(capital_investment_router)
