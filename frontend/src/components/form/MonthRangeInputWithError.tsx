import React from "react";
import { getValue, MultiInputWithErrorProps } from "./InputWithError";
import DateInputWrapperWithError from "./DateInputWrapperWithError";


interface MonthRangeInputWithError<T> extends MultiInputWithErrorProps<T> {
  hidden?: boolean;
}

export default function MonthRangeInputWithError<T>({ formik, formikNames, label, hidden }: MonthRangeInputWithError<T>) {
  const startDate = getValue(formik, formikNames[0]);
  const endDate = getValue(formik, formikNames[1]);

  return (
    <>
      <DateInputWrapperWithError<T>
        formik={formik}
        formikNames={formikNames}
        label={label}
        selectsRange
        showMonthYearPicker
        startDate={startDate}
        endDate={endDate}
        onChange={(dates) => {
          const [start, end] = dates as [Date | null, Date | null];
          const monthStart = start ? new Date(start.getFullYear(), start.getMonth(), 1) : undefined;
          const monthEnd = end ? new Date(end.getFullYear(), end.getMonth() + 1, 0) : undefined;
          formik.setFieldValue(formikNames[0] as string, monthStart);
          formik.setFieldValue(formikNames[1] as string, monthEnd);
        }}
        dateFormat="MMM yyyy"
        isClearable
        inline={!hidden}
        className="border border-gray-300 px-4 py-2 rounded-md w-full text-center"
      />
      <style>{`
      .react-datepicker__month-text { padding: 0.5rem; }
      `}</style>
    </>
  );
}
