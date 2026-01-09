import {
  AccountRequirementsResponse,
  BackupResponse,
  CapitalInvestmentWithId,
  CardRequirementsResponse,
  CardWithId,
  CashWithId,
  MonthComparisonRow,
  MonthlyExpenseWithId,
  MonthlyIncomeWithId,
  OrganisationWithId,
  PersonalAccountWithId,
  SavingsAccountWithId,
  StockAccountWithId,
  TagWithId,
  TransactionWithId
} from "@/types/backend";
import { get } from "./fetch";
import { ChartRange, DEFAULT_CHART_RANGE } from "@/types/enum";


export async function getSources() {
  return await get<string[]>("/api/source");
}

export async function getBackups() {
  return await get<BackupResponse[]>(`/api/backup`, ["backup"]);
}

export async function getCards() {
  return await get<CardWithId[]>("/api/products/card", ["card"]);
}

export async function getCash() {
  return await get<CashWithId[]>("/api/products/cash", ["cash"]);
}

export async function getPersonalAccounts() {
  return await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);
}

export async function getStockAccounts() {
  return await get<StockAccountWithId[]>("/api/products/stock_account", ["stock_account"]);
}

export async function getCapitalInvestments() {
  return await get<CapitalInvestmentWithId[]>("/api/products/capital_investment", ["capital_investment"]);
}

export async function getSavingsAccounts() {
  return await get<SavingsAccountWithId[]>("/api/products/savings_account", ["savings_account"]);
}

export async function getMonthlyIncomes() {
  return await get<MonthlyIncomeWithId[]>("/api/products/monthly_income", ["monthly_income"]);
}

export async function getMonthlyExpenses() {
  return await get<MonthlyExpenseWithId[]>("/api/products/monthly_expense", ["monthly_expense"]);
}

export async function getOrganisations() {
  return await get<OrganisationWithId[]>("/api/organisation", ["organisation"]);
}

export async function getTags() {
  return await get<TagWithId[]>("/api/tag", ["tag"]);
}

export async function getTransactions(year: number, month: number) {
  return await get<TransactionWithId[]>(`/api/transactions/${year}/${month}`, ["transaction"]);
}

export async function getNewTransactions() {
  return await get<TransactionWithId[]>(`/api/transactions/new`, ["transaction"]);
}

export async function getDebtTransactions() {
  return await get<TransactionWithId[]>("/api/transactions/debt", ["transaction"]);
}

export async function getHistoricAccountValues(accountId?: string, range?: ChartRange) {
  let endpoint = `/api/history/account_value/`;
  endpoint += range || DEFAULT_CHART_RANGE;
  if (accountId) endpoint += `/${accountId}`;
  return await get<number[]>(endpoint, ["personal_account", "transaction"]);
}

export async function getHistoricIncomeExpenseValues(range?: ChartRange) {
  let endpoint = `/api/history/income_expense/`;
  endpoint += range || DEFAULT_CHART_RANGE;
  return await get<[number[], number[]]>(endpoint, ["transaction"]);
}

export async function getMonthComparison() {
  return await get<MonthComparisonRow[]>(`/api/history/month_comparison`, ["transaction"]);
}

export async function getRequiredAccountsInput() {
  return await get<AccountRequirementsResponse[]>("/api/history/requirements/accounts/in", ["personal_account"]);
}

export async function getRequiredAccountsOutput() {
  return await get<AccountRequirementsResponse[]>("/api/history/requirements/accounts/out", ["personal_account"]);
}

export async function getRequiredCardsTransactions() {
  return await get<CardRequirementsResponse[]>("/api/history/requirements/cards", ["card"]);
}
