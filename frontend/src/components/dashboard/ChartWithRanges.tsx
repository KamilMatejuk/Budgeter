'use client';

import { SetStateAction } from "react";
import LineChart, { LineChartProps } from "./LineChart";
import ButtonWithLoader from "../button/ButtonWithLoader";
import { ChartRange as ChartRangeEnum } from "@/types/enum";
import { ChartRange } from "@/types/backend";

interface ChartWithRangesProps {
  data: number[];
  labels: string[];
  range: ChartRange;
  setRange: React.Dispatch<SetStateAction<ChartRange>>;
  chart: {
    type: 'line';
    props: Omit<LineChartProps, "data" | "labels">
  }
}

export default function ChartWithRanges({ data, labels, chart, range, setRange }: ChartWithRangesProps) {
  return (
    <div className="w-full gap-4">
      {/* options */}
      <div className="flex gap-1">
        {Object.values(ChartRangeEnum).map((r) => (
          <ButtonWithLoader
            key={r}
            text={r}
            action={r === range ? "positive" : "neutral"}
            className="px-2 py-0.5 rounded-md text-xs"
            onClick={async () => setRange(r)}
          />
        ))}
      </div>
      {/* chart */}
      {chart.type === 'line' && <LineChart data={data} labels={labels} {...chart.props} />}
    </div>
  );
}
