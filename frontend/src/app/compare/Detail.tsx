import Link from "next/link";
import { Range } from "./MonthSelector";
import { getDateString, getISODateString } from "@/const/date";
import Summary from "@/components/page_layout/Summary";

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
      <Summary data={[{ value: value.toFixed(2) + ' zł', label: 'Total value' }]} />
      <Link target="_blank" href={`/search?${slug}&dateStart=${getISODateString(dateStart)}&dateEnd=${getISODateString(dateEnd)}`}>
        <Summary data={[{ value: transactions, label: 'Number of transactions' }]} />
      </Link>
    </div>
  );
}
