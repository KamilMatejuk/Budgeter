'use client';

import ChartWithRanges from "./ChartWithRanges";
import { useIncomeExpenseHistory } from "@/app/api/query";
import { useState } from "react";
import { getMonthsFromValues, getMonthsInRange } from "@/const/date";
import { ChartRange } from "@/types/enum";


export default function IncomeExpenseHistoryChart() {
  const [range, setRange] = useState<keyof typeof ChartRange>(ChartRange["1Y"]);
  const [income, expense] = useIncomeExpenseHistory(range);
  const months = getMonthsInRange(range); // can be empty for full range
  const labels = months.length ? months : getMonthsFromValues(income); // fallback for full range
  const valuesI = income.length ? income : Array(months.length).fill(0); // default to zeros if no data
  const valuesE = expense.length ? expense : Array(months.length).fill(0); // default to zeros if no data

  return (
    <ChartWithRanges
      range={range}
      setRange={setRange}
      chart={{ type: 'doublebar', props: { dataPositive: valuesI, dataNegative: valuesE, labels } }} />
  );
}
