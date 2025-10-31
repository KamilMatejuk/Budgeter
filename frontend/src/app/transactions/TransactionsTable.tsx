import { Transaction, TransactionWithId } from "@/types/backend";
import SectionHeader from "@/components/page_layout/SectionHeader";
import Table from "@/components/table/Table";


interface TransactionsTableProps {
  header: string;
  transactions: TransactionWithId[];
}


export default async function TransactionsTable({ header, transactions }: TransactionsTableProps) {
  // get details
  const minDate = new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())));
  const maxDate = new Date(Math.max(...transactions.map(t => new Date(t.date).getTime())));
  const dateRange = `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;

  return (
    <>
      <SectionHeader text={header} subtext={dateRange} />
      <Table<Transaction, TransactionWithId>
        url="/api/transaction"
        tag="transaction"
        data={transactions}
        columns={["date", "account", "title", "organisation", "diffValue", "tags"]}
        hideCreating />
    </>
  );
}
