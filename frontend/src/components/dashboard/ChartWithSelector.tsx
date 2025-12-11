'use client';

import { useState } from "react";
import LineChart, { LineChartProps } from "./LineChart";
import ButtonWithLoader from "../button/ButtonWithLoader";

interface ChartWithSelectorProps {
  data: Record<string, number[]>;
  chartType: 'line';
  chartProps: Omit<LineChartProps, "data">
}

export default function ChartWithSelector({ data, chartType, chartProps }: ChartWithSelectorProps) {
  const [option, setOption] = useState<string>(Object.keys(data)[0]);
  return (
    <div className="w-full grid grid-cols-[1fr_200px] gap-4">
      {/* chart */}
      {chartType === 'line' && <LineChart data={data[option]} {...chartProps} />}
      {/* options */}
      <div className="flex flex-col gap-1">
        {Object.keys(data).map((k) => (
          <ButtonWithLoader key={k} text={k} action={k === option ? "positive" : "neutral"} className="flex-1" onClick={async () => setOption(k)} />
        ))}
      </div>
    </div>
  );
}
