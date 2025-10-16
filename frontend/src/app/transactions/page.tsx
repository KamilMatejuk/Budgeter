import { TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { get } from "../api/fetch";

export default async function Transactions() {
  const { response: transactions, error } = await get<TransactionWithId[]>("/api/transaction");

  return (
    <>
      <PageHeader text="Transactions History" subtext="Overview of your recent transactions" />
      <SectionHeader text="Last Month" subtext="01.07.2025 - 31.07.2025" />
      {error ? (
        <ErrorToast message="Could not download transactions" />
      ) : (
        <>
          {transactions.map((transaction) => (
            <div key={transaction.hash} className="grid grid-cols-7 gap-2 p-2 border-b">
              <p className="break-all">{transaction.hash}</p>
              <p>{transaction.card}</p>
              <p>{transaction.date}</p>
              <p>{transaction.organisation}</p>
              <p>{transaction.title}</p>
              <p>{transaction.value}</p>
              <p>{transaction.tags.join(', ')}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}
