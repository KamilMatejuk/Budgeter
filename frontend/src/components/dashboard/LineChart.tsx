'use client';

import { CategoryScale, Chart, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export interface LineChartProps {
  data: number[];
  labels: string[];
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 6,
      hitRadius: 10,
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "rgba(0,0,0,0)",
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      grid: { display: true },
    },
  },
};


export default function LineChart({ data, labels }: LineChartProps) {
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Line options={options} data={{
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
