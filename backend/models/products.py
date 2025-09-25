import enum
from datetime import datetime

from models.base import PyBaseModel
from models.optional import Partial

# Enums

class Capitalization(enum.Enum):
    DAILY = "daily"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    ONCE = "once"

class Currency(enum.Enum):
    PLN = "PLN"
    USD = "USD"
    EUR = "EUR"

# Base product

class Product(PyBaseModel):
    name: str
    value: float
    currency: Currency

# Specific products

class Cash(Product):
    pass

class PersonalAccount(Product):
    number: str

class Card(Product):
    number: str
    credit: float | None = None

class SavingsAccount(Product):
    number: str
    yearly_interest: float
    capitalization: Capitalization

class StockAccount(Product):
    number: str
    yearly_interest: float

class CapitalInvestment(Product):
    yearly_interest: float
    capitalization: Capitalization
    start: datetime
    end: datetime

class MonthlyIncome(Product):
    day_of_month: int

class MonthlyExpense(Product):
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
