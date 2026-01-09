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
        # approimate convertion rates
        if src == dst: return 1.0
        if src == Currency.PLN and dst == Currency.USD: return 0.28
        if src == Currency.PLN and dst == Currency.EUR: return 0.24
        if src == Currency.USD and dst == Currency.PLN: return 3.62
        if src == Currency.USD and dst == Currency.EUR: return 0.86
        if src == Currency.EUR and dst == Currency.PLN: return 4.21
        if src == Currency.EUR and dst == Currency.USD: return 1.17
        return 1.0

class AccountType(enum.Enum):
    PERSONAL = "Osobiste"
    EXCHANGE = "Walutowe"
    LUNCH = "Lunchowe"


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

class SavingsAccount(PyBaseModel):
    name: str
    number: str
    value: float
    currency: Currency
    yearly_interest: float
    capitalization: Capitalization

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

class MonthlyIncome(PyBaseModel):
    name: str
    value: float
    day_of_month: int
    currency: Currency

class MonthlyExpense(PyBaseModel):
    name: str
    value: float
    day_of_month: int
    currency: Currency

# Partial models for updates

class CashPartial(Cash, metaclass=Partial): pass
class PersonalAccountPartial(PersonalAccount, metaclass=Partial): pass
class CardPartial(Card, metaclass=Partial): pass
class SavingsAccountPartial(SavingsAccount, metaclass=Partial): pass
class StockAccountPartial(StockAccount, metaclass=Partial): pass
class CapitalInvestmentPartial(CapitalInvestment, metaclass=Partial): pass
class MonthlyIncomePartial(MonthlyIncome, metaclass=Partial): pass
class MonthlyExpensePartial(MonthlyExpense, metaclass=Partial): pass

# WithId models for responses
class CashWithId(Cash, metaclass=WithId): pass
class PersonalAccountWithId(PersonalAccount, metaclass=WithId): pass
class CardWithId(Card, metaclass=WithId): pass
class SavingsAccountWithId(SavingsAccount, metaclass=WithId): pass
class StockAccountWithId(StockAccount, metaclass=WithId): pass
class CapitalInvestmentWithId(CapitalInvestment, metaclass=WithId): pass
class MonthlyIncomeWithId(MonthlyIncome, metaclass=WithId): pass
class MonthlyExpenseWithId(MonthlyExpense, metaclass=WithId): pass
