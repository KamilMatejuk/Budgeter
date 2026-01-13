import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import WarningToast from "@/components/toast/WarningToast";
import { getDeletedTransactions } from "../api/getters";
import TableTrash from "@/components/table/tables/TableTrash";


export default async function Trash() {
  const { response, error } = await getDeletedTransactions();

  return (
    <>
      <PageHeader text="Trash" subtext="Deleted transactions" />
      {error
        ? <ErrorToast message="Could not download transactions" />
        : response.length == 0
          ? <WarningToast message="No transactions found" />
          : <TableTrash data={response} />
      }
    </>
  );
}
