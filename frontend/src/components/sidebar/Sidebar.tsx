import { get } from "@/app/api/fetch";
import SidebarClient from "./SidebarClient";
import { CapitalInvestmentWithId, CardWithId, Currency, PersonalAccountWithId, RequirementsResponse, SavingsAccountWithId, StockAccountWithId } from "@/types/backend";
import { convertToPLN } from "@/app/api/forex";

async function mapCurrenciesToPLN<T extends { value: number; currency: Currency }>(items: T[] | null): Promise<T[]> {
  if (!items || items.length === 0) return [];
  return await Promise.all(
    items.map(async (it: T) => ({ ...it, value: await convertToPLN(it.value, it.currency), currency: "PLN" })));
}


export default async function Sidebar() {
  // server side wrapper for all components requireing data fetching

  const { response: transactions } = await get<RequirementsResponse[]>("/api/history/requirements/cards", ["card"]);
  const { response: incomes } = await get<RequirementsResponse[]>("/api/history/requirements/accounts/in", ["personal_account"]);
  const { response: outcomes } = await get<RequirementsResponse[]>("/api/history/requirements/accounts/out", ["personal_account"]);
  const requirementsProps = {
    transactions: transactions || [],
    incomes: incomes || [],
    outcomes: outcomes || [],
  };

  const { response: cards } = await get<CardWithId[]>("/api/products/card", ["card"]);
  const { response: accounts } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);
  const { response: stocks } = await get<StockAccountWithId[]>("/api/products/stock_account", ["stock_account"]);
  const { response: capitals } = await get<CapitalInvestmentWithId[]>("/api/products/capital_investment", ["capital_investment"]);
  const { response: savings } = await get<SavingsAccountWithId[]>("/api/products/savings_account", ["savings_account"]);
  const accountsProps = {
    cards: cards?.filter((it) => it.credit && it.value) || [],
    accounts: await mapCurrenciesToPLN(accounts?.filter((it) => it.value) || []),
    stocks: (await mapCurrenciesToPLN(stocks)).reduce((acc, it) => acc + (it.value || 0), 0),
    capitals: (await mapCurrenciesToPLN(capitals)).reduce((acc, it) => acc + (it.value || 0), 0),
    savings: (await mapCurrenciesToPLN(savings)).reduce((acc, it) => acc + (it.value || 0), 0),
  };

  return (<SidebarClient requirementsProps={requirementsProps} accountsProps={accountsProps} />);
}
