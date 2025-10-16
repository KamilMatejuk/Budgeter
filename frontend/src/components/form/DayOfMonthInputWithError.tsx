import React from "react";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { getValue, SingleInputWithErrorProps } from "./InputWithError";
import DateInputWrapperWithError from "./DateInputWrapperWithError";


export const requiredDate = z.date({ required_error: ERROR.requiredError })


export default function DayOfMonthInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  // February 2026 has exactly 28 days in 4 weeks starting on Sunday
  const value = new Date(2026, 1, getValue(formik, formikName));

  return (
    <>
      <DateInputWrapperWithError<T>
        formik={formik}
        formikNames={[formikName]}
        label={label}
        selected={value as Date}
        onChange={(val) => formik.setFieldValue(formikName as string, val?.getDate())}
        dateFormat="dd.mm.yyyy"
        inline
      />
      <style>{`
        .react-datepicker__header { display: none; }
        .react-datepicker__day-names { display: none; }
        .react-datepicker__navigation { display: none; }
      `}</style>
    </>
  );
}
