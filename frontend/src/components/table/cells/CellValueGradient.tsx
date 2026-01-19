import { Currency } from "@/types/enum";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "./CellValue";
import { TagRichWithId } from "@/types/backend";
import Link from "next/link";

interface CellValueGradientProps {
  value: number;
  midPoint: number;
  currency?: Currency | keyof typeof Currency;
}

function _gradientColor(t: number, reverse: boolean) {
  t = Math.max(0, Math.min(1, t));
  const intRatio = (k: number) => Math.round(155 + 100 * k);
  const color = (r: number, g: number, b: number) => r < 255 || g < 255 || b < 255
    ? `rgba(${r}, ${g}, ${b}, 1)`
    : "transparent";
  // red → white
  if (
    (t <= 0.5 && !reverse) ||
    (t > 0.5 && reverse)
  ) {
    const k = reverse ? (1 - t) / 0.5 : t / 0.5;
    return color(255, intRatio(k), intRatio(k));
  }
  // white → green
  const k = reverse ? (0.5 - t) / 0.5 : (t - 0.5) / 0.5;
  return color(intRatio(1 - k), 255, intRatio(1 - k));
}

export default function CellValueGradient({ value, midPoint, currency }: CellValueGradientProps) {
  const max = midPoint * 2;
  const ratio = max ? value / max : 0.5;
  const color = _gradientColor(ratio, max < 0);
  return (
    <div className="m-auto px-3 py-1 w-fit rounded text-sm" style={{ backgroundColor: color }}>
      <CellValue value={value} currency={currency} />
    </div>
  );
}

export function defineCellValueGradient<T extends { currency?: Currency | keyof typeof Currency }>(midPointKey: keyof T, value: keyof T, index: number) {
  return {
    accessorKey: "value",
    header: "Value Change",
    meta: { align: "center" },
    cell: ({ row }) =>
      <CellValueGradient
        value={(row.original[value] as number[])[index] || 0}
        midPoint={row.original[midPointKey] as number}
        currency={row.original.currency}
      />
  } as ColumnDef<T>;
}

export function defineCellValueGradientWithLink<T extends { currency?: Currency | keyof typeof Currency, tag: TagRichWithId }>(
  midPointKey: keyof T, value: keyof T, index: number, filters: string) {
  return {
    ...defineCellValueGradient<T>(midPointKey, value, index),
    cell: ({ row }) =>
      <Link target="_blank" href={`/search?tagsIn=${row.original.tag._id}&${filters}`}>
        <CellValueGradient
          value={(row.original[value] as number[])[index] || 0}
          midPoint={row.original[midPointKey] as number}
          currency={row.original.currency}
        />
      </Link>
  } as ColumnDef<T>;
}
