import { Currency } from "@/types/enum";
import { ColumnDef } from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";
import { formatValue } from "./CellValue";

interface CellValueChangeProps {
  value: number;
  original: number;
  currency?: Currency | keyof typeof Currency;
}


export default function CellValueChange({ value, original, currency }: CellValueChangeProps) {
  if (value === undefined) return null
  const change = original === 0 ? (value > 0 ? 1 : value < 0 ? -1 : 0) : (value / original) - 1;
  let valueStr = formatValue(value, currency);
  let changeStr = formatValue(change * 100) + "%";
  return (<div className="flex flex-col items-center">
    <p className="p-0 font-mono">{valueStr}</p>
    <p className={twMerge("p-0 text-xs font-mono", change < 0 && "text-positive", change > 0 && "text-negative")}>({changeStr})</p>
  </div>)
}

export function defineCellValueChange<T extends { currency?: Currency | keyof typeof Currency }>(value: keyof T, original: keyof T) {
  return {
    accessorKey: "value_change",
    header: "Value Change",
    meta: { align: "center" },
    cell: ({ row }) =>
      <CellValueChange
        value={row.original[value] as number}
        original={row.original[original] as number}
        currency={row.original.currency}
      />
  } as ColumnDef<T>;
}
