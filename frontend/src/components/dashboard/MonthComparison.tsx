import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ErrorToast from "../toast/ErrorToast";
import TableMonthComparison from "../table/tables/TableMonthComparison";
import { getMonthComparison } from "@/app/api/getters";


export default async function MonthComparison() {
  // handle server-side fetch and errors
  // then set cached data to be used by client
  const queryClient = new QueryClient()
  const [year, month] = [new Date().getFullYear(), new Date().getMonth() + 1];
  const { response, error } = await getMonthComparison(year, month);
  if (error)
    return <ErrorToast message={`Could not download month comparison: ${error.message}`} />;
  queryClient.setQueryData(["month_comparison", year, month], response);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TableMonthComparison />
    </HydrationBoundary>
  );
}
