'use client';

import { ArcElement, BarElement, CategoryScale, Chart, ChartOptions, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { PropsWithChildren } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";

Chart.register(
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  Title,
);

const Options = {
  responsive: true,
  animation: false,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
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
      <Line options={LineChartOptions as ChartOptions<"line">} data={{
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

// ************************** PREDICTION LINE CHART ***************************

export interface PredictionLineChartProps extends ChartContainerProps {
  top: number[];
  middle: number[];
  bottom: number[];
  labels: string[];
}

const PredictionLineChartOptions = {
  ...LineChartOptions,
  layout: {
    padding: { right: 30 },
  },
  plugins: {
    ...LineChartOptions.plugins,
    datalabels: {
      display: (ctx: any) => ctx.dataIndex % 12 === 11,
      formatter: (value: number) => value.toFixed(2),
      align: "center",
      anchor: "center",
      color: "#1eae53",
      font: { weight: "600", size: 12 },
    },
  },
};


export function PredictionLineChart({ top, middle, bottom, labels, ...props }: PredictionLineChartProps) {
  return (
    <ChartContainer {...props}>
      <Line options={PredictionLineChartOptions as ChartOptions<"line">} data={{
        labels,
        datasets: [
          {
            label: "Pessimistic",
            data: bottom,
            borderColor: "#22C55EAA",
            borderWidth: 2,
            tension: 0.3,
            fill: false,
          },
          {
            label: "Optimistic",
            data: top,
            borderColor: "#22C55EAA",
            borderWidth: 2,
            tension: 0.3,
            fill: { target: "-1" }, // fill to previous dataset (bottom)
            backgroundColor: "#22C55E33",
          },
          {
            label: "Realistic",
            data: middle,
            borderColor: "#22C55E",
            borderWidth: 2,
            tension: 0.3,
            fill: false,
          },
        ],
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
  plugins: {
    ...Options.plugins,
    datalabels: {
      display: (ctx: any) => {
        const i = ctx.dataIndex;
        const positive = ctx.chart.data.datasets[0].data[i] as number;
        const negative = Math.abs(ctx.chart.data.datasets[1].data[i] as number);
        if (positive > negative && ctx.datasetIndex === 0) return true;
        if (negative > positive && ctx.datasetIndex === 1) return true;
        return false;
      },
      formatter: (_value: number, ctx: any) => {
        const i = ctx.dataIndex;
        const positive = ctx.chart.data.datasets[0].data[i] as number;
        const negative = Math.abs(ctx.chart.data.datasets[1].data[i] as number);
        const diff = positive - negative;
        if (diff === 0) return "";
        return diff > 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
      },
      anchor: (ctx: any) => ctx.datasetIndex === 0 ? "end" : "start",
      align: (ctx: any) => ctx.datasetIndex === 0 ? "end" : "start",
      color: (ctx: any) => ctx.datasetIndex === 0 ? "#22C55E" : "#EF4444",
      font: { weight: "600", size: 14 },
    },
  },
};

export function DoubleBarChart({ dataPositive, dataNegative, labels, ...props }: DoubleBarChartProps) {
  return (
    <ChartContainer {...props}>
      <Bar
        options={DoubleBarChartOptions as ChartOptions<"bar">}
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
        options={PieChartOptions as ChartOptions<"pie">}
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
