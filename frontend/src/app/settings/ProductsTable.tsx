import { get } from "../api/fetch";
import { CapitalInvestmentWithId, CardWithId, CashWithId, MonthlyExpenseWithId, MonthlyIncomeWithId, PersonalAccountWithId, SavingsAccountWithId, StockAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function ProductsTable() {
  const { response: cash, error: cashError } = await get<CashWithId[]>("/api/products/cash");
  const { response: personalAccount, error: personalAccountError } = await get<PersonalAccountWithId[]>("/api/products/personal_account");
  const { response: card, error: cardError } = await get<CardWithId[]>("/api/products/card");
  const { response: savingsAccount, error: savingsAccountError } = await get<SavingsAccountWithId[]>("/api/products/savings_account");
  const { response: stockAccount, error: stockAccountError } = await get<StockAccountWithId[]>("/api/products/stock_account");
  const { response: capitalInvestment, error: capitalInvestmentError } = await get<CapitalInvestmentWithId[]>("/api/products/capital_investment");
  const { response: monthlyIncome, error: monthlyIncomeError } = await get<MonthlyIncomeWithId[]>("/api/products/monthly_income");
  const { response: monthlyExpense, error: monthlyExpenseError } = await get<MonthlyExpenseWithId[]>("/api/products/monthly_expense");

  if (cashError) return <ErrorToast message={`Could not download products (cash): ${cashError.message}`} />;
  if (personalAccountError) return <ErrorToast message={`Could not download products (personal account): ${personalAccountError.message}`} />;
  if (cardError) return <ErrorToast message={`Could not download products (card): ${cardError.message}`} />;
  if (savingsAccountError) return <ErrorToast message={`Could not download products (savings account): ${savingsAccountError.message}`} />;
  if (stockAccountError) return <ErrorToast message={`Could not download products (stock account): ${stockAccountError.message}`} />;
  if (capitalInvestmentError) return <ErrorToast message={`Could not download products (capital investment): ${capitalInvestmentError.message}`} />;
  if (monthlyIncomeError) return <ErrorToast message={`Could not download products (monthly income): ${monthlyIncomeError.message}`} />;
  if (monthlyExpenseError) return <ErrorToast message={`Could not download products (monthly expense): ${monthlyExpenseError.message}`} />;

  const products = cash.map(item => ({ ...item, type: 'Cash' }))
    .concat(personalAccount.map(item => ({ ...item, type: 'Personal Account' })))
    .concat(card.map(item => ({ ...item, type: 'Card' })))
    .concat(savingsAccount.map(item => ({ ...item, type: 'Savings Account' })))
    .concat(stockAccount.map(item => ({ ...item, type: 'Stock Account' })))
    .concat(capitalInvestment.map(item => ({ ...item, type: 'Capital Investment' })))
    .concat(monthlyIncome.map(item => ({ ...item, type: 'Monthly Income' })))
    .concat(monthlyExpense.map(item => ({ ...item, type: 'Monthly Expense' })));

  return (
    <Table data={products} columns={[
      { accessorKey: "type", header: "Type" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "value", header: "Value" },
      { accessorKey: "currency", header: "Currency" },
    ]} />
  );
}
