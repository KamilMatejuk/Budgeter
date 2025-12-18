import { TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import { get } from "../api/fetch";
import WarningToast from "@/components/toast/WarningToast";
import Link from "next/link";


export default async function NewTransactions() {
  const { response: transactions, error } = await get<TransactionWithId[]>(`/api/transactions/new`, ["transaction"]);

  return (error
    ? <ErrorToast message="Could not check new transactions" />
    : transactions.length > 0 &&
    (
      <Link href="/transactions/new" className="mb-2 block">
        <WarningToast message={`You have ${transactions.length} new transactions`} />
      </Link>
    )
  );
}
