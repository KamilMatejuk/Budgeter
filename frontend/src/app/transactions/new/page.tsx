import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import InfoToast from "@/components/toast/InfoToast";
import AnnotateTransactions from "./AnnotateTransactions";
import { getNewTransactions } from "@/app/api/getters";


export default async function Transactions() {
  const { response: transactions, error } = await getNewTransactions();

  return (
    <>
      <PageHeader
        text={"New Transactions" + (transactions ? ` (${transactions.length})` : "")}
        subtext="Transactions (probably from recent import) that don't have any tags" />
      {error != null
        ? <ErrorToast message={`Could not download transactions: ${error}`} />
        : transactions.length == 0
          ? <InfoToast message="No transactions found" />
          : <AnnotateTransactions transactions={transactions} />
      }
    </>
  );
}
