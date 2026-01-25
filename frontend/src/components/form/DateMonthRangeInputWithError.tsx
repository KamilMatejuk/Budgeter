import React from "react";
import { MultiInputWithErrorProps } from "./InputWithError";
import DateRangeInputWithError from "./DateRangeInputWithError";
import MonthRangeInputWithError from "./MonthRangeInputWithError";
import { IoCalendarNumberOutline, IoCalendarOutline } from "react-icons/io5";


const classes = {
  container: "grid grid-cols-[1fr_26px] pr-1",
  icon: "self-end mb-2 ml-1 text-subtext hover:text-text cursor-pointer"
}

export default function DateMonthRangeInputWithError<T>({ formik, formikNames, label }: MultiInputWithErrorProps<T>) {
  const [monthDate, setMonthDate] = React.useState<"date" | "month">("date");
  return (
    monthDate === "date"
      ? <div className={classes.container}>
        <DateRangeInputWithError formik={formik} formikNames={formikNames} label={label} hidden />
        <IoCalendarOutline size={26} className={classes.icon} onClick={() => setMonthDate("month")} />
      </div>
      : <div className={classes.container}>
        <MonthRangeInputWithError formik={formik} formikNames={formikNames} label={label} hidden />
        <IoCalendarNumberOutline size={26} className={classes.icon} onClick={() => setMonthDate("date")} />
      </div>
  );
}