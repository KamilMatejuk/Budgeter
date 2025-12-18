import React, { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import InputWithError, { getError, getTouched, getValue, SingleInputWithErrorProps } from "./InputWithError";
import { TagWithId } from "@/types/backend";
import CellTag, { getTagParts } from "../table/cells/CellTag";
import { MdClose, MdExpandMore } from "react-icons/md";
import { useTags } from "@/app/api/query";


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

function getTagOptions(tags: TagWithId[]) {
  return tags.map(tag => (
    { id: tag._id, name: getTagParts(tag._id, tags).map(part => part.name).join("/") }
  )).sort((a, b) => a.name.localeCompare(b.name));
}

function filterTagOptions(options: { id: string, name: string }[], search: string, selected: string[]) {
  const notSelected = options.filter(({ id }) => !selected.includes(id));
  if (!search) return notSelected || [];
  return notSelected.filter(({ name, id }) => name.toLowerCase().includes(search.toLowerCase()));
}


export default function TagsInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const value = getValue(formik, formikName);
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedTags, setSelectedTags] = useState<string[]>(value || []);

  function highlightUp() { setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1)) }
  function highlightDown() { setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0)) }
  function select(tagId: string) {
    const newSelected = Array.from(new Set([...selectedTags, tagId]));
    setSelectedTags(newSelected);
    formik.setFieldValue(formikName as string, newSelected, true);
    setSearch("");
    setOpen(false);
    setHighlightedIndex(-1);
  }

  const tags = useTags();
  const tagOptions = useMemo(() => getTagOptions(tags || []), [tags]);
  const filteredOptions = useMemo(() => filterTagOptions(tagOptions, search, selectedTags), [search, tagOptions, selectedTags]);

  return (
    <InputWithError<T> formik={formik} formikNames={[formikName]} label={label}>
      <div className={classes.selected}>
        {selectedTags.map((tagId) => (
          <div key={tagId} className={classes.selectedTag}>
            <CellTag id={tagId} />
            <MdClose className="cursor-pointer" size={16} onClick={() => {
              setSelectedTags((prev) => prev.filter(id => id !== tagId));
              formik.setFieldValue(formikName as string, selectedTags.filter(id => id !== tagId), true);
            }} />
          </div>))}
      </div>
      <div className={classes.container}>
        <input
          id={formikName as string}
          name={formikName as string}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); highlightDown() }
            if (e.key === "ArrowUp") { e.preventDefault(); highlightUp() }
            if (e.key === "Enter" && highlightedIndex >= 0) { e.preventDefault(); select(filteredOptions[highlightedIndex].id) }
            if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); setHighlightedIndex(-1) }
          }}
          className={twMerge(classes.select, error && touched && classes.selectError)}
          placeholder="Select or type..."
        />
        {/* Dropdown List */}
        {open && filteredOptions.length > 0 && (
          <div className={classes.dropdown}>
            {filteredOptions.map(({ id }, i) => (
              <div key={id} className={twMerge(classes.option, highlightedIndex === i && classes.optionHighlighted)} onMouseDown={() => select(id)}>
                <CellTag id={id} />
              </div>
            ))}
          </div>
        )}
        <MdExpandMore
          className={twMerge(classes.icon, open && "rotate-180")}
          size={20}
        />
      </div>
    </InputWithError>
  );
}
