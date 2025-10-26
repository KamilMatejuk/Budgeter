import { twMerge } from "tailwind-merge";

export interface CellValueProps {
  value?: number;
}

export default function CellValue({ value }: CellValueProps) {
  return (<p className={twMerge("p-0 text-right font-mono", value && value < 0 && "text-negative")}>{(value || 0).toFixed(2)}</p>);
}
