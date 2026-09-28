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
                    if (val < 1000) return context.dataset.label + ': ' + val + 'ms';
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

const data = {
    labels: ['Small', 'Medium', 'Large', 'Huge', 'Extreme'],
    datasets: [
        {
            label: 'Brute Force',
            data: [450, 150000, null, null, null],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderRadius: 4
        },
        {
            label: 'Backtracking',
            data: [45, 12500, 480000, null, null],
            backgroundColor: 'rgba(245, 158, 11, 0.9)',
            borderRadius: 4
        },
        {
            label: 'BT + FC',
            data: [12, 145, 1250, 8400, 145000],
            backgroundColor: 'rgba(99, 102, 241, 1)',
            borderRadius: 4
        }
    ]
};

const PerformanceChart: React.FC = () => {
    return <Bar options={options} data={data} />;
};

export default PerformanceChart;
