import React from "react";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { ERROR } from "@/const/message";
import InputWithError, { getError, getTouched, SingleInputWithErrorProps } from "./InputWithError";


export const requiredText = z.string({ required_error: ERROR.requiredError }).min(1, ERROR.requiredError);


export interface TextInputWithErrorProps<T> extends SingleInputWithErrorProps<T>, React.InputHTMLAttributes<HTMLInputElement> { }


export default function TextInputWithError<T>({ formik, formikName, label, ...props }: TextInputWithErrorProps<T>) {
  const error = getError(formik, formikName);
  const touched = getTouched(formik, formikName);

  return (
    <InputWithError<T> formik={formik} formikNames={[formikName]} label={label}>
      <input
        type="text"
        {...formik.getFieldProps(formikName as string)}
        {...props}
        className={twMerge(
          "border border-gray-300 px-4 py-2 rounded-md w-full text-center",
          error && touched && "border-red-200 bg-red-500/10",
          props.className || ""
        )}
      />
    </InputWithError>
  );
}

