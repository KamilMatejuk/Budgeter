import enum
from pydantic import Field
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.utils import Value
from routes.base import get, create
from models.base import PyBaseModel
from routes.utils import get_organisation_name_by_name_regex
from models.products import CardWithId, PersonalAccountWithId
from models.transaction import Transaction, TransactionWithId
from routes.sources.utils import mark_card_usage_in_history, mark_account_value_in_history


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

    
class MillenniumTransactionType(enum.Enum):
    CARD_CHARGE = 'OPŁATA'
    CARD_PAYMENT = 'PŁATNOŚĆ KARTĄ'
    CARD_PAYMENT_PHYSICAL = 'ZAKUP - FIZ. UŻYCIE KARTY'
    CARD_PAYMENT_ONLINE = 'PŁATNOŚĆ KARTĄ W INTERNECIE'
    CARD_PAYMENT_ONLINE_REFUND = 'PŁATNOŚĆ KARTĄ W INTERNECIE ZWROT'
    BLIK_PAYMENT_ONLINE = 'PŁATNOŚĆ BLIK W INTERNECIE'
    BLIK_PAYMENT_ONLINE_REFUND = 'PŁATNOŚĆ BLIK W INTERNECIE - ZWROT'
    BLIK_PAYMENT_CONTACTLESS = 'PŁATNOŚĆ ZBLIŻENIOWA BLIK'
    CREDIT_CARD_PAYOFF = 'WCZEŚN.SPŁ.KARTY:'

    TRANSFER_TO_PHONE = 'PRZELEW NA TELEFON'
    TRANSFER_TO_ANOTHER_BANK = 'PRZELEW DO INNEGO BANKU'
    TRANSFER_INCOMING_EXTERNAL = 'PRZELEW PRZYCHODZĄCY'
    TRANSFER_INCOMING_INTERNAL = 'PRZELEW WEWNĘTRZNY PRZYCHODZĄCY'
    TRANSFER_OUTGOING_INTERNAL = 'PRZELEW WEWNĘTRZNY WYCHODZĄCY'
    TRANSFER_REGULAR_INTERNAL = 'STAŁE ZLECENIE WEWNĄTRZ BANKU'
    TRANSFER_SEPA = 'PRZEKAZ SEPA'

    REGULAR_ORDER = 'STAŁE ZLECENIE ZEWNĘTRZNE'
    INVESTMENT_OPERATION = 'OPERACJE NA LOKATACH'
    INVESTMENT_DEBIT = 'OBCIĄŻENIE'
    INVESTMENT_CREDIT = 'UZNANIE'


async def get_account(db: AsyncIOMotorDatabase, number: str = None, id: str = None) -> PersonalAccountWithId:
    if number: condition = {"number": number}
    if id: condition = {"_id": id}
    assert condition is not None, "Either number or id must be provided"
    account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, condition, one=True)
    if account is None: raise HTTPException(status_code=500, detail=f"Account {number} not found")
    return account


async def get_card(db: AsyncIOMotorDatabase, credit: bool = None, number: str = None, account: PersonalAccountWithId = None) -> CardWithId:
    if number: condition = {"number": number}
    if account: condition = {"account": str(account.id)}
    assert condition is not None, "Either number or id must be provided"
    if credit is not None: condition["credit"] = credit
    card: CardWithId = await get(db, "card", CardWithId, condition, one=True)
    if card is None:
        err_detail = f"Card {number} not found" if number else f"Card for account {account.number} not found"
        raise HTTPException(status_code=500, detail=err_detail)
    return card


async def create_transaction(db: AsyncIOMotorDatabase, data: MillenniumRequest, account: PersonalAccountWithId,
                             organisation: str, title: str = None, mark: bool = True) -> TransactionWithId:
    organisation = await get_organisation_name_by_name_regex(organisation, db)
    value = data.charges or data.credits
    title = title or data.description
    item = Transaction(account=str(account.id), date=data.transaction_date, title=title,
                       organisation=organisation, value=Value.parse(value), currency=account.currency,
                       tags=[])
    if mark:
        await mark_account_value_in_history(account, data.transaction_date, item.value, db)
    return await create(db, "transactions", TransactionWithId, item)


async def create_millennium_transaction(data: MillenniumRequest, db: AsyncIOMotorDatabase):
    data.type = MillenniumTransactionType(data.type or "PŁATNOŚĆ KARTĄ")

    if data.type == MillenniumTransactionType.CARD_PAYMENT:
        monthly_payment = data.description.startswith("OPŁATA MIESIĘCZNA ZA OBSLUGĘ KARTY")
        if monthly_payment and data.charges == "": return # some monthly card fees are 0, skip them
        card = await get_card(db, number=data.number)
        account = await get_account(db, id=card.account)
        if not monthly_payment: await mark_card_usage_in_history(card, data.transaction_date, db)
        await create_transaction(db, data, account, data.description,
                                 title="Płatność kartą kredytową" if card.credit else "Płatność kartą",
                                 mark=not card.credit)
        # for credit cards, don't mark in history,
        # just decrease card's value,
        # history is updated in CREDIT_CARD_PAYOFF
        if card.credit:
            value = Value.parse(data.charges or data.credits)
            await db["card"].update_one({"_id": str(card.id)}, {"$set": {"value": Value.add(card.value, value)}})
        return

    if data.type == MillenniumTransactionType.CREDIT_CARD_PAYOFF:
        account = await get_account(db, number=data.number)
        card = await get_card(db, credit=True, account=account)
        await mark_account_value_in_history(account, data.transaction_date, Value.parse(data.charges), db)
        await db["card"].update_one({"_id": str(card.id)}, {"$set": {"value": Value.add(card.value or 0, Value.parse_negate(data.charges))}})
        return
    
    if data.type == MillenniumTransactionType.CARD_CHARGE:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.description, title="Opłata za kartę")
        return

    if data.type == MillenniumTransactionType.CARD_PAYMENT_PHYSICAL:
        account = await get_account(db, number=data.number)
        card = await get_card(db, credit=False, account=account)
        await mark_card_usage_in_history(card, data.transaction_date, db)
        await create_transaction(db, data, account, data.description, title="Płatność kartą")
        return
    
    if data.type == MillenniumTransactionType.CARD_PAYMENT_ONLINE:
        account = await get_account(db, number=data.number)
        card = await get_card(db, credit=False, account=account)
        await create_transaction(db, data, account, data.description, title="Płatność kartą")
        return

    if data.type == MillenniumTransactionType.CARD_PAYMENT_ONLINE_REFUND:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.description, title="Płatność kartą - zwrot")
        return
    
    if data.type == MillenniumTransactionType.BLIK_PAYMENT_ONLINE or data.type == MillenniumTransactionType.BLIK_PAYMENT_CONTACTLESS:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient, title="Płatność BLIK")
        return
        
    if data.type == MillenniumTransactionType.BLIK_PAYMENT_ONLINE_REFUND:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient, title="Płatność BLIK - zwrot")
        return

    if data.type == MillenniumTransactionType.TRANSFER_TO_ANOTHER_BANK or data.type == MillenniumTransactionType.TRANSFER_SEPA:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient)
        return

    if data.type == MillenniumTransactionType.TRANSFER_TO_PHONE:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient)
        return
    
    if data.type == MillenniumTransactionType.TRANSFER_INCOMING_EXTERNAL:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient)
        return

    if data.type == MillenniumTransactionType.TRANSFER_INCOMING_INTERNAL:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient)
        return
    
    if data.type == MillenniumTransactionType.TRANSFER_OUTGOING_INTERNAL:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient)
        return
    
    if data.type == MillenniumTransactionType.TRANSFER_REGULAR_INTERNAL:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient)
        return
    
    if data.type == MillenniumTransactionType.REGULAR_ORDER:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, data.recipient)
        return
    
    if data.type == MillenniumTransactionType.INVESTMENT_OPERATION:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, "Lokata Millennium")
        return

    if data.type == MillenniumTransactionType.INVESTMENT_DEBIT:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, "Lokata Millennium")
        return
    
    if data.type == MillenniumTransactionType.INVESTMENT_CREDIT:
        account = await get_account(db, number=data.number)
        await create_transaction(db, data, account, "Lokata Millennium")
        return

    raise HTTPException(status_code=500, detail=f"Unknown operation with transaction type {data.type}")
