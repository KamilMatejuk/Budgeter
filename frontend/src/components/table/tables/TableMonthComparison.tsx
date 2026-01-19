'use client';

import { MonthComparisonRow } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellTag } from "../cells/CellTag";
import { defineCellValueGradientWithLink } from "../cells/CellValueGradient";
import { getMonthName } from "@/const/date";
import { z } from "zod";
import { requiredText } from "@/components/form/TextInputWithError";
import { useFormik } from "formik";
import DropDownInputWithError from "@/components/form/DropDownInputWithError";
import { useEffect, useState } from "react";
import CellValue from "../cells/CellValue";
import { getDateSearchSlug } from "@/app/search/utils";
import { flatten } from "@/components/dashboard/TagComparisonChart";

interface TableMonthComparisonProps {
  data: MonthComparisonRow[];
}

const customHeader = (label1: string, label2: string) => (
  <div className="text-center normal-case">
    <span className="text-sm">{label1}</span><br />
    <span className="text-xs text-subtext">{label2}</span>
  </div>
);


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
  const len = data[0].values.length;
  const datesRecord = getDatesRecord(len);
  const allTags = flatten(data).map(d => d.tag);

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

  const thisCol = len - monthYearId - 1;
  const columns: ColumnDef<MonthComparisonRow>[] = [
    {
      ...defineCellTag<MonthComparisonRow>(),
      meta: { border: "right" }
    },
    {
      ...defineCellValueGradientWithLink<MonthComparisonRow>(
        "value_avg", "values", thisCol - 12, getDateSearchSlug(month, year - 1), allTags),
      header: () => customHeader("This Month Last Year", `${getMonthName(month)} ${year - 1}`),
      accessorKey: "value",
    },
    {
      ...defineCellValueGradientWithLink<MonthComparisonRow>(
        "value_avg", "values", thisCol - 2, getDateSearchSlug(month - 2, year), allTags),
      header: () => customHeader("Two Months Ago", `${getMonthName(month - 2)} ${month <= 2 ? year - 1 : year}`),
      accessorKey: "value",
    },
    {
      ...defineCellValueGradientWithLink<MonthComparisonRow>(
        "value_avg", "values", thisCol - 1, getDateSearchSlug(month - 1, year), allTags),
      header: () => customHeader("Previous Month", `${getMonthName(month - 1)} ${month == 1 ? year - 1 : year}`),
      accessorKey: "value",
    },
    {
      ...defineCellValueGradientWithLink<MonthComparisonRow>(
        "value_avg", "values", thisCol, getDateSearchSlug(month, year), allTags),
      header: () => <DropDownInputWithError formik={formik} formikName="date" optionsEnum={datesRecord} hideEmpty />,
      meta: { align: "center", border: "both" },
      accessorKey: "value",
    },
    {
      header: () => customHeader("Average Month", `from last ${Object.keys(datesRecord).length} months`),
      cell: ({ row }) => (<CellValue value={row.original.value_avg} currency={row.original.currency} />),
      accessorKey: "value",
    },
  ];
  return <Table<MonthComparisonRow> url="" tag="" data={data} columns={columns} expandChild="subitems" />;
}
