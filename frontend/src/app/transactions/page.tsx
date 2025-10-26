import { Transaction, TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { get } from "../api/fetch";
import Table from "@/components/table/Table";

export default async function Transactions() {
  const { response, error } = await get<TransactionWithId[]>("/api/transaction", ["transaction"]);

  return (
    <>
      <PageHeader text="Transactions History" subtext="Overview of your recent transactions" />
      <SectionHeader text="Last Month" subtext="01.07.2025 - 31.07.2025" />
      {error ? (
        <ErrorToast message="Could not download transactions" />
      ) : (
        <Table<Transaction, TransactionWithId>
          url="/api/transaction"
          tag="transaction"
          data={response}
          columns={["card", "date", "title", "organisation", "value", "tags"]}
          hideCreating />
      )}
    </>
  );
}
