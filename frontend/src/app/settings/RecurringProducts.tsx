import { get } from "../api/fetch";
import { MonthlyExpenseWithId, MonthlyIncomeWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import TableRecurringProducts from "@/components/table/tables/TableRecurringProducts";

export default async function RecurringProducts() {
  const { response: income, error: incomeError } = await get<MonthlyIncomeWithId[]>("/api/products/monthly_income", ["monthly_income"]);
  const { response: expense, error: expenseError } = await get<MonthlyExpenseWithId[]>("/api/products/monthly_expense", ["monthly_expense"]);

  return (
    <>
      {incomeError
        ? <ErrorToast message={`Could not download income: ${incomeError.message}`} />
        : <TableRecurringProducts data={income} type="income" />}
      {expenseError
        ? <ErrorToast message={`Could not download expenses: ${expenseError.message}`} />
        : <TableRecurringProducts data={expense} type="expense" />}
    </>
  );
}
