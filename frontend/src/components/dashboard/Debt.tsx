import { get } from "@/app/api/fetch";
import { TransactionWithId } from "@/types/backend";
import TableDebt from "../table/tables/TableDebt";
import ErrorToast from "../toast/ErrorToast";
import InfoToast from "../toast/InfoToast";


export default async function Debt() {
  const { response: transactions, error } = await get<TransactionWithId[]>("/api/transactions/debt", ["transaction"]);
  return error
    ? <ErrorToast message={`Failed to load debt:\n${error}`} />
    : transactions.length === 0
      ? <InfoToast message="No debt found" />
      : <TableDebt data={transactions} />;
}
