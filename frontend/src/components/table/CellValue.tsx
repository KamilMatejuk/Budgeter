import { twMerge } from "tailwind-merge";

export interface CellValueProps {
  value?: number;
  as_diff?: boolean;
}

export default function CellValue({ value, as_diff }: CellValueProps) {
  if (value === undefined) return null
  let valueStr = (value || 0).toFixed(2)
  // add plus sign for positive diffs
  if (value > 0 && as_diff) {
    valueStr = "+" + valueStr;
  }
  // add separator
  if (valueStr.length > 7) {
    valueStr = valueStr.slice(0, -6) + " " + valueStr.slice(-6)
  }
  if (valueStr.length > 11) {
    valueStr = valueStr.slice(0, -10) + " " + valueStr.slice(-10)
  }
  const className = twMerge("p-0 text-right font-mono", value > 0 && as_diff ? "text-positive" : value < 0 ? "text-negative" : "");
  return (<p className={className}>{valueStr}</p>);
}
