import React from "react";
import { FormikProps } from "formik";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { ERROR } from "@/const/message";


export const requiredText = z.string({ required_error: ERROR.requiredError }).min(1, ERROR.requiredError);


export interface TextInputWithErrorProps<T>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  formik: FormikProps<T>;
  formikName: keyof T | string;
  label?: string;
}


function getFromFormik<T>(formik: FormikProps<T>, formikObject: keyof FormikProps<T>, formikName: keyof T | string) {
  if ((formikName as string).includes("[")) {
    const segments = (formikName as string).replace(/\[(\d+)\]/g, ".$1").split(".");
    let value = formik[formikObject];
    for (const segment of segments) {
      if (value === undefined) return undefined;
      value = typeof value === "object" ? value[segment] : undefined;
    }
    return value;
  }
  return formik[formikObject][formikName] as string;
}

export function getError<T>(formik: FormikProps<T>, formikName: keyof T | string) {
  return getFromFormik(formik, "errors", formikName);
}

export function getTouched<T>(formik: FormikProps<T>, formikName: keyof T | string) {
  return getFromFormik(formik, "touched", formikName);
}

export function getValue<T>(formik: FormikProps<T>, formikName: keyof T | string) {
  return getFromFormik(formik, "values", formikName);
}

export default function TextInputWithError<T>({ formik, formikName, label, ...props }: TextInputWithErrorProps<T>) {
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);

  return (
    <div>
      {label && <label className="">{label}</label>}
      <input
        type="text"
        {...props}
        className={twMerge(
          "border border-gray-300 px-4 py-2 rounded-md w-full text-center",
          error && touched ? "border-red-200 bg-red-500/10" : "",
          props.className || ""
        )}
        {...formik.getFieldProps(formikName as string)}
      />
      {error && touched && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
