import ErrorToast from "../toast/ErrorToast";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DEFAULT_CHART_RANGE } from "@/types/enum";
import AccountsHistoryChart from "./AccountsHistoryChart";
import { getHistoricAccountValues, getPersonalAccounts } from "@/app/api/getters";


export default async function AccountsHistory() {
  // handle server-side fetch and errors
  // then set cached data to be used by client
  const queryClient = new QueryClient()
  const {
    response: totalAccountValueResponse,
    error: totalAccountValueError
  } = await getHistoricAccountValues();
  if (totalAccountValueError)
    return <ErrorToast message={`Could not download accounts history: ${totalAccountValueError.message}`} />;

  const { response: accountsResponse, error: accountsError } = await getPersonalAccounts();
  if (accountsError)
    return <ErrorToast message={`Could not download personal accounts: ${accountsError.message}`} />;

  queryClient.setQueryData(["account_value_history", DEFAULT_CHART_RANGE], totalAccountValueResponse);
  accountsResponse.forEach(async account => {
    const { response } = await getHistoricAccountValues(account._id);
    queryClient.setQueryData(["account_value_history", DEFAULT_CHART_RANGE, account._id], response);
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountsHistoryChart />
    </HydrationBoundary>
  );
}
