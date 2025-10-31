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
  const year = await searchParams.year;
  const month = await searchParams.month;
  const yearNr = year ? parseInt(year) : new Date().getFullYear();
  const monthNr = month ? parseInt(month) : new Date().getMonth() + 1;
  // get transactions
  const { response: transactions, error } = await get<TransactionWithId[]>(`/api/transaction/${yearNr}/${monthNr}`, ["transaction"]);

  return (
    <>
      <PageHeader text="Transactions History" subtext="Overview of your recent transactions" />
      <MonthSelector year={yearNr} month={monthNr} />
      {error
        ? <ErrorToast message="Could not download transactions" />
        : transactions.length == 0
          ? <WarningToast message="No transactions found" />
          : <TransactionsTable transactions={transactions} header={`${monthName(monthNr)} ${yearNr}`} />
      }
    </>
  );
}
