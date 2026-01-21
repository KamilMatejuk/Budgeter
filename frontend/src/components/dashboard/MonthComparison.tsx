import ErrorToast from "../toast/ErrorToast";
import TableMonthComparison from "../table/tables/TableMonthComparison";
import { getMonthTagComparison } from "@/app/api/getters";


export default async function MonthComparison() {
  const { response, error } = await getMonthTagComparison();
  if (error != null)
    return <ErrorToast message={`Could not download month comparison: ${error}`} />;
  return (
    <TableMonthComparison data={response} />
  );
}
