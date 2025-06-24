import React from "react";
import { FormikProps } from "formik";
import { twMerge } from "tailwind-merge";

export interface TextInputWithErrProps<T> {
  formik: FormikProps<T>;
  formikName: keyof T;
}

export default function TextInputWithError<T>({
  formik,
  formikName,
}: TextInputWithErrProps<T>) {
  const error = formik.errors[formikName] as string;
  const touched = formik.touched[formikName];

  return (
    <div>
      <input
        type="text"
        className={twMerge(
          "border border-gray-300 px-4 py-2 rounded-md w-full text-center",
          error && touched ? "border-red-200 bg-red-500/10" : ""
        )}
        {...formik.getFieldProps(formikName as string)}
      />
      {error && touched && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
