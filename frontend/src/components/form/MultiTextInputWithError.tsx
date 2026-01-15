import React from "react";
import { twMerge } from "tailwind-merge";
import InputWithError, { getError, getTouched, getValue, SingleInputWithErrorProps } from "./InputWithError";


export default function MultiTextInputWithError<T>({ formik, formikName, label, ...props }: SingleInputWithErrorProps<T>) {
  const values: string[] = getValue(formik, formikName);
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);

  return (
    <>
      {new Array(values.length + 1).fill("").map((_, i) => (
        <InputWithError<T> formik={formik} formikNames={[formikName]} label={i == 0 ? label : ""} key={i}>
          <input
            type="text"
            {...props}
            className={twMerge(
              "border border-gray-300 px-4 py-2 rounded-md w-full text-center",
              error && touched && "border-red-200 bg-red-500/10",
              props.className || ""
            )}
            value={values[i] ?? ""}
            onChange={(e) => {
              const newValues = [...values];
              if (i === values.length) {
                if (e.target.value !== "") newValues.push(e.target.value); // save new value
              } else {
                if (e.target.value === "") newValues.splice(i, 1); // remove empty field
                else newValues[i] = e.target.value; // update existing value
              }
              formik.setFieldValue(formikName as string, newValues);
            }}
            onBlur={() => formik.setFieldTouched(formikName as string, true)}
          />
        </InputWithError>

      ))}

    </>
  );
}
