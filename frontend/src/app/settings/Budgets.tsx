import ErrorToast from "@/components/toast/ErrorToast";
import { getBudgets } from "../api/getters";
import TableBudgets from "@/components/table/tables/TableBudgets";

export default async function Budgets() {
  const { response, error } = await getBudgets();
  return (
    error != null
      ? <ErrorToast message={`Could not download personal accounts: ${error}`} />
      : <TableBudgets data={response} />
  );
}
