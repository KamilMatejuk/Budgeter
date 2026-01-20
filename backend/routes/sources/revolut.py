import enum
from pydantic import Field, model_validator

from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.utils import Value
from routes.base import get, create
from models.base import PyBaseModel
from models.transaction import Transaction, TransactionWithId
from routes.sources.utils import mark_account_value_in_history
from models.products import PersonalAccountWithId, Currency
from routes.organisation import get_organisation_name_by_name_regex


class RevolutRequest(PyBaseModel):
    type: str = Field(alias="Type")
    product: str = Field(alias="Product")
    date_start: str = Field(alias="Started Date")
    date_end: str = Field(alias="Completed Date")
    description: str = Field(alias="Description")
    amount: str = Field(alias="Amount")
    fee: str = Field(alias="Fee")
    currency: str = Field(alias="Currency")
    state: str = Field(alias="State")
    balance: str = Field(alias="Balance")

    model_config = {
        "populate_by_name": True,
        "extra": "forbid",
    }

    @model_validator(mode="before")
    @classmethod
    def normalize_polish_aliases(cls, data):
        if not isinstance(data, dict): return data
        polish_to_english = {
            "Rodzaj": "Type",
            "Produkt": "Product",
            "Data rozpoczęcia": "Started Date",
            "Data zrealizowania": "Completed Date",
            "Opis": "Description",
            "Kwota": "Amount",
            "Opłata": "Fee",
            "Waluta": "Currency",
            "State": "State",
            "Saldo": "Balance",
        }
        normalized = dict(data)
        for pl, en in polish_to_english.items():
            if pl in normalized and en not in normalized:
                normalized[en] = normalized.pop(pl)
        return normalized

    
class RevolutTransactionType(enum.Enum):
    EXCHANGE = 'Exchange'
    REV_PAYMENT = 'Rev Payment' # TODO add
    CARD_PAYMENT = 'Card Payment'
    CARD_REFUND = 'Card Refund'
    TRANSFER = 'Transfer'
    DEPOSIT = 'Deposit'
    WITHDRAWAL = 'Withdrawal'
    REWARD = 'Reward'
    
    @classmethod
    def _missing_(cls, value):
        polish_map = {
            "Wymiana": cls.EXCHANGE,
            "Płatność Rev": cls.REV_PAYMENT,
            "Płatność kartą": cls.CARD_PAYMENT,
            "Zwrot na kartę": cls.CARD_REFUND,
            "Przelew": cls.TRANSFER,
            "Zasilenie": cls.DEPOSIT,
            "Bankomat": cls.WITHDRAWAL,
            "Nagroda": cls.REWARD,
        }
        if isinstance(value, str): value = value.strip()
        return polish_map.get(value)


async def create_revolut_transaction(data: RevolutRequest, owner: str, db: AsyncIOMotorDatabase):
    if data.state not in ("COMPLETED", "ZAKOŃCZONO"): return

    data.type = RevolutTransactionType(data.type)
    condition = {"bank": "Revolut", "owner": owner, "currency": data.currency}
    account: PersonalAccountWithId = await get(db, "personal_account", PersonalAccountWithId, condition, one=True)
    if not account: raise HTTPException(status_code=500, detail=f"Revolut account for owner {owner} with currency {data.currency} not found")

    currency = Currency(data.currency)
    amount = Value.parse(data.amount)
    fee = Value.parse(data.fee)
    value = amount + fee if amount > 0 else amount - fee
    date = data.date_start.split(" ")[0]
    
    async def create_transaction(title: str, organisation: str = None, parse_organisation: bool = False):
        organisation = organisation or data.description
        if parse_organisation:
            organisation = await get_organisation_name_by_name_regex(organisation, db)
        item = Transaction(account=str(account.id), date=date, title=title,
            organisation=organisation, value=value, currency=currency, tags=[])
        return await create(db, "transactions", TransactionWithId, item)

    if data.type == RevolutTransactionType.EXCHANGE:
        await mark_account_value_in_history(account, date, value, db)
        return
    
    if data.type == RevolutTransactionType.DEPOSIT:
        await mark_account_value_in_history(account, date, value, db)
        return

    if data.type == RevolutTransactionType.WITHDRAWAL:
        await mark_account_value_in_history(account, date, value, db)
        return

    if data.type == RevolutTransactionType.REV_PAYMENT:
        await create_transaction("Płatność kartą", parse_organisation=True)
        await mark_account_value_in_history(account, date, value, db)
        return

    if data.type == RevolutTransactionType.CARD_PAYMENT:
        await create_transaction("Płatność kartą", parse_organisation=True)
        await mark_account_value_in_history(account, date, value, db)
        return

    if data.type == RevolutTransactionType.CARD_REFUND:
        await create_transaction("Zwrot", parse_organisation=True)
        await mark_account_value_in_history(account, date, value, db)
        return
    
    if data.type == RevolutTransactionType.REWARD:
        await create_transaction(data.description, "Revolut", parse_organisation=True)
        await mark_account_value_in_history(account, date, value, db)
        return

    if data.type == RevolutTransactionType.TRANSFER:
        await create_transaction("Przelew", data.description.replace("Transfer to ", ""))
        await mark_account_value_in_history(account, date, value, db)
        return

    raise HTTPException(status_code=500, detail=f"Unknown operation with transaction type {data.type}")
