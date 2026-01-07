import ErrorToast from "../toast/ErrorToast";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ChartRange } from "@/types/enum";
import AccountsHistoryChart from "./AccountsHistoryChart";
import { getHistoricIncomeExpenseValues } from "@/app/api/getters";
import IncomExpenseHistoryChart from "./IncomExpenseHistoryChart";


export default async function IncomExpenseHistory() {
  // handle server-side fetch and errors
  // then set cached data to be used by client
  const queryClient = new QueryClient()
  const { response, error } = await getHistoricIncomeExpenseValues(ChartRange["1Y"]);
  if (error)
    return <ErrorToast message={`Could not download accounts history: ${error.message}`} />;
  queryClient.setQueryData(["income_expense_history", ChartRange["1Y"]], response);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IncomExpenseHistoryChart />
    </HydrationBoundary>
  );
}
