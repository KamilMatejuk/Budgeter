import Link from "next/link";
import { Range } from "./MonthSelector";
import { getDateString, getISODateString } from "@/const/date";
import Summary from "@/components/page_layout/Summary";
import { Comparison, ComparisonItemRecursive } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellTag } from "@/components/table/cells/CellTag";
import { defineCellValue } from "@/components/table/cells/CellValue";

export interface DetailProps extends Omit<Comparison, "month" | "year"> {
  range: Range;
  slug: string;
}

const columns: ColumnDef<ComparisonItemRecursive>[] = [
  defineCellTag<ComparisonItemRecursive>(),
  defineCellValue<ComparisonItemRecursive>(),
];


export default function Detail({ value_pln, transactions, range, slug, children }: DetailProps) {
  const dateStart = new Date(range.startYear, range.startMonth - 1, 1);
  const dateEnd = new Date(range.endYear, range.endMonth, 0);
  return (
    <div className="flex flex-col items-center">
      <p>{getDateString(dateStart)} - {getDateString(dateEnd)}</p>
      <Summary data={[{ value: value_pln.toFixed(2) + ' zł', label: 'Total value' }]} />
      <Link target="_blank" href={`/search?${slug}&dateStart=${getISODateString(dateStart)}&dateEnd=${getISODateString(dateEnd)}`}>
        <Summary data={[{ value: transactions, label: 'Number of transactions' }]} />
      </Link>
      <Table<ComparisonItemRecursive> url="" tag="" data={children} columns={columns} expandChild="children" />
    </div>
  );
}
