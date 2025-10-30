import { TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import { get } from "../api/fetch";
import WarningToast from "@/components/toast/WarningToast";
import TransactionsTable from "./TransactionsTable";
import MonthSelector from "./MonthSelector";


interface PageProps {
  searchParams: {
    year?: string;
    month?: string;
  };
}

export function monthName(month: number) {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('default', { month: 'long' });
}


export default async function Transactions({ searchParams }: PageProps) {
  // read params
  const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month) : new Date().getMonth() + 1;
  // get transactions
  const { response: transactions, error } = await get<TransactionWithId[]>(`/api/transaction/${year}/${month}`, ["transaction"]);

  return (
    <>
      <PageHeader text="Transactions History" subtext="Overview of your recent transactions" />
      <MonthSelector year={year} month={month} />
      {error
        ? <ErrorToast message="Could not download transactions" />
        : transactions.length == 0
          ? <WarningToast message="No transactions found" />
          : <TransactionsTable transactions={transactions} header={`${monthName(month)} ${year}`} />
      }
    </>
  );
}
