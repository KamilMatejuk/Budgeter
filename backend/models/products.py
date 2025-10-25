import enum
from datetime import date

from models.base import PyBaseModel, Partial, WithId

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

# Base product

class Product(PyBaseModel):
    name: str
    currency: Currency

# Specific products

class Cash(Product):
    value: float
    pass

class PersonalAccount(Product):
    value: float
    number: str
    min_incoming_amount_monthly: int
    min_outgoing_amount_monthly: int

class Card(Product):
    number: str
    credit: bool
    account: str # id of PersonalAccount the card is assigned to
    min_number_of_transactions_monthly: int

class SavingsAccount(Product):
    value: float
    number: str
    yearly_interest: float
    capitalization: Capitalization

class StockAccount(Product):
    value: float
    number: str
    yearly_interest: float

class CapitalInvestment(Product):
    value: float
    yearly_interest: float
    capitalization: Capitalization
    start: date
    end: date

class MonthlyIncome(Product):
    value: float
    day_of_month: int

class MonthlyExpense(Product):
    value: float
    day_of_month: int

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
