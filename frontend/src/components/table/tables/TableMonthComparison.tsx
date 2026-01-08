'use client';

import { MonthComparisonRow } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellValue } from "../cells/CellValue";
import { useMonthComparison } from "@/app/api/query";
import { defineCellTag } from "../cells/CellTag";
import { defineCellValueChange } from "../cells/CellValueChange";
import MultilineText from "@/components/MultilineText";
import { getMonthName } from "@/const/date";
import { z } from "zod";
import { requiredText } from "@/components/form/TextInputWithError";
import { useFormik } from "formik";
import DropDownInputWithError from "@/components/form/DropDownInputWithError";
import { useEffect, useState } from "react";

const customHeader = (title: string) => (() =>
  <div className="text-center">
    <span><MultilineText text={title} /></span>
  </div>
);




const datesRecord = Array.from({ length: 120 }, (_, i) => {
  const date = new Date();
  date.setMonth(new Date().getMonth() - i);
  return {
    key: `${date.getMonth() + 1} ${date.getFullYear()}`,
    label: `${getMonthName(date.getMonth() + 1)} ${date.getFullYear()}`
  }
}).reduce(
  (acc, curr) => ({ ...acc, [curr.key]: curr.label }),
  {} as Record<string, string>
);

export default function TableMonthComparison() {
  const [monthYear, setMonthYear] = useState<{ month: number; year: number }>({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const { month, year } = monthYear;

  const columns: ColumnDef<MonthComparisonRow>[] = [
    defineCellTag<MonthComparisonRow>(true),
    defineCellValueChange<MonthComparisonRow>("value_last_year", "value"),
    defineCellValueChange<MonthComparisonRow>("value_2nd_month", "value"),
    defineCellValueChange<MonthComparisonRow>("value_prev_month", "value"),
    defineCellValue<MonthComparisonRow>(),
    defineCellValueChange<MonthComparisonRow>("value_avg", "value"),
  ];
  // update headers with dynamic month names
  columns[1].header = customHeader(`This Month Last Year\n(${getMonthName(month)} ${year - 1})`);
  columns[2].header = customHeader(`Two Months Ago\n(${getMonthName(month - 2)} ${month <= 2 ? year - 1 : year})`);
  columns[3].header = customHeader(`Previous Month\n(${getMonthName(month - 1)} ${month === 1 ? year - 1 : year})`);
  columns[5].header = customHeader("Average Month\n(from all history)");

  // create header for input
  const FormSchema = z.object({ date: requiredText });
  const formik = useFormik<z.infer<typeof FormSchema>>({
    initialValues: { date: `${getMonthName(month)} ${year}` },
    onSubmit: async () => { },
  });

  columns[4].header = () => (
    <DropDownInputWithError
      formik={formik}
      formikName="date"
      optionsEnum={datesRecord}
      hideEmpty
    />
  );
  useEffect(() => {
    console.log("formik.values.date", formik.values.date);
    const [selectedMonth, selectedYear] = formik.values.date.split(" ");
    setMonthYear({ month: parseInt(selectedMonth), year: parseInt(selectedYear) });
  }, [formik.values.date]);

  // download data
  const data = useMonthComparison(year, month);
  return <Table<MonthComparisonRow> url="" tag="" data={data} columns={columns} expandChild="subitems" />;
}
