import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import WarningToast from "@/components/toast/WarningToast";
import { getDeletedTransactions, getTransferTransactions } from "../api/getters";
import TableTrash from "@/components/table/tables/TableTrash";
import SectionHeader from "@/components/page_layout/SectionHeader";


export default async function Trash() {
  const { response: deleted, error: deletedError } = await getDeletedTransactions();
  const { response: transfer, error: transferError } = await getTransferTransactions();

  return (
    <>
      <PageHeader text="Trash" subtext="Deleted or ortherwise discarded transactions" />
      <SectionHeader text="Deleted Transactions" subtext="Their deletion affects account values and historical balances" />
      {deletedError != null
        ? <ErrorToast message={`Could not download transactions: ${deletedError}`} />
        : deleted.length == 0
          ? <WarningToast message="No transactions found" />
          : <TableTrash data={deleted} />
      }
      <SectionHeader text="Transfers Between Accounts" subtext="They are removed from summary, while keeping historical value accuracy" />
      {transferError != null
        ? <ErrorToast message={`Could not download transfer transactions: ${transferError}`} />
        : transfer.length == 0
          ? <WarningToast message="No transfer transactions found" />
          : <TableTrash data={transfer} />
      }
    </>
  );
}
