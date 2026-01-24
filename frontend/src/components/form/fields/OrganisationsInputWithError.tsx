import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "../InputWithError";
import { useOrganisations } from "@/app/api/query";
import SearchableTextInputWithError from "../SearchableTextInputWithError";
import CellOrganisation from "../../table/cells/CellOrganisation";


interface OrganisationsInputWithErrorProps<T> extends SingleInputWithErrorProps<T> {
  singleSelect?: boolean;
}

export default function OrganisationsInputWithError<T>({ formik, formikName, label, singleSelect }: OrganisationsInputWithErrorProps<T>) {
  const organisations = useOrganisations();
  const organisationOptions = useMemo(() => organisations.map(org =>
    ({ id: org.name, name: org.name, object: <CellOrganisation organisation={{ ...org, tags: org.tags.map(t => t._id) }} /> })),
    [organisations]);

  return (
    <SearchableTextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      options={organisationOptions}
      singleSelect={singleSelect}
    />
  );
}
