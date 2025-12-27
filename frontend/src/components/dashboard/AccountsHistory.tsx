import { get } from "@/app/api/fetch";
import ErrorToast from "../toast/ErrorToast";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DEFAULT_CHART_RANGE } from "@/types/enum";
import AccountsHistoryChart from "./AccountsHistoryChart";
import { PersonalAccountWithId } from "@/types/backend";


export default async function AccountsHistory() {
  // handle server-side fetch and errors
  // then set cached data to be used by client
  const queryClient = new QueryClient()
  const {
    response: totalAccountValueResponse,
    error: totalAccountValueError
  } = await get<number[]>(`/api/history/account_value/${DEFAULT_CHART_RANGE}`, ["personal_account", "transaction"]);
  if (totalAccountValueError)
    return <ErrorToast message={`Could not download accounts history: ${totalAccountValueError.message}`} />;

  const {
    response: accountsResponse,
    error: accountsError
  } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);
  if (accountsError)
    return <ErrorToast message={`Could not download personal accounts: ${accountsError.message}`} />;

  queryClient.setQueryData(["account_value_history", DEFAULT_CHART_RANGE], totalAccountValueResponse);
  accountsResponse.forEach(async account => {
    const { response } = await get<number[]>(`/api/history/account_value/${DEFAULT_CHART_RANGE}/${account._id}`, ["personal_account", "transaction"]);
    queryClient.setQueryData(["account_value_history", DEFAULT_CHART_RANGE, account._id], response);
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountsHistoryChart />
    </HydrationBoundary>
  );
}
