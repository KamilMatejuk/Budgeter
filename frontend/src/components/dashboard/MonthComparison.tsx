import ErrorToast from "../toast/ErrorToast";
import TableMonthComparison from "../table/tables/TableMonthComparison";
import { getMonthComparison } from "@/app/api/getters";


export default async function MonthComparison() {
  const { response, error } = await getMonthComparison();
  if (error)
    return <ErrorToast message={`Could not download month comparison: ${error.message}`} />;
  return (
    <TableMonthComparison data={response} />
  );
}
