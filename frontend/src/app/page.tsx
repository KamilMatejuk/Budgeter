import { Transaction } from "@/types/backend";
import { get } from "./api/fetch";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function Home() {
  const { response: transactions, error } = await get<Transaction[]>("/api/transaction");

  return (
    <div className="w-full h-full">
      {error ? (
        <ErrorToast message="Could not download transactions" />
      ) : (
        <>
          {transactions.map((transaction) => (
            <div key={transaction.identification} className="grid grid-cols-7 gap-2 p-2 border-b">
              <p>{transaction.identification}</p>
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
    </div>
  );
}
