import ErrorToast from "../toast/ErrorToast";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ChartRange } from "@/types/enum";
import { getHistoricIncomeExpenseValues } from "@/app/api/getters";
import IncomeExpenseHistoryChart from "./IncomeExpenseHistoryChart";


export default async function IncomeExpenseHistory() {
  // handle server-side fetch and errors
  // then set cached data to be used by client
  const queryClient = new QueryClient()
  const { response, error } = await getHistoricIncomeExpenseValues(ChartRange["1Y"]);
  if (error != null)
    return <ErrorToast message={`Could not download accounts history: ${error}`} />;
  queryClient.setQueryData(["income_expense_history", ChartRange["1Y"]], response);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IncomeExpenseHistoryChart />
    </HydrationBoundary>
  );
}
