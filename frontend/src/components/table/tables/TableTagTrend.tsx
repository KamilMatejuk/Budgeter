'use client';

import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellTag } from "../cells/CellTag";
import CellValue from "../cells/CellValue";
import { AggComparisonItemRecursive } from "@/components/dashboard/TagTrend";
import { Currency } from "@/types/enum";
import InfoToast from "@/components/toast/InfoToast";
import { getMonthName } from "@/const/date";
import { TrendLineChart } from "@/components/dashboard/Chart";

interface TableTagTrendProps {
  data: AggComparisonItemRecursive[];
}

const getDates = (n: number) => Array.from({ length: n }, (_, i) => {
  const date = new Date();
  date.setMonth(new Date().getMonth() - n + i + 1);
  return `${getMonthName(date.getMonth() + 1)} ${date.getFullYear()}`
});

export default function TableTagTrend({ data }: TableTagTrendProps) {
  if (data.length === 0) return <InfoToast message="No data found" />;

  const datesRecord = getDates(data[0].values_pln.length);

  const columns: ColumnDef<AggComparisonItemRecursive>[] = [
    {
      ...defineCellTag<AggComparisonItemRecursive>(),
      meta: { border: "right" }
    },
    {
      header: "Value",
      accessorKey: "pln_value",
      cell: ({ table, row }) => (<TrendLineChart
        key={JSON.stringify(table.getState().expanded)}
        data={row.original.values_pln.map((v) => Math.abs(v))}
        colour={row.original.tag.colour}
        labels={datesRecord}
        height="60px"
      />),
    },
    {
      accessorKey: "details",
      header: () => "Details",
      cell: ({ row }) => (
      <div className="grid grid-cols-[auto_1fr] items-center text-sm">
        <div>Median</div>
        <div className="ml-auto w-fit">
          <CellValue value={row.original.value_median_pln} currency={Currency.PLN} />
        </div>
        <div>Average</div>
        <div className="ml-auto w-fit">
          <CellValue value={row.original.value_avg_pln} currency={Currency.PLN} />
        </div>
        <div className="text-subtext">Deviation</div>
        <div className="text-right text-subtext">
          ± {((row.original.value_cv_pln || 0) * 100).toFixed(1)}%
        </div>
      </div>),
    },
  ];
  return <Table<AggComparisonItemRecursive> url="" tag="" data={data} columns={columns} expandChild="children" />;
}
