import ErrorToast from "@/components/toast/ErrorToast";
import TableRecurringProducts from "@/components/table/tables/TableRecurringProducts";
import { getMonthlyExpenses, getMonthlyIncomes } from "../api/getters";

export default async function RecurringProducts() {
  const { response: income, error: incomeError } = await getMonthlyIncomes();
  const { response: expense, error: expenseError } = await getMonthlyExpenses();

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
