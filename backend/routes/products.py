from fastapi import APIRouter

from routes.base import CRUDRouterFactory
from models.products import (
    CapitalInvestmentWithId, CardWithId, Cash, CashPartial, CashWithId, MonthlyExpenseWithId, MonthlyIncomeWithId,
    PersonalAccount, PersonalAccountPartial,
    Card, CardPartial, PersonalAccountWithId,
    SavingsAccount, SavingsAccountPartial, SavingsAccountWithId,
    StockAccount, StockAccountPartial,
    CapitalInvestment, CapitalInvestmentPartial,
    MonthlyIncome, MonthlyIncomePartial,
    MonthlyExpense, MonthlyExpensePartial, StockAccountWithId,
)

router = APIRouter()

cash_router = APIRouter(prefix="/cash")
cash_factory = CRUDRouterFactory(cash_router, "cash", Cash, CashPartial, CashWithId)
cash_factory.create_get()
cash_factory.create_post()
cash_factory.create_patch()
cash_factory.create_delete()
router.include_router(cash_router)

personal_account_router = APIRouter(prefix="/personal_account")
personal_account_factory = CRUDRouterFactory(personal_account_router, "personal_account", PersonalAccount, PersonalAccountPartial, PersonalAccountWithId)
personal_account_factory.create_get()
personal_account_factory.create_get_by_id()
personal_account_factory.create_post()
personal_account_factory.create_patch()
personal_account_factory.create_delete()
router.include_router(personal_account_router)

card_router = APIRouter(prefix="/card")
card_factory = CRUDRouterFactory(card_router, "card", Card, CardPartial, CardWithId)
card_factory.create_get()
card_factory.create_get_by_id()
card_factory.create_post()
card_factory.create_patch()
card_factory.create_delete()
router.include_router(card_router)

savings_account_router = APIRouter(prefix="/savings_account")
savings_account_factory = CRUDRouterFactory(savings_account_router, "savings_account", SavingsAccount, SavingsAccountPartial, SavingsAccountWithId)
savings_account_factory.create_get()
savings_account_factory.create_get_by_id()
savings_account_factory.create_post()
savings_account_factory.create_patch()
savings_account_factory.create_delete()
router.include_router(savings_account_router)

stock_account_router = APIRouter(prefix="/stock_account")
stock_account_factory = CRUDRouterFactory(stock_account_router, "stock_account", StockAccount, StockAccountPartial, StockAccountWithId)
stock_account_factory.create_get()
stock_account_factory.create_get_by_id()
stock_account_factory.create_post()
stock_account_factory.create_patch()
stock_account_factory.create_delete()
router.include_router(stock_account_router)

capital_investment_router = APIRouter(prefix="/capital_investment")
capital_investment_factory = CRUDRouterFactory(capital_investment_router, "capital_investment", CapitalInvestment, CapitalInvestmentPartial, CapitalInvestmentWithId)
capital_investment_factory.create_get()
capital_investment_factory.create_get_by_id()
capital_investment_factory.create_post()
capital_investment_factory.create_patch()
capital_investment_factory.create_delete()
router.include_router(capital_investment_router)

monthly_income_router = APIRouter(prefix="/monthly_income")
monthly_income_factory = CRUDRouterFactory(monthly_income_router, "monthly_income", MonthlyIncome, MonthlyIncomePartial, MonthlyIncomeWithId)
monthly_income_factory.create_get()
monthly_income_factory.create_get_by_id()
monthly_income_factory.create_post()
monthly_income_factory.create_patch()
monthly_income_factory.create_delete()
router.include_router(monthly_income_router)

monthly_expense_router = APIRouter(prefix="/monthly_expense")
monthly_expense_factory = CRUDRouterFactory(monthly_expense_router, "monthly_expense", MonthlyExpense, MonthlyExpensePartial, MonthlyExpenseWithId)
monthly_expense_factory.create_get()
monthly_expense_factory.create_get_by_id()
monthly_expense_factory.create_post()
monthly_expense_factory.create_patch()
monthly_expense_factory.create_delete()
router.include_router(monthly_expense_router)
