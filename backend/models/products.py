import enum
from datetime import date

from models.base import PyBaseModel, Partial, WithId
from models.source import Source

# Enums

class Capitalization(enum.Enum):
    ONCE = "Once"
    DAILY = "Daily"
    MONTHLY = "Monthly"
    YEARLY = "Yearly"

class Currency(enum.Enum):
    PLN = "PLN"
    USD = "USD"
    EUR = "EUR"
    
    @staticmethod
    def convert(src: "Currency", dst: "Currency") -> float:
        # approximate conversion rates
        PLN_per_USD = 3.62
        PLN_per_EUR = 4.21
        if src == dst: return 1.0
        if src == Currency.PLN and dst == Currency.USD: return 1.0 / PLN_per_USD
        if src == Currency.PLN and dst == Currency.EUR: return 1.0 / PLN_per_EUR
        if src == Currency.USD and dst == Currency.PLN: return PLN_per_USD
        if src == Currency.USD and dst == Currency.EUR: return PLN_per_USD / PLN_per_EUR
        if src == Currency.EUR and dst == Currency.PLN: return PLN_per_EUR
        if src == Currency.EUR and dst == Currency.USD: return PLN_per_EUR / PLN_per_USD
        return 1.0

class AccountType(enum.Enum):
    PERSONAL = "Osobiste"
    EXCHANGE = "Walutowe"
    LUNCH = "Lunchowe"
    SAVING = "Oszczędnościowe"


class Cash(PyBaseModel):
    name: str
    value: float
    currency: Currency

class PersonalAccount(PyBaseModel):
    type: AccountType
    owner: str
    bank: Source
    number: str
    value: float
    currency: Currency
    min_incoming_amount_monthly: int
    min_outgoing_amount_monthly: int

class Card(PyBaseModel):
    name: str
    number: str
    value: float
    credit: bool
    active: bool
    currency: Currency
    account: str # id of PersonalAccount the card is assigned to
    min_number_of_transactions_monthly: int
    value: float | None = None # value shouldn't be set from frontend, and is only available for credit cards

class StockAccount(PyBaseModel):
    name: str
    number: str
    value: float
    currency: Currency
    yearly_interest: float

class CapitalInvestment(PyBaseModel):
    name: str
    end: date
    start: date
    value: float
    currency: Currency
    yearly_interest: float
    capitalization: Capitalization

# Partial models for updates

class CashPartial(Cash, metaclass=Partial): pass
class PersonalAccountPartial(PersonalAccount, metaclass=Partial): pass
class CardPartial(Card, metaclass=Partial): pass
class StockAccountPartial(StockAccount, metaclass=Partial): pass
class CapitalInvestmentPartial(CapitalInvestment, metaclass=Partial): pass

# WithId models for responses
class CashWithId(Cash, metaclass=WithId): pass
class PersonalAccountWithId(PersonalAccount, metaclass=WithId): pass
class CardWithId(Card, metaclass=WithId): pass
class StockAccountWithId(StockAccount, metaclass=WithId): pass
class CapitalInvestmentWithId(CapitalInvestment, metaclass=WithId): pass

# custom enriched models

class CardRich(Card): account: PersonalAccountWithId
class CardRichWithId(CardRich, metaclass=WithId): pass

class CashRich(Cash): value_pln: float
class CashRichWithId(CashRich, metaclass=WithId): pass

class PersonalAccountRich(PersonalAccount): value_pln: float
class PersonalAccountRichWithId(PersonalAccountRich, metaclass=WithId): pass

class StockAccountRich(StockAccount): value_pln: float
class StockAccountRichWithId(StockAccountRich, metaclass=WithId): pass

class CapitalInvestmentRich(CapitalInvestment): value_pln: float
class CapitalInvestmentRichWithId(CapitalInvestmentRich, metaclass=WithId): pass
