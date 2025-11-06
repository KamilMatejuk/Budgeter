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
    startDate: Date;
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
            ticks: { stepSize: 1 },
        },
    },
}

function getStepSize(data: number[]) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const step = (max - min) / 5;
    if (step < 1) return 1;
    // round to nearest 10, 100, 1000, ...
    const lower = Math.pow(10, Math.floor(Math.log10(step)));
    const middle = lower * 5;
    const higher = lower * 10;
    if (step - lower < middle - step) return lower;
    if (step - middle > higher - step) return higher;
    return middle;
}

function getDateLabels(startDate: Date, length: number) {
    return Array.from({ length }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
    });
}

export default function LineChart({ data, startDate }: LineChartProps) {
    const labels = getDateLabels(startDate, data.length);
    options.scales!.y!.ticks.stepSize = getStepSize(data);
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
