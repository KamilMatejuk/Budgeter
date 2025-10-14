import React from "react";
import { twMerge } from "tailwind-merge";
import { getError, getTouched, getValue, TextInputWithErrorProps } from "./TextInputWithError";


const classes = {
  container: "flex flex-row gap-2",
  option: "flex-1 flex justify-center items-center px-4 py-2 rounded-xl cursor-pointer select-none hover:bg-gray-100",
  optionChecked: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300",
  optionLabel: "text-sm",
  radio: "form-radio hidden",
}

export interface ChoiceInputWithErrorProps<T> extends TextInputWithErrorProps<T> {
  optionsEnum: Record<string, string>;
}


export default function ChoiceInputWithError<T>({ formik, formikName, ...props }: ChoiceInputWithErrorProps<T>) {
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);
  const value = getValue(formik, formikName);

  return (
    <fieldset>
      <div className={classes.container}>
        {Object.entries(props.optionsEnum).map(([key, optValue]) => {
          const id = `${formikName as string}-${key}`;
          const checked = String(value ?? "") === String(optValue);
          return (
            <label key={key} htmlFor={id} className={twMerge(classes.option, checked && classes.optionChecked)}>
              <input
                id={id}
                name={name ?? formikName as string}
                type="radio"
                value={optValue}
                checked={checked}
                onChange={() => formik.setFieldValue(formikName as string, optValue, true)}
                onBlur={() => formik.setFieldTouched(formikName as string, true, true)}
                className={classes.radio}
              />
              <span className={classes.optionLabel}>{optValue}</span>
            </label>
          );
        })}
      </div>
      {error && touched && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </fieldset>
  );
}
