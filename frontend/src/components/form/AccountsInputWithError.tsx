import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "./InputWithError";
import { usePersonalAccounts } from "@/app/api/query";
import SearchableTextInputWithError from "./SearchableTextInputWithError";
import { getAccountName } from "../table/cells/AccountNameUtils";
import CellAccountName from "../table/cells/CellAccountName";


export default function AccountsInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const accounts = usePersonalAccounts();
  const accountOptions = useMemo(() => accounts.map(acc =>
    ({ id: acc._id, name: getAccountName(acc), object: <CellAccountName account={acc} /> })),
    [accounts]);

  return (
    <SearchableTextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      options={accountOptions}
    />
  );
}
