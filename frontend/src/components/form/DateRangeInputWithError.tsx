import React from "react";
import { getValue, MultiInputWithErrorProps } from "./InputWithError";
import DateInputWrapperWithError from "./DateInputWrapperWithError";


interface DateRangeInputWithErrorProps<T> extends MultiInputWithErrorProps<T> {
  hidden?: boolean;
}

export default function DateRangeInputWithError<T>({ formik, formikNames, label, hidden }: DateRangeInputWithErrorProps<T>) {
  const startDate = getValue(formik, formikNames[0]);
  const endDate = getValue(formik, formikNames[1]);

  return (
    <DateInputWrapperWithError<T>
      formik={formik}
      formikNames={formikNames}
      label={label}
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={(dates) => {
        const [start, end] = dates as [Date | null, Date | null];
        formik.setFieldValue(formikNames[0] as string, start);
        formik.setFieldValue(formikNames[1] as string, end);
      }}
      dateFormat="dd.MM.yyyy"
      isClearable={!hidden}
      inline={!hidden}
      className="border border-gray-300 px-4 py-2 rounded-md w-full text-center"
    />);
}
