import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "./InputWithError";
import CellTag, { getTagParts } from "../table/cells/CellTag";
import { useOrganisation, useTags } from "@/app/api/query";
import SearchableTextInputWithError from "./SearchableTextInputWithError";


interface TagsInputWithErrorProps<T> extends SingleInputWithErrorProps<T> {
  organisationName?: string;
}

export default function TagsInputWithError<T>({ formik, formikName, label, organisationName }: TagsInputWithErrorProps<T>) {
  const tags = useTags();
  const tagOptions = useMemo(() => tags.map(tag => (
    { id: tag._id, name: getTagParts(tag._id, tags).map(part => part.name).join("/") }
  )), [tags]);

  const organisation = useOrganisation(organisationName || "");
  const suggestedTagOptions = useMemo(() =>
    (organisation?.tags || [])
      .map(id => tagOptions.find(t => t.id === id))
      .filter(t => t !== undefined),
    [organisation, tagOptions]
  );

  return (
    <SearchableTextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      Option={CellTag}
      options={tagOptions}
      suggestedOptions={suggestedTagOptions}
    />
  );
}
