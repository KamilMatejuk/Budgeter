import TableDebt from "../table/tables/TableDebt";
import ErrorToast from "../toast/ErrorToast";
import InfoToast from "../toast/InfoToast";
import { getDebtTransactions } from "@/app/api/getters";


export default async function Debt() {
  const { response: transactions, error } = await getDebtTransactions();
  return error
    ? <ErrorToast message={`Failed to load debt:\n${error}`} />
    : transactions.length === 0
      ? <InfoToast message="No debt found" />
      : <TableDebt data={transactions} />;
}
