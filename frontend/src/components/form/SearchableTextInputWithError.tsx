import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import InputWithError, { getError, getTouched, getValue, SingleInputWithErrorProps } from "./InputWithError";
import { MdClose, MdExpandMore } from "react-icons/md";


const classes = {
  container: "relative",
  select: "border border-gray-300 px-4 py-2 rounded-md w-full text-center appearance-none",
  selectError: "border-red-200 bg-red-500/10",
  icon: "absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none",
  dropdown: "absolute left-0 right-0 mt-0 max-h-60 overflow-auto bg-white border rounded shadow z-10",
  option: "px-1 py-1 hover:bg-gray-100 cursor-pointer",
  optionLabel: "hover:bg-inherit text-subtext text-sm",
  optionHighlighted: "bg-gray-100",
  selected: "flex flex-wrap max-w-96",
  selectedTag: "flex items-center gap-1 mt-1 mr-1 px-[2px] py-[1px] bg-second-bg rounded",
};

interface SearchableOption {
  id: string;
  name: string;
  object: ReactNode;
}

interface SearchableTextInputWithErrorProps<T> extends SingleInputWithErrorProps<T> {
  options: SearchableOption[];
  suggestedOptions?: SearchableOption[];
  singleSelect?: boolean;
}

function filterOptions(options: SearchableOption[], search: string, selected: string[]) {
  const notSelected = options.filter(({ id }) => !selected.includes(id));
  if (!search) return notSelected || [];
  return notSelected.filter(({ name }) => name.toLowerCase().includes(search.toLowerCase()));
}

export default function SearchableTextInputWithError<T>({
  formik,
  formikName,
  label,
  options,
  suggestedOptions,
  singleSelect,
}: SearchableTextInputWithErrorProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const value = getValue(formik, formikName);
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedIds, setSelectedIds] = useState<string[]>(singleSelect ? [] : Array.isArray(value) ? value : [value]);

  useEffect(() => { setSelectedIds(singleSelect ? [] : Array.isArray(value) ? value : [value]) }, [value, singleSelect]);

  function highlightUp() { setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1)) }
  function highlightDown() { setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0)) }
  function select(tagId: string) {
    if (singleSelect) {
      formik.setFieldValue(formikName as string, tagId, true);
      setSearch(options.find(o => o.id === tagId)?.name || tagId);
    } else {
      const newSelected = Array.from(new Set([...selectedIds, tagId]));
      setSelectedIds(newSelected);
      formik.setFieldValue(formikName as string, newSelected, true);
      setSearch("");
    }
    setOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }
  function deselect(tagId: string) {
    const newSelected = selectedIds.filter(id => id !== tagId);
    setSelectedIds(newSelected);
    formik.setFieldValue(formikName as string, newSelected, true);
  }

  const filteredOptions = useMemo(() => filterOptions(options, search, selectedIds), [search, options, selectedIds]);
  const allOptions = search || !suggestedOptions
    ? filteredOptions
    : suggestedOptions.concat(filteredOptions.filter(o => !suggestedOptions.some(so => so.id === o.id)));

  return (
    <InputWithError<T> formik={formik} formikNames={[formikName]} label={label}>
      <div className={classes.container}>
        <input
          ref={inputRef}
          id={formikName as string}
          name={formikName as string}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            if (singleSelect) formik.setFieldValue(formikName as string, e.target.value, true);
          }}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); highlightDown() }
            if (e.key === "ArrowUp") { e.preventDefault(); highlightUp() }
            if (e.key === "Enter" && highlightedIndex >= 0) { e.preventDefault(); select(allOptions[highlightedIndex].id) }
            if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); setHighlightedIndex(-1) }
          }}
          className={twMerge(classes.select, error && touched && classes.selectError)}
          placeholder="Select or type..."
        />
        {/* Dropdown List */}
        {open && allOptions.length > 0 && (
          <div className={classes.dropdown}>
            {allOptions.flatMap(({ id, object }, i) => (
              <React.Fragment key={i}>
                {/* label for suggested options */}
                {!search && suggestedOptions && suggestedOptions.length > 0 && i === 0 && (
                  <div className={twMerge(classes.option, classes.optionLabel)}>Suggested</div>
                )}
                {/* label for other options */}
                {!search && suggestedOptions && suggestedOptions.length > 0 && i === suggestedOptions.length && (
                  <div className={twMerge(classes.option, classes.optionLabel)}>Other</div>
                )}
                {/* regular options */}
                <div
                  onMouseDown={(e) => { e.preventDefault(); select(id); }}
                  className={twMerge(classes.option, highlightedIndex === i && classes.optionHighlighted)}
                >
                  {object}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        <MdExpandMore
          className={twMerge(classes.icon, open && "rotate-180")}
          size={20}
        />
      </div>
      <div className={classes.selected}>
        {options.filter(o => selectedIds.includes(o.id)).map(({ id, object }) => (
          <div key={id} className={classes.selectedTag}>
            {object}
            <MdClose className="cursor-pointer" size={16} onClick={() => deselect(id)} />
          </div>))}
      </div>
    </InputWithError>
  );
}
