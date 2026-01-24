import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "./InputWithError";
import { CellTag } from "../table/cells/CellTag";
import { useRichTags } from "@/app/api/query";
import SearchableTextInputWithError from "./SearchableTextInputWithError";
import { OrganisationWithId } from "@/types/backend";


interface TagsInputWithErrorProps<T> extends SingleInputWithErrorProps<T> {
  organisation?: OrganisationWithId;
  singleSelect?: boolean;
}

export default function TagsInputWithError<T>({ formik, formikName, label, organisation, singleSelect }: TagsInputWithErrorProps<T>) {
  const tags = useRichTags();
  const tagOptions = useMemo(() => tags.map(tag =>
    ({ id: tag._id, name: tag.name, object: <CellTag tag={tag} /> })),
    [tags]);

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
      options={tagOptions}
      suggestedOptions={suggestedTagOptions}
      singleSelect={singleSelect}
    />
  );
}
