'use client';

import { ArcElement, BarElement, CategoryScale, Chart, ChartOptions, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { PropsWithChildren } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
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


interface ChartContainerProps extends PropsWithChildren {
  width?: string;
  height?: string;
}

function ChartContainer({ width = "100%", height = "300px", children }: ChartContainerProps) {
  return (<div style={{ width, height }}>{children}</div>);
}


// ******************************** LINE CHART ********************************

export interface LineChartProps extends ChartContainerProps {
  data: number[];
  labels: string[];
}

const LineChartOptions = {
  ...Options,
  elements: {
    point: {
      radius: 0,
      hoverRadius: 6,
      hitRadius: 10,
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "rgba(0,0,0,0)",
    },
  }
};

export function LineChart({ data, labels, ...props }: LineChartProps) {
  return (
    <ChartContainer {...props}>
      <Line options={LineChartOptions} data={{
        labels,
        datasets: [{
          data,
          borderColor: "#22C55E", // green-500
          tension: 0.3,
        }],
      }} />
    </ChartContainer>
  );
}


// ***************************** DOUBLE BAR CHART ****************************

export interface DoubleBarChartProps extends ChartContainerProps {
  dataPositive: number[];
  dataNegative: number[];
  labels: string[];
}

const DoubleBarChartOptions = {
  ...Options,
  scales: {
    x: { ...Options.scales.x, stacked: true },
    y: { ...Options.scales.y, stacked: true },
  },
};

export function DoubleBarChart({ dataPositive, dataNegative, labels, ...props }: DoubleBarChartProps) {
  return (
    <ChartContainer {...props}>
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
    </ChartContainer>
  );
}


// ******************************** PIE CHART ********************************

export interface PieChartProps extends ChartContainerProps {
  data: number[];
  labels: string[];
  colors: string[];
}

const PieChartOptions = {
  ...Options,
  scales: {
    y: { display: false },
    x: { display: false },
  },
};

export function PieChart({ data, labels, colors, ...props }: PieChartProps) {
  return (
    <ChartContainer {...props}>
      <Pie
        options={PieChartOptions}
        data={{
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors.map((c) => `${c}cc`), // add alpha
              borderWidth: 1,
              borderColor: "#ffffff",
            },
          ],
        }}
      />
    </ChartContainer>
  );
}
