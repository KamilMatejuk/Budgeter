import ErrorToast from "@/components/toast/ErrorToast";
import TableAccounts from "@/components/table/tables/TableAccounts";
import { getPersonalAccounts } from "../api/getters";

export default async function Accounts() {
  const { response, error } = await getPersonalAccounts();
  return (
    error
      ? <ErrorToast message={`Could not download personal accounts: ${error.message}`} />
      : <TableAccounts data={response} />
  );
}
