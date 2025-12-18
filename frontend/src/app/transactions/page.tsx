import { TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import { get } from "../api/fetch";
import WarningToast from "@/components/toast/WarningToast";
import MonthSelector from "./MonthSelector";
import SectionHeader from "@/components/page_layout/SectionHeader";
import TableTransactions from "@/components/table/tables/TableTransactions";
import { getDateString, getMonthName } from "@/const/date";


interface PageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function Transactions({ searchParams }: PageProps) {
  // read params
  const { year, month } = await searchParams;
  const yearNr = year ? parseInt(year) : new Date().getFullYear();
  const monthNr = month ? parseInt(month) : new Date().getMonth() + 1;
  // get transactions
  const { response: transactions, error } = await get<TransactionWithId[]>(`/api/transactions/${yearNr}/${monthNr}`, ["transaction"]);
  // get details
  const minDate = new Date(Math.min(...(transactions || []).map(t => new Date(t.date).getTime())));
  const maxDate = new Date(Math.max(...(transactions || []).map(t => new Date(t.date).getTime())));
  const dateRange = `${getDateString(minDate)} - ${getDateString(maxDate)}`;

  return (
    <>
      <PageHeader text="Transactions History" subtext="Overview of your recent transactions" />
      <MonthSelector year={yearNr} month={monthNr} />
      {error
        ? <ErrorToast message="Could not download transactions" />
        : transactions.length == 0
          ? <WarningToast message="No transactions found" />
          : <>
            <SectionHeader text={`${getMonthName(monthNr)} ${yearNr}`} subtext={dateRange} />
            <TableTransactions data={transactions} />
          </>
      }
    </>
  );
}
