import { Currency, CURRENCY_SYMBOLS } from "@/types/enum";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";

interface CellValueProps {
  value?: number;
  colour?: boolean;
  currency?: Currency | keyof typeof Currency;
}

export function formatValue(value: number, currency?: Currency | keyof typeof Currency): string {
  let valueStr = value.toFixed(2);
  // add plus sign for positive diffs
  if (value > 0) valueStr = "+" + valueStr;
  // add separator
  if (valueStr.length > 7) {
    valueStr = valueStr.slice(0, -6) + " " + valueStr.slice(-6);
  }
  if (valueStr.length > 11) {
    valueStr = valueStr.slice(0, -10) + " " + valueStr.slice(-10);
  }
  // add currency symbol
  valueStr += currency ? ` ${CURRENCY_SYMBOLS[currency]}` : "";
  return valueStr;
}

export function defineCellValue<T extends { value: number; currency?: Currency | keyof typeof Currency }>(colour: boolean = false) {
  return {
    accessorKey: "value",
    header: "Value",
    meta: { alignedRight: true },
    cell: ({ row }) => (<CellValue value={row.original.value} currency={row.original.currency} colour={colour} />),
  } as ColumnDef<T>;
}

export default function CellValue({ value, colour, currency }: CellValueProps) {
  if (value === undefined) return null
  let valueStr = formatValue(value || 0, currency);
  const className = twMerge("p-0 text-right font-mono", colour ? (value > 0 ? "text-positive" : value < 0 ? "text-negative" : "") : "");
  return (<p className={className}>{valueStr}</p>);
}
