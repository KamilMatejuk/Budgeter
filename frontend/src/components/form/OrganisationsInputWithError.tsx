import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "./InputWithError";
import { CellTagId, getTagParts } from "../table/cells/CellTag";
import { useOrganisations } from "@/app/api/query";
import SearchableTextInputWithError from "./SearchableTextInputWithError";
import { CellOrganisationId } from "../table/cells/CellOrganisation";


interface OrganisationsInputWithErrorProps<T> extends SingleInputWithErrorProps<T> {
  singleSelect?: boolean;
}

export default function OrganisationsInputWithError<T>({ formik, formikName, label, singleSelect }: OrganisationsInputWithErrorProps<T>) {
  const organisations = useOrganisations();
  const organisationOptions = useMemo(() => organisations.map(org => (
    { id: org.name, name: org.name }
  )), [organisations]);

  return (
    <SearchableTextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      Option={CellOrganisationId}
      options={organisationOptions}
      singleSelect={singleSelect}
    />
  );
}
