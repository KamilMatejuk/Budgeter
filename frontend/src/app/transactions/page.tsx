import { PersonalAccountWithId, Transaction, TransactionWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { get } from "../api/fetch";
import Table from "@/components/table/Table";

function parse(transactions: TransactionWithId[], accounts: PersonalAccountWithId[] | null) {
  return transactions.map(transaction => ({
    ...transaction,
    account: accounts?.find(acc => acc._id === transaction.account)?.name || transaction.account,
  }));
}

export default async function Transactions() {
  const { response: transactions, error } = await get<TransactionWithId[]>("/api/transaction", ["transaction"]);
  const { response: accounts } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);

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
          data={parse(transactions, accounts)}
          columns={["date", "account", "title", "organisation", "value", "tags"]}
          hideCreating />
      )}
    </>
  );
}
