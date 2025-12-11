import { get } from "@/app/api/fetch";
import ErrorToast from "../toast/ErrorToast";
import ChartWithSelector from "./ChartWithSelector";

interface AccountsHistoryProps {
  year: number;
}

export default async function AccountsHistory({ year }: AccountsHistoryProps) {
  const { response, error } = await get<Record<string, number[]>>(`/api/history/account_value/${year}`, ["personal_account", "transaction"]);
  if (error) return <ErrorToast message={`Could not download accounts history: ${error.message}`} />;

  const total = Object.values(Object.values(response).reduce((acc, arr) => {
    arr.forEach((val, idx) => {
      acc[idx] = (acc[idx] || 0) + val;
    });
    return acc;
  }, {} as Record<number, number>));

  return (
    <ChartWithSelector data={{ "All Accounts": total, ...response }} chartType="line" chartProps={{ startDate: new Date(`${year}-01-01`) }} />
  );
}
