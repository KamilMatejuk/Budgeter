import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import WarningToast from "@/components/toast/WarningToast";
import TableTransactions from "@/components/table/tables/TableTransactions";
import { getFilteredTransactions } from "../api/getters";
import Filters, { FiltersProps } from "./Filters";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { TransactionRichWithId } from "@/types/backend";
import { parseSearchParams } from "./utils";
import Summary from "./Summary";


interface PageProps {
  searchParams: Promise<FiltersProps>;
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
    if (transactionsError) error = transactionsError.message;
    else if (response.length === 0) warning = "No transactions found";
    else transactions = response;
  }

  return (
    <>
      <PageHeader text="Search" subtext="Find specific transactions using filters" />
      <SectionHeader text="Filters" />
      <Filters {...sp} />
      {error
        ? <ErrorToast message={error} />
        : warning
          ? <WarningToast message={warning} />
          : <>
            <SectionHeader text="Summary" />
            <Summary data={transactions} />
            <SectionHeader text="Results" />
            <TableTransactions data={transactions} />
          </>
      }
    </>
  );
}
