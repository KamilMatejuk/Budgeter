import SidebarClient from "./SidebarClient";
import { Currency } from "@/types/backend";
import { convertToPLN } from "@/app/api/forex";
import { getCapitalInvestments, getCards, getPersonalAccounts, getSavingsAccounts, getStockAccounts } from "@/app/api/getters";

async function mapCurrenciesToPLN<T extends { value: number; currency: Currency }>(items: T[] | null): Promise<T[]> {
  if (!items || items.length === 0) return [];
  return await Promise.all(
    items.map(async (it: T) => ({ ...it, value: await convertToPLN(it.value, it.currency), currency: "PLN" })));
}


export default async function Sidebar() {
  // server side wrapper for all components requireing data fetching
  const { response: cards } = await getCards();
  const { response: accounts } = await getPersonalAccounts();
  const { response: stocks } = await getStockAccounts();
  const { response: capitals } = await getCapitalInvestments();
  const { response: savings } = await getSavingsAccounts();
  const accountsProps = {
    cards: cards?.filter((it) => it.credit && it.value) || [],
    accounts: await mapCurrenciesToPLN(accounts?.filter((it) => it.value) || []),
    stocks: (await mapCurrenciesToPLN(stocks)).reduce((acc, it) => acc + (it.value || 0), 0),
    capitals: (await mapCurrenciesToPLN(capitals)).reduce((acc, it) => acc + (it.value || 0), 0),
    savings: (await mapCurrenciesToPLN(savings)).reduce((acc, it) => acc + (it.value || 0), 0),
  };

  return (<SidebarClient accountsProps={accountsProps} />);
}
