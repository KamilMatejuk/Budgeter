import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import InputWithError, { getError, getTouched, getValue } from "./InputWithError";
import { MdExpandMore } from "react-icons/md";
import { ChoiceInputWithErrorProps } from "./ChoiceInputWithError";


const classes = {
  container: "relative",
  select: "border border-gray-300 px-4 py-2 rounded-md w-full text-center appearance-none",
  selectError: "border-red-200 bg-red-500/10",
  icon: "absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none",
  option: "",
};

interface DropDownInputWithErrorProps<T> extends ChoiceInputWithErrorProps<T> {
  hideEmpty?: boolean;
}


export default function DropDownInputWithError<T>({ formik, formikName, label, optionsEnum, hideEmpty }: DropDownInputWithErrorProps<T>) {
  const [open, setOpen] = useState(false);
  const value = getValue(formik, formikName);
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);
  const options = hideEmpty ? optionsEnum : { "": "", ...optionsEnum };

  return (
    <InputWithError<T> formik={formik} formikNames={[formikName]} label={label}>
      <div className={classes.container}>
        <select
          id={formikName as string}
          name={formikName as string}
          value={value}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(!open)}
          onChange={(e) => formik.setFieldValue(formikName as string, e.target.value, true)}
          onBlur={() => formik.setFieldTouched(formikName as string, true, true)}
          className={twMerge(classes.select, error && touched && classes.selectError)}
        >
          {Object.entries(options).map(([id, optValue]) => (
            <option key={id} value={id} className={classes.option}>
              {optValue}
            </option>
          ))}
        </select>
        <MdExpandMore
          className={twMerge(classes.icon, open && "rotate-180")}
          size={20}
        />
      </div>
    </InputWithError>
  );
}
