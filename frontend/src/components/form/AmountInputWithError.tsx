import React from "react";
import { FormikProps } from "formik";
import { twMerge } from "tailwind-merge";

export interface AmountInputWithErrProps<T> {
  formik: FormikProps<T>;
  formikName: keyof T;
}

export default function AmountInputWithError<T>({
  formik,
  formikName,
}: AmountInputWithErrProps<T>) {
  const error = formik.errors[formikName] as string;
  const touched = formik.touched[formikName];
  const value = formik.values[formikName] as string;
  const set = (v: string) => formik.setFieldValue(formikName as string, v);

  return (
    <div>
      <input
        type="text"
        inputMode="decimal"
        className={twMerge(
          "border border-gray-300 px-4 py-2 rounded-md w-full text-center",
          error && touched ? "border-red-200 bg-red-500/10" : ""
        )}
        {...formik.getFieldProps(formikName as string)}
        value={value}
        onChange={(e) => set(e.target.value)}
        onFocus={() => set("")}
        onBlur={() => {
          const formatted = value.replace(",", "."); // comma to dot
          const number = parseFloat(formatted);
          if (!isNaN(number)) {
            const fixed = number.toFixed(2);
            set(fixed); // show with 2 decimals
          } else {
            set(""); // invalid input becomes empty
          }
        }}
      />
      {error && touched && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
