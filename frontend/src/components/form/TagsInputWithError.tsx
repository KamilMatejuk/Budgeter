import React, { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import InputWithError, { getError, getTouched, getValue, SingleInputWithErrorProps } from "./InputWithError";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/app/api/fetch";
import { TagWithId } from "@/types/backend";
import CellTag, { getTagParts } from "../table/cells/CellTag";
import { MdClose, MdExpandMore } from "react-icons/md";


const classes = {
  container: "relative",
  select: "border border-gray-300 px-4 py-2 rounded-md w-full text-center appearance-none",
  selectError: "border-red-200 bg-red-500/10",
  icon: "absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none",
  dropdown: "absolute left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border rounded shadow z-10",
  option: "px-3 py-2 hover:bg-gray-100 cursor-pointer",
  noOptions: "px-3 py-2 text-gray-400 italic",
  selected: "flex flex-wrap max-w-96",
  selectedTag: "flex items-center gap-1 mb-1 mr-1",
};


export default function TagsInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const value = getValue(formik, formikName);
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(value || []);

  const { data: tagOptions } = useQuery({
    queryKey: ["tag", "id_name_record"],
    queryFn: async () => {
      const { response, error } = await get<TagWithId[]>("/api/tag", ["tag"]);
      const idNameRecord = (response || []).reduce(
        (acc, curr) => ({ ...acc, [curr._id]: getTagParts(curr._id, response || []).map(part => part.name).join("/") }),
        {} as Record<string, string>
      );
      const sortedEntries = Object.fromEntries(Object.entries(idNameRecord).sort((a, b) => a[1].localeCompare(b[1])));
      return sortedEntries;
    },
  });

  // Filter by typed text (case-insensitive)
  const filteredOptions = useMemo(() => {
    if (!search) return tagOptions || {};
    const s = search.toLowerCase();
    return Object
      .fromEntries(Object.entries(tagOptions || {})
        .filter(([_, name]) => name.toLowerCase().includes(s)));
  }, [search, tagOptions]);

  return (
    <InputWithError<T> formik={formik} formikNames={[formikName]} label={label}>
      <div className={classes.selected}>
        {selected.map((tagId) => (
          <div key={tagId} className={classes.selectedTag}>
            <CellTag id={tagId} />
            <MdClose className="cursor-pointer" size={16} onClick={() => {
              setSelected((prev) => prev.filter(id => id !== tagId));
              formik.setFieldValue(formikName as string, selected.filter(id => id !== tagId), true);
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
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={twMerge(classes.select, error && touched && classes.selectError)}
          placeholder="Select or type..."
        />
        {/* Dropdown List */}
        {open && (
          <div className={classes.dropdown}>
            {Object.keys(filteredOptions).length === 0 && (
              <div className={classes.noOptions}>No results</div>
            )}
            {Object.keys(filteredOptions).map((id) => (
              <div
                key={id}
                className={classes.option}
                onMouseDown={() => {
                  const newSelected = Array.from(new Set([...selected, id]));
                  formik.setFieldValue(formikName as string, newSelected, true);
                  setSelected(newSelected);
                  setSearch("");
                  setOpen(false);
                }}
              >
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
