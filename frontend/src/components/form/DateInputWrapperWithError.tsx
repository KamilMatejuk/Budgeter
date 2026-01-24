import React from "react";
import DatePicker, { DatePickerProps } from 'react-datepicker';
import InputWithError, { MultiInputWithErrorProps } from "./InputWithError";


import 'react-datepicker/dist/react-datepicker.css';


export default function DateInputWrapperWithError<T>({ formik, formikNames, label, ...props }: MultiInputWithErrorProps<T> & DatePickerProps) {
  return (
    <InputWithError<T> formik={formik} formikNames={formikNames} label={label}>
      <div className="text-center">
        <DatePicker {...props} />
      </div>
      <style>{`
        .react-datepicker { width: 100%; }
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__day-name { width: 3rem; }
        .react-datepicker__week > div { width: 3rem; }
        .react-datepicker__month-container { width: 100%; }
      `}</style>
    </InputWithError>
  );
}
