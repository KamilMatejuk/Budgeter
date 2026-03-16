import { getDateString, getTimedeltaString, getTimeString } from "@/const/date";
import { twMerge } from "tailwind-merge";

interface CellDateProps {
  value: Date | string;
  showTime?: boolean;
  showDelta?: boolean;
  wrap?: boolean;
}

export default function CellDate({ value, showTime, showDelta, wrap }: CellDateProps) {
  return (
    <div className={twMerge("flex", wrap ? "flex-col items-center" : "gap-2")}>
      <span>{getDateString(value)}</span>
      {showTime && <span>{getTimeString(value)}</span>}
      {showDelta && <span className="text-subtext">({getTimedeltaString(value)})</span>}
    </div>
  )
}
