import ErrorToast from "../toast/ErrorToast";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DEFAULT_CHART_RANGE } from "@/types/enum";
import AccountsHistoryChart from "./AccountsHistoryChart";
import { getHistoricAccountValues, getPersonalAccounts } from "@/app/api/getters";


export default async function AccountsHistory() {
  // handle server-side fetch and errors
  // then set cached data to be used by client
  const queryClient = new QueryClient()

  const { response: totalAccValueResponse, error: totalAccValueError } = await getHistoricAccountValues(undefined, DEFAULT_CHART_RANGE);
  if (totalAccValueError)
    return <ErrorToast message={`Could not download accounts history: ${totalAccValueError.message}`} />;

  
  const { response: accountsResponse, error: accountsError } = await getPersonalAccounts();
  if (accountsError)
    return <ErrorToast message={`Could not download personal accounts: ${accountsError.message}`} />;
  
  queryClient.setQueryData(["account_value_history", DEFAULT_CHART_RANGE], totalAccValueResponse);

  const { response } = await getHistoricAccountValues("Investments", DEFAULT_CHART_RANGE);
  queryClient.setQueryData(["account_value_history", DEFAULT_CHART_RANGE, "Investments"], response);

  accountsResponse.forEach(async account => {
    const { response } = await getHistoricAccountValues(account._id, DEFAULT_CHART_RANGE);
    queryClient.setQueryData(["account_value_history", DEFAULT_CHART_RANGE, account._id], response);
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountsHistoryChart />
    </HydrationBoundary>
  );
}
