import { get } from "../api/fetch";
import { CapitalInvestmentWithId, SavingsAccountWithId, StockAccountWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import TableStocks from "@/components/table/tables/TableStocks";
import TableInvestments from "@/components/table/tables/TableInvestments";
import TableSavings from "@/components/table/tables/TableSavings";

export default async function Investments() {
  const { response: stock, error: stockAccountError } = await get<StockAccountWithId[]>("/api/products/stock_account", ["stock_account"]);
  const { response: capital, error: capitalInvestmentError } = await get<CapitalInvestmentWithId[]>("/api/products/capital_investment", ["capital_investment"]);
  const { response: savings, error: savingsAccountError } = await get<SavingsAccountWithId[]>("/api/products/savings_account", ["savings_account"]);

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
