import { twMerge } from "tailwind-merge";

export interface CellValueProps {
  value?: number;
  as_diff?: boolean;
}

export default function CellValue({ value, as_diff }: CellValueProps) {
  if (value === undefined) return null
  const valueStr = (value > 0 && as_diff ? "+" : "") + (value || 0).toFixed(2);
  const className = twMerge("p-0 text-right font-mono", value > 0 && as_diff ? "text-positive" : value < 0 ? "text-negative" : "");
  return (<p className={className}>{valueStr}</p>);
}
