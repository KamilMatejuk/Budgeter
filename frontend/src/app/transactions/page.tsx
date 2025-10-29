import { PersonalAccountWithId, Transaction, TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { get } from "../api/fetch";
import Table from "@/components/table/Table";
import WarningToast from "@/components/toast/WarningToast";

function parse(transactions: TransactionWithId[], accounts: PersonalAccountWithId[] | null) {
  return transactions.map(transaction => ({
    ...transaction,
    account: accounts?.find(acc => acc._id === transaction.account)?.name || transaction.account,
  }));
}

function getMinMaxDate(transactions: TransactionWithId[]) {
  const minDate = new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())));
  const maxDate = new Date(Math.max(...transactions.map(t => new Date(t.date).getTime())));
  return [minDate, maxDate];
}

function groupByMonths(transactions: TransactionWithId[]) {
  const grouped: { year: number, month: string, transactions: TransactionWithId[], range: string | undefined }[] = [];
  // get boundries
  const [oldest, newest] = getMinMaxDate(transactions);
  // normalize to first day of month
  const cursor = new Date(newest.getFullYear(), newest.getMonth(), 1);
  const end = new Date(oldest.getFullYear(), oldest.getMonth(), 1);
  // iterate
  while (cursor >= end) {
    const transactionsInMonth = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === cursor.getFullYear() && date.getMonth() === cursor.getMonth();
    });
    const [start, end] = getMinMaxDate(transactionsInMonth);
    grouped.push({
      year: cursor.getFullYear(),
      month: cursor.toLocaleString("default", { month: "long" }),
      transactions: transactionsInMonth.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      range: transactionsInMonth.length > 0 ? `${start.toLocaleDateString()} - ${end.toLocaleDateString()}` : undefined,
    });
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return grouped;
}


export default async function Transactions() {
  const { response: transactions, error } = await get<TransactionWithId[]>("/api/transaction", ["transaction"]);
  const { response: accounts } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);

  return (
    <>
      <PageHeader text="Transactions History" subtext="Overview of your recent transactions" />
      {error
        ? <ErrorToast message="Could not download transactions" />
        : transactions.length == 0
          ? <WarningToast message="No transactions found" />
          : (
            <>
              {groupByMonths(transactions).map(group => (
                <div key={`${group.year}-${group.month}`}>
                  <SectionHeader text={`${group.month} ${group.year}`} subtext={group.range} />
                  <Table<Transaction, TransactionWithId>
                    url="/api/transaction"
                    tag="transaction"
                    data={parse(group.transactions, accounts)}
                    columns={["date", "account", "title", "organisation", "value", "tags"]}
                    hideCreating />
                </div>
              ))}
            </>
          )}
    </>
  );
}
