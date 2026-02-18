import SidebarClient from "./SidebarClient";
import { getCapitalInvestments, getCards, getCash, getPersonalAccounts, getStockAccounts } from "@/app/api/getters";


export default async function Sidebar() {
  // server side wrapper for all components requireing data fetching
  const { response: cashs } = await getCash();
  const { response: cards } = await getCards();
  const { response: accounts } = await getPersonalAccounts();
  const { response: stocks } = await getStockAccounts();
  const { response: capitals } = await getCapitalInvestments();
  const accountsProps = {
    cards: cards?.filter((it) => it.credit && it.value) || [],
    accounts: accounts?.filter((it) => it.value_pln) || [],
    stocks: stocks?.reduce((acc, it) => acc + (it.value_pln || 0), 0) || 0,
    capitals: capitals?.reduce((acc, it) => acc + (it.value_pln || 0), 0) || 0,
    cash: cashs?.reduce((acc, it) => acc + (it.value_pln || 0), 0) || 0,
  };

  return (<SidebarClient accountsProps={accountsProps} />);
}
