import { TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import { get } from "@/app/api/fetch";
import InfoToast from "@/components/toast/InfoToast";
import AnnotateTransactions from "./AnnotateTransactions";


export default async function Transactions() {
  const { response: transactions, error } = await get<TransactionWithId[]>(`/api/transactions/new`, ["transaction"]);

  return (
    <>
      <PageHeader
        text={"New Transactions" + (transactions ? ` (${transactions.length})` : "")}
        subtext="Transactions (probably from recent import) that don't have any tags" />
      {error
        ? <ErrorToast message="Could not download transactions" />
        : transactions.length == 0
          ? <InfoToast message="No transactions found" />
          : <AnnotateTransactions transactions={transactions} />
      }
    </>
  );
}
