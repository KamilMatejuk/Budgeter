import { get } from "../api/fetch";
import { CapitalInvestment, CapitalInvestmentWithId, SavingsAccount, SavingsAccountWithId, StockAccount, StockAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function Investments() {
  const { response: stock, error: stockAccountError } = await get<StockAccountWithId[]>("/api/products/stock_account", ["stock_account"]);
  const { response: capital, error: capitalInvestmentError } = await get<CapitalInvestmentWithId[]>("/api/products/capital_investment", ["capital_investment"]);
  const { response: savings, error: savingsAccountError } = await get<SavingsAccountWithId[]>("/api/products/savings_account", ["savings_account"]);

  return (
    <>
      {stockAccountError
        ? <ErrorToast message={`Could not download stock accounts: ${stockAccountError.message}`} />
        : <Table<StockAccount, StockAccountWithId>
          url="/api/products/stock_account"
          tag="stock_account"
          newText="stock account"
          data={stock}
          columns={["name", "value", "currency", "number", "interest"]} />}
      {capitalInvestmentError
        ? <ErrorToast message={`Could not download capital investments: ${capitalInvestmentError.message}`} />
        : <Table<CapitalInvestment, CapitalInvestmentWithId>
          url="/api/products/capital_investment"
          tag="capital_investment"
          newText="capital investment"
          data={capital}
          columns={["name", "value", "currency", "number", "capitalization", "startDate", "endDate"]} />}
      {savingsAccountError
        ? <ErrorToast message={`Could not download saving accounts: ${savingsAccountError.message}`} />
        : <Table<SavingsAccount, SavingsAccountWithId>
          url="/api/products/savings_account"
          tag="savings_account"
          newText="savings account"
          data={savings}
          columns={["name", "value", "currency", "number", "interest", "capitalization"]} />}
    </>
  );
}
