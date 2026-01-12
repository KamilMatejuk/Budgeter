'use client';

import InfoToast from "../toast/InfoToast";
import { PieChart, PieChartProps } from "./Chart";


interface TagCompositionChartProps extends PieChartProps {
  title: string;
  subtitle: string;
}

export default function TagCompositionChart({ title, subtitle, data, labels, colors }: TagCompositionChartProps) {
  const chartHeight = "248px"; // 300px minus space for titles (sm 20px, xs 16px, gaps 2*8px)
  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <h3 className="text-sm tracking-wider font-bold">{title}</h3>
      <h3 className="text-xs tracking-wider font-bold text-subtext">{subtitle}</h3>
      <div className={`flex justify-center items-center`} style={{ height: chartHeight }}>
        {data.length === 0
          ? <InfoToast message="No subtags found\nin composition." />
          : <PieChart data={data} labels={labels} colors={colors} height={chartHeight} />}
      </div>
    </div>
  );
}
