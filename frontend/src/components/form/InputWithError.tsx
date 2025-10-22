import React, { PropsWithChildren } from "react";
import { FormikProps } from "formik";
import { z } from "zod";
import { ERROR } from "@/const/message";


export const requiredText = z.string({ required_error: ERROR.requiredError }).min(1, ERROR.requiredError);


export interface MultiInputWithErrorProps<T> extends PropsWithChildren {
  formik: FormikProps<T>;
  formikNames: (keyof T | string)[];
  label?: string;
}

export interface SingleInputWithErrorProps<T> extends Omit<MultiInputWithErrorProps<T>, "formikNames"> { 
  formikName: keyof T | string;
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

export default function InputWithError<T>({ formik, formikNames, label, children }: MultiInputWithErrorProps<T>) {
  const error = formikNames.map(name => getError(formik, name)).filter(Boolean).join(" & ");
  const touched = formikNames.map(name => getTouched(formik, name)).some(Boolean);

  return (
    <div className="flex flex-col">
      {label && <label className="w-full">{label}</label>}
      {children}
      {error && touched && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
