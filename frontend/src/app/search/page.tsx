import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import WarningToast from "@/components/toast/WarningToast";
import TableTransactions from "@/components/table/tables/TableTransactions";
import { getFilteredTransactions } from "../api/getters";
import Filters, { FiltersProps } from "./Filters";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { TransactionRichWithId } from "@/types/backend";
import { getDescriptiveSearchParams, parseSearchParams } from "./utils";
import Summary from "@/components/page_layout/Summary";
import { Metadata } from "next";


interface PageProps {
  searchParams: Promise<FiltersProps>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = parseSearchParams(await searchParams);
  const desc = getDescriptiveSearchParams(sp);
  return { title: "Search " + (desc ? `for ${desc}` : "without filters") }
}

export default async function Search({ searchParams }: PageProps) {
  // read params
  const sp = parseSearchParams(await searchParams);
  // get transactions
  let error = null;
  let warning = null;
  let transactions: TransactionRichWithId[] = [];
  const filtersSet = Object.entries(sp)
    .filter(([k, _]) => k !== "tagsInJoin" && k !== "tagsOutJoin")
    .some(([_, v]) => (Array.isArray(v) ? v.length > 0 : !!v));
  if (!filtersSet) {
    warning = "No filters set";
  } else {
    const { response, error: transactionsError } = await getFilteredTransactions(sp);
    if (transactionsError != null) error = transactionsError;
    else if (response.length === 0) warning = "No transactions found";
    else transactions = response;
  }

  return (
    <>
      <PageHeader text="Search" subtext="Find specific transactions using filters" />
      <SectionHeader text="Filters" />
      <Filters {...sp} />
      {error != null
        ? <ErrorToast message={error} />
        : warning
          ? <WarningToast message={warning} />
          : <>
            <SectionHeader text="Summary" />
            <Summary data={[
              { value: transactions.length, label: 'Total transactions' },
              {
                value: transactions.filter(t => t.value > 0).reduce((sum, t) => sum + t.value_pln, 0).toFixed(2) + ' zł',
                label: 'Total earned'
              },
              {
                value: transactions.filter(t => t.value < 0).reduce((sum, t) => sum + t.value_pln, 0).toFixed(2) + ' zł',
                label: 'Total spent'
              },
              {
                value: transactions.reduce((sum, t) => sum + t.value_pln, 0).toFixed(2) + ' zł',
                label: 'Total value'
              },
            ]} />
            <SectionHeader text="Results" />
            <TableTransactions data={transactions} />
          </>
      }
    </>
  );
}
