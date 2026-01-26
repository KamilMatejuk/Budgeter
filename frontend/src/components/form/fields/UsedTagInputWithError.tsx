import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "../InputWithError";
import { CellTag } from "../../table/cells/CellTag";
import { useUsedTags } from "@/app/api/query";
import SearchableTextInputWithError from "../SearchableTextInputWithError";


export default function UsedTagsInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const tags = useUsedTags();
  const tagOptions = useMemo(() => tags.map(tag =>
    ({ id: tag._id, name: tag.name, object: <CellTag tag={tag} /> })),
    [tags]);

  return (
    <SearchableTextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      options={tagOptions}
    />
  );
}
