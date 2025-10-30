'use client';

import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import { monthName } from "./page";
import { useRouter, useSearchParams } from "next/dist/client/components/navigation";

interface MonthSelectorProps {
  year: number;
  month: number;
  n?: number; // tries to create n months before and after the given month
}

function generateMonths(year: number, month: number, n: number) {
  const dates: { year: number; month: number }[] = [];
  dates.push({ year, month });
  // months after
  for (let i = 0; i < n; i++) {
    const newDate = new Date(year, month + i);
    if (newDate <= new Date()) {
      dates.push({ year: newDate.getFullYear(), month: newDate.getMonth() + 1 });
    }
  }
  // months before
  const toAdd = 2 * n - dates.length;
  for (let i = 0; i < toAdd; i++) {
    const newDate = new Date(year, month - i - 2);
    dates.unshift({ year: newDate.getFullYear(), month: newDate.getMonth() + 1 });
  }
  return dates;
}

export default function MonthSelector({ year, month, n = 5 }: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onClick(month: number, year: number) {
    const params = new URLSearchParams(searchParams);
    params.set('year', year.toString());
    params.set('month', month.toString());
    router.push(`?${params.toString()}`);
  }

  const months = generateMonths(year, month, n);

  return (
    <div className="flex gap-1 mb-4">
      {months.map(({ year: y, month: m }) => (
        <ButtonWithLoader
          key={`${y}-${m}`}
          text={`${monthName(m)}\n${y}`}
          action={m == month && y == year ? "positive" : "neutral"}
          className="flex-1"
          onClick={async () => onClick(m, y)}
        />
      ))}
    </div>
  );
}
