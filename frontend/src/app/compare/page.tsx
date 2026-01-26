import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import WarningToast from "@/components/toast/WarningToast";
import { getCompareData } from "../api/getters";
import Filters, { FiltersProps } from "./Filters";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { Comparison } from "@/types/backend";
import { parseSearchParams } from "./utils";
import Details from "./Details";

interface PageProps {
  searchParams: Promise<FiltersProps>;
}

export default async function Compare({ searchParams }: PageProps) {
  // read params
  const sp = parseSearchParams(await searchParams);
  // get comparison data
  let error = null;
  let warning = null;
  let data: Comparison[] = [];
  const filtersSet = Object.entries(sp)
    .filter(([k, _]) => k !== "tagsInJoin" && k !== "tagsOutJoin")
    .some(([_, v]) => (Array.isArray(v) ? v.length > 0 : !!v));
  if (!filtersSet) {
    warning = "No filters set";
  } else {
    const { response, error: compareError } = await getCompareData(sp);
    if (compareError != null) error = compareError;
    else if (response.length === 0) warning = "No transactions found";
    else data = response;
  }

  return (
    <>
      <PageHeader text="Compare" subtext="Look for patterns and compare tags" />
      <SectionHeader text="Filters" />
      <Filters {...sp} />
      {error != null
        ? <ErrorToast message={error} />
        : warning
          ? <WarningToast message={warning} />
          : <Details data={data} filters={sp} />
      }
    </>
  );
}
