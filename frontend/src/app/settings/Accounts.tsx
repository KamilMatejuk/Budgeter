import { get } from "../api/fetch";
import { PersonalAccount, PersonalAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";
import { columns, numberColumn } from "./const";

export default async function Accounts() {
  const { response, error } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);

  return (
    error
      ? <ErrorToast message={`Could not download personal accounts: ${error.message}`} />
      : <Table<PersonalAccount, PersonalAccountWithId>
        url="/api/products/personal_account"
        tag="personal_account"
        newText="account"
        data={response}
        columns={[...columns, numberColumn]} />
  );
}
