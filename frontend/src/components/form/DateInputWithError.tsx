import React from "react";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { getValue, SingleInputWithErrorProps } from "./InputWithError";
import DateInputWrapperWithError from "./DateInputWrapperWithError";


export const requiredDate = z.date({ required_error: ERROR.requiredError });
export const requiredDateInPast = requiredDate.refine((date) => new Date(date) <= new Date(), { message: ERROR.dateInPastError });


export default function DateInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const value = getValue(formik, formikName);
  return (
    <DateInputWrapperWithError<T>
      formik={formik}
      formikNames={[formikName]}
      label={label}
      selected={value as Date}
      onChange={(val) => formik.setFieldValue(formikName as string, val)}
      dateFormat="dd.mm.yyyy"
      inline
    />
  );
}
