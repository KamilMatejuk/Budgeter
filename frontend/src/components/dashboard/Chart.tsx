'use client';

import { BarElement, CategoryScale, Chart, ChartOptions, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { Bar, Line } from "react-chartjs-2";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      grid: {
        display: true,
        color: (ctx: any) => ctx.tick.value === 0 ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)", // black line on y=0
      },
    },
  },
}

export interface LineChartProps {
  data: number[];
  labels: string[];
}

const LineChartOptions = { ...Options }
// @ts-expect-error: Property 'stacked' does not exist on type.ts(2339)
LineChartOptions.elements = {
  point: {
    radius: 0,
    hoverRadius: 6,
    hitRadius: 10,
    backgroundColor: "rgba(0,0,0,0)",
    borderColor: "rgba(0,0,0,0)",
  },
};

export function LineChart({ data, labels }: LineChartProps) {
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Line options={LineChartOptions} data={{
        labels,
        datasets: [{
          data,
          borderColor: "#22C55E", // green-500
          tension: 0.3,
        }],
      }} />
    </div>
  );
}

export interface DoubleBarChartProps {
  dataPositive: number[];
  dataNegative: number[];
  labels: string[];
}

const DoubleBarChartOptions = { ...Options }
// @ts-expect-error: Property 'stacked' does not exist on type.ts(2339)
DoubleBarChartOptions.scales.x.stacked = true;
// @ts-expect-error: Property 'stacked' does not exist on type.ts(2339)
DoubleBarChartOptions.scales.y.stacked = true;


export function DoubleBarChart({ dataPositive, dataNegative, labels }: DoubleBarChartProps) {
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Bar
        options={DoubleBarChartOptions}
        data={{
          labels,
          datasets: [
            {
              data: dataPositive,
              backgroundColor: "#22C55E", // green-500
              stack: "stack",
            },
            {
              data: dataNegative,
              backgroundColor: "#EF4444", // red-500
              stack: "stack",
            },
          ],
        }}
      />
    </div>
  );
}