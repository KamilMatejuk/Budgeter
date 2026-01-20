import ErrorToast from "@/components/toast/ErrorToast";
import TableStocks from "@/components/table/tables/TableStocks";
import TableInvestments from "@/components/table/tables/TableInvestments";
import { getCapitalInvestments, getStockAccounts } from "../api/getters";

export default async function Investments() {
  const { response: stock, error: stockAccountError } = await getStockAccounts();
  const { response: capital, error: capitalInvestmentError } = await getCapitalInvestments();

  return (
    <>
      {stockAccountError
        ? <ErrorToast message={`Could not download stock accounts: ${stockAccountError.message}`} />
        : <TableStocks data={stock} />}
      {capitalInvestmentError
        ? <ErrorToast message={`Could not download capital investments: ${capitalInvestmentError.message}`} />
        : <TableInvestments data={capital} />}
    </>
  );
}
