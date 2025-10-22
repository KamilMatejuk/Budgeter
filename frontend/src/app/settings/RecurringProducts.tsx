import { get } from "../api/fetch";
import { MonthlyExpense, MonthlyExpenseWithId, MonthlyIncome, MonthlyIncomeWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function RecurringProducts() {
  const { response: income, error: incomeError } = await get<MonthlyIncomeWithId[]>("/api/products/monthly_income", ["monthly_income"]);
  const { response: expense, error: expenseError } = await get<MonthlyExpenseWithId[]>("/api/products/monthly_expense", ["monthly_expense"]);

  return (
    <>
      {incomeError
        ? <ErrorToast message={`Could not download income: ${incomeError.message}`} />
        : <Table<MonthlyIncome, MonthlyIncomeWithId>
          url="/api/products/monthly_income"
          tag="monthly_income"
          newText="monthly income"
          data={income}
          columns={["name", "value", "currency", "dayOfMonth"]} />}
      {expenseError
        ? <ErrorToast message={`Could not download expenses: ${expenseError.message}`} />
        : <Table<MonthlyExpense, MonthlyExpenseWithId>
          url="/api/products/monthly_expense"
          tag="monthly_expense"
          newText="monthly expense"
          data={expense}
          columns={["name", "value", "currency", "dayOfMonth"]} />}
    </>
  );
}
