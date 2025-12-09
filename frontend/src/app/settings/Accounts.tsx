import { get } from "../api/fetch";
import { PersonalAccountWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import TableAccounts from "@/components/table/tables/TableAccounts";

export default async function Accounts() {
  const { response, error } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);
  return (
    error
      ? <ErrorToast message={`Could not download personal accounts: ${error.message}`} />
      : <TableAccounts data={response} />
  );
}
