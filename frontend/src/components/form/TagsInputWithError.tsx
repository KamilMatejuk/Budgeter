import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "./InputWithError";
import CellTag, { getTagParts } from "../table/cells/CellTag";
import { useOrganisation, useTags } from "@/app/api/query";
import SearchableTextInputWithError from "./SearchableTextInputWithError";


const classes = {
  container: "relative",
  select: "border border-gray-300 px-4 py-2 rounded-md w-full text-center appearance-none",
  selectError: "border-red-200 bg-red-500/10",
  icon: "absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none",
  dropdown: "absolute left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border rounded shadow z-10",
  option: "px-1 py-1 hover:bg-gray-100 cursor-pointer",
  optionHighlighted: "bg-gray-100",
  selected: "flex flex-wrap max-w-96",
  selectedTag: "flex items-center gap-1 mb-1 mr-1",
};

interface TagsInputWithErrorProps<T> extends SingleInputWithErrorProps<T> {
  organisationName?: string;
}

export default function TagsInputWithError<T>({ formik, formikName, label, organisationName }: TagsInputWithErrorProps<T>) {
  const tags = useTags();
  const tagOptions = useMemo(() => tags.map(tag => (
    { id: tag._id, name: getTagParts(tag._id, tags).map(part => part.name).join("/") }
  )), [tags]);

  const suggestedTagOptions = organisationName
    ? (useOrganisation(organisationName)?.tags || []).map(id => tagOptions.find(t => t.id === id)).filter(t => t !== undefined)
    : [];

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
