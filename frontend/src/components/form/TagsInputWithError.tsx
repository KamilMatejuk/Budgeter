import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "./InputWithError";
import { CellTagId, getTagParts } from "../table/cells/CellTag";
import { useTags } from "@/app/api/query";
import SearchableTextInputWithError from "./SearchableTextInputWithError";
import { OrganisationWithId } from "@/types/backend";


interface TagsInputWithErrorProps<T> extends SingleInputWithErrorProps<T> {
  organisation?: OrganisationWithId;
  singleSelect?: boolean;
}

export default function TagsInputWithError<T>({ formik, formikName, label, organisation, singleSelect }: TagsInputWithErrorProps<T>) {
  const tags = useTags();
  const tagOptions = useMemo(() => tags.map(tag => (
    { id: tag._id, name: getTagParts(tag._id, tags).map(part => part.name).join("/") }
  )), [tags]);

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
      Option={CellTagId}
      options={tagOptions}
      suggestedOptions={suggestedTagOptions}
      singleSelect={singleSelect}
    />
  );
}
