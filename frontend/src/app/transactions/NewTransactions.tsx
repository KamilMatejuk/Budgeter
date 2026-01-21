import ErrorToast from "@/components/toast/ErrorToast";
import WarningToast from "@/components/toast/WarningToast";
import Link from "next/link";
import { getNewTransactions } from "../api/getters";


export default async function NewTransactions() {
  const { response: transactions, error } = await getNewTransactions();

  return (error != null
    ? <ErrorToast message={`Could not check new transactions ${error}`} />
    : transactions.length > 0 &&
    (
      <Link href="/transactions/new" className="mb-2 block">
        <WarningToast message={`You have ${transactions.length} new transactions`} />
      </Link>
    )
  );
}
