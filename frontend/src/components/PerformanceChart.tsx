import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAppContext } from '../context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                font: { family: "'DM Sans', sans-serif", size: 11 },
                usePointStyle: true,
                boxWidth: 8
            }
        },
        tooltip: {
            callbacks: {
                label: function(context: any) {
                    let val = context.raw;
                    if (val === null) return context.dataset.label + ': DNF';
                    if (val < 1000) return context.dataset.label + ': ' + val.toFixed(2) + 'ms';
                    return context.dataset.label + ': ' + (val / 1000).toFixed(2) + 's';
                }
            }
        }
    },
    scales: {
        y: {
            type: 'logarithmic' as const,
            title: {
                display: true,
                text: 'Time (ms)',
                font: { family: "'DM Sans', sans-serif", size: 11 }
            },
            ticks: {
                font: { family: "'DM Sans', sans-serif", size: 10 }
            },
            grid: {
                color: '#E8E8EC'
            }
        },
        x: {
            ticks: {
                font: { family: "'DM Sans', sans-serif", size: 11 }
            },
            grid: {
                display: false
            }
        }
    }
};

const DATASETS = [
    'Case 1 — Small Realistic',
    'Case 2 — Medium Synthetic',
    'Case 3 — Large Synthetic',
    'Case 4 — Huge Synthetic',
    'Case 5 — Extreme Synthetic'
];

const ALGORITHMS = [
    { name: 'Brute-Force Search', color: 'rgba(239, 68, 68, 0.8)' },
    { name: 'Standard Backtracking', color: 'rgba(245, 158, 11, 0.9)' },
    { name: 'Backtracking + Forward Checking', color: 'rgba(99, 102, 241, 1)' }
];

const PerformanceChart: React.FC = () => {
    const { runHistory } = useAppContext();

    const data = {
        labels: ['Small', 'Medium', 'Large', 'Huge', 'Extreme'],
        datasets: ALGORITHMS.map(algo => ({
            label: algo.name,
            backgroundColor: algo.color,
            borderRadius: 4,
            data: DATASETS.map(ds => {
                const entry = runHistory.find(h => h.dataset === ds && h.algorithm === algo.name);
                return entry ? entry.runtime_ms : null;
            })
        }))
    };

    return <Bar options={options} data={data} />;
};

export default PerformanceChart;
