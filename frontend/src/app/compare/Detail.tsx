import Link from "next/link";
import { Range } from "./MonthSelector";
import { getDateString, getISODateString } from "@/const/date";
import { Comparison, ComparisonItemRecursive } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellTag } from "@/components/table/cells/CellTag";
import { defineCellValue } from "@/components/table/cells/CellValue";
import SectionHeader from "@/components/page_layout/SectionHeader";
import React from "react";

export interface DetailProps extends Omit<Comparison, "month" | "year"> {
  range: Range;
  slug: string;
}

const columns: ColumnDef<ComparisonItemRecursive>[] = [
  defineCellTag<ComparisonItemRecursive>(),
  defineCellValue<ComparisonItemRecursive>(),
];

const classes = {
  label: "text-sm text-subtext mt-2",
  value: "text-2xl font-semibold",
}

const Detail = React.memo(function Detail({ value_pln, transactions, range, slug, children }: DetailProps) {
  const dateStart = new Date(range.startYear, range.startMonth - 1, 1);
  const dateEnd = new Date(range.endYear, range.endMonth, 0);
  return (
    <div className="flex flex-col items-center">
      <SectionHeader text={`${getDateString(dateStart)} - ${getDateString(dateEnd)}`} className="border-b border-line" />

      <p className={classes.label}>Total value</p>
      <p className={classes.value}>{value_pln.toFixed(2)} zł</p>

      <p className={classes.label}>Number of transactions</p>
      <Link target="_blank" href={`/search?${slug}&dateStart=${getISODateString(dateStart)}&dateEnd=${getISODateString(dateEnd)}`}>
        <p className={classes.value}>{transactions}</p>
      </Link>
      
      <p className={classes.label}>Children composition table</p>
      <Table<ComparisonItemRecursive> url="" tag="" data={children} columns={columns} expandChild="children" expandAll />
    </div>
  );
});
export default Detail;
