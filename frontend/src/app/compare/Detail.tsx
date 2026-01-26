import Link from "next/link";
import { Range } from "./MonthSelector";
import { getDateString, getISODateString } from "@/const/date";

export interface DetailProps {
  value: number;
  transactions: number;
  range: Range;
  slug: string;
}

export default function Detail({ value, transactions, range, slug }: DetailProps) {
  const dateStart = new Date(range.startYear, range.startMonth - 1, 1);
  const dateEnd = new Date(range.endYear, range.endMonth, 0);
  return (
    <div className="flex flex-col items-center">
      <p>{getDateString(dateStart)} - {getDateString(dateEnd)}</p>
      <p>{value.toFixed(2)} zł</p>
      <Link target="_blank" href={`/search?${slug}&dateStart=${getISODateString(dateStart)}&dateEnd=${getISODateString(dateEnd)}`}>
        {transactions}
      </Link>
    </div>
  );
}
