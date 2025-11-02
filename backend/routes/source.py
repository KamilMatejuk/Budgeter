import enum
import hashlib
from pydantic import Field
from fastapi import HTTPException, APIRouter, Depends
from models.history import CardMonthlyHistory
from models.organisation import OrganisationWithId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.products import CardWithId, PersonalAccountWithId
from models.transaction import Transaction, TransactionWithId
from routes.base import PyBaseModel, fail_wrapper, get, create
from core.db import get_db


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


# Enums

class Source(enum.Enum):
    MILLENNIUM = "Millennium"


router = APIRouter()

@router.get("", response_model=list[str])
async def get_sources():
    return [source.value for source in Source]


# Millennium
class MillenniumRequest(PyBaseModel):
    number: str = Field(..., alias="Numer rachunku/karty")
    transaction_date: str = Field(..., alias="Data transakcji")
    settlement_date: str = Field(..., alias="Data rozliczenia")
    type: str = Field(..., alias="Rodzaj transakcji")
    account: str = Field(..., alias="Na konto/Z konta")
    recipient: str = Field(..., alias="Odbiorca/Zleceniodawca")
    description: str = Field(..., alias="Opis")
    charges: str = Field(..., alias="Obciążenia")
    credits: str = Field(..., alias="Uznania")
    balance: str = Field(..., alias="Saldo")
    currency: str = Field(..., alias="Waluta")
    
    model_config = {
        **PyBaseModel.model_config,
        "populate_by_name": True  # allows you to use normal field names in code
    }

@fail_wrapper
@router.post("/Millennium", response_model=TransactionWithId | dict)
async def create_transaction_from_millennium(data: MillenniumRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    hash = hashlib.sha256(str(data.model_dump()).encode()).hexdigest()
    # check hash exists
    existing = await get(db, "transactions", TransactionWithId, {"hash": hash}, one=True)
    if existing: return existing
    # create new
    is_card_payment = "XXXX" in data.number
    if data.type == "": data.type = "PŁATNOŚĆ KARTĄ"

    if is_card_payment:
        card: CardWithId = await get(db, "card", CardWithId, {"number": data.number}, one=True)
        if card is None:
            raise HTTPException(status_code=500, detail=f"Card with number {data.number} not found")
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": card.account}, one=True)
        if account is None:
            raise HTTPException(status_code=500, detail=f"Account with id {card.account} not found")
        if card.credit and data.type == "PŁATNOŚĆ KARTĄ": data.type = "PŁATNOŚĆ KARTĄ KREDYTOWĄ"
        await mark_card_usage_in_history(card, data.transaction_date, db)
    else:
        account = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if account is None:
            raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")

    if "WCZEŚN.SPŁ.KARTY" in data.type:
        # TODO handle credit card payments
        # jak jest płatność kartą kredytową to nie dodawać do konta, tylko usuwać wartość z karty kredytowej
        return {}
    elif "PRZELEW WEWNĘTRZNY PRZYCHODZĄCY" in data.type:
        # TODO handle internal transfers in (double entry?)
        return {}
    elif "PRZELEW WEWNĘTRZNY WYCHODZĄCY" in data.type:
        # TODO handle internal transfers out (double entry?)
        return {}
    
    # override organisation based on pattern matching
    organisation = data.recipient or data.description
    for org in await get(db, "organisations", OrganisationWithId):
        if org.pattern.lower() in organisation.lower():
            organisation = org.name
            break
    
    # create transaction
    item = Transaction(
        hash=hash,
        account=str(account.id),
        date=data.transaction_date,
        title=data.description if data.recipient else data.type.title(),
        organisation=organisation,
        value=data.credits or data.charges,
        tags=[],
    )
    return await create(db, "transactions", TransactionWithId, item)
