import ErrorToast from "@/components/toast/ErrorToast";
import TableStocks from "@/components/table/tables/TableStocks";
import TableInvestments from "@/components/table/tables/TableInvestments";
import TableSavings from "@/components/table/tables/TableSavings";
import { getCapitalInvestments, getSavingsAccounts, getStockAccounts } from "../api/getters";

export default async function Investments() {
  const { response: stock, error: stockAccountError } = await getStockAccounts();
  const { response: capital, error: capitalInvestmentError } = await getCapitalInvestments();
  const { response: savings, error: savingsAccountError } = await getSavingsAccounts();

  return (
    <>
      {stockAccountError
        ? <ErrorToast message={`Could not download stock accounts: ${stockAccountError.message}`} />
        : <TableStocks data={stock} />}
      {capitalInvestmentError
        ? <ErrorToast message={`Could not download capital investments: ${capitalInvestmentError.message}`} />
        : <TableInvestments data={capital} />}
      {savingsAccountError
        ? <ErrorToast message={`Could not download saving accounts: ${savingsAccountError.message}`} />
        : <TableSavings data={savings} />}
    </>
  );
}
