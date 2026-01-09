'use client';

import { MonthComparisonRow } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellTag } from "../cells/CellTag";
import CellValueChange from "../cells/CellValueChange";
import { getMonthName } from "@/const/date";
import { z } from "zod";
import { requiredText } from "@/components/form/TextInputWithError";
import { useFormik } from "formik";
import DropDownInputWithError from "@/components/form/DropDownInputWithError";
import { useEffect, useState } from "react";
import CellValue from "../cells/CellValue";

interface TableMonthComparisonProps {
  data: MonthComparisonRow[];
}


const defineCellValueChange = (selected: number, label1: string, label2: string, i?: number, key?: keyof MonthComparisonRow) => ({
  accessorKey: "value_change",
  header: (() =>
    <div className="text-center normal-case">
      <span className="text-sm">{label1}</span><br />
      <span className="text-xs text-subtext">{label2}</span>
    </div>
  ),
  meta: { align: "center" },
  cell: ({ row }) =>
    <CellValueChange
      value={(i ? row.original.values[i] : row.original[key!] as number) ?? 0}
      original={row.original.values[selected]}
      currency={row.original.currency}
    />
} as ColumnDef<MonthComparisonRow>);


const getDatesRecord = (n: number) => Array.from({ length: n }, (_, i) => {
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


export default function TableMonthComparison({ data }: TableMonthComparisonProps) {
  const datesRecord = getDatesRecord(data[0].values.length);
  const [monthYear, setMonthYear] = useState<{ month: number; year: number }>({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const { month, year } = monthYear;
  const monthYearId = Object.keys(datesRecord).indexOf(`${month} ${year}`);

  const FormSchema = z.object({ date: requiredText });
  const formik = useFormik<z.infer<typeof FormSchema>>({
    initialValues: { date: `${month} ${year}` },
    onSubmit: async () => { },
  });

  useEffect(() => {
    const [selectedMonth, selectedYear] = formik.values.date.split(" ");
    setMonthYear({ month: parseInt(selectedMonth), year: parseInt(selectedYear) });
  }, [formik.values.date]);

  const columns: ColumnDef<MonthComparisonRow>[] = [
    defineCellTag<MonthComparisonRow>(true),
    defineCellValueChange(monthYearId, "This Month Last Year", `${getMonthName(month)} ${year - 1}`, monthYearId + 11),
    defineCellValueChange(monthYearId, "Two Months Ago", `${getMonthName(month - 2)} ${month <= 2 ? year - 1 : year}`, monthYearId + 2),
    defineCellValueChange(monthYearId, "Previous Month", `${getMonthName(month - 1)} ${month == 1 ? year - 1 : year}`, monthYearId + 1),
    {
      accessorKey: "value",
      meta: { align: "center" },
      header: () => <DropDownInputWithError formik={formik} formikName="date" optionsEnum={datesRecord} hideEmpty />,
      cell: ({ row }) => (<CellValue value={row.original.values[monthYearId]} currency={row.original.currency} />),
    },
    defineCellValueChange(monthYearId, "Average Month", `from last ${Object.keys(datesRecord).length} months`, undefined, "value_avg"),
  ];
  return <Table<MonthComparisonRow> url="" tag="" data={data} columns={columns} expandChild="subitems" />;
}
