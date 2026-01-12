'use client';

import { ChartRange, DEFAULT_CHART_RANGE } from "@/types/enum";
import ChartWithRanges from "./ChartWithRanges";
import { useAccountValueHistory, usePersonalAccounts, useTotalAccountValueHistory } from "@/app/api/query";
import { useState } from "react";
import { getDaysFromValues, getDaysInRange } from "@/const/date";
import { getAccountName } from "../table/cells/AccountNameUtils";
import ChartWithOptions from "./ChartWithOptions";


export default function AccountsHistoryChart() {
  const [range, setRange] = useState<keyof typeof ChartRange>(DEFAULT_CHART_RANGE);
  const [account, setAccount] = useState<string>("");
  const accounts = usePersonalAccounts();
  const data = account
    ? useAccountValueHistory(range, account)
    : useTotalAccountValueHistory(range);
  const days = getDaysInRange(range); // can be empty for full range
  const values = data.length ? data : Array(days.length).fill(0); // default to zeros if no data
  const labels = days.length ? days : getDaysFromValues(values); // fallback for full range

  return (
    <ChartWithOptions
      chart={<ChartWithRanges range={range} setRange={setRange} chart={{ type: 'line', props: { data: values, labels } }} />}
      options={[
        {
          id: "",
          name: "All",
          selected: account === "",
        },
        ...accounts.map((a) => (
          {
            id: a._id,
            name: getAccountName(a),
            selected: account === a._id,
          }
        ))
      ]}
      selectOption={setAccount}
    />
  );
}
