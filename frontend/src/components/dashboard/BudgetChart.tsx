'use client';

import { DoughnutChart } from "./Chart";

interface BudgetChartProps {
  spent: number;
  budget: number;
}

const colours = {
  good: ["#22C55E", "#BBF7D0"], // green-500, green-200
  warning: ["#EAB308", "#FEF08A"], // yellow-500, yellow-200
  overdrawn: ["#EF4444", "#FECACA"], // red-500, red-200
}

export default function BudgetChart({ spent, budget }: BudgetChartProps) {
  const colour = spent < 0.85 * budget ? colours.good : spent <= budget ? colours.warning : colours.overdrawn;
  return (
    <div className="relative">
      <DoughnutChart
        data={[spent, Math.max(budget - spent, 0)]}
        labels={['used', 'available']}
        colors={colour}
        width="200px"
        height="200px"
        asProgress
      />
      <div
        style={{ color: colour[0] }}
        className="absolute top-2/3 left-1/2 -translate-1/2 flex flex-col items-center"
      >
        <div className="flex justify-center items-center mb-2">
          <p className="text-4xl font-mono font-bold">{(spent / budget * 100).toFixed(0)}</p>
          <p className="text-lg mb-1 ml-0.5">%</p>
        </div>
        <p className="text-sm font-mono">{spent.toFixed(2)}</p>
        <p className="text-[10px] my-[-2px]">of</p>
        <p className="text-sm font-mono">{budget.toFixed(2)}</p>
      </div>
    </div>
  );
}
