'use client';

import { ChartRange, DEFAULT_CHART_RANGE } from "@/types/enum";
import ChartWithRanges from "./ChartWithRanges";
import { useAccountValueHistory, usePersonalAccounts, useTotalAccountValueHistory } from "@/app/api/query";
import { useState } from "react";
import { getDaysFromValues, getDaysInRange } from "@/const/date";
import ButtonWithLoader from "../button/ButtonWithLoader";
import { getAccountName } from "../table/cells/AccountNameUtils";


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
    <div className="w-full grid grid-cols-[1fr_200px] gap-4">
      {/* chart */}
      <ChartWithRanges range={range} setRange={setRange} chart={{ type: 'line', props: { data: values, labels } }} />
      {/* options */}
      <div className="flex flex-col gap-1">
        <ButtonWithLoader text="All" action={account === "" ? "positive" : "neutral"} className="flex-1" onClick={async () => setAccount("")} />
        {accounts.map((a) => (
          <ButtonWithLoader key={a._id} text={getAccountName(a)} action={a._id === account ? "positive" : "neutral"} className="flex-1" onClick={async () => setAccount(a._id)} />
        ))}
      </div>
    </div>
  );
}
