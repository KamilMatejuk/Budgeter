import enum
from pydantic import Field
from core.utils import Value
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.products import CapitalInvestmentWithId, CardWithId, PersonalAccountWithId, CapitalInvestment, Currency, Capitalization
from routes.sources.utils import mark_card_usage_in_history, mark_transaction_in_history, match_organisation_pattern
from models.transaction import Transaction, TransactionWithId
from routes.products import get_personalaccount_by_number
from models.base import PyBaseModel
from routes.base import get, create
from core.logger import get_logger


logger = get_logger(__name__)


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
    CARD_PAYMENT = 'PŁATNOŚĆ KARTĄ'
    CARD_PAYMENT_PHYSICAL = 'ZAKUP - FIZ. UŻYCIE KARTY'
    CARD_PAYMENT_ONLINE = 'PŁATNOŚĆ KARTĄ W INTERNECIE'
    BLIK_PAYMENT_ONLINE = 'PŁATNOŚĆ BLIK W INTERNECIE'
    CREDIT_CARD_PAYOFF = 'WCZEŚN.SPŁ.KARTY:'

    TRANSFER_TO_ANOTHER_BANK = 'PRZELEW DO INNEGO BANKU'
    TRANSFER_TO_PHONE = 'PRZELEW NA TELEFON'
    TRANSFER_INCOMING_EXTERNAL = 'PRZELEW PRZYCHODZĄCY'
    TRANSFER_INCOMING_INTERNAL = 'PRZELEW WEWNĘTRZNY PRZYCHODZĄCY'

    REGULAR_ORDER = 'STAŁE ZLECENIE ZEWNĘTRZNE'
    INVESTMENT_OPERATION = 'OPERACJE NA LOKATACH'


async def create_millennium_transaction(hash: str, data: MillenniumRequest, db: AsyncIOMotorDatabase):
    logger.info(f"Creating transaction from data: {data}")    
    data.type = MillenniumTransactionType(data.type)

    if data.type == MillenniumTransactionType.CARD_PAYMENT:
        card: CardWithId = await get(db, "card", CardWithId, {"number": data.number}, one=True)
        if card is None: raise HTTPException(status_code=500, detail=f"Card with number {data.number} not found")
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"_id": card.account}, one=True)
        if account is None: raise HTTPException(status_code=500, detail=f"Account with id {card.account} not found")
        await mark_card_usage_in_history(card, data.transaction_date, db)
        item = Transaction(
            hash=hash,
            account=str(account.id),
            date=data.transaction_date,
            title="Płatność kartą kredytową" if card.credit else "Płatność kartą",
            organisation=await match_organisation_pattern(data.description, db),
            value=Value.parse(data.charges),
            currency=account.currency,
            tags=[],
        )
        if card.credit:
            # decrease card's value
            await db["card"].update_one({"_id": str(card.id)}, {"$set": {"value": Value.subtract(card.value, item.value)}})
        else:
            # dont update history for credit cards (it's updated in CREDIT_CARD_PAYOFF type)
            await mark_transaction_in_history(account, data.transaction_date, item.value, db)
        return await create(db, "transactions", TransactionWithId, item)

    if data.type == MillenniumTransactionType.CARD_PAYMENT_PHYSICAL \
    or data.type == MillenniumTransactionType.CARD_PAYMENT_ONLINE:
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        cards: list[CardWithId] = await get(db, "card", CardWithId, {"account": str(account.id)})
        cards = [card for card in cards if not card.credit]
        if not cards: raise HTTPException(status_code=500, detail=f"Card for account id {account.id} not found")
        card = cards[0]
        await mark_card_usage_in_history(card, data.transaction_date, db)
        item = Transaction(
            hash=hash,
            account=str(account.id),
            date=data.transaction_date,
            title="Płatność kartą",
            organisation=await match_organisation_pattern(data.description, db),
            value=Value.parse(data.charges),
            currency=account.currency,
            tags=[],
        )
        await mark_transaction_in_history(account, data.transaction_date, item.value, db)
        return await create(db, "transactions", TransactionWithId, item)
    
    if data.type == MillenniumTransactionType.BLIK_PAYMENT_ONLINE:
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        item = Transaction(
            hash=hash,
            account=str(account.id),
            date=data.transaction_date,
            title="Płatność BLIK",
            organisation=await match_organisation_pattern(data.recipient, db),
            value=Value.parse(data.charges),
            currency=account.currency,
            tags=[],
        )
        await mark_transaction_in_history(account, data.transaction_date, item.value, db)
        return await create(db, "transactions", TransactionWithId, item)
    
    if data.type == MillenniumTransactionType.CREDIT_CARD_PAYOFF:
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        cards: list[CardWithId] = await get(db, "card", CardWithId, {"account": str(account.id)})
        cards = [card for card in cards if card.credit]
        if not cards: raise HTTPException(status_code=500, detail=f"Card for account id {account.id} not found")
        card = cards[0]
        # mark in account history
        await mark_transaction_in_history(account, data.transaction_date, Value.parse(data.charges), db)
        # update card value
        await db["card"].update_one({"_id": str(card.id)}, {"$set": {"value": Value.add(card.value or 0, Value.parse_negate(data.charges))}})
        return {}
    
    if data.type == MillenniumTransactionType.TRANSFER_TO_ANOTHER_BANK:
        src_account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if src_account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        dst_account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.account}, one=True)
        dst_account = await get_personalaccount_by_number(data.account, db)
        # internal transfer
        if dst_account:
            await mark_transaction_in_history(dst_account, data.transaction_date, Value.parse(data.charges), db)
            await mark_transaction_in_history(src_account, data.transaction_date, Value.parse_negate(data.charges), db)
            return {}
        # external transfer
        item = Transaction(
            hash=hash,
            account=str(src_account.id),
            date=data.transaction_date,
            title=data.description,
            organisation=data.recipient,
            value=Value.parse(data.charges),
            currency=src_account.currency,
            tags=[],
        )
        await mark_transaction_in_history(src_account, data.transaction_date, item.value, db)
        return await create(db, "transactions", TransactionWithId, item)
    
    if data.type == MillenniumTransactionType.TRANSFER_TO_PHONE:
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        item = Transaction(
            hash=hash,
            account=str(account.id),
            date=data.transaction_date,
            title=data.description,
            organisation=data.recipient,
            value=Value.parse(data.credits or data.charges),
            currency=account.currency,
            tags=[],
        )
        await mark_transaction_in_history(account, data.transaction_date, item.value, db)
        return await create(db, "transactions", TransactionWithId, item)
    
    if data.type == MillenniumTransactionType.TRANSFER_INCOMING_EXTERNAL:
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        item = Transaction(
            hash=hash,
            account=str(account.id),
            date=data.transaction_date,
            title=data.description,
            organisation=await match_organisation_pattern(data.recipient, db),
            value=Value.parse(data.credits),
            currency=account.currency,
            tags=[],
        )
        await mark_transaction_in_history(account, data.transaction_date, item.value, db)
        return await create(db, "transactions", TransactionWithId, item)

    if data.type == MillenniumTransactionType.TRANSFER_INCOMING_INTERNAL:
        dst_account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if dst_account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        src_account = await get_personalaccount_by_number(data.account, db)
        if src_account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.account} not found")
        await mark_transaction_in_history(dst_account, data.transaction_date, Value.parse_negate(data.credits), db)
        await mark_transaction_in_history(src_account, data.transaction_date, Value.parse(data.credits), db)
        return {}
    
    if data.type == MillenniumTransactionType.REGULAR_ORDER:
        account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, {"number": data.number}, one=True)
        if account is None: raise HTTPException(status_code=500, detail=f"Account with number {data.number} not found")
        item = Transaction(
            hash=hash,
            account=str(account.id),
            date=data.transaction_date,
            title=data.description,
            organisation=data.recipient,
            value=Value.parse(data.charges),
            currency=account.currency,
            tags=[],
        )
        await mark_transaction_in_history(account, data.transaction_date, item.value, db)
        return await create(db, "transactions", TransactionWithId, item)
    
    if data.type == MillenniumTransactionType.INVESTMENT_OPERATION:
        if data.description.startswith("Zasil.lokaty"):
            item = CapitalInvestment(
                name="Auto",
                value=float(data.charges) * -1.0,
                currency=Currency(data.currency),
                yearly_interest=0.0,
                capitalization=Capitalization.ONCE,
                start=data.transaction_date,
                end=data.transaction_date,
            )
            await create(db, "capital_investment", CapitalInvestmentWithId, item)
            return {}
        raise HTTPException(status_code=500, detail=f"Unknown operation in transaction type {data.type}")
