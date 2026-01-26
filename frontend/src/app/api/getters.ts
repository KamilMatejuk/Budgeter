import {
  AccountRequirementsResponse,
  BackupResponse,
  CapitalInvestmentRichWithId,
  CardRequirementsResponse,
  CardRichWithId,
  CashWithId,
  Comparison,
  MonthComparisonRow,
  MonthlyExpenseWithId,
  MonthlyIncomeWithId,
  OrganisationRichWithId,
  PersonalAccountRichWithId,
  Source,
  StockAccountRichWithId,
  TagComposition,
  TagWithId,
  TransactionRichWithId,
} from "@/types/backend";
import { get } from "./fetch";
import { ChartRange, DEFAULT_CHART_RANGE } from "@/types/enum";
import { FiltersProps as SearchFiltersProps } from "../search/Filters";
import { FiltersProps as CompareFiltersProps } from "../compare/Filters";
import { pushFiltersToUrl as pushSearchFiltersToUrl } from "../search/utils";
import { pushFiltersToUrl as pushCompareFiltersToUrl } from "../compare/utils";


export async function getSources() {
  return await get<Source[]>("/api/source");
}

export async function getBackups() {
  return await get<BackupResponse[]>(`/api/backup`, ["backup"]);
}

export async function getCards() {
  return await get<CardRichWithId[]>("/api/products/card", ["card"]);
}

export async function getCash() {
  return await get<CashWithId[]>("/api/products/cash", ["cash"]);
}

export const _sortPersonalAccounts = (accounts: PersonalAccountRichWithId[]) => {
  return accounts.sort((a, b) => {
    if (a.bank !== b.bank) return a.bank.localeCompare(b.bank);
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.owner.localeCompare(b.owner);
  });
};
export async function getPersonalAccounts() {
  const { response, error } = await get<PersonalAccountRichWithId[]>("/api/products/personal_account", ["personal_account"]);
  // sort accounts by bank, type, owner
  if (response) return { response: _sortPersonalAccounts(response), error: null };
  return { response: null, error };
}

export async function getStockAccounts() {
  return await get<StockAccountRichWithId[]>("/api/products/stock_account", ["stock_account"]);
}

export async function getCapitalInvestments() {
  return await get<CapitalInvestmentRichWithId[]>("/api/products/capital_investment", ["capital_investment"]);
}

export async function getMonthlyIncomes() {
  return await get<MonthlyIncomeWithId[]>("/api/products/monthly_income", ["monthly_income"]);
}

export async function getMonthlyExpenses() {
  return await get<MonthlyExpenseWithId[]>("/api/products/monthly_expense", ["monthly_expense"]);
}

export async function getOrganisations() {
  return await get<OrganisationRichWithId[]>("/api/organisation", ["organisation"]);
}

export async function getTags() {
  return await get<TagWithId[]>("/api/tag", ["tag"]);
}

export async function getTransactions(year: number, month: number) {
  return await get<TransactionRichWithId[]>(`/api/transactions/${year}/${month}`, ["transaction"]);
}

export async function getFilteredTransactions(filters: SearchFiltersProps) {
  const url = `/api/transactions/filtered?${pushSearchFiltersToUrl(filters)}`;
  return await get<TransactionRichWithId[]>(url, ["transaction", "tag", "personal_account", "organisation", "filtered"]);
}

export async function getCompareData(filters: CompareFiltersProps) {
  const url = `/api/history/compare?${pushCompareFiltersToUrl(filters)}`;
  return await get<Comparison[]>(url, ["transaction", "tag", "compare"]);
}

export async function getDeletedTransactions() {
  return await get<TransactionRichWithId[]>(`/api/transactions/deleted`, ["transaction"]);
}

export async function getNewTransactions() {
  return await get<TransactionRichWithId[]>(`/api/transactions/new`, ["transaction"]);
}

export async function getDebtTransactions() {
  return await get<TransactionRichWithId[]>("/api/transactions/debt", ["transaction"]);
}

export async function getTransferTransactions() {
  return await get<TransactionRichWithId[]>(`/api/transactions/transfer`, ["transaction"]);
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

export async function getMonthTagComparison() {
  return await get<MonthComparisonRow[]>(`/api/history/month_comparison`, ["transaction", "tag"]);
}

export async function getTagComposition() {
  return await get<TagComposition[]>(`/api/history/tag_composition`, ["transaction", "tag"]);
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
